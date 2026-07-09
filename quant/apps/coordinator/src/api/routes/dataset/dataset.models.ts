import Elysia from "elysia";
import {
  AcknowledgeActionSchema,
  ResourceCreatedSchema,
} from "@coordinator/models/infrastructure/general_responses";
import {
  DatasetListResponseSchema,
  DatasetSchema,
} from "@coordinator/models/resources";
import { EditHoldingCommandSchema } from "@coordinator/models/commands/holdings/edit_holding_command";
import { CreateFeedbackCommandSchema } from "@coordinator/models/commands/feedback/create_feedback_command";
import { SetActiveDatasetCommandSchema } from "@coordinator/models/commands/dataset/set_active_dataset_command";

export const datasetModels = new Elysia().model({
  AcknowledgeResponse: AcknowledgeActionSchema,
  ResourceCreated: ResourceCreatedSchema,
  Dataset: DatasetSchema,
  DatasetListResponse: DatasetListResponseSchema,
  CreateFeedbackCommand: CreateFeedbackCommandSchema,
  EditHoldingCommand: EditHoldingCommandSchema,
  SetActiveDatasetCommand: SetActiveDatasetCommandSchema,
});
