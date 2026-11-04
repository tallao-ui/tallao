import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import { infracciones } from "../axe";
import Integrados from "../fixtures/Integrados.svelte";

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("SelectionBar", () => {
  it("select-all goes partial, then all, and the actions appear only with something marked", async () => {
    render(Integrados);
    const todas = screen.getByRole("checkbox", { name: "Select all" }) as HTMLInputElement;
    expect(screen.queryByRole("button", { name: "Ocultar" })).toBeNull();
    await userEvent.click(screen.getByRole("checkbox", { name: "Fila a" }));
    expect(todas.indeterminate).toBe(true);
    expect(screen.getByRole("button", { name: "Ocultar" })).toBeTruthy();
    expect(screen.getByText("1 selected")).toBeTruthy();
    await userEvent.click(todas);
    expect(todas.checked).toBe(true);
    expect(screen.getByText("3 selected")).toBeTruthy();
  });
});

describe("CopyButton", () => {
  it("copies the text, says so, and goes back after a while", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const onCopy = vi.fn();
    render(Integrados, { onCopy });
    await userEvent.click(screen.getByRole("button", { name: /kitsuden\.test\/obs|Copy/ }));
    expect(writeText).toHaveBeenCalledWith("https://kitsuden.test/obs");
    expect(onCopy).toHaveBeenCalledWith("https://kitsuden.test/obs");
    expect(screen.getByText("Copied")).toBeTruthy();
    await esperar(80);
    expect(screen.queryByText("Copied")).toBeNull();
  });
});

describe("KeyValueEditor", () => {
  it("adds a pair with Enter, replaces an existing key, rejects a non-number and removes by name", async () => {
    render(Integrados);
    const clave = screen.getByRole("textbox", { name: "Stat" });
    const valor = screen.getByRole("spinbutton", { name: "Valor" });
    await userEvent.type(clave, "atk");
    await userEvent.type(valor, "12{Enter}");
    expect(JSON.parse(screen.getByTestId("pares").textContent!)).toEqual([
      { key: "hp", value: "100" },
      { key: "atk", value: "12" },
    ]);
    await userEvent.type(clave, "hp");
    await userEvent.type(valor, "150{Enter}");
    expect(JSON.parse(screen.getByTestId("pares").textContent!)).toContainEqual({ key: "hp", value: "150" });
    await userEvent.click(screen.getByRole("button", { name: /hp/ }));
    expect(screen.getByTestId("pares").textContent).not.toContain('"hp"');
  });
});

describe("DragBoard", () => {
  it("moves an item with the keyboard: Space picks it up, arrows choose, Space drops", async () => {
    const onMove = vi.fn();
    render(Integrados, { onMove });
    const item = screen.getByRole("button", { name: "x" });
    item.focus();
    await userEvent.keyboard(" ");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard(" ");
    await tick();
    expect(onMove).toHaveBeenCalledWith("x", "s");
    expect(screen.getByRole("group", { name: "Zona s" }).textContent).toContain("x");
  });

  it("Escape cancels without moving and says so", async () => {
    const onMove = vi.fn();
    render(Integrados, { onMove });
    screen.getByRole("button", { name: "y" }).focus();
    await userEvent.keyboard(" ");
    await userEvent.keyboard("{ArrowDown}{Escape}");
    expect(onMove).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain("Item y was not moved.");
  });
});

describe("ChatMessage", () => {
  it("is an article named by its author, keeps text as text, and a pending one is busy", () => {
    render(Integrados);
    const tuyo = screen.getByRole("article", { name: "You" });
    expect(tuyo.textContent).toContain("<b>no html</b>");
    expect(tuyo.querySelector("b")).toBeNull();
    expect(screen.getByRole("article", { name: "Assistant" }).getAttribute("aria-busy")).toBe("true");
  });
});

describe("changes to existing components", () => {
  it("ConfirmDialog calls onCancel when dismissed, not when confirmed", async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(Integrados, { onCancel, onConfirm });
    await userEvent.click(screen.getByRole("button", { name: "Borrar" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole("button", { name: "Borrar" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("Input hands its element through bind:ref; TableRow and TableCell pass extra attributes", async () => {
    render(Integrados);
    await tick();
    expect(screen.getByTestId("ref").textContent).toBe("INPUT");
    const fila = document.querySelector('tr[data-fila="1"]')!;
    expect(fila.getAttribute("title")).toBe("Detalle de la fila");
    expect(fila.querySelector("td")?.getAttribute("data-celda")).toBe("1");
  });
});

describe("axe on the 0.5 components", () => {
  it("finds no violations", async () => {
    const { container } = render(Integrados);
    expect(await infracciones(container)).toEqual([]);
  });
});
