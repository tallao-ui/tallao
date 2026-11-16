import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import { axeViolations } from "../axe";
import Sortable from "../fixtures/Sortable.svelte";

const order = () => screen.getByTestId("order").textContent;
const status = () => screen.getByRole("status").textContent;

describe("SortableList", () => {
  it("keyboard: the handle picks up, arrows move, the handle drops; focus follows the row", async () => {
    render(Sortable);
    const handle = screen.getByRole("button", { name: "Move Reply" });
    expect(handle.getAttribute("aria-pressed")).toBe("false");
    handle.focus();
    await userEvent.keyboard("{Enter}");
    expect(handle.getAttribute("aria-pressed")).toBe("true");
    expect(status()).toBe("Reply picked up, position 1 of 3.");

    await userEvent.keyboard("{ArrowDown}");
    expect(order()).toBe("Give coins,Reply,Post panel");
    expect(status()).toBe("Reply, position 2 of 3.");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Move Reply" }));

    await userEvent.keyboard("{End}");
    expect(order()).toBe("Give coins,Post panel,Reply");
    await userEvent.keyboard("{Enter}");
    expect(status()).toBe("Reply dropped at position 3 of 3.");
    expect(screen.getByRole("button", { name: "Move Reply" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("Escape puts the row back where it started", async () => {
    render(Sortable);
    screen.getByRole("button", { name: "Move Post panel" }).focus();
    await userEvent.keyboard("{Enter}{ArrowUp}{ArrowUp}");
    expect(order()).toBe("Post panel,Reply,Give coins");
    await userEvent.keyboard("{Escape}");
    expect(order()).toBe("Reply,Give coins,Post panel");
    expect(status()).toBe("Post panel back at position 3 of 3.");
  });

  it("touch or a click: picking a row up shows move buttons", async () => {
    render(Sortable);
    await userEvent.click(screen.getByRole("button", { name: "Move Give coins" }));
    expect((screen.getByRole("button", { name: "Move up" }) as HTMLButtonElement).disabled).toBe(false);
    await userEvent.click(screen.getByRole("button", { name: "Move up" }));
    expect(order()).toBe("Give coins,Reply,Post panel");
    expect((screen.getByRole("button", { name: "Move up" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("mouse: drag a handle onto another row", async () => {
    render(Sortable);
    const rows = screen.getAllByRole("listitem");
    await fireEvent.dragStart(screen.getByRole("button", { name: "Move Reply" }), { dataTransfer: { setData: () => {}, effectAllowed: "" } });
    await fireEvent.dragOver(rows[2]);
    expect(rows[2].hasAttribute("data-over")).toBe(true);
    await fireEvent.drop(rows[2]);
    expect(order()).toBe("Give coins,Post panel,Reply");
  });

  it("has no axe violations", async () => {
    const { container } = render(Sortable);
    expect(await axeViolations(container)).toEqual([]);
  });
});
