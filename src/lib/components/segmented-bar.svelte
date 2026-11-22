<!--
  tallao — SegmentedBar
  A total split into its parts: the figure, one bar cut into one segment per part, and under it
  a row for each part with its label, its value, its share and (optionally) its change. The
  bar is the quick read; the rows are the data, so nothing is carried by colour alone (a
  part's colour is a swatch beside a printed name and share). Revenue by channel, storage by
  type, tickets by status.
  - A named group (`title`); the bar is decoration (`aria-hidden`) and the rows are a list.
  - Segments grow in from the left, staggered, on load; under reduced motion (system setting
    or `data-tallao-motion="reduce"`) they simply show.
  - A part with no value (zero, negative or not finite) keeps its row at 0% and has no segment.
  - A change has a direction (▲ ▼ and the words "up" / "down" for screen readers); it takes no
    verdict, because whether a rise is good depends on the part.
  - Not interactive; the same HTML on the server.
  Plain JSON: `[{ "label": "Online payments", "value": 26800, "delta": 21.6 }, …]`; an optional
  `"color"` per part takes any CSS colour. `total` overrides the sum (a gross figure that the
  parts do not add up to); the shares are always of the parts' sum.
-->
<script lang="ts" module>
  export interface BarSegment {
    label: string;
    value: number;
    /** Change of this part (shown with its direction); in the units `deltaFormat` writes. */
    delta?: number | null;
    /** Any CSS colour; by default the series colours in order. */
    color?: string;
  }
</script>

<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { compactNumber, finite, percentOf, seriesColor } from "$lib/internal/chart";
  import { cn } from "$lib/utils";

  const L = useLabels();

  interface Props {
    segments: BarSegment[];
    /** Names the group. */
    title: string;
    /** Hides the title visually; it still names the group. */
    hideTitle?: boolean;
    /** The headline figure; by default the sum of the parts. */
    total?: number;
    /** Text next to the figure ("gross volume"). */
    totalLabel?: string;
    locale?: string;
    /** Format of values and the total. */
    format?: (n: number) => string;
    /** Format of a change (by default a signed percent: "+21.6%"). */
    deltaFormat?: (n: number) => string;
    class?: string;
    /** Any other attribute goes to the root element. */
    [key: string]: unknown;
  }

  const {
    segments,
    title,
    hideTitle = false,
    total,
    totalLabel,
    locale,
    format = (n: number) => compactNumber(n, locale),
    deltaFormat = (n: number) =>
      `${new Intl.NumberFormat(locale, { signDisplay: "exceptZero", maximumFractionDigits: 1 }).format(n)}%`,
    class: className = "",
    ...rest
  }: Props = $props();

  const id = $props.id();
  const parts = $derived(segments.map((s) => ({ ...s, amount: Math.max(0, finite(s.value) ?? 0) })));
  const sum = $derived(parts.reduce((a, p) => a + p.amount, 0));
  const headline = $derived(finite(total) ?? sum);
  const direction = (d: number | null | undefined) => {
    const n = finite(d);
    return n == null ? null : n > 0 ? "up" : n < 0 ? "down" : "flat";
  };
</script>

<div {...rest} class={cn("ta-segbar", className)} role="group" aria-labelledby={`${id}-title`}>
  <p class={cn("ta-segbar-title", hideTitle && "ta-segbar-hidden")} id={`${id}-title`}>{title}</p>
  <p class="ta-segbar-total">
    <span class="ta-segbar-figure">{format(headline)}</span>
    {#if totalLabel}<span class="ta-segbar-total-label">{totalLabel}</span>{/if}
  </p>
  <div class="ta-segbar-bar" aria-hidden="true">
    {#each parts as part, i (i)}
      {#if part.amount > 0}
        <span class="ta-segbar-segment" style:flex-grow={part.amount} style:--ta-segbar-color={part.color ?? seriesColor(i)} style:--ta-segbar-i={i}></span>
      {/if}
    {/each}
  </div>
  <ul class="ta-segbar-rows">
    {#each parts as part, i (i)}
      {@const dir = direction(part.delta)}
      <li class="ta-segbar-row">
        <span class="ta-segbar-swatch" style:--ta-segbar-color={part.color ?? seriesColor(i)} aria-hidden="true"></span>
        <span class="ta-segbar-label">{part.label}</span>
        <span class="ta-segbar-share">{percentOf(part.amount, sum, locale, 0)}</span>
        {#if dir != null && part.delta != null}
          <span class={cn("ta-segbar-delta", `ta-segbar-delta--${dir}`)}>
            <span aria-hidden="true">{dir === "up" ? "▲" : dir === "down" ? "▼" : "■"}</span>
            <span class="ta-segbar-hidden">{dir === "up" ? L.trendUp : dir === "down" ? L.trendDown : L.trendFlat}</span>
            {deltaFormat(part.delta)}
          </span>
        {:else}
          <span></span>
        {/if}
        <span class="ta-segbar-value">{format(part.amount)}</span>
      </li>
    {/each}
  </ul>
</div>

<style>
  .ta-segbar { display: flex; flex-direction: column; gap: 0.625rem; min-width: 0; color: rgb(var(--ta-text)); }
  .ta-segbar-title { margin: 0; font-size: 0.875rem; font-weight: 600; }
  .ta-segbar-hidden {
    position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden;
    clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  .ta-segbar-total { display: flex; align-items: baseline; gap: 0.5rem; margin: 0; }
  .ta-segbar-figure { font-size: 1.75rem; font-weight: 600; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
  .ta-segbar-total-label { font-size: 0.8125rem; color: rgb(var(--ta-text-dim)); }

  .ta-segbar-bar { display: flex; gap: 2px; height: 0.75rem; }
  .ta-segbar-segment {
    flex-basis: 0; min-width: 3px;
    background: var(--ta-segbar-color);
    transform-origin: left center;
    animation: ta-segbar-grow var(--ta-duration-slow, 240ms) var(--ta-ease-out, ease-out) both;
    animation-delay: calc(var(--ta-segbar-i, 0) * 70ms);
  }
  .ta-segbar-segment:first-child { border-radius: 9999px 2px 2px 9999px; }
  .ta-segbar-segment:last-child { border-radius: 2px 9999px 9999px 2px; }
  .ta-segbar-segment:only-child { border-radius: 9999px; }
  @keyframes ta-segbar-grow { from { transform: scaleX(0); opacity: 0; } to { transform: scaleX(1); opacity: 1; } }

  .ta-segbar-rows { display: flex; flex-direction: column; margin: 0; padding: 0; list-style: none; }
  .ta-segbar-row {
    display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto auto; align-items: center; column-gap: 0.75rem;
    padding: 0.4375rem 0; font-size: 0.8125rem; border-top: 1px solid rgb(var(--ta-border) / 0.6);
  }
  .ta-segbar-row:first-child { border-top: 0; }
  .ta-segbar-swatch { width: 0.625rem; height: 0.625rem; border-radius: 9999px; background: var(--ta-segbar-color); }
  .ta-segbar-label { overflow-wrap: anywhere; }
  .ta-segbar-share, .ta-segbar-value, .ta-segbar-delta { font-variant-numeric: tabular-nums; white-space: nowrap; }
  .ta-segbar-share { color: rgb(var(--ta-text-dim)); text-align: right; }
  .ta-segbar-value { min-width: 4.5rem; font-weight: 600; text-align: right; }
  .ta-segbar-delta { min-width: 4.5rem; font-size: 0.75rem; color: rgb(var(--ta-text-dim)); text-align: right; }

  @media (max-width: 30rem) {
    .ta-segbar-row { grid-template-columns: auto minmax(0, 1fr) auto auto; }
    .ta-segbar-delta, .ta-segbar-row > span:nth-child(4):empty { display: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-segbar-segment { animation: none; }
  }
</style>
