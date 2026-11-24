import fs from "node:fs";

import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import { impact, playImpact, themeTransition } from "$lib/motion";
import { __resetImpact } from "$lib/motion/impact";

import ImpactButton from "../fixtures/ImpactButton.svelte";

/** The system's "reduce motion", as the browser reports it. */
function systemReduces(reduce: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: reduce && query.includes("reduce"), media: query, addEventListener() {}, removeEventListener() {} }));
}

/** A 2D context that does nothing: jsdom has no canvas. */
function stubCanvas() {
  const context = new Proxy({} as Record<string | symbol, unknown>, {
    get: (target, key) => (key in target ? target[key] : (target[key] = vi.fn())),
    set: (target, key, value) => ((target[key] = value), true),
  });
  return vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((() => context) as never);
}

const frames: FrameRequestCallback[] = [];
const animate = vi.fn(() => ({ cancel() {} }) as unknown as Animation);

beforeEach(() => {
  frames.length = 0;
  animate.mockClear();
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => frames.push(cb));
  vi.stubGlobal("cancelAnimationFrame", () => {});
  HTMLElement.prototype.animate = animate;
});

afterEach(() => {
  __resetImpact();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete (HTMLElement.prototype as Partial<HTMLElement>).animate;
  delete document.documentElement.dataset.tallaoMotion;
  delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
  document.body.replaceChildren();
});

const canvases = () => document.querySelectorAll("canvas");

describe("impact", () => {
  it("works on the kit's Button through {@attach}: a click draws on one shared, hidden canvas", async () => {
    systemReduces(false);
    stubCanvas();
    render(ImpactButton);
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(canvases()).toHaveLength(1);
    const canvas = canvases()[0];
    expect(canvas.getAttribute("aria-hidden")).toBe("true");
    expect(canvas.style.pointerEvents).toBe("none");
    expect(canvas.style.position).toBe("fixed");
    // The press squashed and released the button with the Web Animations API.
    expect(animate).toHaveBeenCalled();
    // A second element reuses the canvas, and one loop runs for both.
    await userEvent.click(screen.getByRole("button", { name: "Skál" }));
    expect(canvases()).toHaveLength(1);
    expect(frames).toHaveLength(1);
    frames.shift()!(performance.now());
    expect(frames).toHaveLength(1);
  });

  it("the keyboard clicks too", async () => {
    systemReduces(false);
    stubCanvas();
    render(ImpactButton);
    screen.getByRole("button", { name: "Confirm" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(canvases()).toHaveLength(1);
    expect(animate).toHaveBeenCalledOnce();
  });

  it("does nothing under reduced motion, from the system or from data-tallao-motion", async () => {
    stubCanvas();
    systemReduces(true);
    render(ImpactButton);
    const button = screen.getByRole("button", { name: "Confirm" });
    await userEvent.click(button);
    expect(canvases()).toHaveLength(0);
    systemReduces(false);
    document.documentElement.dataset.tallaoMotion = "reduce";
    await userEvent.click(button);
    playImpact(button);
    expect(canvases()).toHaveLength(0);
    expect(animate).not.toHaveBeenCalled();
  });

  it("playImpact plays on an element with no listeners", () => {
    systemReduces(false);
    stubCanvas();
    const el = document.createElement("div");
    document.body.append(el);
    playImpact(el, { flavor: "nordic", words: [] });
    expect(canvases()).toHaveLength(1);
    expect(animate).toHaveBeenCalledOnce();
    // The drawing runs without throwing for both flavours and the light intensity.
    playImpact(el);
    playImpact(el, { intensity: "light" });
    frames.shift()!(performance.now() + 100);
    expect(frames).toHaveLength(1);
  });

  it("cleanup removes every listener it added", () => {
    const el = document.createElement("button");
    const add = vi.spyOn(el, "addEventListener");
    const remove = vi.spyOn(el, "removeEventListener");
    const cleanup = impact()(el) as () => void;
    const added = add.mock.calls.map(([type, fn]) => [type, fn]);
    expect(added.map(([type]) => type)).toEqual(["pointerdown", "pointerup", "pointerleave", "pointercancel", "click"]);
    cleanup();
    expect(remove.mock.calls.map(([type, fn]) => [type, fn])).toEqual(added);
  });

  it("draws its runes as lines, not with a font, and credits its inspiration", () => {
    const source = fs.readFileSync("src/lib/motion/impact.ts", "utf8");
    expect(source).toContain("sakuga-vfx (MIT)");
    expect(source).not.toMatch(/fillText\([^)]*[ᛏᚦᛟᛉᚱᛗ]/);
  });
});

describe("themeTransition", () => {
  type Run = { finished: Promise<void>; skipTransition: () => void };
  type Start = (cb: () => void | Promise<void>) => Run;
  const root = document.documentElement;
  const setStart = (start: Start) => ((document as unknown as { startViewTransition: Start }).startViewTransition = start);

  it("without View Transitions it runs the update once and sets nothing", async () => {
    systemReduces(false);
    const update = vi.fn();
    await themeTransition(update, { style: "ink", from: { x: 10, y: 10 } });
    expect(update).toHaveBeenCalledOnce();
    expect(root.hasAttribute("data-ta-theme-transition")).toBe(false);
    expect(root.style.getPropertyValue("--ta-vt-x")).toBe("");
  });

  it("reveals from the point, with the style and the duration, and clears it all after", async () => {
    systemReduces(false);
    vi.stubGlobal("innerWidth", 1000);
    vi.stubGlobal("innerHeight", 600);
    let seen: Record<string, string> = {};
    let finish!: () => void;
    const start = vi.fn<Start>((cb) => {
      seen = {
        style: root.getAttribute("data-ta-theme-transition") ?? "",
        x: root.style.getPropertyValue("--ta-vt-x"),
        y: root.style.getPropertyValue("--ta-vt-y"),
        r: root.style.getPropertyValue("--ta-vt-r"),
        d: root.style.getPropertyValue("--ta-vt-duration"),
      };
      void cb();
      return { finished: new Promise<void>((done) => (finish = done)), skipTransition: vi.fn() };
    });
    setStart(start);
    const update = vi.fn();
    const done = themeTransition(update, { from: { x: 100, y: 200 }, style: "ink", duration: 900 });
    expect(start).toHaveBeenCalledWith(update);
    expect(update).toHaveBeenCalledOnce();
    // The farthest corner from (100, 200) is (1000, 600).
    expect(seen).toEqual({ style: "ink", x: "100px", y: "200px", r: `${Math.ceil(Math.hypot(900, 400))}px`, d: "900ms" });
    finish();
    await done;
    expect(root.hasAttribute("data-ta-theme-transition")).toBe(false);
    for (const p of ["--ta-vt-x", "--ta-vt-y", "--ta-vt-r", "--ta-vt-duration"]) expect(root.style.getPropertyValue(p)).toBe("");
  });

  it("starts from an element's centre or a click", async () => {
    systemReduces(false);
    const xs: string[] = [];
    setStart((cb) => {
      xs.push(root.style.getPropertyValue("--ta-vt-x") + " " + root.style.getPropertyValue("--ta-vt-y"));
      void cb();
      return { finished: Promise.resolve(), skipTransition() {} };
    });
    const el = document.createElement("button");
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({ left: 10, top: 20, width: 40, height: 20 } as DOMRect);
    await themeTransition(() => {}, { from: el });
    await themeTransition(() => {}, { from: new MouseEvent("click", { clientX: 300, clientY: 40, detail: 1 }) });
    expect(xs).toEqual(["30px 30px", "300px 40px"]);
  });

  it("defaults to a circle from the viewport centre, and skips a reveal still running", async () => {
    systemReduces(false);
    vi.stubGlobal("innerWidth", 800);
    vi.stubGlobal("innerHeight", 600);
    const runs: (Run & { finish: () => void })[] = [];
    setStart((cb) => {
      void cb();
      let finish!: () => void;
      const finished = new Promise<void>((done) => (finish = done));
      const run = { finished, skipTransition: vi.fn(() => finish()), finish };
      runs.push(run);
      return run;
    });
    const first = themeTransition(() => {});
    expect(root.getAttribute("data-ta-theme-transition")).toBe("circle");
    expect(root.style.getPropertyValue("--ta-vt-x")).toBe("400px");
    const second = themeTransition(() => {}, { style: "fade" });
    expect(runs[0].skipTransition).toHaveBeenCalledOnce();
    await first;
    // The skipped one leaves the newer reveal's attribute alone.
    expect(root.getAttribute("data-ta-theme-transition")).toBe("fade");
    runs[1].finish();
    await second;
    expect(root.hasAttribute("data-ta-theme-transition")).toBe(false);
  });

  it("under reduced motion just runs the update", async () => {
    const start = vi.fn();
    (document as unknown as { startViewTransition: unknown }).startViewTransition = start;
    systemReduces(false);
    document.documentElement.dataset.tallaoMotion = "reduce";
    const update = vi.fn();
    await themeTransition(update, { style: "circle" });
    expect(update).toHaveBeenCalledOnce();
    expect(start).not.toHaveBeenCalled();
    expect(root.hasAttribute("data-ta-theme-transition")).toBe(false);
  });

  it("its CSS ships in base.css, scoped by the attribute, with a swappable ink mask", () => {
    const css = fs.readFileSync("src/lib/base.css", "utf8");
    expect(css).toContain("html[data-ta-theme-transition]::view-transition-old(root)");
    expect(css).toMatch(/html\[data-ta-theme-transition="circle"\]::view-transition-new\(root\)\s*\{[^}]*ta-vt-circle/);
    expect(css).toMatch(/html\[data-ta-theme-transition="ink"\]::view-transition-new\(root\)\s*\{[^}]*mask-image:\s*var\(--ta-ink-mask\)/);
    expect(css).toMatch(/html\[data-ta-theme-transition="fade"\]::view-transition-new\(root\)/);
    expect(css).toMatch(/--ta-ink-mask:\s*url\("data:image\/svg\+xml,[^"]*feTurbulence[^"]*feDisplacementMap/);
    expect(css).toContain("calc(var(--ta-vt-r, 150vmax) * 2.6)");
  });
});
