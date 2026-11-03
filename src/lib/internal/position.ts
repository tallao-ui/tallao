/**
 * tallao — colocar un panel junto a su disparador
 *
 * El panel lleva `popover="manual"` y se muestra con showPopover(): así sube a
 * la capa superior del navegador (por encima de cualquier z-index y de un
 * `overflow: hidden`, también dentro de un Shadow DOM) sin moverlo de sitio en
 * el DOM, de modo que hereda los tokens de su ThemeScope. La posición la
 * calcula Floating UI (volteo y desplazamiento en los bordes) y se recalcula al
 * hacer scroll o cambiar de tamaño. Sin Popover API, el panel queda `fixed`.
 */
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
  type Middleware,
  type Placement,
  type VirtualElement,
} from "@floating-ui/dom";

export type { Placement, VirtualElement };

export interface AnchorOptions {
  placement?: Placement;
  /** Separación con el disparador, en px. */
  gap?: number;
  /** Al menos tan ancho como el disparador (listas de un combobox o select). */
  matchWidth?: boolean;
}

const hasPopoverApi = () => typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype;

/** Un punto de la ventana como ancla (un menú contextual se abre donde se pulsó). */
export function pointAnchor(x: number, y: number, context?: Element): VirtualElement {
  return {
    getBoundingClientRect: () => ({ x, y, left: x, top: y, right: x, bottom: y, width: 0, height: 0 }),
    contextElement: context,
  };
}

/** Muestra `panel` anclado a `anchor`; devuelve la función que lo oculta y deja de seguirlo. */
export function anchor(anchorEl: Element | VirtualElement, panel: HTMLElement, opts: AnchorOptions = {}): () => void {
  if (hasPopoverApi() && panel.hasAttribute("popover")) {
    try {
      panel.showPopover();
    } catch {
      // Ya estaba abierto o el elemento no está en la página: se coloca igual.
    }
  }

  const middleware: Middleware[] = [offset(opts.gap ?? 6), flip({ padding: 8 }), shift({ padding: 8 })];
  if (opts.matchWidth) {
    middleware.push(
      size({
        apply({ rects }) {
          panel.style.minWidth = `${rects.reference.width}px`;
        },
      })
    );
  }

  const update = () =>
    computePosition(anchorEl, panel, { strategy: "fixed", placement: opts.placement ?? "bottom-start", middleware }).then(
      ({ x, y, placement }) => {
        panel.style.left = `${x}px`;
        panel.style.top = `${y}px`;
        panel.dataset.side = placement.split("-")[0];
      }
    );

  const stop = autoUpdate(anchorEl, panel, update, {
    elementResize: typeof ResizeObserver !== "undefined",
    layoutShift: typeof IntersectionObserver !== "undefined",
  });

  return () => {
    stop();
    if (hasPopoverApi() && panel.isConnected) {
      try {
        panel.hidePopover();
      } catch {
        // Ya estaba cerrado.
      }
    }
  };
}
