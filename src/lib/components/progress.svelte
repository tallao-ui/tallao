<!--
  tallao — Progress
  Barra de progreso (role="progressbar"). Sin `value` es indeterminada: algo
  está en marcha y no se sabe cuánto falta. Necesita `label` (su nombre).
-->
<script lang="ts">
  import { cn } from "$lib/utils";

  const {
    value,
    max = 100,
    label,
    /** Texto que lee un lector en vez del porcentaje (p. ej. «3 de 8 tareas»). */
    valueText,
    showValue = false,
    variant = "default",
    class: className = "",
  }: {
    value?: number | null;
    max?: number;
    label: string;
    valueText?: string;
    showValue?: boolean;
    variant?: "default" | "success" | "warning" | "error";
    class?: string;
  } = $props();

  const determinada = $derived(typeof value === "number" && Number.isFinite(value));
  const pct = $derived(determinada ? Math.min(100, Math.max(0, ((value as number) / max) * 100)) : 0);
</script>

<div class={cn("ta-progress", `ta-progress--${variant}`, className)}>
  <div class="ta-progress-cabecera">
    <span class="ta-progress-etiqueta">{label}</span>
    {#if showValue && determinada}<span class="ta-progress-valor">{valueText ?? `${Math.round(pct)}%`}</span>{/if}
  </div>
  <div
    class="ta-progress-pista"
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={max}
    aria-valuenow={determinada ? value : undefined}
    aria-valuetext={determinada ? valueText : undefined}
  >
    <div class="ta-progress-barra" class:ta-progress-barra--indeterminada={!determinada} style:width={determinada ? `${pct}%` : undefined}></div>
  </div>
</div>

<style>
  .ta-progress { display: flex; flex-direction: column; gap: 0.375rem; }

  .ta-progress-cabecera {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: rgb(var(--ta-text-dim));
  }
  .ta-progress-valor { font-variant-numeric: tabular-nums; }

  .ta-progress-pista {
    height: 0.5rem;
    overflow: hidden;
    border-radius: 9999px;
    background: rgb(var(--ta-elevated));
  }

  .ta-progress-barra {
    height: 100%;
    border-radius: inherit;
    background: rgb(var(--ta-accent));
    transition: width 0.25s ease;
  }
  .ta-progress--success .ta-progress-barra { background: rgb(var(--ta-success)); }
  .ta-progress--warning .ta-progress-barra { background: rgb(var(--ta-warning)); }
  .ta-progress--error .ta-progress-barra { background: rgb(var(--ta-danger)); }

  .ta-progress-barra--indeterminada {
    width: 35%;
    animation: ta-progress-vaiven 1.2s ease-in-out infinite;
  }

  @keyframes ta-progress-vaiven {
    from { transform: translateX(-100%); }
    to { transform: translateX(300%); }
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-progress-barra { transition: none; }
    .ta-progress-barra--indeterminada { animation: none; width: 100%; opacity: 0.5; }
  }
</style>
