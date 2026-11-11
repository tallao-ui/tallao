<!--
  tallao — ScatterChart
  Two measures against each other, one point per item (pick rate against win rate of every
  character). Points can belong to a `group`: each group has its own series colour and its
  own shape (circle, square, triangle, diamond), so groups never differ by colour alone,
  and a legend lists them.
  - Both axes get round bounds around the data (they need not start at zero); `xDomain`
    and `yDomain` fix them. `xRef` / `yRef` draw a dashed reference line (a 50% win rate).
  - Hovering snaps to the nearest point; with focus on the chart ← → step through the
    points from left to right (Home / End / Escape too) and a screen reader hears each one.
  - `showLabels` prints each point's label next to it (for a handful of points).
  - "Show data" opens the table with every point. No points: a labelled empty state.
  `data` is plain JSON: `[{ "x": 12.4, "y": 53.1, "label": "Kaela", "group": "Fire" }, …]`
  (`label` and `group` are optional; points without finite `x` and `y` are skipped).
-->
<script lang="ts" module>
  export interface ScatterPoint {
    x: number;
    y: number;
    /** Name of the point, for the tooltip, the table and `showLabels`. */
    label?: string;
    /** Group it belongs to: one colour and shape per group. */
    group?: string;
  }
</script>

<script lang="ts">
  import ChartFigure from "$lib/internal/chart-figure.svelte";
  import { useLabels } from "$lib/i18n";
  import { compactNumber, finite, niceDomain, seriesColor, shapePath, SHAPES } from "$lib/internal/chart";

  const L = useLabels();
  const {
    data,
    title,
    hideTitle = false,
    xLabel,
    yLabel,
    height = 280,
    xDomain,
    yDomain,
    xRef,
    yRef,
    showLabels = false,
    locale,
    format = (n: number) => compactNumber(n, locale),
    xFormat = format,
    yFormat = format,
    labelHeader = L.label,
    groupHeader = L.group,
    emptyText = L.noData,
    showDataLabel = L.showData,
    hideDataLabel = L.hideData,
    class: className = "",
  }: {
    data: ScatterPoint[];
    /** What the chart shows: its accessible name and the figure caption. */
    title: string;
    /** Keeps the title for screen readers only (inside a ChartCard that already shows it). */
    hideTitle?: boolean;
    /** Name of the horizontal measure (axis title, tooltip, table header). */
    xLabel: string;
    /** Name of the vertical measure. */
    yLabel: string;
    height?: number;
    /** Bounds of each axis, instead of round numbers around the data. */
    xDomain?: [number, number];
    yDomain?: [number, number];
    /** A dashed reference line at this x / y value. */
    xRef?: number;
    yRef?: number;
    /** Prints every point's label next to it. */
    showLabels?: boolean;
    locale?: string;
    /** Format of both measures, unless `xFormat` / `yFormat` say otherwise. */
    format?: (n: number) => string;
    xFormat?: (n: number) => string;
    yFormat?: (n: number) => string;
    /** Headers of the label and group columns of the data table. */
    labelHeader?: string;
    groupHeader?: string;
    /** Text shown when there are no points. */
    emptyText?: string;
    showDataLabel?: string;
    hideDataLabel?: string;
    class?: string;
  } = $props();

  let chartWidth = $state(640);
  let active = $state<number | null>(null);
  let canvas: HTMLElement | undefined = $state();

  // Left to right, so the arrows walk the chart in reading order.
  const points = $derived(data.filter((p) => finite(p.x) != null && finite(p.y) != null).sort((a, b) => a.x - b.x || a.y - b.y));
  const groups = $derived([...new Set(points.map((p) => p.group).filter((g): g is string => !!g))]);
  const groupOf = (p: ScatterPoint) => Math.max(0, groups.indexOf(p.group ?? ""));
  const named = $derived(points.some((p) => p.label));

  const M = { top: 26, right: 16, bottom: 42, left: 48 };
  const plotWidth = $derived(Math.max(40, chartWidth - M.left - M.right));
  const plotHeight = $derived(Math.max(40, height - M.top - M.bottom));
  const range = (pick: (p: ScatterPoint) => number, ref?: number): [number, number] => {
    const all = [...points.map(pick), ...(ref != null ? [ref] : [])];
    return [Math.min(...all), Math.max(...all)];
  };
  const xs = $derived(niceDomain(...(xDomain ?? range((p) => p.x, xRef)), Math.max(2, Math.min(5, Math.floor(plotWidth / 70)))));
  const ys = $derived(niceDomain(...(yDomain ?? range((p) => p.y, yRef))));
  const clamp = (t: number) => Math.min(1, Math.max(0, t));
  const xOf = (v: number) => M.left + clamp((v - xs.min) / (xs.max - xs.min)) * plotWidth;
  const yOf = (v: number) => M.top + plotHeight - clamp((v - ys.min) / (ys.max - ys.min)) * plotHeight;

  const nameOf = (p: ScatterPoint) => p.label ?? p.group ?? "";
  const describe = (p: ScatterPoint) =>
    `${[p.label, p.group].filter(Boolean).join(", ")}${p.label || p.group ? ": " : ""}${xLabel} ${xFormat(p.x)}, ${yLabel} ${yFormat(p.y)}`;
  const readout = $derived(active == null || !points[active] ? "" : describe(points[active]));

  const table = $derived({
    columns: [
      ...(named ? [{ label: labelHeader }] : []),
      ...(groups.length ? [{ label: groupHeader }] : []),
      { label: xLabel, numeric: true },
      { label: yLabel, numeric: true },
    ],
    rows: points.map((p) => [...(named ? [p.label ?? ""] : []), ...(groups.length ? [p.group ?? ""] : []), xFormat(p.x), yFormat(p.y)]),
  });

  function onMove(e: PointerEvent) {
    if (!canvas || points.length === 0) return;
    const r = canvas.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * chartWidth;
    const py = ((e.clientY - r.top) / r.height) * height;
    let best = 0;
    let distance = Infinity;
    points.forEach((p, i) => {
      const d = (xOf(p.x) - px) ** 2 + (yOf(p.y) - py) ** 2;
      if (d < distance) {
        distance = d;
        best = i;
      }
    });
    active = best;
  }

  function onKey(e: KeyboardEvent) {
    if (!points.length) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") active = active == null ? 0 : Math.min(points.length - 1, active + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") active = active == null ? points.length - 1 : Math.max(0, active - 1);
    else if (e.key === "Home") active = 0;
    else if (e.key === "End") active = points.length - 1;
    else if (e.key === "Escape") active = null;
    else return;
    e.preventDefault();
  }
</script>

<ChartFigure
  {title}
  {hideTitle}
  legend={groups.length > 1 ? groups.map((g, i) => ({ label: g, shape: SHAPES[i % SHAPES.length] })) : undefined}
  empty={points.length === 0}
  {emptyText}
  {table}
  {showDataLabel}
  {hideDataLabel}
  class={className}
>
  <!-- A slider over the points: ← → step through them and aria-valuetext reads each one. -->
  <div
    class="ta-chart-canvas"
    bind:clientWidth={chartWidth}
    bind:this={canvas}
    role="slider"
    tabindex="0"
    aria-label={title}
    aria-valuemin={0}
    aria-valuemax={Math.max(0, points.length - 1)}
    aria-valuenow={active ?? 0}
    aria-valuetext={readout || title}
    onkeydown={onKey}
    onfocus={() => (active ??= points.length ? 0 : null)}
    onblur={() => (active = null)}
    onpointermove={onMove}
    onpointerleave={() => (active = null)}
  >
    <svg width="100%" {height} viewBox={`0 0 ${chartWidth} ${height}`} class="ta-chart-svg" aria-hidden="true">
      {#each ys.ticks as t (t)}
        <line x1={M.left} x2={M.left + plotWidth} y1={yOf(t)} y2={yOf(t)} class={t === ys.min ? "ta-chart-base" : "ta-chart-grid"} />
        <text x={M.left - 8} y={yOf(t)} class="ta-chart-axis" text-anchor="end" dominant-baseline="middle">{yFormat(t)}</text>
      {/each}
      {#each xs.ticks as t (t)}
        <line x1={xOf(t)} x2={xOf(t)} y1={M.top} y2={M.top + plotHeight} class={t === xs.min ? "ta-chart-base" : "ta-chart-grid"} />
        <text x={xOf(t)} y={M.top + plotHeight + 16} class="ta-chart-axis" text-anchor="middle">{xFormat(t)}</text>
      {/each}
      <text x={M.left - 40} y="12" class="ta-chart-axis ta-scatter-axis">{yLabel}</text>
      <text x={M.left + plotWidth} y={height - 6} class="ta-chart-axis ta-scatter-axis" text-anchor="end">{xLabel}</text>

      {#if xRef != null}<line x1={xOf(xRef)} x2={xOf(xRef)} y1={M.top} y2={M.top + plotHeight} class="ta-chart-ref" />{/if}
      {#if yRef != null}<line x1={M.left} x2={M.left + plotWidth} y1={yOf(yRef)} y2={yOf(yRef)} class="ta-chart-ref" />{/if}

      {#each points as p, i (i)}
        {@const g = groupOf(p)}
        <path
          d={shapePath(SHAPES[g % SHAPES.length], xOf(p.x), yOf(p.y), active === i ? 6.5 : 5)}
          fill={seriesColor(g)}
          class="ta-chart-dot"
          class:ta-scatter-dim={active != null && active !== i}
        />
        {#if showLabels && nameOf(p)}
          <text
            x={xOf(p.x) + (xOf(p.x) > M.left + plotWidth * 0.8 ? -9 : 9)}
            y={yOf(p.y) + 4}
            text-anchor={xOf(p.x) > M.left + plotWidth * 0.8 ? "end" : "start"}
            class="ta-scatter-label"
            class:ta-scatter-dim={active != null && active !== i}>{nameOf(p)}</text
          >
        {/if}
      {/each}
    </svg>

    {#if active != null && points[active]}
      {@const p = points[active]}
      <div
        class="ta-chart-tooltip"
        style:left={`${Math.min(Math.max(0, chartWidth - 160), Math.max(0, xOf(p.x) + (xOf(p.x) > chartWidth / 2 ? -172 : 12)))}px`}
        style:top={`${Math.max(0, Math.min(height - 84, yOf(p.y) - 30))}px`}
        aria-hidden="true"
      >
        {#if p.label || p.group}<span class="ta-chart-tooltip-x">{[p.label, p.group].filter(Boolean).join(" · ")}</span>{/if}
        <span class="ta-chart-tooltip-row"><strong>{xFormat(p.x)}</strong><span>{xLabel}</span></span>
        <span class="ta-chart-tooltip-row"><strong>{yFormat(p.y)}</strong><span>{yLabel}</span></span>
      </div>
    {/if}
  </div>
</ChartFigure>

<style>
  .ta-scatter-axis { font-weight: 600; }
  .ta-scatter-label { fill: rgb(var(--ta-text)); font-size: 11px; paint-order: stroke; stroke: rgb(var(--ta-bg) / 0.85); stroke-width: 3px; stroke-linejoin: round; }
  .ta-scatter-dim { opacity: 0.45; }

  @media (pointer: coarse) {
    /* The chart itself is the control: tall enough to step through with a finger. */
    .ta-chart-canvas { min-height: 2.75rem; }
  }
</style>
