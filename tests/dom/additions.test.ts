import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import { toast } from "$lib/toast.svelte";
import { axeViolations } from "../axe";
import Additions from "../fixtures/Additions.svelte";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const activeText = () => document.activeElement?.textContent?.trim();

afterEach(() => toast.dismiss());

describe("Switch", () => {
  it("is a named switch that toggles by click, by its label and by keyboard", async () => {
    render(Additions);
    const sw = screen.getByRole("switch", { name: "Notifications" });
    expect(sw.getAttribute("aria-checked")).toBe("false");
    await userEvent.click(sw);
    expect(sw.getAttribute("aria-checked")).toBe("true");
    await userEvent.click(screen.getByText("Notifications"));
    expect(screen.getByTestId("enabled").textContent).toBe("false");
    sw.focus();
    await userEvent.keyboard(" ");
    expect(sw.getAttribute("aria-checked")).toBe("true");
  });
});

describe("RadioGroup", () => {
  it("is a group named by its legend; choosing an option sets the value", async () => {
    render(Additions);
    const group = screen.getByRole("group", { name: "Plan" });
    expect(group.tagName).toBe("FIELDSET");
    expect((screen.getByRole("radio", { name: "Pro" }) as HTMLInputElement).checked).toBe(true);
    await userEvent.click(screen.getByRole("radio", { name: "Free" }));
    expect(screen.getByTestId("plan").textContent).toBe("free");
    expect((screen.getByRole("radio", { name: "Team" }) as HTMLInputElement).disabled).toBe(true);
    expect(screen.getByRole("radio", { name: "Pro" }).getAttribute("aria-describedby")).toBeTruthy();
  });
});

describe("Sheet", () => {
  it("opens as a modal dialog against the right edge", async () => {
    render(Additions);
    await userEvent.click(screen.getByRole("button", { name: "View details" }));
    const d = [...document.querySelectorAll("dialog")].find((x) => x.open)!;
    expect(d.dataset.placement).toBe("right");
    expect(d.textContent).toContain("Content");
    d.dispatchEvent(new Event("cancel", { cancelable: true }));
    await tick();
    expect(d.open).toBe(false);
  });
});

describe("Toast", () => {
  it("shows in a named live region; an error is an alert; the close button dismisses", async () => {
    render(Additions);
    toast.success("Saved", { description: "All good" });
    toast.error("Failed");
    await tick();
    const region = screen.getByRole("region", { name: "Notifications" });
    expect(region.querySelector("[aria-live=polite]")).toBeTruthy();
    expect(screen.getByText("Saved")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toContain("Failed");
    await userEvent.click(screen.getAllByRole("button", { name: "Dismiss" })[0]);
    expect(screen.queryByText("Saved")).toBeNull();
  });

  it("goes away on its own after its duration, and an action runs once", async () => {
    render(Additions);
    const onClick = vi.fn();
    toast("Short", { duration: 30 });
    toast("With an action", { duration: Infinity, action: { label: "Undo", onClick } });
    await tick();
    await wait(80);
    expect(screen.queryByText("Short")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.queryByText("With an action")).toBeNull();
  });
});

describe("Command", () => {
  it("opens with Ctrl+K, filters by keyword without accents, and Enter runs the item", async () => {
    const onAction = vi.fn();
    render(Additions, { onAction });
    await userEvent.keyboard("{Control>}k{/Control}");
    expect(screen.getByTestId("palette").textContent).toBe("true");
    const search = screen.getByRole("combobox", { name: "Command palette" });
    expect(document.activeElement).toBe(search);
    await userEvent.type(search, "DARK");
    expect(screen.getAllByRole("option").map((o) => o.querySelector("span")?.textContent)).toEqual(["Change theme"]);
    await userEvent.keyboard("{Enter}");
    expect(onAction).toHaveBeenCalledWith("theme");
    expect(screen.getByTestId("palette").textContent).toBe("false");
  });

  it("skips disabled items and says when nothing matches", async () => {
    render(Additions);
    await userEvent.keyboard("{Control>}k{/Control}");
    const search = screen.getByRole("combobox", { name: "Command palette" });
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    const active = document.getElementById(search.getAttribute("aria-activedescendant")!);
    expect(active?.querySelector("span")?.textContent).toBe("New project");
    await userEvent.type(search, "zzz");
    expect(screen.getByText("No results")).toBeTruthy();
  });
});

describe("ContextMenu", () => {
  it("opens on right click with the focus on the first item; Enter runs it", async () => {
    const onAction = vi.fn();
    render(Additions, { onAction });
    await fireEvent.contextMenu(screen.getByTestId("zone"), { clientX: 40, clientY: 40 });
    await tick();
    expect(screen.getByRole("menu", { name: "Row actions" })).toBeTruthy();
    expect(activeText()).toBe("Open");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onAction).toHaveBeenCalledWith("delete");
    expect(document.activeElement).toBe(screen.getByTestId("zone"));
  });

  it("opens from the keyboard with Shift+F10 and closes with Escape", async () => {
    render(Additions);
    const zone = screen.getByTestId("zone");
    zone.focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await tick();
    expect(screen.getByRole("menu")).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(zone);
  });
});

describe("Accordion, Progress, Avatar", () => {
  it("uses details/summary, exclusive when single", () => {
    render(Additions);
    const sections = [...document.querySelectorAll("details")];
    expect(sections).toHaveLength(2);
    expect(sections[0].open).toBe(true);
    expect(sections[0].getAttribute("name")).toBe(sections[1].getAttribute("name"));
  });

  it("reports progress, and an indeterminate bar has no value", () => {
    render(Additions);
    expect(screen.getByRole("progressbar", { name: "Upload" }).getAttribute("aria-valuenow")).toBe("30");
    expect(screen.getByText("30%")).toBeTruthy();
    expect(screen.getByRole("progressbar", { name: "Syncing" }).hasAttribute("aria-valuenow")).toBe(false);
  });

  it("names the avatar and falls back to the initials when the image fails", async () => {
    render(Additions);
    expect(screen.getByRole("img", { name: "Ana López" }).textContent).toContain("AL");
    const agent = screen.getByRole("img", { name: "Agent One" });
    agent.querySelector("img")!.dispatchEvent(new Event("error"));
    await tick();
    expect(agent.textContent).toContain("AO");
  });
});

describe("axe on the 0.4 components", () => {
  it("finds no violations", async () => {
    const { container } = render(Additions);
    toast.info("Notice");
    await tick();
    expect(await axeViolations(container)).toEqual([]);
    expect(await axeViolations(document.querySelector(".ta-toaster")!)).toEqual([]);
  });
});
