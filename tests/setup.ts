// Cleanup between tests is added by the svelteTesting plugin (vitest.config.js).
//
// jsdom (chosen because happy-dom drops <tr> and <td> inside a <template>, and Svelte
// builds the DOM from templates) does not implement the modal <dialog>. The bare minimum
// here is enough for Dialog to open and close: the real browser behaviour (contained focus,
// Escape only on the top one) is checked in Chrome with real keys.
const proto = (globalThis.HTMLDialogElement ?? HTMLElement).prototype as HTMLDialogElement;

if (typeof proto.showModal !== "function") {
  const isDialog = (el: Element) => el.tagName === "DIALOG";
  Object.defineProperty(proto, "open", {
    configurable: true,
    get(this: HTMLElement) {
      return isDialog(this) ? this.hasAttribute("open") : undefined;
    },
    set(this: HTMLElement, value: boolean) {
      if (!isDialog(this)) return;
      if (value) this.setAttribute("open", "");
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

// axe asks for <canvas> (icon fonts); jsdom without the canvas package warns with an error.
HTMLCanvasElement.prototype.getContext = (() => null) as unknown as HTMLCanvasElement["getContext"];

export {};

// jsdom has no ResizeObserver; bind:clientWidth (the charts) uses it. With no measurements, it never fires.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

// jsdom has no Web Animations API; Svelte's transitions (the kit's `tallao/motion`) call
// `element.animate`. This stand-in finishes at once, which is all a behaviour test needs.
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = function () {
    const animation = {
      currentTime: 0,
      playState: "finished",
      onfinish: null as null | (() => void),
      oncancel: null as null | (() => void),
      finished: Promise.resolve(),
      cancel() {},
      finish() {},
      play() {},
      pause() {},
      addEventListener() {},
      removeEventListener() {},
    };
    queueMicrotask(() => animation.onfinish?.());
    return animation as unknown as Animation;
  };
}
