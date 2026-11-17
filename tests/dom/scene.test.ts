import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { axeViolations } from "../axe";
import Scene from "../fixtures/Scene.svelte";
import { layoutScene } from "$lib/components/floating-scene.svelte";

const field = () => screen.getByLabelText("Password") as HTMLInputElement;
const toggle = () => screen.getByRole("button", { name: "Show password" });

describe("PasswordInput", () => {
  it("starts hidden, the toggle shows and hides the text and keeps focus in the field", async () => {
    render(Scene);
    expect(field().type).toBe("password");
    expect(toggle().getAttribute("aria-pressed")).toBe("false");
    await userEvent.click(field());
    await userEvent.click(toggle());
    expect(field().type).toBe("text");
    expect(toggle().getAttribute("aria-pressed")).toBe("true");
    expect(document.activeElement).toBe(field());
    expect(screen.getByTestId("revealed").textContent).toBe("true");
    await userEvent.click(toggle());
    expect(field().type).toBe("password");
    expect(screen.getByTestId("changes").textContent).toBe("true,false");
  });

  it("is a real field: native attributes, typing, and the value in the form", async () => {
    render(Scene);
    expect(field().getAttribute("autocomplete")).toBe("current-password");
    await userEvent.clear(field());
    await userEvent.type(field(), "s3cret");
    const data = new FormData(screen.getByTestId("form") as HTMLFormElement);
    expect(data.get("password")).toBe("s3cret");
  });

  it("the keyboard reaches the toggle after the field, and Space presses it", async () => {
    render(Scene);
    field().focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(toggle());
    await userEvent.keyboard(" ");
    expect(field().type).toBe("text");
  });
});

describe("FloatingScene", () => {
  it("is decorative: hidden from assistive tech, with the content above it", async () => {
    render(Scene);
    const scene = screen.getByTestId("scene");
    const stage = scene.querySelector(".ta-scene-stage")!;
    expect(stage.getAttribute("aria-hidden")).toBe("true");
    expect(stage.querySelectorAll(".ta-scene-tile")).toHaveLength(3);
    expect(stage.textContent).toContain("BEG READ");
    expect(scene.querySelector(".ta-scene-content form")).not.toBeNull();
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it("the layout depends only on the seed", () => {
    const a = layoutScene(6, 11, ["A"]);
    expect(layoutScene(6, 11, ["A"])).toEqual(a);
    expect(layoutScene(6, 12, ["A"])).not.toEqual(a);
    for (const t of a) {
      expect(t.layer).toBeGreaterThanOrEqual(0);
      expect(t.layer).toBeLessThanOrEqual(3);
      // The middle third stays free for the content.
      expect(t.x < 34 || t.x > 66).toBe(true);
    }
  });
});
