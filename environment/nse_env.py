"""
environment/nse_env.py
NSE Portfolio Management Gymnasium Environment.

OBSERVATION SPACE: 8 features x 67 stocks = 536 dimensions
  Block 0  [0:67]    return_1d    1-day log return
  Block 1  [67:134]  return_5d    5-day log return
  Block 2  [134:201] return_20d   20-day log return
  Block 3  [201:268] return_60d   60-day log return (quarter trend)
  Block 4  [268:335] vol_20d      20-day rolling volatility
  Block 5  [335:402] cs_spread    Corwin-Schultz spread
  Block 6  [402:469] amihud       Amihud illiquidity
  Block 7  [469:536] weight       current portfolio weight

  Unlisted stocks: all 8 features = 0.0

ACTION SPACE: 136 discrete actions
  0..66    BUY  stock i  (add 10% weight)
  67..133  SELL stock i  (remove 10% weight)
  134      REBALANCE     (equal weight across available stocks)
  135      HOLD          (no change, no cost)

REWARD:
  portfolio_return - cost_fraction - vol_penalty * rolling_std

WHY NOT SHARPE AS REWARD?
  Sharpe = mean(returns) / std(returns) requires a full return series.
  It cannot be computed at a single time step.
  The vol_penalty is the step-level Sharpe proxy:
    penalising rolling std -> agent prefers lower return variance
    lower variance -> higher Sharpe at episode level
  Sharpe is used correctly at EVALUATION time in callbacks.py and
  03_backtest.ipynb, not at step time.
"""
import gymnasium as gym
import numpy as np
from gymnasium import spaces
from environment.nse_costs  import NSECostModel
from environment.liquidity  import NSELiquidityEstimator
from environment.slippage   import NSESlippageSimulator
from data.database          import get_db, N_STOCKS, ALL_TICKERS

N         = N_STOCKS       # 67
OBS_DIM   = N * 8          # 536
N_ACTIONS = N * 2 + 2      # 136
ACT_REBAL = N * 2          # 134
ACT_HOLD  = N * 2 + 1      # 135
RF_DAILY  = 0.000487       # CBK 91-day T-bill daily


class NSEPortfolioEnv(gym.Env):
    metadata = {"render_modes": ["human"]}

    INITIAL_CAPITAL  = 100_000.0
    TRADE_FRAC       = 0.10
    MAX_SINGLE_STOCK = 0.50
    MAX_DRAWDOWN     = 0.50
    VOL_PENALTY_BASE = 0.04
    EPISODE_LEN      = 252

    def __init__(self, period="train", render_mode=None, domain_randomise=True):
        super().__init__()
        self.period           = period
        self.render_mode      = render_mode
        self.domain_randomise = domain_randomise
        self._vol_penalty     = self.VOL_PENALTY_BASE

        db   = get_db()
        data = db.get_period(period)

        self.prices  = data["prices"]
        self.highs   = data["highs"]
        self.lows    = data["lows"]
        self.volumes = data["volumes"]
        self.avail   = data["availability"]
        self.dates   = data["dates"]
        self.T       = data["T"]
        self._r1     = data["return_1d"]
        self._r5     = data["return_5d"]
        self._r20    = data["return_20d"]
        self._r60    = data["return_60d"]
        self._v20    = data["vol_20d"]
        self._cs     = data["cs_spread"]
        self._am     = data["amihud"]

        # Normalise Amihud by 95th percentile: raw values span ~8 orders of magnitude.
        # Without normalisation the amihud block would dominate the observation.
        valid       = self._am[self._am > 0]
        self._am95  = float(np.percentile(valid, 95)) if len(valid) > 0 else 1.0

        self.cost_model = NSECostModel()
        self.liquidity  = NSELiquidityEstimator(
            self.highs, self.lows, self.prices, self.volumes
        )
        self.slippage   = NSESlippageSimulator(self.liquidity)

        self.observation_space = spaces.Box(-10.0, 10.0, shape=(OBS_DIM,), dtype=np.float32)
        self.action_space      = spaces.Discrete(N_ACTIONS)

        self.t             = 0
        self.weights       = np.zeros(N, dtype=np.float32)
        self.portfolio_val = self.INITIAL_CAPITAL
        self.peak_val      = self.INITIAL_CAPITAL
        self.prev_val      = self.INITIAL_CAPITAL
        self.value_hist    = []
        self.reward_hist   = []

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        if self.domain_randomise:
            self.cost_model.BROKERAGE_RATE = float(self.np_random.uniform(0.015, 0.022))
            self.slippage.domain_randomise()
            self._vol_penalty = float(self.np_random.uniform(0.02, 0.06))

        # Start at least 65 steps in so return_60d is populated
        self.t = int(self.np_random.integers(65, max(66, self.T - self.EPISODE_LEN - 5)))

        av = self.avail[self.t]
        na = int(av.sum())
        self.weights = (av / na).astype(np.float32) if na > 0 else np.ones(N, dtype=np.float32) / N

        self.portfolio_val = self.INITIAL_CAPITAL
        self.peak_val      = self.INITIAL_CAPITAL
        self.prev_val      = self.INITIAL_CAPITAL
        self.value_hist    = [self.INITIAL_CAPITAL]
        self.reward_hist   = []
        return self._obs(), self._info()

    def step(self, action: int):
        assert self.action_space.contains(action)
        self.prev_val = self.portfolio_val
        cf            = 0.0
        av            = self.avail[self.t]

        if action < N:
            i = action
            if av[i] > 0:
                ow = float(self.weights[i])
                nw = min(self.MAX_SINGLE_STOCK, ow + self.TRADE_FRAC)
                tv = self.portfolio_val * (nw - ow)
                _, slip = self.slippage.simulate_fill(
                    float(self.prices[self.t, i]), tv, i, self.t, True
                )
                cf = (self.cost_model.compute_cost(tv) + slip) / (self.portfolio_val + 1e-8)
                self.weights[i] = nw
                self._norm()

        elif action < N * 2:
            i = action - N
            if self.weights[i] > 1e-4:
                ow = float(self.weights[i])
                nw = max(0.0, ow - self.TRADE_FRAC)
                tv = self.portfolio_val * (ow - nw)
                _, slip = self.slippage.simulate_fill(
                    float(self.prices[self.t, i]), tv, i, self.t, False
                )
                cf = (self.cost_model.compute_cost(tv) + slip) / (self.portfolio_val + 1e-8)
                self.weights[i] = nw
                self._norm()

        elif action == ACT_REBAL:
            na = int(av.sum())
            nw = (av / na).astype(np.float32) if na > 0 else self.weights
            tv = self.portfolio_val * np.abs(nw - self.weights).sum()
            cf = self.cost_model.compute_cost(tv) / (self.portfolio_val + 1e-8)
            self.weights = nw
        # ACT_HOLD: free

        self.t += 1
        tc  = min(self.t, self.T - 1)
        ret = ((self.prices[tc] - self.prices[self.t - 1]) /
               (self.prices[self.t - 1] + 1e-8)) * self.avail[tc]
        pr  = float(np.dot(self.weights, ret))

        self.portfolio_val = max(self.portfolio_val * (1 + pr) - self.portfolio_val * cf, 0.01)
        self.peak_val      = max(self.peak_val, self.portfolio_val)

        rew   = self._reward(pr, cf)
        dd    = (self.peak_val - self.portfolio_val) / (self.peak_val + 1e-8)
        term  = bool(dd >= self.MAX_DRAWDOWN)
        trunc = (len(self.value_hist) >= self.EPISODE_LEN or self.t >= self.T - 1)
        if term:
            rew -= 50.0

        self.value_hist.append(round(self.portfolio_val, 2))
        self.reward_hist.append(round(rew, 6))
        if self.render_mode == "human":
            self.render()
        return self._obs(), rew, term, trunc, self._info()

    def _obs(self) -> np.ndarray:
        t  = min(self.t, self.T - 1)
        av = self.avail[t]
        r1  = self._r1[t]  * av
        r5  = self._r5[t]  * av
        r20 = self._r20[t] * av
        r60 = self._r60[t] * av
        v20 = self._v20[t] * av
        cs  = self._cs[t]  * av
        am  = np.clip(self._am[t] / (self._am95 + 1e-12), 0, 5) * av
        obs = np.concatenate([r1, r5, r20, r60, v20, cs, am, self.weights]).astype(np.float32)
        return np.clip(obs, -10.0, 10.0)

    def _reward(self, pr: float, cf: float) -> float:
        vol = float(np.std(self.reward_hist[-20:])) if len(self.reward_hist) >= 20 else 0.0
        return float(pr - cf - self._vol_penalty * vol)

    def _norm(self):
        self.weights = np.clip(self.weights, 0, self.MAX_SINGLE_STOCK)
        s = self.weights.sum()
        if s > 1e-8:
            self.weights = (self.weights / s).astype(np.float32)
        else:
            av = self.avail[self.t]
            na = int(av.sum())
            self.weights = (av / na).astype(np.float32) if na > 0 else np.ones(N, dtype=np.float32) / N

    def _info(self) -> dict:
        dd = (self.peak_val - self.portfolio_val) / (self.peak_val + 1e-8)
        return {
            "portfolio_value":  round(self.portfolio_val, 2),
            "total_return_pct": round((self.portfolio_val / self.INITIAL_CAPITAL - 1) * 100, 3),
            "max_drawdown_pct": round(dd * 100, 3),
            "step":             self.t,
            "date":             self.dates[min(self.t, self.T - 1)],
            "weights":          self.weights.tolist(),
            "tickers":          ALL_TICKERS,
        }

    def render(self):
        i  = self._info()
        na = int((self.weights > 0.01).sum())
        print(f"[{i['date']}]  KES {i['portfolio_value']:>10,.0f}  "
              f"Ret {i['total_return_pct']:>+7.2f}%  "
              f"DD {i['max_drawdown_pct']:>5.2f}%  Pos {na}")

    def close(self):
        pass