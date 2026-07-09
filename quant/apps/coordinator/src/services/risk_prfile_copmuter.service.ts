import type {
  RiskProfileCategory,
  RiskProfileInvestmentGoal,
  RiskProfileinvestmentHorizon,
  RiskProfileLossReaction,
} from "@coordinator/models/enums/enums";

const HORIZON_SCORE: Record<RiskProfileinvestmentHorizon, number> = {
  short: 3,
  medium: 2,
  long: 1,
};

const GOAL_SCORE: Record<RiskProfileInvestmentGoal, number> = {
  preserveCapital: 1,
  generateIncome: 2,
  growWealth: 3,
};

const LOSS_REACTION_SCORE: Record<RiskProfileLossReaction, number> = {
  sellImmediately: 1,
  hold: 2,
  buyMore: 3,
};

const WEIGHTS = {
  lossReaction: 0.4,
  investmentGoal: 0.35,
  investmentHorizon: 0.25,
} as const;

export interface RiskClassificationResult {
  category: RiskProfileCategory;
  score: number; // 1.0 - 3.0
  breakdown: {
    horizonScore: number;
    goalScore: number;
    lossReactionScore: number;
  };
}
export interface RiskProfileInput {
  investmentHorizon: RiskProfileinvestmentHorizon;
  investmentGoal: RiskProfileInvestmentGoal;
  lossReaction: RiskProfileLossReaction;
}

// Score range is 1.0 - 3.0. Split into three equal bands by default.
const CONSERVATIVE_UPPER_BOUND = 1.667;
const MODERATE_UPPER_BOUND = 2.333;

function scoreToCategory(score: number): RiskProfileCategory {
  console.log("🤝❌❌❌❌");
  console.log(score);
  if (score <= CONSERVATIVE_UPPER_BOUND) return "conservative";
  if (score <= MODERATE_UPPER_BOUND) return "moderate";
  return "aggressive";
}

export function classifyRiskProfile(
  input: RiskProfileInput,
): RiskClassificationResult {
  const horizonScore = HORIZON_SCORE[input.investmentHorizon];
  const goalScore = GOAL_SCORE[input.investmentGoal];
  const lossReactionScore = LOSS_REACTION_SCORE[input.lossReaction];

  const weightedScore =
    horizonScore * WEIGHTS.investmentHorizon +
    goalScore * WEIGHTS.investmentGoal +
    lossReactionScore * WEIGHTS.lossReaction;

  const category = scoreToCategory(weightedScore);
  console.log("✅✅✅✅");
  console.log(category);

  return {
    category,
    score: Number(weightedScore.toFixed(3)),
    breakdown: { horizonScore, goalScore, lossReactionScore },
  };
}
