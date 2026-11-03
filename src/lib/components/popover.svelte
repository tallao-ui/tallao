<!--
  tallao — Popover
  Panel flotante anclado a un disparador: filtros, ajustes rápidos, un
  formulario corto. No es modal: el resto de la página sigue usable; Escape o un
  clic fuera lo cierran y el foco vuelve al disparador.

  El disparador lo pone quien lo usa, con las props que recibe el snippet:

    <Popover title="Filtros">
      {#snippet trigger(props)}<Button {...props}>Filtros</Button>{/snippet}
      …contenido…
    </Popover>
-->
<script lang="ts" module>
  export type TriggerProps = Record<string | symbol, unknown>;
</script>

<script lang="ts">
  import { untrack } from "svelte";
  import { createAttachmentKey } from "svelte/attachments";

  import { cn } from "$lib/utils";
  import { devolverFoco, elementoActivo, tabulables } from "$lib/internal/focus";
  import { pushLayer } from "$lib/internal/layers";
  import { anchor, type Placement } from "$lib/internal/position";

  interface Props {
    open?: boolean;
    placement?: Placement;
    /** Título del panel: también es su nombre accesible. */
    title?: string;
    /** Nombre accesible si no hay `title`. */
    ariaLabel?: string;
    class?: string;
    onOpenChange?: (open: boolean) => void;
    trigger: import("svelte").Snippet<[TriggerProps]>;
    children?: import("svelte").Snippet;
  }

  let {
    open = $bindable(false),
    placement = "bottom-start",
    title,
    ariaLabel,
    class: className = "",
    onOpenChange,
    trigger,
    children,
  }: Props = $props();

  const id = $props.id();
  let disparador: HTMLElement | null = $state(null);
  let panel: HTMLElement | undefined = $state();

  function poner(valor: boolean) {
    if (open === valor) return;
    open = valor;
    onOpenChange?.(valor);
  }

  const triggerProps = $derived({
    "aria-haspopup": "dialog",
    "aria-expanded": open,
    "aria-controls": open ? `${id}-panel` : undefined,
    onclick: () => poner(!open),
    [createAttachmentKey()]: (nodo: HTMLElement) => {
      disparador = nodo;
      return () => {
        if (disparador === nodo) disparador = null;
      };
    },
  });

  $effect(() => {
    const p = panel;
    const a = disparador;
    if (!open || !p || !a) return;
    const previo = elementoActivo();
    const soltar = anchor(a, p, { placement });
    const quitar = pushLayer({
      inside: () => [p, a],
      dismiss: (motivo) => {
        poner(false);
        if (motivo === "escape") devolverFoco(a);
      },
    });
    // El foco entra al primer control del panel (o al panel), sin seguir dependencias.
    untrack(() => (tabulables(p)[0] ?? p).focus({ preventScroll: true }));
    return () => {
      quitar();
      soltar();
      // Si el foco seguía dentro, vuelve al disparador; si el usuario ya se fue a otro sitio, no.
      if (p.contains(elementoActivo())) devolverFoco(previo === a ? a : previo);
    };
  });
</script>

{@render trigger(triggerProps)}

{#if open}
  <div
    bind:this={panel}
    id={`${id}-panel`}
    popover="manual"
    role="dialog"
    tabindex="-1"
    aria-labelledby={title ? `${id}-titulo` : undefined}
    aria-label={title ? undefined : ariaLabel}
    class={cn("ta-popover", className)}
  >
    {#if title}<p class="ta-popover-titulo" id={`${id}-titulo`}>{title}</p>{/if}
    {@render children?.()}
  </div>
{/if}

<style>
  .ta-popover {
    position: fixed;
    inset: auto;
    margin: 0;
    z-index: 50;
    min-width: 12rem;
    max-width: min(24rem, calc(100vw - 1rem));
    padding: 0.75rem 1rem;
    overflow: visible;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    box-shadow: 0 12px 32px -8px rgb(0 0 0 / 0.45);
    font: inherit;
    outline: none;
    animation: ta-popover-aparece 0.12s ease-out;
  }

  .ta-popover-titulo {
    margin: 0 0 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
  }

  @keyframes ta-popover-aparece {
    from { opacity: 0; transform: translateY(-2px); }
    to { opacity: 1; transform: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-popover { animation: none; }
  }
</style>
