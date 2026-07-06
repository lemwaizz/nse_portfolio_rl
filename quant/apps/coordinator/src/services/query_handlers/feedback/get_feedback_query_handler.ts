import type { BaseQueryHandlerPayload } from "@coordinator/models/queries/query_handler_payload";
import type { FeedbackListResponse } from "@coordinator/models/resources";
import { jsonBuildObject } from "kysely/helpers/postgres";

export abstract class GetFeedbackQueryHandler {
  static runQuery = async (
    payload: BaseQueryHandlerPayload<undefined> & {
      userId: string;
    },
  ): Promise<FeedbackListResponse> => {
    const { data, db, log, userId } = payload;
    let query = db
      .selectFrom("feedback as f")
      .where("f.userId", "=", userId)
      .innerJoin("user as u", "u.id", "f.userId")
      .select((eb) =>
        jsonBuildObject({
          id: eb.ref("u.id"),
          name: eb.ref("u.name"),
        }).as("createdBy"),
      )
      .selectAll("f");

    const holdings = await query.execute();
    return {
      $paginationType: "offset",
      items: holdings.map((holding) => {
        return {
          ...holding,
          createdAt: holding.createdAt.toISOString(),
        };
      }),
    };
  };
}
