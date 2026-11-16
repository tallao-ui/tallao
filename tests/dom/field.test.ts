import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import FieldError from "../fixtures/FieldError.svelte";

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
