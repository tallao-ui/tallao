/**
 * tallao — lo común de DragBoard, DropZone y DragItem
 *
 * El tablero guarda qué elemento está elegido, cuál se arrastra con el ratón y
 * a qué zona apunta el teclado; las zonas y los elementos lo leen por contexto.
 * Las zonas no se registran: el tablero las busca en el DOM, en el orden en
 * que se ven, cuando el teclado las recorre (así un {#each} reordenado no
 * desordena las flechas).
 */
import { getContext, setContext } from "svelte";

const KEY = Symbol("tallao-drag-board");

/** Un elemento del tablero: su id, su nombre (para los avisos) y la zona donde está. */
export interface DragRef {
  id: string;
  label: string;
  zone: string;
}

export interface DragBoardContext {
  /** Elemento elegido (clic, teclado o arrastre). */
  readonly selected: string | null;
  /** Zona a la que apunta el teclado mientras se mueve un elemento; null fuera de ese modo. */
  readonly target: string | null;
  /** Elemento que se arrastra con el ratón ahora mismo. */
  readonly dragging: DragRef | null;
  /** Id del texto (oculto) con las instrucciones de teclado. */
  readonly instructionsId: string;
  /** Clic: elige o suelta la elección, sin entrar en el modo de teclado. */
  toggle(item: DragRef): void;
  /** Enter o Espacio sobre un elemento: lo coge, lo deja en la zona elegida o cancela. */
  press(item: DragRef): void;
  /** Flechas: la zona siguiente (1) o la anterior (-1). Devuelve si hizo algo. */
  step(item: DragRef, delta: 1 | -1): boolean;
  /** Escape: suelta la elección sin mover nada. Devuelve si había algo elegido. */
  cancel(): boolean;
  /** El foco sale del elemento: se deja de apuntar con el teclado (la elección sigue). */
  leave(item: DragRef): void;
  dragStart(item: DragRef, event: DragEvent): void;
  dragEnd(): void;
  /** Un elemento arrastrado cae en la zona `zone`. */
  drop(zone: string): void;
}

export const provideDragBoard = (ctx: DragBoardContext) => setContext(KEY, ctx);

export function useDragBoard(): DragBoardContext {
  const ctx = getContext<DragBoardContext | undefined>(KEY);
  if (!ctx) throw new Error("tallao: DropZone y DragItem van dentro de un DragBoard");
  return ctx;
}
