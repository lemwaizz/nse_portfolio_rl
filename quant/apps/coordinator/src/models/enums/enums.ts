import z from "zod";

export const RiskProfileCategorySchema = z.enum([
  "conservative",
  "moderate",
  "aggressive",
]);
export type RiskProfileCategory = z.infer<typeof RiskProfileCategorySchema>;

export const RiskProfileInvestmentHorizonSchema = z.enum([
  "short",
  "medium",
  "long",
]);
export type RiskProfileinvestmentHorizon = z.infer<
  typeof RiskProfileInvestmentHorizonSchema
>;

export const RiskProfileInvestmentGoalSchema = z.enum([
  "preserveCapital",
  "generateIncome",
  "growWealth",
]);
export type RiskProfileInvestmentGoal = z.infer<
  typeof RiskProfileInvestmentGoalSchema
>;

export const RiskProfileLossReactionSchema = z.enum([
  "sellImmediately",
  "hold",
  "buyMore",
]);
export type RiskProfileLossReaction = z.infer<
  typeof RiskProfileLossReactionSchema
>;
