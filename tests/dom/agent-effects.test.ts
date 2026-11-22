import { fireEvent, render, screen, within } from "@testing-library/svelte";

import { axeViolations } from "../axe";
import AgentEffects from "../fixtures/AgentEffects.svelte";

/** jsdom does not lay out: give the three boxes of the beam a place on the page. */
function layout(boxes: Record<string, [number, number, number, number]>) {
  return vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const [x, y, width, height] = boxes[this.dataset.testid ?? ""] ?? [0, 0, 0, 0];
    return { x, y, left: x, top: y, width, height, right: x + width, bottom: y + height, toJSON() {} } as DOMRect;
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  delete document.documentElement.dataset.tallaoMotion;
});

describe("Beam", () => {
  const BOXES = { box: [0, 0, 400, 200], agent: [20, 80, 60, 40], tool: [320, 80, 60, 40] } as Record<string, [number, number, number, number]>;

  it("draws a line from the edge of one box to the edge of the other, hidden from assistive technology", async () => {
    layout(BOXES);
    render(AgentEffects);
    const svg = screen.getByTestId("beam");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    const [line, pulse] = svg.querySelectorAll("path");
    // Centres at 50,100 and 350,100; each end leaves its box (30px) plus the 6px gap.
    expect(line.getAttribute("d")).toBe("M 86 100 Q 200 100 314 100");
    expect(pulse.getAttribute("pathLength")).toBe("100");
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it("bends with curvature, runs backwards with reverse, and keeps only the line when inactive", async () => {
    layout(BOXES);
    const { rerender } = render(AgentEffects, { curvature: 40, reverse: true });
    const svg = screen.getByTestId("beam");
    expect(svg.querySelector("path")?.getAttribute("d")).toBe("M 86 100 Q 200 60 314 100");
    expect(svg.querySelector(".ta-beam-pulse")?.getAttribute("class")).toContain("ta-beam-pulse--reverse");
    await rerender({ active: false });
    expect(svg.querySelectorAll("path")).toHaveLength(1);
  });

  it("draws nothing until the boxes have room between them", () => {
    layout({ box: [0, 0, 400, 200], agent: [20, 80, 200, 40], tool: [200, 80, 200, 40] });
    render(AgentEffects);
    expect(screen.getByTestId("beam").querySelectorAll("path")).toHaveLength(0);
  });
});

describe("Terminal", () => {
  const LINES = [
    { kind: "command" as const, text: "pnpm test" },
    { text: "36 files, 506 tests" },
    { kind: "success" as const, text: "All checks passed" },
  ];

  it("types the commands and shows the output, while screen readers get the whole transcript at once", async () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    render(AgentEffects, { lines: LINES, onDone });
    const term = screen.getByRole("group", { name: "agent · ~/app" });
    const screenEl = term.querySelector(".ta-terminal-screen")!;
    expect(screenEl.getAttribute("aria-hidden")).toBe("true");
    // The hidden transcript holds every line from the start.
    const transcript = within(term).getByRole("list");
    expect(within(transcript).getAllByRole("listitem").map((li) => li.textContent)).toEqual(LINES.map((l) => l.text));

    await vi.advanceTimersByTimeAsync(45);
    expect(term.getAttribute("aria-busy")).toBe("true");
    expect(screenEl.textContent).toContain("pnpm");
    expect(screenEl.textContent).not.toContain("pnpm test");
    expect(screenEl.textContent).not.toContain("36 files");

    await vi.advanceTimersByTimeAsync(2000);
    expect(screenEl.textContent).toContain("pnpm test");
    expect(screenEl.textContent).toContain("All checks passed");
    expect(screenEl.textContent).toContain("✓");
    expect(term.getAttribute("aria-busy")).toBe("false");
    expect(onDone).toHaveBeenCalledTimes(1);

    // Replay starts over.
    await fireEvent.click(within(term).getByRole("button", { name: "Replay" }));
    await vi.advanceTimersByTimeAsync(15);
    expect(term.getAttribute("aria-busy")).toBe("true");
    expect(screenEl.textContent).not.toContain("All checks passed");
  });

  it("without autoplay shows the whole text and waits for Replay", async () => {
    render(AgentEffects, { lines: LINES, autoplay: false });
    const term = screen.getByRole("group", { name: "agent · ~/app" });
    expect(term.getAttribute("aria-busy")).toBe("false");
    expect(term.querySelector(".ta-terminal-screen")!.textContent).toContain("All checks passed");
    expect(within(term).getByRole("button", { name: "Replay" })).toBeTruthy();
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it("under reduced motion shows everything at once, with no Replay", async () => {
    document.documentElement.dataset.tallaoMotion = "reduce";
    render(AgentEffects, { lines: LINES });
    const term = screen.getByRole("group", { name: "agent · ~/app" });
    await Promise.resolve();
    expect(term.querySelector(".ta-terminal-screen")!.textContent).toContain("All checks passed");
    expect(term.getAttribute("aria-busy")).toBe("false");
    expect(within(term).queryByRole("button", { name: "Replay" })).toBeNull();
  });
});

describe("EventFeed", () => {
  const EVENTS = [
    { id: 3, title: "Approval requested", detail: "Publish the notes", time: "12:04", tone: "warning" as const },
    { id: 2, title: "Read post #42", time: "12:03", tone: "info" as const },
    { id: 1, title: "Run started", time: "12:02" },
  ];

  it("is a named, silent list of the events, newest first", async () => {
    render(AgentEffects, { feed: EVENTS });
    const list = screen.getByRole("list", { name: "Activity" });
    expect(list.getAttribute("aria-live")).toBe("off");
    expect(within(list).getAllByRole("listitem").map((li) => li.querySelector(".ta-feed-title")?.textContent)).toEqual([
      "Approval requested",
      "Read post #42",
      "Run started",
    ]);
    // The tone's icon is a second cue and is not read.
    expect(list.querySelector(".ta-feed-mark")?.getAttribute("aria-hidden")).toBe("true");
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it("puts a new event first, keeps only `limit`, and can announce", async () => {
    document.documentElement.dataset.tallaoMotion = "reduce";
    const { rerender } = render(AgentEffects, { feed: EVENTS, limit: 3, announce: true });
    const list = screen.getByRole("list", { name: "Activity" });
    expect(list.getAttribute("aria-live")).toBe("polite");
    await rerender({ feed: [{ id: 4, title: "Published", tone: "success" }, ...EVENTS] });
    const titles = within(list).getAllByRole("listitem").map((li) => li.querySelector(".ta-feed-title")?.textContent);
    expect(titles[0]).toBe("Published");
    expect(titles).toHaveLength(3);
  });

  it("says so when there are no events", () => {
    render(AgentEffects, { feed: [], emptyText: "Nothing ran yet" });
    expect(screen.getByText("Nothing ran yet")).toBeTruthy();
  });
});
