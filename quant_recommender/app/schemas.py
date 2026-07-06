from __future__ import annotations
from pydantic import BaseModel, field_validator, model_validator
from typing import Literal
from data.database import ALL_TICKERS  # your sorted list of 67 tickers

TICKER_SET = set(ALL_TICKERS)

RiskProfile = Literal["aggressive", "conservative", "moderate"]

# ── Input ─────────────────────────────────────────────────────────────────────

class StockFeatures(BaseModel):
    """
    Raw features for one stock, exactly as the env constructs them.
    All values should already be normalised (clipped to [-10, 10]).
    Unlisted/unavailable stocks can be omitted — they default to 0.0.
    """
    return_1d:  float = 0.0   # Block 0
    return_5d:  float = 0.0   # Block 1
    return_20d: float = 0.0   # Block 2
    return_60d: float = 0.0   # Block 3
    vol_20d:    float = 0.0   # Block 4
    cs_spread:  float = 0.0   # Block 5
    amihud:     float = 0.0   # Block 6
    # weight is supplied separately in portfolio_weights

    @field_validator(
        "return_1d", "return_5d", "return_20d", "return_60d",
        "vol_20d", "cs_spread", "amihud",
        mode="before",
    )
    @classmethod
    def none_to_zero(cls, v):
        return 0.0 if v is None else v


class RecommendationRequest(BaseModel):
    """
    Structured alternative to passing a raw 536-float vector.
    The API assembles the observation internally in ticker-sorted order.
    """
    risk_profile: RiskProfile  
    portfolio_value_kes: float                     # current KES value, used for cost calc
    stock_features: dict[str, StockFeatures]       # keyed by ticker, e.g. {"SCOM": {...}}
    portfolio_weights: dict[str, float]            # current weights, e.g. {"SCOM": 0.15}

    @field_validator("stock_features")
    @classmethod
    def validate_tickers(cls, v: dict) -> dict:
        bad = set(v) - TICKER_SET
        if bad:
            raise ValueError(f"Unknown tickers: {bad}. Must be from ALL_TICKERS.")
        return v

    @field_validator("portfolio_weights")
    @classmethod
    def validate_weights(cls, v: dict) -> dict:
        bad = set(v) - TICKER_SET
        if bad:
            raise ValueError(f"Unknown tickers in weights: {bad}.")
        total = sum(v.values())
        if not (0.99 <= total <= 1.01):
            raise ValueError(f"Weights must sum to ~1.0, got {total:.4f}")
        return v

    @field_validator("portfolio_value_kes")
    @classmethod
    def positive_value(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("portfolio_value_kes must be positive")
        return v

    @field_validator("risk_profile")
    @classmethod
    def validate_risk_profile(cls, v: str) -> str:
        allowed = {"aggressive", "conservative", "moderate"}
        if v not in allowed:
            raise ValueError(f"risk_profile must be one of {sorted(allowed)}, got '{v}'")
        return v



# ── Output ────────────────────────────────────────────────────────────────────

ActionType = Literal["BUY", "SELL", "REBALANCE", "HOLD"]


class NSECostBreakdown(BaseModel):
    """Itemised transaction costs — mirrors NSECostModel.breakdown()."""
    brokerage_kes:   float
    cma_levy_kes:    float
    nse_levy_kes:    float
    cdsc_levy_kes:   float
    total_kes:       float
    one_way_pct:     float   # 2.08%
    round_trip_pct:  float   # 4.16%
    trade_value_kes: float   # the notional being traded


class AlternativeAction(BaseModel):
    """One of the top-N runner-up actions from the policy distribution."""
    action_type:  ActionType
    ticker:       str | None     # None for REBALANCE / HOLD
    probability:  float
    action_index: int


class RecommendationResponse(BaseModel):
    # ── Primary recommendation ──
    action_type:        ActionType
    ticker:             str | None      # None for REBALANCE / HOLD
    action_index:       int             # raw 0–135
    action_confidence:  float           # softmax prob of chosen action

    # ── Cost impact ──
    estimated_trade_value_kes: float    # portfolio_value * TRADE_FRAC (or full rebal turnover)
    transaction_costs:         NSECostBreakdown | None  # None for HOLD

    # ── Portfolio impact ──
    current_weights:  dict[str, float]  # weights you sent in
    projected_weights: dict[str, float] # estimated weights after executing action

    # ── Alternatives ──
    top_alternatives: list[AlternativeAction]  # top 5 excluding primary

    # ── Meta ──
    model_version: str = "ppo-nse-v1"
    risk_profile: RiskProfile
    model_used: str