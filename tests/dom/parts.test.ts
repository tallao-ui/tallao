import { fireEvent, render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import { axeViolations } from "../axe";
import Parts from "../fixtures/Parts.svelte";

const state = () => JSON.parse(screen.getByTestId("state").textContent!);
const view = () => screen.getByTestId("month");
const cell = (iso: string) => view().querySelector<HTMLElement>(`td[data-date="${iso}"]`);

describe("Table density and sticky first column", () => {
  it("marks the table compact and sticky, and passes attributes to the table and its cells", () => {
    render(Parts);
    const table = screen.getByRole("table", { name: "Type chart" });
    expect(table.classList.contains("ta-table--compact")).toBe(true);
    expect(table.classList.contains("ta-table--sticky-column")).toBe(true);
    expect(table.dataset.testid).toBe("matrix");

    const water = screen.getByRole("columnheader", { name: "Water" });
    expect(water.getAttribute("title")).toBe("Defender: Water");
    expect(water.getAttribute("style")).toContain("text-align: center");

    const row = screen.getByRole("rowheader", { name: "Grass" });
    expect(row.getAttribute("scope")).toBe("row");
    const square = within(row.closest("tr")!).getAllByRole("cell")[0];
    expect(square.getAttribute("title")).toBe("Grass → Fire");
    expect(square.getAttribute("aria-describedby")).toBe("legend");
  });

  it("leaves a table without the options as it was", () => {
    render(Parts);
    const normal = screen.getByText("Normal").closest("table")!;
    expect(normal.className).not.toMatch(/compact|sticky-column/);
  });

  it("keeps the row headers usable as buttons", async () => {
    render(Parts);
    await userEvent.click(screen.getByRole("button", { name: "Water" }));
    expect(state().chosen).toBe(1);
    expect(screen.getByRole("button", { name: "Water" }).getAttribute("aria-pressed")).toBe("true");
  });
});

describe("Badge tones", () => {
  it("adds the accent-2 tint, the solid tone and passes attributes through", () => {
    render(Parts);
    expect(screen.getByText("New").classList.contains("ta-badge--accent-2")).toBe(true);
    const live = screen.getByTestId("live");
    expect(live.classList.contains("ta-badge--solid")).toBe(true);
    expect(live.classList.contains("ta-badge--error")).toBe(true);
    expect(live.getAttribute("title")).toBe("Broadcast in progress");
  });
});

describe("Spinner", () => {
  it("is a status region named for screen readers, 'Loading' by default", () => {
    render(Parts);
    const statuses = screen.getAllByRole("status");
    expect(statuses.map((e) => e.textContent!.trim())).toEqual(["Loading", "Loading the month", "Loading at a custom size"]);
    expect(statuses[1].classList.contains("ta-spinner--lg")).toBe(true);
    expect(statuses[2].style.getPropertyValue("--ta-spinner-size")).toBe("40px");
    expect(statuses[0].querySelector(".ta-spinner-ring")!.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("Button danger-ghost", () => {
  it("is a quiet destructive button", () => {
    render(Parts);
    expect(screen.getByRole("button", { name: "Delete" }).classList.contains("ta-btn--danger-ghost")).toBe(true);
  });
});

describe("MonthView", () => {
  it("draws the month with the day snippet in each cell, and says each date in full", () => {
    render(Parts);
    expect(screen.getByRole("heading", { level: 3 }).textContent).toBe("Noviembre de 2026");
    const table = within(view()).getByRole("table");
    expect(table.getAttribute("aria-labelledby")).toBe(screen.getByRole("heading", { level: 3 }).id);
    // Starts on Monday: 26 October opens the grid and comes with `outside`.
    const first = view().querySelector<HTMLElement>(".info")!;
    expect(first.dataset.iso).toBe("2026-10-26");
    expect(first.dataset.outside).toBe("true");
    const fourteenth = cell("2026-11-14")!;
    expect(within(fourteenth).getAllByRole("button").map((b) => b.textContent)).toEqual(["Regional tournament", "Livestream"]);
    expect(fourteenth.textContent).toContain("sábado, 14 de noviembre de 2026");
    expect(within(table).getAllByRole("columnheader")[0].getAttribute("abbr")).toBe("lunes");
  });

  it("lets the content of a day be used: its buttons are in the tab order", async () => {
    render(Parts);
    await userEvent.click(screen.getByRole("button", { name: "Livestream" }));
    expect(state().event).toBe("Livestream");
  });

  it("changes month with the buttons, named by the kit labels", async () => {
    render(Parts);
    await userEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByRole("heading", { level: 3 }).textContent).toBe("Diciembre de 2026");
    expect(within(cell("2026-12-02")!).getByRole("button", { name: "Patch" })).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Previous month" }));
    await userEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(state().currentMonth).toBe("2026-10-01");
    expect(state().changes).toEqual(["2026-12-01", "2026-11-01", "2026-10-01"]);
  });

  it("pages months with PageUp / PageDown (Shift: a year) and keeps the focus in the view", async () => {
    render(Parts);
    const tournament = screen.getByRole("button", { name: "Regional tournament" });
    tournament.focus();
    await fireEvent.keyDown(tournament, { key: "PageDown" });
    await tick();
    expect(state().currentMonth).toBe("2026-12-01");
    // The event went away with November: focus moves to the next-month button.
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Next month" }));
    await fireEvent.keyDown(document.activeElement!, { key: "PageUp", shiftKey: true });
    await tick();
    expect(state().currentMonth).toBe("2025-12-01");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Next month" }));
  });

  it("can leave the days of the neighbouring months empty", () => {
    render(Parts, { showOutsideDays: false });
    expect(cell("2026-10-26")).toBeNull();
    expect(view().querySelectorAll(".ta-monthview-empty").length).toBe(12);
    expect(view().querySelector<HTMLElement>(".info")!.dataset.iso).toBe("2026-11-01");
  });

  it("marks today with aria-current and tells the snippet", () => {
    const f = new Date();
    const today = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;
    render(Parts, { month: today });
    const c = cell(today)!;
    expect(c.getAttribute("aria-current")).toBe("date");
    expect(c.querySelector<HTMLElement>(".info")!.dataset.today).toBe("true");
    expect(view().querySelectorAll('[aria-current="date"]').length).toBe(1);
  });
});

describe("accessibility of the new parts", () => {
  it("has no axe violations", async () => {
    const { container } = render(Parts);
    expect(await axeViolations(container)).toEqual([]);
  });
});
