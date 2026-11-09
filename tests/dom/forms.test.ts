import { fireEvent, render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import { axeViolations } from "../axe";
import Forms from "../fixtures/Forms.svelte";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const formData = () => new FormData(screen.getByTestId("form") as HTMLFormElement);
const table = (name: string) => screen.getByRole("table", { name });
const names = (t: HTMLElement) =>
  within(t)
    .getAllByRole("row")
    .slice(1)
    .map((r) => r.querySelectorAll("td")[1]?.textContent?.trim());

describe("controls inside a native <form> (SvelteKit form actions)", () => {
  it("every control sends its value, the way the server action will read it", () => {
    render(Forms);
    const f = formData();
    expect(f.get("notifications")).toBe("on");
    expect(f.get("country")).toBe("pe");
    expect(f.getAll("tags")).toEqual(["bug"]);
    expect(f.get("stats[hp]")).toBe("100");
    expect(f.get("date")).toBe("2026-11-03");
  });

  it("a switched-off Switch sends nothing, like an unchecked checkbox", async () => {
    render(Forms);
    await userEvent.click(screen.getByRole("switch", { name: "Notifications" }));
    expect(formData().has("notifications")).toBe(false);
  });
});

describe("Combobox", () => {
  it("multiple: Enter adds a chip, choosing it again removes it, Backspace removes the last", async () => {
    render(Forms);
    const field = screen.getByRole("combobox", { name: "Tags" });
    await userEvent.type(field, "ux{Enter}");
    expect(formData().getAll("tags")).toEqual(["bug", "ux"]);
    expect(screen.getByRole("listbox", { name: "Tags" }).getAttribute("aria-multiselectable")).toBe("true");
    await userEvent.click(screen.getByRole("option", { name: "UX" }));
    expect(formData().getAll("tags")).toEqual(["bug"]);
    await userEvent.keyboard("{Escape}");
    field.focus();
    await userEvent.keyboard("{Backspace}");
    expect(formData().getAll("tags")).toEqual([]);
  });

  it("a chip has a named remove button", async () => {
    render(Forms);
    await userEvent.click(screen.getByRole("button", { name: "Remove Bug" }));
    expect(formData().getAll("tags")).toEqual([]);
  });

  it("remote: asks the API for what is typed and drops the answer of an older search", async () => {
    const calls: string[] = [];
    const loadOptions = vi.fn((q: string, signal: AbortSignal) => {
      calls.push(q);
      return new Promise<{ value: string; label: string }[]>((res) => {
        const delay = q === "a" ? 60 : 5;
        setTimeout(() => !signal.aborted && res([{ value: `v-${q}`, label: `Result ${q}` }]), delay);
      });
    });
    render(Forms, { loadOptions });
    const field = screen.getByRole("combobox", { name: "Remote" });
    await userEvent.type(field, "a");
    await userEvent.type(field, "b");
    await wait(120);
    expect(calls).toContain("ab");
    const options = screen.getAllByRole("option").map((o) => o.textContent?.trim());
    expect(options).toEqual(["Result ab"]);
  });
});

describe("DatePicker and Calendar", () => {
  it("a typed date is taken on blur; a date that does not exist is marked and ignored", async () => {
    render(Forms);
    const field = screen.getByRole("textbox", { name: "Date" });
    await userEvent.clear(field);
    await userEvent.type(field, "2026-12-24");
    field.blur();
    await tick();
    expect(screen.getByTestId("date").textContent).toBe("2026-12-24");
    await userEvent.clear(field);
    await userEvent.type(field, "2026-02-31");
    field.blur();
    await tick();
    expect(field.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByTestId("date").textContent).toBe("2026-12-24");
  });

  it("the button opens a calendar on the chosen day; picking a day closes it and focus goes back", async () => {
    render(Forms);
    const button = screen.getByRole("button", { name: "Choose date" });
    await userEvent.click(button);
    await wait(10);
    const panel = screen.getByRole("dialog", { name: "Choose date" });
    expect((document.activeElement as HTMLElement).dataset.day).toBe("2026-11-03");
    await userEvent.keyboard("{ArrowRight}{ArrowDown}");
    expect((document.activeElement as HTMLElement).dataset.day).toBe("2026-11-11");
    await userEvent.keyboard("{Enter}");
    expect(screen.getByTestId("date").textContent).toBe("2026-11-11");
    expect(panel.isConnected).toBe(false);
    expect(document.activeElement).toBe(button);
  });

  it("Calendar: arrows, PageDown to next month, min disables, Enter picks", async () => {
    render(Forms);
    const grid = screen.getAllByRole("grid")[0];
    const day = (iso: string) => grid.querySelector<HTMLButtonElement>(`[data-day="${iso}"]`)!;
    expect(day("2026-11-01").getAttribute("aria-disabled")).toBe("true");
    // With no value it starts on today; picking a known date moves it there.
    await fireEvent.click(day("2026-11-05"));
    expect(screen.getByTestId("day").textContent).toBe("2026-11-05");
    day("2026-11-05").focus();
    await userEvent.keyboard("{PageDown}");
    expect((document.activeElement as HTMLElement).dataset.day).toBe("2026-12-05");
    await userEvent.keyboard("{Home}");
    expect((document.activeElement as HTMLElement).dataset.day).toBe("2026-11-30");
    await userEvent.keyboard("{Enter}");
    expect(screen.getByTestId("day").textContent).toBe("2026-11-30");
  });
});

describe("FileUpload", () => {
  it("takes allowed files, says why the others are left out, and the native input carries them", async () => {
    render(Forms);
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    const ok = new File(["x"], "photo.png", { type: "image/png" });
    const pdf = new File(["x"], "doc.pdf", { type: "application/pdf" });
    const large = new File([new Uint8Array(2000)], "large.png", { type: "image/png" });
    const wrongType = new File(["x"], "note.txt", { type: "text/plain" });
    Object.defineProperty(input, "files", { value: [ok, large, wrongType, pdf], configurable: true });
    await fireEvent.change(input);
    expect(screen.getByTestId("files").textContent).toBe("photo.png,doc.pdf");
    const warnings = screen.getByRole("alert").textContent!;
    expect(warnings).toContain("large.png");
    expect(warnings).toContain("note.txt");
    await userEvent.click(screen.getByRole("button", { name: "Remove photo.png" }));
    expect(screen.getByTestId("files").textContent).toBe("doc.pdf");
  });

  it("the drop zone takes dropped files", async () => {
    render(Forms);
    const zone = document.querySelector(".ta-upload-zone")!;
    const f = new File(["x"], "dropped.pdf", { type: "application/pdf" });
    await fireEvent.drop(zone, { dataTransfer: { files: [f] } });
    expect(screen.getByTestId("files").textContent).toBe("dropped.pdf");
  });
});

describe("Pagination", () => {
  it("marks the current page, hides the middle behind …, and moves with Next", async () => {
    render(Forms);
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(within(nav).getByRole("button", { name: "Page 1" }).getAttribute("aria-current")).toBe("page");
    expect(within(nav).getByRole("button", { name: /Previous/ }).hasAttribute("disabled")).toBe(true);
    expect(nav.textContent).toContain("…");
    await userEvent.click(within(nav).getByRole("button", { name: /Next/ }));
    expect(screen.getByTestId("page").textContent).toBe("2");
  });
});

describe("DataTable", () => {
  it("sorts by a column (aria-sort), cycles back to no order, and pages", async () => {
    render(Forms);
    const t = table("People");
    expect(names(t)).toEqual(["Eva", "Ana", "Luis"]);
    const button = within(t).getByRole("button", { name: /Points/ });
    await userEvent.click(button);
    expect(button.closest("th")!.getAttribute("aria-sort")).toBe("ascending");
    expect(names(t)).toEqual(["Dani", "Ana", "Bea"]);
    await userEvent.click(button);
    expect(button.closest("th")!.getAttribute("aria-sort")).toBe("descending");
    expect(names(t)).toEqual(["Zoe", "Eva", "Ciro"]);
    await userEvent.click(button);
    expect(button.closest("th")!.getAttribute("aria-sort")).toBe("none");
    await userEvent.click(within(screen.getByRole("navigation", { name: "Pagination: People" })).getByRole("button", { name: /Next/ }));
    expect(names(t)).toEqual(["Zoe", "Bea", "Ciro"]);
  });

  it("select all works on the visible page, with a partial state", async () => {
    render(Forms);
    const t = table("People");
    await userEvent.click(within(t).getByRole("checkbox", { name: "Select row: Ana" }));
    const all = within(t).getByRole("checkbox", { name: "Select all" }) as HTMLInputElement;
    expect(all.indeterminate).toBe(true);
    await userEvent.click(all);
    expect(screen.getByTestId("selection").textContent).toBe("r2,r1,r3");
    await userEvent.click(all);
    expect(screen.getByTestId("selection").textContent).toBe("");
  });

  it("manual: only tells, the rows stay as the API gave them", async () => {
    const onSortChange = vi.fn();
    render(Forms, { manual: true, onSortChange });
    const t = table("People");
    await userEvent.click(within(t).getByRole("button", { name: /Name/ }));
    expect(onSortChange).toHaveBeenCalledWith({ key: "name", direction: "asc" });
    expect(names(t)?.[0]).toBe("Eva");
  });

  it("an empty table keeps a visible row that says so", () => {
    render(Forms);
    expect(table("Empty").textContent).toContain("No results");
  });
});

describe("axe on the 0.6 components", () => {
  it("finds no violations", async () => {
    const { container } = render(Forms);
    await tick();
    expect(await axeViolations(container)).toEqual([]);
  });
});
