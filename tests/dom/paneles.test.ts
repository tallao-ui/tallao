import { fireEvent, render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import CodeEditor from "$lib/code/code-editor.svelte";
import { infracciones } from "../axe";
import Paneles from "../fixtures/Paneles.svelte";

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("Breadcrumb", () => {
  it("is a named nav with an ordered list; the last item is the current page", () => {
    render(Paneles);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getAllByRole("listitem")).toHaveLength(3);
    expect(within(nav).getByRole("link", { name: "Kons" }).getAttribute("href")).toBe("/kons");
    expect(within(nav).getByText("Agile").getAttribute("aria-current")).toBe("page");
  });
});

describe("Icon", () => {
  it("is decorative without a label and an image with one", () => {
    const { container } = render(Paneles);
    expect(screen.getByRole("img", { name: "Agente" }).tagName.toLowerCase()).toBe("svg");
    expect(container.querySelectorAll("svg[aria-hidden=true]").length).toBeGreaterThan(0);
  });
});

describe("SplitPane", () => {
  it("is a named separator that moves with the arrows, Home, End and Enter", async () => {
    render(Paneles);
    const sep = screen.getByRole("separator", { name: "Ancho de la lista" });
    expect(sep.getAttribute("aria-valuenow")).toBe("40");
    sep.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByTestId("ancho").textContent).toBe("45");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(sep.getAttribute("aria-valuenow")).toBe("35");
    await userEvent.keyboard("{End}");
    expect(sep.getAttribute("aria-valuenow")).toBe("85");
    await userEvent.keyboard("{Home}");
    expect(sep.getAttribute("aria-valuenow")).toBe("15");
    await userEvent.keyboard("{Enter}");
    expect(sep.getAttribute("aria-valuenow")).not.toBe("15");
    expect(document.getElementById(sep.getAttribute("aria-controls")!)?.textContent).toContain("Lista");
  });
});

describe("Sidebar", () => {
  it("marks the current page and opens its branch; the others stay closed", () => {
    render(Paneles);
    const nav = screen.getByRole("navigation", { name: "Navigation" });
    expect(within(nav).getByRole("link", { name: "Agile" }).getAttribute("aria-current")).toBe("page");
    expect(within(nav).getByRole("button", { name: "Kons" }).getAttribute("aria-expanded")).toBe("true");
    expect(within(nav).getByRole("button", { name: "Ajustes" }).getAttribute("aria-expanded")).toBe("false");
    expect(within(nav).queryByRole("link", { name: "Cuenta" })).toBeNull();
  });

  it("opens a branch with its disclosure button and collapses the bar", async () => {
    render(Paneles);
    const nav = screen.getByRole("navigation", { name: "Navigation" });
    await userEvent.click(within(nav).getByRole("button", { name: "Ajustes" }));
    expect(within(nav).getByRole("link", { name: "Cuenta" })).toBeTruthy();
    await userEvent.click(within(nav).getByRole("button", { name: "Collapse" }));
    expect(screen.getByTestId("plegada").textContent).toBe("true");
    // Plegada, cada enlace conserva su nombre.
    expect(within(nav).getByRole("link", { name: "Inicio" })).toBeTruthy();
    expect(within(nav).getByRole("button", { name: "Expand" }).getAttribute("aria-expanded")).toBe("false");
  });
});

describe("BarChart and LineChart", () => {
  it("are sliders over the categories that read each one out", async () => {
    render(Paneles);
    const barras = screen.getByRole("slider", { name: "Visitas por mes" });
    barras.focus();
    await tick();
    expect(barras.getAttribute("aria-valuetext")).toBe("Ene: Visitas 120, Altas 30");
    await userEvent.keyboard("{ArrowRight}");
    expect(barras.getAttribute("aria-valuetext")).toBe("Feb: Visitas 180, Altas 45");
    await userEvent.keyboard("{End}");
    expect(barras.getAttribute("aria-valuetext")).toBe("Mar: Visitas 150, Altas —");
    await userEvent.keyboard("{Escape}");
    expect(barras.getAttribute("aria-valuetext")).toBe("Visitas por mes");

    const linea = screen.getByRole("slider", { name: "Tendencia" });
    linea.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(linea.getAttribute("aria-valuetext")).toContain("Visitas");
  });

  it("have a legend for two or more series only, and a table view", async () => {
    render(Paneles);
    const [figBarras, figLinea] = screen.getAllByRole("figure");
    expect(within(figBarras).getByRole("list").textContent).toContain("Altas");
    expect(within(figLinea).queryByRole("list")).toBeNull();
    const boton = within(figBarras).getByRole("button", { name: "Show data" });
    expect(boton.getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(boton);
    expect(boton.getAttribute("aria-expanded")).toBe("true");
    const tabla = within(figBarras).getByRole("table");
    expect(within(tabla).getAllByRole("row")).toHaveLength(4);
    expect(tabla.textContent).toContain("180");
  });
});

describe("SchemaForm", () => {
  it("builds the fields from the schema, with labels and defaults", () => {
    render(Paneles);
    expect((screen.getByLabelText(/Título/) as HTMLInputElement).value).toBe("Hola");
    expect((screen.getByLabelText(/Correo/) as HTMLInputElement).type).toBe("email");
    expect(screen.getByLabelText(/Estado/).tagName).toBe("SELECT");
    expect((screen.getByLabelText(/Nivel/) as HTMLInputElement).type).toBe("number");
    expect(screen.getByRole("switch", { name: "Activo" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Autor" })).toBeTruthy();
    expect(screen.getByText("Lo que se ve arriba")).toBeTruthy();
  });

  it("does not submit while invalid: shows the errors and focuses the first one", async () => {
    const onEnviar = vi.fn();
    render(Paneles, { onEnviar });
    const titulo = screen.getByLabelText(/Título/) as HTMLInputElement;
    await userEvent.clear(titulo);
    await userEvent.type(titulo, "ab");
    await userEvent.type(screen.getByLabelText(/Correo/), "no-es-correo");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onEnviar).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(titulo);
    expect(titulo.getAttribute("aria-invalid")).toBe("true");
    const alertas = screen.getAllByRole("alert").map((a) => a.textContent);
    expect(alertas).toEqual(expect.arrayContaining([expect.stringContaining("Invalid"), "Required"]));
  });

  it("does not paint the error on blur when focus goes to submit (the button would move under the click)", async () => {
    render(Paneles);
    const titulo = screen.getByLabelText(/Título/) as HTMLInputElement;
    await userEvent.clear(titulo);
    await userEvent.type(titulo, "ab");
    await fireEvent.blur(titulo, { relatedTarget: screen.getByRole("button", { name: "Save" }) });
    expect(titulo.getAttribute("aria-invalid")).toBeNull();
    await fireEvent.blur(titulo, { relatedTarget: null });
    expect(titulo.getAttribute("aria-invalid")).toBe("true");
  });

  it("submits the typed value once it is valid", async () => {
    const onEnviar = vi.fn();
    render(Paneles, { onEnviar });
    await userEvent.type(screen.getByLabelText(/Título/), " mundo");
    await userEvent.selectOptions(screen.getByLabelText(/Estado/), "live");
    await userEvent.type(screen.getByLabelText(/Nivel/), "3");
    await userEvent.click(screen.getByRole("switch", { name: "Activo" }));
    await userEvent.type(screen.getByLabelText(/Nombre del autor/), "Ana");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onEnviar).toHaveBeenCalledOnce();
    expect(onEnviar.mock.calls[0][0]).toEqual({
      titulo: "Hola mundo",
      correo: "",
      estado: "live",
      nivel: 3,
      activo: true,
      autor: { nombre: "Ana" },
    });
  });

  it("checks numbers against minimum and maximum, and the pattern", async () => {
    const onEnviar = vi.fn();
    render(Paneles, { onEnviar });
    await userEvent.selectOptions(screen.getByLabelText(/Estado/), "draft");
    await userEvent.type(screen.getByLabelText(/Nivel/), "11");
    await userEvent.type(screen.getByLabelText(/Nombre del autor/), "R2-D2");
    await fireEvent.submit(screen.getByRole("button", { name: "Save" }).closest("form")!);
    expect(onEnviar).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Nivel/).getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByLabelText(/Nombre del autor/).getAttribute("aria-invalid")).toBe("true");
  });

  it("names the fields with dotted paths for a native form", () => {
    const { container } = render(Paneles, { nombre: "post" });
    const nombres = [...container.querySelectorAll("form [name]")].map((e) => e.getAttribute("name"));
    expect(nombres).toEqual(expect.arrayContaining(["post.titulo", "post.estado", "post.nivel", "post.autor.nombre"]));
  });
});

describe("CodeEditor", () => {
  it("starts as a named textarea and turns into CodeMirror, keeping the value in the form", async () => {
    const { container } = render(CodeEditor, { value: "# Hola", language: "markdown", name: "cuerpo" });
    const respaldo = container.querySelector("textarea")!;
    expect(respaldo.name).toBe("cuerpo");
    expect(respaldo.value).toBe("# Hola");
    for (let i = 0; i < 100 && !container.querySelector(".cm-content"); i++) await esperar(20);
    const editor = container.querySelector(".cm-content")!;
    expect(editor).toBeTruthy();
    expect(editor.getAttribute("aria-label")).toBe("Code editor");
    expect(editor.textContent).toContain("# Hola");
    expect(respaldo.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("axe on the 0.7 components", () => {
  it("finds no violations, with a chart table open", async () => {
    const { container } = render(Paneles);
    await userEvent.click(screen.getAllByRole("button", { name: "Show data" })[0]);
    expect(await infracciones(container)).toEqual([]);
  });
});
