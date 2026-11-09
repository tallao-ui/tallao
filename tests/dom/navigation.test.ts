import { fireEvent, render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

import { BottomNav } from "$lib/components";
import { axeViolations } from "../axe";
import Navigation from "../fixtures/Navigation.svelte";

const bottomNav = () => screen.getByRole("navigation", { name: "Main" }) as HTMLElement;
const menu = (name: string) =>
  [...document.querySelectorAll<HTMLDetailsElement>("details.ta-navmenu")].find(
    (d) => d.querySelector("summary")!.textContent!.trim() === name
  )!;

describe("BottomNav", () => {
  it("is a named nav of links with visible labels, the current one marked", () => {
    render(Navigation);
    const nav = bottomNav();
    expect(nav.className).toMatch(/ta-bottom-nav/);
    const links = within(nav).getAllByRole("link");
    const names = links.map((a) => a.getAttribute("aria-label") ?? a.querySelector(".ta-bottom-nav-label")!.textContent!.trim());
    expect(names).toEqual(["Home", "News (3)", "New post", "Games", "Profile"]);
    const news = within(nav).getByRole("link", { name: "News (3)" });
    expect(news.getAttribute("aria-current")).toBe("page");
    expect(within(nav).getByRole("link", { name: "Home" }).hasAttribute("aria-current")).toBe(false);
    // The badge on the icon is decorative; the label carries the count.
    expect(news.querySelector(".ta-bottom-nav-icon")!.getAttribute("aria-hidden")).toBe("true");
  });

  it("puts the action between the two halves and draws snippet icons", () => {
    render(Navigation);
    const items = [...bottomNav().querySelectorAll(".ta-bottom-nav-list > li")];
    expect(items[2].className).toMatch(/ta-bottom-nav-action/);
    expect(within(bottomNav()).getByRole("link", { name: "New post" })).toBeTruthy();
    expect(within(bottomNav()).getByRole("link", { name: "Games" }).querySelector(".site-icon")).toBeTruthy();
  });

  it("hides itself above the breakpoint with a media query, and keeps a spacer unless told not to", () => {
    const { unmount } = render(Navigation);
    const id = bottomNav().getAttribute("data-ta-bottom-nav")!;
    const css = [...document.querySelectorAll("style")].map((s) => s.textContent).join("\n");
    expect(css).toContain(`@media (min-width: 768px) { [data-ta-bottom-nav="${id}"] { display: none !important; } }`);
    expect(document.querySelector(`.ta-bottom-nav-spacer[data-ta-bottom-nav="${id}"]`)).toBeTruthy();
    unmount();
    render(Navigation, { spacer: false });
    expect(document.querySelector(".ta-bottom-nav-spacer")).toBeNull();
  });

  it("warns in development with more than five items", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(BottomNav, {
      items: Array.from({ length: 6 }, (_, i) => ({ id: `i${i}`, label: `Item ${i}`, href: `/${i}` })),
    });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("at most 5 items"));
    warn.mockRestore();
  });
});

describe("NavMenu", () => {
  it("is a closed disclosure of grouped links, not an ARIA menu", () => {
    render(Navigation);
    const games = menu("Games");
    expect(games.tagName).toBe("DETAILS");
    expect(games.open).toBe(false);
    expect(games.getAttribute("name")).toBe("site-menus");
    expect(games.querySelector('[role="menu"], [role="menuitem"]')).toBeNull();
    const panel = games.querySelector(".ta-navmenu-panel") as HTMLElement;
    expect(panel.style.getPropertyValue("--ta-navmenu-columns")).toBe("2");
  });

  it("opens on click, lists named links with their description and badge, and soon entries without a link", async () => {
    render(Navigation);
    const games = menu("Games");
    await userEvent.click(games.querySelector("summary")!);
    expect(games.open).toBe(true);
    const list = within(games).getByRole("list", { name: "Gacha" });
    const genshin = within(list).getByRole("link", { name: /Genshin Impact/ });
    expect(genshin.getAttribute("href")).toBe("/genshin");
    expect(genshin.textContent).toContain("Tier list and builds");
    expect(genshin.textContent).toContain("New");
    expect(within(games).getByRole("link", { name: /Star Rail/ }).getAttribute("aria-current")).toBe("page");
    const soon = within(games).getByText("Aion 2").closest(".ta-navmenu-link")!;
    expect(soon.tagName).toBe("SPAN");
    expect(soon.getAttribute("aria-disabled")).toBe("true");
    expect(soon.textContent).toContain("Coming soon");
  });

  it("Escape closes it and gives the focus back to the trigger; a click outside closes it", async () => {
    render(Navigation);
    const games = menu("Games");
    const summary = games.querySelector("summary")!;
    await userEvent.click(summary);
    within(games).getByRole("link", { name: /Genshin/ }).focus();
    await userEvent.keyboard("{Escape}");
    expect(games.open).toBe(false);
    expect(document.activeElement).toBe(summary);
    await userEvent.click(summary);
    expect(games.open).toBe(true);
    await fireEvent.pointerDown(document.querySelector("main")!);
    await tick();
    expect(games.open).toBe(false);
  });

  it("takes icons by name, as an item snippet, or from a wrapper's own icon component; align end", () => {
    render(Navigation);
    expect(menu("Games").querySelector(".ta-navmenu-icon svg")).toBeTruthy();
    expect(menu("Tools").querySelector(".ta-navmenu-icon .site-icon[data-shape='circle']")).toBeTruthy();
    expect(menu("Tools").querySelector(".ta-navmenu-panel--end")).toBeTruthy();
    const sites = menu("Sites");
    expect(sites.querySelectorAll(".site-icon")).toHaveLength(2);
    expect(sites.querySelector(".site-icon[data-shape='circle']")).toBeTruthy();
  });
});

describe("Sidebar extensions", () => {
  it("draws icons from the global snippet or the item's own, and tinted, pulsing badges", () => {
    render(Navigation);
    const approvals = screen.getByRole("link", { name: /Approvals/ });
    expect(approvals.querySelector(".site-icon[data-shape='circle']")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Posts/ }).querySelector(".site-icon[data-shape='square']")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Media/ }).querySelector(".site-icon[data-shape='circle']")).toBeTruthy();
    const badge = approvals.querySelector(".ta-sidebar-badge")!;
    expect(badge.className).toMatch(/ta-sidebar-badge--warning/);
    expect(badge.className).toMatch(/ta-sidebar-badge--pulse/);
    expect(badge.querySelector(".ta-sidebar-dot")).toBeTruthy();
    expect(badge.textContent).toBe("4");
  });

  it("collapsed: tooltips with the label (no duplicate description), a dot for badges, the footer as an avatar", async () => {
    render(Navigation, { collapsed: true });
    const posts = screen.getByRole("link", { name: "Posts" });
    expect(posts.hasAttribute("aria-describedby")).toBe(false);
    expect(posts.hasAttribute("title")).toBe(false);
    await fireEvent.focus(posts);
    await new Promise((r) => setTimeout(r, 20));
    await tick();
    const tip = [...document.querySelectorAll('[role="tooltip"]')].find((t) => t.textContent!.trim() === "Posts")!;
    expect(tip.className).toMatch(/ta-tooltip--open/);
    expect(screen.getByRole("link", { name: /Approvals/ }).querySelector(".ta-sidebar-pip.ta-sidebar-badge--pulse")).toBeTruthy();
    expect(screen.getByTestId("footer-avatar").getAttribute("title")).toBe("Ana López");
    expect(screen.queryByTestId("footer-full")).toBeNull();
  });

  it("tooltips={false} falls back to title", () => {
    render(Navigation, { collapsed: true, tooltips: false });
    expect(screen.getByRole("link", { name: "Posts" }).getAttribute("title")).toBe("Posts");
  });

  it("persistKey remembers collapsed in localStorage", async () => {
    localStorage.setItem("test-sidebar", "true");
    const { unmount } = render(Navigation, { persistKey: "test-sidebar" });
    await tick();
    expect(document.querySelector(".ta-sidebar--collapsed")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Expand" }));
    expect(localStorage.getItem("test-sidebar")).toBe("false");
    unmount();
    localStorage.removeItem("test-sidebar");
  });

  it("persistKey survives storage that throws", async () => {
    const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    render(Navigation, { persistKey: "blocked" });
    await tick();
    await userEvent.click(screen.getByRole("button", { name: "Collapse" }));
    expect(document.querySelector(".ta-sidebar--collapsed")).toBeTruthy();
    get.mockRestore();
    set.mockRestore();
  });
});

describe("axe on the navigation pieces", () => {
  it("finds no violations, open or closed", async () => {
    const { container } = render(Navigation);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(menu("Games").querySelector("summary")!);
    expect(await axeViolations(container)).toEqual([]);
  });
});
