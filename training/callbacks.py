"""
training/callbacks.py
Custom callbacks for stable-baselines3 training.

SharpeEvalCallback is the core Sharpe integration in the training loop.
It replaces the default EvalCallback, which saves by mean episode reward.

WHY SHARPE INSTEAD OF MEAN REWARD?
  Mean reward averages the step-level reward signal the RL algorithm
  optimised. It measures how well the agent maximised its own reward
  function, not how well it performed as a portfolio manager.

  Sharpe ratio is what we actually care about:
  - Did the agent produce returns above the 13% Kenya T-bill?
  - Did it achieve those returns with low volatility?
  - Is the performance consistent across episodes?

  Mean reward can be gamed by strategies that occasionally make large
  returns at the expense of frequent losses. Sharpe cannot be gamed
  in this way because large gains do not compensate for high variance.

CORRECT SHARPE COMPUTATION:
  Wrong (common mistake):
    avg = mean([ep1_values, ep2_values, ...])  <- averages out variance
    sharpe = compute_sharpe(avg)               <- std too small, Sharpe inflated

  Correct (what this file does):
    sharpes = [episode_sharpe(ep) for ep in episodes]
    mean_sharpe = mean(sharpes)               <- true expected Sharpe

PROPOSAL ALIGNMENT:
  FR7: "saves the best checkpoint per algorithm by validation Sharpe ratio"
  This file implements that requirement exactly.
"""
import numpy as np
from stable_baselines3.common.callbacks import BaseCallback
from evaluation.metrics import episode_sharpe, RF_DAILY


class RewardLogger(BaseCallback):
    """Records episode rewards during training for learning curve plots."""

    def __init__(self, verbose=0):
        super().__init__(verbose)
        self.episode_rewards = []
        self.episode_lengths = []
        self._ep_reward      = 0.0
        self._ep_steps       = 0

    def _on_step(self) -> bool:
        self._ep_reward += float(self.locals.get("rewards", [0.0])[0])
        self._ep_steps  += 1
        if self.locals.get("dones", [False])[0]:
            self.episode_rewards.append(self._ep_reward)
            self.episode_lengths.append(self._ep_steps)
            self._ep_reward = 0.0
            self._ep_steps  = 0
        return True


class SharpeEvalCallback(BaseCallback):
    """
    Evaluates on the validation set using per-episode Sharpe ratio.
    Saves a checkpoint whenever validation Sharpe improves.

    Args:
        val_env_fn:      callable returning a fresh validation environment
        eval_freq:       evaluate every N training steps
        save_path:       path to save the best model (without .zip)
        n_eval_episodes: number of validation episodes per evaluation
        verbose:         1 to print progress, 0 to suppress
    """

    def __init__(
        self,
        val_env_fn,
        eval_freq:       int = 10_000,
        save_path:       str = "models/ppo/best",
        n_eval_episodes: int = 10,
        verbose:         int = 1,
    ):
        super().__init__(verbose)
        self.val_env_fn       = val_env_fn
        self.eval_freq        = eval_freq
        self.save_path        = save_path
        self.n_eval_episodes  = n_eval_episodes
        self.best_sharpe      = -np.inf
        self.sharpe_history   = []   # validation Sharpe at each evaluation point
        self.eval_steps       = []   # training step at each evaluation point

    def _on_step(self) -> bool:
        if self.n_calls % self.eval_freq == 0:
            mean_sharpe = self._compute_validation_sharpe()
            self.sharpe_history.append(mean_sharpe)
            self.eval_steps.append(self.n_calls)

            if self.verbose:
                marker = " <- NEW BEST" if mean_sharpe > self.best_sharpe else ""
                print(
                    f"  [Step {self.n_calls:>8,}]  "
                    f"Val Sharpe: {mean_sharpe:>+8.4f}  "
                    f"(best so far: {self.best_sharpe:>+8.4f}){marker}"
                )

            if mean_sharpe > self.best_sharpe:
                self.best_sharpe = mean_sharpe
                self.model.save(self.save_path)
        return True

    def _compute_validation_sharpe(self) -> float:
        """
        Run n_eval_episodes on the validation environment.
        Compute Sharpe for EACH episode individually.
        Return the mean of per-episode Sharpe values.
        """
        sharpes = []
        for _ in range(self.n_eval_episodes):
            env = self.val_env_fn()
            obs, _ = env.reset()
            done   = False
            values = [env.unwrapped.INITIAL_CAPITAL]

            while not done:
                action, _ = self.model.predict(obs, deterministic=True)
                obs, _, terminated, truncated, info = env.step(int(action))
                done = terminated or truncated
                values.append(info["portfolio_value"])
            env.close()

            if len(values) >= 10:
                sharpes.append(episode_sharpe(values, RF_DAILY))

        return float(np.mean(sharpes)) if sharpes else -999.0