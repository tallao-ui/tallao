import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";
import { describe, expect, it } from "vitest";

import { axeViolations } from "../axe";
import Player from "../fixtures/Player.svelte";
import { formatTime } from "$lib/components/scene-player.svelte";

const frame = () => screen.getByTestId("frame").textContent;
const bar = () => screen.getByRole("slider", { name: "Position" });

describe("ScenePlayer", () => {
  it("starts paused on the first scene, with its caption and the chapters", async () => {
    render(Player);
    expect(frame()).toBe("paste:0.00");
    expect(screen.getByRole("button", { name: "Play" })).toBeTruthy();
    expect(screen.getByText("Paste a capture.")).toBeTruthy();
    expect(bar().getAttribute("aria-valuetext")).toBe("0:00 of 0:12");
    const nav = screen.getByRole("navigation", { name: "Chapters" });
    expect(within(nav).getByRole("button", { name: /Paste/ }).getAttribute("aria-current")).toBe("step");
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it("chapters and N / P jump between scenes and draw their progress", async () => {
    render(Player);
    await userEvent.click(within(screen.getByRole("navigation", { name: "Chapters" })).getByRole("button", { name: /Send/ }));
    expect(frame()).toBe("send:0.00");
    expect(screen.getByTestId("time").textContent).toBe("4000");
    bar().focus();
    await userEvent.keyboard("n");
    expect(frame()).toBe("copy:0.00");
    await userEvent.keyboard("p");
    expect(frame()).toBe("send:0.00");
    await userEvent.keyboard("{ArrowRight}");
    expect(frame()).toBe("send:0.83");
    await userEvent.keyboard("{End}");
    expect(frame()).toBe("copy:1.00");
    await userEvent.keyboard("{Home}");
    expect(frame()).toBe("paste:0.00");
    expect(screen.getByTestId("changes").textContent).toBe("paste,send,copy,send,copy,paste");
  });

  it("announces each scene once in a polite live region", async () => {
    render(Player);
    const live = document.querySelector(".ta-player-sr")!;
    expect(live.getAttribute("aria-live")).toBe("polite");
    expect(live.textContent).toBe("Paste. Paste a capture.");
    await userEvent.click(screen.getByRole("button", { name: "Next chapter" }));
    await tick();
    expect(live.textContent).toBe("Send. Send it.");
  });

  it("the play button and Space toggle playing; the clock advances", async () => {
    render(Player);
    await userEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(screen.getByTestId("playing").textContent).toBe("true");
    expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy();
    await new Promise((r) => setTimeout(r, 120));
    expect(Number(screen.getByTestId("time").textContent)).toBeGreaterThan(0);
    bar().focus();
    await userEvent.keyboard(" ");
    expect(screen.getByTestId("playing").textContent).toBe("false");
  });

  it("autoplay does not start under reduced motion, and scenes draw their final state", async () => {
    const original = window.matchMedia;
    window.matchMedia = ((q: string) => ({ matches: q.includes("reduce"), media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
    try {
      render(Player, { autoplay: true });
      await tick();
      expect(screen.getByTestId("playing").textContent).toBe("false");
      expect(frame()).toBe("paste:1.00");
    } finally {
      window.matchMedia = original;
    }
  });

  it("formatTime", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(65_400)).toBe("1:05");
  });
});
