import { STOCK_META } from "@frontend/configs/risk_profile_mapping";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 15_000,
  maxRetries: 5,
});

export interface StockFeatures {
  return_1d: number;
  return_5d: number;
  return_20d: number;
  return_60d: number;
  vol_20d: number;
  cs_spread: number;
  amihud: number;
}

export enum RiskProfile {
  Conservative = "conservative",
  Moderate = "moderate",
  Aggressive = "aggressive",
}

export interface RiskProfileResult {
  profile: RiskProfile;
  profile_summary: string;
  /** 0-1 confidence, formatted as a percentage in the prompt */
  confidence: number;
}

export interface TransactionCosts {
  total_kes: number;
  /** e.g. 0.15 -> "0.15%" one-way cost */
  one_way_pct: number;
}

export interface AlternativeAction {
  action_type: string;
  ticker?: string | null;
  /** 0-1 probability */
  probability: number;
}

export interface RecommendationRequest {
  /** Keyed by ticker symbol */
  stock_features: Record<string, StockFeatures>;
  /** Keyed by ticker symbol, values are portfolio weights (0-1) */
  portfolio_weights: Record<string, number>;
  risk_profile: string;
}

export interface RecommendationResponse {
  ticker?: string | null;
  action_type: string;
  /** 0-1 confidence */
  action_confidence: number;
  estimated_trade_value_kes: number;
  transaction_costs: TransactionCosts;
  top_alternatives: AlternativeAction[];
}

/** Inferred from get_meta(ticker).sector / .tier usage */
export interface StockMeta {
  sector: string;
}

export const getMeta = (ticker: string): StockMeta => {
  const key = ticker as unknown as keyof typeof STOCK_META;
  const category = STOCK_META[key];
  return {
    sector: category.category,
  };
};

// ---------------------------------------------------------------------------
// Feature context
// ---------------------------------------------------------------------------

interface TickerAnalysis {
  ticker: string;
  sector: string;
  return_1d_vs_median: number;
  return_5d_vs_median: number;
  return_20d_vs_median: number;
  return_60d_vs_median: number;
  vol_20d_vs_median: number;
  liquidity_spread: number;
  raw_features: StockFeatures;
}

interface AlternativeSummary {
  action: string;
  probability: number;

  ticker: string | null | undefined;
  action_type: string;
  sector?: string;
  return_20d?: number;
  return_20d_rel?: "above" | "below";
  vol_20d?: number;
  vol_rel?: "above" | "below";
  current_weight?: number;
  cs_spread?: number;
}

interface FeatureContext {
  medians: Record<string, number>;
  ticker_analysis: TickerAnalysis | null;
  portfolio_sectors: Record<string, number>;
  alternatives_summary: AlternativeSummary[];
}

export interface GeneratedRationales {
  primary: string;
  alternatives: string[];
  modifiedRes: unknown;
}

/** numpy.median() equivalent for a plain number array */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]!
    : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Extracts signal-level insights from the request/response pair for the
 * rationale prompt. Computes per-stock feature values relative to the
 * cross-sectional median so Claude can say "above/below average" meaningfully.
 */
function buildFeatureContext(
  req: RecommendationRequest,
  resp: RecommendationResponse,
): FeatureContext {
  const features = req.stock_features;
  const featureList = Object.values(features ?? {});

  if (featureList.length === 0) {
    return {
      medians: {},
      ticker_analysis: null,
      portfolio_sectors: {},
      alternatives_summary: [],
    };
  }

  const medianFeature = (attr: keyof StockFeatures): number =>
    median(featureList.map((f) => f[attr]));

  const medians: Record<string, number> = {
    return_1d: medianFeature("return_1d"),
    return_5d: medianFeature("return_5d"),
    return_20d: medianFeature("return_20d"),
    return_60d: medianFeature("return_60d"),
    vol_20d: medianFeature("vol_20d"),
    cs_spread: medianFeature("cs_spread"),
    amihud: medianFeature("amihud"),
  };

  const ticker = resp.ticker;
  let tickerAnalysis: TickerAnalysis | null = null;

  if (ticker && features[ticker]) {
    const f = features[ticker];
    const meta = getMeta(ticker);
    tickerAnalysis = {
      ticker,
      sector: meta.sector,
      return_1d_vs_median: round(f.return_1d - (medians.return_1d ?? 0), 4),
      return_5d_vs_median: round(f.return_5d - (medians.return_5d ?? 0), 4),
      return_20d_vs_median: round(f.return_20d - (medians.return_20d ?? 0), 4),
      return_60d_vs_median: round(f.return_60d - (medians.return_60d ?? 0), 4),
      vol_20d_vs_median: round(f.vol_20d - (medians.vol_20d ?? 0), 4),
      liquidity_spread: round(f.cs_spread, 4),
      raw_features: { ...f },
    };
  }

  // Summarise current portfolio by sector
  const sectorWeights: Record<string, number> = {};
  for (const [t, w] of Object.entries(req.portfolio_weights ?? {})) {
    const sector = getMeta(t).sector;
    sectorWeights[sector] = round((sectorWeights[sector] ?? 0) + w, 4);
  }

  // Summarise the top alternatives
  const alternativesSummary: AlternativeSummary[] = (
    resp.top_alternatives ?? []
  ).map((a) => {
    const result: AlternativeSummary = {
      action: `${a.action_type} ${a.ticker ?? ""}`.trim(),
      action_type: a.action_type,
      ticker: a.ticker,
      probability: a.probability,
    };
    if (a.ticker && features[a.ticker]) {
      const f = features[a.ticker]!;
      const meta = getMeta(a.ticker);

      result.sector = meta.sector;
      result.return_20d = round(f.return_20d, 4);
      result.return_20d_rel =
        f.return_20d > (medians.return_20d ?? 0) ? "above" : "below";

      result.vol_20d = round(f.vol_20d, 4);
      result.vol_rel = f.vol_20d > (medians.vol_20d ?? 0) ? "above" : "below";

      result.current_weight = req.portfolio_weights[a.ticker] ?? 0;

      result.cs_spread = round(f.cs_spread, 4);
    }

    return result;
  });

  return {
    medians,
    ticker_analysis: tickerAnalysis,
    portfolio_sectors: sectorWeights,
    alternatives_summary: alternativesSummary,
  };
}

function buildRationalePrompt(
  req: RecommendationRequest,
  resp: RecommendationResponse,
  featureCtx: FeatureContext,
): string {
  const dir = (v: number) => (v > 0 ? "above" : "below");

  let tickerBlock = "";
  if (featureCtx.ticker_analysis) {
    const ta = featureCtx.ticker_analysis;
    tickerBlock = `
TARGET STOCK ANALYSIS — ${ta.ticker} (${ta.sector}):
  1-day return vs market median:  ${ta.return_1d_vs_median.toFixed(4)}  (${dir(ta.return_1d_vs_median)} average)
  5-day return vs market median:  ${ta.return_5d_vs_median.toFixed(4)}  (${dir(ta.return_5d_vs_median)} average)
  20-day return vs market median: ${ta.return_20d_vs_median.toFixed(4)} (${dir(ta.return_20d_vs_median)} average)
  60-day return vs market median: ${ta.return_60d_vs_median.toFixed(4)} (${dir(ta.return_60d_vs_median)} average)
  20-day volatility vs median:    ${ta.vol_20d_vs_median.toFixed(4)}    (${dir(ta.vol_20d_vs_median)} average)
  Bid-ask spread (liquidity):     ${ta.liquidity_spread.toFixed(4)}
`;
  }

  const sectorBlock = Object.entries(featureCtx.portfolio_sectors)
    .map(([s, w]) => `  ${s}: ${(w * 100).toFixed(1)}%`)
    .join("\n");

  const altBlock = JSON.stringify(featureCtx.alternatives_summary, null, 2);

  return `
You are a financial analyst AI for Amana, a robo-advisory platform focused on the Nairobi Securities Exchange (NSE).

Generate concise, professional 2-3 sentence rationales for the following portfolio recommendation.
Write it AS IF you are explaining the model's reasoning — you are translating quantitative signals
into plain English for a retail investor.

Use specific numbers from the data below. Do NOT use vague language like "the model thinks" or
"it seems". Avoid disclaimers. Speak directly and confidently in the second person ("your portfolio").

---
USER RISK PROFILE: ${req.risk_profile}

RECOMMENDATION:
  Action:     ${resp.action_type} ${resp.ticker ?? ""}
  Confidence: ${(resp.action_confidence * 100).toFixed(1)}%
  Trade value: KES ${resp.estimated_trade_value_kes.toLocaleString()}
 ${resp.transaction_costs ? `Cost impact: KES ${resp.transaction_costs?.total_kes.toLocaleString()} (${resp.transaction_costs?.one_way_pct.toFixed(2)}% one-way) if applicable` : ""}

CURRENT PORTFOLIO SECTOR EXPOSURE:
${sectorBlock}
${tickerBlock}
TOP ALTERNATIVE ACTIONS CONSIDERED:
${altBlock}

Return ONLY valid JSON.

Schema:

{
  "primary": "2-3 sentence rationale",
  "alternatives": [
    "short rationale",
    "short rationale",
    ...
  ]
}

Rules:
- The primary rationale should be under 80 words.
- Alternative rationales should each be under 25 words.
- Reference the user's ${req.risk_profile} risk profile naturally in the primary rationale explanation.
- Mention the specific sector and stock if a BUY/SELL action.
- Reference at least one concrete signal (e.g. the return trend, volatility, or spread).
- For HOLD/REBALANCE, reference portfolio composition or risk signals instead.
- Each rationale should reference at least one concrete signal.
- BUY: mention momentum or liquidity.
- SELL: mention deteriorating trend or overweight exposure.
- HOLD: mention portfolio stability or lack of stronger signal.
- REBALANCE: mention diversification or sector concentration.
- Explain why each alternative was considered, not why it lost.
- Return JSON only.
- The "alternatives" array MUST contain one rationale for each alternative action provided.
-The rationale at index i MUST correspond to the alternative action at index i.
-Do not reorder, omit, merge, or insert alternatives.
  ie:
  Alternative 0 -> alternatives[0]
  Alternative 1 -> alternatives[1]
  Alternative 2 -> alternatives[2]

`.trim();
}

export async function generateRationale(
  req: RecommendationRequest,
  resp: RecommendationResponse,
): Promise<GeneratedRationales> {
  const featureCtx = buildFeatureContext(req, resp);
  const prompt = buildRationalePrompt(req, resp, featureCtx);
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: {
      type: "json_object",
    },
    messages: [{ role: "user", content: prompt }],
  });
  let rationaleRes: GeneratedRationales | undefined;
  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    rationaleRes = {
      primary: "",
      alternatives: resp.top_alternatives.map(() => "Rationale unavailable."),
      modifiedRes: resp,
    };
  } else {
    try {
      rationaleRes = JSON.parse(raw) as GeneratedRationales;
    } catch (error) {
      console.log(error);
    }
  }

  if (!rationaleRes) {
    return {
      primary: raw ?? "",
      alternatives: resp.top_alternatives.map(() => "Rationale unavailable."),
      modifiedRes: resp,
    };
  }

  const enrichedAlternatives = featureCtx.alternatives_summary.map(
    (summary, index) => ({
      ...resp.top_alternatives[index],
      ...summary,
      rationale: rationaleRes.alternatives[index] ?? "Rationale unavailable.",
    }),
  );

  while (rationaleRes.alternatives.length < resp.top_alternatives.length) {
    rationaleRes.alternatives.push(
      "Insufficient signal strength relative to the primary recommendation.",
    );
  }

  return {
    ...rationaleRes,
    modifiedRes: {
      ...resp,
      top_alternatives: enrichedAlternatives,
    },
  };
}
