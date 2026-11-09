import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import type { CommandItem } from "$lib/components";
import { axeViolations } from "../axe";
import RemoteCommand from "../fixtures/RemoteCommand.svelte";

const GAMES: CommandItem[] = [
  { id: "aniimo", label: "Aniimo", description: "Pawprint · 82/100", href: "#aniimo", group: "Games", badge: "Game" },
  { id: "palworld", label: "Palworld", description: "Pocketpair · No score", href: "#palworld", group: "Games" },
];

/** A search that does not answer until the test releases it. */
function pendingSearch() {
  let release: (r: CommandItem[]) => void = () => {};
  const search = vi.fn((_q: string) => new Promise<CommandItem[]>((r) => (release = r)));
  return { search, release: (r: CommandItem[]) => release(r) };
}

describe("Command with results from the page", () => {
  it("does not filter, shows a named loading status, then link results with their subtitle and badge", async () => {
    const { search, release } = pendingSearch();
    render(RemoteCommand, { search });
    const field = screen.getByRole("combobox", { name: "Search the site" });
    expect(document.activeElement).toBe(field);
    expect(screen.getByText("Type to search")).toBeTruthy();
    expect(field.getAttribute("aria-expanded")).toBe("false");

    await userEvent.type(field, "zz");
    expect(screen.getByTestId("query").textContent).toBe("zz");
    expect(search).toHaveBeenLastCalledWith("zz");
    expect(screen.getAllByRole("status").some((s) => s.textContent?.includes("Loading"))).toBe(true);
    expect(field.getAttribute("aria-busy")).toBe("true");

    release(GAMES);
    // None contains "zz": the palette does not filter what the page brings.
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2));
    const [first] = screen.getAllByRole("option");
    expect(first.tagName).toBe("A");
    expect(first.getAttribute("href")).toBe("#aniimo");
    expect(first.textContent).toContain("Pawprint · 82/100");
    expect(first.textContent).toContain("Game");
    expect(field.getAttribute("aria-expanded")).toBe("true");
    expect(field.getAttribute("aria-activedescendant")).toBe(first.id);
    expect(screen.getByRole("listbox", { name: "Search the site" })).toBeTruthy();
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it("moves with the arrows and Enter follows the link, calls onSelect and closes", async () => {
    const onChoose = vi.fn();
    const onClose = vi.fn();
    render(RemoteCommand, { search: async () => GAMES, onChoose, onClose });
    const field = screen.getByRole("combobox", { name: "Search the site" });
    await userEvent.type(field, "pa");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2));
    await userEvent.keyboard("{ArrowDown}");
    const active = document.getElementById(field.getAttribute("aria-activedescendant")!);
    expect(active?.getAttribute("href")).toBe("#palworld");
    expect(active?.getAttribute("aria-selected")).toBe("true");
    await userEvent.keyboard("{ArrowDown}");
    expect(document.getElementById(field.getAttribute("aria-activedescendant")!)?.getAttribute("href")).toBe("#aniimo");
    await userEvent.keyboard("{ArrowUp}{Enter}");
    expect(location.hash).toBe("#palworld");
    expect(onChoose).toHaveBeenCalledWith("palworld");
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("overlay")).toBeNull();
  });

  it("says there is nothing for the query through the empty snippet, and Escape closes", async () => {
    const onClose = vi.fn();
    render(RemoteCommand, { search: async () => [], onClose });
    const field = screen.getByRole("combobox", { name: "Search the site" });
    await userEvent.type(field, "xyz");
    await waitFor(() => expect(screen.getByText('No results for "xyz"')).toBeTruthy());
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(field.getAttribute("aria-activedescendant")).toBeNull();
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("in the dialog, binds the query, puts it in emptyText and closes when a link is chosen", async () => {
    render(RemoteCommand, { search: async () => [] });
    await userEvent.click(screen.getByRole("button", { name: "Open palette" }));
    const field = screen.getByRole("combobox", { name: "Command palette" });
    expect(document.activeElement).toBe(field);
    expect(screen.queryByText(/Nothing for/)).toBeNull();
    await userEvent.type(field, "hello");
    const op = screen.getByRole("option");
    expect(op.textContent).toContain("Echo: hello");
    expect(op.textContent).toContain("What you typed");
    await userEvent.keyboard("{Enter}");
    expect(location.hash).toBe("#echo");
    expect(screen.getByTestId("modal").textContent).toBe("false");
  });
});
