import type {
  CleanedRow,
  FeatureRow,
} from "@coordinator/services/command_handlers/dataset/types";

const MIN_ROWS_FOR_FEATURES = 65; // matches `if len(sub) < 65: continue`

// --- generic rolling helpers -------------------------------------------

function logReturn(prices: number[], lag: number): (number | null)[] {
  const out: (number | null)[] = new Array(prices.length).fill(null);
  for (let i = lag; i < prices.length; i++) {
    const p0 = prices[i - lag] ?? 0;
    const p1 = prices[i] ?? 0;
    if (p0 > 0 && p1 > 0) out[i] = Math.log(p1 / p0);
  }
  return out;
}

/** pandas .rolling(window, min_periods).std() — sample std (ddof=1). */
function rollingStd(
  values: (number | null)[],
  window: number,
  minPeriods: number,
): (number | null)[] {
  const out: (number | null)[] = new Array(values.length).fill(null);
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values
      .slice(start, i + 1)
      .filter((v): v is number => v !== null && !Number.isNaN(v));
    if (slice.length < Math.max(minPeriods, 2)) continue;
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
    const variance =
      slice.reduce((a, b) => a + (b - mean) ** 2, 0) / (slice.length - 1);
    out[i] = Math.sqrt(variance);
  }
  return out;
}

/** pandas .rolling(window, min_periods).mean() */
function rollingMean(
  values: (number | null)[],
  window: number,
  minPeriods: number,
): (number | null)[] {
  const out: (number | null)[] = new Array(values.length).fill(null);
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values
      .slice(start, i + 1)
      .filter((v): v is number => v !== null && !Number.isNaN(v));
    if (slice.length < minPeriods) continue;
    out[i] = slice.reduce((a, b) => a + b, 0) / slice.length;
  }
  return out;
}

/** pandas .rolling(window).max()/.min() — requires a *full* window (no min_periods override). */
function rollingExtreme(
  values: (number | null)[],
  window: number,
  pick: "max" | "min",
): (number | null)[] {
  const out: (number | null)[] = new Array(values.length).fill(null);
  for (let i = 0; i < values.length; i++) {
    const start = i - window + 1;
    if (start < 0) continue;
    const slice = values.slice(start, i + 1);
    if (slice.some((v) => v === null)) continue;
    const nums = slice as number[];
    out[i] = pick === "max" ? Math.max(...nums) : Math.min(...nums);
  }
  return out;
}

// --- liquidity features ---------------------------------------------------

/** Corwin & Schultz (2012) high-low bid-ask spread estimator, clipped to [0, 0.30]. */
function corwinSchultzSpread(
  high: (number | null)[],
  low: (number | null)[],
): number[] {
  const n = high.length;
  const k = 3 - 2 * Math.sqrt(2);

  const bt: (number | null)[] = new Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    const h = high[i];
    const l = low[i];
    if (h && l && h > 0 && l > 0) bt[i] = Math.log(h / l) ** 2;
  }

  // bt.shift(-1): bt1[i] looks one step *forward*.
  const bt1: (number | null | undefined)[] = new Array(n).fill(null);
  for (let i = 0; i < n - 1; i++) bt1[i] = bt[i + 1];

  const h2 = rollingExtreme(high, 2, "max");
  const l2 = rollingExtreme(low, 2, "min");
  const gm: (number | null)[] = new Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    const a = h2[i];
    const b = l2[i];
    if (a && b && a > 0 && b > 0) gm[i] = Math.log(a / b) ** 2;
  }

  const out: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    const btv = bt[i] ?? 0;
    const bt1v = bt1[i] ?? 0;
    const gmv = gm[i] ?? 0;
    if (btv === null || bt1v === null || gmv === null || gmv < 0) continue;

    const ba = (btv + bt1v) / 2;
    if (ba < 0) continue;

    const alpha = (Math.sqrt(2 * ba) - Math.sqrt(ba)) / k - Math.sqrt(gmv / k);
    const sp = (2 * (Math.exp(alpha) - 1)) / (1 + Math.exp(alpha));
    out[i] = Number.isFinite(sp) ? Math.min(Math.max(sp, 0), 0.3) : 0;
  }
  return out;
}

/** Amihud (2002) illiquidity: rolling mean of |return_1d| / dollar volume. */
function amihudIlliquidity(
  return1d: (number | null)[],
  volume: (number | null)[],
  price: number[],
): (number | null)[] {
  const ratio: (number | null)[] = new Array(return1d.length).fill(null);
  for (let i = 0; i < return1d.length; i++) {
    const r = return1d[i] ?? 0;
    const v = volume[i] ?? 0;
    if (r === null || v === null || v === 0) continue;
    const dollarVolume = v * (price[i] ?? 0);
    if (dollarVolume === 0) continue;
    ratio[i] = Math.abs(r) / dollarVolume;
  }
  return rollingMean(ratio, 20, 10);
}

// --- per-ticker / batch entry points ---------------------------------------

/** Computes all observation features for a single ticker's chronologically-sorted rows. */
export function computeFeaturesForTicker(rows: CleanedRow[]): FeatureRow[] {
  if (rows.length < MIN_ROWS_FOR_FEATURES) return [];

  const sorted = [...rows].sort((a, b) => a.date.getTime() - b.date.getTime());
  const price = sorted.map((r) => r.adj_close);
  const high = sorted.map((r) => r.high);
  const low = sorted.map((r) => r.low);
  const volume = sorted.map((r) => r.volume);

  const return1d = logReturn(price, 1);
  const return5d = logReturn(price, 5);
  const return20d = logReturn(price, 20);
  const return60d = logReturn(price, 60);
  const vol20d = rollingStd(return1d, 20, 10);
  const csSpread = corwinSchultzSpread(high, low);
  const amihud = amihudIlliquidity(return1d, volume, price);

  return sorted.map((r, i) => ({
    date: r.date,
    ticker: r.ticker,
    return_1d: return1d[i],
    return_5d: return5d[i],
    return_20d: return20d[i],
    return_60d: return60d[i],
    vol_20d: vol20d[i],
    cs_spread: csSpread[i],
    amihud: amihud[i],
  }));
}

/** Groups cleaned rows by ticker and computes features for each. */
export function computeFeaturesAll(rows: CleanedRow[]): FeatureRow[] {
  const byTicker = new Map<string, CleanedRow[]>();
  for (const r of rows) {
    const arr = byTicker.get(r.ticker) ?? [];
    arr.push(r);
    byTicker.set(r.ticker, arr);
  }

  const out: FeatureRow[] = [];
  for (const tickerRows of byTicker.values()) {
    out.push(...computeFeaturesForTicker(tickerRows));
  }
  return out;
}
