import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import { es } from "$lib/i18n";
import { arcPath, niceDomain } from "$lib/internal/chart";
import { axeViolations } from "../axe";
import Bi from "../fixtures/Bi.svelte";

/** The `<figure>` whose caption is `title`. */
const figure = (title: string) => screen.getByText(title, { selector: "figcaption" }).closest("figure") as HTMLElement;

describe("BarChart: stacked and horizontal", () => {
  it("reads every series and the total of a stacked bar, and puts the total in the table", async () => {
    render(Bi);
    const bars = screen.getByRole("slider", { name: "Role share by patch" });
    bars.focus();
    await tick();
    expect(bars.getAttribute("aria-valuetext")).toBe("1.0: DPS 50, Support 30, Tank 20, Total 100");
    await userEvent.keyboard("{End}");
    expect(bars.getAttribute("aria-valuetext")).toBe("1.2: DPS 60, Support 28, Tank —, Total 88");

    const card = screen.getByTestId("card");
    await userEvent.click(within(card).getByRole("button", { name: "Show data" }));
    const table = within(card).getByRole("table");
    expect(within(table).getAllByRole("columnheader").map((th) => th.textContent?.trim())).toEqual(["Patch", "DPS", "Support", "Tank", "Total"]);
    expect(within(table).getAllByRole("row")).toHaveLength(4);
    expect(table.textContent).toContain("88");
  });

  it("steps down the rows of horizontal bars", async () => {
    render(Bi);
    const bars = screen.getByRole("slider", { name: "Roles across" });
    expect(bars.getAttribute("aria-orientation")).toBe("vertical");
    bars.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(bars.getAttribute("aria-valuetext")).toBe("1.1: DPS 55, Support 25, Tank 20");
    await userEvent.keyboard("{ArrowUp}");
    expect(bars.getAttribute("aria-valuetext")).toBe("1.0: DPS 50, Support 30, Tank 20");
    // The category names are drawn on the left, one per row.
    expect(figure("Roles across").querySelectorAll(".ta-chart-category")).toHaveLength(3);
  });

  it("keeps the title for screen readers when hidden, and still names the figure", () => {
    render(Bi);
    const caption = screen.getByText("Role share by patch", { selector: "figcaption" });
    expect(caption.classList.contains("ta-chart-hidden")).toBe(true);
  });
});

describe("LineChart: stacked areas and a domain", () => {
  it("reads the total of the stacked series", async () => {
    render(Bi);
    const line = screen.getByRole("slider", { name: "Stacked roles" });
    line.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(line.getAttribute("aria-valuetext")).toBe("1.1: DPS 55, Support 25, Tank 20, Total 100");
    // One filled band per series.
    expect(figure("Stacked roles").querySelectorAll("path[fill-opacity]")).toHaveLength(3);
  });

  it("draws the scale between the bounds of `domain`", () => {
    render(Bi);
    const ticks = [...figure("Win rate trend").querySelectorAll("text.ta-chart-axis")].map((t) => t.textContent);
    expect(ticks).toContain("45%");
    expect(ticks).toContain("55%");
    expect(ticks).not.toContain("0%");
  });
});

describe("DonutChart", () => {
  it("lists every slice with its value and share, and the total", () => {
    render(Bi);
    const donut = figure("Picks by element");
    const items = within(donut).getAllByRole("listitem");
    // The slice with value 0 is left out.
    expect(items.map((li) => li.textContent?.replace(/\s+/g, " ").trim())).toEqual(["Fire 40 · 40%", "Water 30 · 30%", "Grass 20 · 20%", "Rock 10 · 10%"]);
    expect(donut.textContent).toContain("Total: 100");
    expect(donut.querySelectorAll("svg path")).toHaveLength(4);
    expect(donut.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("groups what does not fit into Other, and draws a pie with no centre text", () => {
    render(Bi);
    const pie = figure("Many slices");
    const items = within(pie).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[3].textContent?.replace(/\s+/g, " ").trim()).toBe("Other 70 · 70%");
    expect(pie.querySelector(".ta-donut-value")).toBeNull();
  });
});

describe("ScatterChart", () => {
  it("steps through the points from left to right and reads each one", async () => {
    render(Bi);
    const scatter = screen.getByRole("slider", { name: "Pick rate against win rate" });
    scatter.focus();
    await tick();
    expect(scatter.getAttribute("aria-valuetext")).toBe("Moss, Grass: Pick rate 6%, Win rate 47%");
    await userEvent.keyboard("{ArrowRight}");
    expect(scatter.getAttribute("aria-valuetext")).toBe("Tide, Water: Pick rate 12%, Win rate 51%");
    await userEvent.keyboard("{End}");
    expect(scatter.getAttribute("aria-valuetext")).toBe("Kaela, Fire: Pick rate 18%, Win rate 54%");
    await userEvent.keyboard("{Escape}");
    expect(scatter.getAttribute("aria-valuetext")).toBe("Pick rate against win rate");
  });

  it("gives each group its own shape, a legend and a table", async () => {
    render(Bi);
    const chart = figure("Pick rate against win rate");
    expect(within(chart).getAllByRole("listitem").map((li) => li.textContent?.trim())).toEqual(["Grass", "Water", "Fire"]);
    const marks = [...chart.querySelectorAll(".ta-legend-mark")].map((m) => m.className);
    expect(new Set(marks).size).toBe(3);
    await userEvent.click(within(chart).getByRole("button", { name: "Show data" }));
    expect(within(chart).getAllByRole("columnheader").map((th) => th.textContent?.trim())).toEqual(["Label", "Group", "Pick rate", "Win rate"]);
    expect(within(chart).getAllByRole("row")).toHaveLength(4);
  });
});

describe("Heatmap", () => {
  it("is a table with row and column headers, values in text and a dash for a missing cell", () => {
    render(Bi);
    const region = screen.getByRole("group", { name: "Matchups" });
    expect(region.getAttribute("tabindex")).toBe("0");
    const table = within(region).getByRole("table");
    expect(within(table).getAllByRole("columnheader").map((th) => th.textContent)).toEqual(["Attacker", "Fire", "Water"]);
    expect(within(table).getAllByRole("rowheader").map((th) => th.textContent)).toEqual(["Fire", "Water"]);
    expect(within(table).getAllByRole("cell").map((td) => td.textContent?.trim())).toEqual(["50%", "38%", "62%", "—"]);
    // The lowest value gets the lightest shade, the highest the darkest.
    const shades = [...table.querySelectorAll<HTMLElement>("td.ta-heatmap-cell")].map((td) => td.style.getPropertyValue("--ta-heat"));
    expect(shades.slice(0, 3)).toEqual(["0.390", "0.080", "0.700"]);
  });
});

describe("Funnel", () => {
  it("prints each step's value, share of the first and share of the previous", () => {
    render(Bi);
    const steps = within(screen.getByRole("list", { name: "New players" })).getAllByRole("listitem");
    expect(steps).toHaveLength(3);
    expect(steps[0].textContent).toContain("100%");
    expect(steps[0].textContent).not.toContain("previous");
    expect(steps[1].textContent).toContain("40% of the previous step");
    expect(steps[2].textContent).toContain("10%");
    expect(steps[2].textContent).toContain("25% of the previous step");
  });
});

describe("BarList", () => {
  it("is a named list with values in text; ranked numbers the rows and `href` links the label", () => {
    render(Bi);
    const list = screen.getByRole("list", { name: "Most picked" });
    expect(list.tagName).toBe("OL");
    const rows = within(list).getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    expect(rows[0].textContent).toContain("18%");
    expect(within(rows[0]).getByRole("link", { name: "Kaela" }).getAttribute("href")).toBe("/kaela");
    // The longest bar is the largest value; the others are in proportion.
    const fills = [...list.querySelectorAll<HTMLElement>(".ta-barlist-fill")].map((f) => f.style.width);
    expect(fills[0]).toBe("100%");
    expect(parseFloat(fills[2])).toBeCloseTo(33.33, 1);

    const plain = screen.getByRole("list", { name: "Unranked" });
    expect(plain.tagName).toBe("UL");
    expect(within(plain).getAllByRole("listitem")).toHaveLength(2);
  });
});

describe("Sparkline, Gauge, IconArray", () => {
  it("names the sparkline with the trend in words", () => {
    render(Bi);
    expect(screen.getByRole("img", { name: "Pick rate: from 12 to 18, low 9, high 18" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Too short: No data" })).toBeTruthy();
  });

  it("exposes the gauge as a meter with its value, and clamps it to the range", () => {
    render(Bi);
    const dial = screen.getByRole("meter", { name: "Win rate" });
    expect(dial.getAttribute("aria-valuenow")).toBe("52.4");
    expect(dial.getAttribute("aria-valuetext")).toBe("52.4%, Target 55%");
    const ring = screen.getByRole("meter", { name: "Completion" });
    expect(ring.getAttribute("aria-valuenow")).toBe("100");
    expect(ring.querySelector(".ta-gauge-arc")?.getAttribute("stroke-dasharray")).toBe("100.00 100");
  });

  it("fills as many marks as the value and says the count in words", () => {
    render(Bi);
    const summary = screen.getByText("7 of 10");
    const array = summary.closest(".ta-iconarray") as HTMLElement;
    expect(array.textContent).toContain("players pick a Fire lead");
    expect(array.querySelectorAll(".ta-iconarray-mark")).toHaveLength(10);
    expect(array.querySelectorAll(".ta-iconarray-mark--filled")).toHaveLength(7);
    expect(screen.getByRole("img", { name: "3 of 5 wins" })).toBeTruthy();
  });
});

describe("Timeline and ComparisonBar", () => {
  it("formats ISO dates, keeps other text, links titles and marks the current event", () => {
    render(Bi);
    const items = within(screen.getByRole("list", { name: "Season" })).getAllByRole("listitem");
    const time = items[0].querySelector("time")!;
    expect(time.getAttribute("datetime")).toBe("2026-11-03");
    expect(time.textContent).toBe("Nov 3, 2026");
    expect(within(items[0]).getByRole("link", { name: "Patch 1.2" }).getAttribute("href")).toBe("/patch");
    expect(items[0].textContent).toContain("Patch");
    expect(items[1].querySelector("time")?.hasAttribute("datetime")).toBe(false);
    expect(items[1].textContent).toContain("Season 3");
    expect(items[1].getAttribute("aria-current")).toBe("step");
  });

  it("prints both sides with their share and marks the larger one", () => {
    render(Bi);
    const versus = screen.getByRole("group", { name: "Side win rate" });
    expect(versus.textContent).toContain("52.3%");
    expect(versus.textContent).toContain("47.7%");
    const lead = versus.querySelectorAll(".ta-versus-side--lead");
    expect(lead).toHaveLength(1);
    expect(lead[0].textContent).toContain("Blue side");
    expect(versus.querySelectorAll(".ta-versus-segment--behind")).toHaveLength(1);
  });
});

describe("KpiCard, ChartCard, BigNumber and the dashboard grid", () => {
  it("says the direction and the meaning of a change in words", () => {
    render(Bi);
    const kpi = screen.getByTestId("kpi");
    expect(kpi.textContent).toContain("52.4");
    expect(kpi.textContent?.replace(/\s+/g, " ")).toContain("up +1.8 (better)");
    expect(kpi.textContent).toContain("vs last patch");
    expect(kpi.textContent).toContain("Target 55");
    expect(within(kpi).getByRole("img").getAttribute("aria-label")).toContain("Win rate: from 49 to 52.4");
    // A rising ban rate is bad: same arrow, the other verdict.
    const bad = screen.getByTestId("kpi-bad");
    expect(bad.textContent?.replace(/\s+/g, " ")).toContain("up +4 (worse)");
    expect(bad.querySelector(".ta-kpi-delta--bad")).toBeTruthy();
    const flat = screen.getByTestId("kpi-flat");
    expect(flat.textContent).toContain("no change");
    expect(flat.querySelector(".ta-kpi-delta--neutral")).toBeTruthy();
  });

  it("frames a chart in a named section with its toolbar and source", () => {
    render(Bi);
    const card = screen.getByRole("region", { name: "Role share" });
    expect(within(card).getByRole("heading", { level: 3, name: "Role share" })).toBeTruthy();
    expect(within(card).getByRole("button", { name: "Patch" })).toBeTruthy();
    expect(card.textContent).toContain("Ranked only");
    expect(card.textContent).toContain("Source:");
    expect(within(card).getByRole("link", { name: "Match API" }).getAttribute("href")).toBe("/source");
  });

  it("passes each item's span to the grid", () => {
    render(Bi);
    expect(screen.getByTestId("kpi").dataset.taSpan).toBe("2");
    expect(screen.getByTestId("card").dataset.taSpan).toBe("full");
    expect(screen.getByTestId("item").dataset.taSpan).toBe("2");
    expect(screen.getByTestId("kpi-bad").hasAttribute("data-ta-span")).toBe(false);
  });

  it("shows the final figure where nothing can animate", () => {
    render(Bi);
    const figureText = screen.getByTestId("item").querySelector(".ta-bignumber-figure")!;
    expect(figureText.textContent?.replace(/\s+/g, "")).toBe("1.2Mmatches");
    expect(figureText.querySelector("[aria-hidden]")).toBeNull();
  });
});

describe("empty data and texts", () => {
  it("shows a labelled empty state instead of an empty drawing", () => {
    render(Bi, { empty: true });
    expect(screen.getAllByText("No data")).toHaveLength(8);
    expect(screen.queryByRole("slider", { name: "Role share by patch" })).toBeNull();
    expect(screen.queryByRole("slider", { name: "Pick rate against win rate" })).toBeNull();
    expect(screen.queryByRole("list", { name: "New players" })).toBeNull();
  });

  it("takes its own texts from the labels", async () => {
    render(Bi, { empty: true, labels: es });
    expect(screen.getAllByText("Sin datos")).toHaveLength(8);
    expect(screen.getByText("7 de 10")).toBeTruthy();
    expect(screen.getByTestId("card").textContent).toContain("Fuente:");
    expect(screen.getByTestId("kpi").textContent).toContain("Objetivo 55");
    expect(screen.getByTestId("kpi").textContent).toContain("sube");
    expect(screen.getByRole("img", { name: "Pick rate: de 12 a 18, mínimo 9, máximo 18" })).toBeTruthy();
  });
});

describe("chart helpers", () => {
  it("rounds a domain that does not start at zero", () => {
    expect(niceDomain(45, 55)).toEqual({ min: 45, max: 55, ticks: [45, 47.5, 50, 52.5, 55] });
    expect(niceDomain(47, 54).min).toBeLessThanOrEqual(47);
    expect(niceDomain(3, 3).max).toBeGreaterThan(3);
  });

  it("draws a full circle as one closed arc and a pie wedge from the centre", () => {
    expect(arcPath(100, 100, 96, 60, 0, Math.PI * 2)).toMatch(/^M100\.00,4\.00A96,96 0 1 1 /);
    expect(arcPath(100, 100, 96, 0, 0, Math.PI / 2)).toMatch(/^M100,100L/);
  });
});

describe("accessibility", () => {
  it("has no axe violations, with data and without", async () => {
    const full = render(Bi);
    expect(await axeViolations(full.container)).toEqual([]);
    full.unmount();
    const empty = render(Bi, { empty: true });
    expect(await axeViolations(empty.container)).toEqual([]);
  });
});
