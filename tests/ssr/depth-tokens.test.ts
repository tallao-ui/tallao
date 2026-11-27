/**
 * The floating level (menus, popovers, dialogs, toasts) reads the depth tokens, each with a
 * fallback, so an app can turn it into glass by setting variables, and a kon view in a shadow
 * DOM without tokens.css still draws an opaque card.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..", "..", "src", "lib");
const read = (path: string) => readFileSync(join(root, path), "utf8");

const FLOATING = [
  "popover",
  "dropdown-menu",
  "context-menu",
  "combobox",
  "dialog",
  "toaster",
  "date-picker",
  "mega-menu",
];

describe("depth tokens", () => {
  it("are defined in tokens.css, with defaults that keep an opaque card", () => {
    const tokens = read("tokens.css");
    for (const name of ["--ta-float:", "--ta-float-alpha: 1;", "--ta-float-blur: 0px;", "--ta-float-edge:", "--ta-float-edge-alpha: 1;", "--ta-float-ring:", "--ta-glow:"]) {
      expect(tokens).toContain(name);
    }
  });

  it.each(FLOATING)("%s draws its panel on the floating level, with fallbacks", (name) => {
    const source = read(`components/${name}.svelte`);
    expect(source).toContain("rgb(var(--ta-float, var(--ta-surface)) / var(--ta-float-alpha, 1))");
    expect(source).toContain("backdrop-filter: blur(var(--ta-float-blur, 0px))");
    expect(source).toContain("var(--ta-float-edge, var(--ta-border)) / var(--ta-float-edge-alpha, 1)");
    expect(source).toContain("var(--ta-float-ring, 0 0 #0000)");
  });

  it("table cells line their figures up, and base.css offers .ta-num and .ta-data", () => {
    expect(read("components/table-cell.svelte")).toContain("font-variant-numeric: tabular-nums");
    const base = read("base.css");
    expect(base).toMatch(/\.ta-num \{\s+font-variant-numeric: tabular-nums;/);
    expect(base).toMatch(/\.ta-data \{\s+font-family: var\(--ta-font-mono/);
  });
});
