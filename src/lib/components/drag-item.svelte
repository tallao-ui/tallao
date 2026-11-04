<!--
  tallao — DragItem
  Un elemento que se mueve entre las DropZone de un DragBoard. Es un botón
  conmutable (`aria-pressed` = elegido) que además se arrastra:
    - clic: lo elige o suelta la elección;
    - arrastrar: lo lleva a otra zona;
    - Enter o Espacio: lo coge; ↑ ↓ ← → eligen la zona; Enter o Espacio lo deja;
      Escape cancela.
  Mientras se mueve con el teclado lleva `data-grabbed`.
-->
<script lang="ts">
  import { useDragBoard } from "$lib/internal/drag-board";
  import { cn } from "$lib/utils";

  interface Props {
    id: string;
    /** Nombre del elemento en los avisos del tablero. */
    label: string;
    /** Id de la DropZone en la que está ahora. */
    zone: string;
    disabled?: boolean;
    title?: string;
    class?: string;
    children?: import("svelte").Snippet;
    /** Otros atributos (data-*, aria-label…) van al elemento. */
    [key: string]: unknown;
  }

  const {
    id,
    label,
    zone,
    disabled = false,
    title,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const tablero = useDragBoard();
  const ref = $derived({ id, label, zone });
  const elegido = $derived(tablero.selected === id);
  const cogido = $derived(elegido && tablero.target !== null);

  function teclas(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      tablero.press(ref);
    } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      if (tablero.step(ref, 1)) e.preventDefault();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      if (tablero.step(ref, -1)) e.preventDefault();
    } else if (e.key === "Escape") {
      // Solo se lo queda si había algo que cancelar: si no, Escape sigue su camino.
      if (elegido && tablero.cancel()) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }
</script>

<div
  {...rest}
  role="button"
  tabindex={disabled ? -1 : 0}
  aria-pressed={elegido}
  aria-disabled={disabled ? "true" : undefined}
  aria-describedby={tablero.instructionsId}
  draggable={!disabled}
  {title}
  class={cn("ta-drag-item", elegido && "ta-drag-item--elegido", className)}
  data-ta-drag-item={id}
  data-grabbed={cogido ? "true" : undefined}
  onclick={() => !disabled && tablero.toggle(ref)}
  onkeydown={teclas}
  onblur={() => tablero.leave(ref)}
  ondragstart={(e) => (disabled ? e.preventDefault() : tablero.dragStart(ref, e))}
  ondragend={() => tablero.dragEnd()}
>
  {@render children?.()}
</div>

<style>
  .ta-drag-item {
    cursor: grab;
    outline: none;
    border-radius: var(--ta-radius-sm);
  }

  .ta-drag-item:focus-visible {
    box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.6);
  }

  .ta-drag-item--elegido {
    box-shadow: 0 0 0 1px rgb(var(--ta-accent));
  }

  .ta-drag-item[data-grabbed] {
    box-shadow: 0 0 0 2px rgb(var(--ta-accent));
    cursor: grabbing;
  }

  .ta-drag-item[aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
