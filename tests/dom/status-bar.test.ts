import { render, screen, within } from "@testing-library/svelte";

import { axeViolations } from "../axe";
import ShellWithStatusBar from "../fixtures/ShellWithStatusBar.svelte";
import StatusBars from "../fixtures/StatusBars.svelte";

const item = (id: string) => screen.getByTestId("bar").querySelector(`[data-id="${id}"]`) as HTMLElement;
const text = (id: string) => item(id).textContent?.replace(/\s+/g, " ").trim();

describe("StatusBar", () => {
  it("is a named region with a list of readings", () => {
    render(StatusBars);
    const region = screen.getByRole("region", { name: "Status" });
    expect(within(region).getAllByRole("listitem")).toHaveLength(5);
  });

  it("says each verdict in words, with its own glyph, and lets an item replace the word", () => {
    render(StatusBars);
    expect(text("db")).toBe("Database 1 ms OK");
    expect(text("queue")).toBe("Queue 3 waiting Backing up");
    expect(text("cache")).toBe("Cache Down");
    // No verdict, no word.
    expect(text("sync")).toBe("Synced 12:04");
    const glyph = (id: string) => item(id).querySelector(".ta-statusbar-glyph path")?.getAttribute("d");
    expect(new Set([glyph("db"), glyph("queue"), glyph("cache")]).size).toBe(3);
    expect(item("sync").querySelector(".ta-statusbar-glyph")).toBeNull();
  });

  it("links an item with href, pulses a live one and keeps the far end", () => {
    render(StatusBars);
    const link = screen.getByRole("link", { name: "API OK" });
    expect(link.getAttribute("href")).toBe("/health");
    expect(item("api").querySelector(".ta-statusbar-live")).toBeTruthy();
    expect(item("db").querySelector(".ta-statusbar-live")).toBeNull();
    expect(item("cache").querySelector("[title]")?.getAttribute("title")).toBe("Valkey does not answer");
    expect(screen.getByTestId("env").textContent).toBe("production · 0.9.0");
  });

  it("has no axe violations", async () => {
    const { container } = render(StatusBars);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("sits in AppShell's footer, under <main> and outside its scroll", () => {
    render(ShellWithStatusBar);
    const main = screen.getByRole("main");
    const bar = screen.getByRole("region", { name: "Status" });
    expect(main.contains(bar)).toBe(false);
    expect(bar.closest(".ta-shell-foot")?.previousElementSibling).toBe(main);
  });
});
