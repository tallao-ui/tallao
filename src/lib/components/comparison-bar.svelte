<!--
  tallao — ComparisonBar
  Two values against each other (win rate of team A against team B, votes for and
  against): each side's label, value and share in text, over one bar split between them.
  The larger side is in bold and its segment is solid while the other is hatched, so the
  two differ by more than colour. A named group; the bar is decoration. Not interactive;
  same HTML on the server. With both values at zero the bar is split in half.
  Plain JSON: `{ "left": { "label": "Blue side", "value": 5230 }, "right": { "label":
  "Red side", "value": 4770 } }` (an optional `"color"` per side takes any CSS colour).
-->
<script lang="ts" module>
  export interface ComparisonSide {
    label: string;
    value: number;
    /** Any CSS colour; by default the first and second series colours. */
    color?: string;
  }
</script>

<script lang="ts">
  import { compactNumber, finite, percentOf, seriesColor } from "$lib/internal/chart";
  import { cn } from "$lib/utils";

  interface Props {
    left: ComparisonSide;
    right: ComparisonSide;
    /** What is compared: the visible heading and the group's accessible name. */
    title?: string;
    /** Accessible name when there is no visible `title`. */
    ariaLabel?: string;
    /** Shows each side's percentage of the sum next to its value. */
    showShare?: boolean;
    locale?: string;
    /** Format of the values. */
    format?: (n: number) => string;
    class?: string;
    /** Any other attribute goes to the root element. */
    [key: string]: unknown;
  }

  const {
    left,
    right,
    title,
    ariaLabel,
    showShare = true,
    locale,
    format = (n: number) => compactNumber(n, locale),
    class: className = "",
    ...rest
  }: Props = $props();

  const id = $props.id();
  const a = $derived(Math.max(0, finite(left.value) ?? 0));
  const b = $derived(Math.max(0, finite(right.value) ?? 0));
  const sum = $derived(a + b);
  const leftShare = $derived(sum > 0 ? (a / sum) * 100 : 50);
</script>

<div {...rest} class={cn("ta-versus", className)} role="group" aria-labelledby={title ? `${id}-title` : undefined} aria-label={title ? undefined : ariaLabel}>
  {#if title}<p class="ta-versus-title" id={`${id}-title`}>{title}</p>{/if}
  <div class="ta-versus-sides">
    {#each [{ side: left, value: a, lead: a >= b }, { side: right, value: b, lead: b > a }] as entry, i (i)}
      <p class="ta-versus-side" class:ta-versus-side--lead={entry.lead && a !== b} class:ta-versus-side--right={i === 1}>
        <span class="ta-versus-label">{entry.side.label}</span>
        <span class="ta-versus-value">
          {format(entry.value)}{#if showShare}<span class="ta-versus-share"> · {percentOf(entry.value, sum, locale)}</span>{/if}
        </span>
      </p>
    {/each}
  </div>
  <div class="ta-versus-bar" aria-hidden="true">
    <span class="ta-versus-segment" class:ta-versus-segment--behind={a < b} style:width={`${leftShare}%`} style:--ta-versus-color={left.color ?? seriesColor(0)}></span>
    <span class="ta-versus-segment" class:ta-versus-segment--behind={b < a} style:width={`${100 - leftShare}%`} style:--ta-versus-color={right.color ?? seriesColor(1)}></span>
  </div>
</div>

<style>
  .ta-versus { display: flex; flex-direction: column; gap: 0.5rem; min-width: 0; color: rgb(var(--ta-text)); }
  .ta-versus-title { margin: 0; font-size: 0.875rem; font-weight: 600; }

  .ta-versus-sides { display: flex; justify-content: space-between; gap: 1rem; }
  .ta-versus-side { display: flex; flex-direction: column; min-width: 0; margin: 0; font-size: 0.8125rem; }
  .ta-versus-side--right { align-items: flex-end; text-align: right; }
  .ta-versus-label { color: rgb(var(--ta-text-dim)); overflow-wrap: anywhere; }
  .ta-versus-value { font-size: 1.125rem; font-weight: 500; font-variant-numeric: tabular-nums; }
  .ta-versus-side--lead .ta-versus-value { font-weight: 800; }
  .ta-versus-share { font-size: 0.75rem; font-weight: 500; color: rgb(var(--ta-text-dim)); }

  .ta-versus-bar { display: flex; gap: 2px; height: 0.75rem; }
  .ta-versus-segment { min-width: 3px; background: var(--ta-versus-color); }
  .ta-versus-segment:first-child { border-radius: 9999px 2px 2px 9999px; }
  .ta-versus-segment:last-child { border-radius: 2px 9999px 9999px 2px; }
  /* The side that trails is hatched: the lead is readable without the colours. */
  .ta-versus-segment--behind {
    background: repeating-linear-gradient(135deg, var(--ta-versus-color) 0 3px, color-mix(in srgb, var(--ta-versus-color) 35%, transparent) 3px 6px);
  }
</style>
