import Elysia from "elysia";
import {
  AcknowledgeActionSchema,
  ResourceCreatedSchema,
} from "@coordinator/models/infrastructure/general_responses";
import {
  HoldingListResponseSchema,
  HoldingSchema,
} from "@coordinator/models/resources";
import { CreateHoldingCommandSchema } from "@coordinator/models/commands/holdings/create_holding_command";
import { EditHoldingCommandSchema } from "@coordinator/models/commands/holdings/edit_holding_command";
import { CurrentPortfolioMarkedValueResponseSchema } from "@coordinator/models/infrastructure/current_portfolio_market_value_response";

export const holdingsModels = new Elysia().model({
  AcknowledgeResponse: AcknowledgeActionSchema,
  ResourceCreated: ResourceCreatedSchema,
  Holding: HoldingSchema,
  HoldingListResponse: HoldingListResponseSchema,
  CreateHoldingCommand: CreateHoldingCommandSchema,
  EditHoldingCommand: EditHoldingCommandSchema,
  CurrentPortfolioMarkedValueResponse:
    CurrentPortfolioMarkedValueResponseSchema,
});
