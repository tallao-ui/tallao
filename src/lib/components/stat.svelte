<!--
  tallao — Stat
  A figure with its label, for rows of totals.
  - `rolling` (a number `value` only): the digits roll to each new value with RollingCounter, for a
    reading that keeps changing (a queue, people online). A screen reader gets the formatted
    number; reduced motion makes the wheels jump. `locale` and `format` format it.
-->
<script lang="ts">
  import { cn } from "$lib/utils";
  import RollingCounter from "./rolling-counter.svelte";

  interface Props {
    label: string;
    value: string | number;
    variant?: "default" | "success" | "warning" | "error";
    /** A number `value` rolls to each new value (RollingCounter). */
    rolling?: boolean;
    locale?: string;
    /** Options for `Intl.NumberFormat` when `rolling`. */
    format?: Intl.NumberFormatOptions;
    class?: string;
  }

  const { label, value, variant = "default", rolling = false, locale, format, class: className = "" }: Props = $props();
</script>

<div class={cn("ta-stat", `ta-stat--${variant}`, className)}>
  <span class="ta-stat-label">{label}</span>
  <span class="ta-stat-value">{#if rolling && typeof value === "number"}<RollingCounter {value} {locale} {format} />{:else}{value}{/if}</span>
</div>

<style>
  .ta-stat {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.75rem 1rem;
    background: rgb(var(--ta-surface) / 0.5);
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    min-width: 0;
  }

  .ta-stat-label {
    font-size: 0.75rem;
    color: rgb(var(--ta-text-dim));
  }

  .ta-stat-value {
    font-size: 1.375rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: rgb(var(--ta-text));
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* The wheels take the figure's size and its variant's colour. */
  .ta-stat-value :global(.ta-roll) {
    font-size: inherit;
    letter-spacing: inherit;
    color: inherit;
  }

  .ta-stat--success .ta-stat-value { color: rgb(var(--ta-success)); }
  .ta-stat--warning .ta-stat-value { color: rgb(var(--ta-warning)); }
  .ta-stat--error .ta-stat-value { color: rgb(var(--ta-danger)); }
</style>
