import { render, screen } from "@testing-library/svelte";
import { tick } from "svelte";

import { en, es, setDefaultLabels } from "$lib/i18n";
import Texts from "../fixtures/Texts.svelte";

describe("labels", () => {
  it("defaults to English", async () => {
    render(Texts, { open: true });
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
    render(Texts, { labels: es, open: true });
    await tick();
    expect(screen.getByRole("button", { name: "Descartar" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Adjuntar archivo" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Aprobar" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Rechazar" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeTruthy();
    expect(screen.getByText("Pendiente")).toBeTruthy();
  });

  it("a component's own label wins over the context", () => {
    render(Texts, { labels: es });
    expect(screen.getByText("Broken")).toBeTruthy();
    expect(screen.queryByText("Fallido")).toBeNull();
  });

  it("setDefaultLabels changes the starting texts with no setLabels above", async () => {
    setDefaultLabels(es);
    try {
      render(Texts, { open: true });
      await tick();
      expect(screen.getByRole("button", { name: "Descartar" })).toBeTruthy();
      expect(screen.getByRole("button", { name: "Aprobar" })).toBeTruthy();
    } finally {
      setDefaultLabels(en);
    }
  });

  it("setLabels still wins over setDefaultLabels", () => {
    setDefaultLabels(es);
    try {
      render(Texts, { labels: { dismiss: "Hide" } });
      expect(screen.getByRole("button", { name: "Hide" })).toBeTruthy();
      expect(screen.getByRole("button", { name: "Aprobar" })).toBeTruthy();
    } finally {
      setDefaultLabels(en);
    }
  });

  it("a partial set keeps the rest", () => {
    render(Texts, { labels: { dismiss: "Hide" } });
    expect(screen.getByRole("button", { name: "Hide" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Approve" })).toBeTruthy();
  });
});
