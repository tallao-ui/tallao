import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import { axeViolations } from "../axe";
import NewInputs from "../fixtures/NewInputs.svelte";

const codeInput = () => screen.getByRole("textbox", { name: "One-time code" }) as HTMLInputElement;
const positionOf = (input: HTMLElement) => document.getElementById(input.getAttribute("aria-describedby")!)!.textContent;
const slots = (input: HTMLElement) =>
  [...input.parentElement!.querySelectorAll(".ta-otp-slot")].map((s) => s.textContent?.trim());

const table = (name: string) => screen.getByRole("table", { name });
const names = (t: HTMLElement) => [...t.querySelectorAll("tbody tr td:first-child")].map((td) => td.textContent?.trim());

describe("InputOTP", () => {
  it("is one named field in a named group, set up for SMS autofill", () => {
    render(NewInputs);
    const input = codeInput();
    expect(screen.getByRole("group", { name: "One-time code" })).toBeTruthy();
    expect(input.getAttribute("autocomplete")).toBe("one-time-code");
    expect(input.getAttribute("inputmode")).toBe("numeric");
    expect(input.getAttribute("maxlength")).toBe("6");
    expect(positionOf(input)).toBe("Digit 1 of 6");
    // The slots are a picture of the input, hidden from screen readers.
    expect(input.parentElement!.querySelector(".ta-otp-slots")!.getAttribute("aria-hidden")).toBe("true");
    // groupSize={3}: one separator in the middle.
    expect(input.parentElement!.querySelectorAll(".ta-otp-separator")).toHaveLength(1);
  });

  it("fills a slot per key, ignores other characters and typing past the end, and completes once", async () => {
    const oncomplete = vi.fn();
    render(NewInputs, { oncomplete });
    const input = codeInput();
    await userEvent.click(input);
    await userEvent.keyboard("12a3");
    expect(input.value).toBe("123");
    expect(positionOf(input)).toBe("Digit 4 of 6");
    await userEvent.keyboard("4567");
    expect(input.value).toBe("123456");
    expect(slots(input)).toEqual(["1", "2", "3", "4", "5", "6"]);
    expect(oncomplete).toHaveBeenCalledTimes(1);
    expect(oncomplete).toHaveBeenCalledWith("123456");
    expect(screen.getByTestId("code").textContent).toBe("123456");
    expect(new FormData(screen.getByTestId("form") as HTMLFormElement).get("code")).toBe("123456");
  });

  it("a pasted code fills every slot, without its separators", async () => {
    const oncomplete = vi.fn();
    render(NewInputs, { oncomplete });
    const input = codeInput();
    await userEvent.click(input);
    await userEvent.paste("123-456");
    expect(input.value).toBe("123456");
    expect(oncomplete).toHaveBeenCalledWith("123456");
  });

  it("Backspace deletes back, and the arrows, Home and End move between slots", async () => {
    render(NewInputs);
    const input = codeInput();
    await userEvent.click(input);
    await userEvent.keyboard("1234");
    await userEvent.keyboard("{Backspace}");
    expect(input.value).toBe("123");
    expect(positionOf(input)).toBe("Digit 4 of 6");
    await userEvent.keyboard("{Home}");
    expect(positionOf(input)).toBe("Digit 1 of 6");
    await userEvent.keyboard("{ArrowRight}");
    expect(positionOf(input)).toBe("Digit 2 of 6");
    // Typing over a filled slot replaces it.
    await userEvent.keyboard("9");
    expect(input.value).toBe("193");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(positionOf(input)).toBe("Digit 1 of 6");
    await userEvent.keyboard("{End}");
    expect(positionOf(input)).toBe("Digit 4 of 6");
  });

  it("alphanumeric takes letters, uses a text keyboard and shows the invalid state", async () => {
    render(NewInputs);
    const input = screen.getByRole("textbox", { name: "Backup code" }) as HTMLInputElement;
    expect(input.getAttribute("inputmode")).toBe("text");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(positionOf(input)).toBe("Digit 1 of 4");
    await userEvent.click(input);
    await userEvent.keyboard("ab-9Z7");
    expect(input.value).toBe("ab9Z");
  });
});

describe("DataTable filter row", () => {
  it("filters text ignoring case and accents, says when nothing matches and clears", async () => {
    render(NewInputs);
    const t = table("Players");
    await userEvent.type(within(t).getByRole("searchbox", { name: "Filter Name" }), "ange");
    expect(names(t)).toEqual(["Ángel", "Angela"]);
    expect(screen.getByTestId("filters").textContent).toBe('{"name":"ange"}');
    await userEvent.type(within(t).getByRole("searchbox", { name: "Filter Name" }), "zzz");
    expect(t.textContent).toContain("No rows match the filters");
    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByTestId("filters").textContent).toBe("{}");
    expect(names(t)).toEqual(["Ángel", "Bea"]);
    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
  });

  it("a select filter takes its options from the column, and filters combine with AND", async () => {
    render(NewInputs);
    const t = table("Players");
    const team = within(t).getByRole("combobox", { name: "Filter Team" }) as HTMLSelectElement;
    expect([...team.options].map((o) => o.textContent)).toEqual(["All", "Blue", "Green", "Red"]);
    await userEvent.selectOptions(team, "Red");
    expect(names(t)).toEqual(["Ángel", "Ciro"]);
    await userEvent.type(within(t).getByRole("spinbutton", { name: "Filter Points: Minimum" }), "30");
    expect(names(t)).toEqual(["Ángel"]);
    expect(JSON.parse(screen.getByTestId("filters").textContent!)).toEqual({ team: "Red", points: { min: 30 } });
  });

  it("a range keeps the sorting and a filter change goes back to page 1", async () => {
    const onPageChange = vi.fn();
    render(NewInputs, { onPageChange });
    const t = table("Players");
    await userEvent.click(within(screen.getByRole("navigation", { name: "Pagination: Players" })).getByRole("button", { name: /Next/ }));
    expect(screen.getByTestId("table-page").textContent).toBe("2");
    onPageChange.mockClear();
    await userEvent.type(within(t).getByRole("spinbutton", { name: "Filter Points: Maximum" }), "20");
    expect(screen.getByTestId("table-page").textContent).toBe("1");
    expect(onPageChange).toHaveBeenCalledWith(1);
    await userEvent.click(within(t).getByRole("button", { name: /Points/ }));
    expect(names(t)).toEqual(["Dani", "Bea"]);
  });

  it("starts from filters set by the page (as from a URL)", () => {
    render(NewInputs, { initialFilters: { team: "Blue" } });
    expect(names(table("Players"))).toEqual(["Bea", "Eva"]);
    expect((within(table("Players")).getByRole("combobox", { name: "Filter Team" }) as HTMLSelectElement).value).toBe("Blue");
  });

  it("manual: hands the filter state over and leaves the rows as they are", async () => {
    const onFiltersChange = vi.fn();
    render(NewInputs, { manual: true, onFiltersChange });
    const t = table("Players");
    await userEvent.selectOptions(within(t).getByRole("combobox", { name: "Filter Team" }), "Green");
    expect(onFiltersChange).toHaveBeenLastCalledWith({ team: "Green" });
    expect(names(t)).toEqual(["Ángel", "Bea", "Ciro", "Dani", "Eva", "Angela"]);
  });

  it("a snippet filter renders its own control and matches with filterFn", async () => {
    render(NewInputs);
    const t = table("Custom");
    await userEvent.click(within(t).getByRole("checkbox", { name: "Filter Points" }));
    expect(names(t)).toEqual(["Ángel", "Eva"]);
  });
});

describe("axe on InputOTP and the filter row", () => {
  it("finds no violations", async () => {
    const { container } = render(NewInputs);
    await tick();
    expect(await axeViolations(container)).toEqual([]);
  });
});
