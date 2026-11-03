/**
 * tallao — utilidades de foco compartidas por diálogos, menús y flotantes.
 */

const TABULABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(",");

/** Elementos a los que llega el Tab dentro de `raiz`, en orden de documento. */
export function tabulables(raiz: ParentNode): HTMLElement[] {
  return [...raiz.querySelectorAll<HTMLElement>(TABULABLE)].filter(
    (el) => !el.closest("[inert]") && el.getAttribute("aria-hidden") !== "true"
  );
}

/**
 * El elemento con el foco, también dentro de un Shadow DOM: `document.activeElement`
 * se queda en el host y devolver el foco ahí lo pierde.
 */
export function elementoActivo(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  let activo = document.activeElement as HTMLElement | null;
  while (activo?.shadowRoot?.activeElement) activo = activo.shadowRoot.activeElement as HTMLElement;
  return activo;
}

/** Devuelve el foco a donde estaba, si ese elemento sigue en la página. */
export function devolverFoco(el: HTMLElement | null) {
  if (el && el.isConnected) el.focus({ preventScroll: true });
}
