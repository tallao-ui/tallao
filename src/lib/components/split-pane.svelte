<!--
  tallao — SplitPane
  Dos paneles con un separador que se arrastra (editor y vista previa, lista y
  detalle). El separador es accesible (role="separator" del patrón «window
  splitter» de la WAI-ARIA APG): recibe el foco, las flechas mueven `step`, Inicio
  y Fin van al mínimo y al máximo, y Enter alterna entre plegar el primer panel y
  su último tamaño. `size` es el porcentaje del primer panel.
-->
<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  const L = useLabels();
  let {
    size = $bindable(50),
    min = 15,
    max = 85,
    step = 5,
    orientation = "horizontal",
    label = L.resize,
    class: className = "",
    first,
    second,
    onresize,
  }: {
    size?: number;
    min?: number;
    max?: number;
    step?: number;
    /** horizontal: paneles lado a lado; vertical: uno encima del otro. */
    orientation?: "horizontal" | "vertical";
    /** Nombre accesible del separador. */
    label?: string;
    class?: string;
    first: import("svelte").Snippet;
    second: import("svelte").Snippet;
    onresize?: (size: number) => void;
  } = $props();

  const id = $props.id();
  let caja: HTMLElement | undefined = $state();
  let anterior = 50;

  function poner(v: number) {
    const n = Math.round(Math.min(max, Math.max(min, v)) * 10) / 10;
    if (n === size) return;
    size = n;
    onresize?.(n);
  }

  function tecla(e: KeyboardEvent) {
    const menos = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
    const mas = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
    if (e.key === menos) poner(size - step);
    else if (e.key === mas) poner(size + step);
    else if (e.key === "Home") poner(min);
    else if (e.key === "End") poner(max);
    else if (e.key === "Enter") {
      if (size > min) {
        anterior = size;
        poner(min);
      } else poner(anterior);
    } else return;
    e.preventDefault();
  }

  function arrastrar(e: PointerEvent) {
    if (!caja || e.button !== 0) return;
    const separador = e.currentTarget as HTMLElement;
    separador.setPointerCapture?.(e.pointerId);
    const r = caja.getBoundingClientRect();
    const mover = (ev: PointerEvent) => {
      const pct =
        orientation === "horizontal" ? ((ev.clientX - r.left) / r.width) * 100 : ((ev.clientY - r.top) / r.height) * 100;
      if (Number.isFinite(pct)) poner(pct);
    };
    const soltar = () => {
      separador.removeEventListener("pointermove", mover);
      separador.removeEventListener("pointerup", soltar);
    };
    separador.addEventListener("pointermove", mover);
    separador.addEventListener("pointerup", soltar);
  }
</script>

<div
  bind:this={caja}
  class={cn("ta-split", `ta-split--${orientation}`, className)}
  style:--ta-split-size={`${size}%`}
>
  <div class="ta-split-panel" id={`${id}-primero`}>{@render first()}</div>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
  <div
    class="ta-split-separador"
    role="separator"
    tabindex="0"
    aria-label={label}
    aria-orientation={orientation === "horizontal" ? "vertical" : "horizontal"}
    aria-controls={`${id}-primero`}
    aria-valuenow={size}
    aria-valuemin={min}
    aria-valuemax={max}
    onkeydown={tecla}
    onpointerdown={arrastrar}
  ></div>
  <div class="ta-split-panel">{@render second()}</div>
</div>

<style>
  .ta-split {
    display: grid;
    width: 100%;
    height: 100%;
    min-height: 0;
  }
  .ta-split--horizontal { grid-template-columns: var(--ta-split-size) 6px minmax(0, 1fr); }
  .ta-split--vertical { grid-template-rows: var(--ta-split-size) 6px minmax(0, 1fr); }

  .ta-split-panel { min-width: 0; min-height: 0; overflow: auto; }

  .ta-split-separador {
    position: relative;
    background: transparent;
    touch-action: none;
    outline: none;
  }
  .ta-split--horizontal .ta-split-separador { cursor: col-resize; }
  .ta-split--vertical .ta-split-separador { cursor: row-resize; }

  /* La línea visible es fina; la zona que se agarra, los 6px. */
  .ta-split-separador::after {
    content: "";
    position: absolute;
    background: rgb(var(--ta-border));
    transition: background-color 0.15s;
  }
  .ta-split--horizontal .ta-split-separador::after { top: 0; bottom: 0; left: 2.5px; width: 1px; }
  .ta-split--vertical .ta-split-separador::after { left: 0; right: 0; top: 2.5px; height: 1px; }

  .ta-split-separador:hover::after,
  .ta-split-separador:focus-visible::after { background: rgb(var(--ta-accent)); }
  .ta-split--horizontal .ta-split-separador:focus-visible::after { left: 1.5px; width: 3px; }
  .ta-split--vertical .ta-split-separador:focus-visible::after { top: 1.5px; height: 3px; }
</style>
