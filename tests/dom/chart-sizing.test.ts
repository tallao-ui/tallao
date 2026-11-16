/**
 * Sizing rules of the chart parts that jsdom cannot measure, checked in the compiled CSS (as
 * touch-targets.test.ts does):
 *   - the "Show data" button meets the WCAG 2.2 target size (24 × 24 CSS px) with a fine pointer;
 *   - a KpiCard in a narrow card wraps its sparkline under the figure instead of breaking the
 *     figure itself across lines ("35.1 / K").
 */
import fs from "node:fs";

import { compile } from "svelte/compiler";

const cssOf = (file: string) =>
  compile(fs.readFileSync(file, "utf8"), { filename: file, generate: "client", css: "external" }).css?.code ?? "";

/** The declarations of the first rule whose selector starts with `selector` (scoped hash allowed). */
function rule(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = new RegExp(`(?:^|[}\\s])${escaped}(?:\\.svelte-[a-z0-9]+)?\\s*\\{([^}]*)\\}`).exec(css);
  return m?.[1] ?? "";
}

describe("chart sizing", () => {
  it('"Show data" is at least 24px high and wide with a fine pointer', () => {
    const css = cssOf("src/lib/internal/chart-figure.svelte");
    const body = rule(css, ".ta-chart-data");
    expect(body).toMatch(/min-height:\s*1\.5rem/);
    expect(body).toMatch(/min-width:\s*1\.5rem/);
  });

  it("KpiCard wraps the sparkline, not the figure", () => {
    const css = cssOf("src/lib/components/kpi-card.svelte");
    expect(rule(css, ".ta-kpi-main")).toMatch(/flex-wrap:\s*wrap/);
    // `anywhere` lets the figure shrink below its own width, so it broke before the row wrapped.
    expect(rule(css, ".ta-kpi-value")).not.toMatch(/overflow-wrap:\s*anywhere/);
  });
});
