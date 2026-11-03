import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import { toast } from "$lib/toast.svelte";
import { infracciones } from "../axe";
import Nuevos from "../fixtures/Nuevos.svelte";

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
const textoActivo = () => document.activeElement?.textContent?.trim();

afterEach(() => toast.dismiss());

describe("Switch", () => {
  it("is a named switch that toggles by click, by its label and by keyboard", async () => {
    render(Nuevos);
    const sw = screen.getByRole("switch", { name: "Notificaciones" });
    expect(sw.getAttribute("aria-checked")).toBe("false");
    await userEvent.click(sw);
    expect(sw.getAttribute("aria-checked")).toBe("true");
    await userEvent.click(screen.getByText("Notificaciones"));
    expect(screen.getByTestId("activo").textContent).toBe("false");
    sw.focus();
    await userEvent.keyboard(" ");
    expect(sw.getAttribute("aria-checked")).toBe("true");
  });
});

describe("RadioGroup", () => {
  it("is a group named by its legend; choosing an option sets the value", async () => {
    render(Nuevos);
    const grupo = screen.getByRole("group", { name: "Plan" });
    expect(grupo.tagName).toBe("FIELDSET");
    expect((screen.getByRole("radio", { name: "Pro" }) as HTMLInputElement).checked).toBe(true);
    await userEvent.click(screen.getByRole("radio", { name: "Gratis" }));
    expect(screen.getByTestId("plan").textContent).toBe("free");
    expect((screen.getByRole("radio", { name: "Equipo" }) as HTMLInputElement).disabled).toBe(true);
    expect(screen.getByRole("radio", { name: "Pro" }).getAttribute("aria-describedby")).toBeTruthy();
  });
});

describe("Sheet", () => {
  it("opens as a modal dialog against the right edge", async () => {
    render(Nuevos);
    await userEvent.click(screen.getByRole("button", { name: "Ver detalle" }));
    const d = [...document.querySelectorAll("dialog")].find((x) => x.open)!;
    expect(d.dataset.placement).toBe("right");
    expect(d.textContent).toContain("Contenido");
    d.dispatchEvent(new Event("cancel", { cancelable: true }));
    await tick();
    expect(d.open).toBe(false);
  });
});

describe("Toast", () => {
  it("shows in a named live region; an error is an alert; the close button dismisses", async () => {
    render(Nuevos);
    toast.success("Guardado", { description: "Todo bien" });
    toast.error("Falló");
    await tick();
    const region = screen.getByRole("region", { name: "Notifications" });
    expect(region.querySelector("[aria-live=polite]")).toBeTruthy();
    expect(screen.getByText("Guardado")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toContain("Falló");
    await userEvent.click(screen.getAllByRole("button", { name: "Dismiss" })[0]);
    expect(screen.queryByText("Guardado")).toBeNull();
  });

  it("goes away on its own after its duration, and an action runs once", async () => {
    render(Nuevos);
    const onClick = vi.fn();
    toast("Breve", { duration: 30 });
    toast("Con acción", { duration: Infinity, action: { label: "Deshacer", onClick } });
    await tick();
    await esperar(80);
    expect(screen.queryByText("Breve")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Deshacer" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.queryByText("Con acción")).toBeNull();
  });
});

describe("Command", () => {
  it("opens with Ctrl+K, filters by keyword without accents, and Enter runs the item", async () => {
    const onAccion = vi.fn();
    render(Nuevos, { onAccion });
    await userEvent.keyboard("{Control>}k{/Control}");
    expect(screen.getByTestId("paleta").textContent).toBe("true");
    const buscador = screen.getByRole("combobox", { name: "Command palette" });
    expect(document.activeElement).toBe(buscador);
    await userEvent.type(buscador, "OSCURO");
    expect(screen.getAllByRole("option").map((o) => o.querySelector("span")?.textContent)).toEqual(["Cambiar tema"]);
    await userEvent.keyboard("{Enter}");
    expect(onAccion).toHaveBeenCalledWith("tema");
    expect(screen.getByTestId("paleta").textContent).toBe("false");
  });

  it("skips disabled items and says when nothing matches", async () => {
    render(Nuevos);
    await userEvent.keyboard("{Control>}k{/Control}");
    const buscador = screen.getByRole("combobox", { name: "Command palette" });
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    const activa = document.getElementById(buscador.getAttribute("aria-activedescendant")!);
    expect(activa?.querySelector("span")?.textContent).toBe("Nuevo proyecto");
    await userEvent.type(buscador, "zzz");
    expect(screen.getByText("No results")).toBeTruthy();
  });
});

describe("ContextMenu", () => {
  it("opens on right click with the focus on the first item; Enter runs it", async () => {
    const onAccion = vi.fn();
    render(Nuevos, { onAccion });
    await fireEvent.contextMenu(screen.getByTestId("zona"), { clientX: 40, clientY: 40 });
    await tick();
    expect(screen.getByRole("menu", { name: "Acciones de la fila" })).toBeTruthy();
    expect(textoActivo()).toBe("Abrir");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onAccion).toHaveBeenCalledWith("borrar");
    expect(document.activeElement).toBe(screen.getByTestId("zona"));
  });

  it("opens from the keyboard with Shift+F10 and closes with Escape", async () => {
    render(Nuevos);
    const zona = screen.getByTestId("zona");
    zona.focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await tick();
    expect(screen.getByRole("menu")).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(zona);
  });
});

describe("Accordion, Progress, Avatar", () => {
  it("uses details/summary, exclusive when single", () => {
    render(Nuevos);
    const secciones = [...document.querySelectorAll("details")];
    expect(secciones).toHaveLength(2);
    expect(secciones[0].open).toBe(true);
    expect(secciones[0].getAttribute("name")).toBe(secciones[1].getAttribute("name"));
  });

  it("reports progress, and an indeterminate bar has no value", () => {
    render(Nuevos);
    expect(screen.getByRole("progressbar", { name: "Subida" }).getAttribute("aria-valuenow")).toBe("30");
    expect(screen.getByText("30%")).toBeTruthy();
    expect(screen.getByRole("progressbar", { name: "Sincronizando" }).hasAttribute("aria-valuenow")).toBe(false);
  });

  it("names the avatar and falls back to the initials when the image fails", async () => {
    render(Nuevos);
    expect(screen.getByRole("img", { name: "Ana López" }).textContent).toContain("AL");
    const agente = screen.getByRole("img", { name: "Agente Uno" });
    agente.querySelector("img")!.dispatchEvent(new Event("error"));
    await tick();
    expect(agente.textContent).toContain("AU");
  });
});

describe("axe on the 0.4 components", () => {
  it("finds no violations", async () => {
    const { container } = render(Nuevos);
    toast.info("Aviso");
    await tick();
    expect(await infracciones(container)).toEqual([]);
    expect(await infracciones(document.querySelector(".ta-toaster")!)).toEqual([]);
  });
});
