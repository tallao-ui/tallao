import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import { axeViolations } from "../axe";
import Floating from "../fixtures/Floating.svelte";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const activeText = () => document.activeElement?.textContent?.trim();

describe("Popover", () => {
  it("opens from its trigger, takes the focus, and Escape closes it back to the trigger", async () => {
    render(Floating);
    const button = screen.getByRole("button", { name: "Filters" });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("dialog", { name: "Filters" })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText("Search"));
    await userEvent.keyboard("{Escape}");
    expect(screen.getByTestId("popover").textContent).toBe("closed");
    expect(document.activeElement).toBe(button);
  });

  it("closes on a click outside, stays open on a click inside", async () => {
    render(Floating);
    await userEvent.click(screen.getByRole("button", { name: "Filters" }));
    await userEvent.click(screen.getByLabelText("Search"));
    expect(screen.getByTestId("popover").textContent).toBe("open");
    await userEvent.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.getByTestId("popover").textContent).toBe("closed");
  });
});

describe("Tooltip", () => {
  it("describes its trigger, shows on focus and hides on Escape", async () => {
    render(Floating);
    const button = screen.getByRole("button", { name: "Copy" });
    const tip = document.getElementById(button.getAttribute("aria-describedby")!)!;
    expect(tip.getAttribute("role")).toBe("tooltip");
    expect(tip.textContent?.trim()).toBe("Copies the link");
    button.focus();
    await wait(10);
    expect(tip.classList.contains("ta-tooltip--open")).toBe(true);
    await userEvent.keyboard("{Escape}");
    expect(tip.classList.contains("ta-tooltip--open")).toBe(false);
  });
});

describe("DropdownMenu", () => {
  it("ArrowDown opens it on the first item; arrows skip disabled items and wrap", async () => {
    render(Floating);
    screen.getByRole("button", { name: "Actions" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    await tick();
    expect(screen.getByRole("menu", { name: "Actions" })).toBeTruthy();
    expect(activeText()).toBe("Edit");
    await userEvent.keyboard("{ArrowDown}");
    expect(activeText()).toBe("Archive");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(activeText()).toBe("Edit");
    await userEvent.keyboard("{End}");
    expect(activeText()).toBe("Remove");
  });

  it("typing a letter jumps to the item that starts with it", async () => {
    render(Floating);
    screen.getByRole("button", { name: "Actions" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    await tick();
    await userEvent.keyboard("r");
    expect(activeText()).toBe("Remove");
  });

  it("Enter runs the item, closes the menu and returns the focus", async () => {
    const onAction = vi.fn();
    render(Floating, { onAction });
    const button = screen.getByRole("button", { name: "Actions" });
    await userEvent.click(button);
    await tick();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onAction).toHaveBeenCalledWith("archive");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it("a disabled item is announced and does nothing", async () => {
    const onAction = vi.fn();
    render(Floating, { onAction });
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await tick();
    const duplicate = screen.getByRole("menuitem", { name: "Duplicate" });
    expect(duplicate.getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(duplicate);
    expect(onAction).not.toHaveBeenCalled();
  });
});

describe("Combobox", () => {
  it("filters ignoring accents, picks with the keyboard and shows the choice", async () => {
    render(Floating);
    const field = screen.getByRole("combobox", { name: "Country" }) as HTMLInputElement;
    await userEvent.type(field, "reunion");
    const options = screen.getAllByRole("option");
    expect(options.map((o) => o.textContent?.trim())).toEqual(["Réunion"]);
    expect(field.getAttribute("aria-activedescendant")).toBe(options[0].id);
    await userEvent.keyboard("{Enter}");
    expect(screen.getByTestId("value").textContent).toBe("re");
    expect(field.value).toBe("Réunion");
    expect(field.getAttribute("aria-expanded")).toBe("false");
  });

  it("arrows skip disabled options; Escape closes and restores the chosen label", async () => {
    render(Floating);
    const field = screen.getByRole("combobox", { name: "Country" }) as HTMLInputElement;
    field.focus();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    const active = document.getElementById(field.getAttribute("aria-activedescendant")!);
    expect(active?.textContent?.trim()).toBe("Colombia");
    await userEvent.keyboard("{Enter}");
    await userEvent.type(field, "xx");
    await userEvent.keyboard("{Escape}");
    expect(field.value).toBe("Colombia");
  });

  it("says so when nothing matches", async () => {
    render(Floating);
    await userEvent.type(screen.getByRole("combobox", { name: "Country" }), "zzz");
    expect(screen.getByText("No results")).toBeTruthy();
  });
});

describe("axe on the floating components", () => {
  it("finds no violations with everything closed and with each one open", async () => {
    const { container } = render(Floating);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await tick();
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.keyboard("{Escape}");
    await userEvent.type(screen.getByRole("combobox", { name: "Country" }), "e");
    expect(await axeViolations(container)).toEqual([]);
  });
});
