import Elysia from "elysia";
import {
  AcknowledgeActionSchema,
  ResourceCreatedSchema,
} from "@coordinator/models/infrastructure/general_responses";
import {
  RLRecommendationListResponseSchema,
  RLRecommendationSchema,
} from "@coordinator/models/resources";

export const recommendationsModels = new Elysia().model({
  AcknowledgeResponse: AcknowledgeActionSchema,
  ResourceCreated: ResourceCreatedSchema,
  RLRecommendation: RLRecommendationSchema,
  RLRecommendationListResponse: RLRecommendationListResponseSchema,
});
