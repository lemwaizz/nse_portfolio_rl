import type { BaseQueryHandlerPayload } from "@coordinator/models/queries/query_handler_payload";
import type { RLRecommendationListResponse } from "@coordinator/models/resources";

export abstract class GetRecommendationsQueryHandler {
  static runQuery = async (
    payload: BaseQueryHandlerPayload<undefined> & {
      userId: string;
    },
  ): Promise<RLRecommendationListResponse> => {
    const { data, db, log, userId } = payload;
    const recommendations = await db
      .selectFrom("rl_recommendation as rr")
      .where("rr.userId", "=", userId)
      .selectAll()
      .execute();
    return {
      $paginationType: "offset",
      items: recommendations.map((rc) => {
        return {
          ...rc,
          createdAt: rc.createdAt.toISOString(),
        };
      }),
    };
  };
}
