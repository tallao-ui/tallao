import fs from "node:fs";

import { fireEvent, render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";
import { compile } from "svelte/compiler";

import { ribbonPath, sankeyLayout } from "$lib/internal/sankey";

import { axeViolations } from "../axe";
import Round3 from "../fixtures/Round3.svelte";

// jsdom has no PointerEvent: a MouseEvent of that type carries clientX just the same.
const pointer = (el: Element, type: string, clientX: number) => fireEvent(el, new MouseEvent(type, { clientX, bubbles: true }));
const figureOf = (title: string) => screen.getByText(title, { selector: "figcaption" }).closest("figure") as HTMLElement;

describe("CardStack", () => {
  it("is a named group that shows one card, hides the ones behind and says the position", () => {
    render(Round3);
    const stack = screen.getByRole("group", { name: "Featured decks" });
    expect(within(stack).getByRole("heading", { name: "Ember Rush" })).toBeTruthy();
    expect(within(stack).queryByRole("heading", { name: "Tidewall" })).toBeNull();
    const behind = screen.getByTestId("card-1").parentElement!;
    expect((behind as HTMLElement & { inert?: boolean }).inert || behind.hasAttribute("inert")).toBe(true);
    expect(behind.getAttribute("aria-hidden")).toBe("true");
    const position = stack.querySelector('[aria-live="polite"]')!;
    expect(position.textContent).toBe("1 of 3");
    expect((within(stack).getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("Next, the arrow keys, Home and End move through the deck", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce"), addEventListener() {}, removeEventListener() {} }));
    try {
      render(Round3);
      const stack = screen.getByRole("group", { name: "Featured decks" });
      await userEvent.click(within(stack).getByRole("button", { name: "Next" }));
      expect(screen.getByTestId("index").textContent).toBe("1");
      expect(stack.querySelector('[aria-live="polite"]')!.textContent).toBe("2 of 3");
      expect(within(stack).getByRole("heading", { name: "Tidewall" })).toBeTruthy();
      await userEvent.keyboard("{ArrowRight}");
      expect(screen.getByTestId("index").textContent).toBe("2");
      expect((within(stack).getByRole("button", { name: "Next" }) as HTMLButtonElement).disabled).toBe(true);
      await userEvent.keyboard("{ArrowRight}");
      expect(screen.getByTestId("index").textContent).toBe("2");
      within(stack).getByRole("button", { name: "Previous" }).focus();
      await userEvent.keyboard("{ArrowLeft}");
      expect(screen.getByTestId("index").textContent).toBe("1");
      await userEvent.keyboard("{Home}");
      expect(screen.getByTestId("index").textContent).toBe("0");
      await userEvent.keyboard("{End}");
      expect(screen.getByTestId("index").textContent).toBe("2");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("a drag past a quarter of the card flicks it away; a short one puts it back; loop wraps", async () => {
    vi.useFakeTimers();
    try {
      render(Round3, { loop: true });
      const top = screen.getByTestId("card-0").parentElement!;
      Object.defineProperty(top, "offsetWidth", { value: 200, configurable: true });
      await pointer(top, "pointerdown", 100);
      await pointer(top, "pointermove", 80);
      expect(top.getAttribute("style")).toContain("translateX(-20px)");
      await pointer(top, "pointerup", 80);
      await vi.advanceTimersByTimeAsync(300);
      expect(screen.getByTestId("index").textContent).toBe("0");

      await pointer(top, "pointerdown", 100);
      await pointer(top, "pointermove", 20);
      await pointer(top, "pointerup", 20);
      // It flies off first, then the next card is on top.
      expect(top.getAttribute("style")).toContain("translateX(-130%)");
      await vi.advanceTimersByTimeAsync(300);
      expect(screen.getByTestId("index").textContent).toBe("1");
      // With loop the last card leads back to the first.
      const stack = screen.getByRole("group", { name: "Featured decks" });
      expect((within(stack).getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("CalendarHeatmap", () => {
  it("is a real table: months over their weeks, a weekday per row, a day per cell with its value in text", () => {
    render(Round3);
    const figure = figureOf("Matches played");
    const region = within(figure).getByRole("region", { name: "Matches played" });
    expect(region.tabIndex).toBe(0);
    const table = within(region).getByRole("table");
    const rows = within(table).getAllByRole("row");
    // The header row and seven weekdays, Monday first.
    expect(rows).toHaveLength(8);
    expect(within(rows[1]).getByRole("rowheader").textContent).toContain("Monday");
    expect(within(rows[7]).getByRole("rowheader").textContent).toContain("Sunday");
    // Oct 28 to Nov 10 is three weeks: Oct 26, Nov 2, Nov 9.
    expect(rows[1].querySelectorAll("td")).toHaveLength(3);
    const months = [...rows[0].querySelectorAll("th")].map((th) => `${th.textContent?.trim()}:${th.getAttribute("colspan")}`);
    expect(months).toEqual(["Oct:1", "Nov:2"]);
    const monday = [...rows[1].querySelectorAll("td")];
    // Oct 26 is before the range: an empty cell. Nov 2 has the largest value: the darkest shade.
    expect(monday[0].className).toMatch(/ta-calheat-pad/);
    expect(monday[1].textContent).toBe("Nov 2, 2026: 8 matches");
    expect(monday[1].getAttribute("title")).toBe("Nov 2, 2026: 8 matches");
    expect(monday[1].className).toMatch(/ta-calheat-day--4/);
    expect(rows[2].querySelectorAll("td")[1].className).toMatch(/ta-calheat-day--2/);
    expect(rows[2].querySelectorAll("td")[2].textContent).toBe("Nov 10, 2026: 0 matches");
    expect(rows[2].querySelectorAll("td")[2].className).toMatch(/ta-calheat-day--0/);
    // A day in range with no data says so.
    expect(rows[3].querySelectorAll("td")[1].textContent).toBe("Nov 4, 2026: —");
    expect(figure.querySelector(".ta-calheat-scale")!.textContent?.replace(/\s+/g, " ").trim()).toBe("Less More");
  });

  it("with no data it shows the empty state", () => {
    render(Round3);
    const figure = figureOf("No activity");
    expect(figure.textContent).toContain("No data");
    expect(figure.querySelector("table")).toBeNull();
  });
});

describe("DateRangePicker", () => {
  const group = () => screen.getByRole("group", { name: "Choose dates" });

  it("is two named text fields that a plain form submits", () => {
    render(Round3);
    const start = within(group()).getByRole("textbox", { name: "Start date" }) as HTMLInputElement;
    const end = within(group()).getByRole("textbox", { name: "End date" }) as HTMLInputElement;
    expect(start.name).toBe("period_start");
    expect(end.name).toBe("period_end");
    expect(start.value).toBe("2026-11-03");
    const data = new FormData(screen.getByTestId("form") as HTMLFormElement);
    expect([...data.entries()]).toEqual([["period_start", "2026-11-03"], ["period_end", ""]]);
  });

  it("typing commits a real date, marks one that does not exist, and keeps the range in order", async () => {
    const onRange = vi.fn();
    render(Round3, { onRange });
    const end = within(group()).getByRole("textbox", { name: "End date" });
    await userEvent.type(end, "2026-02-31{Enter}");
    expect(end.getAttribute("aria-invalid")).toBe("true");
    expect(onRange).not.toHaveBeenCalled();
    await userEvent.clear(end);
    await userEvent.type(end, "2026-11-01{Enter}");
    // The end was before the start: they swap.
    expect(onRange).toHaveBeenLastCalledWith({ start: "2026-11-01", end: "2026-11-03" });
    expect(screen.getByTestId("range").textContent).toBe("2026-11-01|2026-11-03");
    expect(end.hasAttribute("aria-invalid")).toBe(false);
  });

  it("the button opens a panel with quick ranges and a calendar per end; Escape returns the focus", async () => {
    render(Round3);
    const button = within(group()).getByRole("button", { name: "Choose dates" });
    expect(button.getAttribute("aria-haspopup")).toBe("dialog");
    await userEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    const panel = screen.getByRole("dialog", { name: "Choose dates" });
    expect(within(panel).getByRole("group", { name: "Start date" })).toBeTruthy();
    expect(within(panel).getByRole("group", { name: "End date" })).toBeTruthy();
    await userEvent.click(within(panel).getByRole("button", { name: "Season 3" }));
    expect(screen.getByTestId("range").textContent).toBe("2026-09-01|2026-11-30");
    expect(within(panel).getByRole("button", { name: "Season 3" }).getAttribute("aria-pressed")).toBe("true");
    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(screen.queryByRole("dialog", { name: "Choose dates" })).toBeNull());
    expect(document.activeElement).toBe(button);
  });

  it("a preset in days counts back from today, today included", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 10, 12));
    try {
      render(Round3);
      await userEvent.click(within(group()).getByRole("button", { name: "Choose dates" }));
      await userEvent.click(screen.getByRole("button", { name: "Last 7 days" }));
      expect(screen.getByTestId("range").textContent).toBe("2026-11-04|2026-11-10");
    } finally {
      vi.useRealTimers();
    }
  });

  it("picking a day in the start calendar sets the start", async () => {
    render(Round3);
    await userEvent.click(within(group()).getByRole("button", { name: "Choose dates" }));
    const start = within(screen.getByRole("dialog", { name: "Choose dates" })).getByRole("group", { name: "Start date" });
    const day = within(start)
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === "12")!;
    await userEvent.click(day);
    expect(screen.getByTestId("range").textContent).toBe("2026-11-12|");
  });
});

describe("FilterBar with a date range filter", () => {
  it("stores the two dates as start..end and shows them on the chip", async () => {
    render(Round3);
    const bar = screen.getByRole("search", { name: "Filters" });
    await userEvent.click(within(bar).getByRole("button", { name: "Period" }));
    const panel = screen.getByRole("dialog", { name: "Period" });
    await userEvent.click(within(panel).getByRole("button", { name: "This month" }));
    const value = JSON.parse(screen.getByTestId("query").textContent!).period as string;
    expect(value).toMatch(/^\d{4}-\d{2}-01\.\.\d{4}-\d{2}-\d{2}$/);
    const [from, to] = value.split("..");
    expect(within(bar).getByRole("button", { name: `Period: ${from} – ${to}` })).toBeTruthy();
    await userEvent.click(within(bar).getByRole("button", { name: "Remove filter: Period" }));
    expect(screen.getByTestId("query").textContent).toBe("{}");
  });
});

describe("the Sankey layout", () => {
  const links = [
    { source: "A", target: "C", value: 30 },
    { source: "A", target: "D", value: 10 },
    { source: "B", target: "C", value: 20 },
    { source: "C", target: "E", value: 50 },
    { source: "D", target: "E", value: 10 },
    { source: "A", target: "E", value: 5 },
  ];
  const layout = sankeyLayout(links, { width: 600, height: 300 });
  const node = (id: string) => layout.nodes.find((n) => n.id === id)!;

  it("puts nodes in columns by longest path, and end nodes in the last column", () => {
    expect(layout.layers).toBe(3);
    expect(["A", "B", "C", "D", "E"].map((id) => node(id).layer)).toEqual([0, 0, 1, 1, 2]);
    expect(node("A").x).toBe(0);
    expect(node("E").x).toBe(588);
    const loose = sankeyLayout([{ source: "A", target: "B", value: 1 }, { source: "B", target: "C", value: 1 }, { source: "A", target: "X", value: 1 }], { width: 300, height: 100, align: "left" });
    expect(loose.nodes.find((n) => n.id === "X")!.layer).toBe(1);
    const justified = sankeyLayout([{ source: "A", target: "B", value: 1 }, { source: "B", target: "C", value: 1 }, { source: "A", target: "X", value: 1 }], { width: 300, height: 100 });
    expect(justified.nodes.find((n) => n.id === "X")!.layer).toBe(2);
  });

  it("gives every node a height proportional to its flow, on one scale, without overlaps", () => {
    const scale = node("C").height / node("C").value;
    for (const n of layout.nodes) expect(n.height / n.value).toBeCloseTo(scale, 6);
    expect(node("A").value).toBe(45);
    expect(node("E").value).toBe(65);
    for (let layer = 0; layer < layout.layers; layer++) {
      const column = layout.nodes.filter((n) => n.layer === layer).sort((a, b) => a.y - b.y);
      for (let i = 1; i < column.length; i++) expect(column[i].y).toBeGreaterThanOrEqual(column[i - 1].y + column[i - 1].height + 13.99);
      for (const n of column) {
        expect(n.y).toBeGreaterThanOrEqual(-0.01);
        expect(n.y + n.height).toBeLessThanOrEqual(300.01);
      }
    }
  });

  it("draws each ribbon as thick as its value, from inside its source to inside its target", () => {
    const scale = node("C").height / node("C").value;
    for (const link of layout.links) {
      expect(link.width).toBeCloseTo(link.value * scale, 6);
      const first = link.points[0];
      const end = link.points[link.points.length - 1];
      const from = node(link.source);
      const to = node(link.target);
      expect(first.x).toBe(from.x + 12);
      expect(end.x).toBe(to.x);
      expect(first.y - link.width / 2).toBeGreaterThanOrEqual(from.y - 0.01);
      expect(first.y + link.width / 2).toBeLessThanOrEqual(from.y + from.height + 0.01);
      expect(end.y - link.width / 2).toBeGreaterThanOrEqual(to.y - 0.01);
      expect(end.y + link.width / 2).toBeLessThanOrEqual(to.y + to.height + 0.01);
    }
    // A link that skips a column passes through a waypoint in it: four points instead of two.
    expect(layout.links.find((l) => l.source === "A" && l.target === "E")!.points).toHaveLength(4);
    expect(ribbonPath([{ x: 0, y: 10 }, { x: 100, y: 30 }], 4)).toBe("M0.0,8.0C50.0,8.0 50.0,28.0 100.0,28.0L100.0,32.0C50.0,32.0 50.0,12.0 0.0,12.0Z");
  });

  it("orders the columns to remove the crossings a naive order has", () => {
    // In input order the second column would be [X, Y], which crosses both ribbons.
    const crossed = sankeyLayout([{ source: "A", target: "Y", value: 1 }, { source: "B", target: "X", value: 1 }, { source: "A", target: "Z", value: 1 }, { source: "X", target: "Z", value: 1 }], { width: 300, height: 200, align: "left" });
    const at = (id: string) => crossed.nodes.find((n) => n.id === id)!;
    expect(at("A").order).toBeLessThan(at("B").order);
    expect(at("Y").y).toBeLessThan(at("X").y);
  });

  it("sets aside links that would close a cycle, have no value or point at themselves", () => {
    const result = sankeyLayout([{ source: "A", target: "B", value: 3 }, { source: "B", target: "A", value: 1 }, { source: "B", target: "B", value: 2 }, { source: "B", target: "C", value: 0 }], { width: 200, height: 100 });
    expect(result.links).toHaveLength(1);
    expect(result.skipped).toHaveLength(3);
    expect(sankeyLayout([], { width: 200, height: 100 }).nodes).toEqual([]);
  });
});

describe("SankeyChart", () => {
  it("is a figure with a node per name, its total in text, and the table of every flow", async () => {
    render(Round3);
    const figure = figureOf("Where players go");
    const group = within(figure).getByRole("group", { name: "Where players go" });
    const nodes = within(group).getAllByRole("img");
    expect(nodes).toHaveLength(4);
    expect(nodes[0].getAttribute("aria-label")).toBe("Signed up: 1,000 players. To: Tutorial 720 players, Left 280 players");
    expect(nodes[0].getAttribute("tabindex")).toBe("0");
    expect(group.querySelectorAll(".ta-sankey-link")).toHaveLength(4);
    expect(group.querySelector(".ta-sankey-link title")!.textContent).toBe("Signed up → Tutorial: 720 players");
    expect(figure.querySelector(".ta-sankey-label")!.textContent?.replace(/\s+/g, " ").trim()).toBe("Signed up1,000");
    // The link back to the start would close a loop: not drawn, kept in the table, and said.
    expect(figure.querySelector(".ta-sankey-note")!.textContent).toBe("* 1 not drawn: it would close a loop");
    await userEvent.click(within(figure).getByRole("button", { name: "Show data" }));
    const rows = within(within(figure).getByRole("table")).getAllByRole("row").map((r) => [...r.children].map((c) => c.textContent?.trim()).join(" | "));
    expect(rows[0]).toBe("From | To | Value");
    expect(rows[1]).toBe("Signed up | Tutorial | 720 players");
    expect(rows[5]).toBe("Ranked | Signed up | 5 players *");
  });

  it("focusing a node highlights its flows and dims the rest", async () => {
    render(Round3);
    const figure = figureOf("Where players go");
    const ranked = within(figure).getByRole("img", { name: /^Ranked/ });
    ranked.focus();
    await tick();
    const links = [...figure.querySelectorAll(".ta-sankey-link")];
    expect(links.filter((l) => l.classList.contains("ta-sankey-link--lit"))).toHaveLength(1);
    expect(links.filter((l) => l.classList.contains("ta-sankey-link--dim"))).toHaveLength(3);
    expect(within(figure).getByRole("img", { name: /^Left/ }).classList.contains("ta-sankey-node--dim")).toBe(true);
    expect(within(figure).getByRole("img", { name: /^Tutorial/ }).classList.contains("ta-sankey-node--dim")).toBe(false);
    ranked.blur();
    await tick();
    expect(figure.querySelector(".ta-sankey-link--dim")).toBeNull();
  });

  it("with no flows it shows the empty state", () => {
    render(Round3);
    expect(figureOf("No flows").textContent).toContain("No data");
  });
});

describe("Checkbox with a drawn mark", () => {
  it("is still a native checkbox: Space toggles it, it binds and it submits", async () => {
    render(Round3);
    const box = screen.getByRole("checkbox", { name: "Agree" }) as HTMLInputElement;
    expect(box.type).toBe("checkbox");
    expect(box.name).toBe("agree");
    const mark = box.nextElementSibling!;
    expect(mark.tagName.toLowerCase()).toBe("svg");
    expect(mark.getAttribute("aria-hidden")).toBe("true");
    box.focus();
    await userEvent.keyboard(" ");
    expect(box.checked).toBe(true);
    expect(screen.getByTestId("agreed").textContent).toBe("true");
    await userEvent.click(screen.getByText("Agree"));
    expect(box.checked).toBe(false);
  });

  it("keeps the system's own checkbox under forced colours, and no drawing under reduced motion", () => {
    const css = compile(fs.readFileSync("src/lib/components/checkbox.svelte", "utf8"), { filename: "checkbox.svelte", generate: "client", css: "external" }).css!.code;
    expect(css).toMatch(/@media \(forced-colors: active\)[\s\S]*appearance: auto/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*ta-checkbox-check[\s\S]*transition: none/);
  });
});

describe("Badge tones on the light theme", () => {
  const tokens = fs.readFileSync("src/lib/tokens.css", "utf8");
  const light = tokens.slice(tokens.indexOf(':root[data-tallao-theme="light"]'));
  const channel = (source: string, name: string) => source.match(new RegExp(`${name}:\\s*(\\d+) (\\d+) (\\d+)`))!.slice(1).map(Number);
  const lin = (c: number) => (c / 255 <= 0.03928 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
  const luminance = (rgb: number[]) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
  const contrast = (a: number[], b: number[]) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const mix = (a: number[], b: number[], share: number) => a.map((v, i) => v * (1 - share) + b[i] * share);
  const tones = { success: "--ta-success", warning: "--ta-warning", error: "--ta-danger", info: "--ta-info", accent: "--ta-accent-hover", "accent-2": "--ta-accent-2" };

  it("the label reaches 4.5:1 on its tint with the light theme's ink", () => {
    const ink = Number(light.match(/--ta-tone-ink:\s*(\d+)%/)![1]) / 100;
    const text = channel(light, "--ta-text");
    const surface = channel(light, "--ta-surface");
    for (const [variant, token] of Object.entries(tones)) {
      const tone = channel(tokens, token);
      const background = mix(surface, channel(tokens, token === "--ta-accent-hover" ? "--ta-accent" : token), 0.1);
      expect(contrast(mix(tone, text, ink), background), variant).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("the dark theme is untouched: no ink there, and the badge reads the token", () => {
    expect(tokens.slice(0, tokens.indexOf(':root[data-tallao-theme="light"]'))).toMatch(/--ta-tone-ink: 0%;/);
    const css = fs.readFileSync("src/lib/components/badge.svelte", "utf8");
    for (const token of Object.values(tones)) expect(css).toContain(`color: color-mix(in srgb, rgb(var(${token})), rgb(var(--ta-text)) var(--ta-tone-ink, 0%));`);
  });
});

describe("exit transitions", () => {
  const cssOf = (name: string) => compile(fs.readFileSync(`src/lib/components/${name}.svelte`, "utf8"), { filename: `${name}.svelte`, generate: "client", css: "external" }).css!.code;

  it("Dialog fades out with allow-discrete on display and overlay, and not under reduced motion", () => {
    const css = cssOf("dialog");
    expect(css).toMatch(/display var\(--ta-duration-base, 180ms\) allow-discrete/);
    expect(css).toMatch(/overlay var\(--ta-duration-base, 180ms\) allow-discrete/);
    expect(css).toContain("@starting-style");
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.ta-dialog-overlay[^{]*\{[^}]*transition: none/);
  });

  it("a Popover stays in the DOM while it leaves, then goes; it can be reopened meanwhile", async () => {
    render(Round3);
    const trigger = screen.getByRole("button", { name: "Open panel" });
    await userEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Panel" })).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await vi.waitFor(() => expect(screen.queryByRole("dialog", { name: "Panel" })).toBeNull());
    await userEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Panel" })).toBeTruthy();
  });

  it("the overlays and the toasts have an out transition from tallao/motion", () => {
    for (const [name, call] of [["dialog", "out:exit"], ["popover", "out:scaleIn"], ["dropdown-menu", "out:scaleIn"], ["toaster", "out:fade"]] as const) {
      expect(fs.readFileSync(`src/lib/components/${name}.svelte`, "utf8"), name).toContain(call);
    }
  });

  it("a DataTable row that is deleted leaves the table; a table that changes all its rows does not wait", async () => {
    const all = [{ id: "a", name: "Ana" }, { id: "b", name: "Bea" }, { id: "c", name: "Ciro" }];
    const { rerender } = render(Round3, { rows: all });
    const table = screen.getByRole("table", { name: "People" });
    const names = () => [...table.querySelectorAll("tbody tr")].map((tr) => tr.textContent?.trim());
    await rerender({ rows: all.filter((r) => r.id !== "b") });
    await vi.waitFor(() => expect(names()).toEqual(["Ana", "Ciro"]));
    await rerender({ rows: [{ id: "x", name: "Xan" }, { id: "y", name: "Yuri" }, { id: "z", name: "Zoe" }] });
    await vi.waitFor(() => expect(names()).toEqual(["Xan", "Yuri", "Zoe"]));
  });
});

describe("axe on the round three pieces", () => {
  it("finds no violations", async () => {
    const { container } = render(Round3);
    await tick();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("finds none with the date range panel open", async () => {
    const { container } = render(Round3);
    await userEvent.click(within(screen.getByRole("group", { name: "Choose dates" })).getByRole("button", { name: "Choose dates" }));
    expect(await axeViolations(container)).toEqual([]);
  });
});
