<!--
  tallao — BarChart
  Columns per category, one or several grouped series. Follows the kit's brand rules:
  columns 24px wide at most, rounded data end (4px) and a straight base, 2px of space
  between neighbouring columns, thin and discreet grid and axes, a single scale.
  - With two or more series there is a legend; with one, the title says what is measured.
  - Hovering or stepping with ← → (the chart takes focus) shows the category with
    each series' value; a screen reader hears it.
  - "Show data" opens the table with every value: nothing is conveyed by color alone.
  `data` is rows: `{ month: "Jan", visits: 120, signups: 30 }`, `x="month"`,
  `series=[{ key: "visits", label: "Visits" }, …]`.
-->
<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";
  import { compactNumber, niceScale, seriesColor, valueOf, type ChartSeries } from "$lib/internal/chart";

  import Table from "./table.svelte";
  import TableBody from "./table-body.svelte";
  import TableCell from "./table-cell.svelte";
  import TableHead from "./table-head.svelte";
  import TableHeader from "./table-header.svelte";
  import TableRow from "./table-row.svelte";

  const L = useLabels();
  const {
    data,
    x,
    series,
    title,
    /** Header of the first column of the data table (defaults to `x`). */
    xLabel,
    height = 240,
    locale,
    format = (n: number) => compactNumber(n, locale),
    showDataLabel = L.showData,
    hideDataLabel = L.hideData,
    class: className = "",
  }: {
    data: Record<string, unknown>[];
    x: string;
    series: ChartSeries[];
    /** What the chart shows: its accessible name and the figure caption. */
    title: string;
    xLabel?: string;
    height?: number;
    locale?: string;
    /** Format of the values on axes, tooltip and table. */
    format?: (n: number) => string;
    showDataLabel?: string;
    hideDataLabel?: string;
    class?: string;
  } = $props();

  const id = $props.id();
  let chartWidth = $state(640);
  let active = $state<number | null>(null);
  let showTable = $state(false);
  let canvas: HTMLElement | undefined = $state();

  const M = { top: 12, right: 8, bottom: 26, left: 48 };
  const plotWidth = $derived(Math.max(40, chartWidth - M.left - M.right));
  const plotHeight = $derived(Math.max(40, height - M.top - M.bottom));

  const maxValue = $derived(Math.max(0, ...data.flatMap((d) => series.map((s) => valueOf(d, s.key) ?? 0))));
  const scale = $derived(niceScale(maxValue));
  const yOf = (v: number) => M.top + plotHeight - (v / scale.max) * plotHeight;

  const band = $derived(plotWidth / Math.max(1, data.length));
  const barWidth = $derived(Math.min(24, Math.max(2, (band * 0.7 - (series.length - 1) * 2) / series.length)));
  const groupWidth = $derived(series.length * barWidth + (series.length - 1) * 2);
  // With many categories, only one in every `labelStep` is labelled on the axis.
  const labelStep = $derived(Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(plotWidth / 56)))));

  /** Column with a rounded data end and a straight base. */
  function column(xi: number, v: number) {
    const y0 = yOf(0);
    const y = yOf(v);
    const barHeight = y0 - y;
    if (barHeight <= 0) return "";
    const r = Math.min(4, barHeight, barWidth / 2);
    return `M${xi},${y0}V${y + r}Q${xi},${y} ${xi + r},${y}H${xi + barWidth - r}Q${xi + barWidth},${y} ${xi + barWidth},${y + r}V${y0}Z`;
  }

  const xOf = (i: number, s: number) => M.left + band * i + (band - groupWidth) / 2 + s * (barWidth + 2);

  const readout = $derived(
    active == null
      ? ""
      : `${String(data[active]?.[x] ?? "")}: ${series.map((s) => `${s.label} ${fmt(valueOf(data[active!], s.key))}`).join(", ")}`
  );
  const fmt = (v: number | null) => (v == null ? "—" : format(v));

  // The area that responds to the pointer is each category's whole band, not just the column.
  function onMove(e: PointerEvent) {
    if (!canvas || data.length === 0) return;
    const r = canvas.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * chartWidth - M.left;
    active = Math.min(data.length - 1, Math.max(0, Math.floor(px / band)));
  }

  function onKey(e: KeyboardEvent) {
    if (!data.length) return;
    if (e.key === "ArrowRight") active = active == null ? 0 : Math.min(data.length - 1, active + 1);
    else if (e.key === "ArrowLeft") active = active == null ? data.length - 1 : Math.max(0, active - 1);
    else if (e.key === "Home") active = 0;
    else if (e.key === "End") active = data.length - 1;
    else if (e.key === "Escape") active = null;
    else return;
    e.preventDefault();
  }
</script>

<figure class={cn("ta-chart", className)}>
  <figcaption class="ta-chart-title">{title}</figcaption>
  {#if series.length > 1}
    <ul class="ta-chart-legend">
      {#each series as s, i (s.key)}
        <li><span class="ta-chart-swatch" style:background={seriesColor(i)} aria-hidden="true"></span>{s.label}</li>
      {/each}
    </ul>
  {/if}

  <!-- A slider over the categories: ← → step through the data and aria-valuetext reads it. -->
  <div
    class="ta-chart-canvas"
    bind:clientWidth={chartWidth}
    bind:this={canvas}
    role="slider"
    tabindex="0"
    aria-label={title}
    aria-valuemin={0}
    aria-valuemax={Math.max(0, data.length - 1)}
    aria-valuenow={active ?? 0}
    aria-valuetext={readout || title}
    onkeydown={onKey}
    onfocus={() => (active ??= data.length ? 0 : null)}
    onblur={() => (active = null)}
    onpointermove={onMove}
    onpointerleave={() => (active = null)}
  >
    <svg width="100%" {height} viewBox={`0 0 ${chartWidth} ${height}`} class="ta-chart-svg" aria-hidden="true">
      {#each scale.ticks as t (t)}
        <line x1={M.left} x2={M.left + plotWidth} y1={yOf(t)} y2={yOf(t)} class={t === 0 ? "ta-chart-base" : "ta-chart-grid"} />
        <text x={M.left - 8} y={yOf(t)} class="ta-chart-axis" text-anchor="end" dominant-baseline="middle">{format(t)}</text>
      {/each}

      {#each data as d, i (i)}
        <g class="ta-chart-group" class:ta-chart-group--active={active === i}>
          {#each series as s, si (s.key)}
            {@const v = valueOf(d, s.key)}
            {#if v != null && v > 0}<path d={column(xOf(i, si), v)} fill={seriesColor(si)} />{/if}
          {/each}
          {#if i % labelStep === 0}
            <text x={M.left + band * i + band / 2} y={height - 8} class="ta-chart-axis" text-anchor="middle">{String(d[x] ?? "")}</text>
          {/if}
        </g>
      {/each}
    </svg>

    {#if active != null && data[active]}
      <div
        class="ta-chart-tooltip"
        style:left={`${Math.min(chartWidth - 160, Math.max(0, M.left + band * active + band / 2 - 80))}px`}
        aria-hidden="true"
      >
        <span class="ta-chart-tooltip-x">{String(data[active][x] ?? "")}</span>
        {#each series as s, si (s.key)}
          <span class="ta-chart-tooltip-row">
            <span class="ta-chart-key" style:background={seriesColor(si)}></span>
            <strong>{fmt(valueOf(data[active], s.key))}</strong>
            <span>{s.label}</span>
          </span>
        {/each}
      </div>
    {/if}
  </div>

  <button type="button" class="ta-chart-data" aria-expanded={showTable} aria-controls={`${id}-table`} onclick={() => (showTable = !showTable)}>
    {showTable ? hideDataLabel : showDataLabel}
  </button>
  {#if showTable}
    <div id={`${id}-table`}>
      <Table>
        <caption class="ta-hidden">{title}</caption>
        <TableHeader>
          <TableRow>
            <TableHead>{xLabel ?? x}</TableHead>
            {#each series as s (s.key)}<TableHead style="text-align: right">{s.label}</TableHead>{/each}
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each data as d, i (i)}
            <TableRow>
              <TableCell>{String(d[x] ?? "")}</TableCell>
              {#each series as s (s.key)}<TableCell class="ta-chart-num">{fmt(valueOf(d, s.key))}</TableCell>{/each}
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </div>
  {/if}
</figure>

<style>
  .ta-chart { margin: 0; display: flex; flex-direction: column; gap: 0.5rem; min-width: 0; color: rgb(var(--ta-text)); }
  .ta-chart-title { font-size: 0.875rem; font-weight: 600; }

  .ta-chart-legend { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 0; padding: 0; list-style: none; font-size: 0.75rem; color: rgb(var(--ta-text-dim)); }
  .ta-chart-legend li { display: inline-flex; align-items: center; gap: 0.375rem; }
  .ta-chart-swatch { width: 0.625rem; height: 0.625rem; border-radius: 2px; }

  .ta-chart-canvas { position: relative; width: 100%; outline: none; border-radius: var(--ta-radius-sm); }
  .ta-chart-canvas:focus-visible { box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.6); }
  .ta-chart-svg { display: block; overflow: visible; }

  .ta-chart-grid { stroke: rgb(var(--ta-border)); stroke-width: 1; shape-rendering: crispEdges; }
  .ta-chart-base { stroke: rgb(var(--ta-muted)); stroke-width: 1; shape-rendering: crispEdges; }
  .ta-chart-axis { fill: rgb(var(--ta-text-dim)); font-size: 11px; font-variant-numeric: tabular-nums; }

  .ta-chart-group--active path { filter: brightness(1.15); }

  .ta-chart-tooltip {
    position: absolute;
    top: 0;
    width: 160px;
    padding: 0.5rem 0.625rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
    box-shadow: 0 8px 24px -8px rgb(0 0 0 / 0.5);
    pointer-events: none;
  }
  .ta-chart-tooltip-x { color: rgb(var(--ta-text-dim)); }
  .ta-chart-tooltip-row { display: flex; align-items: center; gap: 0.375rem; }
  .ta-chart-tooltip-row strong { font-variant-numeric: tabular-nums; }
  .ta-chart-tooltip-row span:last-child { color: rgb(var(--ta-text-dim)); }
  .ta-chart-key { width: 0.625rem; height: 0.625rem; border-radius: 2px; flex-shrink: 0; }

  .ta-chart-data {
    align-self: flex-start;
    padding: 0.125rem 0;
    font: inherit;
    font-size: 0.75rem;
    color: rgb(var(--ta-accent-hover));
    background: none;
    border: none;
    cursor: pointer;
  }
  .ta-chart-data:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: 2px; }
  .ta-chart :global(.ta-chart-num) { text-align: right; font-variant-numeric: tabular-nums; }

  .ta-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
  @media (pointer: coarse) {
    .ta-chart-data { position: relative; }
    .ta-chart-data::after { content: ""; position: absolute; top: 50%; left: 50%; width: max(100%, 2.75rem); height: max(100%, 2.75rem); transform: translate(-50%, -50%); }
  }
</style>
