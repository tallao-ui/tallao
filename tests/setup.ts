// La limpieza entre tests la añade el plugin svelteTesting (vitest.config.js).
//
// jsdom (elegido porque happy-dom descarta <tr> y <td> dentro de un <template>, y Svelte
// construye el DOM con plantillas) no implementa el <dialog> modal. Aquí basta lo mínimo
// para que Dialog abra y cierre: el comportamiento real del navegador (foco contenido,
// Escape solo el de arriba) se comprueba en Chrome con teclas de verdad.
const proto = (globalThis.HTMLDialogElement ?? HTMLElement).prototype as HTMLDialogElement;

if (typeof proto.showModal !== "function") {
  const esDialogo = (el: Element) => el.tagName === "DIALOG";
  Object.defineProperty(proto, "open", {
    configurable: true,
    get(this: HTMLElement) {
      return esDialogo(this) ? this.hasAttribute("open") : undefined;
    },
    set(this: HTMLElement, valor: boolean) {
      if (!esDialogo(this)) return;
      if (valor) this.setAttribute("open", "");
      else this.removeAttribute("open");
    },
  });
  proto.showModal = function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  proto.show = proto.showModal;
  proto.close = function (this: HTMLDialogElement) {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}

// axe pregunta por <canvas> (iconos de fuente); jsdom sin el paquete canvas avisa con un error.
HTMLCanvasElement.prototype.getContext = (() => null) as unknown as HTMLCanvasElement["getContext"];

export {};
