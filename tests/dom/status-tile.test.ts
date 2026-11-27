import { render, screen } from "@testing-library/svelte";

import { axeViolations } from "../axe";
import StatusTiles from "../fixtures/StatusTiles.svelte";
import StatusTilesEs from "../fixtures/StatusTilesEs.svelte";

const text = (id: string) => screen.getByTestId(id).textContent?.replace(/\s+/g, " ").trim();

describe("StatusTile", () => {
  it("says the verdict in words, with a glyph of its own, never by colour alone", () => {
    render(StatusTiles);
    expect(text("ok")).toBe("Database OK 1 ms");
    expect(text("warn")).toBe("Cache Check Answering slowly");
    // 0 is a figure worth showing.
    expect(text("down")).toBe("Job queue Down 0");
    expect(text("unknown")).toBe("Storage Unknown");
    const glyph = (id: string) => screen.getByTestId(id).querySelector(".ta-status-tile-glyph path")?.getAttribute("d");
    const shapes = new Set(["ok", "warn", "down", "unknown"].map(glyph));
    expect(shapes.size).toBe(4);
    expect(screen.getByTestId("down").getAttribute("data-status")).toBe("down");
  });

  it("is one link named by its text with href, a plain block without it", () => {
    render(StatusTiles);
    const link = screen.getByRole("link", { name: /Database OK 1 ms/ });
    expect(link.getAttribute("href")).toBe("/health/db");
    expect(screen.getByTestId("warn").tagName).toBe("DIV");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("takes its own word, a DashboardGrid span and the labels' language", () => {
    render(StatusTiles);
    expect(text("custom")).toBe("Worker Running");
    expect(screen.getByTestId("custom").getAttribute("data-ta-span")).toBe("2");
  });

  it("reads the verdicts from the labels", () => {
    render(StatusTilesEs);
    expect(text("ok")).toBe("Database Bien 1 ms");
    expect(text("warn")).toContain("Revisar");
    expect(text("down")).toContain("Caído");
    expect(text("unknown")).toContain("Desconocido");
  });

  it("has no axe violations", async () => {
    const { container } = render(StatusTiles);
    expect(await axeViolations(container)).toEqual([]);
  });
});
