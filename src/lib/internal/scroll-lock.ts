/**
 * tallao — bloqueo del scroll de la página
 *
 * Con varios diálogos abiertos a la vez la página sigue bloqueada hasta que se
 * cierra el último: cuenta en vez de un booleano. Compensa el ancho de la
 * barra de scroll para que el contenido no salte al ocultarla.
 */

let abiertos = 0;
let guardado: { overflow: string; paddingRight: string } | null = null;

/** Bloquea el scroll del documento; devuelve la función que lo libera (una sola vez). */
export function lockScroll(): () => void {
  if (typeof document === "undefined") return () => {};
  const raiz = document.documentElement;
  if (abiertos++ === 0) {
    const barra = window.innerWidth - raiz.clientWidth;
    guardado = { overflow: raiz.style.overflow, paddingRight: raiz.style.paddingRight };
    raiz.style.overflow = "hidden";
    if (barra > 0) raiz.style.paddingRight = `${barra}px`;
  }
  let liberado = false;
  return () => {
    if (liberado) return;
    liberado = true;
    if (--abiertos === 0 && guardado) {
      raiz.style.overflow = guardado.overflow;
      raiz.style.paddingRight = guardado.paddingRight;
      guardado = null;
    }
  };
}
