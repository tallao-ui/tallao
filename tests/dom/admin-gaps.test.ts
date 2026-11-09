import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import { axeViolations } from "../axe";
import AdminGaps from "../fixtures/AdminGaps.svelte";

describe("Label", () => {
  it("names its control, and a required one says so to screen readers", () => {
    render(AdminGaps);
    const email = screen.getByRole("textbox", { name: "E-mail (Required)" });
    expect(email.id).toBe("email");
    // The star is only visual.
    const star = document.querySelector('label[for="email"] [aria-hidden="true"]')!;
    expect(star.textContent?.trim()).toBe("*");
  });

  it("passes for, class and other attributes, and shows the disabled state", () => {
    render(AdminGaps);
    const label = screen.getByTestId("locked-label");
    expect(label.tagName).toBe("LABEL");
    expect(label.getAttribute("for")).toBe("locked");
    expect(label.className).toMatch(/ta-label--off/);
    expect(label.className).toMatch(/extra/);
    expect(screen.getByRole("textbox", { name: "Locked" })).toBeTruthy();
  });
});

describe("Badge status dot", () => {
  it("draws a decorative dot with dot, a pulsing one with pulse, and none by default", () => {
    render(AdminGaps);
    const dot = screen.getByTestId("published").querySelector(".ta-badge-dot")!;
    expect(dot.getAttribute("aria-hidden")).toBe("true");
    expect(dot.className).not.toMatch(/pulse/);
    expect(screen.getByTestId("running").querySelector(".ta-badge-dot--pulse")).toBeTruthy();
    expect(screen.getByTestId("plain").querySelector(".ta-badge-dot")).toBeNull();
    expect(screen.getByTestId("published").textContent?.trim()).toBe("Published");
  });
});

describe("Avatar attributes", () => {
  it("passes other attributes to the root and keeps the name as label", () => {
    render(AdminGaps);
    const ana = screen.getByTestId("ana");
    expect(ana.getAttribute("title")).toBe("Ana");
    expect(ana.getAttribute("aria-label")).toBe("Ana López");
    expect(ana.textContent).toContain("AL");
  });

  it("an explicit aria-label replaces the name, and initials={1} draws one letter", () => {
    render(AdminGaps);
    const agent = screen.getByRole("img", { name: "Agent: Smith" });
    expect(agent.querySelector(".ta-avatar-initials")!.textContent).toBe("A");
  });
});

describe("Tabs without panels", () => {
  it("renders only the tablist, points each tab at the page's panel and has no dangling aria-controls", () => {
    render(AdminGaps);
    const list = screen.getByRole("tablist", { name: "Admin sections" });
    expect(list.closest(".ta-tabs")!.querySelector(".ta-tabs-panel")).toBeNull();
    const posts = screen.getByRole("tab", { name: "Posts" });
    expect(posts.id).toBe("tab-posts");
    expect(posts.getAttribute("aria-controls")).toBe("panel-posts");
    expect(screen.getByRole("tab", { name: "Logs" }).hasAttribute("aria-controls")).toBe(false);
    expect(screen.getByRole("tabpanel", { name: "Posts" }).textContent).toBe("Post list");
  });

  it("keeps the roving focus and the arrow keys, and binds the value", async () => {
    render(AdminGaps);
    const posts = screen.getByRole("tab", { name: "Posts" });
    expect(posts.tabIndex).toBe(0);
    posts.focus();
    await userEvent.keyboard("{ArrowRight}");
    const users = screen.getByRole("tab", { name: "Users" });
    expect(document.activeElement).toBe(users);
    expect(users.tabIndex).toBe(0);
    expect(posts.tabIndex).toBe(-1);
    expect(screen.getByTestId("tab").textContent).toBe("users");
    expect(screen.getByRole("tabpanel", { name: "Users" }).textContent).toBe("User list");
    await userEvent.keyboard("{End}");
    expect(screen.getByTestId("tab").textContent).toBe("logs");
  });
});

describe("binding a number", () => {
  it("NumberInput binds number | null and starts empty from null", async () => {
    render(AdminGaps);
    const field = screen.getByRole("spinbutton", { name: "Amount" }) as HTMLInputElement;
    expect(field.value).toBe("");
    expect(screen.getByTestId("amount").textContent).toBe("null");
    await userEvent.type(field, "42");
    expect(screen.getByTestId("amount").textContent).toBe("number:42");
    await userEvent.clear(field);
    expect(screen.getByTestId("amount").textContent).toBe("null");
  });

  it("Input type=number: Svelte already hands back a number (or null when empty) at runtime", async () => {
    render(AdminGaps);
    const field = screen.getByRole("spinbutton", { name: "Raw number" });
    await userEvent.type(field, "7");
    expect(screen.getByTestId("raw").textContent).toBe("number:7");
    await userEvent.clear(field);
    expect(screen.getByTestId("raw").textContent).toBe("null");
  });
});

describe("axe on the admin additions", () => {
  it("finds no violations", async () => {
    const { container } = render(AdminGaps);
    await tick();
    expect(await axeViolations(container)).toEqual([]);
  });
});
