<!--
  tallao — Alert
  Aviso en línea: resultado de una acción, error de la API, estado de un dato.
  Con `onDismiss` lleva botón de cerrar.
-->
<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  interface Props {
    variant?: "info" | "success" | "warning" | "error";
    title?: string;
    onDismiss?: () => void;
    dismissLabel?: string;
    class?: string;
    children?: import("svelte").Snippet;
  }

  const L = useLabels();
  const {
    variant = "info",
    title,
    onDismiss,
    dismissLabel = L.dismiss,
    class: className = "",
    children,
  }: Props = $props();
</script>

<div
  class={cn("ta-alert", `ta-alert--${variant}`, className)}
  role={variant === "error" ? "alert" : "status"}
>
  <div class="ta-alert-cuerpo">
    {#if title}<strong class="ta-alert-titulo">{title}</strong>{/if}
    {@render children?.()}
  </div>
  {#if onDismiss}
    <button type="button" class="ta-alert-cerrar" onclick={onDismiss} aria-label={dismissLabel}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    </button>
  {/if}
</div>

<style>
  .ta-alert {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
    border: 1px solid;
    border-radius: var(--ta-radius);
  }

  .ta-alert-cuerpo {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    color: rgb(var(--ta-text));
  }

  .ta-alert-titulo { font-weight: 600; }

  .ta-alert--info { background: rgb(var(--ta-info) / 0.08); border-color: rgb(var(--ta-info) / 0.3); }
  .ta-alert--success { background: rgb(var(--ta-success) / 0.08); border-color: rgb(var(--ta-success) / 0.3); }
  .ta-alert--warning { background: rgb(var(--ta-warning) / 0.08); border-color: rgb(var(--ta-warning) / 0.3); }
  .ta-alert--error { background: rgb(var(--ta-danger) / 0.08); border-color: rgb(var(--ta-danger) / 0.35); }

  .ta-alert--info .ta-alert-titulo { color: rgb(var(--ta-info)); }
  .ta-alert--success .ta-alert-titulo { color: rgb(var(--ta-success)); }
  .ta-alert--warning .ta-alert-titulo { color: rgb(var(--ta-warning)); }
  .ta-alert--error .ta-alert-titulo { color: rgb(var(--ta-danger)); }

  .ta-alert-cerrar {
    padding: 0.125rem;
    background: none;
    border: none;
    color: rgb(var(--ta-text-dim));
    cursor: pointer;
    border-radius: var(--ta-radius-sm);
  }
  .ta-alert-cerrar:hover { color: rgb(var(--ta-text)); }
</style>
