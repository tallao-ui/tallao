import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import { infracciones } from "../axe";
import Flotantes from "../fixtures/Flotantes.svelte";

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
const textoActivo = () => document.activeElement?.textContent?.trim();

describe("Popover", () => {
  it("opens from its trigger, takes the focus, and Escape closes it back to the trigger", async () => {
    render(Flotantes);
    const boton = screen.getByRole("button", { name: "Filtros" });
    expect(boton.getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(boton);
    expect(boton.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("dialog", { name: "Filtros" })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText("Buscar"));
    await userEvent.keyboard("{Escape}");
    expect(screen.getByTestId("popover").textContent).toBe("cerrado");
    expect(document.activeElement).toBe(boton);
  });

  it("closes on a click outside, stays open on a click inside", async () => {
    render(Flotantes);
    await userEvent.click(screen.getByRole("button", { name: "Filtros" }));
    await userEvent.click(screen.getByLabelText("Buscar"));
    expect(screen.getByTestId("popover").textContent).toBe("abierto");
    await userEvent.click(screen.getByRole("button", { name: "Fuera" }));
    expect(screen.getByTestId("popover").textContent).toBe("cerrado");
  });
});

describe("Tooltip", () => {
  it("describes its trigger, shows on focus and hides on Escape", async () => {
    render(Flotantes);
    const boton = screen.getByRole("button", { name: "Copiar" });
    const tip = document.getElementById(boton.getAttribute("aria-describedby")!)!;
    expect(tip.getAttribute("role")).toBe("tooltip");
    expect(tip.textContent?.trim()).toBe("Copia el enlace");
    boton.focus();
    await esperar(10);
    expect(tip.classList.contains("ta-tooltip--abierto")).toBe(true);
    await userEvent.keyboard("{Escape}");
    expect(tip.classList.contains("ta-tooltip--abierto")).toBe(false);
  });
});

describe("DropdownMenu", () => {
  it("ArrowDown opens it on the first item; arrows skip disabled items and wrap", async () => {
    render(Flotantes);
    screen.getByRole("button", { name: "Acciones" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    await tick();
    expect(screen.getByRole("menu", { name: "Acciones" })).toBeTruthy();
    expect(textoActivo()).toBe("Editar");
    await userEvent.keyboard("{ArrowDown}");
    expect(textoActivo()).toBe("Archivar");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(textoActivo()).toBe("Editar");
    await userEvent.keyboard("{End}");
    expect(textoActivo()).toBe("Borrar");
  });

  it("typing a letter jumps to the item that starts with it", async () => {
    render(Flotantes);
    screen.getByRole("button", { name: "Acciones" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    await tick();
    await userEvent.keyboard("b");
    expect(textoActivo()).toBe("Borrar");
  });

  it("Enter runs the item, closes the menu and returns the focus", async () => {
    const onAccion = vi.fn();
    render(Flotantes, { onAccion });
    const boton = screen.getByRole("button", { name: "Acciones" });
    await userEvent.click(boton);
    await tick();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onAccion).toHaveBeenCalledWith("archivar");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(boton);
  });

  it("a disabled item is announced and does nothing", async () => {
    const onAccion = vi.fn();
    render(Flotantes, { onAccion });
    await userEvent.click(screen.getByRole("button", { name: "Acciones" }));
    await tick();
    const duplicar = screen.getByRole("menuitem", { name: "Duplicar" });
    expect(duplicar.getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(duplicar);
    expect(onAccion).not.toHaveBeenCalled();
  });
});

describe("Combobox", () => {
  it("filters ignoring accents, picks with the keyboard and shows the choice", async () => {
    render(Flotantes);
    const campo = screen.getByRole("combobox", { name: "País" }) as HTMLInputElement;
    await userEvent.type(campo, "peru");
    const opciones = screen.getAllByRole("option");
    expect(opciones.map((o) => o.textContent?.trim())).toEqual(["Perú"]);
    expect(campo.getAttribute("aria-activedescendant")).toBe(opciones[0].id);
    await userEvent.keyboard("{Enter}");
    expect(screen.getByTestId("valor").textContent).toBe("pe");
    expect(campo.value).toBe("Perú");
    expect(campo.getAttribute("aria-expanded")).toBe("false");
  });

  it("arrows skip disabled options; Escape closes and restores the chosen label", async () => {
    render(Flotantes);
    const campo = screen.getByRole("combobox", { name: "País" }) as HTMLInputElement;
    campo.focus();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    const activa = document.getElementById(campo.getAttribute("aria-activedescendant")!);
    expect(activa?.textContent?.trim()).toBe("Colombia");
    await userEvent.keyboard("{Enter}");
    await userEvent.type(campo, "xx");
    await userEvent.keyboard("{Escape}");
    expect(campo.value).toBe("Colombia");
  });

  it("says so when nothing matches", async () => {
    render(Flotantes);
    await userEvent.type(screen.getByRole("combobox", { name: "País" }), "zzz");
    expect(screen.getByText("No results")).toBeTruthy();
  });
});

describe("axe on the floating components", () => {
  it("finds no violations with everything closed and with each one open", async () => {
    const { container } = render(Flotantes);
    expect(await infracciones(container)).toEqual([]);
    await userEvent.click(screen.getByRole("button", { name: "Acciones" }));
    await tick();
    expect(await infracciones(container)).toEqual([]);
    await userEvent.keyboard("{Escape}");
    await userEvent.type(screen.getByRole("combobox", { name: "País" }), "e");
    expect(await infracciones(container)).toEqual([]);
  });
});
