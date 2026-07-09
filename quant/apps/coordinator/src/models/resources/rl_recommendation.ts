import z from "zod";
import { createCursorListResultSchema } from "@coordinator/models/queries";
import { createOffsetListResultSchema } from "@coordinator/models/queries";

export const RLRecommendationSchema = z.object({
  id: z.string(),
  createdAt: z.iso.datetime({ offset: true }),
  payload: z.unknown().nullish(),
  rationale: z.string().nullish(),
});

export type RLRecommendation = z.infer<typeof RLRecommendationSchema>;

const RLRecommendationCursorListResponseSchema = createCursorListResultSchema(
  RLRecommendationSchema,
);
const RLRecommendationOffsetListResponseSchema = createOffsetListResultSchema(
  RLRecommendationSchema,
);

export const RLRecommendationListResponseSchema = z.union([
  RLRecommendationOffsetListResponseSchema,
  RLRecommendationCursorListResponseSchema,
]);
export type RLRecommendationListResponse = z.infer<
  typeof RLRecommendationListResponseSchema
>;

export type RecommendationResponse = {
  ticker: string;
  model_used: string;
  action_type: "BUY" | "SELL" | "HOLD";
  action_index: number;
  risk_profile: "conservative" | "moderate" | "aggressive";
  model_version: string;
  current_weights: Record<string, number>;
  top_alternatives: {
    ticker: string;
    action_type: "BUY" | "SELL" | "HOLD";
    probability: number;
    action_index: number;
    //
    sector?: string;
    return_20d?: number;
    return_20d_rel?: "above" | "below";
    vol_20d?: number;
    vol_rel?: "above" | "below";
    current_weight?: number;
    cs_spread?: number;
    rationale: string | null;
  }[];
  action_confidence: number;
  projected_weights: Record<string, number>;
  transaction_costs: {
    total_kes: number;
    one_way_pct: number;
    cma_levy_kes: number;
    nse_levy_kes: number;
    brokerage_kes: number;
    cdsc_levy_kes: number;
    round_trip_pct: number;
    trade_value_kes: number;
  } | null;
  estimated_trade_value_kes: number;
};
