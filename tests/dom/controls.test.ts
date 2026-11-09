import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import { axeViolations } from "../axe";
import Controls from "../fixtures/Controls.svelte";

const state = () => JSON.parse(screen.getByTestId("state").textContent!);

describe("Slider", () => {
  it("is a native range named by its label, read out through valueText", async () => {
    render(Controls);
    const level = screen.getByRole("slider", { name: "Level" }) as HTMLInputElement;
    expect(level.type).toBe("range");
    expect(level.getAttribute("aria-valuetext")).toBe("Lv. 30");
    expect(screen.getByText("Lv. 30").tagName).toBe("OUTPUT");
    await fireEvent.input(level, { target: { value: "45" } });
    expect(state().level).toBe(45);
    expect(level.getAttribute("aria-valuetext")).toBe("Lv. 45");
    await fireEvent.change(level);
    expect(state().released).toBe(45);
    expect(screen.getByRole("slider", { name: "Volume" })).toBeTruthy();
  });

  it("posts its value in a form", () => {
    render(Controls);
    expect(new FormData(screen.getByTestId("form") as HTMLFormElement).get("level")).toBe("30");
  });
});

describe("SearchInput", () => {
  it("is always named, and its clear button empties it and returns the focus", async () => {
    render(Controls);
    const field = screen.getByRole("searchbox", { name: "Search species…" });
    expect(screen.getByRole("searchbox", { name: "Filter pairs" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
    await userEvent.type(field, "wolf");
    expect(state().search).toBe("wolf");
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(state().search).toBe("");
    expect(document.activeElement).toBe(field);
  });

  it("empties with Escape", async () => {
    render(Controls);
    const field = screen.getByRole("searchbox", { name: "Search species…" });
    await userEvent.type(field, "fox{Escape}");
    expect(state().search).toBe("");
  });
});

describe("Toggle and ToggleGroup", () => {
  it("a toggle is a pressed button", async () => {
    render(Controls);
    const t = screen.getByRole("button", { name: "Favourites only" });
    expect(t.getAttribute("aria-pressed")).toBe("false");
    await userEvent.click(t);
    expect(t.getAttribute("aria-pressed")).toBe("true");
    expect(state().favourites).toBe(true);
  });

  it("a single group keeps one pressed (required), skips disabled options and posts its value", async () => {
    render(Controls);
    expect(screen.getByRole("group", { name: "Rarity" })).toBeTruthy();
    const all = screen.getByRole("button", { name: "All" });
    expect(all.getAttribute("aria-pressed")).toBe("true");
    await userEvent.click(all);
    expect(state().rarity).toBe("all");
    await userEvent.click(screen.getByRole("button", { name: /Rare/ }));
    expect(state().rarity).toBe("rare");
    expect(all.getAttribute("aria-pressed")).toBe("false");
    expect((screen.getByRole("button", { name: "Epic" }) as HTMLButtonElement).disabled).toBe(true);
    const data = new FormData(screen.getByTestId("form") as HTMLFormElement);
    expect(data.get("rarity")).toBe("rare");
  });

  it("a multiple group toggles each value", async () => {
    render(Controls);
    await userEvent.click(screen.getByRole("button", { name: "Water" }));
    expect(state().types).toEqual(["fire", "water"]);
    await userEvent.click(screen.getByRole("button", { name: "Fire" }));
    expect(state().types).toEqual(["water"]);
    expect(new FormData(screen.getByTestId("form") as HTMLFormElement).getAll("type")).toEqual(["water"]);
  });
});

describe("axe on Slider, SearchInput, Toggle and ToggleGroup", () => {
  it("finds no violations", async () => {
    const { container } = render(Controls);
    await userEvent.type(screen.getByRole("searchbox", { name: "Search species…" }), "a");
    expect(await axeViolations(container)).toEqual([]);
  });
});
