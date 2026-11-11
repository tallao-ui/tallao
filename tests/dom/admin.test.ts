import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import { diffKind, filtersFromQuery, filtersToQuery, type FilterDef } from "$lib/components";
import { es } from "$lib/i18n";

import { axeViolations } from "../axe";
import Admin from "../fixtures/Admin.svelte";
import Texts from "../fixtures/AdminTexts.svelte";

const queryOf = () => JSON.parse(screen.getByTestId("query").textContent!);

describe("PageHeader", () => {
  it("has the title as a heading, the trail above it and the actions in order", () => {
    render(Admin);
    const header = screen.getByTestId("header");
    expect(header.tagName).toBe("DIV");
    expect(within(header).getByRole("heading", { level: 1, name: "Posts" })).toBeTruthy();
    expect(within(header).getByRole("navigation", { name: "Breadcrumb" })).toBeTruthy();
    expect(header.textContent).toContain("Updated 2 hours ago by Ana");
    expect(header.textContent).toContain("Everything published on the site.");
    const buttons = within(header.querySelector(".ta-page-header-actions") as HTMLElement).getAllByRole("button");
    expect(buttons.map((b) => b.textContent?.trim())).toEqual(["Export", "New post"]);
    expect(within(header).getByRole("tablist", { name: "Post sections" })).toBeTruthy();
    // The trail comes before the title in the DOM, the tabs after everything.
    expect(header.firstElementChild!.className).toMatch(/trail/);
    expect(header.lastElementChild!.className).toMatch(/tabs/);
  });

  it("takes a heading level and drops the rule", () => {
    render(Admin);
    const plain = screen.getByTestId("plain-header");
    expect(within(plain).getByRole("heading", { level: 2, name: "Plain" })).toBeTruthy();
    expect(plain.className).not.toMatch(/divider/);
    expect(plain.querySelector(".ta-page-header-actions")).toBeNull();
  });
});

describe("FilterBar", () => {
  it("is a named search landmark with a chip per visible filter and a menu for the hidden ones", () => {
    render(Admin);
    const bar = screen.getByRole("search", { name: "Filters" });
    expect(within(bar).getByRole("searchbox", { name: "Search…" })).toBeTruthy();
    expect(within(bar).getByRole("button", { name: "Status" })).toBeTruthy();
    expect(within(bar).getByRole("button", { name: "Featured" })).toBeTruthy();
    expect(within(bar).queryByRole("button", { name: "Since" })).toBeNull();
    expect(within(bar).getByRole("button", { name: "Add filter" }).getAttribute("aria-haspopup")).toBe("menu");
    expect(within(bar).getByRole("status").textContent).toBe("No filters active");
    expect(within(bar).queryByRole("button", { name: "Clear all" })).toBeNull();
  });

  it("a select chip is a menu of radio items; choosing one emits plain JSON and shows the value", async () => {
    const onchange = vi.fn();
    render(Admin, { onchange });
    const bar = screen.getByRole("search", { name: "Filters" });
    const chip = within(bar).getByRole("button", { name: "Status" });
    chip.focus();
    await userEvent.keyboard("{Enter}");
    const menu = screen.getByRole("menu", { name: "Status" });
    const items = within(menu).getAllByRole("menuitemradio");
    expect(items.map((i) => i.textContent?.trim())).toEqual(["All", "Draft", "Published"]);
    expect(items[0].getAttribute("aria-checked")).toBe("true");
    expect(document.activeElement).toBe(items[0]);
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onchange).toHaveBeenLastCalledWith({ status: "pub" });
    expect(queryOf()).toEqual({ status: "pub" });
    expect(within(bar).getByRole("button", { name: "Status: Published" })).toBeTruthy();
    expect(within(bar).getByRole("status").textContent).toBe("1 filter active");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("a boolean chip stores true or false, and its remove button clears it and keeps the focus on the chip", async () => {
    render(Admin);
    const bar = screen.getByRole("search", { name: "Filters" });
    await userEvent.click(within(bar).getByRole("button", { name: "Featured" }));
    await userEvent.click(screen.getByRole("menuitemradio", { name: "No" }));
    expect(queryOf()).toEqual({ featured: false });
    await userEvent.click(within(bar).getByRole("button", { name: "Featured: No" }));
    await userEvent.click(screen.getByRole("menuitemradio", { name: "Yes" }));
    expect(queryOf()).toEqual({ featured: true });
    await userEvent.click(within(bar).getByRole("button", { name: "Remove filter: Featured" }));
    await tick();
    expect(queryOf()).toEqual({});
    expect(document.activeElement).toBe(within(bar).getByRole("button", { name: "Featured" }));
  });

  it("the search text goes under q, and Clear all empties everything", async () => {
    const onchange = vi.fn();
    render(Admin, { onchange, query: { status: "Draft" } });
    const bar = screen.getByRole("search", { name: "Filters" });
    expect(within(bar).getByRole("button", { name: "Status: Draft" })).toBeTruthy();
    await userEvent.type(within(bar).getByRole("searchbox"), "tide");
    expect(queryOf()).toEqual({ status: "Draft", q: "tide" });
    await userEvent.click(within(bar).getByRole("button", { name: "Clear all" }));
    expect(onchange).toHaveBeenLastCalledWith({});
    expect(queryOf()).toEqual({});
    expect((within(bar).getByRole("searchbox") as HTMLInputElement).value).toBe("");
  });

  it("Add filter adds a hidden filter's chip and opens its editor; a text filter filters as you type", async () => {
    render(Admin);
    const bar = screen.getByRole("search", { name: "Filters" });
    await userEvent.click(within(bar).getByRole("button", { name: "Add filter" }));
    const menu = screen.getByRole("menu", { name: "Add filter" });
    expect(within(menu).getAllByRole("menuitem").map((i) => i.textContent?.trim())).toEqual(["Since", "Author"]);
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Author" }));
    await tick();
    const field = await screen.findByRole("textbox", { name: "Author" });
    expect(document.activeElement).toBe(field);
    await userEvent.type(field, "ana{Enter}");
    expect(queryOf()).toEqual({ author: "ana" });
    expect(screen.queryByRole("textbox", { name: "Author" })).toBeNull();
    const chip = within(bar).getByRole("button", { name: "Author: ana" });
    expect(document.activeElement).toBe(chip);
    // Removing a filter that came from the menu puts it back there.
    await userEvent.click(within(bar).getByRole("button", { name: "Remove filter: Author" }));
    expect(within(bar).queryByRole("button", { name: /^Author/ })).toBeNull();
  });

  it("a date filter picks an ISO day in a calendar", async () => {
    render(Admin, { query: { since: "2026-11-03" } });
    const bar = screen.getByRole("search", { name: "Filters" });
    await userEvent.click(within(bar).getByRole("button", { name: "Since: 2026-11-03" }));
    const panel = screen.getByRole("dialog", { name: "Since" });
    const day = within(panel)
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === "12")!;
    await userEvent.click(day);
    expect(queryOf()).toEqual({ since: "2026-11-12" });
    expect(screen.queryByRole("dialog", { name: "Since" })).toBeNull();
  });

  it("writes and reads a query string", () => {
    const defs: FilterDef[] = [
      { key: "status", label: "Status", type: "select" },
      { key: "featured", label: "Featured", type: "boolean" },
    ];
    expect(filtersToQuery({ q: "tide pool", status: "Draft", featured: false })).toBe("q=tide+pool&status=Draft&featured=false");
    expect(filtersFromQuery("?q=tide+pool&status=Draft&featured=false&other=1", defs)).toEqual({ q: "tide pool", status: "Draft", featured: false });
    expect(filtersFromQuery("featured=maybe", defs)).toEqual({});
  });
});

describe("FilterChip on its own", () => {
  it("binds its value, null when the text is emptied", async () => {
    render(Admin);
    await userEvent.click(screen.getByRole("button", { name: "Lone" }));
    const field = screen.getByRole("textbox", { name: "Lone" });
    expect(field.getAttribute("placeholder")).toBe("Contains…");
    await userEvent.type(field, "ab");
    expect(screen.getByTestId("chip").textContent).toBe('"ab"');
    await userEvent.clear(field);
    expect(screen.getByTestId("chip").textContent).toBe("null");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("textbox", { name: "Lone" })).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Lone" }));
  });
});

describe("EmptyState", () => {
  it("empty: a heading, the text and the primary action", async () => {
    const onAction = vi.fn();
    render(Admin, { onAction });
    const empty = screen.getByTestId("empty");
    expect(empty.hasAttribute("role")).toBe(false);
    expect(within(empty).getByRole("heading", { level: 3, name: "No posts yet" })).toBeTruthy();
    expect(empty.querySelector(".ta-empty-icon")!.getAttribute("aria-hidden")).toBe("true");
    await userEvent.click(within(empty).getByRole("button", { name: "New post" }));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("no-results is a status with Clear filters; error is an alert with Retry", async () => {
    const onClearFilters = vi.fn();
    const onRetry = vi.fn();
    render(Admin, { onClearFilters, onRetry });
    const status = screen.getByRole("heading", { level: 2, name: "No results for these filters" }).closest(".ta-empty") as HTMLElement;
    expect(status.getAttribute("role")).toBe("status");
    await userEvent.click(within(status).getByRole("button", { name: "Clear filters" }));
    expect(onClearFilters).toHaveBeenCalledOnce();
    const alert = screen.getAllByRole("alert").find((a) => a.textContent?.includes("The API answered 500."))!;
    expect(within(alert).getByRole("heading", { name: "Something went wrong" })).toBeTruthy();
    await userEvent.click(within(alert).getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe("SaveBar", () => {
  it("says the state in a polite live region: saved, unsaved, saving", async () => {
    const onSave = vi.fn();
    render(Admin, { onSave });
    const bar = screen.getByRole("group", { name: "Form actions" });
    const status = within(bar).getByRole("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.textContent).toBe("All changes saved");
    expect(bar.dataset.state).toBe("clean");
    await userEvent.type(screen.getByRole("textbox", { name: "Title" }), "x");
    expect(status.textContent).toBe("Unsaved changes");
    expect(bar.dataset.state).toBe("dirty");
    const save = within(bar).getByRole("button", { name: "Save" });
    await userEvent.click(save);
    expect(onSave).toHaveBeenCalledOnce();
    expect(status.textContent).toBe("Saving…");
    expect(save.getAttribute("aria-busy")).toBe("true");
    expect((save as HTMLButtonElement).disabled).toBe(true);
    expect((within(bar).getByRole("button", { name: "Save and add another" }) as HTMLButtonElement).disabled).toBe(true);
    await userEvent.click(screen.getByRole("button", { name: "Finish saving" }));
    expect(status.textContent).toBe("All changes saved");
  });

  it("the buttons submit the form they point at, in order: Cancel, secondary, Save", async () => {
    const onCancel = vi.fn();
    render(Admin, { onCancel });
    const bar = screen.getByRole("group", { name: "Form actions" });
    const buttons = within(bar).getAllByRole("button") as HTMLButtonElement[];
    expect(buttons.map((b) => b.textContent?.trim())).toEqual(["Cancel", "Save and add another", "Save"]);
    expect(buttons[0].type).toBe("button");
    expect(buttons[1].type).toBe("submit");
    expect(buttons[1].getAttribute("form")).toBe("post-form");
    expect(buttons[1].name).toBe("_next");
    expect(buttons[1].value).toBe("add");
    expect(buttons[2].type).toBe("submit");
    expect(buttons[2].getAttribute("form")).toBe("post-form");
    expect(bar.className).toMatch(/sticky/);
    await userEvent.click(buttons[0]);
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("shows an error, and disableWhenClean locks Save until there is something to save", () => {
    render(Admin);
    const bar = screen.getByTestId("failed-bar");
    expect(bar.dataset.state).toBe("error");
    expect(within(bar).getByRole("status").textContent).toBe("The title is taken");
    expect((within(bar).getByRole("button", { name: "Save" }) as HTMLButtonElement).disabled).toBe(true);
    expect(bar.className).not.toMatch(/sticky/);
    expect(within(bar).queryByRole("button", { name: "Cancel" })).toBeNull();
  });
});

describe("DiffView", () => {
  it("works out the kind of each change", () => {
    expect(diffKind({ field: "a", before: null, after: "x" })).toBe("added");
    expect(diffKind({ field: "a", before: "x", after: "" })).toBe("removed");
    expect(diffKind({ field: "a", before: { a: 1 }, after: { a: 2 } })).toBe("changed");
    expect(diffKind({ field: "a", before: [1], after: [1] })).toBe("unchanged");
    expect(diffKind({ field: "a", before: false, after: true })).toBe("changed");
  });

  it("lists the changes with their kind in words and signs, del and ins, and leaves out what did not change", () => {
    render(Admin);
    const list = screen.getByRole("list", { name: "Changes" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[0].textContent).toContain("Title");
    expect(items[0].querySelector(".ta-diff-kind")!.textContent?.replace(/\s+/g, "")).toBe("~Changed");
    expect(items[0].querySelector("del")!.textContent).toBe("−Hello");
    expect(items[0].querySelector("ins")!.textContent).toBe("+Hello, world");
    expect(items[1].querySelector(".ta-diff-kind")!.textContent).toContain("Added");
    expect(items[1].querySelector("del")).toBeNull();
    expect(items[1].textContent).toContain("empty");
    // An array is printed as indented JSON.
    expect(items[1].querySelector("ins")!.textContent).toContain('[\n  "news",\n  "patch"\n]');
    expect(items[1].querySelector("ins")!.className).toMatch(/mono/);
    expect(items[2].querySelector(".ta-diff-kind")!.textContent).toContain("Removed");
    expect(items[2].querySelector("ins")).toBeNull();
    expect(list.textContent).not.toContain("slug");
  });

  it("folds a long value behind a button with aria-expanded", async () => {
    render(Admin);
    const more = screen.getByRole("button", { name: "Show more: Body" });
    expect(more.getAttribute("aria-expanded")).toBe("false");
    const values = document.getElementById(more.getAttribute("aria-controls")!)!;
    expect(values.className).toMatch(/folded/);
    more.focus();
    await userEvent.keyboard("{Enter}");
    const less = screen.getByRole("button", { name: "Show less: Body" });
    expect(less.getAttribute("aria-expanded")).toBe("true");
    expect(values.className).not.toMatch(/folded/);
  });

  it("compact: one line per change with the kind and the sides as hidden text; none: an empty text", () => {
    render(Admin);
    const list = screen.getByRole("list", { name: "Compact changes" });
    const [status, meta] = within(list).getAllByRole("listitem");
    expect(status.textContent?.replace(/\s+/g, " ").trim()).toBe("~ Status (Changed): Before: Draft → After: Published");
    expect(status.querySelector("del")!.getAttribute("title")).toBe("Draft");
    expect(meta.querySelector("ins")!.textContent).toContain('{"a":1}');
    expect(meta.textContent).toContain("(Added)");
    expect(screen.getByText("No changes")).toBeTruthy();
  });
});

describe("Kbd", () => {
  it("nests a kbd per key; Mod is Ctrl off a Mac", () => {
    render(Admin);
    const kbd = screen.getByTestId("kbd");
    expect(kbd.tagName).toBe("KBD");
    expect([...kbd.querySelectorAll("kbd")].map((k) => k.textContent?.trim())).toEqual(["Ctrl", "K"]);
    expect(kbd.textContent?.replace(/\s+/g, "")).toBe("Ctrl+K");
  });

  it("on a Mac draws the symbols and reads the key names", () => {
    render(Admin, { platform: "mac" });
    const keys = [...screen.getByTestId("kbd").querySelectorAll("kbd")];
    expect(keys[0].querySelector('[aria-hidden="true"]')!.textContent).toBe("⌘");
    expect(keys[0].textContent).toContain("Command");
    const shift = [...screen.getByTestId("kbd-mac").querySelectorAll("kbd")];
    expect(shift[0].querySelector('[aria-hidden="true"]')!.textContent).toBe("⇧");
    expect(shift[1].querySelector('[aria-hidden="true"]')!.textContent).toBe("↵");
  });

  it("platform auto follows the browser after mount", async () => {
    const original = Object.getOwnPropertyDescriptor(Navigator.prototype, "platform");
    Object.defineProperty(navigator, "platform", { value: "MacIntel", configurable: true });
    try {
      render(Admin, { platform: "auto" });
      await tick();
      expect(screen.getByTestId("kbd").querySelector('[aria-hidden="true"]')!.textContent).toBe("⌘");
    } finally {
      delete (navigator as unknown as Record<string, unknown>).platform;
      if (original) Object.defineProperty(Navigator.prototype, "platform", original);
    }
  });
});

describe("DescriptionList", () => {
  it("is a dl of term and value pairs, with a link, a copy button and a dash for what is missing", () => {
    render(Admin);
    const list = document.querySelector('dl[aria-label="About"]') as HTMLElement;
    const terms = [...list.querySelectorAll("dt")].map((t) => t.textContent);
    expect(terms).toEqual(["Created", "Author", "API path", "Deleted"]);
    expect([...list.children].every((c) => c.tagName === "DIV" && c.children[0].tagName === "DT" && c.children[1].tagName === "DD")).toBe(true);
    expect(within(list).getByRole("link", { name: "Ana López" }).getAttribute("href")).toBe("/users/ana");
    expect(within(list).getByRole("button", { name: "Copy: /api/posts/42" })).toBeTruthy();
    expect(list.querySelectorAll("dd")[3].textContent?.trim()).toBe("—");
  });

  it("copies the value and announces it", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(Admin);
    await userEvent.click(screen.getByRole("button", { name: "Copy: /api/posts/42" }));
    expect(writeText).toHaveBeenCalledWith("/api/posts/42");
    expect(await screen.findByText("Copied")).toBeTruthy();
  });

  it("draws a value with the snippet, in columns", () => {
    render(Admin);
    const list = document.querySelector('dl[aria-label="Custom"]') as HTMLElement;
    expect(list.className).toMatch(/cols-2/);
    expect(list.querySelector("dd .ta-badge")!.textContent?.trim()).toBe("live");
  });
});

describe("MenuItem with a checked state", () => {
  it("is a menuitemcheckbox or a menuitemradio with aria-checked, still reached by the arrows", async () => {
    render(Admin);
    const trigger = screen.getByRole("button", { name: "Options" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const menu = screen.getByRole("menu", { name: "Options" });
    const box = within(menu).getByRole("menuitemcheckbox", { name: "Wrap lines" });
    expect(box.getAttribute("aria-checked")).toBe("false");
    expect(within(menu).getByRole("menuitem", { name: "Plain" }).hasAttribute("aria-checked")).toBe(false);
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(box);
    await userEvent.keyboard("{Enter}");
    expect(box.getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("menu", { name: "Options" })).toBeTruthy();
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(within(menu).getByRole("menuitemradio", { name: "Radio" }));
    await userEvent.keyboard("{Enter}");
    expect(screen.getByTestId("menu-action").textContent).toBe("radio");
    expect(screen.queryByRole("menu")).toBeNull();
  });
});

describe("DataTable for an admin list", () => {
  const table = () => screen.getByRole("table", { name: "Posts" });

  it("the first column is a link to the record, and the sortable headers carry aria-sort", async () => {
    render(Admin);
    const link = within(table()).getByRole("link", { name: "Patch 1.2 notes" });
    expect(link.getAttribute("href")).toBe("/posts/p1");
    expect(link.closest("td")).toBe(table().querySelector("tbody tr")!.querySelectorAll("td")[1]);
    expect(within(table()).queryByRole("link", { name: "Published" })).toBeNull();
    const title = within(table()).getByRole("columnheader", { name: /Title/ });
    expect(title.getAttribute("aria-sort")).toBe("none");
    await userEvent.click(within(title).getByRole("button"));
    expect(title.getAttribute("aria-sort")).toBe("ascending");
    expect(within(table()).getByRole("columnheader", { name: "Status" }).hasAttribute("aria-sort")).toBe(false);
  });

  it("the density toggle is a pressed button and binds the density", async () => {
    render(Admin);
    const toggle = screen.getByRole("button", { name: "Compact rows" });
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    toggle.focus();
    await userEvent.keyboard(" ");
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("density").textContent).toBe("compact");
    expect(table().closest(".ta-datatable")!.className).toMatch(/ta-datatable--compact/);
    expect(screen.getByTestId("toolbar-start").textContent).toBe("2 posts");
  });

  it("the column menu hides and shows columns, never the one that is not hideable", async () => {
    render(Admin);
    await userEvent.click(screen.getByRole("button", { name: "Columns" }));
    const menu = screen.getByRole("menu", { name: "Columns" });
    const items = within(menu).getAllByRole("menuitemcheckbox");
    expect(items.map((i) => `${i.textContent?.trim()}:${i.getAttribute("aria-checked")}`)).toEqual(["Title:true", "Status:true", "Views:true"]);
    expect(items[0].getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(items[1]);
    expect(within(table()).queryByRole("columnheader", { name: "Status" })).toBeNull();
    expect(screen.getByTestId("columns").textContent).toBe("title,views");
    expect(items[1].getAttribute("aria-checked")).toBe("false");
    // The menu stays open; the column comes back in its place.
    await userEvent.click(items[1]);
    expect(screen.getByTestId("columns").textContent).toBe("title,status,views");
    expect(within(table()).getAllByRole("columnheader").map((h) => h.textContent?.trim().replace(/\s.*$/, ""))).toEqual(["", "Title", "Status", "Views", "Actions"]);
    await userEvent.click(items[0]);
    expect(within(table()).getByRole("columnheader", { name: /Title/ })).toBeTruthy();
  });

  it("rowActions is a last pinned column with a named menu per row", async () => {
    render(Admin);
    const row = table().querySelectorAll("tbody tr")[1];
    const cell = row.lastElementChild!;
    expect(cell.className).toMatch(/ta-datatable-pin/);
    await userEvent.click(within(cell as HTMLElement).getByRole("button", { name: "Actions: Autumn Open recap" }));
    expect(screen.getByRole("menu", { name: "Actions: Autumn Open recap" })).toBeTruthy();
  });

  it("loading with no rows draws skeleton rows shaped like the columns", () => {
    render(Admin, { tableLoading: true, tableRows: [] });
    const rows = table().querySelectorAll("tbody tr");
    expect(rows).toHaveLength(5);
    // checkbox + three columns + the pinned column
    expect(rows[0].children).toHaveLength(5);
    expect(rows[0].querySelectorAll(".ta-skeleton")).toHaveLength(4);
    expect(table().closest(".ta-datatable")!.getAttribute("aria-busy")).toBe("true");
    expect(table().closest(".ta-datatable")!.querySelector('[aria-live="polite"]')!.textContent).toBe("Loading");
  });

  it("error replaces the rows with an alert and Retry", async () => {
    const onRetry = vi.fn();
    render(Admin, { tableError: "Could not load the posts", onRetry });
    const alert = within(table()).getByRole("alert");
    expect(alert.textContent).toContain("Something went wrong");
    expect(alert.textContent).toContain("Could not load the posts");
    expect(alert.querySelector("h1, h2, h3, h4, h5, h6")).toBeNull();
    expect(alert.closest("td")!.getAttribute("colspan")).toBe("5");
    await userEvent.click(within(alert).getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(within(table()).queryByRole("link")).toBeNull();
  });

  it("an empty table shows an EmptyState, or the empty snippet", () => {
    render(Admin, { tableRows: [] });
    expect(table().querySelector("tbody .ta-empty")!.textContent?.trim()).toBe("No results");
    expect(screen.getByRole("table", { name: "Custom empty" }).textContent).toContain("Nothing in the custom table");
  });
});

describe("SavedViews", () => {
  const openMenu = async () => {
    const bar = screen.getByRole("search", { name: "Filters" });
    await userEvent.click(within(bar).getByRole("button", { name: /^(Views|Drafts|Mine|Team)$/ }));
    return screen.getByRole("menu", { name: "Views" });
  };

  it("lists the views as radio items and applies the one chosen", async () => {
    const onViewEvent = vi.fn();
    render(Admin, { onViewEvent });
    const menu = await openMenu();
    const draft = within(menu).getByRole("menuitemradio", { name: "Drafts" });
    expect(draft.getAttribute("aria-checked")).toBe("false");
    expect(within(menu).queryByRole("menuitem", { name: /Rename/ })).toBeNull();
    await userEvent.click(draft);
    expect(onViewEvent).toHaveBeenCalledWith("select", "Drafts");
    expect(queryOf()).toEqual({ status: "Draft" });
    expect(screen.getByTestId("view").textContent).toBe("Drafts");
    expect(screen.getByRole("button", { name: "Drafts" })).toBeTruthy();
  });

  it("saves the current query under a name typed in a dialog", async () => {
    const onViewEvent = vi.fn();
    render(Admin, { onViewEvent, query: { featured: true } });
    await userEvent.click(within(await openMenu()).getByRole("menuitem", { name: "Save current view…" }));
    const dialog = screen.getByRole("dialog", { name: "Save current view" });
    const field = within(dialog).getByRole("textbox", { name: /View name/ });
    await tick();
    expect(document.activeElement).toBe(field);
    expect((within(dialog).getByRole("button", { name: "Save" }) as HTMLButtonElement).disabled).toBe(true);
    await userEvent.type(field, "  Mine {Enter}");
    expect(onViewEvent).toHaveBeenCalledWith("save", "Mine", { featured: true });
    expect(screen.getByTestId("view").textContent).toBe("Mine");
    expect(screen.queryByRole("dialog", { name: "Save current view" })).toBeNull();
  });

  it("renames and deletes the active view, the delete after a confirmation", async () => {
    const onViewEvent = vi.fn();
    render(Admin, { onViewEvent });
    await userEvent.click(within(await openMenu()).getByRole("menuitemradio", { name: "Drafts" }));
    await userEvent.click(within(await openMenu()).getByRole("menuitem", { name: "Rename “Drafts”…" }));
    const field = within(screen.getByRole("dialog", { name: "Rename “Drafts”" })).getByRole("textbox") as HTMLInputElement;
    expect(field.value).toBe("Drafts");
    await userEvent.clear(field);
    await userEvent.type(field, "Team{Enter}");
    expect(onViewEvent).toHaveBeenCalledWith("rename", "Drafts", "Team");
    expect(screen.getByTestId("view").textContent).toBe("Team");

    await userEvent.click(within(await openMenu()).getByRole("menuitem", { name: "Delete “Team”" }));
    const confirm = screen.getByRole("dialog", { name: "Delete the view “Team”?" });
    expect(onViewEvent).not.toHaveBeenCalledWith("delete", "Team");
    await userEvent.click(within(confirm).getByRole("button", { name: "Delete" }));
    expect(onViewEvent).toHaveBeenCalledWith("delete", "Team");
    expect(screen.getByTestId("view").textContent).toBe("none");
  });
});

describe("AppShell", () => {
  it("lays out the sidebar, the top bar slots and the content", () => {
    render(Admin);
    const shell = document.querySelector(".ta-shell") as HTMLElement;
    expect(shell.className).toMatch(/ta-shell--md/);
    expect(within(shell).getByRole("navigation", { name: "Main navigation" })).toBeTruthy();
    const top = shell.querySelector(".ta-shell-top") as HTMLElement;
    expect(top.tagName).toBe("DIV");
    expect(within(top).getByRole("navigation", { name: "Shell trail" })).toBeTruthy();
    const tools = [...top.querySelectorAll(".ta-shell-tools > *")].map((el) => el.textContent?.replace(/\s+/g, ""));
    expect(tools).toEqual(["SearchCtrl+K", "Ana"]);
    expect(document.getElementById("shell-main")!.textContent).toContain("Shell content");
    expect(shell.querySelector(".ta-shell-skip")).toBeNull();
  });

  it("the menu button opens the sidebar in a modal sheet, and following a link closes it", async () => {
    render(Admin);
    const button = screen.getByRole("button", { name: "Open navigation" });
    expect(button.getAttribute("aria-haspopup")).toBe("dialog");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    button.focus();
    await userEvent.keyboard("{Enter}");
    expect(button.getAttribute("aria-expanded")).toBe("true");
    const sheet = screen.getByRole("dialog", { name: "Navigation" });
    const nav = within(sheet).getByRole("navigation", { name: "Mobile navigation" });
    // In the sheet the sidebar has no collapse button.
    expect(within(nav).queryByRole("button", { name: "Collapse" })).toBeNull();
    expect(within(sheet).getByRole("button", { name: "Close" })).toBeTruthy();
    await userEvent.click(within(nav).getByRole("link", { name: "Users" }));
    expect(screen.queryByRole("dialog", { name: "Navigation" })).toBeNull();
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("with landmarks it is a header, a focusable main and a skip link to it", () => {
    render(Texts, { shell: true });
    const main = screen.getByRole("main");
    expect(main.tabIndex).toBe(-1);
    expect(screen.getByRole("banner")).toBeTruthy();
    const skip = screen.getByRole("link", { name: "Saltar al contenido" });
    expect(skip.getAttribute("href")).toBe(`#${main.id}`);
  });
});

describe("texts", () => {
  it("every new text comes from the labels: Spanish with setLabels(es)", async () => {
    render(Texts);
    expect(screen.getByRole("search", { name: es.filters })).toBeTruthy();
    expect(screen.getByRole("button", { name: es.addFilter })).toBeTruthy();
    expect(screen.getByRole("button", { name: es.clearAll })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Quitar filtro: Estado" })).toBeTruthy();
    expect(screen.getByRole("search").querySelector('[role="status"]')!.textContent).toBe("1 filtro activo");
    expect(screen.getByRole("heading", { name: es.emptyTitle })).toBeTruthy();
    expect(screen.getByRole("heading", { name: es.noResultsTitle })).toBeTruthy();
    expect(screen.getByRole("heading", { name: es.errorTitle })).toBeTruthy();
    expect(screen.getByRole("button", { name: es.retry })).toBeTruthy();
    const bar = screen.getByRole("group", { name: es.formActions });
    expect(within(bar).getByRole("status").textContent).toBe(es.unsavedChanges);
    expect(within(bar).getByRole("button", { name: es.submit })).toBeTruthy();
    const diff = screen.getByRole("list", { name: es.changes });
    expect(diff.textContent).toContain(es.changed);
    expect(diff.textContent).toContain(es.before);
    expect(screen.getByText(es.noChanges)).toBeTruthy();
    expect(screen.getByTestId("kbd").textContent).toContain(es.keyCommand);
    expect(screen.getByRole("button", { name: es.compactRows })).toBeTruthy();
    expect(screen.getByRole("button", { name: es.columns })).toBeTruthy();
    expect(screen.getByRole("button", { name: es.savedViews })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Copiar: /api/x" })).toBeTruthy();
  });
});

describe("axe on the admin building blocks", () => {
  it("finds no violations", async () => {
    const { container } = render(Admin);
    await tick();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("finds none with a filter menu open, a sheet open and filters applied", async () => {
    const { container } = render(Admin, { query: { status: "Draft", since: "2026-11-03" } });
    await userEvent.click(screen.getByRole("button", { name: "Status: Draft" }));
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(await axeViolations(container)).toEqual([]);
  });

  it("finds none in the error and loading tables", async () => {
    const error = render(Admin, { tableError: "Could not load" });
    expect(await axeViolations(error.container)).toEqual([]);
    error.unmount();
    const loading = render(Admin, { tableLoading: true, tableRows: [] });
    expect(await axeViolations(loading.container)).toEqual([]);
  });
});
