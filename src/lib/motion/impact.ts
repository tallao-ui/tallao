/**
 * tallao — impact
 *
 * An anime "impact frame" for a confirm: the element squashes while pressed and springs back on
 * release, and a burst plays around it on one shared canvas over the page. Inspired by
 * finktheartist/sakuga-vfx (MIT); written here from scratch, on the kit's motion tokens.
 *
 *   <Button {@attach impact()}>Confirm</Button>
 *   <Button variant="secondary" {@attach impact({ intensity: "light" })}>Apply</Button>
 *   playImpact(saveButton, { flavor: "nordic" });   // after an async save succeeds
 *
 * - `manga`: a spiky radial burst, cloud puffs rolling off the corners, speed wedges and a
 *   sound-effect word (ドン!) popping in above the element.
 * - `nordic`: the burst, frost shards, two crossed slash streaks, a ring of Elder Futhark runes
 *   (drawn as stroked lines, no runic font needed) and a word (SKÁL!).
 * - `intensity: "light"`: a small squash and three wedges, no lettering, for secondary actions.
 * - The effects are decoration: the canvas is `aria-hidden` and lets every click through. One
 *   canvas and one animation-frame loop serve every hit on the page; the canvas leaves the DOM
 *   after 1.5 s without hits.
 * - Reduced motion (the system setting or `data-tallao-motion="reduce"`): nothing at all. On the
 *   server: nothing (attachments only run in the browser).
 */
import { DURATION, EASE, prefersReducedMotion } from "./index";

export type ImpactFlavor = "manga" | "nordic";

export interface ImpactOptions {
  /** "manga" (default): clouds and a Japanese sound effect. "nordic": frost, slashes and runes. */
  flavor?: ImpactFlavor;
  /** Sound-effect words; one is picked per hit. Defaults: manga ["ドン!", "バン!", "ドドン!"], nordic ["SKÁL!", "HÚH!"]. Pass [] for none. */
  words?: string[];
  /** "full" (default) or "light" (secondary actions: small squash + 3 wedges, no lettering). */
  intensity?: "full" | "light";
  /** Colour of the effects; default the element's computed `--ta-impact-color`, then `--ta-accent` tokens. */
  color?: string;
}

type Attachment<T extends Element = HTMLElement> = (node: T) => void | (() => void);

const WORDS: Record<ImpactFlavor, string[]> = {
  manga: ["ドン!", "バン!", "ドドン!"],
  nordic: ["SKÁL!", "HÚH!"],
};
const FONTS: Record<ImpactFlavor, string> = {
  manga: '"Hiragino Sans", "Yu Gothic", "Noto Sans JP", system-ui, sans-serif',
  nordic: '"Anton", "Oswald", "Impact", sans-serif',
};
const INK = "rgb(17 17 24)";
const LIFE = { full: 1000, light: 450 };
const IDLE = 1500;

/** Elder Futhark runes as polylines in a unit box (x right, y down). */
const RUNES: number[][][] = [
  // ᛏ tiwaz
  [[0.5, 0, 0.5, 1], [0.15, 0.35, 0.5, 0, 0.85, 0.35]],
  // ᚦ thurisaz
  [[0.3, 0, 0.3, 1], [0.3, 0.25, 0.75, 0.5, 0.3, 0.75]],
  // ᛟ othala
  [[0.15, 0.35, 0.5, 0, 0.85, 0.35], [0.15, 0.35, 0.8, 1], [0.85, 0.35, 0.2, 1]],
  // ᛉ algiz
  [[0.5, 0, 0.5, 1], [0.1, 0, 0.5, 0.45, 0.9, 0]],
  // ᚱ raido
  [[0.3, 0, 0.3, 1], [0.3, 0, 0.75, 0.25, 0.3, 0.5, 0.75, 1]],
  // ᛗ mannaz
  [[0.2, 0, 0.2, 1], [0.8, 0, 0.8, 1], [0.2, 0, 0.8, 0.45], [0.8, 0, 0.2, 0.45]],
];

interface Hit {
  x: number;
  y: number;
  w: number;
  h: number;
  start: number;
  life: number;
  flavor: ImpactFlavor;
  light: boolean;
  color: string;
  word: string;
  tilt: number;
  angles: number[];
  runes: number[];
}

// One canvas and one loop for the whole page.
let canvas: HTMLCanvasElement | undefined;
let ctx: CanvasRenderingContext2D | null = null;
let hits: Hit[] = [];
let frame = 0;
let idleTimer: ReturnType<typeof setTimeout> | undefined;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);
/** 0 → 1 over [a, b] of the hit's life. */
const span = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

function ensureCanvas(): CanvasRenderingContext2D | null {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = undefined;
  }
  if (canvas && ctx) {
    if (!canvas.isConnected) document.body.append(canvas);
    return ctx;
  }
  const c = document.createElement("canvas");
  const context = c.getContext("2d");
  if (!context) return null;
  c.setAttribute("aria-hidden", "true");
  c.className = "ta-impact-canvas";
  Object.assign(c.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "2147483000",
  });
  document.body.append(c);
  canvas = c;
  ctx = context;
  return ctx;
}

function sizeCanvas() {
  if (!canvas || !ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(innerWidth * dpr);
  const h = Math.round(innerHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function loop(now: number) {
  frame = 0;
  if (!canvas || !ctx) return;
  sizeCanvas();
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  hits = hits.filter((hit) => now - hit.start < hit.life);
  for (const hit of hits) draw(ctx, hit, clamp01((now - hit.start) / hit.life));
  if (hits.length) {
    frame = requestAnimationFrame(loop);
  } else {
    // Idle: the canvas leaves the page until the next hit.
    idleTimer = setTimeout(() => {
      canvas?.remove();
      idleTimer = undefined;
    }, IDLE);
  }
}

// — Drawing ————————————————————————————————————————————————————————————————————————————————

function burst(g: CanvasRenderingContext2D, hit: Hit, p: number) {
  const grow = easeOut(span(p, 0, 0.3));
  const alpha = 1 - span(p, 0.15, 0.55);
  if (alpha <= 0) return;
  const R = Math.max(hit.w, hit.h) * 0.85 * grow + 8;
  const spikes = 18;
  g.save();
  g.translate(hit.x, hit.y);
  g.rotate(hit.tilt);
  g.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const len = i % 2 === 0 ? (i % 4 === 0 ? R : R * 0.8) : R * 0.42;
    g.lineTo(Math.cos(a) * len, Math.sin(a) * len);
  }
  g.closePath();
  g.globalAlpha = 0.35 * alpha;
  g.fillStyle = hit.color;
  g.fill();
  g.globalAlpha = 0.85 * alpha;
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(0, 0, R * 0.22, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

function wedges(g: CanvasRenderingContext2D, hit: Hit, p: number) {
  const t = easeOut(span(p, 0, 0.6));
  const alpha = 1 - span(p, 0.3, 0.75);
  if (alpha <= 0) return;
  const s = Math.max(hit.w, hit.h);
  g.save();
  g.translate(hit.x, hit.y);
  g.globalAlpha = alpha;
  g.fillStyle = hit.color;
  for (const a of hit.angles.slice(0, 3)) {
    const near = s * (0.55 + 0.6 * t);
    const far = near + s * (hit.light ? 0.3 : 0.5) * (1 - t * 0.5);
    const half = hit.light ? 3 : 5;
    const nx = -Math.sin(a);
    const ny = Math.cos(a);
    g.beginPath();
    g.moveTo(Math.cos(a) * near + nx * half, Math.sin(a) * near + ny * half);
    g.lineTo(Math.cos(a) * far, Math.sin(a) * far);
    g.lineTo(Math.cos(a) * near - nx * half, Math.sin(a) * near - ny * half);
    g.closePath();
    g.fill();
  }
  g.restore();
}

function clouds(g: CanvasRenderingContext2D, hit: Hit, p: number) {
  const t = easeOut(span(p, 0.05, 0.8));
  const alpha = 1 - span(p, 0.45, 0.95);
  if (alpha <= 0) return;
  const corners = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  const puffs = corners.map(([sx, sy], i) => {
    const cx = hit.x + sx * (hit.w / 2 + 6 + 26 * t);
    const cy = hit.y + sy * (hit.h / 2 + 4 + 18 * t);
    const r = (7 + 9 * t) * (i === 3 ? 0.8 : 1);
    return [
      [cx, cy, r],
      [cx + sx * r * 0.9, cy - r * 0.2, r * 0.75],
      [cx - sx * r * 0.3, cy + sy * r * 0.7, r * 0.65],
    ];
  });
  g.save();
  g.globalAlpha = alpha;
  // Outlines first, then the white fills over them: one outline around each puff's union.
  g.strokeStyle = INK;
  g.lineWidth = 4;
  for (const puff of puffs) for (const [x, y, r] of puff) {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.stroke();
  }
  g.fillStyle = "#fff";
  for (const puff of puffs) for (const [x, y, r] of puff) {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}

function shards(g: CanvasRenderingContext2D, hit: Hit, p: number) {
  const t = easeOut(span(p, 0, 0.55));
  const alpha = 1 - span(p, 0.35, 0.85);
  if (alpha <= 0) return;
  const s = Math.max(hit.w, hit.h);
  g.save();
  g.translate(hit.x, hit.y);
  g.globalAlpha = alpha;
  g.lineWidth = 1.5;
  g.strokeStyle = hit.color;
  g.fillStyle = "rgb(225 240 255)";
  for (const a of hit.angles) {
    const near = s * (0.45 + 0.5 * t);
    const far = near + s * 0.28;
    const nx = -Math.sin(a) * 2.5;
    const ny = Math.cos(a) * 2.5;
    g.beginPath();
    g.moveTo(Math.cos(a) * near + nx, Math.sin(a) * near + ny);
    g.lineTo(Math.cos(a) * far, Math.sin(a) * far);
    g.lineTo(Math.cos(a) * near - nx, Math.sin(a) * near - ny);
    g.closePath();
    g.fill();
    g.stroke();
  }
  g.restore();
}

function slashes(g: CanvasRenderingContext2D, hit: Hit, p: number) {
  const cut = easeOut(span(p, 0, 0.22));
  const alpha = 1 - span(p, 0.3, 0.7);
  if (alpha <= 0) return;
  const len = Math.max(hit.w, hit.h) * 1.3;
  g.save();
  g.translate(hit.x, hit.y);
  g.globalAlpha = alpha;
  g.shadowColor = hit.color;
  g.shadowBlur = 12;
  g.fillStyle = "#fff";
  for (const angle of [-0.45, 0.45]) {
    g.save();
    g.rotate(angle + hit.tilt);
    const from = -len / 2;
    const to = from + len * cut;
    // A streak that is thick in the middle and sharp at both ends.
    g.beginPath();
    g.moveTo(from, 0);
    g.quadraticCurveTo((from + to) / 2, -3.5, to, 0);
    g.quadraticCurveTo((from + to) / 2, 3.5, from, 0);
    g.fill();
    g.restore();
  }
  g.restore();
}

function runeRing(g: CanvasRenderingContext2D, hit: Hit, p: number) {
  const alpha = span(p, 0.05, 0.2) * (1 - span(p, 0.6, 1));
  if (alpha <= 0) return;
  const ring = Math.max(hit.w, hit.h) * 0.75 + 14;
  const size = 18;
  g.save();
  g.translate(hit.x, hit.y);
  g.rotate(hit.tilt + p * 0.6);
  g.globalAlpha = alpha;
  g.strokeStyle = hit.color;
  g.lineWidth = 2.5;
  g.lineCap = "round";
  g.lineJoin = "round";
  hit.runes.forEach((rune, i) => {
    const a = (i / hit.runes.length) * Math.PI * 2 - Math.PI / 2;
    g.save();
    g.translate(Math.cos(a) * ring, Math.sin(a) * ring);
    g.rotate(a + Math.PI / 2);
    g.translate(-size / 2, -size / 2);
    for (const line of RUNES[rune]) {
      g.beginPath();
      g.moveTo(line[0] * size, line[1] * size);
      for (let k = 2; k < line.length; k += 2) g.lineTo(line[k] * size, line[k + 1] * size);
      g.stroke();
    }
    g.restore();
  });
  g.restore();
}

function lettering(g: CanvasRenderingContext2D, hit: Hit, p: number) {
  if (!hit.word) return;
  const pop = span(p, 0.04, 0.3);
  const alpha = 1 - span(p, 0.65, 1);
  if (pop <= 0 || alpha <= 0) return;
  const size = Math.max(22, Math.min(48, hit.h * 0.9));
  g.save();
  g.translate(hit.x, hit.y - hit.h / 2 - size * 0.55 - 6 * span(p, 0.3, 1));
  g.rotate(hit.tilt * 1.5);
  g.scale(easeOutBack(pop), easeOutBack(pop));
  g.globalAlpha = alpha;
  g.font = `900 ${size}px ${FONTS[hit.flavor]}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.lineJoin = "round";
  g.lineWidth = size * 0.2;
  g.strokeStyle = INK;
  g.strokeText(hit.word, 0, 0);
  g.fillStyle = hit.flavor === "manga" ? "#fff" : hit.color;
  g.fillText(hit.word, 0, 0);
  g.restore();
}

function draw(g: CanvasRenderingContext2D, hit: Hit, p: number) {
  if (hit.light) {
    wedges(g, hit, p);
    return;
  }
  burst(g, hit, p);
  if (hit.flavor === "manga") {
    wedges(g, hit, p);
    clouds(g, hit, p);
  } else {
    shards(g, hit, p);
    slashes(g, hit, p);
    runeRing(g, hit, p);
  }
  lettering(g, hit, p);
}

// — Hits ————————————————————————————————————————————————————————————————————————————————————

function colorOf(el: Element, color?: string): string {
  if (color) return color;
  const style = getComputedStyle(el);
  const own = style.getPropertyValue("--ta-impact-color").trim();
  if (own) return own;
  const accent = style.getPropertyValue("--ta-accent").trim();
  return accent ? `rgb(${accent})` : "rgb(168 85 247)";
}

function pick<T>(list: T[]): T | undefined {
  return list.length ? list[Math.floor(Math.random() * list.length)] : undefined;
}

function burstOn(el: Element, options: ImpactOptions) {
  const g = ensureCanvas();
  if (!g) return;
  const { flavor = "manga", intensity = "full" } = options;
  const light = intensity === "light";
  const rect = el.getBoundingClientRect();
  const count = flavor === "nordic" ? 6 : 3;
  const offset = Math.random() * Math.PI * 2;
  const runeCount = 3 + Math.floor(Math.random() * 3);
  const runes = [...RUNES.keys()].sort(() => Math.random() - 0.5).slice(0, runeCount);
  hits.push({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    w: rect.width,
    h: rect.height,
    start: performance.now(),
    life: LIFE[intensity],
    flavor,
    light,
    color: colorOf(el, options.color),
    word: light ? "" : (pick(options.words ?? WORDS[flavor]) ?? ""),
    tilt: (Math.random() - 0.5) * 0.25,
    angles: Array.from({ length: count }, (_, i) => offset + (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5),
    runes,
  });
  if (!frame) frame = requestAnimationFrame(loop);
}

const ORIGIN = "50% 100%";
const squash = (light: boolean) => `scale(${light ? 1.02 : 1.04}, ${light ? 0.95 : 0.9})`;

/** A squash and release in one go: for a hit with no press before it (keyboard, playImpact). */
function pulse(el: Element, light: boolean) {
  if (typeof el.animate !== "function") return;
  el.animate(
    [
      { transform: "scale(1)", transformOrigin: ORIGIN },
      { transform: squash(light), transformOrigin: ORIGIN, offset: 0.3 },
      { transform: "scale(1)", transformOrigin: ORIGIN },
    ],
    { duration: DURATION.slow + DURATION.fast, easing: EASE.out }
  );
}

/** Play the burst on an element without a click (e.g. after an async save succeeds). */
export function playImpact(el: Element, options: ImpactOptions = {}): void {
  if (typeof document === "undefined" || prefersReducedMotion()) return;
  pulse(el, options.intensity === "light");
  burstOn(el, options);
}

/** Attachment: squash on pointerdown, release + burst on click (keyboard Enter/Space clicks too). */
export function impact(options: ImpactOptions = {}): Attachment {
  return (node) => {
    const light = options.intensity === "light";
    let held: Animation | undefined;
    let pressed = false;
    const down = () => {
      if (prefersReducedMotion() || typeof node.animate !== "function") return;
      held?.cancel();
      pressed = true;
      held = node.animate([{ transform: squash(light), transformOrigin: ORIGIN }], { duration: DURATION.fast, easing: EASE.out, fill: "forwards" });
    };
    const up = () => {
      if (!held) return;
      held.cancel();
      held = undefined;
      if (!prefersReducedMotion()) {
        node.animate(
          [
            { transform: squash(light), transformOrigin: ORIGIN },
            { transform: "scale(1)", transformOrigin: ORIGIN },
          ],
          { duration: DURATION.slow, easing: EASE.spring }
        );
      }
    };
    // Left or cancelled while held: no click follows. (After a release, touch fires
    // pointerleave before the click: that one must not reset the press.)
    const abort = () => {
      if (!held) return;
      up();
      pressed = false;
    };
    const click = () => {
      if (prefersReducedMotion()) return;
      // A pointer press already squashed and released; a keyboard click gets the whole pulse.
      if (!pressed) pulse(node, light);
      pressed = false;
      burstOn(node, options);
    };
    const events: [string, () => void][] = [
      ["pointerdown", down],
      ["pointerup", up],
      ["pointerleave", abort],
      ["pointercancel", abort],
      ["click", click],
    ];
    for (const [type, fn] of events) node.addEventListener(type, fn);
    return () => {
      held?.cancel();
      for (const [type, fn] of events) node.removeEventListener(type, fn);
    };
  };
}

/** Test hook: forget the shared canvas (the module keeps it between hits). @internal */
export function __resetImpact(): void {
  if (frame) cancelAnimationFrame(frame);
  if (idleTimer) clearTimeout(idleTimer);
  canvas?.remove();
  canvas = undefined;
  ctx = null;
  hits = [];
  frame = 0;
  idleTimer = undefined;
}
