import type { BaseQueryHandlerPayload } from "@coordinator/models/queries/query_handler_payload";
import type { RLRecommendation } from "@coordinator/models/resources";

export abstract class GetSingleRecommendationQueryHandler {
  static runQuery = async (
    payload: BaseQueryHandlerPayload<string> & {
      userId: string;
    },
  ): Promise<RLRecommendation> => {
    const { data, db, log, userId } = payload;
    const recommendation = await db
      .selectFrom("rl_recommendation as rr")
      .where("rr.userId", "=", userId)
      .where("rr.id", "=", data)
      .selectAll()
      .executeTakeFirstOrThrow();
    return {
      ...recommendation,
      createdAt: recommendation.createdAt.toISOString(),
    };
  };
}
