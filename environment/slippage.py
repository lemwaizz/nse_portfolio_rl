"""
environment/slippage.py
Realistic execution simulation: bid-ask spread + market impact + overnight drift.
Domain randomisation varies parameters each episode (Tobin et al., 2017).
"""
import numpy as np
from environment.liquidity import NSELiquidityEstimator


class NSESlippageSimulator:

    ETA_MIN = 0.25   # impact coefficient for liquid stocks (SCOM, EQTY)
    ETA_MAX = 0.45   # impact coefficient for illiquid stocks (KUKZ, LIMT)
    OV_BASE = 0.008  # baseline overnight close-to-open gap volatility

    def __init__(self, liq: NSELiquidityEstimator, rng=None):
        self.liq  = liq
        self.rng  = rng or np.random.default_rng(42)
        self._eta = (self.ETA_MIN + self.ETA_MAX) / 2
        self._ov  = self.OV_BASE

    def domain_randomise(self) -> None:
        """
        Randomise execution parameters at episode start.
        Forces the agent to learn strategies robust to cost uncertainty
        rather than overfitting to one assumed cost level.
        Called by the environment's reset() when domain_randomise=True.
        """
        self._eta = float(self.rng.uniform(self.ETA_MIN, self.ETA_MAX))
        self._ov  = float(self.rng.uniform(0.003, 0.015))

    def simulate_fill(
        self,
        signal_price: float,
        trade_value:  float,
        stock_idx:    int,
        t:            int,
        is_buy:       bool,
    ) -> tuple:
        """
        Returns (fill_price, slippage_cost_kes).

        Three components:
        1. Bid-ask spread: we pay ask on buys, receive bid on sells.
        2. Square-root market impact (Almgren & Chriss, 2000):
           impact = eta * sigma * sqrt(participation_rate)
           Sub-linear scaling reflects that doubling trade size
           does not double price impact in practice.
        3. Overnight drift: agent decides at close, executes at next open.
        """
        if trade_value <= 0:
            return signal_price, 0.0

        cs   = float(self.liq.get_spread(t)[stock_idx])
        fill = (signal_price + signal_price * cs / 2 if is_buy
                else signal_price - signal_price * cs / 2)

        part = float(np.clip(
            self.liq.get_participation(t, np.array([trade_value]))[stock_idx],
            0, 0.20
        ))
        amih = float(self.liq.get_amihud(t)[stock_idx])
        eta  = min(self._eta * (1 + amih * 1e6), self.ETA_MAX)
        imp  = eta * max(cs * 2, 0.005) * np.sqrt(part)
        fill = fill + signal_price * imp if is_buy else fill - signal_price * imp

        drift = float(self.rng.normal(0, self._ov))
        fill  = float(np.clip(
            fill + signal_price * drift,
            signal_price * 0.90,
            signal_price * 1.10
        ))
        return fill, abs(fill - signal_price) * (trade_value / max(signal_price, 1e-8))