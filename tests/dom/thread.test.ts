import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { axeViolations } from "../axe";
import Thread from "../fixtures/Thread.svelte";

/** jsdom does not lay out: give the scroller the measurements of a scrolled list. */
function measure(el: HTMLElement, { top, height = 1000, client = 100 }: { top: number; height?: number; client?: number }) {
  Object.defineProperty(el, "scrollHeight", { configurable: true, value: height });
  Object.defineProperty(el, "clientHeight", { configurable: true, value: client });
  el.scrollTop = top;
}

describe("ChatThread", () => {
  it("is a named log that does not read every change aloud, and the keyboard can scroll it", async () => {
    render(Thread);
    const log = screen.getByRole("log", { name: "Conversation" });
    expect(log.getAttribute("aria-live")).toBe("off");
    expect(log.getAttribute("tabindex")).toBe("0");
    expect(log.textContent).toContain("Hi, how can I help?");
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it("stops following when the reader scrolls up, and the jump button brings it back", async () => {
    render(Thread);
    const log = screen.getByRole("log", { name: "Conversation" });
    expect(screen.queryByRole("button", { name: /Jump to latest/ })).toBeNull();

    measure(log, { top: 200 });
    await fireEvent.scroll(log);
    expect(screen.getByTestId("follow").textContent).toBe("false");

    const jump = screen.getByRole("button", { name: /Jump to latest/ });
    await userEvent.click(jump);
    expect(log.scrollTop).toBe(1000);
    expect(screen.getByTestId("follow").textContent).toBe("true");
    expect(screen.queryByRole("button", { name: /Jump to latest/ })).toBeNull();
  });

  it("near the bottom (within the threshold) still counts as following", async () => {
    render(Thread);
    const log = screen.getByRole("log", { name: "Conversation" });
    measure(log, { top: 870 });
    await fireEvent.scroll(log);
    expect(screen.getByTestId("follow").textContent).toBe("true");
  });
});
