import { render } from "@testing-library/svelte";
import { tick } from "svelte";

import { axeViolations } from "../axe";
import AllComponents from "../fixtures/AllComponents.svelte";

describe("axe", () => {
  it("finds no accessibility violations in any component", async () => {
    const { container } = render(AllComponents);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("finds none with a dialog open", async () => {
    const { container } = render(AllComponents, { dialogOpen: true });
    await tick();
    expect(await axeViolations(container)).toEqual([]);
  });
});
