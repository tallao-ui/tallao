<!--
  tallao — Heatmap
  A matrix of values: rows against columns, each cell shaded by its value (win rate of
  every character against every other, activity per weekday and hour).
  It is a real `<table>` with row and column headers, so it is its own text alternative:
  every cell prints its value (`showValues`, on by default; off, the value stays for
  screen readers and as a tooltip), and the scale under it says what the lightest and the
  darkest shade stand for. Shade is never the only cue.
  - Wider than its container, it scrolls sideways inside a focusable, named region
    (← → scroll it with the keyboard); the row headers stay in place, on the page
    background (set `--ta-heatmap-sticky-bg` when it sits on another surface).
  - A missing cell shows "—". With no data it shows a labelled empty state.
  - Same HTML on the server.
  `data` is plain JSON, one object per cell: `[{ "x": "Fire", "y": "Water", "value": 38.5 }, …]`.
  Columns and rows appear in the order they first show up, or in the order of `xs` / `ys`.
-->
<script lang="ts" module>
  export interface HeatmapCell {
    /** Column. */
    x: string;
    /** Row. */
    y: string;
    value: number;
  }
</script>

<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { compactNumber, finite } from "$lib/internal/chart";
  import { cn } from "$lib/utils";

  const L = useLabels();

  interface Props {
    data: HeatmapCell[];
    /** What the matrix shows: its caption and accessible name. */
    title: string;
    /** Keeps the title for screen readers only (inside a ChartCard that already shows it). */
    hideTitle?: boolean;
    /** Order of the columns (and columns to show even when empty). */
    xs?: string[];
    /** Order of the rows. */
    ys?: string[];
    /** Text of the top-left corner: what the rows are ("Attacker"). */
    cornerLabel?: string;
    /** Prints the value in every cell. */
    showValues?: boolean;
    /** Value of the lightest and the darkest shade; by default the data's own range. */
    min?: number;
    max?: number;
    /** Any CSS colour for the shade; by default the first series colour. */
    color?: string;
    locale?: string;
    /** Format of the values. */
    format?: (n: number) => string;
    /** Text shown when `data` is empty. */
    emptyText?: string;
    class?: string;
    /** Any other attribute goes to the root element. */
    [key: string]: unknown;
  }

  const {
    data,
    title,
    hideTitle = false,
    xs,
    ys,
    cornerLabel = "",
    showValues = true,
    min,
    max,
    color,
    locale,
    format = (n: number) => compactNumber(n, locale),
    emptyText = L.noData,
    class: className = "",
    ...rest
  }: Props = $props();

  const cells = $derived(data.filter((d) => finite(d.value) != null));
  const columns = $derived(xs ?? [...new Set(cells.map((d) => d.x))]);
  const rows = $derived(ys ?? [...new Set(cells.map((d) => d.y))]);
  const lookup = $derived(new Map(cells.map((d) => [`${d.y}\u0000${d.x}`, d.value])));
  const low = $derived(min ?? Math.min(...cells.map((d) => d.value)));
  const high = $derived(max ?? Math.max(...cells.map((d) => d.value)));
  /** Opacity of the shade: 8% at the low end, 70% at the high end (the text stays readable on both themes). */
  const shade = (v: number) => (high > low ? 0.08 + 0.62 * Math.min(1, Math.max(0, (v - low) / (high - low))) : 0.4);
  const STEPS = [0, 0.25, 0.5, 0.75, 1];
</script>

<figure {...rest} class={cn("ta-heatmap", className)} style:--ta-heatmap-color={color}>
  <figcaption class={cn("ta-heatmap-title", hideTitle && "ta-heatmap-hidden")}>{title}</figcaption>
  {#if cells.length === 0}
    <p class="ta-heatmap-empty">{emptyText}</p>
  {:else}
    <!-- A scrolling region must be reachable by keyboard (WCAG 2.1.1): focus lets ← → scroll it. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="ta-heatmap-scroll" role="group" aria-label={title} tabindex="0">
      <table class="ta-heatmap-table">
        <thead>
          <tr>
            <th scope="col" class="ta-heatmap-corner">{cornerLabel}</th>
            {#each columns as column (column)}<th scope="col">{column}</th>{/each}
          </tr>
        </thead>
        <tbody>
          {#each rows as row (row)}
            <tr>
              <th scope="row">{row}</th>
              {#each columns as column (column)}
                {@const v = lookup.get(`${row}\u0000${column}`)}
                {#if v == null}
                  <td class="ta-heatmap-cell ta-heatmap-cell--none">—</td>
                {:else}
                  <td class="ta-heatmap-cell" style:--ta-heat={shade(v).toFixed(3)} title={showValues ? undefined : `${row} · ${column}: ${format(v)}`}>
                    <span class={showValues ? undefined : "ta-heatmap-hidden"}>{format(v)}</span>
                  </td>
                {/if}
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="ta-heatmap-scale" aria-hidden="true">
      <span>{format(low)}</span>
      {#each STEPS as step (step)}<span class="ta-heatmap-step" style:--ta-heat={(0.08 + 0.62 * step).toFixed(3)}></span>{/each}
      <span>{format(high)}</span>
    </div>
  {/if}
</figure>

<style>
  .ta-heatmap { margin: 0; display: flex; flex-direction: column; gap: 0.5rem; min-width: 0; color: rgb(var(--ta-text)); --ta-heatmap-ink: var(--ta-heatmap-color, rgb(var(--ta-series-1))); }
  .ta-heatmap-title { font-size: 0.875rem; font-weight: 600; }
  .ta-heatmap-empty { margin: 0; padding: 2rem 1rem; text-align: center; font-size: 0.8125rem; color: rgb(var(--ta-text-dim)); border: 1px dashed rgb(var(--ta-border)); border-radius: var(--ta-radius); }

  .ta-heatmap-scroll { overflow-x: auto; max-width: 100%; border-radius: var(--ta-radius-sm); outline: none; }
  .ta-heatmap-scroll:focus-visible { box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.6); }
  .ta-heatmap-table { width: 100%; border-collapse: separate; border-spacing: 2px; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
  .ta-heatmap-table th { padding: 0.25rem 0.375rem; font-weight: 500; color: rgb(var(--ta-text-dim)); white-space: nowrap; text-align: center; }
  .ta-heatmap-table tbody th { position: sticky; left: 0; z-index: 1; text-align: left; color: rgb(var(--ta-text)); background: var(--ta-heatmap-sticky-bg, rgb(var(--ta-bg))); }
  .ta-heatmap-table th.ta-heatmap-corner { text-align: left; }

  .ta-heatmap-cell {
    min-width: 2.5rem;
    height: 2rem;
    padding: 0.125rem 0.25rem;
    text-align: center;
    border-radius: 3px;
    background: color-mix(in srgb, var(--ta-heatmap-ink) calc(var(--ta-heat, 0) * 100%), transparent);
  }
  .ta-heatmap-cell--none { color: rgb(var(--ta-text-dim)); background: rgb(var(--ta-elevated) / 0.4); }

  .ta-heatmap-scale { display: flex; align-items: center; gap: 2px; font-size: 0.6875rem; color: rgb(var(--ta-text-dim)); font-variant-numeric: tabular-nums; }
  .ta-heatmap-scale > span:first-child { margin-right: 0.375rem; }
  .ta-heatmap-scale > span:last-child { margin-left: 0.375rem; }
  .ta-heatmap-step { width: 1.25rem; height: 0.5rem; border-radius: 2px; background: color-mix(in srgb, var(--ta-heatmap-ink) calc(var(--ta-heat) * 100%), transparent); }

  .ta-heatmap-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

  @media (pointer: coarse) {
    /* Cells a finger can land on (and read the tooltip of). */
    .ta-heatmap-cell { min-width: 2.75rem; height: 2.75rem; }
  }
</style>
