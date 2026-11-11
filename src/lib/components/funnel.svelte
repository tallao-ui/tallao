<!--
  tallao — Funnel
  How many make it through each step of a sequence (visited → signed up → played a match →
  came back). An ordered list named by `title`: every step prints its label, its value,
  its share of the first step and, from the second on, how much of the previous step it
  kept, all in text; the bars (centred, or `align="left"`) only draw the same numbers.
  Not interactive; same HTML on the server; with no steps it shows a labelled empty state.
  `data` is plain JSON, in order: `[{ "label": "Visited", "value": 12000 }, { "label": "Signed up", "value": 4200 }]`.
-->
<script lang="ts" module>
  export interface FunnelStep {
    label: string;
    value: number;
  }
</script>

<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { compactNumber, fill, finite, percentOf, seriesColor } from "$lib/internal/chart";
  import { cn } from "$lib/utils";

  const L = useLabels();

  interface Props {
    data: FunnelStep[];
    /** What the funnel shows: its caption and the list's accessible name. */
    title: string;
    /** Keeps the title for screen readers only (inside a ChartCard that already shows it). */
    hideTitle?: boolean;
    /** Bars centred (the funnel shape) or starting at the left edge. */
    align?: "center" | "left";
    /** Any CSS colour for the bars; by default the first series colour. */
    color?: string;
    locale?: string;
    /** Format of the values. */
    format?: (n: number) => string;
    /** "{percent} of the previous step". */
    stepLabel?: string;
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
    align = "center",
    color,
    locale,
    format = (n: number) => compactNumber(n, locale),
    stepLabel = L.ofPreviousStep,
    emptyText = L.noData,
    class: className = "",
    ...rest
  }: Props = $props();

  const id = $props.id();
  const steps = $derived(data.filter((d) => finite(d.value) != null && d.value >= 0));
  const first = $derived(steps[0]?.value ?? 0);
  const widest = $derived(Math.max(0, ...steps.map((s) => s.value)));
</script>

<figure {...rest} class={cn("ta-funnel", `ta-funnel--${align}`, className)} style:--ta-funnel-color={color ?? seriesColor(0)}>
  <figcaption class={cn("ta-funnel-title", hideTitle && "ta-funnel-hidden")} id={`${id}-title`}>{title}</figcaption>
  {#if steps.length === 0}
    <p class="ta-funnel-empty">{emptyText}</p>
  {:else}
    <ol class="ta-funnel-steps" aria-labelledby={`${id}-title`}>
      {#each steps as step, i (i)}
        <li class="ta-funnel-step">
          <div class="ta-funnel-head">
            <span class="ta-funnel-label">{step.label}</span>
            <span class="ta-funnel-figures">
              <strong>{format(step.value)}</strong>
              <span class="ta-funnel-share">{percentOf(step.value, first, locale)}</span>
            </span>
          </div>
          <div class="ta-funnel-track" aria-hidden="true">
            <span class="ta-funnel-bar" style:width={`${widest > 0 ? Math.max(1, (step.value / widest) * 100) : 1}%`}></span>
          </div>
          {#if i > 0}
            <span class="ta-funnel-kept">{fill(stepLabel, { percent: percentOf(step.value, steps[i - 1].value, locale) })}</span>
          {/if}
        </li>
      {/each}
    </ol>
  {/if}
</figure>

<style>
  .ta-funnel { margin: 0; display: flex; flex-direction: column; gap: 0.625rem; min-width: 0; color: rgb(var(--ta-text)); }
  .ta-funnel-title { font-size: 0.875rem; font-weight: 600; }
  .ta-funnel-empty { margin: 0; padding: 2rem 1rem; text-align: center; font-size: 0.8125rem; color: rgb(var(--ta-text-dim)); border: 1px dashed rgb(var(--ta-border)); border-radius: var(--ta-radius); }

  .ta-funnel-steps { display: flex; flex-direction: column; gap: 0.625rem; margin: 0; padding: 0; list-style: none; }
  .ta-funnel-step { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; font-size: 0.8125rem; }
  .ta-funnel-head { display: flex; align-items: baseline; justify-content: space-between; gap: 0.75rem; }
  .ta-funnel-label { min-width: 0; font-weight: 500; overflow-wrap: anywhere; }
  .ta-funnel-figures { display: inline-flex; align-items: baseline; gap: 0.5rem; flex-shrink: 0; font-variant-numeric: tabular-nums; }
  .ta-funnel-share { min-width: 3rem; text-align: right; color: rgb(var(--ta-text-dim)); }

  .ta-funnel-track { display: flex; height: 1.5rem; border-radius: var(--ta-radius-sm); background: rgb(var(--ta-elevated) / 0.5); }
  .ta-funnel--center .ta-funnel-track { justify-content: center; }
  .ta-funnel-bar { display: block; height: 100%; min-width: 3px; border-radius: var(--ta-radius-sm); background: var(--ta-funnel-color); }
  .ta-funnel-kept { font-size: 0.6875rem; color: rgb(var(--ta-text-dim)); }
  .ta-funnel--center .ta-funnel-kept { text-align: center; }

  .ta-funnel-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
</style>
