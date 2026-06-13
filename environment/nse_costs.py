"""
environment/nse_costs.py
NSE transaction cost model — CMA Kenya regulated rates (2024).

The central methodological contribution of this project:
  Published DRL papers assume 0.1% transaction cost (NASDAQ-calibrated).
  NSE retail round-trip = 4.16% — a 41.6x difference.

SHARPE RATIO CONNECTION:
  Costs affect Sharpe through two channels:
  1. Numerator: each trade reduces return by 2.08% one-way.
     More trades = lower mean return = lower Sharpe numerator.
  2. Denominator: execution uncertainty adds return noise.
     More noise = higher std(returns) = lower Sharpe denominator.
  The agent maximises Sharpe by learning to trade infrequently —
  but only if the reward function uses the CORRECT 4.16% cost.
"""


class NSECostModel:

    BROKERAGE_RATE = 0.0178   # 1.78%
    CMA_LEVY       = 0.0014   # 0.14%
    NSE_LEVY       = 0.0012   # 0.12%
    CDSC_LEVY      = 0.0004   # 0.04%
    MIN_KES        = 25.0     # minimum KES 25 per trade

    ONE_WAY    = BROKERAGE_RATE + CMA_LEVY + NSE_LEVY + CDSC_LEVY  # 2.08%
    ROUND_TRIP = ONE_WAY * 2                                         # 4.16%

    def compute_cost(self, trade_value_kes: float) -> float:
        """Total cost in KES for one trade (buy or sell)."""
        brokerage = max(self.MIN_KES, trade_value_kes * self.BROKERAGE_RATE)
        levies    = trade_value_kes * (self.CMA_LEVY + self.NSE_LEVY + self.CDSC_LEVY)
        return float(brokerage + levies)

    def breakeven_holding_days(self, gross_daily_return: float) -> float:
        """
        Days a position must be held to recover round-trip costs.
        e.g. at 0.05%/day: 0.0416 / 0.0005 = 83 days.
        Used in the backtest notebook to contextualise Sharpe results.
        """
        return self.ROUND_TRIP / gross_daily_return if gross_daily_return > 0 else float("inf")

    def breakdown(self, trade_value_kes: float) -> dict:
        """Itemised cost breakdown for the web application (Phase 2)."""
        return {
            "brokerage_kes":  round(max(self.MIN_KES, trade_value_kes * self.BROKERAGE_RATE), 2),
            "cma_levy_kes":   round(trade_value_kes * self.CMA_LEVY,  2),
            "nse_levy_kes":   round(trade_value_kes * self.NSE_LEVY,  2),
            "cdsc_levy_kes":  round(trade_value_kes * self.CDSC_LEVY, 2),
            "total_kes":      round(self.compute_cost(trade_value_kes), 2),
            "one_way_pct":    round(self.ONE_WAY * 100, 4),
            "round_trip_pct": round(self.ROUND_TRIP * 100, 4),
        }