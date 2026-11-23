import fs from "node:fs";
import { createRequire } from "node:module";

import { render, screen } from "@testing-library/svelte";
import { createRawSnippet, flushSync } from "svelte";
import { compile } from "svelte/compiler";

import Button from "$lib/components/button.svelte";
import ProgressiveBlur from "$lib/components/progressive-blur.svelte";
import ReadingProgress from "$lib/components/reading-progress.svelte";

import { axeViolations } from "../axe";

const text = (t: string) => createRawSnippet(() => ({ render: () => `<span>${t}</span>` }));

const cssOf = (file: string) =>
  compile(fs.readFileSync(file, "utf8"), { filename: file, generate: "client", css: "external" }).css?.code ?? "";

/** The rules of a stylesheet as [selector, body] pairs (one level of nesting, enough here). */
function rules(css: string): [string, string][] {
  const out: [string, string][] = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) out.push([m[1].trim(), m[2]]);
  return out;
}

const classCount = (selector: string) => (selector.match(/\.[\w-]+/g) ?? []).length;

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("ProgressiveBlur", () => {
  it("is decoration: hidden, lets clicks through, three layers growing toward the chosen edge", async () => {
    render(ProgressiveBlur, { side: "top", size: "8rem", strength: 21, "data-testid": "blur" });
    const root = screen.getByTestId("blur");
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.className).toContain("ta-progressive-blur--top");
    expect(root.style.getPropertyValue("--ta-pblur-size")).toBe("8rem");
    expect(root.style.getPropertyValue("--ta-pblur-strength")).toBe("21px");
    expect(root.querySelectorAll(".ta-progressive-blur-layer")).toHaveLength(3);
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it("blurs with backdrop-filter and masks (prefixed too), one layer on touch, nothing without support", () => {
    const css = cssOf("src/lib/components/progressive-blur.svelte");
    expect(css).toMatch(/[^-]backdrop-filter:\s*blur/);
    expect(css).toContain("-webkit-backdrop-filter");
    expect(css).toMatch(/[^-]mask-image:\s*linear-gradient/);
    expect(css).toContain("-webkit-mask-image");
    expect(css).toMatch(/pointer-events:\s*none/);
    const coarse = css.match(/@media \(pointer: coarse\) \{[\s\S]*?\}\s*\}/)?.[0] ?? "";
    expect(coarse).toMatch(/layer--1[\s\S]*layer--3[\s\S]*display:\s*none/);
    expect(css).toMatch(/@supports not \(\(backdrop-filter: blur\(1px\)\) or \(-webkit-backdrop-filter: blur\(1px\)\)\)/);
  });
});

describe("ReadingProgress", () => {
  it("without a target follows the page with CSS alone, hidden from assistive technology", async () => {
    render(ReadingProgress, { "data-testid": "rp" });
    const root = screen.getByTestId("rp");
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.className).toContain("ta-reading-progress--page");
    expect(root.className).toContain("ta-reading-progress--fixed");
    expect((root.firstElementChild as HTMLElement).style.transform).toBe("");
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it("with a target measures how much of it has been read, once per frame", async () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => frames.push(cb));
    vi.stubGlobal("cancelAnimationFrame", () => {});
    vi.stubGlobal("innerHeight", 800);
    const article = document.createElement("article");
    document.body.append(article);
    let top = 0;
    vi.spyOn(article, "getBoundingClientRect").mockImplementation(() => ({ top, height: 2800 }) as DOMRect);

    render(ReadingProgress, { props: { target: article, position: "absolute", "data-testid": "rp" } });
    flushSync();
    const root = screen.getByTestId("rp");
    const bar = root.firstElementChild as HTMLElement;
    expect(root.className).toContain("ta-reading-progress--target");
    expect(root.className).toContain("ta-reading-progress--absolute");
    expect(bar.style.transform).toBe("scaleX(0)");

    // 2800 tall in an 800 viewport: 2000 px to read. Two scroll events, one frame.
    top = -500;
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("scroll"));
    expect(frames).toHaveLength(1);
    frames.shift()!(0);
    flushSync();
    expect(bar.style.transform).toBe("scaleX(0.25)");

    top = -5000;
    window.dispatchEvent(new Event("scroll"));
    frames.shift()!(0);
    flushSync();
    expect(bar.style.transform).toBe("scaleX(1)");
  });

  // The bug: with `animation` and `animation-timeline` in one rule, lightningcss (Vite's CSS
  // minifier) folds them into `animation: … scroll(root)`, a shorthand browsers reject whole.
  it("keeps animation-timeline in its own, more specific rule, and it survives minification", () => {
    const css = cssOf("src/lib/components/reading-progress.svelte");
    const all = rules(css);
    const shorthand = all.filter(([, body]) => /(^|[;\s])animation:/.test(body));
    const timeline = all.filter(([, body]) => body.includes("animation-timeline"));
    expect(shorthand).toHaveLength(1);
    expect(timeline).toHaveLength(1);
    expect(timeline[0][1]).not.toMatch(/(^|[;\s])animation:/);
    expect(classCount(timeline[0][0])).toBeGreaterThan(classCount(shorthand[0][0]));

    // lightningcss is Vite's optional peer, installed with it here.
    const require = createRequire(createRequire(import.meta.url).resolve("vite"));
    const { transform } = require("lightningcss") as {
      transform: (options: { filename: string; code: Uint8Array; minify: boolean }) => { code: Uint8Array };
    };
    const min = transform({ filename: "rp.css", code: Buffer.from(css), minify: true }).code;
    const minified = new TextDecoder().decode(min);
    expect(minified).not.toMatch(/animation:[^;}]*scroll\(/);
    expect(minified).toMatch(/animation-timeline:scroll\(root\)/);
  });
});

describe("Button aurora", () => {
  it("is a button with the aurora class and passes axe", async () => {
    render(Button, { variant: "aurora", children: text("Start free") });
    const button = screen.getByRole("button", { name: "Start free" });
    expect(button.className).toContain("ta-btn--aurora");
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it("turns only when motion is allowed, from a registered angle, and keeps the touch rule", () => {
    const css = cssOf("src/lib/components/button.svelte");
    expect(css.match(/@property --ta-aurora-angle/g)).toHaveLength(1);
    expect(css.match(/@keyframes [\w-]*ta-aurora-spin/g)).toHaveLength(1);
    expect(css).toMatch(/@property --ta-aurora-angle\s*\{[^}]*syntax:\s*"<angle>"/);
    expect(css).toMatch(/conic-gradient\(\s*from var\(--ta-aurora-angle\)/);
    const spins = [...css.matchAll(/animation:[^;}]*ta-aurora-spin/g)];
    expect(spins.length).toBeGreaterThan(0);
    const allowed = css.match(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\s*\}\s*\n\s*\}/)?.[0] ?? "";
    expect(allowed).toMatch(/animation:[^;}]*ta-aurora-spin 4s linear infinite/);
    expect(allowed).toMatch(/\[data-tallao-motion="reduce"\][^{]*\.ta-btn--aurora[^{]*\{\s*animation:\s*none/);
    // Every spin is inside that media block.
    expect(css.split(allowed).join("")).not.toMatch(/ta-aurora-spin [\d.]+s/);
    expect(css).toMatch(/@media \(pointer: coarse\) \{[^}]*\.ta-btn[^{]*\{\s*min-height:\s*2\.75rem/);
  });
});
