import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import { axeViolations } from "../axe";
import Facets from "../fixtures/Facets.svelte";

const state = () => JSON.parse(screen.getByTestId("state").textContent!);

describe("ToggleGroup with icon-only options (variant bare)", () => {
  it("names each icon button by its option, with its title, colour, class and style", () => {
    render(Facets);
    const group = screen.getByRole("group", { name: "Type" });
    expect(group.classList.contains("ta-toggle-group--bare")).toBe(true);
    const fire = screen.getByRole("button", { name: "Fire" });
    expect(fire.getAttribute("title")).toBe("Fire");
    expect(fire.getAttribute("style")).toContain("--ta-toggle-accent: #e4572e");
    expect(screen.getByRole("button", { name: "Water" }).classList.contains("facet-water")).toBe(true);
    expect(screen.getByRole("button", { name: "Grass" }).getAttribute("style")).toContain("--ta-toggle-accent: #2a9d8f");
    const ice = screen.getByRole("button", { name: "Ice" }) as HTMLButtonElement;
    expect(ice.disabled).toBe(true);
    expect(ice.hasAttribute("style")).toBe(false);
  });

  it("dims the others only while one is pressed, and the item snippet knows it is pressed", async () => {
    render(Facets);
    const group = screen.getByRole("group", { name: "Type" });
    expect(group.classList.contains("ta-toggle-group--dimmed")).toBe(false);
    const fire = screen.getByRole("button", { name: "Fire" });
    await userEvent.click(fire);
    expect(fire.getAttribute("aria-pressed")).toBe("true");
    expect(fire.querySelector("svg")?.getAttribute("data-active")).toBe("true");
    expect(group.classList.contains("ta-toggle-group--dimmed")).toBe(true);
    expect(state().types).toEqual(["fire"]);
    await userEvent.click(fire);
    expect(group.classList.contains("ta-toggle-group--dimmed")).toBe(false);
  });

  it("dimOthers works on the other variants too, and a text option keeps its text as name", async () => {
    render(Facets);
    const form = screen.getByRole("group", { name: "Form" });
    expect(form.classList.contains("ta-toggle-group--bare")).toBe(false);
    expect(form.classList.contains("ta-toggle-group--dimmed")).toBe(false);
    await userEvent.click(screen.getByRole("button", { name: "Base" }));
    expect(state().form).toBe("base");
    expect(form.classList.contains("ta-toggle-group--dimmed")).toBe(true);
    expect(screen.getByRole("button", { name: "Alpha" }).getAttribute("title")).toBe("Alpha form");
  });

  it("has no axe violations", async () => {
    render(Facets);
    await userEvent.click(screen.getByRole("button", { name: "Water" }));
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
