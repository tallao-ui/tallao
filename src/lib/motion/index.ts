/**
 * tallao — motion
 *
 * A small library of transitions for the cases an application needs, on the kit's motion
 * tokens (`--ta-duration-*`, `--ta-ease-*` in tokens.css). Three kinds of thing:
 *
 *   Svelte transitions      <div transition:rise>            fade, rise, scaleIn, slide, collapse
 *                           <li in:rise={stagger(i)}>        stagger (a delay per index)
 *                           const [send, receive] = crossfade()   an item that moves between lists
 *   Attachments             <button {@attach press()}>       press, shimmer, rollNumber,
 *                           <div {@attach tabIndicator(...)}  tabIndicator, drawCheck, impact
 *   Functions               shake(node), viewTransition(update), themeTransition(update, opts),
 *                           playImpact(el), prefersReducedMotion()
 *
 * Rules every piece keeps:
 * - Reduced motion (the system setting, or `data-tallao-motion="reduce"` on <html>) turns the
 *   movement off: transitions last 0 ms, attachments do nothing, the final state is still set.
 * - Short and interruptible: 120–240 ms, opacity and transform only (no layout), except
 *   `collapse`, which animates height because that is its job.
 * - SSR-safe: nothing here touches `window` or `document` when imported or on the server
 *   (transitions and attachments only run in the browser).
 * - No dependency: Svelte's transition contract and the Web Animations API.
 */
import { crossfade as svelteCrossfade, type CrossfadeParams, type TransitionConfig } from "svelte/transition";

/** The kit's durations in ms; the same as `--ta-duration-fast | base | slow`. */
export const DURATION = { fast: 120, base: 180, slow: 240 } as const;

/** The kit's easings as CSS, for the Web Animations API; the same as `--ta-ease-*`. */
export const EASE = {
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  spring:
    "linear(0, 0.009, 0.035 2.1%, 0.141 4.4%, 0.723 12.9%, 0.938 16.7%, 1.017, 1.077, 1.121, 1.149 24.3%, 1.159, 1.163, 1.161, 1.154 29.9%, 1.129 32.8%, 1.051 39.6%, 1.017 43.1%, 0.991, 0.977 51%, 0.974 53.8%, 0.975 57.1%, 0.997 69.8%, 1.003 76.9%, 1.004 83.8%, 1)",
} as const;

type Speed = keyof typeof DURATION | number;
const ms = (speed: Speed | undefined, fallback: Speed) => {
  const value = speed ?? fallback;
  return typeof value === "number" ? value : DURATION[value];
};

/** The curve of `--ta-ease-out` as a function (cubic-bezier(0.16, 1, 0.3, 1) is close to 1 - (1 - t)^5). */
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 5);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Whether movement is off: the system's "reduce motion", or `data-tallao-motion="reduce"` on
 * <html> (`"full"` there overrides the system). On the server it answers true: nothing moves.
 */
export function prefersReducedMotion(): boolean {
  if (typeof document === "undefined") return true;
  const forced = document.documentElement.dataset.tallaoMotion;
  if (forced === "reduce") return true;
  if (forced === "full") return false;
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export interface MotionParams {
  /** "fast" (120 ms), "base" (180 ms), "slow" (240 ms) or a number of ms. */
  duration?: Speed;
  delay?: number;
}

const still = (delay = 0): TransitionConfig => ({ delay, duration: 0 });

/** Opacity only: for anything that appears in place. */
export function fade(_node: Element, { duration, delay = 0 }: MotionParams = {}): TransitionConfig {
  if (prefersReducedMotion()) return still();
  return { delay, duration: ms(duration, "fast"), css: (t) => `opacity: ${t}` };
}

/** Fades in while rising a few pixels: list items, cards, messages. `y` is the distance. */
export function rise(_node: Element, { duration, delay = 0, y = 6 }: MotionParams & { y?: number } = {}): TransitionConfig {
  if (prefersReducedMotion()) return still();
  return {
    delay,
    duration: ms(duration, "base"),
    easing: easeOut,
    css: (t, u) => `opacity: ${t}; transform: translateY(${u * y}px)`,
  };
}

/** Grows from slightly smaller while fading in: dialogs, popovers, menus. */
export function scaleIn(_node: Element, { duration, delay = 0, from = 0.96 }: MotionParams & { from?: number } = {}): TransitionConfig {
  if (prefersReducedMotion()) return still();
  return {
    delay,
    duration: ms(duration, "fast"),
    easing: easeOut,
    css: (t) => `opacity: ${t}; transform: scale(${from + (1 - from) * t})`,
  };
}

/** Slides in from an edge: sheets and drawers. `distance` is a CSS length (its own size by default). */
export function slide(
  _node: Element,
  { duration, delay = 0, from = "right", distance = "100%" }: MotionParams & { from?: "left" | "right" | "top" | "bottom"; distance?: string } = {}
): TransitionConfig {
  if (prefersReducedMotion()) return still();
  const axis = from === "left" || from === "right" ? "X" : "Y";
  const sign = from === "left" || from === "top" ? "-" : "";
  return {
    delay,
    duration: ms(duration, "slow"),
    easing: easeOut,
    css: (_t, u) => `transform: translate${axis}(calc(${sign}${distance} * ${u}))`,
  };
}

/** Opens and closes a block of unknown height (an accordion panel, a details row). */
export function collapse(node: Element, { duration, delay = 0 }: MotionParams = {}): TransitionConfig {
  if (prefersReducedMotion()) return still();
  const height = (node as HTMLElement).offsetHeight;
  return {
    delay,
    duration: ms(duration, "base"),
    easing: easeOut,
    css: (t) => `overflow: hidden; height: ${t * height}px; opacity: ${Math.min(1, t * 1.5)}`,
  };
}

/**
 * Parameters for the item at `index` of a list that enters in sequence:
 * `<li in:rise={stagger(i)}>`. The delay stops growing after `max` items so a long list
 * does not make anyone wait.
 */
export function stagger(index: number, { step = 30, max = 8, ...params }: MotionParams & { step?: number; max?: number; y?: number } = {}) {
  return { ...params, delay: (params.delay ?? 0) + Math.min(index, max) * step };
}

/**
 * A pair of transitions for an element that leaves one place and appears in another
 * (a card moved to another column, a selected chip): `out:send={{ key }}` on one,
 * `in:receive={{ key }}` on the other. Without a counterpart it falls back to `scaleIn`.
 */
export function crossfade({ duration }: { duration?: Speed } = {}) {
  const [send, receive] = svelteCrossfade({
    duration: () => (prefersReducedMotion() ? 0 : ms(duration, "slow")),
    easing: easeOut,
    fallback: (node) => scaleIn(node),
  });
  const quiet =
    (fn: typeof send) =>
    (node: Element, params: CrossfadeParams & { key: unknown }) =>
      fn(node, prefersReducedMotion() ? { ...params, duration: 0 } : params);
  return [quiet(send), quiet(receive)] as const;
}

// ——— Attachments ———

type Attachment<T extends Element = HTMLElement> = (node: T) => void | (() => void);

const canAnimate = (node: Element) => typeof node.animate === "function" && !prefersReducedMotion();

/** Press feedback: the element shrinks a little while held. `scale` is how small it gets. */
export function press({ scale = 0.97 }: { scale?: number } = {}): Attachment {
  return (node) => {
    let animation: Animation | undefined;
    const down = () => {
      if (!canAnimate(node)) return;
      animation = node.animate([{ transform: `scale(${scale})` }], { duration: 80, easing: EASE.out, fill: "forwards" });
    };
    const up = () => {
      if (!animation) return;
      animation.cancel();
      animation = undefined;
      if (canAnimate(node)) node.animate([{ transform: `scale(${scale})` }, { transform: "scale(1)" }], { duration: DURATION.base, easing: EASE.spring });
    };
    node.addEventListener("pointerdown", down);
    node.addEventListener("pointerup", up);
    node.addEventListener("pointerleave", up);
    node.addEventListener("pointercancel", up);
    return () => {
      animation?.cancel();
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("pointerup", up);
      node.removeEventListener("pointerleave", up);
      node.removeEventListener("pointercancel", up);
    };
  };
}

/**
 * A light that sweeps across a placeholder while something loads. The element needs
 * `overflow: hidden` and `position: relative` (or any positioning); the sweep is drawn with a
 * moving background, so it costs no layout.
 */
export function shimmer({ duration = 1400 }: { duration?: number } = {}): Attachment {
  return (node) => {
    if (!canAnimate(node)) return;
    const previous = node.style.backgroundImage;
    node.style.backgroundImage = "linear-gradient(100deg, transparent 30%, rgb(var(--ta-text) / 0.08) 50%, transparent 70%)";
    node.style.backgroundSize = "200% 100%";
    node.style.backgroundRepeat = "no-repeat";
    const animation = node.animate([{ backgroundPosition: "150% 0" }, { backgroundPosition: "-50% 0" }], { duration, iterations: Infinity, easing: "linear" });
    return () => {
      animation.cancel();
      node.style.backgroundImage = previous;
      node.style.backgroundSize = "";
      node.style.backgroundRepeat = "";
    };
  };
}

/** Shakes an element sideways once: an invalid field, a refused action. Call it when it happens. */
export function shake(node: Element | null | undefined, { distance = 5 }: { distance?: number } = {}): void {
  if (!node || !canAnimate(node)) return;
  const d = distance;
  node.animate(
    [0, -d, d, -d * 0.6, d * 0.6, -d * 0.3, 0].map((x) => ({ transform: `translateX(${x}px)` })),
    { duration: 320, easing: "ease-out" }
  );
}

/**
 * Draws the stroke of an SVG shape from nothing (a success check, a ring): attach it to a
 * `<path>`, `<circle>` or `<polyline>`. The shape is drawn whole under reduced motion.
 */
export function drawCheck({ duration, delay = 0 }: MotionParams = {}): Attachment<SVGGeometryElement> {
  return (node) => {
    if (!canAnimate(node) || typeof node.getTotalLength !== "function") return;
    const length = node.getTotalLength();
    node.style.strokeDasharray = String(length);
    const animation = node.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
      duration: ms(duration, "slow"),
      delay,
      easing: EASE.out,
      fill: "backwards",
    });
    return () => animation.cancel();
  };
}

/**
 * Rolls the element's text from the number it showed to `value`. The text is always set to
 * the final `format(value)` first, so the server, screen readers and reduced motion get the
 * real figure; only the painted frames in between count up. Re-create it when the value
 * changes: `{@attach rollNumber(total)}`.
 */
export function rollNumber(value: number, { duration, format = (n: number) => String(Math.round(n)) }: { duration?: Speed; format?: (n: number) => string } = {}): Attachment {
  return (node) => {
    const store = node as HTMLElement & { __taNumber?: number };
    const from = store.__taNumber ?? value;
    store.__taNumber = value;
    node.textContent = format(value);
    if (from === value || prefersReducedMotion() || typeof requestAnimationFrame !== "function") return;
    const total = ms(duration, 600);
    const start = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min(1, (now - start) / total);
      node.textContent = format(from + (value - from) * easeOut(t));
      if (t < 1) frame = requestAnimationFrame(step);
    });
    return () => {
      cancelAnimationFrame(frame);
      node.textContent = format(value);
    };
  };
}

/**
 * Slides an indicator under (or behind) the active item of a group: attach it to the
 * indicator element, absolutely positioned inside the positioned container of the items.
 * `active()` returns the active item (or a selector for it inside the container). It follows
 * the item when it changes and when the container resizes; the first placement does not move.
 *
 *   <div class="tabs" style="position: relative">
 *     {#each tabs as t}<button aria-selected={t === current}>…</button>{/each}
 *     <span class="bar" {@attach tabIndicator(() => `[aria-selected="true"]`, () => current)}></span>
 *   </div>
 */
export function tabIndicator(active: () => HTMLElement | string | null | undefined, track?: () => unknown): Attachment {
  return (node) => {
    const container = node.parentElement;
    if (!container) return;
    track?.();
    const place = (animate: boolean) => {
      const target = active();
      const item = typeof target === "string" ? container.querySelector<HTMLElement>(target) : target;
      if (!item) {
        node.style.opacity = "0";
        return;
      }
      const moves = animate && !prefersReducedMotion() && node.style.width !== "";
      node.style.transition = moves ? `transform ${DURATION.base}ms ${EASE.out}, width ${DURATION.base}ms ${EASE.out}` : "none";
      node.style.opacity = "1";
      node.style.width = `${item.offsetWidth}px`;
      node.style.transform = `translateX(${item.offsetLeft}px)`;
    };
    place(true);
    if (typeof ResizeObserver !== "function") return;
    const observer = new ResizeObserver(() => place(false));
    observer.observe(container);
    return () => observer.disconnect();
  };
}

/**
 * Runs a DOM update inside a View Transition (a route change, a list that reorders) when the
 * browser has them and motion is on; otherwise it just runs the update. Resolves when the
 * transition is over.
 */
export async function viewTransition(update: () => void | Promise<void>): Promise<void> {
  const doc = typeof document === "undefined" ? undefined : (document as Document & { startViewTransition?: (cb: () => void | Promise<void>) => { finished: Promise<void> } });
  if (!doc?.startViewTransition || prefersReducedMotion()) {
    await update();
    return;
  }
  const transition = doc.startViewTransition(update) as { finished: Promise<void>; ready?: Promise<void> };
  // A transition that is skipped (a newer one started) rejects `ready` too: not an error here,
  // and not an "Uncaught (in promise)" in the console.
  transition.ready?.catch(() => {});
  try {
    await transition.finished;
  } catch {
    // A transition that is skipped (a newer one started) is not an error for the caller.
  }
}

export type ThemeTransitionStyle = "fade" | "circle" | "ink";

export interface ThemeTransitionOptions {
  /** Where the reveal starts: a pointer/mouse event, a point, or an element (its centre). Default: viewport centre. */
  from?: MouseEvent | PointerEvent | { x: number; y: number } | Element | null;
  /** Default "circle" (neutral). "ink": the circle edge broken by a noise mask. */
  style?: ThemeTransitionStyle;
  /** ms; default from the tokens' slow scale but a reveal needs longer: default 650. */
  duration?: number;
}

type ViewTransitionLike = { finished: Promise<void>; skipTransition?: () => void };
type DocumentWithVT = Document & { startViewTransition?: (cb: () => void | Promise<void>) => ViewTransitionLike };

const VT_PROPS = ["--ta-vt-x", "--ta-vt-y", "--ta-vt-r", "--ta-vt-duration"] as const;
let runningTheme: ViewTransitionLike | undefined;

function revealOrigin(from: ThemeTransitionOptions["from"]): { x: number; y: number } {
  const centre = { x: innerWidth / 2, y: innerHeight / 2 };
  if (!from) return centre;
  if (typeof Element !== "undefined" && from instanceof Element) {
    const r = from.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  if ("clientX" in from) {
    // A keyboard "click" has no position (0, 0 with detail 0): reveal from the clicked element.
    // With a listener on the document, currentTarget is the document: the target says where.
    if (from.detail === 0 && from.clientX === 0 && from.clientY === 0) {
      const el = from.currentTarget instanceof Element ? from.currentTarget : from.target instanceof Element ? from.target : null;
      return el ? revealOrigin(el) : centre;
    }
    return { x: from.clientX, y: from.clientY };
  }
  if ("x" in from) return { x: from.x, y: from.y };
  return centre;
}

/**
 * Switches the theme (or anything page-wide) inside a View Transition whose new state is
 * revealed from a point: a circle growing from the click (`circle`), the same with an inked,
 * ragged edge (`ink`), or a cross-fade (`fade`). `update` is what changes the page, typically
 * setting `data-tallao-theme` on <html>. The CSS lives in `tallao/base.css`, scoped by
 * `data-ta-theme-transition` on <html>; `--ta-ink-mask` swaps the ink blot for a site's own brush.
 *
 *   <Button onclick={(e) => themeTransition(() => toggleTheme(), { from: e, style: "ink" })}>
 *
 * Without View Transitions, or with reduced motion, it just runs `update`. Resolves when done.
 */
export async function themeTransition(update: () => void | Promise<void>, options: ThemeTransitionOptions = {}): Promise<void> {
  const doc = typeof document === "undefined" ? undefined : (document as DocumentWithVT);
  if (!doc?.startViewTransition || prefersReducedMotion()) {
    await update();
    return;
  }
  const { from = null, style = "circle", duration = 650 } = options;
  const { x, y } = revealOrigin(from);
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  // A reveal still running is cut short: the new one starts from the page as it is now.
  runningTheme?.skipTransition?.();
  const root = doc.documentElement;
  root.style.setProperty("--ta-vt-x", `${Math.round(x)}px`);
  root.style.setProperty("--ta-vt-y", `${Math.round(y)}px`);
  root.style.setProperty("--ta-vt-r", `${Math.ceil(r)}px`);
  root.style.setProperty("--ta-vt-duration", `${duration}ms`);
  root.setAttribute("data-ta-theme-transition", style);
  const transition = doc.startViewTransition(update);
  runningTheme = transition;
  try {
    // A skipped reveal still fulfils `finished`; it rejects only when `update` threw, and that
    // error is the caller's, as it is without View Transitions.
    await transition.finished;
  } finally {
    // A newer reveal owns the attribute and the properties now: leave them to it.
    if (runningTheme === transition) {
      runningTheme = undefined;
      root.removeAttribute("data-ta-theme-transition");
      for (const p of VT_PROPS) root.style.removeProperty(p);
    }
  }
}

export { impact, playImpact, type ImpactFlavor, type ImpactOptions } from "./impact";
