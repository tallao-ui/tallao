import { render } from "@testing-library/svelte";
import { tick } from "svelte";

import { infracciones } from "../axe";
import Todo from "../fixtures/Todo.svelte";

describe("axe", () => {
  it("finds no accessibility violations in any component", async () => {
    const { container } = render(Todo);
    expect(await infracciones(container)).toEqual([]);
  });

  it("finds none with a dialog open", async () => {
    const { container } = render(Todo, { abierto: true });
    await tick();
    expect(await infracciones(container)).toEqual([]);
  });
});
