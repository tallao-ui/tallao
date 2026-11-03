/**
 * tallao — lo común de DropdownMenu y ContextMenu
 *
 * El contexto que leen MenuItem y compañía (cerrar el menú al elegir) y el
 * teclado del menú: ↑ ↓ con vuelta, Inicio y Fin, búsqueda por letra y Tab
 * para salir. Las opciones desactivadas se saltan.
 */
import { getContext, setContext } from "svelte";

const KEY = Symbol("tallao-menu");

export interface MenuContext {
  /** Cierra el menú y devuelve el foco a donde estaba. */
  close: () => void;
}

export const provideMenu = (ctx: MenuContext) => setContext(KEY, ctx);
export const useMenu = () => getContext<MenuContext | undefined>(KEY);

/** Opciones elegibles del menú, en orden. */
export function menuItems(list: HTMLElement | undefined): HTMLElement[] {
  return list ? [...list.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')] : [];
}

export function focusItem(list: HTMLElement | undefined, index: number) {
  const items = menuItems(list);
  if (items.length) items[(index + items.length) % items.length].focus();
}

/** Teclado dentro del menú; `onTab` cierra sin devolver el foco (el Tab sigue su camino). */
export function menuKeyboard(onTab: () => void) {
  let query = "";
  let timer: ReturnType<typeof setTimeout> | undefined;

  return (e: KeyboardEvent, list: HTMLElement | undefined) => {
    const items = menuItems(list);
    const i = items.indexOf(e.target as HTMLElement);
    if (e.key === "ArrowDown") focusItem(list, i + 1);
    else if (e.key === "ArrowUp") focusItem(list, i - 1);
    else if (e.key === "Home") focusItem(list, 0);
    else if (e.key === "End") focusItem(list, -1);
    else if (e.key === "Tab") {
      onTab();
      return;
    } else if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Las letras pulsadas seguidas forman el prefijo que se busca.
      clearTimeout(timer);
      query += e.key.toLowerCase();
      timer = setTimeout(() => (query = ""), 500);
      const order = [...items.slice(i + 1), ...items.slice(0, i + 1)];
      order.find((el) => el.textContent?.trim().toLowerCase().startsWith(query))?.focus();
    } else return;
    e.preventDefault();
  };
}
