import { fireEvent, render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import { infracciones } from "../axe";
import Formularios from "../fixtures/Formularios.svelte";

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
const datos = () => new FormData(screen.getByTestId("form") as HTMLFormElement);
const tabla = (nombre: string) => screen.getByRole("table", { name: nombre });
const nombres = (t: HTMLElement) =>
  within(t)
    .getAllByRole("row")
    .slice(1)
    .map((r) => r.querySelectorAll("td")[1]?.textContent?.trim());

describe("controls inside a native <form> (SvelteKit form actions)", () => {
  it("every control sends its value, the way the server action will read it", () => {
    render(Formularios);
    const f = datos();
    expect(f.get("avisos")).toBe("on");
    expect(f.get("pais")).toBe("pe");
    expect(f.getAll("etiquetas")).toEqual(["bug"]);
    expect(f.get("stats[hp]")).toBe("100");
    expect(f.get("fecha")).toBe("2026-11-03");
  });

  it("a switched-off Switch sends nothing, like an unchecked checkbox", async () => {
    render(Formularios);
    await userEvent.click(screen.getByRole("switch", { name: "Avisos" }));
    expect(datos().has("avisos")).toBe(false);
  });
});

describe("Combobox", () => {
  it("multiple: Enter adds a chip, choosing it again removes it, Backspace removes the last", async () => {
    render(Formularios);
    const campo = screen.getByRole("combobox", { name: "Etiquetas" });
    await userEvent.type(campo, "ux{Enter}");
    expect(datos().getAll("etiquetas")).toEqual(["bug", "ux"]);
    expect(screen.getByRole("listbox", { name: "Etiquetas" }).getAttribute("aria-multiselectable")).toBe("true");
    await userEvent.click(screen.getByRole("option", { name: "UX" }));
    expect(datos().getAll("etiquetas")).toEqual(["bug"]);
    await userEvent.keyboard("{Escape}");
    campo.focus();
    await userEvent.keyboard("{Backspace}");
    expect(datos().getAll("etiquetas")).toEqual([]);
  });

  it("a chip has a named remove button", async () => {
    render(Formularios);
    await userEvent.click(screen.getByRole("button", { name: "Remove Bug" }));
    expect(datos().getAll("etiquetas")).toEqual([]);
  });

  it("remote: asks the API for what is typed and drops the answer of an older search", async () => {
    const llamadas: string[] = [];
    const loadOptions = vi.fn((q: string, signal: AbortSignal) => {
      llamadas.push(q);
      return new Promise<{ value: string; label: string }[]>((res) => {
        const lento = q === "a" ? 60 : 5;
        setTimeout(() => !signal.aborted && res([{ value: `v-${q}`, label: `Resultado ${q}` }]), lento);
      });
    });
    render(Formularios, { loadOptions });
    const campo = screen.getByRole("combobox", { name: "Remoto" });
    await userEvent.type(campo, "a");
    await userEvent.type(campo, "b");
    await esperar(120);
    expect(llamadas).toContain("ab");
    const opciones = screen.getAllByRole("option").map((o) => o.textContent?.trim());
    expect(opciones).toEqual(["Resultado ab"]);
  });
});

describe("DatePicker and Calendar", () => {
  it("a typed date is taken on blur; a date that does not exist is marked and ignored", async () => {
    render(Formularios);
    const campo = screen.getByRole("textbox", { name: "Fecha" });
    await userEvent.clear(campo);
    await userEvent.type(campo, "2026-12-24");
    campo.blur();
    await tick();
    expect(screen.getByTestId("fecha").textContent).toBe("2026-12-24");
    await userEvent.clear(campo);
    await userEvent.type(campo, "2026-02-31");
    campo.blur();
    await tick();
    expect(campo.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByTestId("fecha").textContent).toBe("2026-12-24");
  });

  it("the button opens a calendar on the chosen day; picking a day closes it and focus goes back", async () => {
    render(Formularios);
    const boton = screen.getByRole("button", { name: "Choose date" });
    await userEvent.click(boton);
    await esperar(10);
    const panel = screen.getByRole("dialog", { name: "Choose date" });
    expect((document.activeElement as HTMLElement).dataset.dia).toBe("2026-11-03");
    await userEvent.keyboard("{ArrowRight}{ArrowDown}");
    expect((document.activeElement as HTMLElement).dataset.dia).toBe("2026-11-11");
    await userEvent.keyboard("{Enter}");
    expect(screen.getByTestId("fecha").textContent).toBe("2026-11-11");
    expect(panel.isConnected).toBe(false);
    expect(document.activeElement).toBe(boton);
  });

  it("Calendar: arrows, PageDown to next month, min disables, Enter picks", async () => {
    render(Formularios);
    const rejilla = screen.getAllByRole("grid")[0];
    const dia = (iso: string) => rejilla.querySelector<HTMLButtonElement>(`[data-dia="${iso}"]`)!;
    expect(dia("2026-11-01").getAttribute("aria-disabled")).toBe("true");
    // Sin valor arranca en hoy; se lleva a una fecha conocida eligiéndola.
    await fireEvent.click(dia("2026-11-05"));
    expect(screen.getByTestId("dia").textContent).toBe("2026-11-05");
    dia("2026-11-05").focus();
    await userEvent.keyboard("{PageDown}");
    expect((document.activeElement as HTMLElement).dataset.dia).toBe("2026-12-05");
    await userEvent.keyboard("{Home}");
    expect((document.activeElement as HTMLElement).dataset.dia).toBe("2026-11-30");
    await userEvent.keyboard("{Enter}");
    expect(screen.getByTestId("dia").textContent).toBe("2026-11-30");
  });
});

describe("FileUpload", () => {
  it("takes allowed files, says why the others are left out, and the native input carries them", async () => {
    render(Formularios);
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    const bien = new File(["x"], "foto.png", { type: "image/png" });
    const pdf = new File(["x"], "doc.pdf", { type: "application/pdf" });
    const grande = new File([new Uint8Array(2000)], "grande.png", { type: "image/png" });
    const tipo = new File(["x"], "nota.txt", { type: "text/plain" });
    Object.defineProperty(input, "files", { value: [bien, grande, tipo, pdf], configurable: true });
    await fireEvent.change(input);
    expect(screen.getByTestId("archivos").textContent).toBe("foto.png,doc.pdf");
    const avisos = screen.getByRole("alert").textContent!;
    expect(avisos).toContain("grande.png");
    expect(avisos).toContain("nota.txt");
    await userEvent.click(screen.getByRole("button", { name: "Remove foto.png" }));
    expect(screen.getByTestId("archivos").textContent).toBe("doc.pdf");
  });

  it("the drop zone takes dropped files", async () => {
    render(Formularios);
    const zona = document.querySelector(".ta-upload-zona")!;
    const f = new File(["x"], "soltado.pdf", { type: "application/pdf" });
    await fireEvent.drop(zona, { dataTransfer: { files: [f] } });
    expect(screen.getByTestId("archivos").textContent).toBe("soltado.pdf");
  });
});

describe("Pagination", () => {
  it("marks the current page, hides the middle behind …, and moves with Next", async () => {
    render(Formularios);
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(within(nav).getByRole("button", { name: "Page 1" }).getAttribute("aria-current")).toBe("page");
    expect(within(nav).getByRole("button", { name: /Previous/ }).hasAttribute("disabled")).toBe(true);
    expect(nav.textContent).toContain("…");
    await userEvent.click(within(nav).getByRole("button", { name: /Next/ }));
    expect(screen.getByTestId("pagina").textContent).toBe("2");
  });
});

describe("DataTable", () => {
  it("sorts by a column (aria-sort), cycles back to no order, and pages", async () => {
    render(Formularios);
    const t = tabla("Personas");
    expect(nombres(t)).toEqual(["Eva", "Ana", "Luis"]);
    const boton = within(t).getByRole("button", { name: /Puntos/ });
    await userEvent.click(boton);
    expect(boton.closest("th")!.getAttribute("aria-sort")).toBe("ascending");
    expect(nombres(t)).toEqual(["Dani", "Ana", "Bea"]);
    await userEvent.click(boton);
    expect(boton.closest("th")!.getAttribute("aria-sort")).toBe("descending");
    expect(nombres(t)).toEqual(["Zoe", "Eva", "Ciro"]);
    await userEvent.click(boton);
    expect(boton.closest("th")!.getAttribute("aria-sort")).toBe("none");
    await userEvent.click(within(screen.getByRole("navigation", { name: "Pagination: Personas" })).getByRole("button", { name: /Next/ }));
    expect(nombres(t)).toEqual(["Zoe", "Bea", "Ciro"]);
  });

  it("select all works on the visible page, with a partial state", async () => {
    render(Formularios);
    const t = tabla("Personas");
    await userEvent.click(within(t).getByRole("checkbox", { name: "Select row: Ana" }));
    const todas = within(t).getByRole("checkbox", { name: "Select all" }) as HTMLInputElement;
    expect(todas.indeterminate).toBe(true);
    await userEvent.click(todas);
    expect(screen.getByTestId("seleccion").textContent).toBe("r2,r1,r3");
    await userEvent.click(todas);
    expect(screen.getByTestId("seleccion").textContent).toBe("");
  });

  it("manual: only tells, the rows stay as the API gave them", async () => {
    const onSortChange = vi.fn();
    render(Formularios, { manual: true, onSortChange });
    const t = tabla("Personas");
    await userEvent.click(within(t).getByRole("button", { name: /Nombre/ }));
    expect(onSortChange).toHaveBeenCalledWith({ key: "nombre", direction: "asc" });
    expect(nombres(t)?.[0]).toBe("Eva");
  });

  it("an empty table keeps a visible row that says so", () => {
    render(Formularios);
    expect(tabla("Vacía").textContent).toContain("No results");
  });
});

describe("axe on the 0.6 components", () => {
  it("finds no violations", async () => {
    const { container } = render(Formularios);
    await tick();
    expect(await infracciones(container)).toEqual([]);
  });
});
