"""
environment/liquidity.py
Liquidity estimation from daily OHLCV data — no order book required.

Corwin-Schultz (2012): estimates bid-ask spread from daily High/Low.
Amihud (2002): measures price impact per KES of volume traded.

Both estimators affect Sharpe:
  cs_spread  reduces portfolio return (direct trading cost)
  amihud     adds noise to returns via unpredictable market impact

All arrays are pre-computed at __init__ time so environment step() is O(1).
"""
import numpy as np


class NSELiquidityEstimator:

    def __init__(self, highs, lows, closes, volumes):
        self.H = np.asarray(highs,   dtype=np.float64)
        self.L = np.asarray(lows,    dtype=np.float64)
        self.C = np.asarray(closes,  dtype=np.float64)
        self.V = np.asarray(volumes, dtype=np.float64)
        self.T, self.N = self.C.shape

        self.cs  = self._compute_cs_spread()
        self.am  = self._compute_amihud()
        self.adv = self._compute_adv()

    def _compute_cs_spread(self) -> np.ndarray:
        """
        Corwin & Schultz (2012) Journal of Finance 67(2):719-760.

        Key insight:
          Daily High ~ buy-initiated trades (at the ask price)
          Daily Low  ~ sell-initiated trades (at the bid price)
          1-day H/L ratio encodes: variance + spread
          2-day H/L ratio encodes: 2*variance + spread
          Subtracting isolates the spread component.

        Negative values -> 0 (noise on illiquid days, not real negative spreads).
        Capped at 0.30 (no NSE equity has a wider spread than 30%).
        """
        H  = np.where(self.H > 0, self.H, np.nan)
        L  = np.where(self.L > 0, self.L, np.nan)
        bt = np.log(H / L) ** 2
        bt1 = np.roll(bt, -1, axis=0)
        bt1[-1] = bt[-1]
        H2 = np.maximum(H, np.roll(H, -1, axis=0))
        L2 = np.minimum(L, np.roll(L, -1, axis=0))
        gm = np.log(H2 / np.where(L2 > 0, L2, np.nan)) ** 2
        k  = 3.0 - 2.0 * np.sqrt(2.0)
        ba = (bt + bt1) / 2.0
        with np.errstate(invalid="ignore", divide="ignore"):
            al = (np.sqrt(2 * ba) - np.sqrt(ba)) / k - np.sqrt(gm / k)
            sp = 2 * (np.exp(al) - 1) / (1 + np.exp(al))
        return np.clip(np.nan_to_num(sp, nan=0.0), 0.0, 0.30).astype(np.float32)

    def _compute_amihud(self, window=20) -> np.ndarray:
        """
        Amihud (2002) Journal of Financial Markets 5(1):31-56.
        |return| / (volume * price) — price movement per KES traded.
        High value = illiquid = more impact per KES = more costly to trade.
        Rolling 20-day mean smooths the noisy daily signal.
        """
        ret  = np.abs(np.diff(np.log(np.where(self.C > 0, self.C, np.nan)), axis=0))
        ret  = np.vstack([ret[:1], ret])
        tv   = self.V * self.C
        d    = ret / np.where(tv > 0, tv, np.nan)
        r    = np.zeros_like(d)
        for t in range(self.T):
            with np.errstate(invalid="ignore"):
                r[t] = np.nanmean(d[max(0, t - window):t + 1], axis=0)
        return np.nan_to_num(r, nan=0.0).astype(np.float32)

    def _compute_adv(self, window=20) -> np.ndarray:
        """Rolling 20-day average daily KES value traded. Used by slippage model."""
        dv = self.V * self.C
        r  = np.zeros_like(dv)
        for t in range(self.T):
            r[t] = dv[max(0, t - window):t + 1].mean(axis=0)
        return r.astype(np.float32)

    def get_spread(self, t: int) -> np.ndarray:
        return self.cs[min(t, self.T - 1)]

    def get_amihud(self, t: int) -> np.ndarray:
        return self.am[min(t, self.T - 1)]

    def get_participation(self, t: int, vals: np.ndarray) -> np.ndarray:
        adv = self.adv[min(t, self.T - 1)]
        return vals / np.where(adv > 0, adv, 1e-8)