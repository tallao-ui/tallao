/**
 * SSR: every component renders in Node without `window` and gives the same HTML
 * twice. An id built with Math.random (as Tabs had) changes between renders and
 * breaks hydration in SvelteKit.
 */
import { render } from "svelte/server";

import GameMap from "$lib/map/game-map.svelte";
import Floating from "../fixtures/Floating.svelte";
import AllComponents from "../fixtures/AllComponents.svelte";

describe("server rendering", () => {
  it("renders every component without touching window", () => {
    expect(typeof window).toBe("undefined");
    const { body } = render(AllComponents, { props: { dialogOpen: true } });
    expect(body).toContain("Save");
    expect(body).toContain('role="tablist"');
    expect(body).toContain("Dialog");
  });

  it("gives the same HTML on every render (stable ids)", () => {
    const a = render(AllComponents).body;
    const b = render(AllComponents).body;
    expect(a).toBe(b);
    expect(a).toMatch(/id="ta-tabs-[^"]+-a"/);
  });

  it("renders the map as an empty box without loading Leaflet", () => {
    const { body } = render(GameMap, { props: { markers: [{ lat: 1, lng: 2, title: "X" }] } });
    expect(body).toContain('role="application"');
    expect(body).not.toContain("leaflet-container");
  });
});

describe("server rendering of the floating components", () => {
  it("renders the triggers closed, without Floating UI or the Popover API", () => {
    const { body } = render(Floating);
    expect(body).toContain('aria-haspopup="menu"');
    expect(body).toContain('role="combobox"');
    expect(body).not.toContain('role="menu"');
    expect(render(Floating).body).toBe(body);
  });
});

import Additions from "../fixtures/Additions.svelte";

describe("server rendering of the 0.4 components", () => {
  it("renders them all, the same every time", () => {
    const { body } = render(Additions);
    expect(body).toContain('role="switch"');
    expect(body).toContain("<details");
    expect(body).toContain('role="progressbar"');
    expect(render(Additions).body).toBe(body);
  });
});

import Integrated from "../fixtures/Integrated.svelte";

describe("server rendering of the 0.5 components", () => {
  it("renders them all, the same every time", () => {
    const { body } = render(Integrated);
    expect(body).toContain("Select all");
    expect(body).toContain("<article");
    expect(render(Integrated).body).toBe(body);
  });
});

import { toast, toasts } from "$lib/toast.svelte";

describe("toast() on the server", () => {
  it("does nothing: the module is shared by every request, so a toast would leak to other users", () => {
    expect(toast("from a server render")).toBe(0);
    expect(toasts).toHaveLength(0);
  });
});

import Forms from "../fixtures/Forms.svelte";

describe("server rendering of the 0.6 components", () => {
  it("renders the form values as hidden inputs, so a form posts without JavaScript", () => {
    const { body } = render(Forms);
    expect(body).toContain('name="notifications" value="on"');
    expect(body).toContain('name="country" value="pe"');
    expect(body).toContain('name="tags" value="bug"');
    expect(body).toContain('name="stats[hp]" value="100"');
    expect(body).toContain('name="date" value="2026-11-03"');
    expect(body).toContain('role="grid"');
    expect(body).toContain('aria-sort="none"');
    expect(render(Forms).body).toBe(body);
  });
});

import CodeEditor from "$lib/code/code-editor.svelte";
import Panels from "../fixtures/Panels.svelte";

describe("server rendering of the 0.7 components", () => {
  it("renders them all, the same every time", () => {
    const { body } = render(Panels, { props: { name: "post" } });
    expect(body).toContain('role="separator"');
    expect(body).toContain('aria-current="page"');
    expect(body).toContain('role="slider"');
    expect(body).toContain('name="post.title"');
    expect(body).toContain("<fieldset");
    expect(render(Panels, { props: { name: "post" } }).body).toBe(body);
  });

  it("renders the code editor as a plain textarea, without loading CodeMirror", () => {
    const { body } = render(CodeEditor, { props: { value: "{ }", language: "json", name: "data" } });
    expect(body).toMatch(/<textarea[^>]*name="data"/);
    expect(body).toContain("{ }");
    expect(body).not.toContain("cm-editor");
  });
});

import Controls from "../fixtures/Controls.svelte";

describe("server rendering of Slider, SearchInput, Toggle and ToggleGroup", () => {
  it("renders them with their values, the same every time", () => {
    const { body } = render(Controls);
    expect(body).toContain('type="range"');
    expect(body).toContain('aria-valuetext="Lv. 30"');
    expect(body).toContain('type="search"');
    expect(body).toContain('aria-pressed="true"');
    expect(body).toContain('name="rarity" value="all"');
    expect(render(Controls).body).toBe(body);
  });
});

import Carousels from "../fixtures/Carousels.svelte";

describe("server rendering of Carousel and CompareSlider", () => {
  it("renders the slides and the slider with its value, the same every time", () => {
    const { body } = render(Carousels);
    expect(body).toContain('aria-roledescription="carousel"');
    expect(body).toContain('aria-label="2 of 3"');
    expect(body).toContain('role="slider"');
    expect(body).toContain('aria-valuenow="50"');
    expect(body).toContain('draggable="false"');
    expect(render(Carousels).body).toBe(body);
  });
});

import Facets from "../fixtures/Facets.svelte";
import RemoteCommand from "../fixtures/RemoteCommand.svelte";

describe("server rendering of Command with page results and the bare ToggleGroup", () => {
  it("renders the inline palette and the icon facets, the same every time", () => {
    const palette = render(RemoteCommand, { props: { search: async () => [] } }).body;
    expect(palette).toContain('role="combobox"');
    expect(palette).toContain('aria-expanded="false"');
    expect(palette).toContain("Type to search");
    expect(render(RemoteCommand, { props: { search: async () => [] } }).body).toBe(palette);
    const facets = render(Facets).body;
    expect(facets).toContain("ta-toggle-group--bare");
    expect(facets).toContain("--ta-toggle-accent: #e4572e");
    expect(facets).toContain('aria-label="Fire"');
    expect(render(Facets).body).toBe(facets);
  });
});

import Parts from "../fixtures/Parts.svelte";

describe("server rendering of the compact Table, Badge tones, Spinner and MonthView", () => {
  it("renders the month with the day content and no today mark, the same every time", () => {
    const { body } = render(Parts);
    expect(body).toContain("ta-table--sticky-column");
    expect(body).toContain('role="status"');
    expect(body).toContain("noviembre de 2026");
    expect(body).toContain('data-date="2026-11-14"');
    expect(body).toContain("Regional tournament");
    // "Today" depends on the viewer's clock: it is marked on hydration, not on the server.
    expect(body).not.toContain('aria-current="date"');
    expect(render(Parts).body).toBe(body);
  });
});

import NewInputs from "../fixtures/NewInputs.svelte";

describe("server rendering of InputOTP and the DataTable filter row", () => {
  it("renders the code field and the filters, already applied, the same every time", () => {
    const { body } = render(NewInputs, { props: { initialFilters: { team: "Blue" } } });
    expect(body).toContain('autocomplete="one-time-code"');
    expect(body).toContain('name="code"');
    expect(body).toContain("Digit 1 of 6");
    expect(body).toContain('aria-label="Filter Team"');
    // Filtered on the server: only the Blue team, and the button to clear it.
    const players = body.slice(body.indexOf(">Players<"), body.indexOf(">Custom<"));
    expect(players).toContain("Bea");
    expect(players).not.toContain("Ciro");
    expect(body).toContain("Clear filters");
    expect(render(NewInputs, { props: { initialFilters: { team: "Blue" } } }).body).toBe(body);
  });
});

import AdminGaps from "../fixtures/AdminGaps.svelte";

describe("server rendering of Label, the Badge dot, Avatar attributes and Tabs without panels", () => {
  it("renders them the same every time, with no generated tabpanel", () => {
    const { body } = render(AdminGaps);
    expect(body).toContain('for="email"');
    expect(body).toContain("ta-badge-dot--pulse");
    expect(body).toContain('data-testid="ana"');
    expect(body).toContain('aria-controls="panel-posts"');
    expect(body).not.toContain("ta-tabs-panel");
    expect(render(AdminGaps).body).toBe(body);
  });
});

import Navigation from "../fixtures/Navigation.svelte";

describe("server rendering of BottomNav, NavMenu and the Sidebar extensions", () => {
  it("renders working markup with no JavaScript: links, a closed <details>, the breakpoint style", () => {
    const { body } = render(Navigation);
    // NavMenu: a native disclosure, closed, its links already in the HTML.
    expect(body).toMatch(/<details[^>]*class="ta-navmenu[^"]*"[^>]*name="site-menus"|<details[^>]*name="site-menus"[^>]*class="ta-navmenu/);
    expect(body).not.toMatch(/<details[^>]*\bopen\b/);
    expect(body).toContain('href="/genshin"');
    expect(body).toContain("Coming soon");
    // The wrapper's own icon component renders on the server.
    expect(body).toContain('class="site-icon');
    // BottomNav: links, the current one, and the media query for hideAbove.
    expect(body).toContain('aria-current="page"');
    expect(body).toContain("@media (min-width: 768px)");
    expect(body).toContain("ta-bottom-nav-spacer");
    // Sidebar: collapsed state from the prop (localStorage is only read in the browser).
    expect(body).not.toContain("ta-sidebar--collapsed");
    expect(render(Navigation).body).toBe(body);
  });

  it("renders the collapsed sidebar with its footer avatar", () => {
    const { body } = render(Navigation, { props: { collapsed: true, persistKey: "k" } });
    expect(body).toContain("ta-sidebar--collapsed");
    expect(body).toContain('data-testid="footer-avatar"');
    expect(body).toContain("ta-sidebar-pip");
  });
});

import BottomNavOnly from "$lib/components/bottom-nav.svelte";

describe("BottomNav publishes its height for the Toaster", () => {
  it("sets --ta-bottom-nav-offset only while it is shown", () => {
    const items = [{ id: "a", label: "A", href: "/" }];
    const narrow = render(BottomNavOnly, { props: { hideAbove: 767, items } }).body;
    expect(narrow).toContain("@media (max-width: 767px) { html { --ta-bottom-nav-offset:");
    const always = render(BottomNavOnly, { props: { items } }).body;
    expect(always).toContain("<style>html { --ta-bottom-nav-offset:");
  });
});

import Bi from "../fixtures/Bi.svelte";

describe("server rendering of the BI components", () => {
  it("renders charts, KPI and infographic pieces with their final values, the same every time", () => {
    const { body } = render(Bi);
    // Charts: the drawing and its text are already in the HTML.
    expect(body).toContain('aria-orientation="vertical"');
    expect(body).toContain("Fire");
    expect(body).toContain("40%");
    expect(body).toContain('role="meter"');
    expect(body).toContain('aria-valuetext="52.4%, Target 55%"');
    expect(body).toContain("40% of the previous step");
    expect(body).toContain('datetime="2026-11-03"');
    expect(body).toContain("Nov 3, 2026");
    expect(body).toContain('data-ta-span="full"');
    // BigNumber: the final figure, not the start of the count.
    expect(body).toContain("1.2M");
    expect(body).not.toContain("ta-bignumber-hidden");
    expect(render(Bi).body).toBe(body);
  });

  it("renders the empty states on the server", () => {
    const { body } = render(Bi, { props: { empty: true } });
    expect(body.match(/>No data</g)?.length).toBe(8);
  });
});

import Admin from "../fixtures/Admin.svelte";
import AdminTexts from "../fixtures/AdminTexts.svelte";

describe("server rendering of the admin building blocks", () => {
  it("renders the page header, filters, states, save bar, diff and lists, the same every time", () => {
    const { body } = render(Admin, { props: { query: { status: "pub", q: "tide" } } });
    expect(body).toContain("ta-page-header");
    // The applied filters are already in the HTML: the chip's value and the search text.
    expect(body).toContain('aria-label="Status: Published"');
    expect(body).toContain('value="tide"');
    expect(body).toContain("1 filter active");
    expect(body).toContain("All changes saved");
    expect(body).toMatch(/<del[^>]*>.*Hello/s);
    expect(body).toContain("<dl");
    expect(body).toContain('href="/posts/p1"');
    expect(body).toContain('aria-pressed="false"');
    // No floating panel, menu or sheet is rendered closed.
    expect(body).not.toContain('role="menu"');
    expect(body).not.toContain("Mobile navigation");
    expect(render(Admin, { props: { query: { status: "pub", q: "tide" } } }).body).toBe(body);
  });

  it("Kbd draws the non-Mac legend on the server unless the platform is fixed", () => {
    const { body } = render(Admin, { props: { platform: "auto" } });
    expect(body).toMatch(/data-testid="kbd"[^>]*>.*Ctrl/s);
    expect(body).not.toContain("⌘");
    expect(render(Admin, { props: { platform: "mac" } }).body).toContain("⌘");
  });

  it("the table renders its skeleton rows and its error state", () => {
    const loading = render(Admin, { props: { tableLoading: true, tableRows: [] } }).body;
    expect(loading).toContain("ta-datatable-loading");
    expect(loading).toContain('aria-busy="true"');
    const failed = render(Admin, { props: { tableError: "Could not load the posts" } }).body;
    expect(failed).toContain("Could not load the posts");
    expect(failed).toContain('role="alert"');
  });

  it("AppShell renders its landmarks and the skip link, with the labels of the request", () => {
    const { body } = render(AdminTexts, { props: { shell: true } });
    expect(body).toContain("<main");
    expect(body).toContain("Saltar al contenido");
    expect(body).toContain('aria-haspopup="dialog"');
    expect(render(AdminTexts, { props: { shell: true } }).body).toBe(body);
  });
});

import AgentUi from "../fixtures/AgentUi.svelte";

describe("server rendering of the agent-run components", () => {
  it("renders the run as given, whole and the same every time", () => {
    const { body } = render(AgentUi, { props: { running: true, streaming: true, onApprove: () => {}, onReject: () => {} } });
    expect(body).toContain("Thinking…");
    expect(body).toContain('aria-busy="true"');
    // The streamed text is whole on the server, and already split for screen readers.
    expect(body).toMatch(/ta-stream-word[^>]*>First /);
    expect(body).toContain("First sentence.");
    expect(body).toContain("5 tool calls, 2 messages");
    expect(body).toContain('role="progressbar"');
    expect(body).toContain("Approval requested");
    expect(body).toContain("High confidence");
    expect(body).toContain("ta-kpi-value");
    expect(render(AgentUi, { props: { running: true, streaming: true, onApprove: () => {}, onReject: () => {} } }).body).toBe(body);
  });

  it("renders a decided approval without its buttons", () => {
    const { body } = render(AgentUi, { props: { status: "approved", onApprove: () => {} } });
    expect(body).toContain("Approved by Ana");
    expect(body).not.toContain("ta-approval-actions");
  });
});

import Motion from "../fixtures/Motion.svelte";

describe("server rendering of the motion pieces, RadarChart and RollingCounter", () => {
  it("renders final states: content in place, the counter at its value, the radar drawn", () => {
    const { body } = render(Motion, { props: { value: 1249, total: 10 } });
    expect(body).toContain("Panel");
    // The sliding underline waits for the browser: the server draws each tab's own.
    expect(body).not.toContain("ta-tabs-indicator");
    expect(body).not.toContain("ta-tabs--sliding");
    expect(body).toContain("Players online: 1,249");
    expect(body).toContain("translateY(-90%)");
    expect(body).toContain('aria-label="Kaela against Oskar: Kaela, Oskar"');
    expect(body).toContain("ta-radar-area");
    expect(render(Motion, { props: { value: 1249, total: 10 } }).body).toBe(body);
  });

  it("the motion module imports and answers on the server without a document", async () => {
    const motion = await import("$lib/motion");
    expect(motion.prefersReducedMotion()).toBe(true);
    await motion.viewTransition(() => {});
  });
});

import Round3 from "../fixtures/Round3.svelte";

describe("server rendering of the flow chart, the calendar heatmap, the card stack and the date range", () => {
  it("renders them whole, the same every time", () => {
    const { body } = render(Round3);
    // The Sankey is laid out on the server at its default width.
    expect(body).toContain("ta-sankey-link");
    expect(body).toContain('aria-label="Signed up: 1,000 players. To: Tutorial 720 players, Left 280 players"');
    expect(body).toContain("Nov 2, 2026: 8 matches");
    expect(body).toContain('name="period_start"');
    expect(body).toContain('value="2026-11-03"');
    expect(body).toContain("1 of 3");
    expect(body).toContain("Ember Rush");
    // The check mark is in the HTML; the date range panel is not until it is opened.
    expect(body).toContain("ta-checkbox-mark");
    expect(body).not.toContain("ta-daterange-panel");
    expect(render(Round3).body).toBe(body);
  });
});
