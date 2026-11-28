import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import { es } from "$lib/i18n";
import { CategoryNav } from "$lib/components";
import { axeViolations } from "../axe";
import Glass from "../fixtures/Glass.svelte";

const frame = () => new Promise((r) => requestAnimationFrame(() => r(null)));

describe("GlassPanel", () => {
  it("renders the element asked for with its children and attributes, adding no role", () => {
    render(Glass);
    const frost = screen.getByTestId("frost");
    expect(frost.tagName).toBe("DIV");
    expect(frost.className).toMatch(/ta-glass/);
    expect(frost.className).toMatch(/chip/);
    expect(frost.className).not.toMatch(/ta-glass--liquid/);
    expect(frost.hasAttribute("role")).toBe(false);
    const liquid = screen.getByRole("region", { name: "Sign in" });
    expect(liquid.tagName).toBe("SECTION");
    expect(within(liquid).getByText("Hello")).toBeTruthy();
  });

  it("liquid adds its own SVG displacement filter and points the backdrop at it", () => {
    render(Glass);
    const liquid = screen.getByTestId("liquid");
    expect(liquid.className).toMatch(/ta-glass--liquid/);
    const filter = liquid.querySelector("filter")!;
    expect(filter.id).toBeTruthy();
    expect(liquid.querySelector("feDisplacementMap")!.getAttribute("scale")).toBe("30");
    expect(liquid.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true");
    expect(liquid.style.getPropertyValue("--ta-glass-tint")).toBe("rgb(13 14 29 / 0.55)");
    expect(screen.getByTestId("frost").querySelector("filter")).toBeNull();
  });

  it("the rim follows the pointer, unless follow is off", async () => {
    render(Glass);
    for (const id of ["frost", "still"]) {
      screen.getByTestId(id).getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100, x: 0, y: 0, toJSON() {} });
    }
    // jsdom has no PointerEvent: a MouseEvent of that type carries the coordinates.
    window.dispatchEvent(new MouseEvent("pointermove", { clientX: 50, clientY: 25 }));
    await frame();
    expect(screen.getByTestId("frost").style.getPropertyValue("--mx")).toBe("25%");
    expect(screen.getByTestId("frost").style.getPropertyValue("--my")).toBe("25%");
    expect(screen.getByTestId("still").style.getPropertyValue("--mx")).toBe("");
  });
});

describe("CategoryNav", () => {
  const nav = () => screen.getByRole("navigation", { name: "Categories" });

  it("is a named nav of links and buttons with counts, the open one marked", () => {
    render(Glass);
    const links = within(nav()).getAllByRole("link");
    expect(links.map((a) => a.textContent!.replace(/\s+/g, " ").trim())).toEqual(["Welcome and roles 3/7", "Levels and economy 0/7"]);
    expect(links[1].getAttribute("aria-current")).toBe("page");
    expect(links[0].hasAttribute("aria-current")).toBe(false);
    expect(links[0].getAttribute("href")).toBe("?g=welcome");
    expect(links[0].hasAttribute("data-sveltekit-noscroll")).toBe(true);
    expect(links[0].querySelector(".ta-category-nav-count")!.className).toMatch(/--lit/);
    expect(links[0].querySelector(".ta-category-nav-icon")!.getAttribute("aria-hidden")).toBe("true");
  });

  it("an item without href is a button for onclick, reachable by keyboard", async () => {
    render(Glass);
    const custom = within(nav()).getByRole("button", { name: /Custom/ });
    custom.focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByTestId("picked").textContent).toBe("custom");
  });

  it("follows current, and null marks none", async () => {
    const first = render(Glass);
    await userEvent.click(screen.getByRole("button", { name: "Open welcome" }));
    expect(within(nav()).getByRole("link", { name: /Welcome/ }).getAttribute("aria-current")).toBe("page");
    expect(within(nav()).getByRole("link", { name: /Levels/ }).hasAttribute("aria-current")).toBe(false);
    first.unmount();
    render(Glass, { current: null });
    expect(nav().querySelector("[aria-current]")).toBeNull();
  });

  it("scopes the chips media query to the instance, and 0 keeps the rail", () => {
    const { unmount } = render(Glass, { chipsBelow: 640 });
    const id = nav().getAttribute("data-ta-category-nav")!;
    const css = () => [...document.querySelectorAll("style")].map((s) => s.textContent).join("\n");
    expect(css()).toContain(`@media (max-width: 640px) { [data-ta-category-nav="${id}"] .ta-category-nav-list`);
    unmount();
    render(Glass, { chipsBelow: 0 });
    expect(css()).not.toContain("data-ta-category-nav=");
  });

  it("takes its default name from the labels", () => {
    render(CategoryNav, { items: [{ id: "a", label: "A", href: "/a" }] });
    expect(screen.getByRole("navigation", { name: "Categories" })).toBeTruthy();
    expect(es.categories).toBe("Categorías");
  });

  it("has no axe violations", async () => {
    const { container } = render(Glass);
    expect(await axeViolations(container)).toEqual([]);
  });
});
