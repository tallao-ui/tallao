import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import ConfirmHarness from "../fixtures/ConfirmHarness.svelte";
import DialogHarness from "../fixtures/DialogHarness.svelte";

const dialogs = () => [...document.querySelectorAll("dialog")];
const cancel = (d: HTMLDialogElement) => d.dispatchEvent(new Event("cancel", { cancelable: true }));

describe("Dialog", () => {
  it("opens as a modal, focuses the first field and locks the page scroll", async () => {
    render(DialogHarness);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    const d = dialogs()[0];
    expect(d.open).toBe(true);
    expect(d.getAttribute("aria-labelledby")).toBeTruthy();
    expect(document.getElementById(d.getAttribute("aria-labelledby")!)?.textContent).toBe("Edit");
    expect(document.activeElement).toBe(screen.getByLabelText("Name"));
    expect(document.documentElement.style.overflow).toBe("hidden");
  });

  it("closes on Escape and gives the focus back to the button that opened it", async () => {
    render(DialogHarness);
    const open = screen.getByRole("button", { name: "Open" });
    await userEvent.click(open);
    cancel(dialogs()[0]);
    await tick();
    expect(dialogs()[0].open).toBe(false);
    expect(document.activeElement).toBe(open);
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("closes on a click on the backdrop, not inside the panel", async () => {
    render(DialogHarness);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await userEvent.click(screen.getByLabelText("Name"));
    expect(dialogs()[0].open).toBe(true);
    dialogs()[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await tick();
    expect(dialogs()[0].open).toBe(false);
  });

  it("with two dialogs open, Escape closes only the top one and the scroll stays locked", async () => {
    render(DialogHarness, { nested: true });
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await userEvent.click(screen.getByRole("button", { name: "Another" }));
    const [first, second] = dialogs();
    expect(first.open && second.open).toBe(true);
    cancel(second);
    await tick();
    expect(screen.getByTestId("state").textContent).toBe("open/closed");
    expect(document.documentElement.style.overflow).toBe("hidden");
    cancel(first);
    await tick();
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("names the close button", async () => {
    render(DialogHarness);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("button", { name: "Close dialog" })).toBeTruthy();
  });
});

describe("ConfirmDialog", () => {
  it("draws no empty body between the header and the buttons when it has no content", async () => {
    render(ConfirmHarness);
    await userEvent.click(screen.getByRole("button", { name: "Ask" }));
    const d = dialogs().find((x) => x.open)!;
    // An empty padded body drew a blank band between the header's rule and the footer's.
    expect(d.querySelector(".ta-dialog-body")).toBeNull();
    expect(d.textContent).toContain("This cannot be undone.");
    expect(d.querySelector(".ta-dialog-footer")).not.toBeNull();
  });

  it("keeps its body when it has content", async () => {
    render(ConfirmHarness);
    await userEvent.click(screen.getByRole("button", { name: "Ask with a note" }));
    const d = dialogs().find((x) => x.open)!;
    expect(d.querySelector(".ta-dialog-body")?.textContent).toContain("Readers see it at once.");
  });
});
