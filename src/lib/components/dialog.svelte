<!--
  tallao — Dialog
  Diálogo modal sobre el <dialog> nativo con showModal(): el navegador deja
  inerte el resto de la página (el Tab no sale del diálogo), lo pone en la capa
  superior (sin peleas de z-index, también dentro de un Shadow DOM) y Escape
  cierra solo el de arriba. tallao añade bloqueo del scroll, cierre por fondo,
  foco inicial y retorno del foco al cerrar.
-->
<script lang="ts">
  import { untrack } from "svelte";

  import { cn } from "$lib/utils";
  import { devolverFoco, elementoActivo, tabulables } from "$lib/internal/focus";
  import { lockScroll } from "$lib/internal/scroll-lock";

  interface Props {
    open?: boolean;
    title?: string;
    description?: string;
    size?: "sm" | "md" | "lg" | "xl" | "2xl";
    showClose?: boolean;
    /** Nombre accesible del botón de cerrar. */
    closeLabel?: string;
    /** Nombre accesible cuando no hay `title`. */
    ariaLabel?: string;
    /** Nivel del encabezado del título (por defecto h2: el diálogo es su propio contexto). */
    titleLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Cerrar al pulsar fuera del panel (por defecto sí). */
    closeOnBackdrop?: boolean;
    class?: string;
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
    ariaLabel,
    titleLevel = 2,
    closeOnBackdrop = true,
    class: className = "",
    onClose,
    onOpenChange,
    children,
    footer,
  }: Props = $props();

  const id = $props.id();
  let dialogo: HTMLDialogElement | undefined = $state();
  let cuerpo: HTMLElement | undefined = $state();

  const anchos = { sm: "24rem", md: "28rem", lg: "32rem", xl: "36rem", "2xl": "48rem" };

  function cerrar() {
    if (!open) return;
    open = false;
    onOpenChange?.(false);
    onClose?.();
  }

  /** `autofocus` si lo hay; si no, el primer control del contenido; si no, el panel. */
  function enfocarInicio(d: HTMLDialogElement) {
    const marcado = d.querySelector<HTMLElement>("[autofocus]");
    const destino = marcado ?? (cuerpo && tabulables(cuerpo)[0]) ?? tabulables(d)[0] ?? d.querySelector<HTMLElement>(".ta-dialog");
    destino?.focus({ preventScroll: true });
  }

  $effect(() => {
    const d = dialogo;
    if (!d || !open) return;
    const previo = elementoActivo();
    if (!d.open) {
      if (typeof d.showModal === "function") d.showModal();
      else d.setAttribute("open", "");
    }
    const liberar = lockScroll();
    // Sin seguir dependencias: si `cuerpo` llega después, el efecto no debe reabrir.
    untrack(() => enfocarInicio(d));
    return () => {
      liberar();
      if (d.open) {
        if (typeof d.close === "function") d.close();
        else d.removeAttribute("open");
      }
      devolverFoco(previo);
    };
  });

  // Escape: el navegador lanza `cancel` en el diálogo de arriba. Se cancela su
  // cierre propio para que el estado (`open`) mande y el retorno de foco ocurra.
  function alCancelar(e: Event) {
    e.preventDefault();
    cerrar();
  }

  // Un clic en el propio <dialog> (fuera del panel) es un clic en el fondo.
  function alPulsar(e: MouseEvent) {
    if (closeOnBackdrop && e.target === e.currentTarget) cerrar();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialogo}
  class="ta-dialog-capa"
  aria-labelledby={title ? `${id}-titulo` : undefined}
  aria-describedby={title && description ? `${id}-descripcion` : undefined}
  aria-label={title ? undefined : ariaLabel}
  oncancel={alCancelar}
  onclose={cerrar}
  onclick={alPulsar}
>
  {#if open}
    <div class={cn("ta-dialog", className)} style:max-width={anchos[size]} tabindex="-1">
      {#if title}
        <div class="ta-dialog-cabecera">
          <div>
            <svelte:element this={`h${titleLevel}`} class="ta-dialog-titulo" id={`${id}-titulo`}>{title}</svelte:element>
            {#if description}
              <p class="ta-dialog-descripcion" id={`${id}-descripcion`}>{description}</p>
            {/if}
          </div>
          {#if showClose}
            <button type="button" class="ta-dialog-cerrar" onclick={cerrar} aria-label={closeLabel}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          {/if}
        </div>
      {/if}

      <div class="ta-dialog-cuerpo" bind:this={cuerpo}>
        {@render children?.()}
      </div>

      {#if footer}
        <div class="ta-dialog-pie">
          {@render footer()}
        </div>
      {/if}
    </div>
  {/if}
</dialog>

<style>
  /* El <dialog> ocupa toda la ventana y centra el panel; su ::backdrop es el fondo. */
  .ta-dialog-capa {
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: 1rem;
    border: none;
    background: transparent;
    color: inherit;
    overflow: hidden;
  }

  .ta-dialog-capa[open] {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ta-dialog-capa::backdrop {
    background: rgb(var(--ta-backdrop, 0 0 0) / 0.7);
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

  @media (prefers-reduced-motion: reduce) {
    .ta-dialog { animation: none; }
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
  .ta-dialog-cerrar:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: 2px; }

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
