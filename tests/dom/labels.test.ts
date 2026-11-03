import { render, screen } from "@testing-library/svelte";
import { tick } from "svelte";

import { es } from "$lib/i18n";
import Textos from "../fixtures/Textos.svelte";

describe("labels", () => {
  it("defaults to English", async () => {
    render(Textos, { abierto: true });
    await tick();
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Attach file" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Send message" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Write a message…" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Approve" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
  });

  it("setLabels(es) switches every component below it", async () => {
    render(Textos, { labels: es, abierto: true });
    await tick();
    expect(screen.getByRole("button", { name: "Descartar" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Adjuntar archivo" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Aprobar" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Rechazar" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeTruthy();
    expect(screen.getByText("Pendiente")).toBeTruthy();
  });

  it("a component's own label wins over the context", () => {
    render(Textos, { labels: es });
    expect(screen.getByText("Roto")).toBeTruthy();
    expect(screen.queryByText("Fallido")).toBeNull();
  });

  it("a partial set keeps the rest", () => {
    render(Textos, { labels: { dismiss: "Ocultar" } });
    expect(screen.getByRole("button", { name: "Ocultar" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Approve" })).toBeTruthy();
  });
});
