<!--
  tallao — IconArray
  A unit (pictogram) chart: "7 of 10 players pick a Fire lead". `total` marks in a grid,
  the first `value` filled and the rest hollow, so filled and empty differ by shape and
  not only by colour, with the count in words next to it.
  - The sentence under the grid ("7 of 10" + `label`) is the content; the grid is
    decoration. With `showSummary={false}` the grid becomes an image named by that sentence.
  - `shape` picks the mark (circle, square, person); the `icon` snippet draws your own
    inside a 24×24 viewBox and receives `{ filled, index }`.
  - `value` is rounded to whole marks and kept between 0 and `total`. Not interactive;
    same HTML on the server.
  Plain JSON: `{ "value": 7, "total": 10, "label": "players pick a Fire lead" }`.
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { fill } from "$lib/internal/chart";
  import { cn } from "$lib/utils";

  const L = useLabels();

  interface Props {
    /** How many marks are filled. */
    value: number;
    /** How many marks there are. */
    total?: number;
    /** What is counted: the text after "7 of 10". */
    label: string;
    /** Marks per row; by default up to 10. */
    columns?: number;
    shape?: "circle" | "square" | "person";
    /** Size of a mark, in px. */
    size?: number;
    /** Any CSS colour for the filled marks; by default the accent. */
    color?: string;
    /** Shows the count and the label under the grid. */
    showSummary?: boolean;
    /** "{n} of {total}". */
    countLabel?: string;
    /** Your own mark, drawn inside a 24×24 viewBox. */
    icon?: Snippet<[{ filled: boolean; index: number }]>;
    class?: string;
    /** Any other attribute goes to the root element. */
    [key: string]: unknown;
  }

  const {
    value,
    total = 10,
    label,
    columns,
    shape = "circle",
    size = 22,
    color,
    showSummary = true,
    countLabel = L.countOf,
    icon,
    class: className = "",
    ...rest
  }: Props = $props();

  const count = $derived(Math.max(0, Math.min(1000, Math.round(Number.isFinite(total) ? total : 0))));
  const filled = $derived(Math.max(0, Math.min(count, Math.round(Number.isFinite(value) ? value : 0))));
  const perRow = $derived(Math.max(1, columns ?? Math.min(10, count)));
  const summary = $derived(fill(countLabel, { n: filled, total: count }));
  const PERSON = "M12 3.2a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6zM5.5 21v-4.8a5 5 0 0 1 5-5h3a5 5 0 0 1 5 5V21z";
</script>

<div {...rest} class={cn("ta-iconarray", className)} style:--ta-iconarray-color={color}>
  <div
    class="ta-iconarray-grid"
    style:grid-template-columns={`repeat(${perRow}, minmax(0, ${size}px))`}
    role={showSummary ? undefined : "img"}
    aria-label={showSummary ? undefined : `${summary} ${label}`}
    aria-hidden={showSummary ? "true" : undefined}
  >
    {#each { length: count } as _, i (i)}
      <svg class="ta-iconarray-mark" class:ta-iconarray-mark--filled={i < filled} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        {#if icon}
          {@render icon({ filled: i < filled, index: i })}
        {:else if shape === "square"}
          <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
        {:else if shape === "person"}
          <path d={PERSON} />
        {:else}
          <circle cx="12" cy="12" r="8.5" />
        {/if}
      </svg>
    {/each}
  </div>
  {#if showSummary}
    <p class="ta-iconarray-summary"><strong>{summary}</strong> {label}</p>
  {/if}
</div>

<style>
  .ta-iconarray { display: flex; flex-direction: column; gap: 0.625rem; min-width: 0; color: rgb(var(--ta-text)); }
  .ta-iconarray-grid { display: grid; gap: 0.25rem; max-width: 100%; }

  /* Empty marks are hollow outlines, filled ones solid: the difference is not the hue. */
  /* The marks shrink together when the row does not fit. */
  .ta-iconarray-mark { display: block; width: 100%; height: auto; fill: none; stroke: rgb(var(--ta-subtle)); stroke-width: 1.5; stroke-linejoin: round; color: rgb(var(--ta-subtle)); }
  .ta-iconarray-mark--filled { fill: var(--ta-iconarray-color, rgb(var(--ta-accent))); stroke: var(--ta-iconarray-color, rgb(var(--ta-accent))); color: var(--ta-iconarray-color, rgb(var(--ta-accent))); }

  .ta-iconarray-summary { margin: 0; font-size: 0.875rem; color: rgb(var(--ta-text-dim)); }
  .ta-iconarray-summary strong { color: rgb(var(--ta-text)); font-variant-numeric: tabular-nums; }
</style>
