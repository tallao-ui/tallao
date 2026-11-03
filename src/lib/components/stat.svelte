<!--
  tallao — Stat
  Una cifra con su etiqueta, para filas de totales.
-->
<script lang="ts">
  import { cn } from "$lib/utils";

  interface Props {
    label: string;
    value: string | number;
    variant?: "default" | "success" | "warning" | "error";
    class?: string;
  }

  const { label, value, variant = "default", class: className = "" }: Props = $props();
</script>

<div class={cn("ta-stat", `ta-stat--${variant}`, className)}>
  <span class="ta-stat-etiqueta">{label}</span>
  <span class="ta-stat-valor">{value}</span>
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

  .ta-stat-etiqueta {
    font-size: 0.75rem;
    color: rgb(var(--ta-text-dim));
  }

  .ta-stat-valor {
    font-size: 1.375rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: rgb(var(--ta-text));
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ta-stat--success .ta-stat-valor { color: rgb(var(--ta-success)); }
  .ta-stat--warning .ta-stat-valor { color: rgb(var(--ta-warning)); }
  .ta-stat--error .ta-stat-valor { color: rgb(var(--ta-danger)); }
</style>
