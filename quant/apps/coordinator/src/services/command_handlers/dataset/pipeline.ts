import Papa from "papaparse";
import {
  normaliseHeaders,
  parseDateColumn,
  remapRow,
} from "@coordinator/services/command_handlers/dataset/parse";
import { cleanRows } from "@coordinator/services/command_handlers/dataset/clean";
import { gapFillAll } from "@coordinator/services/command_handlers/dataset/gap_fill";
import { computeFeaturesAll } from "@coordinator/services/command_handlers/dataset/features";
import {
  fetchTrailingPrices,
  writeFeatures,
  writePrices,
} from "@coordinator/services/command_handlers/dataset/db";
import type {
  CleanedRow,
  DatedNormalizedRow,
  NormalizedRow,
  RawCsvRow,
} from "@coordinator/services/command_handlers/dataset/types";
import { QuantDb } from "@coordinator/prisma/kysely/database";

export interface IngestSummary {
  rowsParsed: number;
  rowsCleaned: number;
  rowsAfterGapFill: number;
  featureRows: number;
  tickers: number;
  dateRange: { from: string; to: string } | null;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Merges older (trailing buffer) + newer (this upload) rows, newer wins on overlap. */
function mergeForFeatureCalc(
  older: CleanedRow[],
  newer: CleanedRow[],
): CleanedRow[] {
  const map = new Map<string, CleanedRow>();
  for (const r of older) map.set(`${r.ticker}|${dateKey(r.date)}`, r);
  for (const r of newer) map.set(`${r.ticker}|${dateKey(r.date)}`, r);
  return Array.from(map.values());
}

/**
 * Ingests one CSV file (same annual format as the notebook's raw/*.csv) for
 * a given `year`, writing prices + features to Postgres via Kysely.
 *
 * `year` drives date-format selection (see parseDateColumn) exactly like the
 * notebook — pass the year the file's dates belong to, not the current year.
 */
export async function ingestNseCsv(
  csvText: string,
  year: number,
  database: QuantDb.DatabaseConnection,
): Promise<IngestSummary> {
  const parsed = Papa.parse<RawCsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  const headers = parsed.meta.fields ?? [];
  const mapping = normaliseHeaders(headers);

  const rawNormalized: NormalizedRow[] = parsed.data.map((row) =>
    remapRow(row, mapping),
  );
  const dateStrings = rawNormalized.map((r) => r.date ?? "");
  const parsedDates = parseDateColumn(dateStrings, year);

  const datedRows: DatedNormalizedRow[] = rawNormalized.map((r, i) => ({
    ...r,
    ticker: (r.ticker ?? "").trim().toUpperCase(),
    date: parsedDates[i]!,
  }));

  const cleaned = cleanRows(datedRows);
  const gapFilled = gapFillAll(cleaned);

  if (gapFilled.length === 0) {
    return {
      rowsParsed: parsed.data.length,
      rowsCleaned: cleaned.length,
      rowsAfterGapFill: 0,
      featureRows: 0,
      tickers: 0,
      dateRange: null,
    };
  }

  const tickers = Array.from(new Set(gapFilled.map((r) => r.ticker)));
  let minDate = gapFilled[0]!.date;
  let maxDate = gapFilled[0]!.date;
  for (const r of gapFilled) {
    if (r.date < minDate) minDate = r.date;
    if (r.date > maxDate) maxDate = r.date;
  }

  // Pull prior history so rolling windows (vol_20d, return_60d, ...) aren't
  // computed in isolation at the start of every new upload.
  const trailing = await fetchTrailingPrices(database, tickers, minDate, 70);
  const merged = mergeForFeatureCalc(trailing, gapFilled);

  // Only keep features for dates in *this* upload — the trailing rows exist
  // purely to warm up the rolling windows, their own feature rows were
  // already written when they were originally ingested.
  const features = computeFeaturesAll(merged).filter((f) => f.date >= minDate);

  await writePrices(database, gapFilled);
  await writeFeatures(database, features);

  return {
    rowsParsed: parsed.data.length,
    rowsCleaned: cleaned.length,
    rowsAfterGapFill: gapFilled.length,
    featureRows: features.length,
    tickers: tickers.length,
    dateRange: { from: dateKey(minDate), to: dateKey(maxDate) },
  };
}
