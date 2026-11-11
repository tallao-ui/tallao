import fs from "node:fs";

import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import {
  collapse,
  crossfade,
  DURATION,
  drawCheck,
  EASE,
  fade,
  prefersReducedMotion,
  press,
  rise,
  rollNumber,
  scaleIn,
  shake,
  shimmer,
  slide,
  stagger,
  tabIndicator,
  viewTransition,
} from "$lib/motion";

import { axeViolations } from "../axe";
import Motion from "../fixtures/Motion.svelte";

/** The system's "reduce motion", as the browser reports it. */
function systemReduces(reduce: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: reduce && query.includes("reduce"), media: query, addEventListener() {}, removeEventListener() {} }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete document.documentElement.dataset.tallaoMotion;
});

describe("the reduced motion switch", () => {
  it("follows the system setting, and data-tallao-motion on <html> overrides it either way", () => {
    systemReduces(false);
    expect(prefersReducedMotion()).toBe(false);
    systemReduces(true);
    expect(prefersReducedMotion()).toBe(true);
    document.documentElement.dataset.tallaoMotion = "full";
    expect(prefersReducedMotion()).toBe(false);
    systemReduces(false);
    document.documentElement.dataset.tallaoMotion = "reduce";
    expect(prefersReducedMotion()).toBe(true);
  });

  it("the tokens carry the same durations and easings, and one block zeroes them", () => {
    const css = fs.readFileSync("src/lib/tokens.css", "utf8");
    expect(css).toContain(`--ta-duration-fast: ${DURATION.fast}ms`);
    expect(css).toContain(`--ta-duration-base: ${DURATION.base}ms`);
    expect(css).toContain(`--ta-duration-slow: ${DURATION.slow}ms`);
    expect(css).toContain(`--ta-ease-out: ${EASE.out}`);
    expect(css).toContain(`--ta-ease-in-out: ${EASE.inOut}`);
    expect(css).toContain(`--ta-ease-spring: ${EASE.spring}`);
    const reduced = css.match(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?--ta-motion: 0;/)?.[0] ?? "";
    expect(reduced).toContain("--ta-duration-slow: 0.01ms");
    expect(css).toMatch(/:root\[data-tallao-motion="reduce"\] \{[\s\S]*?--ta-motion: 0;/);
  });
});

describe("transitions", () => {
  const node = document.createElement("div");

  it("move within 120–240 ms, on opacity and transform only", () => {
    systemReduces(false);
    const all = [fade(node), rise(node), scaleIn(node), slide(node), collapse(node)];
    for (const config of all) {
      expect(config.duration).toBeGreaterThanOrEqual(120);
      expect(config.duration).toBeLessThanOrEqual(240);
    }
    expect(fade(node).css!(0.5, 0.5)).toBe("opacity: 0.5");
    expect(rise(node, { y: 10 }).css!(0, 1)).toBe("opacity: 0; transform: translateY(10px)");
    expect(scaleIn(node).css!(1, 0)).toBe("opacity: 1; transform: scale(1)");
    expect(slide(node, { from: "left" }).css!(0, 1)).toBe("transform: translateX(calc(-100% * 1))");
    expect(slide(node, { from: "bottom", distance: "2rem" }).css!(0, 1)).toBe("transform: translateY(calc(2rem * 1))");
    expect(fade(node, { duration: "slow" }).duration).toBe(240);
    expect(rise(node, { duration: 150 }).duration).toBe(150);
  });

  it("reduced motion: every transition lasts 0 ms and sets no styles", () => {
    systemReduces(true);
    for (const config of [fade(node), rise(node), scaleIn(node), slide(node), collapse(node), rise(node, stagger(5))]) {
      expect(config.duration).toBe(0);
      expect(config.delay ?? 0).toBe(0);
      expect(config.css).toBeUndefined();
    }
  });

  it("stagger delays each item, up to a cap", () => {
    expect(stagger(0).delay).toBe(0);
    expect(stagger(3).delay).toBe(90);
    expect(stagger(40).delay).toBe(240);
    expect(stagger(2, { step: 50, delay: 100, y: 12 })).toEqual({ delay: 200, y: 12 });
  });

  it("crossfade gives a send and receive pair that does not move under reduced motion", () => {
    const [send, receive] = crossfade();
    expect(typeof send).toBe("function");
    expect(typeof receive).toBe("function");
    systemReduces(true);
    const resolve = send(node, { key: "a" }) as () => { duration?: number };
    expect(typeof resolve).toBe("function");
  });
});

describe("attachments and functions", () => {
  it("press, shimmer, shake and drawCheck animate with the Web Animations API", () => {
    systemReduces(false);
    const el = document.createElement("button");
    const animate = vi.fn(() => ({ cancel() {} }) as unknown as Animation);
    el.animate = animate;
    const release = press()(el) as () => void;
    el.dispatchEvent(new Event("pointerdown"));
    expect(animate).toHaveBeenCalledTimes(1);
    el.dispatchEvent(new Event("pointerup"));
    expect(animate).toHaveBeenCalledTimes(2);
    release();

    const stop = shimmer()(el) as () => void;
    expect(animate).toHaveBeenCalledTimes(3);
    expect(el.style.backgroundImage).toContain("linear-gradient");
    stop();
    expect(el.style.backgroundImage).toBe("");

    shake(el);
    expect(animate).toHaveBeenCalledTimes(4);
    shake(null);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path") as SVGPathElement;
    path.getTotalLength = () => 40;
    path.animate = animate;
    drawCheck()(path);
    expect(path.style.strokeDasharray).toBe("40");
    expect(animate).toHaveBeenCalledTimes(5);
  });

  it("reduced motion: none of them animates, and nothing is left on the element", () => {
    systemReduces(true);
    const el = document.createElement("button");
    const animate = vi.fn(() => ({ cancel() {} }) as unknown as Animation);
    el.animate = animate;
    press()(el);
    el.dispatchEvent(new Event("pointerdown"));
    el.dispatchEvent(new Event("pointerup"));
    shimmer()(el);
    shake(el);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path") as SVGPathElement;
    path.getTotalLength = () => 40;
    path.animate = animate;
    drawCheck()(path);
    expect(animate).not.toHaveBeenCalled();
    expect(el.style.backgroundImage).toBe("");
    expect(path.style.strokeDasharray).toBe("");
  });

  it("rollNumber always shows the final value at once, and counts only when motion is on", async () => {
    systemReduces(true);
    const { rerender } = render(Motion, { total: 10 });
    expect(screen.getByTestId("total").textContent).toBe("10");
    const frames = vi.spyOn(globalThis, "requestAnimationFrame");
    await rerender({ total: 250 });
    expect(screen.getByTestId("total").textContent).toBe("250");
    expect(frames).not.toHaveBeenCalled();

    systemReduces(false);
    const el = document.createElement("span");
    rollNumber(5)(el);
    const stop = rollNumber(90)(el) as () => void;
    expect(frames).toHaveBeenCalled();
    stop();
    expect(el.textContent).toBe("90");
    frames.mockRestore();
  });

  it("tabIndicator places the bar on the active item, without a transition under reduced motion", () => {
    const container = document.createElement("div");
    const a = document.createElement("button");
    const b = document.createElement("button");
    const bar = document.createElement("span");
    container.append(a, b, bar);
    Object.defineProperties(a, { offsetWidth: { value: 60 }, offsetLeft: { value: 0 } });
    Object.defineProperties(b, { offsetWidth: { value: 80 }, offsetLeft: { value: 64 } });
    let active = a;
    systemReduces(false);
    tabIndicator(() => active)(bar);
    expect(bar.style.width).toBe("60px");
    expect(bar.style.transform).toBe("translateX(0px)");
    // The first placement does not slide.
    expect(bar.style.transition).toBe("none");
    active = b;
    tabIndicator(() => active)(bar);
    expect(bar.style.width).toBe("80px");
    expect(bar.style.transform).toBe("translateX(64px)");
    expect(bar.style.transition).toContain("transform 180ms");
    systemReduces(true);
    active = a;
    tabIndicator(() => active)(bar);
    expect(bar.style.transition).toBe("none");
    expect(bar.style.transform).toBe("translateX(0px)");
  });

  it("viewTransition runs the update inside a View Transition only when motion is on", async () => {
    const update = vi.fn();
    const start = vi.fn((cb: () => void) => {
      cb();
      return { finished: Promise.resolve() };
    });
    (document as unknown as { startViewTransition: unknown }).startViewTransition = start;
    try {
      systemReduces(false);
      await viewTransition(update);
      expect(start).toHaveBeenCalledOnce();
      expect(update).toHaveBeenCalledOnce();
      systemReduces(true);
      await viewTransition(update);
      expect(start).toHaveBeenCalledOnce();
      expect(update).toHaveBeenCalledTimes(2);
    } finally {
      delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
    }
  });
});

describe("motion in the kit's components", () => {
  it("Tabs draws one sliding underline after mount, only where it can slide", async () => {
    render(Motion);
    await tick();
    const sliding = screen.getByRole("tablist", { name: "Sliding" });
    const bar = sliding.querySelector(".ta-tabs-indicator")!;
    expect(bar.getAttribute("role")).toBe("presentation");
    expect(sliding.closest(".ta-tabs")!.className).toMatch(/ta-tabs--sliding/);
    expect(within(sliding).getAllByRole("tab")).toHaveLength(2);
    await userEvent.click(within(sliding).getByRole("tab", { name: "Two" }));
    expect(within(sliding).getByRole("tab", { name: "Two" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tablist", { name: "Pills" }).querySelector(".ta-tabs-indicator")).toBeNull();
  });

  it("every component that animates has a reduced-motion rule, or only uses the duration tokens", () => {
    const dir = "src/lib/components";
    const missing: string[] = [];
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".svelte"))) {
      const style = fs.readFileSync(`${dir}/${file}`, "utf8").match(/<style>[\s\S]*<\/style>/)?.[0] ?? "";
      if (!/animation(-name)?:\s*(?!none)/.test(style)) continue;
      if (!style.includes("prefers-reduced-motion")) missing.push(file);
    }
    expect(missing).toEqual([]);
  });

  it("a collapse transition leaves the content in place", async () => {
    const { rerender } = render(Motion, { open: true });
    expect(screen.getByTestId("panel").textContent).toBe("Panel");
    await rerender({ open: false });
    await vi.waitFor(() => expect(screen.queryByTestId("panel")).toBeNull());
  });
});

describe("RadarChart", () => {
  const figureOf = (title: string) => screen.getByText(title, { selector: "figcaption" }).closest("figure") as HTMLElement;

  it("is a figure with a named image, a legend and the data table behind a button", async () => {
    render(Motion);
    const figure = figureOf("Kaela against Oskar");
    expect(within(figure).getByRole("img", { name: "Kaela against Oskar: Kaela, Oskar" })).toBeTruthy();
    expect(figure.querySelectorAll(".ta-radar-area")).toHaveLength(2);
    expect(figure.querySelectorAll(".ta-radar-axis")).toHaveLength(4);
    // Series differ by more than colour: the second is dashed and has its own point shape.
    const [first, second] = [...figure.querySelectorAll(".ta-radar-area")];
    expect(first.hasAttribute("stroke-dasharray")).toBe(false);
    expect(second.getAttribute("stroke-dasharray")).toBe("5 3");
    expect(figure.querySelector(".ta-legend")!.textContent).toContain("Oskar");
    const button = within(figure).getByRole("button", { name: "Show data" });
    button.focus();
    await userEvent.keyboard("{Enter}");
    const rows = within(within(figure).getByRole("table")).getAllByRole("row");
    expect(rows.map((r) => [...r.children].map((cell) => cell.textContent?.trim()).join(" "))).toEqual(["Label Kaela Oskar", "Damage 92 55", "Mobility 88 40", "Defence 35 90", "Control 50 —"]);
  });

  it("the outer point of an axis is its maximum", () => {
    render(Motion);
    const figure = figureOf("Kaela against Oskar");
    const kaela = figure.querySelector(".ta-radar-area")!.getAttribute("points")!.split(" ")[0].split(",").map(Number);
    // Damage 92 of 100 on the axis that points up from (160, 130) with radius 96.
    expect(kaela[0]).toBeCloseTo(160, 1);
    expect(kaela[1]).toBeCloseTo(130 - 96 * 0.92, 1);
  });

  it("with fewer than three axes it shows the empty state", () => {
    render(Motion);
    const figure = figureOf("Too few");
    expect(figure.textContent).toContain("No data");
    expect(figure.querySelector("svg")).toBeNull();
  });
});

describe("RollingCounter", () => {
  it("reads as plain text and draws one wheel per digit at its value", async () => {
    const { rerender } = render(Motion, { value: 1249 });
    const counter = screen.getByTestId("counter");
    expect(counter.querySelector(".ta-roll-text")!.textContent).toBe("Players online: 1,249");
    const wheels = counter.querySelector(".ta-roll-wheels")!;
    expect(wheels.getAttribute("aria-hidden")).toBe("true");
    const strips = [...wheels.querySelectorAll<HTMLElement>(".ta-roll-strip")];
    expect(strips.map((s) => s.style.transform)).toEqual(["translateY(-10%)", "translateY(-20%)", "translateY(-40%)", "translateY(-90%)"]);
    expect(wheels.querySelector(".ta-roll-static")!.textContent).toBe(",");

    // The units wheel is the same element after the value grows a digit.
    const units = strips[3];
    await rerender({ value: 12503 });
    const after = [...wheels.querySelectorAll<HTMLElement>(".ta-roll-strip")];
    expect(after).toHaveLength(5);
    expect(after[4]).toBe(units);
    expect(units.style.transform).toBe("translateY(-30%)");
    expect(counter.querySelector(".ta-roll-text")!.textContent).toBe("Players online: 12,503");
  });
});

describe("axe on the motion fixture", () => {
  it("finds no violations", async () => {
    const { container } = render(Motion);
    await tick();
    expect(await axeViolations(container)).toEqual([]);
  });
});
