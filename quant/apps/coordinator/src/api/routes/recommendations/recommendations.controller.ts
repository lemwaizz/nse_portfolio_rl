import Elysia from "elysia";
import { authGuardPlugin } from "@coordinator/services/auth/server_auth";
import { kyselyDbPlugin } from "@coordinator/services/persistence/main_pg_db.provider";
import { loggerPlugin } from "@coordinator/plugins";
import { recommendationsModels } from "@coordinator/api/routes/recommendations/recommendations.model";
import { GetRecommendationsQueryHandler } from "@coordinator/services/query_handlers/recommendations/get_recommendations_query_handler";
import { GenerateRecommendationCommandHandler } from "@coordinator/services/command_handlers/recommendations/generate_recommendations_command_handler";
import { GetSingleRecommendationQueryHandler } from "@coordinator/services/query_handlers/recommendations/get_single_recommendation_query_handler";

export const recommendationsController = new Elysia({
  name: "@quant/recommendations",
  prefix: "recommendations",
})
  .use(authGuardPlugin)
  .use(kyselyDbPlugin)
  .use(recommendationsModels)
  .use(loggerPlugin)
  .get(
    "",
    (options) =>
      GetRecommendationsQueryHandler.runQuery({
        db: options.db,
        data: undefined,
        log: options.log,
        userId: options.user.id,
      }),
    {
      auth: true,
      response: "RLRecommendationListResponse",
    },
  )
  .get(
    "/:id",
    (options) =>
      GetSingleRecommendationQueryHandler.runQuery({
        db: options.db,
        data: options.params.id,
        log: options.log,
        userId: options.user.id,
      }),
    {
      auth: true,
      response: "RLRecommendation",
    },
  )
  .post(
    "",
    (options) =>
      GenerateRecommendationCommandHandler.runCommand({
        db: options.db,
        data: undefined,
        log: options.log,
        userId: options.user.id,
      }),
    {
      auth: true,
      response: "ResourceCreated",
    },
  );
