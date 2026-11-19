import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import { CodeDiff, diffLines } from "$lib/components";
import type { DiffLine } from "$lib/components";

import { axeViolations } from "../axe";
import CodeDiffActions from "../fixtures/CodeDiffActions.svelte";

/** The diff as compact strings: `=` same, `+` added, `-` removed. */
const short = (ls: DiffLine[]) => ls.map((l) => `${l.kind === "same" ? "=" : l.kind === "add" ? "+" : "-"}${l.text}`);

describe("diffLines", () => {
  it("has no lines for two empty texts, and for identical ones only unchanged lines", () => {
    expect(diffLines([], [])).toEqual([]);
    const same = diffLines(["a", "b"], ["a", "b"]);
    expect(short(same)).toEqual(["=a", "=b"]);
    expect(same.map((l) => [l.beforeNo, l.afterNo])).toEqual([
      [1, 1],
      [2, 2],
    ]);
  });

  it("all added, all removed", () => {
    const add = diffLines([], ["x", "y"]);
    expect(short(add)).toEqual(["+x", "+y"]);
    expect(add.map((l) => [l.beforeNo, l.afterNo])).toEqual([
      [undefined, 1],
      [undefined, 2],
    ]);
    const del = diffLines(["x", "y"], []);
    expect(short(del)).toEqual(["-x", "-y"]);
    expect(del.map((l) => [l.beforeNo, l.afterNo])).toEqual([
      [1, undefined],
      [2, undefined],
    ]);
  });

  it("a mixed edit keeps the common lines and numbers both sides", () => {
    const d = diffLines(["a", "b", "c", "d"], ["a", "B", "c", "d", "e"]);
    expect(short(d)).toEqual(["=a", "-b", "+B", "=c", "=d", "+e"]);
    expect(d[1]).toMatchObject({ beforeNo: 2 });
    expect(d[2]).toMatchObject({ afterNo: 2 });
    expect(d[3]).toMatchObject({ beforeNo: 3, afterNo: 3 });
    expect(d[5]).toMatchObject({ afterNo: 5 });
  });

  it("removed lines come before the added ones that replace them", () => {
    expect(short(diffLines(["a", "b", "z"], ["x", "y", "z"]))).toEqual(["-a", "-b", "+x", "+y", "=z"]);
  });

  it("a reordering is a removal and an addition, not a loss", () => {
    const d = diffLines(["a", "b", "c"], ["c", "a", "b"]);
    expect(d.filter((l) => l.kind === "del").map((l) => l.text)).toEqual(["c"]);
    expect(d.filter((l) => l.kind === "add").map((l) => l.text)).toEqual(["c"]);
    expect(d.filter((l) => l.kind === "same")).toHaveLength(2);
  });

  it("normalize decides what is equal and the text shown is the new line", () => {
    const trim = (l: string) => l.trimEnd();
    expect(diffLines(["a  ", "b"], ["a", "b "], { normalize: trim }).every((l) => l.kind === "same")).toBe(true);
    expect(short(diffLines(["a  ", "b"], ["a", "b "], { normalize: trim }))).toEqual(["=a", "=b "]);
    expect(diffLines(["A"], ["a"]).some((l) => l.kind !== "same")).toBe(true);
    expect(diffLines(["A"], ["a"], { normalize: (l) => l.toLowerCase() }).every((l) => l.kind === "same")).toBe(true);
  });

  it("marks the changed characters of paired lines, between the common head and tail", () => {
    const d = diffLines(["const total = 10;"], ["const total = 25;"]);
    const [del, add] = d;
    expect(del.marks).toEqual([[14, 16]]);
    expect(add.marks).toEqual([[14, 16]]);
    expect(del.text.slice(14, 16)).toBe("10");
    expect(add.text.slice(14, 16)).toBe("25");
  });

  it("marks a pure insertion only on the added line, and nothing when nothing is shared", () => {
    const [del, add] = diffLines(["foo()"], ["foo(bar)"]);
    expect(del.marks).toBeUndefined();
    expect(add.marks).toEqual([[4, 7]]);
    const [d2, a2] = diffLines(["abc"], ["xyz"]);
    expect(d2.marks).toBeUndefined();
    expect(a2.marks).toBeUndefined();
  });

  it("pairs removed and added lines one to one; the extra ones are not marked", () => {
    const d = diffLines(["x1", "x2", "x3"], ["x1!", "x2!"]);
    expect(short(d)).toEqual(["-x1", "-x2", "-x3", "+x1!", "+x2!"]);
    expect(d.map((l) => l.marks)).toEqual([undefined, undefined, undefined, [[2, 3]], [[2, 3]]]);
  });

  it("is fast on 2000 lines with scattered edits, and degrades instead of hanging when nothing matches", () => {
    const a = Array.from({ length: 2000 }, (_, i) => `line ${i}`);
    const b = a.map((l, i) => (i % 50 === 0 ? `${l} changed` : l));
    const t = performance.now();
    const d = diffLines(a, b);
    expect(performance.now() - t).toBeLessThan(2000);
    expect(d.filter((l) => l.kind === "add")).toHaveLength(40);
    expect(d.filter((l) => l.kind === "same")).toHaveLength(1960);

    const x = Array.from({ length: 2500 }, (_, i) => `a${i}`);
    const y = Array.from({ length: 2500 }, (_, i) => `b${i}`);
    const all = diffLines(x, y);
    expect(all.filter((l) => l.kind === "del")).toHaveLength(2500);
    expect(all.filter((l) => l.kind === "add")).toHaveLength(2500);
  });
});

const before = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"].join("\n");
const after = before.replace("two", "TWO").replace("twelve", "12");

describe("CodeDiff", () => {
  it("counts the changes in the header, in text and in words", () => {
    render(CodeDiff, { before: "a\nb\nc", after: "a\nB\nc\nd", ariaLabel: "Edit" });
    const fig = screen.getByRole("figure", { name: "Edit" });
    expect(fig.textContent).toContain("+2");
    expect(fig.textContent).toContain("−1");
    expect(within(fig).getByText("2 lines added, 1 lines removed")).toBeTruthy();
  });

  it("marks every changed line with a sign and a hidden word, and hides the line numbers", () => {
    render(CodeDiff, { before: "a\nb", after: "a\nc" });
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0].textContent).not.toMatch(/Added|Removed/);
    expect(items[1].textContent).toContain("Removed");
    expect(items[1].querySelector(".ta-cd-sign")!.textContent).toBe("−");
    expect(items[2].textContent).toContain("Added");
    expect(items[2].querySelector(".ta-cd-sign")!.textContent).toBe("+");
    for (const n of document.querySelectorAll(".ta-cd-no")) expect(n.getAttribute("aria-hidden")).toBe("true");
    expect(document.querySelectorAll(".ta-cd-no")).toHaveLength(6);
  });

  it("wraps the changed characters in ins and del", () => {
    render(CodeDiff, { before: "let x = 10;", after: "let x = 25;" });
    expect(document.querySelector("del")!.textContent).toBe("10");
    expect(document.querySelector("ins")!.textContent).toBe("25");
  });

  it("can hide the line numbers", () => {
    render(CodeDiff, { before: "a", after: "b", lineNumbers: false });
    expect(document.querySelector(".ta-cd-no")).toBeNull();
  });

  it("folds long unchanged runs, shows the count and expands them (aria-expanded)", async () => {
    render(CodeDiff, { props: { before, after, context: 2 } });
    const btn = screen.getByRole("button", { name: /unchanged lines/ });
    expect(btn.textContent).toContain("5 unchanged lines");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("six")).toBeNull();
    await userEvent.click(btn);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("six")).toBeTruthy();
    await userEvent.click(btn);
    expect(screen.queryByText("six")).toBeNull();
  });

  it("keeps `context` lines around a change", () => {
    render(CodeDiff, { props: { before, after, context: 3 } });
    // Changes on lines 2 and 12: lines 1-5 and 9-12 stay, "six".."eight" fold.
    expect(screen.getByRole("button", { name: "3 unchanged lines" })).toBeTruthy();
    expect(screen.getByText("five")).toBeTruthy();
    expect(screen.queryByText("six")).toBeNull();
    expect(screen.getByText("nine")).toBeTruthy();
  });

  it("does not fold a single line", () => {
    render(CodeDiff, { props: { before: "a\nb\nc\nd\ne", after: "A\nb\nc\nd\nE", context: 1 } });
    expect(screen.queryByRole("button", { name: /unchanged/ })).toBeNull();
    expect(screen.getByText("c")).toBeTruthy();
  });

  it("fold={false} shows every line", () => {
    render(CodeDiff, { before, after, fold: false });
    expect(screen.queryByRole("button", { name: /unchanged/ })).toBeNull();
    expect(screen.getByText("six")).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(14);
  });

  it("split mode puts before and after side by side, row by row", () => {
    render(CodeDiff, { before: "a\nb\nc", after: "a\nB\nc", mode: "split", beforeLabel: "Current", afterLabel: "Proposed" });
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    const cells = rows[1].querySelectorAll(".ta-cd-cell");
    expect(cells).toHaveLength(2);
    expect(cells[0].textContent).toContain("b");
    expect(cells[0].textContent).toContain("Removed");
    expect(cells[1].textContent).toContain("B");
    expect(cells[1].textContent).toContain("Added");
    expect(screen.getByText("Current")).toBeTruthy();
    expect(screen.getByText("Proposed")).toBeTruthy();
  });

  it("split mode leaves the other side empty when a run has more removed than added lines", () => {
    render(CodeDiff, { before: "a\nb\nc", after: "a", mode: "split" });
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    expect(rows[2].querySelector(".ta-cd-cell--empty")).toBeTruthy();
  });

  it("shows emptyText (or the default) when there are no differences", () => {
    const { unmount } = render(CodeDiff, { before: "same\n", after: "same" });
    expect(screen.getByText("No differences")).toBeTruthy();
    expect(screen.queryByRole("list")).toBeNull();
    unmount();
    render(CodeDiff, { before: "x", after: "x", emptyText: "Nothing changed" });
    expect(screen.getByText("Nothing changed")).toBeTruthy();
  });

  it("normalize ignores differences it maps away", () => {
    render(CodeDiff, { before: "a  \nb", after: "a\nb", normalize: (l: string) => l.trimEnd() });
    expect(screen.getByText("No differences")).toBeTruthy();
  });

  it("gives the actions snippet the counts", () => {
    render(CodeDiffActions);
    expect(screen.getByRole("button", { name: "Copy for X (1/1)" })).toBeTruthy();
  });

  it("is a figure with a named list and has no axe violations", async () => {
    render(CodeDiff, { before, after, ariaLabel: "Changes to plan.ts", mode: "split" });
    expect(screen.getByRole("figure", { name: "Changes to plan.ts" })).toBeTruthy();
    expect(screen.getByRole("list", { name: "Changes to plan.ts" })).toBeTruthy();
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it("renders the same HTML for the same input", () => {
    const a = render(CodeDiff, { before, after });
    const html = a.container.innerHTML;
    a.unmount();
    expect(render(CodeDiff, { before, after }).container.innerHTML).toBe(html);
  });
});
