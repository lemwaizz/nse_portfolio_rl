import numpy as np
import torch
from pathlib import Path
from stable_baselines3 import PPO, A2C
from environment.nse_costs import NSECostModel
from data.database import ALL_TICKERS, N_STOCKS
from app.schemas import (
    RecommendationRequest, RecommendationResponse,
    NSECostBreakdown, AlternativeAction,
)
import logging

logger = logging.getLogger("uvicorn")

PPO_MODEL_PATH  = Path("models/ppo_best_by_sharpe")
A2C_MODEL_PATH  = Path("models/a2c_best_by_sharpe")
REINFORCE_MODEL_PATH  = Path("models/reinforce_best_by_sharpe")
TRADE_FRAC  = 0.10
MAX_WEIGHT  = 0.50
OBS_DIM     = N_STOCKS * 8   # 536
N_ACTIONS   = N_STOCKS * 2 + 2  # 136
ACT_REBAL   = N_STOCKS * 2      # 134
ACT_HOLD    = N_STOCKS * 2 + 1  # 135

RISK_PROFILE_TO_MODEL = {
    "aggressive":   "reinforce",
    "conservative": "ppo",
    "moderate":     "a2c",
}

_models: dict[str, object] = {}

_model = None
_cost_model = NSECostModel()


# def load_model():
#     global _model
#     if _model is None:
#         _model = PPO.load(PPO_MODEL_PATH, device="cpu")
#     return _model
def load_model():
    """Load all three models at startup. Called once from lifespan."""
    global _models
    if not _models:
        logger.info("Loading PPO model...")
        _models["ppo"] = PPO.load(PPO_MODEL_PATH, device="cpu")

        logger.info("Loading A2C model...")
        _models["a2c"] = A2C.load(A2C_MODEL_PATH, device="cpu")

        logger.info("Loading REINFORCE model...") # Same with PPO
        _models["reinforce"] = PPO.load(REINFORCE_MODEL_PATH, device="cpu")

        logger.info(f"All models ready: {list(_models.keys())}")
    return _models

def get_model(risk_profile: str):
    model_key = RISK_PROFILE_TO_MODEL[risk_profile]
    model = _models.get(model_key)
    if model is None:
        raise RuntimeError(f"Model '{model_key}' for risk_profile '{risk_profile}' is not loaded")
    return model_key, model

# ── Observation assembly ───────────────────────────────────────────────────────

def build_observation(req: RecommendationRequest) -> np.ndarray:
    """
    Reconstruct the (536,) float32 observation from structured request data,
    matching the exact block layout in NSEPortfolioEnv._obs().

    Block order: r1, r5, r20, r60, v20, cs, amihud, weights
    Ticker order: ALL_TICKERS (alphabetically sorted, fixed contract)
    """
    r1  = np.zeros(N_STOCKS, dtype=np.float32)
    r5  = np.zeros(N_STOCKS, dtype=np.float32)
    r20 = np.zeros(N_STOCKS, dtype=np.float32)
    r60 = np.zeros(N_STOCKS, dtype=np.float32)
    v20 = np.zeros(N_STOCKS, dtype=np.float32)
    cs  = np.zeros(N_STOCKS, dtype=np.float32)
    am  = np.zeros(N_STOCKS, dtype=np.float32)
    wts = np.zeros(N_STOCKS, dtype=np.float32)

    for ticker, feats in req.stock_features.items():
        i = ALL_TICKERS.index(ticker)
        r1[i]  = feats.return_1d
        r5[i]  = feats.return_5d
        r20[i] = feats.return_20d
        r60[i] = feats.return_60d
        v20[i] = feats.vol_20d
        cs[i]  = feats.cs_spread
        am[i]  = feats.amihud

    for ticker, weight in req.portfolio_weights.items():
        i = ALL_TICKERS.index(ticker)
        wts[i] = weight

    obs = np.concatenate([r1, r5, r20, r60, v20, cs, am, wts])
    obs = np.nan_to_num(obs, nan=0.0, posinf=0.0, neginf=0.0)
    return np.clip(obs, -10.0, 10.0).astype(np.float32)


# ── Action decoding ────────────────────────────────────────────────────────────

def decode_action(action_idx: int) -> tuple[str, str | None]:
    """Returns (action_type, ticker_or_None)."""
    if action_idx < N_STOCKS:
        return "BUY", ALL_TICKERS[action_idx]
    elif action_idx < N_STOCKS * 2:
        return "SELL", ALL_TICKERS[action_idx - N_STOCKS]
    elif action_idx == ACT_REBAL:
        return "REBALANCE", None
    else:
        return "HOLD", None


# ── Portfolio projection ───────────────────────────────────────────────────────

def project_weights(
    action_type: str,
    ticker: str | None,
    current_weights: dict[str, float],
    availability: list[str],   # tickers currently available/listed
) -> dict[str, float]:
    """
    Simulate the weight change from the recommended action.
    Mirrors env.step() weight logic without price/cost effects.
    """
    w = {t: current_weights.get(t, 0.0) for t in ALL_TICKERS}

    if action_type == "BUY" and ticker:
        old = w[ticker]
        w[ticker] = min(MAX_WEIGHT, old + TRADE_FRAC)
        total = sum(w.values())
        if total > 1e-8:
            w = {t: v / total for t, v in w.items()}

    elif action_type == "SELL" and ticker:
        old = w[ticker]
        w[ticker] = max(0.0, old - TRADE_FRAC)
        total = sum(w.values())
        if total > 1e-8:
            w = {t: v / total for t, v in w.items()}

    elif action_type == "REBALANCE":
        n = len(availability)
        equal = 1.0 / n if n > 0 else 0.0
        w = {t: (equal if t in availability else 0.0) for t in ALL_TICKERS}

    # HOLD: no change

    # Drop zero-weight tickers from response for cleanliness
    return {t: round(v, 6) for t, v in w.items() if v > 1e-6}


# ── Cost estimation ────────────────────────────────────────────────────────────

def estimate_trade_value(
    action_type: str,
    ticker: str | None,
    current_weights: dict[str, float],
    portfolio_value_kes: float,
) -> float:
    if action_type == "BUY" and ticker:
        old_w = current_weights.get(ticker, 0.0)
        delta = min(MAX_WEIGHT, old_w + TRADE_FRAC) - old_w
        return portfolio_value_kes * delta

    elif action_type == "SELL" and ticker:
        old_w = current_weights.get(ticker, 0.0)
        delta = old_w - max(0.0, old_w - TRADE_FRAC)
        return portfolio_value_kes * delta

    elif action_type == "REBALANCE":
        # Estimate turnover as sum of absolute weight changes
        n = len([t for t in ALL_TICKERS if current_weights.get(t, 0) > 0])
        equal = 1.0 / n if n > 0 else 0.0
        turnover = sum(
            abs(equal - current_weights.get(t, 0.0))
            for t in ALL_TICKERS
        )
        return portfolio_value_kes * turnover / 2  # one-way turnover

    return 0.0  # HOLD


# ── Main prediction ────────────────────────────────────────────────────────────

def predict(req: RecommendationRequest) -> RecommendationResponse:
    model_key, model = get_model(req.risk_profile)
    logger.debug(f"Building observation for tickers: {list(req.stock_features.keys())}")

    obs = build_observation(req)
    logger.debug(f"Observation shape={obs.shape}, min={obs.min():.4f}, max={obs.max():.4f}, "
                 f"nonzero={np.count_nonzero(obs)}")

    obs_batch = obs.reshape(1, OBS_DIM)

    # Greedy best action
    action_arr, _ = model.predict(obs_batch, deterministic=True)
    action_idx = int(action_arr.item())
    logger.debug(f"Raw action_idx={action_idx}")

    # Full softmax distribution
    with torch.no_grad():
        obs_tensor = model.policy.obs_to_tensor(obs_batch)[0]
        dist = model.policy.get_distribution(obs_tensor)
        probs: list[float] = dist.distribution.probs.squeeze().cpu().numpy().tolist()

    action_type, ticker = decode_action(action_idx)
    confidence = probs[action_idx]

    # Trade value + costs
    trade_value = estimate_trade_value(
        action_type, ticker, req.portfolio_weights, req.portfolio_value_kes
    )
    costs = None
    if action_type != "HOLD" and trade_value > 0:
        breakdown = _cost_model.breakdown(trade_value)
        costs = NSECostBreakdown(trade_value_kes=round(trade_value, 2), **breakdown)

    # Projected weights
    available_tickers = [
        t for t in ALL_TICKERS
        if req.stock_features.get(t) is not None  # proxy for availability
    ]
    projected = project_weights(action_type, ticker, req.portfolio_weights, available_tickers)

    # Top-5 alternatives (excluding the primary action)
    indexed = sorted(enumerate(probs), key=lambda x: x[1], reverse=True)
    alternatives = []
    for alt_idx, alt_prob in indexed:
        if alt_idx == action_idx:
            continue
        alt_type, alt_ticker = decode_action(alt_idx)
        alternatives.append(AlternativeAction(
            action_type=alt_type,
            ticker=alt_ticker,
            probability=round(alt_prob, 6),
            action_index=alt_idx,
        ))
        if len(alternatives) == 5:
            break

    return RecommendationResponse(
        action_type=action_type,
        ticker=ticker,
        action_index=action_idx,
        action_confidence=round(confidence, 6),
        estimated_trade_value_kes=round(trade_value, 2),
        transaction_costs=costs,
        current_weights={t: round(v, 6) for t, v in req.portfolio_weights.items()},
        projected_weights=projected,
        top_alternatives=alternatives,
        model_used=model_key,
        risk_profile=req.risk_profile,
    )