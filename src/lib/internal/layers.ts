/**
 * tallao — pila de capas flotantes
 *
 * Popover, menú, tooltip y combobox se apuntan aquí mientras están abiertos.
 * Escape cierra solo la de arriba; un clic fuera cierra, de arriba abajo, las
 * capas que no contienen el clic (un menú dentro de un popover sobrevive a un
 * clic en el popover). Con `composedPath()` funciona también dentro de un
 * Shadow DOM, donde `event.target` se queda en el host.
 */

export interface Layer {
  /** Elementos que cuentan como «dentro»: el panel y su disparador. */
  inside: () => (Element | null | undefined)[];
  dismiss: (reason: "escape" | "outside") => void;
  /** Solo Escape la cierra; los clics la atraviesan (un tooltip). */
  escapeOnly?: boolean;
}

const stack: Layer[] = [];

function onPointerDown(e: PointerEvent) {
  const path = e.composedPath();
  for (const layer of [...stack].reverse()) {
    if (layer.escapeOnly) continue;
    if (layer.inside().some((el) => el && path.includes(el))) break;
    layer.dismiss("outside");
  }
}

// En captura y con preventDefault: si la capa está dentro de un <dialog>, el
// Escape no debe cerrar también el diálogo.
function onKeyDown(e: KeyboardEvent) {
  if (e.key !== "Escape" || stack.length === 0) return;
  e.preventDefault();
  e.stopPropagation();
  stack[stack.length - 1].dismiss("escape");
}

/** Apunta una capa abierta; devuelve la función que la quita. */
export function pushLayer(layer: Layer): () => void {
  if (typeof document === "undefined") return () => {};
  if (stack.length === 0) {
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
  }
  stack.push(layer);
  return () => {
    const i = stack.indexOf(layer);
    if (i >= 0) stack.splice(i, 1);
    if (stack.length === 0) {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
    }
  };
}
