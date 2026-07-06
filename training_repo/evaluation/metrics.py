"""
evaluation/metrics.py
Portfolio performance metrics with correct per-episode Sharpe implementation.

SHARPE RATIO — THE CORRECT IMPLEMENTATION:

  Wrong (common in DRL portfolio papers):
    avg_values = mean([ep1_vals, ep2_vals, ...])   <- variance is averaged out
    sharpe = compute_sharpe(avg_values)             <- denominator too small -> inflated

  Correct (this file):
    sharpes = [episode_sharpe(ep_vals) for ep_vals in episodes]
    mean_sharpe = mean(sharpes)                     <- true expected Sharpe

  Why the wrong version is wrong:
    Each episode starts at a different random date within the period.
    Averaging their value trajectories produces a synthetic series that
    no real investor ever experienced. The resulting std(returns) is
    smaller than any individual episode's std(returns), because the
    averaging smooths out episode-to-episode variation.
    The Sharpe denominator is thus understated and Sharpe is inflated.

RISK-FREE RATE:
  CBK 91-day T-bill ~13% p.a. (2024 Kenya average)
  Daily: (1 + 0.13)^(1/252) - 1 = 0.000487

  Breakeven gross annual return = 13% (T-bill) + 4.16% (NSE costs) = 17.2%
  The NSE 20 Index averages 5-8% per year.
  Most RL agents will show NEGATIVE Sharpe — this is the central finding.

GENERALISATION GAP:
  gap = |train_sharpe - test1_sharpe| / |train_sharpe|
  Proposal target: gap < 0.10
  Measures whether the agent learned a robust strategy (low gap)
  or memorised the training period (high gap).
"""
import numpy as np
from typing import List

RF_DAILY             = 0.000487
TRADING_DAYS_PER_YEAR = 252


def episode_sharpe(value_history: List[float], rf: float = RF_DAILY) -> float:
    """
    Compute annualised Sharpe ratio for a single episode.

    This is the atomic function. All other Sharpe functions call this one.

    Args:
        value_history: [initial_capital, val_step1, val_step2, ...]
        rf:            daily risk-free rate

    Returns:
        Annualised Sharpe. Negative if returns < risk-free rate.
    """
    vals = np.array(value_history, dtype=np.float64)
    if len(vals) < 10:
        return 0.0

    daily_returns = np.diff(vals) / (vals[:-1] + 1e-8)
    excess        = daily_returns - rf
    std           = np.std(excess)

    if std < 1e-8:
        return 0.0

    return float(np.mean(excess) / std * np.sqrt(TRADING_DAYS_PER_YEAR))


def mean_episode_sharpe(
    value_histories: List[List[float]],
    rf: float = RF_DAILY,
) -> dict:
    """
    Compute mean +/- std of Sharpe across multiple episodes.

    Returns:
        mean, std, min, max, pct_positive (% episodes with Sharpe > 0), n
    """
    sharpes = [
        episode_sharpe(v, rf)
        for v in value_histories
        if len(v) >= 10
    ]
    if not sharpes:
        return {"mean": 0.0, "std": 0.0, "min": 0.0, "max": 0.0,
                "pct_positive": 0.0, "n": 0}
    return {
        "mean":         round(float(np.mean(sharpes)),              4),
        "std":          round(float(np.std(sharpes)),               4),
        "min":          round(float(np.min(sharpes)),               4),
        "max":          round(float(np.max(sharpes)),               4),
        "pct_positive": round(float(np.mean([s > 0 for s in sharpes]) * 100), 1),
        "n":            len(sharpes),
    }


def sharpe_generalisation_gap(train_sharpe: float, test_sharpe: float) -> dict:
    """
    Sharpe-based generalisation gap.

    gap = |train_sharpe - test_sharpe| / (|train_sharpe| + epsilon)

    Proposal target: gap < 0.10
    A gap of 0.08 means test Sharpe is within 8% of training Sharpe.
    This holds even when both Sharpes are negative: it still measures
    whether the agent performs consistently across train and test.
    """
    raw_diff   = abs(train_sharpe - test_sharpe)
    normalised = raw_diff / (abs(train_sharpe) + 1e-6)
    return {
        "train_sharpe":   round(train_sharpe,  4),
        "test1_sharpe":   round(test_sharpe,   4),
        "raw_difference": round(raw_diff,       4),
        "normalised_gap": round(normalised,     4),
        "target_met":     bool(normalised < 0.10),
        "interpretation": (
            "PASS: strategy generalises within 10% Sharpe on unseen data"
            if normalised < 0.10
            else f"FAIL: gap {normalised:.3f} exceeds 0.10 target"
        ),
    }


def max_drawdown(values) -> float:
    v  = np.array(values, dtype=np.float64)
    pk = np.maximum.accumulate(v)
    return float(((pk - v) / (pk + 1e-8)).max())


def sortino_ratio(value_history, rf: float = RF_DAILY) -> float:
    """Sharpe but penalises only downside volatility."""
    vals = np.array(value_history, dtype=np.float64)
    r    = np.diff(vals) / (vals[:-1] + 1e-8)
    e    = r - rf
    d    = e[e < 0]
    ds   = float(np.std(d)) if len(d) > 1 else 1e-8
    return float(np.mean(e) / ds * np.sqrt(TRADING_DAYS_PER_YEAR))


def calmar_ratio(value_history) -> float:
    """Annualised return divided by maximum drawdown."""
    v   = np.array(value_history, dtype=np.float64)
    r   = np.diff(v) / (v[:-1] + 1e-8)
    ann = float(np.mean(r) * TRADING_DAYS_PER_YEAR)
    mdd = max_drawdown(v)
    return ann / (mdd + 1e-8)


def all_metrics(value_history, rf: float = RF_DAILY) -> dict:
    """Full metric suite for a single episode value history."""
    v = np.array(value_history, dtype=np.float64)
    r = np.diff(v) / (v[:-1] + 1e-8)
    return {
        "total_return_pct":  round((v[-1] / v[0] - 1) * 100, 4),
        "ann_return_pct":    round(float(np.mean(r) * TRADING_DAYS_PER_YEAR * 100), 4),
        "sharpe_ratio":      round(episode_sharpe(value_history, rf), 4),
        "sortino_ratio":     round(sortino_ratio(value_history, rf),  4),
        "calmar_ratio":      round(calmar_ratio(value_history),        4),
        "max_drawdown_pct":  round(max_drawdown(v) * 100, 4),
        "daily_vol_pct":     round(float(np.std(r)) * 100, 4),
        "win_rate_pct":      round(float(np.mean(r > 0)) * 100, 2),
        "n_days":            len(r),
    }


def sharpe_context_nse() -> dict:
    """NSE-specific context values for interpreting Sharpe results."""
    rf_annual      = RF_DAILY * TRADING_DAYS_PER_YEAR * 100
    nse_costs_rt   = 4.16
    breakeven      = rf_annual + nse_costs_rt
    return {
        "rf_annual_pct":        round(rf_annual, 2),
        "rf_daily":             RF_DAILY,
        "nse_round_trip_pct":   nse_costs_rt,
        "breakeven_gross_pct":  round(breakeven, 2),
        "nse20_avg_return_pct": "5-8",
        "expected_sharpe":      "negative for most strategies",
        "note": (
            "Positive Sharpe on NSE is a genuine finding. "
            "The meaningful comparison is agent Sharpe vs equal-weight baseline Sharpe, "
            "not agent Sharpe vs zero."
        ),
    }