import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { createRawSnippet } from "svelte";

import Button from "$lib/components/button.svelte";
import Tabs from "$lib/components/tabs.svelte";

const texto = (t: string) => createRawSnippet(() => ({ render: () => `<span>${t}</span>` }));

describe("Button", () => {
  it("a disabled link has no href, keeps the link role and ignores clicks", async () => {
    const onclick = vi.fn();
    render(Button, { href: "/x", disabled: true, onclick, children: texto("Ir") });
    const enlace = screen.getByRole("link", { name: "Ir" });
    expect(enlace.hasAttribute("href")).toBe(false);
    expect(enlace.getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(enlace);
    expect(onclick).not.toHaveBeenCalled();
  });

  it("an enabled link navigates and calls onclick", async () => {
    const onclick = vi.fn((e: MouseEvent) => e.preventDefault());
    render(Button, { href: "/x", onclick, children: texto("Ir") });
    const enlace = screen.getByRole("link", { name: "Ir" });
    expect(enlace.getAttribute("href")).toBe("/x");
    await userEvent.click(enlace);
    expect(onclick).toHaveBeenCalledOnce();
  });

  it("a loading button is disabled and busy", () => {
    render(Button, { loading: true, children: texto("Guardar") });
    const b = screen.getByRole("button", { name: "Guardar" }) as HTMLButtonElement;
    expect(b.disabled).toBe(true);
    expect(b.getAttribute("aria-busy")).toBe("true");
  });
});

describe("Tabs", () => {
  const items = [
    { id: "a", label: "Uno" },
    { id: "b", label: "Dos" },
    { id: "c", label: "Tres" },
  ];

  it("moves with the arrow keys, Home and End, and wraps", async () => {
    render(Tabs, { items, ariaLabel: "Secciones" });
    const [uno, , tres] = screen.getAllByRole("tab");
    uno.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(tres);
    expect(tres.getAttribute("aria-selected")).toBe("true");
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(uno);
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(tres);
  });

  it("only the active tab is in the Tab order, and it labels the panel", () => {
    render(Tabs, { items, value: "b", ariaLabel: "Secciones" });
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
