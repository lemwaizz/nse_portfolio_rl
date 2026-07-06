import Elysia from "elysia";
import {
  AcknowledgeActionSchema,
  ResourceCreatedSchema,
} from "@coordinator/models/infrastructure/general_responses";
import {
  HoldingSchema,
  RiskProfileSchema,
} from "@coordinator/models/resources";
import { CreateRiskProfileCommandSchema } from "@coordinator/models/commands/risk_profile/create_risk_profile_command";

export const riskProfileModels = new Elysia().model({
  AcknowledgeResponse: AcknowledgeActionSchema,
  ResourceCreated: ResourceCreatedSchema,
  Holding: HoldingSchema,
  RiskProfile: RiskProfileSchema,
  CreateRiskProfileCommand: CreateRiskProfileCommandSchema,
});
