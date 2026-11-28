import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import FieldError from "../fixtures/FieldError.svelte";
import FieldRequired from "../fixtures/FieldRequired.svelte";

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

  it("required reaches the control as aria-required (the asterisk is hidden from screen readers)", async () => {
    render(FieldRequired);
    expect(screen.getByRole("textbox", { name: /Server name/ }).getAttribute("aria-required")).toBe("true");
    expect(screen.getByRole("combobox", { name: /Channel/ }).getAttribute("aria-required")).toBe("true");
    const nick = screen.getByRole("textbox", { name: /Nickname/ });
    expect(nick.getAttribute("aria-required")).toBe("true");
    await userEvent.click(screen.getByRole("button", { name: "Make optional" }));
    expect(nick.hasAttribute("aria-required")).toBe(false);
  });
});
