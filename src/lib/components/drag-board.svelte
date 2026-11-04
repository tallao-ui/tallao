<!--
  tallao — DragBoard
  Mover elementos entre zonas (filas de una tier list, columnas de un tablero…)
  con el ratón Y con el teclado. Envuelve DropZone y DragItem:

    <DragBoard bind:selected onMove={(item, zone) => mover(item, zone)}>
      {#each filas as f (f.id)}
        <DropZone id={f.id} label={f.nombre}>
          {#each f.cosas as c (c.id)}
            <DragItem id={c.id} label={c.nombre} zone={f.id}>{c.nombre}</DragItem>
          {/each}
        </DropZone>
      {/each}
    </DragBoard>

  - Ratón: arrastrar un elemento a otra zona.
  - Clic: elige el elemento (`selected`); quien usa el tablero decide qué hace
    con él (p. ej. un botón por zona que lo coloca ahí, o «borrar»).
  - Teclado: Enter o Espacio lo coge, ↑ ↓ (o ← →) recorren las zonas en el
    orden en que se ven, Enter o Espacio lo deja y Escape cancela. Cada paso se
    anuncia en una región `aria-live`; las instrucciones van en un texto oculto
    que cada elemento enlaza con `aria-describedby`.

  `onMove` solo llega cuando la zona cambia. El tablero no reordena nada: pinta
  quien lo usa, con sus datos. Tras moverlo con el teclado, el foco sigue al
  elemento a su nueva zona.
-->
<script lang="ts" module>
  export interface DragAnnouncements {
    picked: (item: string, zone: string) => string;
    over: (item: string, zone: string) => string;
    moved: (item: string, zone: string) => string;
    cancelled: (item: string) => string;
  }
</script>

<script lang="ts">
  import { tick } from "svelte";

  import { provideDragBoard, type DragRef } from "$lib/internal/drag-board";
  import { cn } from "$lib/utils";

  interface Props {
    /** Elemento elegido; null si no hay ninguno. */
    selected?: string | null;
    /** El elemento `item` pasa a la zona `zone` (distinta de la suya). */
    onMove: (item: string, zone: string) => void | Promise<void>;
    /** Instrucciones de teclado que oye un lector de pantalla al llegar a un elemento. */
    instructions?: string;
    /** Avisos de cada paso; los que falten van en inglés. */
    announcements?: Partial<DragAnnouncements>;
    class?: string;
    children?: import("svelte").Snippet;
  }

  const defecto: DragAnnouncements = {
    picked: (item, zone) => `Picked up ${item}, in ${zone}.`,
    over: (item, zone) => `${item} over ${zone}.`,
    moved: (item, zone) => `${item} moved to ${zone}.`,
    cancelled: (item) => `${item} was not moved.`,
  };

  let {
    selected = $bindable(null),
    onMove,
    instructions = "Press Space or Enter to pick up. Use the arrow keys to choose where it goes, then Space or Enter to drop it. Escape cancels.",
    announcements,
    class: className = "",
    children,
  }: Props = $props();

  const id = $props.id();
  const textos = $derived({ ...defecto, ...announcements });

  let raiz: HTMLElement | undefined = $state();
  let destino = $state<string | null>(null);
  let arrastrando = $state<DragRef | null>(null);
  let aviso = $state("");
  /** El último elemento elegido, para nombrarlo al cancelar. */
  let elegido: DragRef | null = null;

  /** Las zonas de ESTE tablero (no las de uno anidado), en orden de documento. */
  function zonas(): { id: string; label: string }[] {
    if (!raiz) return [];
    return [...raiz.querySelectorAll<HTMLElement>("[data-ta-drop-zone]")]
      .filter((el) => el.closest("[data-ta-drag-board]") === raiz)
      .map((el) => ({ id: el.dataset.taDropZone ?? "", label: el.getAttribute("aria-label") ?? "" }));
  }

  const nombreDeZona = (zona: string) => zonas().find((z) => z.id === zona)?.label ?? zona;

  function avisar(texto: string) {
    // Vaciar antes: el mismo texto dos veces seguidas no se volvería a leer.
    aviso = "";
    queueMicrotask(() => (aviso = texto));
  }

  function coger(item: DragRef) {
    selected = item.id;
    elegido = item;
    destino = item.zone;
    avisar(textos.picked(item.label, nombreDeZona(item.zone)));
  }

  async function llevar(item: DragRef, zona: string) {
    selected = null;
    destino = null;
    elegido = null;
    const hecho = onMove(item.id, zona);
    avisar(textos.moved(item.label, nombreDeZona(zona)));
    // El elemento se pinta en otra zona (otro nodo): el foco va tras él.
    await tick();
    const nodo = [...(raiz?.querySelectorAll<HTMLElement>("[data-ta-drag-item]") ?? [])].find(
      (el) => el.dataset.taDragItem === item.id
    );
    nodo?.focus({ preventScroll: true });
    await hecho;
  }

  function cancelar(): boolean {
    if (selected === null) return false;
    const item = elegido;
    selected = null;
    destino = null;
    elegido = null;
    if (item) avisar(textos.cancelled(item.label));
    return true;
  }

  provideDragBoard({
    get selected() {
      return selected;
    },
    get target() {
      // Si quien usa el tablero suelta la elección (`selected = null`), deja de apuntar.
      return selected === null ? null : destino;
    },
    get dragging() {
      return arrastrando;
    },
    instructionsId: `${id}-instrucciones`,
    toggle(item) {
      destino = null;
      if (selected === item.id) {
        selected = null;
        elegido = null;
      } else {
        selected = item.id;
        elegido = item;
      }
    },
    press(item) {
      if (selected !== item.id || destino === null) coger(item);
      else if (destino === item.zone) cancelar();
      else void llevar(item, destino);
    },
    step(item, delta) {
      if (selected !== item.id || destino === null) return false;
      const lista = zonas();
      if (!lista.length) return false;
      const i = lista.findIndex((z) => z.id === destino);
      const siguiente = lista[(i + delta + lista.length) % lista.length];
      destino = siguiente.id;
      avisar(textos.over(item.label, siguiente.label));
      return true;
    },
    cancel: cancelar,
    leave(item) {
      if (selected === item.id) destino = null;
    },
    dragStart(item, event) {
      arrastrando = item;
      selected = item.id;
      elegido = item;
      destino = null;
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        // Firefox no empieza el arrastre sin datos, aunque nadie los lea.
        event.dataTransfer.setData("text/plain", item.id);
      }
    },
    dragEnd() {
      arrastrando = null;
    },
    drop(zona) {
      const item = arrastrando;
      arrastrando = null;
      if (!item) return;
      selected = null;
      elegido = null;
      if (zona !== item.zone) void onMove(item.id, zona);
    },
  });
</script>

<div bind:this={raiz} class={cn("ta-drag-board", className)} data-ta-drag-board>
  {@render children?.()}
  <span id={`${id}-instrucciones`} class="ta-drag-board-oculto">{instructions}</span>
  <span class="ta-drag-board-oculto" aria-live="assertive" aria-atomic="true">{aviso}</span>
</div>

<style>
  .ta-drag-board {
    position: relative;
  }

  .ta-drag-board-oculto {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }
</style>
