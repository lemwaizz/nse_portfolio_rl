import type { BaseQueryHandlerPayload } from "@coordinator/models/queries/query_handler_payload";
import type { HoldingListResponse } from "@coordinator/models/resources";
import { jsonBuildObject } from "kysely/helpers/postgres";

export abstract class GetHoldingsQueryHandler {
  static runQuery = async (
    payload: BaseQueryHandlerPayload<undefined> & {
      userId: string;
    },
  ): Promise<HoldingListResponse> => {
    const { data, db, log, userId } = payload;
    let query = db
      .selectFrom("holding as h")
      .where("h.userId", "=", userId)
      .innerJoin("company as c", "c.id", "h.companyId")
      .select((eb) =>
        jsonBuildObject({
          id: eb.ref("c.id"),
          name: eb.ref("c.name"),
          ticker: eb.ref("c.ticker"),
          logoUrl: eb.ref("c.logoUrl"),
          createdAt: eb.ref("c.createdAt"),
        }).as("company"),
      )
      .selectAll("h");

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
