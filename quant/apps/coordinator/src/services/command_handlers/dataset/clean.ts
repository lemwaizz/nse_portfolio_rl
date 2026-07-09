import { toNum } from "@coordinator/services/command_handlers/dataset/parse";
import {
  ALL_TICKERS_SET,
  type CleanedRow,
  type DatedNormalizedRow,
} from "@coordinator/services/command_handlers/dataset/types";

// Postgres BIGINT max — volumes are clipped to this, matching the notebook.
// In practice NSE volumes never get remotely close to this, so a plain
// number is safe (well under Number.MAX_SAFE_INTEGER).
const BIGINT_MAX = 9_223_372_036_854_775_807;

function cleanVolume(raw: string | undefined): number | null {
  const v = toNum(raw);
  if (v === null) return null;
  if (v < 0) return null;
  return Math.round(Math.min(v, BIGINT_MAX));
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Filters rows to the tracked ticker universe, coerces numeric columns,
 * falls back to raw close when adj_close is missing, drops non-positive
 * closes, and de-duplicates on (date, ticker) keeping the last occurrence —
 * mirroring the notebook's "Filtering and Cleaning" cell.
 */
export function cleanRows(rows: DatedNormalizedRow[]): CleanedRow[] {
  const cleaned: CleanedRow[] = [];

  for (const r of rows) {
    if (!r.date) continue;

    const ticker = r.ticker.trim().toUpperCase();
    if (!ticker || !ALL_TICKERS_SET.has(ticker)) continue;

    const close = toNum(r.close);
    if (close === null || close <= 0) continue;

    const adjClose = toNum(r.adj_close) ?? close; // fallback to raw close

    cleaned.push({
      date: r.date,
      ticker,
      name: r.name?.trim() || null,
      high: toNum(r.high),
      low: toNum(r.low),
      close,
      adj_close: adjClose,
      volume: cleanVolume(r.volume),
      high_52w: toNum(r.high_52w),
      low_52w: toNum(r.low_52w),
      prev_close: toNum(r.prev_close),
      change_val: toNum(r.change_val),
      change_pct: toNum(r.change_pct),
    });
  }

  // drop_duplicates(subset=["date","ticker"], keep="last")
  const dedup = new Map<string, CleanedRow>();
  for (const row of cleaned) {
    dedup.set(`${row.ticker}|${dateKey(row.date)}`, row);
  }

  // sort_values(["ticker","date"])
  return Array.from(dedup.values()).sort((a, b) => {
    if (a.ticker !== b.ticker) return a.ticker.localeCompare(b.ticker);
    return a.date.getTime() - b.date.getTime();
  });
}
