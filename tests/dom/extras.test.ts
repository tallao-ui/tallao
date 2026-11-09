import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import { axeViolations } from "../axe";
import Extras from "../fixtures/Extras.svelte";

const state = () => JSON.parse(screen.getByTestId("state").textContent!);

describe("NumberInput", () => {
  it("binds a number, steps within min and max, and posts it", async () => {
    render(Extras);
    const field = screen.getByRole("spinbutton", { name: "Quantity" }) as HTMLInputElement;
    await userEvent.click(screen.getByRole("button", { name: "Increase" }));
    await userEvent.click(screen.getByRole("button", { name: "Increase" }));
    expect(state().quantity).toBe(5);
    expect((screen.getByRole("button", { name: "Increase" }) as HTMLButtonElement).disabled).toBe(true);
    await userEvent.clear(field);
    expect(state().quantity).toBeNull();
    await userEvent.type(field, "9");
    expect(state().quantity).toBe(9);
    await fireEvent.blur(field);
    expect(state().quantity).toBe(5);
    expect(field.value).toBe("5");
    expect(new FormData(screen.getByTestId("form") as HTMLFormElement).get("quantity")).toBe("5");
  });
});

describe("Rating", () => {
  it("is a named group of radios that sets and posts the value", async () => {
    render(Extras);
    expect(screen.getByRole("group", { name: "What did you think?" })).toBeTruthy();
    await userEvent.click(screen.getByRole("radio", { name: "4 of 5" }));
    expect(state().rating).toBe(4);
    expect(new FormData(screen.getByTestId("form") as HTMLFormElement).get("rating")).toBe("4");
    expect(screen.getByRole("img", { name: "Average rating: 4 of 5" })).toBeTruthy();
  });
});

describe("new options", () => {
  it("Select width auto, Tabs pills with tab and end snippets, ToggleGroup segmented and solid", async () => {
    render(Extras);
    expect(screen.getByRole("combobox", { name: "Short" }).className).toContain("ta-select--auto");
    const list = screen.getByRole("tablist", { name: "Views" });
    expect(list.closest(".ta-tabs")!.className).toContain("ta-tabs--pills");
    expect(screen.getByRole("tab", { name: "Tree ✓" }).className).toContain("my-tab");
    // The end button stays outside the tablist.
    const reset = screen.getByRole("button", { name: "Reset" });
    expect(list.contains(reset)).toBe(false);
    await userEvent.click(screen.getByRole("tab", { name: "Team" }));
    expect(screen.getByText("Panel b")).toBeTruthy();

    const group = screen.getByRole("group", { name: "Mode" });
    expect(group.className).toContain("ta-toggle-group--segmented");
    const two = screen.getByRole("button", { name: "Two" });
    expect(two.className).toContain("my-button");
    expect(two.className).toContain("ta-toggle-group-button--solid");
    await userEvent.click(two);
    expect(state().mode).toBe("b");
  });

  it("Dialog shows its close button without a title", async () => {
    render(Extras);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    const d = [...document.querySelectorAll("dialog")].find((x) => x.open)!;
    expect(d.getAttribute("aria-label")).toBe("Certificate");
    expect(d.querySelector(".ta-dialog--bare")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await tick();
    expect(d.open).toBe(false);
  });

  it("Slider goes back to the value its owner kept when a change is refused", async () => {
    render(Extras);
    const s = screen.getByRole("slider", { name: "Cap" }) as HTMLInputElement;
    await fireEvent.input(s, { target: { value: "80" } });
    await fireEvent.change(s);
    await tick();
    await tick();
    expect(state().cap).toBe(50);
    expect(s.value).toBe("50");
  });
});

describe("axe on NumberInput, Rating and the new options", () => {
  it("finds no violations", async () => {
    const { container } = render(Extras);
    expect(await axeViolations(container)).toEqual([]);
  });
});
