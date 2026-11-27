import { render } from "@testing-library/svelte";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import SelectionBar from "$lib/components/selection-bar.svelte";

describe("SelectionBar floating", () => {
  it("adds the floating class only when asked", () => {
    const { container, unmount } = render(SelectionBar, {
      props: { total: 3, selected: 1, onToggleAll: () => {}, floating: true },
    });
    expect(container.querySelector(".ta-selection-bar--floating")).toBeTruthy();
    unmount();
    const plain = render(SelectionBar, { props: { total: 3, selected: 1, onToggleAll: () => {} } });
    expect(plain.container.querySelector(".ta-selection-bar--floating")).toBeNull();
  });

  it("sticks to the bottom on the floating level, and keeps still under reduced motion", () => {
    const source = readFileSync(
      join(import.meta.dirname, "..", "..", "src", "lib", "components", "selection-bar.svelte"),
      "utf8"
    );
    const rule = source.slice(source.indexOf(".ta-selection-bar--floating {"));
    expect(rule).toMatch(/position: sticky;\s+bottom: 1rem;/);
    expect(rule).toContain("var(--ta-float, var(--ta-surface))");
    expect(source).toMatch(/prefers-reduced-motion: reduce\) \{\s+\.ta-selection-bar--floating \{\s+animation: none;/);
  });
});
