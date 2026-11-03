<!--
  tallao — Dialog
  Diálogo modal con backdrop, Escape, cierre por fondo y retorno de foco.
-->
<script lang="ts">
  import { cn } from "$lib/utils";

  interface Props {
    open?: boolean;
    title?: string;
    description?: string;
    size?: "sm" | "md" | "lg" | "xl" | "2xl";
    showClose?: boolean;
    /** Nombre accesible del botón de cerrar. */
    closeLabel?: string;
    onClose?: () => void;
    onOpenChange?: (v: boolean) => void;
    children?: import("svelte").Snippet;
    footer?: import("svelte").Snippet;
  }

  let {
    open = $bindable(false),
    title = "",
    description,
    size = "md",
    showClose = true,
    closeLabel = "Cerrar diálogo",
    onClose,
    onOpenChange,
    children,
    footer,
  }: Props = $props();

  let elementoPrevio: Element | null = null;
  let panel: HTMLElement | undefined = $state();

  const tamanos = {
    sm: "max-width: 24rem",
    md: "max-width: 28rem",
    lg: "max-width: 32rem",
    xl: "max-width: 36rem",
    "2xl": "max-width: 48rem",
  };

  function cerrar() {
    open = false;
    onOpenChange?.(false);
    onClose?.();
  }

  function alAbrir() {
    if (!open) return;
    elementoPrevio = document.activeElement;
    // Enfocar el panel (o su primer control) para lectores de pantalla.
    panel?.querySelector<HTMLElement>("button, [href], input, [tabindex]")?.focus() ??
      panel?.focus();
  }

  function alCerrar() {
    (elementoPrevio as HTMLElement | null)?.focus?.();
  }

  function fondoClick(e: MouseEvent) {
    if (e.target === e.currentTarget) cerrar();
  }

  function tecla(e: KeyboardEvent) {
    if (e.key === "Escape") cerrar();
  }

  $effect(() => {
    if (open) alAbrir();
    else alCerrar();
  });
</script>

<svelte:window onkeydown={tecla} />

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="ta-dialog-fondo"
    onclick={fondoClick}
    role="presentation"
  >
    <div
      bind:this={panel}
      role="dialog"
      aria-modal="true"
      aria-label={title || undefined}
      tabindex="-1"
      class="ta-dialog"
      style={tamanos[size]}
    >
      {#if title}
        <div class="ta-dialog-cabecera">
          <div>
            <h3 class="ta-dialog-titulo">{title}</h3>
            {#if description}
              <p class="ta-dialog-descripcion">{description}</p>
            {/if}
          </div>
          {#if showClose}
            <button class="ta-dialog-cerrar" onclick={cerrar} aria-label={closeLabel}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          {/if}
        </div>
      {/if}

      <div class="ta-dialog-cuerpo">
        {@render children?.()}
      </div>

      {#if footer}
        <div class="ta-dialog-pie">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .ta-dialog-fondo {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: rgb(var(--ta-backdrop) / 0.7);
    backdrop-filter: blur(4px);
  }

  .ta-dialog {
    width: 100%;
    /* Un formulario largo hace scroll dentro; cabecera y pie quedan a la vista. */
    max-height: calc(100vh - 2rem);
    display: flex;
    flex-direction: column;
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5);
    animation: ta-dialog-aparece 0.15s ease-out;
    outline: none;
  }

  @keyframes ta-dialog-aparece {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  .ta-dialog-cabecera {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgb(var(--ta-border));
  }

  .ta-dialog-titulo {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: rgb(var(--ta-text));
  }

  .ta-dialog-descripcion {
    margin: 0.25rem 0 0;
    font-size: 0.875rem;
    color: rgb(var(--ta-text-dim));
  }

  .ta-dialog-cerrar {
    padding: 0.25rem;
    background: none;
    border: none;
    color: rgb(var(--ta-text-dim));
    cursor: pointer;
    border-radius: var(--ta-radius-sm);
    transition: color 0.2s;
  }
  .ta-dialog-cerrar:hover { color: rgb(var(--ta-text)); }

  .ta-dialog-cuerpo { padding: 1rem 1.5rem; overflow-y: auto; }

  .ta-dialog-pie {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid rgb(var(--ta-border));
  }
</style>
