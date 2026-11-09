import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import { axeViolations } from "../axe";
import Integrated from "../fixtures/Integrated.svelte";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("SelectionBar", () => {
  it("select-all goes partial, then all, and the actions appear only with something marked", async () => {
    render(Integrated);
    const all = screen.getByRole("checkbox", { name: "Select all" }) as HTMLInputElement;
    expect(screen.queryByRole("button", { name: "Hide" })).toBeNull();
    await userEvent.click(screen.getByRole("checkbox", { name: "Row a" }));
    expect(all.indeterminate).toBe(true);
    expect(screen.getByRole("button", { name: "Hide" })).toBeTruthy();
    expect(screen.getByText("1 selected")).toBeTruthy();
    await userEvent.click(all);
    expect(all.checked).toBe(true);
    expect(screen.getByText("3 selected")).toBeTruthy();
  });
});

describe("CopyButton", () => {
  it("copies the text, says so, and goes back after a while", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const onCopy = vi.fn();
    render(Integrated, { onCopy });
    await userEvent.click(screen.getByRole("button", { name: /kitsuden\.test\/obs|Copy/ }));
    expect(writeText).toHaveBeenCalledWith("https://kitsuden.test/obs");
    expect(onCopy).toHaveBeenCalledWith("https://kitsuden.test/obs");
    expect(screen.getByText("Copied")).toBeTruthy();
    await wait(80);
    expect(screen.queryByText("Copied")).toBeNull();
  });
});

describe("KeyValueEditor", () => {
  it("adds a pair with Enter, replaces an existing key, rejects a non-number and removes by name", async () => {
    render(Integrated);
    const keyField = screen.getByRole("textbox", { name: "Stat" });
    const valueField = screen.getByRole("spinbutton", { name: "Value" });
    await userEvent.type(keyField, "atk");
    await userEvent.type(valueField, "12{Enter}");
    expect(JSON.parse(screen.getByTestId("pairs").textContent!)).toEqual([
      { key: "hp", value: "100" },
      { key: "atk", value: "12" },
    ]);
    await userEvent.type(keyField, "hp");
    await userEvent.type(valueField, "150{Enter}");
    expect(JSON.parse(screen.getByTestId("pairs").textContent!)).toContainEqual({ key: "hp", value: "150" });
    await userEvent.click(screen.getByRole("button", { name: /hp/ }));
    expect(screen.getByTestId("pairs").textContent).not.toContain('"hp"');
  });
});

describe("DragBoard", () => {
  it("moves an item with the keyboard: Space picks it up, arrows choose, Space drops", async () => {
    const onMove = vi.fn();
    render(Integrated, { onMove });
    const item = screen.getByRole("button", { name: "x" });
    item.focus();
    await userEvent.keyboard(" ");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard(" ");
    await tick();
    expect(onMove).toHaveBeenCalledWith("x", "s");
    expect(screen.getByRole("group", { name: "Zone s" }).textContent).toContain("x");
  });

  it("Escape cancels without moving and says so", async () => {
    const onMove = vi.fn();
    render(Integrated, { onMove });
    screen.getByRole("button", { name: "y" }).focus();
    await userEvent.keyboard(" ");
    await userEvent.keyboard("{ArrowDown}{Escape}");
    expect(onMove).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain("Item y was not moved.");
  });
});

describe("ChatMessage", () => {
  it("is an article named by its author, keeps text as text, and a pending one is busy", () => {
    render(Integrated);
    const yours = screen.getByRole("article", { name: "You" });
    expect(yours.textContent).toContain("<b>no html</b>");
    expect(yours.querySelector("b")).toBeNull();
    expect(screen.getByRole("article", { name: "Assistant" }).getAttribute("aria-busy")).toBe("true");
  });
});

describe("changes to existing components", () => {
  it("ConfirmDialog calls onCancel when dismissed, not when confirmed", async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(Integrated, { onCancel, onConfirm });
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("Input hands its element through bind:ref; TableRow and TableCell pass extra attributes", async () => {
    render(Integrated);
    await tick();
    expect(screen.getByTestId("ref").textContent).toBe("INPUT");
    const row = document.querySelector('tr[data-row="1"]')!;
    expect(row.getAttribute("title")).toBe("Row details");
    expect(row.querySelector("td")?.getAttribute("data-cell")).toBe("1");
  });
});

describe("axe on the 0.5 components", () => {
  it("finds no violations", async () => {
    const { container } = render(Integrated);
    expect(await axeViolations(container)).toEqual([]);
  });
});
