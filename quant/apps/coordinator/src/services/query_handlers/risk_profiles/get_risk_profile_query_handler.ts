import type { BaseQueryHandlerPayload } from "@coordinator/models/queries/query_handler_payload";
import type { RiskProfile } from "@coordinator/models/resources";
import { status } from "elysia";

export abstract class GetRiskProfileQueryHandler {
  static runQuery = async (
    payload: BaseQueryHandlerPayload<undefined> & {
      userId: string;
    },
  ): Promise<RiskProfile> => {
    const { data, db, log, userId } = payload;
    let riskProfile = await db
      .selectFrom("risk_profile as rp")
      .where("rp.userId", "=", userId)
      .selectAll()
      .executeTakeFirst();

    if (!riskProfile) {
      throw status(404);
    }

    return {
      ...riskProfile,
      createdAt: riskProfile.createdAt.toISOString(),
    };
  };
}
