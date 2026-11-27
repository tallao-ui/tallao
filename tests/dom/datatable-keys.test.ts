import { fireEvent, render, screen } from "@testing-library/svelte";
import { tick } from "svelte";

import DataTableKeys from "../fixtures/DataTableKeys.svelte";

const link = (name: string) => screen.getByRole("link", { name });
const press = async (target: Element, key: string) => {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  await tick();
  return event;
};
const activeRows = (container: HTMLElement) =>
  [...container.querySelectorAll("tr[data-active] a")].map((a) => a.textContent?.trim());

describe("DataTable keyboard", () => {
  it("j / k and the arrows move the focus between rows, and mark the row", async () => {
    const { container } = render(DataTableKeys);
    link("Alpha").focus();
    const event = await press(link("Alpha"), "j");
    expect(document.activeElement).toBe(link("Beta"));
    expect(event.defaultPrevented).toBe(true);
    expect(activeRows(container)).toEqual(["Beta"]);
    await press(link("Beta"), "ArrowDown");
    expect(document.activeElement).toBe(link("Gamma"));
    // The last row stays the last.
    await press(link("Gamma"), "j");
    expect(document.activeElement).toBe(link("Gamma"));
    await press(link("Gamma"), "k");
    await press(link("Beta"), "ArrowUp");
    expect(document.activeElement).toBe(link("Alpha"));
  });

  it("x toggles the row's selection, e and Enter call back with the row", async () => {
    const onRowOpen = vi.fn();
    const onRowEdit = vi.fn();
    render(DataTableKeys, { props: { onRowOpen, onRowEdit } });
    link("Beta").focus();
    await press(link("Beta"), "x");
    expect((screen.getByRole("checkbox", { name: /b$/ }) as HTMLInputElement).checked).toBe(true);
    await press(link("Beta"), "e");
    expect(onRowEdit).toHaveBeenCalledWith({ id: "b", name: "Beta" });
    await press(link("Beta"), "Enter");
    expect(onRowOpen).toHaveBeenCalledWith({ id: "b", name: "Beta" });
  });

  it("Enter on a link is left to the browser when nobody handles it", async () => {
    render(DataTableKeys);
    link("Alpha").focus();
    const event = await press(link("Alpha"), "Enter");
    expect(event.defaultPrevented).toBe(false);
  });

  it("leaves text fields, modifiers and unknown keys alone", async () => {
    const { container } = render(DataTableKeys);
    const filter = container.querySelector(".ta-datatable input:not([type=checkbox])")!;
    expect((await press(filter, "j")).defaultPrevented).toBe(false);
    link("Alpha").focus();
    const withCtrl = new KeyboardEvent("keydown", { key: "j", ctrlKey: true, bubbles: true, cancelable: true });
    link("Alpha").dispatchEvent(withCtrl);
    expect(withCtrl.defaultPrevented).toBe(false);
    expect((await press(link("Alpha"), "q")).defaultPrevented).toBe(false);
  });

  it("off by default: no key is taken, no row is marked", async () => {
    const { container } = render(DataTableKeys, { props: { keyboard: false } });
    link("Alpha").focus();
    expect((await press(link("Alpha"), "j")).defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(link("Alpha"));
    expect(activeRows(container)).toEqual([]);
  });

  it('"page" takes the keys from anywhere on the page, but not from a text field', async () => {
    render(DataTableKeys, { props: { keyboard: "page" } });
    (document.activeElement as HTMLElement | null)?.blur();
    await press(document.body, "j");
    expect(document.activeElement).toBe(link("Alpha"));
    expect((await press(screen.getByTestId("outside"), "j")).defaultPrevented).toBe(false);
  });

  it("a button in the row, in the header or on the page keeps its own Enter and arrows", async () => {
    const onRowOpen = vi.fn();
    render(DataTableKeys, { props: { onRowOpen, keyboard: "page" } });
    link("Beta").focus();
    await press(link("Beta"), "j"); // Gamma is the active row now
    const actions = screen.getByRole("button", { name: "Actions: Gamma" });
    actions.focus();
    // Enter opens the button's menu, not the row; ↓ is the menu's too.
    expect((await press(actions, "Enter")).defaultPrevented).toBe(false);
    expect((await press(actions, "ArrowDown")).defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(actions);
    const sort = screen.getByRole("button", { name: /Name/ });
    expect((await press(sort, "Enter")).defaultPrevented).toBe(false);
    expect((await press(screen.getByTestId("outside-button"), "Enter")).defaultPrevented).toBe(false);
    expect(onRowOpen).not.toHaveBeenCalled();
    // j and k still move from a button: no button does anything with a letter.
    await press(actions, "k");
    expect(document.activeElement).toBe(link("Beta"));
  });

  it("Escape lets the row go", async () => {
    const { container } = render(DataTableKeys);
    link("Alpha").focus();
    await press(link("Alpha"), "j");
    await press(link("Beta"), "Escape");
    expect(activeRows(container)).toEqual([]);
  });
});
