import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import { axeViolations } from "../axe";
import Lists from "../fixtures/Lists.svelte";

describe("TagInput", () => {
  it("adds with Enter and the separator, refuses what does not match, removes with its button", async () => {
    render(Lists);
    const field = screen.getByLabelText("Role ids") as HTMLInputElement;
    await userEvent.type(field, "223456789012345678{Enter}");
    expect(screen.getByTestId("ids").textContent).toBe("123456789012345678,223456789012345678");

    await userEvent.type(field, "nope,");
    expect(screen.getByRole("alert").textContent).toBe("Not a Discord id");
    expect(field.value).toBe("nope");
    expect(field.getAttribute("aria-invalid")).toBe("true");

    await userEvent.clear(field);
    await userEvent.click(screen.getByRole("button", { name: "Remove 123456789012345678" }));
    expect(screen.getByTestId("ids").textContent).toBe("223456789012345678");
  });

  it("splits a pasted list, skips repeats and stops at maxItems", async () => {
    render(Lists);
    const field = screen.getByLabelText("Role ids") as HTMLInputElement;
    field.focus();
    await userEvent.paste("123456789012345678, 323456789012345678\n423456789012345678");
    expect(screen.getByTestId("ids").textContent).toBe("123456789012345678,323456789012345678,423456789012345678");
    // Full: the field is disabled until one is removed.
    expect(field.disabled).toBe(true);
  });

  it("Backspace in the empty field takes the last value back to edit", async () => {
    render(Lists);
    const field = screen.getByLabelText("Role ids") as HTMLInputElement;
    await userEvent.click(field);
    await userEvent.keyboard("{Backspace}");
    expect(screen.getByTestId("ids").textContent).toBe("");
    expect(field.value).toBe("123456789012345678");
  });

  it("submits each value as a hidden input with the name", () => {
    const { container } = render(Lists);
    const hidden = [...container.querySelectorAll<HTMLInputElement>('input[type=hidden][name="roles"]')];
    expect(hidden.map((h) => h.value)).toEqual(["123456789012345678"]);
  });
});

describe("TreeView", () => {
  it("is a named tree with levels, sizes and positions", () => {
    render(Lists);
    const tree = screen.getByRole("tree", { name: "Blueprint" });
    const top = within(tree).getAllByRole("treeitem");
    expect(top.map((t) => t.getAttribute("aria-level"))).toEqual(["1", "1", "1"]);
    expect(top[0].getAttribute("aria-expanded")).toBe("false");
    expect(top[0].getAttribute("aria-setsize")).toBe("3");
    expect(top[2].getAttribute("aria-posinset")).toBe("3");
    expect(top[2].getAttribute("aria-expanded")).toBeNull();
    // One tab stop.
    expect(top.filter((t) => t.tabIndex === 0)).toHaveLength(1);
  });

  it("moves, opens and closes with the arrows; Enter selects", async () => {
    const onSelect = vi.fn();
    render(Lists, { onSelect });
    const tree = screen.getByRole("tree");
    within(tree).getAllByRole("treeitem")[0].focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByTestId("expanded").textContent).toBe("commands");
    await userEvent.keyboard("{ArrowRight}{ArrowDown}");
    expect((document.activeElement as HTMLElement).textContent).toContain("booth");
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(document.activeElement?.getAttribute("aria-level")).toBe("3");
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("sub-set");
    expect(document.activeElement?.getAttribute("aria-selected")).toBe("true");
    await userEvent.keyboard("{ArrowLeft}");
    expect((document.activeElement as HTMLElement).textContent).toContain("booth");
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByTestId("expanded").textContent).toBe("commands");
    await userEvent.keyboard("{End}");
    expect((document.activeElement as HTMLElement).textContent).toContain("Panels");
    await userEvent.keyboard("{Home}m");
    expect((document.activeElement as HTMLElement).textContent).toContain("Modals");
  });

  it("clicking selects; a disabled node cannot be selected", async () => {
    render(Lists);
    await userEvent.click(screen.getByText("Modals"));
    expect(screen.getByTestId("selected").textContent).toBe("modals");
    await userEvent.click(screen.getByText("Panels"));
    expect(screen.getByTestId("selected").textContent).toBe("modals");
  });

  it("* opens every sibling", async () => {
    render(Lists);
    within(screen.getByRole("tree")).getAllByRole("treeitem")[0].focus();
    await userEvent.keyboard("*");
    expect(screen.getByTestId("expanded").textContent).toBe("commands,modals");
  });
});

describe("SchemaForm lists", () => {
  it("draws string and number lists as TagInputs and object lists as groups", async () => {
    render(Lists);
    expect(screen.getByRole("group", { name: /Rules/ })).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByRole("group", { name: "Rules 1" })).toBeTruthy();
    expect(screen.getByLabelText(/Event/)).toBeTruthy();
  });

  it("validates the count, the item pattern and the items' fields before submitting", async () => {
    const onSubmit = vi.fn();
    render(Lists, { onSubmit });
    await userEvent.click(screen.getByRole("button", { name: "Add" }));
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).not.toHaveBeenCalled();
    const alerts = screen.getAllByRole("alert").map((a) => a.textContent);
    expect(alerts).toEqual(expect.arrayContaining(["Required"]));

    const form = screen.getByRole("group", { name: "Rules 1" }).closest("form")!;
    const roles = within(form).getByLabelText(/Roles/) as HTMLInputElement;
    await userEvent.type(roles, "123456789012345678{Enter}");
    const sizes = within(form).getByLabelText(/Sizes/) as HTMLInputElement;
    await userEvent.type(sizes, "3{Enter}12{Enter}");
    await userEvent.type(screen.getByLabelText(/Event/), "blog:post:published");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0]).toEqual({
      roleIds: ["123456789012345678"],
      sizes: [3, 12],
      rules: [{ event: "blog:post:published", loud: false }],
    });
  });

  it("removes an item and stops adding at maxItems", async () => {
    render(Lists);
    const add = screen.getByRole("button", { name: "Add" });
    await userEvent.click(add);
    await userEvent.click(add);
    expect((add as HTMLButtonElement).disabled).toBe(true);
    await userEvent.click(screen.getByRole("button", { name: "Remove Rules 1" }));
    expect(screen.queryByRole("group", { name: "Rules 2" })).toBeNull();
    expect((add as HTMLButtonElement).disabled).toBe(false);
  });

  it("has no axe violations", async () => {
    const { container } = render(Lists);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("SchemaForm with a reactive schema", () => {
  it("takes defaults from a schema held in $state (a proxy structuredClone refuses)", async () => {
    const { default: ReactiveSchema } = await import("../fixtures/ReactiveSchema.svelte");
    render(ReactiveSchema);
    expect(screen.getByTestId("value").textContent).toBe('{"roles":["123456789012345678"],"size":2}');
    expect(screen.getByRole("button", { name: "Remove 123456789012345678" })).toBeTruthy();
  });
});

describe("TagInput without key events", () => {
  it("adds when a separator arrives as text (phone keyboards, autocomplete), keeping what follows", async () => {
    const { fireEvent } = await import("@testing-library/svelte");
    render(Lists);
    const field = screen.getByLabelText("Role ids") as HTMLInputElement;
    await fireEvent.input(field, { target: { value: "nope,223456789012345678,32" } });
    expect(screen.getByTestId("ids").textContent).toBe("123456789012345678,223456789012345678");
    expect(field.value).toBe("nope,32");
    expect(screen.getByRole("alert").textContent).toBe("Not a Discord id");
  });
});
