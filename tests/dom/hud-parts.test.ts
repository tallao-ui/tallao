import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import { axeViolations } from "../axe";
import HudParts from "../fixtures/HudParts.svelte";

describe("SyncStatus", () => {
  it("says how long ago the data was read, in a polite status region, and ticks", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    try {
      vi.setSystemTime(100_000);
      render(HudParts, { updatedAt: 100_000 - 12_000 });
      const status = screen.getByRole("status");
      expect(status.getAttribute("aria-live")).toBe("polite");
      expect(status.textContent).toContain("Synced 12 s ago");
      await vi.advanceTimersByTimeAsync(60_000);
      expect(status.textContent).toContain("Synced 1 min ago");
    } finally {
      vi.useRealTimers();
    }
  });

  it("says just now, Syncing, and the error in words", async () => {
    const { rerender } = render(HudParts, { updatedAt: Date.now() });
    expect(screen.getByRole("status").textContent).toContain("Synced just now");
    await rerender({ status: "syncing" });
    expect(screen.getByRole("status").textContent).toContain("Syncing");
    await rerender({ status: "error" });
    expect(screen.getByRole("status").textContent).toContain("Cannot reach the server");
    expect(screen.getByTestId("sync").dataset.state).toBe("error");
  });

  it("draws Refresh with its key only when it can refresh, and disables it while reading", async () => {
    const onRefresh = vi.fn();
    const { rerender } = render(HudParts, { onRefresh });
    const button = screen.getByRole("button", { name: "Refresh" });
    expect(button.getAttribute("aria-keyshortcuts")).toBe("R");
    await userEvent.click(button);
    expect(onRefresh).toHaveBeenCalledOnce();
    await rerender({ onRefresh, status: "syncing" });
    expect((screen.getByRole("button", { name: "Refresh" }) as HTMLButtonElement).disabled).toBe(true);
    await rerender({ onRefresh: undefined, status: "ready" });
    expect(screen.queryByRole("button", { name: "Refresh" })).toBeNull();
  });

  it("shows a Live badge, with its own text when given", async () => {
    const { rerender } = render(HudParts);
    expect(screen.queryByText("Live")).toBeNull();
    await rerender({ live: true });
    expect(screen.getByText("Live")).toBeTruthy();
    await rerender({ live: "On stage" });
    expect(screen.getByText("On stage")).toBeTruthy();
  });

  it("has a reduced-motion rule for its pulsing dots", async () => {
    const { compile } = await import("svelte/compiler");
    const fs = await import("node:fs");
    const file = "src/lib/components/sync-status.svelte";
    const css = compile(fs.readFileSync(file, "utf8"), { filename: file, css: "external" }).css?.code ?? "";
    expect(css).toMatch(/prefers-reduced-motion: reduce/);
  });
});

describe("ShortcutList", () => {
  it("is a named group of description lists, with groups as headings", () => {
    render(HudParts);
    const list = screen.getByRole("group", { name: "Keyboard shortcuts" });
    expect(list.querySelectorAll("dl")).toHaveLength(2);
    expect(within(list).getByText("Rows")).toBeTruthy();
    expect(within(list).getByText("Save draft").tagName).toBe("DD");
  });

  it("draws a combination as one Kbd and alternatives as one Kbd each", () => {
    render(HudParts);
    const rows = screen.getByRole("group", { name: "Keyboard shortcuts" }).querySelectorAll(".ta-shortcuts-row");
    const save = [...rows].find((r) => r.textContent?.includes("Save draft"))!;
    expect(save.querySelectorAll("dt > .ta-kbd")).toHaveLength(1);
    expect(save.querySelector("dt")!.textContent).toMatch(/Ctrl\s*\+\s*S/);
    const nav = [...rows].find((r) => r.textContent?.includes("Next / previous row"))!;
    expect(nav.querySelectorAll("dt > .ta-kbd")).toHaveLength(2);
  });
});

describe("Card tone", () => {
  it("adds the tone classes only when a tone is given", () => {
    const { container } = render(HudParts);
    const cards = container.querySelectorAll(".ta-card");
    expect(cards[0].className).toMatch(/ta-card--tone/);
    expect(cards[0].className).toMatch(/ta-card--live/);
    expect(cards[1].className).not.toMatch(/ta-card--tone/);
  });
});

describe("HUD parts", () => {
  it("have no axe violations", async () => {
    const { container } = render(HudParts, { live: true, onRefresh: () => {}, updatedAt: Date.now() });
    expect(await axeViolations(container)).toEqual([]);
  });
});
