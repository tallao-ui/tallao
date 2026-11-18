import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import { DocumentTabs } from "$lib/components";

import { axeViolations } from "../axe";
import DocTabs from "../fixtures/DocTabs.svelte";

const value = () => screen.getByTestId("value").textContent;

describe("DocumentTabs", () => {
  it("is a tablist of tabs, one selected, with roving tabindex and an accessible name", async () => {
    render(DocTabs);
    expect(screen.getByRole("tablist", { name: "Open documents" })).toBeTruthy();
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(4);
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");
    expect(tabs[1].getAttribute("aria-selected")).toBe("false");
    expect(tabs.map((t) => t.getAttribute("tabindex"))).toEqual(["0", "-1", "-1", "-1"]);
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it("selects with a click and reports it", async () => {
    render(DocTabs);
    await userEvent.click(screen.getByRole("tab", { name: /Draft/ }));
    expect(value()).toBe("c");
    expect(screen.getByRole("tab", { name: /Draft/ }).getAttribute("aria-selected")).toBe("true");
  });

  it("arrows, Home and End move focus and select, wrapping around", async () => {
    render(DocTabs);
    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(tabs[1]);
    expect(value()).toBe("b");
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(tabs[3]);
    expect(value()).toBe("d");
    await userEvent.keyboard("{ArrowRight}");
    expect(value()).toBe("a");
    await userEvent.keyboard("{ArrowLeft}");
    expect(value()).toBe("d");
    await userEvent.keyboard("{Home}");
    expect(value()).toBe("a");
  });

  it("mirrors the arrows in right-to-left", async () => {
    document.documentElement.dir = "rtl";
    try {
      render(DocTabs);
      screen.getAllByRole("tab")[0].focus();
      await userEvent.keyboard("{ArrowLeft}");
      expect(value()).toBe("b");
    } finally {
      document.documentElement.removeAttribute("dir");
    }
  });

  it("the close button is a sibling of the tab, out of the tab order, named from the label", () => {
    render(DocTabs);
    const tab = screen.getByRole("tab", { name: /Release notes/ });
    const close = screen.getByRole("button", { name: "Close Release notes" });
    expect(tab.contains(close)).toBe(false);
    expect(close.parentElement).toBe(tab.parentElement);
    expect(close.getAttribute("tabindex")).toBe("-1");
    // A tab that is not closable has no close button.
    expect(screen.queryByRole("button", { name: "Close Pinned" })).toBeNull();
  });

  it("asks the parent to close, which removes the tab, and the selection moves to the neighbour", async () => {
    render(DocTabs);
    await userEvent.click(screen.getByRole("button", { name: "Close Release notes" }));
    expect(screen.getByTestId("closed").textContent).toBe("a");
    expect(screen.queryByRole("tab", { name: /Release notes/ })).toBeNull();
    expect(value()).toBe("b");
  });

  it("Delete closes the focused tab and focus goes to its neighbour; Backspace too", async () => {
    render(DocTabs);
    const draft = screen.getByRole("tab", { name: /Draft/ });
    await userEvent.click(draft);
    expect(document.activeElement).toBe(draft);
    await userEvent.keyboard("{Delete}");
    await tick();
    expect(screen.getByTestId("closed").textContent).toBe("c");
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: /Pinned/ }));
    expect(value()).toBe("d");
    // "Pinned" is not closable: nothing happens.
    await userEvent.keyboard("{Backspace}");
    expect(screen.getByTestId("closed").textContent).toBe("c");
    await userEvent.click(screen.getByRole("tab", { name: /Release notes/ }));
    await userEvent.keyboard("{Backspace}");
    expect(screen.getByTestId("closed").textContent).toBe("c,a");
  });

  it("a middle click closes", async () => {
    render(DocTabs);
    const wrap = screen.getByRole("tab", { name: /Draft/ }).parentElement!;
    await fireEvent(wrap, new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: 1 }));
    expect(screen.getByTestId("closed").textContent).toBe("c");
  });

  it("onadd draws the add button, and a new tab appears", async () => {
    render(DocTabs);
    await userEvent.click(screen.getByRole("button", { name: "New tab" }));
    expect(screen.getByRole("tab", { name: /New 1/ })).toBeTruthy();
  });

  it("has no add button without onadd", () => {
    render(DocumentTabs, { items: [{ id: "a", label: "One" }] });
    expect(screen.queryByRole("button", { name: "New tab" })).toBeNull();
  });

  it("busy and dirty are said in words; a long label has the full name as title", () => {
    render(DocTabs);
    expect(screen.getByRole("tab", { name: /Working/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /Draft.*Unsaved changes/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /long conversation/ }).getAttribute("title")).toContain("(full)");
    expect(screen.getByRole("tab", { name: /Release notes/ }).getAttribute("title")).toBe("Release notes");
  });

  it("closeLabel, addLabel and onclose are overridable", async () => {
    const onclose = vi.fn();
    render(DocumentTabs, {
      items: [
        { id: "a", label: "One" },
        { id: "b", label: "Two" },
      ],
      onclose,
      onadd: () => {},
      addLabel: "Nueva",
      closeLabel: (t: { label: string }) => `Quitar ${t.label}`,
    });
    await userEvent.click(screen.getByRole("button", { name: "Quitar Two" }));
    expect(onclose).toHaveBeenCalledWith("b");
    expect(screen.getByRole("button", { name: "Nueva" })).toBeTruthy();
  });

  it("with panels, the active tab controls a tabpanel it labels", () => {
    render(DocumentTabs, {
      items: [
        { id: "a", label: "One" },
        { id: "b", label: "Two" },
      ],
      value: "b",
      panels: true,
    });
    const panel = screen.getByRole("tabpanel");
    const tab = screen.getByRole("tab", { name: "Two" });
    expect(tab.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.getAttribute("aria-labelledby")).toBe(tab.id);
  });

  it("without panels, controls and tabId name the page's panel", () => {
    render(DocumentTabs, {
      items: [
        { id: "a", label: "One", controls: "p-a", tabId: "t-a" },
        { id: "b", label: "Two" },
      ],
    });
    expect(screen.getByRole("tab", { name: "One" }).id).toBe("t-a");
    expect(screen.getByRole("tab", { name: "One" }).getAttribute("aria-controls")).toBe("p-a");
    expect(screen.getByRole("tab", { name: "Two" }).hasAttribute("aria-controls")).toBe(false);
  });
});
