import Elysia from "elysia";
import {
  AcknowledgeActionSchema,
  ResourceCreatedSchema,
} from "@coordinator/models/infrastructure/general_responses";
import {
  FeedbackListResponseSchema,
  HoldingSchema,
} from "@coordinator/models/resources";
import { EditHoldingCommandSchema } from "@coordinator/models/commands/holdings/edit_holding_command";
import { CurrentPortfolioMarkedValueResponseSchema } from "@coordinator/models/infrastructure/current_portfolio_market_value_response";
import { CreateFeedbackCommandSchema } from "@coordinator/models/commands/feedback/create_feedback_command";

export const feedbackModels = new Elysia().model({
  AcknowledgeResponse: AcknowledgeActionSchema,
  ResourceCreated: ResourceCreatedSchema,
  Holding: HoldingSchema,
  FeedbackListResponse: FeedbackListResponseSchema,
  CreateFeedbackCommand: CreateFeedbackCommandSchema,
  EditHoldingCommand: EditHoldingCommandSchema,
  CurrentPortfolioMarkedValueResponse:
    CurrentPortfolioMarkedValueResponseSchema,
});
