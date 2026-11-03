<!--
  tallao — Tooltip
  Texto breve que describe un control, al pasar el ratón o al enfocarlo con el
  teclado (WCAG 1.4.13: se puede descartar con Escape, no tapa sin querer y no
  desaparece al pasar el ratón por encima). No lleva controles dentro: para eso
  está Popover. El texto queda enlazado al disparador con aria-describedby.

    <Tooltip text="Copiar enlace">
      {#snippet trigger(props)}<Button {...props} size="icon" ariaLabel="Copiar">⧉</Button>{/snippet}
    </Tooltip>
-->
<script lang="ts">
  import { createAttachmentKey } from "svelte/attachments";

  import { pushLayer } from "$lib/internal/layers";
  import { anchor, type Placement } from "$lib/internal/position";

  import type { TriggerProps } from "./popover.svelte";

  interface Props {
    text: string;
    placement?: Placement;
    /** Espera antes de mostrarse al pasar el ratón, en ms (el foco lo muestra al momento). */
    delay?: number;
    trigger: import("svelte").Snippet<[TriggerProps]>;
  }

  const { text, placement = "top", delay = 400, trigger }: Props = $props();

  const id = $props.id();
  let open = $state(false);
  let disparador: HTMLElement | null = $state(null);
  let burbuja: HTMLElement | undefined = $state();
  let espera: ReturnType<typeof setTimeout> | undefined;
  let cierre: ReturnType<typeof setTimeout> | undefined;

  function mostrar(retraso: number) {
    clearTimeout(cierre);
    clearTimeout(espera);
    espera = setTimeout(() => (open = true), retraso);
  }

  // Un margen corto para poder pasar el ratón del disparador a la burbuja.
  function ocultar() {
    clearTimeout(espera);
    cierre = setTimeout(() => (open = false), 100);
  }

  const triggerProps = $derived({
    "aria-describedby": `${id}-tooltip`,
    onpointerenter: () => mostrar(delay),
    onpointerleave: ocultar,
    onfocus: () => mostrar(0),
    onblur: ocultar,
    [createAttachmentKey()]: (nodo: HTMLElement) => {
      disparador = nodo;
      return () => {
        if (disparador === nodo) disparador = null;
        clearTimeout(espera);
        clearTimeout(cierre);
      };
    },
  });

  $effect(() => {
    const b = burbuja;
    const a = disparador;
    if (!open || !b || !a) return;
    const soltar = anchor(a, b, { placement, gap: 8 });
    // Escape la descarta; un clic fuera no la toca (no es una capa interactiva).
    const quitar = pushLayer({ inside: () => [a, b], dismiss: () => (open = false), escapeOnly: true });
    return () => {
      quitar();
      soltar();
    };
  });
</script>

{@render trigger(triggerProps)}

<!-- Siempre en el DOM (oculta) para que aria-describedby apunte a algo real. -->
<div
  bind:this={burbuja}
  id={`${id}-tooltip`}
  role="tooltip"
  popover="manual"
  class="ta-tooltip"
  class:ta-tooltip--abierto={open}
  onpointerenter={() => clearTimeout(cierre)}
  onpointerleave={ocultar}
>
  {text}
</div>

<style>
  .ta-tooltip {
    position: fixed;
    inset: auto;
    margin: 0;
    z-index: 60;
    display: none;
    max-width: 18rem;
    padding: 0.3rem 0.55rem;
    font: inherit;
    font-size: 0.75rem;
    line-height: 1.4;
    color: rgb(var(--ta-bg));
    background: rgb(var(--ta-text));
    border: none;
    border-radius: var(--ta-radius-sm);
    box-shadow: 0 6px 16px -6px rgb(0 0 0 / 0.5);
    overflow: visible;
  }

  .ta-tooltip--abierto {
    display: block;
  }
</style>
