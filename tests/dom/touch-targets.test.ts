/**
 * Touch readiness: every component that renders its own control (a button, link, field,
 * <summary> or focusable element) must give it a 44px target under `pointer: coarse`.
 * The rule is checked in the compiled CSS, so a selector the compiler drops as unused does
 * not count. A new component with a control fails here until it gets the rule (or an entry
 * in EXEMPT with the reason).
 */
import fs from "node:fs";
import path from "node:path";

import { compile } from "svelte/compiler";

const ROOTS = ["src/lib/components", "src/lib/map", "src/lib/code"];

/** Components with native controls that are not touch targets of their own (name → reason). */
const EXEMPT: Record<string, string> = {};

/** Controls drawn by the component itself, in the markup (not in comments, styles or scripts). */
function hasOwnControls(source: string): boolean {
  const markup = source
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  const native = /<(button|a|select|textarea|summary)[\s>]/.test(markup);
  const field = /<input\b(?![^>]*type="hidden")/.test(markup);
  const focusable = /tabindex=("0"|\{(?!-1\}))/.test(markup);
  return native || field || focusable;
}

const cssOf = (file: string) =>
  compile(fs.readFileSync(file, "utf8"), { filename: file, generate: "client", css: "external" }).css?.code ?? "";

const files = ROOTS.flatMap((dir) =>
  fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".svelte"))
    .map((f) => path.join(dir, f))
);

const interactive = files.filter((f) => hasOwnControls(fs.readFileSync(f, "utf8")));

describe("touch targets under pointer: coarse", () => {
  it("finds the interactive components", () => {
    const names = interactive.map((f) => path.basename(f, ".svelte"));
    // A sanity check on the detector itself.
    for (const known of ["button", "dialog", "toaster", "bottom-nav", "nav-menu", "sidebar", "input-otp", "suggestion-chips"]) {
      expect(names).toContain(known);
    }
    for (const passive of ["card", "badge", "spinner", "table-cell", "menu-separator"]) {
      expect(names).not.toContain(passive);
    }
  });

  it.each(interactive.map((f) => [path.basename(f), f]))("%s has a 44px touch rule in its compiled CSS", (name, file) => {
    if (EXEMPT[name]) return;
    const code = cssOf(file);
    const coarse = code.match(/@media\s*\(pointer:\s*coarse\)\s*\{([\s\S]*?\})\s*\}/g) ?? [];
    expect(coarse.length, `${name} has no @media (pointer: coarse) block`).toBeGreaterThan(0);
    expect(coarse.join("\n"), `${name}: the coarse rules do not reach 44px (2.75rem)`).toMatch(/2\.75rem|44px|3rem|3\.5rem/);
  });
});

describe("mobile layout", () => {
  it("heights that depend on the viewport use dvh (the on-screen keyboard and the browser bars)", () => {
    for (const name of ["dialog", "command", "dropdown-menu", "context-menu"]) {
      expect(cssOf(`src/lib/components/${name}.svelte`), name).toMatch(/\d+dvh/);
    }
    // Floating lists cap their height with the room the positioning leaves them.
    for (const name of ["combobox", "dropdown-menu", "context-menu"]) {
      expect(cssOf(`src/lib/components/${name}.svelte`), name).toContain("var(--ta-available-height");
    }
  });

  it("the Toaster stacks above a BottomNav and the safe areas", () => {
    const toaster = cssOf("src/lib/components/toaster.svelte");
    expect(toaster).toContain("var(--ta-bottom-nav-offset, env(safe-area-inset-bottom");
    expect(toaster).toContain("env(safe-area-inset-top");
  });

  it("Dialog fits a phone: less padding, a footer that wraps, the close button at 44px", () => {
    const code = cssOf("src/lib/components/dialog.svelte");
    expect(code).toMatch(/@media \(max-width: 480px\)/);
    expect(code).toMatch(/\.ta-dialog-footer[^{]*\{[^}]*flex-wrap: wrap/);
    expect(code).toMatch(/\.ta-dialog-close[^{]*\{[^}]*min-width: 2\.75rem/);
  });
});
