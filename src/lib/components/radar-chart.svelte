<!--
  tallao — RadarChart
  Several measures of the same thing on one shape (a character's stats, a deck's profile),
  for one item or a few compared: an axis per measure around a centre, a polygon per series.

    <RadarChart title="Kaela against Oskar" axis="stat" max={100}
      data={[
        { stat: "Damage", kaela: 92, oskar: 55 },
        { stat: "Mobility", kaela: 88, oskar: 40 },
        { stat: "Defence", kaela: 35, oskar: 90 },
        { stat: "Control", kaela: 50, oskar: 72 },
        { stat: "Support", kaela: 20, oskar: 64 },
      ]}
      series={[{ key: "kaela", label: "Kaela" }, { key: "oskar", label: "Oskar" }]} />

  - Same contract as the other charts: a `<figure>` named by `title` (`hideTitle` keeps it for
    screen readers), a legend with two or more series, a labelled empty state, and a
    "Show data" button with the table of every value, so nothing depends on the drawing.
  - Every axis shares one scale from 0 to `max` (by default a round number over the largest
    value), with `levels` rings. A value that is missing or not a number counts as 0 in the
    shape and is "—" in the table. A radar needs at least three axes: with fewer, the empty
    state is shown.
  - Series differ by colour, by the shape of their points and by their line (solid, dashed,
    dotted), so two overlapping profiles can be told apart without colour.
  - The drawing is an image named with the title and the series; it is plain SVG, the same
    on the server. Up to four series: more than that on one radar cannot be read.
  `data` and `series` are plain JSON.
-->
<script lang="ts">
  import ChartFigure, { type ChartTable } from "$lib/internal/chart-figure.svelte";
  import { useLabels } from "$lib/i18n";
  import { compactNumber, finite, niceScale, seriesColor, shapePath, SHAPES, type ChartSeries } from "$lib/internal/chart";
  import { cn } from "$lib/utils";

  const L = useLabels();

  interface Props {
    /** One row per axis: `{ stat: "Damage", kaela: 92, oskar: 55 }`. */
    data: Record<string, unknown>[];
    /** Key of the axis name in each row. */
    axis: string;
    /** What is drawn: one polygon per series (up to four). */
    series: ChartSeries[];
    title: string;
    hideTitle?: boolean;
    /** End of the scale; by default a round number over the largest value. */
    max?: number;
    /** How many rings the grid has. */
    levels?: number;
    /** Width of the drawing in px (it shrinks to fit a narrow container). */
    size?: number;
    /** Header of the axis column in the data table. */
    axisLabel?: string;
    locale?: string;
    format?: (n: number) => string;
    emptyText?: string;
    showDataLabel?: string;
    hideDataLabel?: string;
    class?: string;
  }

  const {
    data,
    axis,
    series,
    title,
    hideTitle = false,
    max,
    levels = 4,
    size = 320,
    axisLabel = L.label,
    locale,
    format = (n: number) => compactNumber(n, locale),
    emptyText,
    showDataLabel,
    hideDataLabel,
    class: className = "",
  }: Props = $props();

  const DASH = ["", "5 3", "1.5 3", "8 3 1.5 3"];
  const shown = $derived(series.slice(0, 4));
  const axes = $derived(data.map((row) => String(row[axis] ?? "")));
  const valueAt = (row: Record<string, unknown>, key: string) => finite(row[key]);
  const top = $derived(
    max ?? niceScale(Math.max(0, ...data.flatMap((row) => shown.map((s) => valueAt(row, s.key) ?? 0))), levels).max
  );

  // Geometry in a 320 × 300 box: room around the rings for the axis names.
  const W = 320;
  const H = 300;
  const CX = W / 2;
  const CY = H / 2 + 2;
  const R = 104;
  const angle = (i: number) => (i / Math.max(1, axes.length)) * Math.PI * 2;
  const point = (i: number, r: number) => [CX + r * Math.sin(angle(i)), CY - r * Math.cos(angle(i))] as const;
  const fixed = (p: readonly [number, number]) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  const ring = (r: number) => axes.map((_, i) => fixed(point(i, r))).join(" ");

  const shapes = $derived(
    shown.map((s, si) => {
      const points = data.map((row, i) => point(i, (Math.min(top, Math.max(0, valueAt(row, s.key) ?? 0)) / (top || 1)) * R));
      return { series: s, color: seriesColor(si), dash: DASH[si], shape: SHAPES[si % SHAPES.length], points, d: points.map(fixed).join(" ") };
    })
  );

  const anchor = (i: number) => {
    const x = Math.sin(angle(i));
    return Math.abs(x) < 0.2 ? "middle" : x > 0 ? "start" : "end";
  };
  const baseline = (i: number) => {
    const y = -Math.cos(angle(i));
    return y < -0.3 ? "auto" : y > 0.3 ? "hanging" : "middle";
  };

  const table = $derived<ChartTable>({
    columns: [{ label: axisLabel }, ...shown.map((s) => ({ label: s.label, numeric: true }))],
    rows: data.map((row, i) => [axes[i], ...shown.map((s) => (valueAt(row, s.key) == null ? "—" : format(valueAt(row, s.key)!)))]),
  });
  const name = $derived(`${title}: ${shown.map((s) => s.label).join(", ")}`);
</script>

<ChartFigure
  {title}
  {hideTitle}
  legend={shown.length > 1 ? shapes.map((s) => ({ label: s.series.label, color: s.color, shape: s.shape })) : undefined}
  empty={axes.length < 3 || shown.length === 0}
  {emptyText}
  {table}
  {showDataLabel}
  {hideDataLabel}
  class={cn("ta-radar", className)}
>
  <svg class="ta-radar-svg" viewBox={`0 0 ${W} ${H}`} style:max-width={`${size}px`} role="img" aria-label={name}>
    {#each Array.from({ length: levels }) as _, l (l)}
      <polygon class={cn("ta-radar-ring", l === levels - 1 && "ta-radar-ring--outer")} points={ring((R * (l + 1)) / levels)} />
    {/each}
    {#each axes as label, i (i)}
      {@const end = point(i, R)}
      {@const at = point(i, R + 12)}
      <line class="ta-radar-spoke" x1={CX} y1={CY} x2={end[0].toFixed(1)} y2={end[1].toFixed(1)} />
      <text class="ta-radar-axis" x={at[0].toFixed(1)} y={at[1].toFixed(1)} text-anchor={anchor(i)} dominant-baseline={baseline(i)}>{label}</text>
    {/each}
    {#each Array.from({ length: levels }) as _, l (l)}
      <text class="ta-radar-tick" x={CX + 3} y={(CY - (R * (l + 1)) / levels - 2).toFixed(1)}>{format((top * (l + 1)) / levels)}</text>
    {/each}
    {#each shapes as s (s.series.key)}
      <polygon class="ta-radar-area" points={s.d} fill={s.color} stroke={s.color} stroke-dasharray={s.dash || undefined} />
    {/each}
    {#each shapes as s (s.series.key)}
      {#each s.points as p, i (i)}
        <path class="ta-radar-point" d={shapePath(s.shape, p[0], p[1], 3.2)} fill={s.color} />
      {/each}
    {/each}
  </svg>
</ChartFigure>

<style>
  .ta-radar-svg { display: block; width: 100%; height: auto; margin: 0 auto; overflow: visible; }

  .ta-radar-ring { fill: none; stroke: rgb(var(--ta-border)); stroke-width: 1; }
  .ta-radar-ring--outer { stroke: rgb(var(--ta-muted)); }
  .ta-radar-spoke { stroke: rgb(var(--ta-border)); stroke-width: 1; }

  .ta-radar-axis { fill: rgb(var(--ta-text-dim)); font-size: 11px; font-weight: 500; }
  .ta-radar-tick { fill: rgb(var(--ta-text-dim)); font-size: 9px; font-variant-numeric: tabular-nums; opacity: 0.8; }

  .ta-radar-area { fill-opacity: 0.14; stroke-width: 2; stroke-linejoin: round; }
  .ta-radar-point { stroke: rgb(var(--ta-surface)); stroke-width: 1.5; }
</style>
