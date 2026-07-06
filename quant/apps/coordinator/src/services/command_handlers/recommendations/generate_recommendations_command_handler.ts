import type { BaseCommandHandlerPayload } from "@coordinator/models/commands/command_handler_payload";
import axios from "axios";
import { TickersSchema } from "@coordinator/models/commands/companies/create_company_command";
import type { ResourceCreated } from "@coordinator/models/infrastructure/general_responses";
import { jsonBuildObject } from "kysely/helpers/postgres";
import { sql } from "kysely";
import { generateRationale } from "@coordinator/services/rationale.service";
import { status } from "elysia";

interface StockFeatures {
  return_1d: number;
  return_5d: number;
  return_20d: number;
  return_60d: number;
  vol_20d: number;
  cs_spread: number;
  amihud: number;
}

interface PortfolioPayload {
  risk_profile: string;
  portfolio_value_kes: number;
  stock_features: Record<string, StockFeatures>;
  portfolio_weights: Record<string, number>;
}

type CreateHoldingPayload = BaseCommandHandlerPayload<unknown> & {
  userId: string;
};

export abstract class GenerateRecommendationCommandHandler {
  static runCommand = async (
    payload: CreateHoldingPayload,
  ): Promise<ResourceCreated> => {
    const { userId, data, db, log } = payload;
    const recommendedEndpoint =
      process.env.QUANT_RECOMMENDER_ENDPOINT ??
      "http://localhost:8000/recommendations";
    const today = new Date();

    const asOfDate = new Date(today);
    asOfDate.setFullYear(asOfDate.getFullYear() - 1);

    const holdingRows = await db
      .selectFrom("holding")
      .innerJoin("company", "company.id", "holding.companyId")
      .innerJoin("risk_profile as rp", "rp.userId", "holding.userId")
      .where("holding.userId", "=", userId)
      .select((eb) => [
        "rp.category",
        eb.fn
          .coalesce(
            eb.fn
              .jsonAgg(
                jsonBuildObject({
                  ticker: eb.ref("company.ticker"),
                  shares: eb.ref("holding.shares"),
                  averageSharePrice: eb.ref("holding.averageSharePrice"),
                }),
              )
              .filterWhere("company.ticker", "is not", null),
            sql`'[]'::json`,
          )
          .as("holdings"),
      ])
      .groupBy(["rp.category"])
      .executeTakeFirst();
    if ((holdingRows?.holdings.length ?? 0) <= 0) {
      throw status(403);
    }

    const featureRows = await db
      .selectFrom("nse_features")
      .distinctOn("ticker")
      .selectAll()
      .where("ticker", "in", TickersSchema.options)
      .where("date", "<=", asOfDate)
      .orderBy("ticker")
      .orderBy("date", "desc")
      .execute();
    const stockFeatures: Record<string, StockFeatures> = {};
    for (const row of featureRows) {
      stockFeatures[row.ticker] = {
        return_1d: Number(row.return_1d ?? 0),
        return_5d: Number(row.return_5d ?? 0),
        return_20d: Number(row.return_20d ?? 0),
        return_60d: Number(row.return_60d ?? 0),
        vol_20d: Number(row.vol_20d ?? 0),
        cs_spread: Number(row.cs_spread ?? 0),
        amihud: Number(row.amihud ?? 0),
      };
    }

    const valueByTicker = new Map<string, number>();
    for (const h of holdingRows!.holdings) {
      const value = h.shares * h.averageSharePrice;
      valueByTicker.set(h.ticker, (valueByTicker.get(h.ticker) ?? 0) + value);
    }

    const portfolioValueKes = [...valueByTicker.values()].reduce(
      (a, b) => a + b,
      0,
    );

    const portfolioWeights: Record<string, number> = {};
    for (const [ticker, value] of valueByTicker) {
      portfolioWeights[ticker] =
        portfolioValueKes > 0 ? value / portfolioValueKes : 0;
    }

    const recommendationPayload: PortfolioPayload = {
      risk_profile: holdingRows!.category,
      portfolio_value_kes: portfolioValueKes,
      stock_features: stockFeatures,
      portfolio_weights: portfolioWeights,
    };
    console.log(recommendationPayload);
    const response = await axios.post(
      recommendedEndpoint,
      recommendationPayload,
    );
    let rationale;
    try {
      rationale = await generateRationale(recommendationPayload, response.data);
    } catch (error) {
      log?.error(error, "Could not get google gemini reseponse");
    }
    const recc = await db
      .insertInto("rl_recommendation")
      .values({ payload: response.data, userId, rationale })
      .returning(["id"])
      .executeTakeFirstOrThrow();
    return {
      id: recc.id,
    };
  };
}
