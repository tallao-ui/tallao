import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import ThemeToggle from "$lib/components/theme-toggle.svelte";

const root = document.documentElement;

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    delete root.dataset.tallaoTheme;
  });

  it("starts dark, switches to light and back, and remembers the choice", async () => {
    const onchange = vi.fn();
    render(ThemeToggle, { props: { transition: "none", onchange } });
    const button = screen.getByRole("button", { name: "Switch to light theme" });
    expect(root.dataset.tallaoTheme).toBe("dark");

    await userEvent.click(button);
    expect(root.dataset.tallaoTheme).toBe("light");
    expect(localStorage.getItem("tallao-theme")).toBe("light");
    expect(onchange).toHaveBeenLastCalledWith("light");
    expect(button.getAttribute("aria-label")).toBe("Switch to dark theme");

    await userEvent.click(button);
    expect(root.dataset.tallaoTheme).toBe("dark");
    expect(localStorage.getItem("tallao-theme")).toBe("dark");
  });

  it("takes the stored choice first, then the theme already on <html>", () => {
    localStorage.setItem("my-theme", "light");
    root.dataset.tallaoTheme = "dark";
    const first = render(ThemeToggle, { props: { storageKey: "my-theme", transition: "none" } });
    expect(root.dataset.tallaoTheme).toBe("light");
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeTruthy();
    first.unmount();

    localStorage.clear();
    root.dataset.tallaoTheme = "light";
    render(ThemeToggle, { props: { storageKey: "my-theme", transition: "none" } });
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeTruthy();
  });

  it("with storageKey null it remembers nothing", async () => {
    render(ThemeToggle, { props: { storageKey: null, transition: "none" } });
    await userEvent.click(screen.getByRole("button", { name: "Switch to light theme" }));
    expect(root.dataset.tallaoTheme).toBe("light");
    expect(localStorage.length).toBe(0);
  });

  it("without View Transitions the reveal still switches the theme", async () => {
    render(ThemeToggle, { props: { storageKey: null } });
    await userEvent.click(screen.getByRole("button", { name: "Switch to light theme" }));
    expect(root.dataset.tallaoTheme).toBe("light");
    expect(root.hasAttribute("data-ta-theme-transition")).toBe(false);
  });

  it("explicit labels win over the kit's", () => {
    render(ThemeToggle, { props: { storageKey: null, lightLabel: "Light mode" } });
    expect(screen.getByRole("button", { name: "Light mode" })).toBeTruthy();
  });
});
