import z from "zod";
import {
  RiskProfileLossReactionSchema,
  RiskProfileInvestmentGoalSchema,
  RiskProfileInvestmentHorizonSchema,
} from "@coordinator/models/enums/enums";

export const CreateRiskProfileCommandSchema = z.object({
  investmentHorizon: RiskProfileInvestmentHorizonSchema,
  investmentGoal: RiskProfileInvestmentGoalSchema,
  lossReaction: RiskProfileLossReactionSchema,
});

export type CreateRiskProfileCommand = z.infer<
  typeof CreateRiskProfileCommandSchema
>;
