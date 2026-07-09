import type { CleanedRow } from "@coordinator/services/command_handlers/dataset/types";

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Inclusive business-day (Mon-Fri) range, equivalent to pd.date_range(freq="B"). */
export function businessDayRange(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cur = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
  );
  const endTime = end.getTime();

  while (cur.getTime() <= endTime) {
    const dow = cur.getUTCDay();
    if (dow !== 0 && dow !== 6) days.push(new Date(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return days;
}

const MAX_GAP_DAYS = 5;

/**
 * Reindexes a single ticker's rows onto the business-day calendar and
 * forward-fills gaps of up to MAX_GAP_DAYS business days. Longer gaps are
 * left unfilled (the notebook drops rows without a close afterwards — here
 * we simply never materialise them), matching:
 *   sub = sub.reindex(calendar); sub[cols] = sub[cols].ffill(limit=5)
 *   sub = sub.dropna(subset=["close"])
 */
export function gapFillTicker(
  rows: CleanedRow[],
  calendar: Date[],
): CleanedRow[] {
  if (rows.length === 0) return [];

  const byDate = new Map<string, CleanedRow>();
  for (const r of rows) byDate.set(dateKey(r.date), r);

  const out: CleanedRow[] = [];
  let last: CleanedRow | null = null;
  let gapLength = 0;

  for (const day of calendar) {
    const existing = byDate.get(dateKey(day));

    if (existing) {
      out.push(existing);
      last = existing;
      gapLength = 0;
      continue;
    }

    gapLength += 1;
    if (last && gapLength <= MAX_GAP_DAYS) {
      out.push({
        date: day,
        ticker: last.ticker,
        name: last.name,
        high: last.high,
        low: last.low,
        close: last.close,
        adj_close: last.adj_close,
        volume: last.volume,
        high_52w: last.high_52w,
        low_52w: last.low_52w,
        prev_close: last.prev_close,
        // change_val / change_pct are day-specific and not meaningfully
        // forward-fillable, so they're left null on synthetic rows.
        change_val: null,
        change_pct: null,
      });
    }
    // else: gap exceeds MAX_GAP_DAYS — leave unfilled, same as the notebook
    // dropping rows with a still-missing close after ffill(limit=5).
  }

  return out;
}

/**
 * Builds one calendar from the overall min/max date across all cleaned rows
 * and gap-fills every ticker against it.
 *
 * Note: because this runs per uploaded file, the calendar only spans that
 * file's date range. If you're ingesting one year at a time, pair this with
 * the trailing-buffer fetch in db.ts before computing features, so rolling
 * windows (vol_20d, return_60d, etc.) have continuity across file boundaries.
 */
export function gapFillAll(cleaned: CleanedRow[]): CleanedRow[] {
  if (cleaned.length === 0) return [];

  let minDate = cleaned[0]!.date;
  let maxDate = cleaned[0]!.date;
  for (const r of cleaned) {
    if (r.date < minDate) minDate = r.date;
    if (r.date > maxDate) maxDate = r.date;
  }
  const calendar = businessDayRange(minDate, maxDate);

  const byTicker = new Map<string, CleanedRow[]>();
  for (const r of cleaned) {
    const arr = byTicker.get(r.ticker) ?? [];
    arr.push(r);
    byTicker.set(r.ticker, arr);
  }

  const out: CleanedRow[] = [];
  for (const rows of byTicker.values()) {
    rows.sort((a, b) => a.date.getTime() - b.date.getTime());
    out.push(...gapFillTicker(rows, calendar));
  }
  return out;
}
