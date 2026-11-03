import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import DialogoPrueba from "../fixtures/DialogoPrueba.svelte";

const dialogos = () => [...document.querySelectorAll("dialog")];
const cancelar = (d: HTMLDialogElement) => d.dispatchEvent(new Event("cancel", { cancelable: true }));

describe("Dialog", () => {
  it("opens as a modal, focuses the first field and locks the page scroll", async () => {
    render(DialogoPrueba);
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }));
    const d = dialogos()[0];
    expect(d.open).toBe(true);
    expect(d.getAttribute("aria-labelledby")).toBeTruthy();
    expect(document.getElementById(d.getAttribute("aria-labelledby")!)?.textContent).toBe("Editar");
    expect(document.activeElement).toBe(screen.getByLabelText("Nombre"));
    expect(document.documentElement.style.overflow).toBe("hidden");
  });

  it("closes on Escape and gives the focus back to the button that opened it", async () => {
    render(DialogoPrueba);
    const abrir = screen.getByRole("button", { name: "Abrir" });
    await userEvent.click(abrir);
    cancelar(dialogos()[0]);
    await tick();
    expect(dialogos()[0].open).toBe(false);
    expect(document.activeElement).toBe(abrir);
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("closes on a click on the backdrop, not inside the panel", async () => {
    render(DialogoPrueba);
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }));
    await userEvent.click(screen.getByLabelText("Nombre"));
    expect(dialogos()[0].open).toBe(true);
    dialogos()[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await tick();
    expect(dialogos()[0].open).toBe(false);
  });

  it("with two dialogs open, Escape closes only the top one and the scroll stays locked", async () => {
    render(DialogoPrueba, { anidado: true });
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }));
    await userEvent.click(screen.getByRole("button", { name: "Otro" }));
    const [primero, segundo] = dialogos();
    expect(primero.open && segundo.open).toBe(true);
    cancelar(segundo);
    await tick();
    expect(screen.getByTestId("estado").textContent).toBe("abierto/cerrado");
    expect(document.documentElement.style.overflow).toBe("hidden");
    cancelar(primero);
    await tick();
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("names the close button", async () => {
    render(DialogoPrueba);
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }));
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeTruthy();
  });
});
