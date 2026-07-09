import { type Generated } from "kysely";
import type {
  CleanedRow,
  FeatureRow,
} from "@coordinator/services/command_handlers/dataset/types";
import { QuantDb } from "@coordinator/prisma/kysely/database";

export interface NseStocksTable {
  ticker: string;
  name: string;
  sector: string | null;
  data_rows: Generated<number | null>;
  first_date: Date | null;
  last_date: Date | null;
  is_active: Generated<boolean | null>;
  created_at: Generated<Date>;
}

export interface NsePricesTable {
  id: Generated<number>;
  date: Date;
  ticker: string;
  name: string | null;
  high: number | null;
  low: number | null;
  close: number;
  adj_close: number | null;
  volume: number | null;
  high_52w: number | null;
  low_52w: number | null;
  prev_close: number | null;
  change_val: number | null;
  change_pct: number | null;
  created_at: Generated<Date>;
}

export interface NseFeaturesTable {
  date: Date;
  ticker: string;
  return_1d: number | null;
  return_5d: number | null;
  return_20d: number | null;
  return_60d: number | null;
  vol_20d: number | null;
  cs_spread: number | null;
  amihud: number | null;
}

export interface Database {
  nse_stocks: NseStocksTable;
  nse_prices: NsePricesTable;
  nse_features: NseFeaturesTable;
}

async function batchInsert<R>(
  rows: R[],
  insertFn: (chunk: R[]) => Promise<unknown>,
  chunkSize = 1000,
) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    await insertFn(rows.slice(i, i + chunkSize));
  }
}

/** Upserts cleaned price rows into nse_prices, chunked to stay under param limits. */
export async function writePrices(
  database: QuantDb.DatabaseConnection,
  rows: CleanedRow[],
): Promise<void> {
  await batchInsert(rows, async (chunk) => {
    await database
      .insertInto("nse_prices")
      .values(
        chunk.map((r) => ({
          date: r.date,
          ticker: r.ticker,
          name: r.name,
          high: r.high?.toString(),
          low: r.low?.toString(),
          close: r.close?.toString(),
          adj_close: r.adj_close?.toString(),
          volume: r.volume?.toString(),
          high_52w: r.high_52w?.toString(),
          low_52w: r.low_52w?.toString(),
          prev_close: r.prev_close?.toString(),
          change_val: r.change_val?.toString(),
          change_pct: r.change_pct?.toString(),
        })),
      )
      .onConflict((oc) =>
        oc.columns(["date", "ticker"]).doUpdateSet((eb) => ({
          close: eb.ref("excluded.close"),
          adj_close: eb.ref("excluded.adj_close"),
          high: eb.ref("excluded.high"),
          low: eb.ref("excluded.low"),
          volume: eb.ref("excluded.volume"),
        })),
      )
      .execute();
  });
}

/** Upserts feature rows into nse_features, matching the notebook's ON CONFLICT set. */
export async function writeFeatures(
  database: QuantDb.DatabaseConnection,
  rows: FeatureRow[],
): Promise<void> {
  await batchInsert(rows, async (chunk) => {
    await database
      .insertInto("nse_features")
      .values(
        chunk.map((r) => ({
          date: r.date,
          ticker: r.ticker,
          return_1d: r.return_1d?.toString(),
          return_5d: r.return_5d?.toString(),
          return_20d: r.return_20d?.toString(),
          return_60d: r.return_60d?.toString(),
          vol_20d: r.vol_20d?.toString(),
          cs_spread: r.cs_spread?.toString(),
          amihud: r.amihud?.toString(),
        })),
      )
      .onConflict((oc) =>
        oc.columns(["date", "ticker"]).doUpdateSet((eb) => ({
          return_60d: eb.ref("excluded.return_60d"),
          cs_spread: eb.ref("excluded.cs_spread"),
          amihud: eb.ref("excluded.amihud"),
        })),
      )
      .execute();
  });
}

/**
 * Fetches up to `lookbackDays` of prior trading rows per ticker, strictly
 * before `beforeDate`. Used to give rolling-window features (vol_20d,
 * return_60d, etc.) continuity across separate file uploads — without this,
 * the first ~60 rows of every new upload would compute features in
 * isolation, same as if the ticker had just started trading.
 */
export async function fetchTrailingPrices(
  database: QuantDb.DatabaseConnection,
  tickers: string[],
  beforeDate: Date,
  lookbackDays = 70,
): Promise<CleanedRow[]> {
  if (tickers.length === 0) return [];

  const rows = await database
    .selectFrom("nse_prices")
    .select([
      "date",
      "ticker",
      "name",
      "high",
      "low",
      "close",
      "adj_close",
      "volume",
      "high_52w",
      "low_52w",
      "prev_close",
      "change_val",
      "change_pct",
    ])
    .where("ticker", "in", tickers)
    .where("date", "<", beforeDate)
    .orderBy("date", "desc")
    .execute();

  // Keep only the most recent `lookbackDays` rows per ticker, then restore
  // chronological order.
  const byTicker = new Map<string, CleanedRow[]>();
  for (const r of rows) {
    const arr = byTicker.get(r.ticker) ?? [];
    if (arr.length < lookbackDays) {
      arr.push({
        ...r,
        date: new Date(r.date),
        close: Number(r.close),
        adj_close: Number(r.adj_close ?? r.close),
        change_pct: r.change_pct ? Number(r.change_pct) : null,
        change_val: r.change_val ? Number(r.change_val) : null,
        high: r.high ? Number(r.high) : null,
        high_52w: r.high_52w ? Number(r.high_52w) : null,
        low: r.low ? Number(r.low) : null,
        low_52w: r.low_52w ? Number(r.low_52w) : null,
        prev_close: r.prev_close ? Number(r.prev_close) : null,
        volume: r.volume ? Number(r.volume) : null,
      });
      byTicker.set(r.ticker, arr);
    }
  }

  const out: CleanedRow[] = [];
  for (const arr of byTicker.values()) out.push(...arr.reverse());
  return out;
}
