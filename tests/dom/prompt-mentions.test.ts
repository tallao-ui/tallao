/**
 * PromptInput's mentions: a trigger at the start of a word opens a list of matches; the field
 * keeps focus and points at the active option, Enter or Tab insert it, Escape closes it, and
 * Enter with the list closed still sends.
 */
import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import { axeViolations } from "../axe";
import PromptMentions from "../fixtures/PromptMentions.svelte";

describe("PromptInput mentions", () => {
  it("opens on a trigger, filters, moves with the arrows and inserts with Enter", async () => {
    const onSend = vi.fn();
    render(PromptMentions, { onSend });
    const field = screen.getByRole("textbox", { name: "Message" });
    expect(field.getAttribute("aria-autocomplete")).toBe("list");
    await userEvent.type(field, "Greet in #");
    const list = screen.getByRole("listbox", { name: "Channels" });
    expect(within(list).getAllByRole("option").map((o) => o.textContent?.replace(/\s+/g, " ").trim())).toEqual([
      "#general Text channel",
      "#mod-log Text channel · Staff",
      "#welcome",
    ]);
    expect(field.getAttribute("aria-controls")).toBe(list.id);
    await userEvent.type(field, "e");
    // "e" is in general and welcome; neither starts with it, so Discord's order stays.
    expect(within(list).getAllByRole("option")).toHaveLength(2);
    await userEvent.keyboard("{ArrowDown}");
    const active = document.getElementById(field.getAttribute("aria-activedescendant")!)!;
    expect(active.textContent).toContain("welcome");
    expect(active.getAttribute("aria-selected")).toBe("true");
    await userEvent.keyboard("{Enter}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByTestId("value").textContent).toBe("Greet in #welcome ");
    expect(screen.getByTestId("picked").textContent).toBe("#c3");
    expect(onSend).not.toHaveBeenCalled();
  });

  it("a trigger inside a word does nothing; Escape closes; Enter then sends", async () => {
    const onSend = vi.fn();
    render(PromptMentions, { onSend });
    const field = screen.getByRole("textbox", { name: "Message" });
    await userEvent.type(field, "mail me@");
    expect(screen.queryByRole("listbox")).toBeNull();
    await userEvent.type(field, " @m");
    expect(within(screen.getByRole("listbox", { name: "Roles" })).getAllByRole("option").map((o) => o.textContent?.trim())).toEqual(["@Mod", "@Member"]);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    await userEvent.keyboard("{Enter}");
    expect(onSend).toHaveBeenCalledWith("mail me@ @m");
  });

  it("Tab and a click insert too, and a space after the name closes the list", async () => {
    render(PromptMentions);
    const field = screen.getByRole("textbox", { name: "Message" });
    await userEvent.type(field, "@me");
    await userEvent.keyboard("{Tab}");
    expect(screen.getByTestId("value").textContent).toBe("@Member ");
    expect(document.activeElement).toBe(field);
    await userEvent.type(field, "#mod");
    await userEvent.click(screen.getByRole("option", { name: /mod-log/ }));
    expect(screen.getByTestId("value").textContent).toBe("@Member #mod-log ");
    expect(screen.getByTestId("picked").textContent).toBe("@r2,#c2");
    await userEvent.type(field, "#gen ");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("has no axe violations with the list open", async () => {
    const { container } = render(PromptMentions);
    await userEvent.type(screen.getByRole("textbox", { name: "Message" }), "#");
    expect(await axeViolations(container)).toEqual([]);
  });
});
