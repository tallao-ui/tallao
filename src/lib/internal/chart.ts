/**
 * tallao — what BarChart and LineChart share
 *
 * Scales with round numbers (0 / 250 / 500…), compact figures from 10 000 up
 * (12K, 4.2M), and series colors by fixed position (never recycled: more than eight
 * series are grouped into "Other" or split across several charts).
 */

export interface ChartSeries {
  key: string;
  label: string;
}

export const MAX_SERIES = 8;

/** Color of series i (0-based) from the tokens. */
export const seriesColor = (i: number) => `rgb(var(--ta-series-${(i % MAX_SERIES) + 1}))`;

/** A "nice" maximum and its ticks: the smallest 1·2·2.5·5·10 × 10ⁿ that covers `max`. */
export function niceScale(max: number, ticks = 4): { max: number; ticks: number[] } {
  if (!(max > 0)) return { max: 1, ticks: [0, 1] };
  const raw = max / ticks;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((p) => p >= raw) ?? 10 * power;
  const top = Math.ceil(max / step) * step;
  const marks: number[] = [];
  for (let v = 0; v <= top + step / 1e6; v += step) marks.push(Math.round(v * 1e6) / 1e6);
  return { max: top, ticks: marks };
}

/** Axis figures: whole numbers below 10 000 (1,250), compact from there on (12K, 3.4M). */
export function compactNumber(n: number, locale?: string, compact = Math.abs(n) >= 10_000) {
  return new Intl.NumberFormat(locale, compact ? { notation: "compact", maximumFractionDigits: 1 } : { maximumFractionDigits: 2 }).format(n);
}

/** Numeric value of a row for a series; anything that is not a number counts as empty. */
export function valueOf(row: Record<string, unknown>, key: string): number | null {
  const v = row[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
