/**
 * Reviewing an edit on a flow and replaying a run: FlowNode's `change` and TaskList's `skipped`,
 * `stopped` and `current`.
 */
import { render, screen, within } from "@testing-library/svelte";

import { axeViolations } from "../axe";
import FlowReview from "../fixtures/FlowReview.svelte";

describe("FlowNode change", () => {
  it("says what an edit does to each node, in words and with a data attribute", () => {
    render(FlowReview);
    const items = within(screen.getByRole("list", { name: "Review" })).getAllByRole("listitem");
    const node = (i: number) => items[i].firstElementChild as HTMLElement;
    expect(node(0).dataset.change).toBeUndefined();
    expect(items[0].textContent).not.toMatch(/Added|Changed|Removed/);
    expect(node(1).dataset.change).toBe("changed");
    expect(items[1].textContent).toContain("Changed");
    expect(items[2].textContent).toContain("New");
    expect(node(3).dataset.change).toBe("removed");
    expect(items[3].textContent).toContain("Removed");
  });
});

describe("TaskList skipped, stopped and current", () => {
  it("names the new states and marks the row being replayed as the current step", () => {
    render(FlowReview);
    const rows = within(screen.getByRole("list", { name: "Run" })).getAllByRole("listitem");
    expect(rows.map((r) => r.textContent?.replace(/\s+/g, " ").trim())).toEqual(["Cooldown (Done)", "Give coins (Skipped)", "Stop (Stopped)", "Reply (Pending)"]);
    expect(rows[1].getAttribute("aria-current")).toBe("step");
    expect(rows.filter((r) => r.getAttribute("aria-current"))).toHaveLength(1);
  });

  it("moves the current mark with the prop, and nothing is busy in a replay", async () => {
    const { rerender, container } = render(FlowReview, { current: "c" });
    let rows = within(screen.getByRole("list", { name: "Run" })).getAllByRole("listitem");
    expect(rows[2].getAttribute("aria-current")).toBe("step");
    await rerender({ current: "a" });
    rows = within(screen.getByRole("list", { name: "Run" })).getAllByRole("listitem");
    expect(rows[0].getAttribute("aria-current")).toBe("step");
    expect(container.querySelector(".ta-tasks")?.getAttribute("aria-busy")).toBe("false");
  });

  it("has no axe violations", async () => {
    const { container } = render(FlowReview);
    expect(await axeViolations(container)).toEqual([]);
  });
});
