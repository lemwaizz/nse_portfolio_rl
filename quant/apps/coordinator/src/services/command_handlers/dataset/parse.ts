import type {
  NormalizedRow,
  RawCsvRow,
} from "@coordinator/services/command_handlers/dataset/types";

// --- Header normalisation (normalise_cols) ---------------------------------

const HEADER_MAP: Record<string, keyof NormalizedRow> = {
  DATE: "date",
  CODE: "ticker",
  NAME: "name",
  "12M LOW": "low_52w",
  "12M HIGH": "high_52w",
  "DAY LOW": "low",
  "DAY HIGH": "high",
  "DAY PRICE": "close",
  PREVIOUS: "prev_close",
  CHANGE: "change_val",
  "CHANGE%": "change_pct",
  "CHANGE %": "change_pct",
  VOLUME: "volume",
  ADJUST: "adj_close",
  ADJUSTED: "adj_close",
  "ADJUSTED PRICE": "adj_close",
};

/** Build a { originalHeader: normalizedKey } map from a CSV's header row. */
export function normaliseHeaders(
  headers: string[],
): Record<string, keyof NormalizedRow> {
  const mapping: Record<string, keyof NormalizedRow> = {};
  for (const h of headers) {
    const key = h.trim().toUpperCase();
    const normalized = HEADER_MAP[key];
    if (normalized) mapping[h] = normalized;
  }
  return mapping;
}

/** Remap one raw CSV row's keys using the mapping built above. */
export function remapRow(
  row: RawCsvRow,
  mapping: Record<string, keyof NormalizedRow>,
): NormalizedRow {
  const out: NormalizedRow = {};
  for (const [original, normalized] of Object.entries(mapping)) {
    out[normalized] = row[original];
  }
  return out;
}

// --- Date parsing (parse_date) ---------------------------------------------

const MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

function pandasTwoDigitYear(yy: number): number {
  // Mirrors pandas' %y heuristic: 00-68 -> 2000s, 69-99 -> 1900s.
  return yy <= 68 ? 2000 + yy : 1900 + yy;
}

/** "%m/%d/%Y" — used for pre-2013 files. */
function parseMMDDYYYY(s: string): Date | null {
  const m = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, mm, dd, yyyy] = m;
  const d = new Date(Date.UTC(+yyyy!, +mm! - 1, +dd!));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "%d-%b-%y", e.g. "05-Jan-12" — used for 2013+ files. */
function parseDDMMMYY(s: string): Date | null {
  const m = s.trim().match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/);
  if (!m) return null;
  const [, dd, mon, yy] = m;
  const monthIdx = MONTHS[mon!.toLowerCase()];
  if (monthIdx === undefined) return null;
  const d = new Date(Date.UTC(pandasTwoDigitYear(+yy!), monthIdx, +dd!));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Generic dayfirst fallback, e.g. "5/1/2012" or "05-01-2012" meaning 5 Jan. */
function parseDayFirst(s: string): Date | null {
  const m = s.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (!m) return null;
  const [, dd, mm, yyRaw] = m;
  const yyyy = yyRaw!.length === 2 ? pandasTwoDigitYear(+yyRaw!) : +yyRaw!;
  const d = new Date(Date.UTC(yyyy, +mm! - 1, +dd!));
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Parses a column of date strings the same way the notebook's parse_date()
 * does: fixed format based on `year`, falling back to a dayfirst parse if
 * more than 5% of rows fail the primary format.
 */
export function parseDateColumn(
  dateStrings: string[],
  year: number,
): (Date | null)[] {
  if (year <= 2012) {
    return dateStrings.map(parseMMDDYYYY);
  }

  let parsed = dateStrings.map(parseDDMMMYY);
  const failRate =
    parsed.filter((d) => d === null).length / Math.max(parsed.length, 1);
  if (failRate > 0.05) {
    parsed = dateStrings.map(parseDayFirst);
  }
  return parsed;
}

// --- Numeric coercion (to_num) ----------------------------------------------

/**
 * Mirrors to_num(): strips thousands separators and "%" signs, treats "-"
 * and "" as null, and parses the remainder as a float.
 */
export function toNum(raw: string | undefined | null): number | null {
  if (raw === undefined || raw === null) return null;
  const s = String(raw).replace(/,/g, "").replace(/%/g, "").trim();
  if (s === "" || s === "-") return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}
