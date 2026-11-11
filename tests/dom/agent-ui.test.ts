import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import { axeViolations } from "../axe";
import AgentUi from "../fixtures/AgentUi.svelte";

describe("Thinking", () => {
  it("done: says how long it thought, and the line is a disclosure of the trace", async () => {
    render(AgentUi);
    const block = screen.getByTestId("thinking");
    expect(block.getAttribute("aria-busy")).toBe("false");
    const button = within(block).getByRole("button", { name: "Thought for 12 s" });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(within(block).queryByRole("list")).toBeNull();
    button.focus();
    await userEvent.keyboard("{Enter}");
    expect(button.getAttribute("aria-expanded")).toBe("true");
    const trace = document.getElementById(button.getAttribute("aria-controls")!)!;
    expect(within(trace).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["Read the brief", "Compared three sources"]);
    expect(trace.textContent).toContain("It weighed the two options.");
  });

  it("running: busy, with the live summary and a time that is not read out", () => {
    render(AgentUi, { running: true });
    const block = screen.getByTestId("thinking");
    expect(block.getAttribute("aria-busy")).toBe("true");
    expect(block.textContent).toContain("Thinking…");
    expect(block.textContent).toContain("Reading the brief");
    expect(block.querySelector(".ta-thinking-time")!.getAttribute("aria-hidden")).toBe("true");
    expect(within(block).getByRole("status").textContent).toBe("");
  });

  it("announces the end once, in a polite status", async () => {
    const { rerender } = render(AgentUi, { running: true });
    await rerender({ running: false });
    await tick();
    expect(within(screen.getByTestId("thinking")).getByRole("status").textContent).toBe("Thought for 12 s");
  });

  it("without a trace it is plain text, with minutes spelled out", () => {
    render(AgentUi);
    const plain = screen.getByTestId("thinking-plain");
    expect(within(plain).queryByRole("button")).toBeNull();
    expect(plain.textContent).toContain("Thought for 1 min 15 s");
  });

  it("counts the time by itself while running", async () => {
    vi.useFakeTimers();
    try {
      const { default: Thinking } = await import("$lib/components/thinking.svelte");
      const { container } = render(Thinking, { running: true });
      await vi.advanceTimersByTimeAsync(3200);
      expect(container.querySelector(".ta-thinking-time")!.textContent).toBe("3 s");
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("StreamingText", () => {
  it("draws the words hidden from screen readers and speaks whole sentences only", async () => {
    const { rerender } = render(AgentUi, { streaming: true });
    const block = screen.getByTestId("stream");
    expect(block.getAttribute("aria-busy")).toBe("true");
    const visible = block.querySelector(".ta-stream-text")!;
    expect(visible.getAttribute("aria-hidden")).toBe("true");
    expect(visible.textContent).toBe("First sentence. Second");
    expect(visible.querySelector(".ta-stream-caret")).toBeTruthy();
    const spoken = block.querySelector('[aria-live="polite"]')!;
    expect(spoken.getAttribute("aria-atomic")).toBe("false");
    expect([...spoken.children].map((s) => s.textContent?.trim())).toEqual(["First sentence."]);

    // More text arrives: the words already drawn are the same elements, only the new ones fade in.
    const first = visible.querySelector(".ta-stream-word")!;
    await rerender({ streaming: true, text: "First sentence. Second one is here. Third" });
    expect(visible.querySelector(".ta-stream-word")).toBe(first);
    expect(first.className).not.toMatch(/--new/);
    expect([...visible.querySelectorAll(".ta-stream-word--new")].map((w) => w.textContent)).toEqual(["one ", "is ", "here. ", "Third"]);
    // The spoken region keeps its first sentence and gains one: nothing is read again.
    const firstSpoken = spoken.children[0];
    expect([...spoken.children].map((s) => s.textContent?.trim())).toEqual(["First sentence.", "Second one is here."]);
    expect(spoken.children[0]).toBe(firstSpoken);

    await rerender({ streaming: false, text: "First sentence. Second one is here. Third" });
    expect(block.getAttribute("aria-busy")).toBe("false");
    expect(visible.querySelector(".ta-stream-caret")).toBeNull();
    expect([...spoken.children].map((s) => s.textContent?.trim())).toEqual(["First sentence.", "Second one is here.", "Third"]);
  });

  it("reads an async iterable to the end and reports the full text", async () => {
    const onDone = vi.fn();
    async function* chunks() {
      yield "Hello ";
      yield "world.";
    }
    render(AgentUi, { stream: chunks(), onDone });
    await vi.waitFor(() => expect(onDone).toHaveBeenCalledWith("Hello world."));
    const block = screen.getByTestId("stream-iterable");
    expect(block.querySelector(".ta-stream-text")!.textContent).toBe("Hello world.");
    expect(block.getAttribute("aria-busy")).toBe("false");
  });

  it("keeps line breaks and does not interpret markup", async () => {
    render(AgentUi, { text: "One\n<b>two</b>" });
    const visible = screen.getByTestId("stream").querySelector(".ta-stream-text")!;
    expect(visible.querySelector("b")).toBeNull();
    expect(visible.textContent).toBe("One\n<b>two</b>");
  });
});

describe("ToolChips", () => {
  it("is a named list behind a disclosure header with the counts", async () => {
    render(AgentUi);
    const header = screen.getByRole("button", { name: "5 tool calls, 2 messages" });
    expect(header.getAttribute("aria-expanded")).toBe("true");
    const list = screen.getByRole("list", { name: "5 tool calls, 2 messages" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(5);
    expect(items[0].textContent).toContain("Read");
    expect(items[0].textContent).toContain("brief.md");
    // Diff figures carry their signs and are spelled out.
    expect(items[1].querySelector(".ta-toolchips-added")!.textContent).toBe("+7474 lines added");
    expect(items[1].querySelector(".ta-toolchips-removed")!.textContent).toBe("−4141 lines removed");
    expect(items[2].getAttribute("aria-busy")).toBe("true");
    expect(items[4].textContent).toContain("Failed");
    header.focus();
    await userEvent.keyboard(" ");
    expect(header.getAttribute("aria-expanded")).toBe("false");
  });

  it("a call with a tool name unfolds a ToolCallCard", async () => {
    render(AgentUi);
    const list = screen.getByRole("list", { name: "5 tool calls, 2 messages" });
    const chip = within(list).getByRole("button", { name: /Publish/ });
    expect(chip.getAttribute("aria-expanded")).toBe("false");
    expect(within(list).getAllByRole("button")).toHaveLength(1);
    await userEvent.click(chip);
    expect(chip.getAttribute("aria-expanded")).toBe("true");
    const card = document.getElementById(chip.getAttribute("aria-controls")!)!;
    expect(card.textContent).toContain("publish_post");
    expect(card.textContent).toContain("Published");
  });

  it("without a header it is just the named list", () => {
    render(AgentUi);
    expect(within(screen.getByRole("list", { name: "Edits" })).getAllByRole("listitem")).toHaveLength(1);
  });
});

describe("TaskList", () => {
  it("lists the tasks with their status in words, a progress ring and the running one as current", () => {
    render(AgentUi);
    const list = screen.getByRole("list", { name: "Tasks" });
    const items = within(list).getAllByRole("listitem");
    expect(items.map((li) => li.textContent?.replace(/\s+/g, " ").trim())).toEqual([
      "Collect match data (Done) 12 s",
      "Recompute tier list (Running…) 3/8",
      "Write the summary (Pending)",
      "Post to Discord (Failed)",
    ]);
    expect(items[1].getAttribute("aria-current")).toBe("step");
    const ring = within(items[1]).getByRole("progressbar", { name: "Recompute tier list" });
    expect(ring.getAttribute("aria-valuenow")).toBe("38");
    expect(list.closest(".ta-tasks")!.getAttribute("aria-busy")).toBe("true");
  });

  it("a row with details is a disclosure, bound through expanded", async () => {
    render(AgentUi);
    const list = screen.getByRole("list", { name: "Tasks" });
    expect(within(list).getAllByRole("button")).toHaveLength(2);
    const row = within(list).getByRole("button", { name: /Post to Discord/ });
    row.focus();
    await userEvent.keyboard("{Enter}");
    expect(row.getAttribute("aria-expanded")).toBe("true");
    expect(document.getElementById(row.getAttribute("aria-controls")!)!.textContent).toBe("The webhook answered 401.");
    expect(screen.getByTestId("expanded").textContent).toBe("d");
  });

  it("capsule: one pill with the count and the running task, that unfolds the list", async () => {
    render(AgentUi);
    const pill = screen.getByRole("button", { name: /1 of 3 done/ });
    expect(pill.textContent).toContain("Recompute tier list");
    expect(pill.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("list", { name: "Capsule tasks" })).toBeNull();
    await userEvent.click(pill);
    expect(within(screen.getByRole("list", { name: "Capsule tasks" })).getAllByRole("listitem")).toHaveLength(3);
  });
});

describe("ApprovalCard", () => {
  it("is an article named by its title with who asks, the diff, the call and the risk in words", () => {
    render(AgentUi, { onApprove: () => {}, onReject: () => {} });
    const card = screen.getByRole("article", { name: "Publish “Patch 1.2 notes”" });
    expect(card.textContent).toContain("Approval requested");
    expect(card.textContent).toContain("Publisher agent");
    expect(within(card).getByRole("list", { name: "Changes" })).toBeTruthy();
    expect(card.querySelector(".ta-approval-tool")!.textContent).toBe("publish_post");
    expect(card.querySelector("pre")!.textContent).toContain('"notify": true');
    expect(card.querySelector(".ta-approval-risk")!.textContent?.replace(/\s+/g, " ").trim()).toBe("High risk. Visible to every visitor.");
    const buttons = within(card).getAllByRole("button").map((b) => b.textContent?.replace(/\s+/g, " ").trim());
    expect(buttons[0]).toMatch(/^Reject/);
    expect(buttons[1]).toMatch(/^Approve/);
    expect(within(card).queryByRole("button", { name: /Edit first/ })).toBeNull();
  });

  it("an async approve shows busy and locks the other buttons until it settles", async () => {
    let finish!: () => void;
    const onApprove = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const onEdit = vi.fn();
    render(AgentUi, { onApprove, onReject: () => {}, onEdit });
    const card = screen.getByTestId("approval");
    const approve = within(card).getByRole("button", { name: /^Approve/ });
    await userEvent.click(within(card).getByRole("button", { name: "Edit first" }));
    expect(onEdit).toHaveBeenCalledOnce();
    await userEvent.click(approve);
    expect(approve.getAttribute("aria-busy")).toBe("true");
    expect((within(card).getByRole("button", { name: /^Reject/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(card.getAttribute("aria-busy")).toBe("true");
    finish();
    await vi.waitFor(() => expect(card.getAttribute("aria-busy")).toBe("false"));
    expect(onApprove).toHaveBeenCalledOnce();
  });

  it("Mod+Enter approves and Mod+Backspace rejects while focus is in the card, not while typing in it", async () => {
    const onApprove = vi.fn();
    const onReject = vi.fn();
    render(AgentUi, { onApprove, onReject });
    const card = screen.getByTestId("approval");
    within(card).getByRole("button", { name: /^Reject/ }).focus();
    await userEvent.keyboard("{Control>}{Enter}{/Control}");
    expect(onApprove).toHaveBeenCalledOnce();
    await userEvent.keyboard("{Control>}{Backspace}{/Control}");
    expect(onReject).toHaveBeenCalledOnce();
    within(card).getByRole("textbox", { name: "Note" }).focus();
    await userEvent.keyboard("{Control>}{Backspace}{/Control}");
    expect(onReject).toHaveBeenCalledOnce();
    // Outside the card nothing listens.
    (document.activeElement as HTMLElement).blur();
    await userEvent.keyboard("{Control>}{Enter}{/Control}");
    expect(onApprove).toHaveBeenCalledOnce();
  });

  it("once decided the buttons give way to the outcome, in a status", () => {
    render(AgentUi, { status: "approved", onApprove: () => {}, onReject: () => {} });
    const card = screen.getByTestId("approval");
    expect(card.dataset.status).toBe("approved");
    expect(within(card).queryByRole("button", { name: /Approve|Reject/ })).toBeNull();
    expect(card.querySelector(".ta-approval-foot [role='status']")!.textContent).toBe("Approved by Ana");
  });

  it("uses the status in words when no outcome is given", () => {
    render(AgentUi, { status: "rejected" });
    expect(screen.getByTestId("approval").querySelector(".ta-approval-foot [role='status']")!.textContent).toBe("Rejected");
  });
});

describe("ContextCards", () => {
  it("is a named list of cards with links, notes and a remove button each", () => {
    render(AgentUi);
    const list = screen.getByRole("list", { name: "Context" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(within(list).getByRole("link", { name: "Post #42" }).getAttribute("href")).toBe("/posts/42");
    expect(list.textContent).toContain("4.2 KB");
    expect(list.textContent).toContain("Dash reset removed.");
    expect(within(list).getByRole("button", { name: "Remove brief.md" })).toBeTruthy();
    expect(within(screen.getByRole("list", { name: "Read only" })).queryByRole("button")).toBeNull();
  });

  it("removing a card moves the focus to the next card's button", async () => {
    render(AgentUi);
    const list = screen.getByRole("list", { name: "Context" });
    within(list).getByRole("button", { name: "Remove brief.md" }).focus();
    await userEvent.keyboard("{Enter}");
    await tick();
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(document.activeElement).toBe(within(list).getByRole("button", { name: "Remove Post #42" }));
    await userEvent.click(within(list).getByRole("button", { name: "Remove Patch notes" }));
    await tick();
    expect(document.activeElement).toBe(within(list).getByRole("button", { name: "Remove Post #42" }));
  });
});

describe("RecommendationCard", () => {
  it("names the article, lists the reasons and says the confidence in words", () => {
    render(AgentUi, { onAction: () => {} });
    const card = screen.getByRole("article", { name: "Feature the patch notes" });
    expect(within(within(card).getByRole("list", { name: "Why" })).getAllByRole("listitem")).toHaveLength(2);
    expect(card.querySelector(".ta-reco-confidence")!.textContent?.trim()).toBe("High confidence");
    expect(card.querySelector(".ta-reco-bars")!.getAttribute("aria-hidden")).toBe("true");
    expect(card.querySelectorAll(".ta-reco-bar--on")).toHaveLength(3);
  });

  it("runs the primary action (busy while it is async), the secondary one and dismiss", async () => {
    let finish!: () => void;
    const onAction = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const onDismiss = vi.fn();
    render(AgentUi, { onAction, onDismiss });
    const card = screen.getByRole("article", { name: "Feature the patch notes" });
    const action = within(card).getByRole("button", { name: "Feature it" });
    await userEvent.click(action);
    expect(action.getAttribute("aria-busy")).toBe("true");
    finish();
    await vi.waitFor(() => expect(action.hasAttribute("aria-busy")).toBe(false));
    await userEvent.click(within(card).getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(within(card).getByRole("button", { name: "Alternatives" })).toBeTruthy();
  });
});

describe("InsightCard", () => {
  it("is an article with the sentence, the figure with its change in words and the trend as an image", () => {
    render(AgentUi);
    const card = screen.getByRole("article", { name: "Kaela's pick rate doubled" });
    expect(card.querySelector(".ta-kpi-value")!.textContent).toBe("18.4%");
    expect(card.querySelector(".ta-kpi-delta")!.textContent?.replace(/\s+/g, " ")).toContain("up");
    expect(card.querySelector(".ta-kpi-delta")!.textContent).toContain("(better)");
    expect(within(card).getByRole("img", { name: /Pick rate: from 9 to 18.4/ })).toBeTruthy();
    expect(card.textContent).toContain("The dash reset made her the default opener.");
    expect(within(card).getByRole("link", { name: "Open the matchup table" }).getAttribute("href")).toBe("/meta/kaela");
  });
});

describe("axe on the agent-run components", () => {
  it("finds no violations, pending and running", async () => {
    const { container } = render(AgentUi, { running: true, streaming: true, onApprove: () => {}, onReject: () => {}, onEdit: () => {}, onAction: () => {}, onDismiss: () => {} });
    await tick();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("finds none with everything unfolded and the approval decided", async () => {
    const { container } = render(AgentUi, { status: "approved" });
    await userEvent.click(screen.getByRole("button", { name: "Thought for 12 s" }));
    await userEvent.click(screen.getByRole("button", { name: /Publish/ }));
    await userEvent.click(screen.getByRole("button", { name: /Post to Discord/ }));
    await userEvent.click(screen.getByRole("button", { name: /1 of 3 done/ }));
    expect(await axeViolations(container)).toEqual([]);
  });
});
