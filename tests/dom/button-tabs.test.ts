import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { createRawSnippet } from "svelte";

import Button from "$lib/components/button.svelte";
import Tabs from "$lib/components/tabs.svelte";

const text = (t: string) => createRawSnippet(() => ({ render: () => `<span>${t}</span>` }));

describe("Button", () => {
  it("a disabled link has no href, keeps the link role and ignores clicks", async () => {
    const onclick = vi.fn();
    render(Button, { href: "/x", disabled: true, onclick, children: text("Go") });
    const link = screen.getByRole("link", { name: "Go" });
    expect(link.hasAttribute("href")).toBe(false);
    expect(link.getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(link);
    expect(onclick).not.toHaveBeenCalled();
  });

  it("an enabled link navigates and calls onclick", async () => {
    const onclick = vi.fn((e: MouseEvent) => e.preventDefault());
    render(Button, { href: "/x", onclick, children: text("Go") });
    const link = screen.getByRole("link", { name: "Go" });
    expect(link.getAttribute("href")).toBe("/x");
    await userEvent.click(link);
    expect(onclick).toHaveBeenCalledOnce();
  });

  it("a loading button is disabled and busy", () => {
    render(Button, { loading: true, children: text("Save") });
    const b = screen.getByRole("button", { name: "Save" }) as HTMLButtonElement;
    expect(b.disabled).toBe(true);
    expect(b.getAttribute("aria-busy")).toBe("true");
  });
});

describe("Tabs", () => {
  const items = [
    { id: "a", label: "One" },
    { id: "b", label: "Two" },
    { id: "c", label: "Three" },
  ];

  it("moves with the arrow keys, Home and End, and wraps", async () => {
    render(Tabs, { items, ariaLabel: "Sections" });
    const [one, , three] = screen.getAllByRole("tab");
    one.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(three);
    expect(three.getAttribute("aria-selected")).toBe("true");
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(one);
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(three);
  });

  it("only the active tab is in the Tab order, and it labels the panel", () => {
    render(Tabs, { items, value: "b", ariaLabel: "Sections" });
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.tabIndex)).toEqual([-1, 0, -1]);
    expect(screen.getByRole("tabpanel").getAttribute("aria-labelledby")).toBe(tabs[1].id);
  });

  it("two instances do not share ids", () => {
    render(Tabs, { items, ariaLabel: "A" });
    render(Tabs, { items, ariaLabel: "B" });
    const ids = screen.getAllByRole("tab").map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
