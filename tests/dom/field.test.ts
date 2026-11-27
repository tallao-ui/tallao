import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import FieldError from "../fixtures/FieldError.svelte";
import FieldHint from "../fixtures/FieldHint.svelte";

describe("Field", () => {
  it("an error marks its control invalid and describes it, and both go when it is fixed", async () => {
    render(FieldError);
    const input = screen.getByRole("textbox", { name: /Member id/ });
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const id = input.getAttribute("aria-describedby");
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)?.textContent).toBe("A Discord id is 15 to 20 digits.");

    await userEvent.click(screen.getByRole("button", { name: "Fix it" }));
    expect(input.hasAttribute("aria-invalid")).toBe(false);
    expect(input.hasAttribute("aria-describedby")).toBe(false);
  });
});

describe("Field hint", () => {
  it("describes the control without joining its name, and keeps the error's id alongside", async () => {
    const { getByRole } = render(FieldHint);
    const input = getByRole("textbox", { name: "Budget" });
    const hintId = input.getAttribute("aria-describedby")!;
    expect(document.getElementById(hintId)?.textContent).toBe("Empty: no budget.");
    await fireEvent.click(getByRole("button", { name: "Toggle error" }));
    const ids = input.getAttribute("aria-describedby")!.split(" ");
    expect(ids).toHaveLength(2);
    expect(ids[0]).toBe(hintId);
    await fireEvent.click(getByRole("button", { name: "Toggle error" }));
    expect(input.getAttribute("aria-describedby")).toBe(hintId);
  });
});
