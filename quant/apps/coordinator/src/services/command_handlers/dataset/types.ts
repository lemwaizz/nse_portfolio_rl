// Master list of the 67 qualifying NSE equities — kept in sync with the
// Python notebook's ALL_TICKERS constant.
export const ALL_TICKERS = [
  "ABSA",
  "ARM",
  "BAMB",
  "BAT",
  "BKG",
  "BOC",
  "BRIT",
  "CABL",
  "CARB",
  "CGEN",
  "CIC",
  "COOP",
  "CRWN",
  "CTUM",
  "DCON",
  "DTK",
  "EABL",
  "EGAD",
  "EQTY",
  "EVRD",
  "FAHR",
  "FTGH",
  "GLD",
  "HAFR",
  "HBE",
  "HFCK",
  "IMH",
  "JUB",
  "KAPC",
  "KCB",
  "KEGN",
  "KNRE",
  "KPLC",
  "KPLC-P4",
  "KPLC-P7",
  "KQ",
  "KUKZ",
  "KURV",
  "LAPR",
  "LBTY",
  "LIMT",
  "LKL",
  "MSC",
  "NBK",
  "NBV",
  "NCBA",
  "NMG",
  "NSE",
  "OCH",
  "ORCH",
  "PORT",
  "SASN",
  "SBIC",
  "SCAN",
  "SCBK",
  "SCOM",
  "SGL",
  "SLAM",
  "SMER",
  "TCL",
  "TOTL",
  "TPSE",
  "UCHM",
  "UMME",
  "UNGA",
  "WTK",
  "XPRS",
] as const;

export const ALL_TICKERS_SET = new Set<string>(ALL_TICKERS);

// Raw CSV row as parsed by PapaParse — header text -> string value.
export type RawCsvRow = Record<string, string | undefined>;

// After header normalisation, but before date parsing / numeric coercion.
// All values are still raw strings (or undefined if the column wasn't present).
export interface NormalizedRow {
  date?: string;
  ticker?: string;
  name?: string;
  low_52w?: string;
  high_52w?: string;
  low?: string;
  high?: string;
  close?: string;
  prev_close?: string;
  change_val?: string;
  change_pct?: string;
  volume?: string;
  adj_close?: string;
}

// Same as NormalizedRow but with `date` swapped for a parsed Date (or null
// if it failed to parse) and `ticker` upper-cased/trimmed.
export interface DatedNormalizedRow extends Omit<
  NormalizedRow,
  "date" | "ticker"
> {
  date: Date | null;
  ticker: string;
}

// A fully cleaned, numeric price row — one row per (date, ticker).
// This is the shape written to nse_prices and used as the feature-engineering
// input after gap-filling.
export interface CleanedRow {
  date: Date;
  ticker: string;
  name: string | null;
  high: number | null;
  low: number | null;
  close: number;
  adj_close: number;
  volume: number | null;
  high_52w: number | null;
  low_52w: number | null;
  prev_close: number | null;
  change_val: number | null;
  change_pct: number | null;
}

// One row per (date, ticker) written to nse_features.
export interface FeatureRow {
  date: Date;
  ticker: string;
  return_1d: number | null | undefined;
  return_5d: number | null | undefined;
  return_20d: number | null | undefined;
  return_60d: number | null | undefined;
  vol_20d: number | null | undefined;
  cs_spread: number | null | undefined;
  amihud: number | null | undefined;
}
