import type { BaseQueryHandlerPayload } from "@coordinator/models/queries/query_handler_payload";
import type { CurrentPortfolioMarkedValueResponse } from "@coordinator/models/infrastructure/current_portfolio_market_value_response";

export abstract class GetHoldingsMarketValueQueryHandler {
  static runQuery = async (
    payload: BaseQueryHandlerPayload<undefined> & {
      userId: string;
    },
  ): Promise<CurrentPortfolioMarkedValueResponse> => {
    const { data, db, log, userId } = payload;
    let query = db
      .selectFrom("holding as h")
      .where("h.userId", "=", userId)
      .select((eb) =>
        eb.fn
          .sum<number>(eb("h.averageSharePrice", "*", eb.ref("h.shares")))
          .as("totalMarketValue"),
      );

    const holdings = await query.executeTakeFirst();

    return {
      marketValue: Number(holdings?.totalMarketValue || 0),
    };
  };
}
