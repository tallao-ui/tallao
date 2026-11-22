<!--
  tallao — CohortGrid
  Retention by cohort: one row per group of people who started together (the month of their
  first order, the week they signed up), one column per period since then, each cell the share
  still active, shaded by its value. The staircase shape is the point: later cohorts have
  fewer periods behind them, so their right-hand cells are empty.
  - A real `<table>` with row and column headers, so it is its own text alternative: every
    cell prints its percentage; shade is never the only cue. A cohort's size sits beside its
    name. A cell with no value yet is left blank and read as "—".
  - Wider than its container, it scrolls sideways inside a focusable, named region (← →
    scroll it with the keyboard); the cohort names stay in place.
  - Cells fade in along the diagonal on load; under reduced motion (system setting or
    `data-tallao-motion="reduce"`) they simply show.
  - Same HTML on the server.
  Plain JSON: `cohorts=[{ "label": "Jul 2026", "size": 486, "values": [100, 64, 52, 47] }, …]`
  with `periods=["M0", "M1", "M2", "M3"]`; values are percentages from 0 to 100 (`max` rescales).
-->
<script lang="ts" module>
  export interface Cohort {
    /** The group: "Jul 2026", "Week 31". */
    label: string;
    /** How many people it started with. */
    size?: number;
    /** The share still active in each period, in order; a missing or non-finite value is blank. */
    values: Array<number | null | undefined>;
  }
</script>

<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { finite } from "$lib/internal/chart";
  import { cn } from "$lib/utils";

  const L = useLabels();

  interface Props {
    cohorts: Cohort[];
    /** Column headings, one per period ("M0", "M1"…). */
    periods: string[];
    /** Names the table. */
    title: string;
    /** Hides the title visually; it still names the table. */
    hideTitle?: boolean;
    /** Heading of the cohort column. */
    cohortLabel?: string;
    /** Heading of the size column; with none, the sizes are not shown. */
    sizeLabel?: string;
    /** The value that gets the darkest shade (100 for percentages). */
    max?: number;
    /** Any CSS colour for the shading; by default the first series colour. */
    color?: string;
    locale?: string;
    /** Format of a cell (by default a whole percent: "64%"). */
    format?: (n: number) => string;
    class?: string;
    /** Any other attribute goes to the root element. */
    [key: string]: unknown;
  }

  const {
    cohorts,
    periods,
    title,
    hideTitle = false,
    cohortLabel = L.cohort,
    sizeLabel,
    max = 100,
    color = "rgb(var(--ta-series-1))",
    locale,
    format = (n: number) => `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(n)}%`,
    class: className = "",
    ...rest
  }: Props = $props();

  const id = $props.id();
  const heat = (v: number) => Math.min(1, Math.max(0, v / (max > 0 ? max : 100)));
  const count = (n: number) => new Intl.NumberFormat(locale).format(n);
</script>

<div {...rest} class={cn("ta-cohort", className)}>
  <p class={cn("ta-cohort-title", hideTitle && "ta-cohort-hidden")} id={`${id}-title`}>{title}</p>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div class="ta-cohort-scroll" role="region" aria-labelledby={`${id}-title`} tabindex="0">
    <table class="ta-cohort-table" style:--ta-cohort-color={color}>
      <thead>
        <tr>
          <th scope="col" class="ta-cohort-corner">{cohortLabel}</th>
          {#if sizeLabel}<th scope="col" class="ta-cohort-num">{sizeLabel}</th>{/if}
          {#each periods as period, i (i)}<th scope="col" class="ta-cohort-num">{period}</th>{/each}
        </tr>
      </thead>
      <tbody>
        {#each cohorts as cohort, r (r)}
          <tr>
            <th scope="row" class="ta-cohort-name">{cohort.label}</th>
            {#if sizeLabel}<td class="ta-cohort-size">{finite(cohort.size) != null ? count(cohort.size!) : "—"}</td>{/if}
            {#each periods as _, c (c)}
              {@const v = finite(cohort.values[c])}
              {#if v != null}
                <td class="ta-cohort-cell" style:--ta-heat={heat(v)} style:--ta-cohort-delay={`${(r + c) * 35}ms`}>{format(v)}</td>
              {:else}
                <td class="ta-cohort-empty"><span class="ta-cohort-hidden">—</span></td>
              {/if}
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .ta-cohort { display: flex; flex-direction: column; gap: 0.5rem; min-width: 0; color: rgb(var(--ta-text)); }
  .ta-cohort-title { margin: 0; font-size: 0.875rem; font-weight: 600; }
  .ta-cohort-hidden {
    position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden;
    clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  .ta-cohort-scroll { overflow-x: auto; border-radius: 0.5rem; }
  .ta-cohort-scroll:focus-visible { outline: 2px solid rgb(var(--ta-accent, var(--ta-series-1))); outline-offset: 2px; }

  .ta-cohort-table { width: 100%; min-width: max-content; border-collapse: separate; border-spacing: 2px; font-size: 0.8125rem; font-variant-numeric: tabular-nums; }
  .ta-cohort-table th { font-weight: 500; color: rgb(var(--ta-text-dim)); }
  .ta-cohort-corner, .ta-cohort-name { position: sticky; left: 0; padding: 0 0.75rem 0 0; text-align: left; white-space: nowrap; background: rgb(var(--ta-bg, var(--ta-surface))); }
  .ta-cohort-num { padding: 0.25rem 0.5rem; text-align: center; }
  .ta-cohort-size { padding: 0 0.75rem 0 0; color: rgb(var(--ta-text-dim)); text-align: center; }

  .ta-cohort-cell, .ta-cohort-empty { height: 2.25rem; min-width: 3.25rem; padding: 0 0.5rem; text-align: center; border-radius: 0.375rem; }
  .ta-cohort-cell {
    font-weight: 500;
    background: color-mix(in srgb, var(--ta-cohort-color) calc(8% + var(--ta-heat, 0) * 82%), transparent);
    animation: ta-cohort-in var(--ta-duration-slow, 240ms) var(--ta-ease-out, ease-out) both;
    animation-delay: var(--ta-cohort-delay, 0ms);
  }
  .ta-cohort-empty { background: color-mix(in srgb, rgb(var(--ta-text-dim)) 6%, transparent); }
  @keyframes ta-cohort-in { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }

  @media (prefers-reduced-motion: reduce) {
    .ta-cohort-cell { animation: none; }
  }

  @media (pointer: coarse) {
    /* Cells a finger can land on; the scroll region is as tall as its rows. */
    .ta-cohort-cell, .ta-cohort-empty { min-width: 2.75rem; height: 2.75rem; }
    .ta-cohort-scroll { min-height: 2.75rem; }
  }
</style>
