<p align="center">
  <img src="assets/readme/hero.svg" width="100%" alt="tallao: a Svelte 5 UI kit for generative interfaces. Plain CSS on tokens, keyboard and screen reader ready, SSR-ready. Install with pnpm add github:tallao-ui/tallao. Components by family: actions and feedback (Button, Badge, Spinner, Alert, Progress, Skeleton, Toaster, CopyButton, Stat, Icon, Avatar), forms (Input, Textarea, Select, Checkbox, Label, Field, SearchInput, NumberInput, Slider, Switch, Toggle, ToggleGroup, RadioGroup, Rating, InputOTP, Combobox, KeyValueEditor, FileUpload, Calendar, DatePicker, SchemaForm, CodeEditor), overlays and menus (Dialog, Sheet, ConfirmDialog, Popover, Tooltip, DropdownMenu, ContextMenu, Command), navigation and layout (Card, Tabs, Accordion, Breadcrumb, Pagination, Sidebar, NavMenu, MegaMenu, BottomNav, SplitPane, Carousel, ThemeScope), data (Table, DataTable, BarChart, LineChart, MonthView, CompareSlider, SelectionBar, DragBoard, GameMap) and generative UI (PromptInput, ToolCallCard, ChatMessage, Steps, SuggestionChips, CodeBlock, Sources, UsageMeter).">
</p>

<p align="center">
  <a href="https://github.com/tallao-ui/tallao/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/tallao-ui/tallao/ci.yml?branch=main&label=CI"></a>
  <img alt="Version 0.7.0" src="https://img.shields.io/badge/version-0.7.0-orange">
  <img alt="Svelte 5.29 or later" src="https://img.shields.io/badge/svelte-%E2%89%A55.29-ff3e00">
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue"></a>
</p>

# tallao ⛏️

A **Svelte 5** UI kit for generative interfaces, extracted from the Kitsuden admin and
decoupled from Tailwind, stores and APIs. Plain CSS on top of tokens, accessible by keyboard
and screen reader, and SSR-ready (SvelteKit).

## Install and first use

As a package (it builds on install through `prepare`):

```bash
pnpm add github:tallao-ui/tallao
```

```svelte
<script>
  import "tallao/tokens.css";
  import "tallao/base.css";
  import { Button, Dialog, DropdownMenu, MenuItem } from "tallao";
</script>
```

The map lives apart because it pulls in Leaflet: `import { GameMap } from "tallao/map"`
(install `leaflet` and `sveaflet`). So does the code editor, because of CodeMirror:
`import { CodeEditor } from "tallao/code"` (install `@codemirror/state`, `view`,
`commands`, `language`, `@lezer/highlight` and the `lang-*` package for each language).

You can also **copy** a component into your project, as with shadcn: copy
`src/lib/components/<component>.svelte`, the components it imports, `src/lib/internal/`,
`src/lib/utils.ts` and the two CSS files.

Requires Svelte 5.29 or later.

## Components

| Component | What it is |
|---|---|
| Button | 7 variants (including `soft`, tinted with the accent, and `danger-ghost`, the quiet destructive action: red text, no fill) × 4 sizes, `loading`, `href`; passes any attribute and attachment to the element |
| Badge | 9 variants (including `accent` and `accent-2`, the second accent) × 2 sizes; `tone="solid"` fills with the colour and uses contrasting text ("LIVE" over an image); `dot` adds a leading status dot in the variant's colour and `pulse` makes it pulse (live, running; still under reduced motion); passes any attribute to the `<span>` |
| Spinner | a standalone loading indicator: `role="status"` with hidden text (`label`, by default the kit's "Loading" text), `size` sm / md / lg or in pixels, text colour; with reduced motion it pulses instead of spinning |
| Input · Textarea · Select · Checkbox | native controls styled with the kit's tokens (for a number bound as `number \| null`, use NumberInput) |
| Label | a standalone `<label>`: `for`, `required` (a visible "*" plus a hidden "Required" for screen readers), `disabled` styling; passes any attribute |
| Field | label + control + error, required marker |
| Card | container + header / title (`level`) / content / footer |
| Table | scrolling container + header / body / row / head / cell (`colspan`); `density="compact"` (less padding and smaller text, headers without uppercase) and `stickyFirstColumn` (first column fixed while scrolling, background from `--ta-table-sticky-bg`) for matrices with many columns; every part passes any attribute to its element |
| Tabs | accessible tablist: arrows, Home and End, counter, stable ids in SSR; `panels={false}` renders only the tablist, with `controls` (and `tabId`) per tab pointing at the panels the page renders |
| Alert | 4 variants, title, close |
| Stat | figure + label |
| SearchInput | search field with a magnifier and a clear button (Escape clears too); always has an accessible name |
| Slider | a value between two bounds on a native `<input type="range">`: label with the value, `valueText` for screen readers, marks under the track |
| Toggle · ToggleGroup | pressable buttons (`aria-pressed`): a single one, or a named group with single or multiple selection and `name` for forms; as pills, segmented or frameless (`variant="bare"`, for icon-only facets: a ring when pressed and the others dimmed), tinted or solid when pressed; each option with its own `ariaLabel`, `title`, `color` (`--ta-toggle-accent`), `class` and `style` |
| NumberInput | a real number (`bind:value` is `number \| null`, null when empty), with optional − / + buttons that respect `min`, `max` and `step`; clamps to the bounds on blur |
| InputOTP | a one-time code field: `length` slots over one real `<input>` (`autocomplete="one-time-code"`, so SMS autofill and pasting fill it at once), digits or alphanumeric, `groupSize` separator, `oncomplete`, `invalid`, `name` for forms; a screen reader hears one named field and "Digit 2 of 6" |
| Rating | star rating on native radios: named group, arrows, `name` for forms; `readonly` to display a score |
| Carousel | a row of cards with scroll-snap (APG "carousel" pattern): Previous / Next disabled at the ends, ← → Home End with the focus inside, "3 of 8" on each slide; `autoplay` that pauses on hover, on focus, in a hidden tab or with reduced motion, with a button to stop it |
| CompareSlider | before / after with a draggable divider: `role="slider"` with arrows, PageUp/PageDown and Home/End, pointer capture on the box, images that cannot be dragged; `bind:value` 0–100 |
| Switch | a switch (`role="switch"`) for settings that apply immediately |
| RadioGroup | native radios in a `<fieldset>` with its `<legend>`; a description per option |
| Dialog | native `<dialog>` with `showModal()`: contained focus, Escape closes only the top one, locked scroll, focus restored; centred or attached to an edge |
| Sheet | a modal side panel (a Dialog attached to an edge) |
| ConfirmDialog | built on Dialog; async `onConfirm`, stays open if it fails |
| Toaster · `toast()` | short-lived notifications in an `aria-live` region; the countdown pauses on hover or focus; optional action |
| Command | a command palette (Ctrl+K / ⌘K) with groups, keywords and shortcuts; or a search box with results from the page (`filter={false}`, `bind:query`, `loading`), results that are links (`href`) with `description` and `badge`, the snippets `empty`, `leading` and `trailing`, and `inline` (no dialog, inside the page's own overlay) |
| ContextMenu | a right-click menu (or the Menu key / Shift+F10) built from the DropdownMenu parts |
| Accordion | collapsible sections on native `<details>`; `single` makes them exclusive |
| Progress | a bar with a value, or indeterminate |
| Skeleton | a loading placeholder (rectangle, circle or text lines) |
| Avatar | a photo with fallback initials (`initials={1}` for one letter), a stable colour per name, a badge; an explicit `aria-label` replaces the name and other attributes go to the root |
| SelectionBar | "select all" (with a partial state) and bulk actions that appear when something is selected |
| KeyValueEditor | an editable list of key → value pairs; free keys or keys from a list, text or number values |
| CopyButton | copies a text to the clipboard and announces it |
| DragBoard · DropZone · DragItem | drag between zones with the mouse **and the keyboard** (Space picks up, arrows move, Space drops, Escape cancels), with screen-reader announcements |
| ChatMessage | a message in a conversation (user, assistant or system), with a "typing" state |
| DataTable | a data table: sorting by column (`aria-sort`), pagination, selection with "select all", loading; an optional filter row (per column `filter`: `"text"` ignoring case and accents, `"select"`, `"range"` or your own snippet; AND together, back to page 1 on change, `bind:filters`, "Clear filters"); in the browser or against the API (`manual`, which hands over the filters with `onFiltersChange`); for an admin list: `rowHref` (the first cell is a real link), a pinned `rowActions` column, `density` and `visibleColumns` (bindable) with a toolbar toggle and a column menu, skeleton rows while `loading`, and `empty` / `errorState` snippets that default to EmptyState (`error`, `onRetry`) |
| AppShell | the frame of an application: a `sidebar` column, a top bar (`breadcrumb`, `command`, `user` and `topbar` snippets) and the page; below `breakpoint` the sidebar moves into a modal sheet behind a menu button (CSS media query, so it renders right on the server); `<header>` / `<main>` and a skip link unless `landmarks={false}` |
| PageHeader | the top of every page at one height: `breadcrumb`, title as a heading (`level`), `status` badge, `meta` line, description, right-aligned `actions` that drop under the title when the header is narrow, and `tabs` on its bottom rule |
| FilterBar · FilterChip | the filters of a list from a declaration (`select`, `boolean`, `date`, `text`): a search field, a chip per filter that opens a menu, a text field or a calendar, an "Add filter" menu for hidden filters, "Clear all", and the count announced politely; `bind:value` is a plain object (`filtersToQuery` / `filtersFromQuery` for the URL) |
| SavedViews | a menu of named views (`{ name, query }`): choose one, save the current query, rename or delete the active one; storage is the caller's, every change is an event |
| EmptyState | "nothing yet" (icon, title, text, primary action), `variant="no-results"` (Clear filters, a polite status) and `variant="error"` (message and Retry, an alert); what DataTable shows by default |
| SaveBar | a form's sticky footer: the state in words and a shape ("Unsaved changes", "Saving…", an error) in a polite live region, Cancel, secondary submit actions and Save; submits a `<form>` without JavaScript and never covers the last field |
| DiffView | before and after of a record as a list of field changes: added / removed / changed by sign, word and `<ins>` / `<del>`, text that wraps, indented JSON, long values folded; `compact` for one line per change; `redacted` for a secret that changed, its values hidden |
| DescriptionList | a record's label / value pairs as a `<dl>`: copyable values, links, monospace, your own `value` snippet; side by side or stacked by its own width, or in `columns` |
| Kbd | a keyboard shortcut hint (`<kbd>` per key); `Mod` is ⌘ on Apple devices and Ctrl elsewhere, with the key names for screen readers |
| Pagination | Previous / numbers with "…" / Next, `aria-current="page"` |
| Calendar · DatePicker | pick a day with the keyboard (APG pattern), ISO dates, `min`/`max`, localized names; the DatePicker can also be typed into |
| DateRangePicker | two dates typed (ISO) or picked: quick ranges ("Last 7 days") and a Calendar per end in a non-modal panel; the fields are real inputs submitted as `<name>_start` / `<name>_end`, so a form filters without JavaScript; `inline` shows only the panel (FilterChip uses it for a `date` filter with `range`) |
| MonthView | a month to look at (agenda, events): the `day` snippet with what goes in each day (`date`, `day`, `weekday`, `today`, `outside`), ‹ › and PageUp/PageDown (Shift: year) to change month, `bind:month`, today with `aria-current="date"`; unlike Calendar, a day's content can hold links and buttons |
| FileUpload | choose or drop files on a real `<input type="file">`; `accept`, `maxSize`, `maxFiles`, with the reason for each rejection |
| Breadcrumb | a navigation trail in `<nav>` + `<ol>`; the last item is `aria-current="page"` |
| Icon | the kit's own icons by name (`check`, `search`, `bot`…) or your own drawing; decorative unless it has a `label` |
| Sidebar | side navigation with groups, badges and expandable branches; marks the current page and opens its branch; collapses to icons with a Tooltip per item; your own icons (`icon` snippet), tinted and pulsing badges, `persistKey` to remember the collapsed state, a `footer(collapsed)` for the current user |
| NavMenu | a disclosure menu for a site header: a trigger opens a panel of grouped links (icon, label, one-line description, badge, "coming soon" entries) in 1–3 columns; native `<details>`, so it works with no JavaScript; with JavaScript, Escape and a click outside close it and the panel stays inside the viewport |
| MegaMenu | a wide header menu: a featured tile (art, title, one line and a call to action) next to columns of grouped links with an icon, label and one-line description, and an optional footer link; same contract as NavMenu (native `<details>`, works with no JavaScript, opens on click or tap, never on hover), a list of links rather than an ARIA `menu` |
| BottomNav | a mobile tab bar fixed to the bottom, above the safe area: up to 5 links with icon and visible label, the current one marked, badges, an optional raised central `action`; `hideAbove` keeps desktop untouched; works with no JavaScript |
| SplitPane | two panes with an accessible separator (APG "window splitter" pattern): arrows, Home/End, Enter collapses |
| BarChart · LineChart | bar and line charts with the kit's series colours: a legend with two or more series, a tooltip on hover **or when stepping through with the keyboard**, a table with all the data, a labelled empty state. BarChart: grouped or `stacked`, columns or `orientation="horizontal"`. LineChart: `area`, `stacked` areas, `domain` for a scale that does not start at zero. `hideTitle` inside a ChartCard |
| DonutChart | parts of a whole as a ring, or a pie with `innerRadius={0}`: the total in the centre, a legend with every label, value and percentage in text, the slices past `maxSlices` grouped into "Other" |
| ScatterChart | two measures against each other, one point per item; a colour **and a shape** per `group`, reference lines (`xRef`, `yRef`), optional point labels, arrows step through the points, a table with all the data |
| Heatmap | a matrix shaded by value, as a real `<table>` with row and column headers and the value printed in every cell; scrolls sideways in a focusable region with the row headers fixed; a scale under it |
| Funnel | steps of a sequence as an ordered list: value, share of the first step and share of the previous one in text, bars centred or left-aligned |
| BarList | a ranking ("top 10"): label, bar and value per row, numbered with `ranked`, links with `href`, `limit` |
| Sparkline | a trend the size of a word (line, area or columns), an image named with the trend in words |
| KpiCard | a headline figure: value and unit, the change with its direction (▲ ▼) and its meaning (`goodWhen="down"` when falling is good; good and bad differ by shape and are spelled out for screen readers), an optional sparkline and progress to a `target` |
| Gauge | a value inside a range as a half dial or a ring (`role="meter"`), with an optional `target` tick |
| BigNumber · IconArray · Timeline · ComparisonBar | infographic pieces: a headline figure that counts up when it scrolls into view (the server renders the final value; no count under reduced motion), a unit chart ("7 of 10", filled against hollow marks), dated events with `<time>`, and two values against each other on one split bar |
| DashboardGrid · DashboardItem · ChartCard | a dashboard layout that answers to its container's width (4 → 2 → 1 columns, `span` per item), and the frame of a chart: title, description, `toolbar` snippet, note and source |
| RadarChart | several measures on one shape (a character's stats), for one item or up to four compared; series differ by colour, point shape and line style; same contract as the other charts (legend, empty state, "Show data" table) |
| SankeyChart | where a quantity comes from and where it goes: nodes in columns joined by ribbons as thick as the flow, laid out without a library (columns by longest path, order by the barycentre heuristic, proportional heights); names and totals in text, a node's flows highlighted on hover or focus, the "Show data" table; readable for about 5–25 nodes |
| CalendarHeatmap | activity by day as a calendar: weeks as columns, weekdays as rows, months named over their weeks, a shade per day; a real table whose cells say the date and the value, in a scrolling region with the weekdays fixed |
| CardStack | a deck looked at one card at a time: flick the top card away with the pointer, or use the buttons and ← → Home End; the position is announced, the cards behind are inert |
| RollingCounter | a number whose digits roll, each on its own wheel, to the new value; the server renders the final value and screen readers get plain text |
| ChartLegend | the legend the charts draw, on its own: mark, label and value per entry |
| SchemaForm | a form built from a JSON Schema: validates on submit, focuses the first error, works as the `<form>` of a SvelteKit action |
| Popover | a non-modal panel anchored to its trigger |
| Tooltip | a description on hover or focus; Escape hides it (WCAG 1.4.13) |
| DropdownMenu · MenuItem · MenuSeparator · MenuLabel | an action menu: arrows, Home/End, type-ahead by letter; a MenuItem with `checked` is a `menuitemcheckbox` (or a radio with `checkType="radio"`) |
| Combobox | a field with a filterable list (ARIA 1.2, `aria-activedescendant`), ignoring case and accents |
| ThemeScope | tokens on a container: Shadow DOM and a bridge to `--kitsuden-*` |
| PromptInput · ToolCallCard | chat input, and a tool call with approve / reject |
| Thinking | a model's reasoning as one quiet line: a soft shimmer, a live `summary` and the elapsed time while `running`, "Thought for 12 s" when done, and the trace (`steps`, content) behind a disclosure; the end is announced once |
| StreamingText | an answer drawn as it arrives (`text` that grows, or an async iterable in `stream`): new words fade in, a caret follows, no layout jump; screen readers get it sentence by sentence from a hidden live region, never from the start again |
| ToolChips | a run of tool calls as compact chips (icon, verb, target, `+74 −41` for files) under a "4 tool calls, 2 messages" disclosure; a chip with a tool `name` unfolds a ToolCallCard |
| TaskList | live task rows: pending, running (a progress ring with a count), done, failed, each one a disclosure of its details; `variant="capsule"` is one pill with the overall progress that unfolds the list |
| ApprovalCard | a human-in-the-loop request: who asks, what will happen, the field changes (DiffView) or the call and its arguments, a risk note in words, and Reject / Edit first / Approve with async busy states, Mod+Enter and Mod+Backspace while focus is in the card, and an outcome line once decided |
| ContextCards | what the model was given (files, records, links) as small cards with a type icon, a note and a remove button that hands the focus on |
| RecommendationCard · InsightCard | a suggestion with its reasons, a confidence in bars and words and one primary action; and something noticed in the data: a sentence, the figure with its change and sparkline (a KpiCard without its frame) and a link |
| Steps · SuggestionChips · CodeBlock · Sources · UsageMeter | an agent's plan step by step, single-use suggestions, code with a copy button, cited sources and quota usage |
| GameMap (`tallao/map`) | Leaflet with the kit's theme |
| CodeEditor (`tallao/code`) | CodeMirror 6 with the kit's theme (Markdown, JSON, JS/TS); before it loads, and without JavaScript, it is a `<textarea>` submitted with the form |

## Motion

`tallao/motion` is a small transition library on the kit's motion tokens
(`--ta-duration-fast | base | slow`, `--ta-ease-out | in-out | spring` in `tokens.css`):

```svelte
<script>
  import { rise, collapse, stagger, press, shake } from "tallao/motion";
</script>

{#each items as item, i (item.id)}<li in:rise={stagger(i)}>{item.title}</li>{/each}
{#if open}<div transition:collapse>…</div>{/if}
<button {@attach press()} onclick={() => valid || shake(field)}>Save</button>
```

| Kind | What there is |
| --- | --- |
| Svelte transitions | `fade`, `rise`, `scaleIn` (overlays), `slide` (sheets), `collapse` (height auto), `stagger(i)` for a list, `crossfade()` for an item that changes place |
| Attachments | `press()`, `shimmer()`, `drawCheck()` (a stroke that draws itself), `rollNumber(value)`, `tabIndicator(active)` |
| Functions | `shake(node)`, `viewTransition(update)`, `prefersReducedMotion()` |

Everything is 120–240 ms, on opacity and transform, interruptible and safe to import on the
server. Reduced motion is one switch: the system setting, or `data-tallao-motion="reduce"` on
`<html>` (an app setting; `"full"` overrides the system). The tokens drop to no duration, the
library stops moving, and the kit's own components (dialogs, sheets, menus, toasts, the Tabs
underline, the Accordion, new DataTable rows) follow.

## How an app uses it

<p align="center">
  <img src="assets/readme/how-it-is-used.svg" width="100%" alt="How an app uses tallao. The package exports tallao (components, toast, setLabels), tallao/map (GameMap, with leaflet and sveaflet), tallao/code (CodeEditor, with CodeMirror 6), tallao/tokens.css (every --ta-* variable) and tallao/base.css. An app installs it with pnpm add github:tallao-ui/tallao, or copies a component with internal/, utils.ts and the two CSS files. It needs Svelte 5.29 or later. It runs in SvelteKit (server rendering and hydration, stable ids from $props.id(), controls that submit with name), in Astro islands (setDefaultLabels; NavMenu and BottomNav need no hydration) and in Kitsuden kon views (custom elements in a Shadow DOM, wrapped in ThemeScope, which maps --kitsuden-* to --ta-*).">
</p>

The sections below explain each path in the diagram: texts, server-rendered navigation, the
floating layer, SvelteKit, touch, Shadow DOM and themes.

## Language of the texts

The texts the kit adds on its own (close buttons, "no results", tool call states…) are in
English by default; Spanish is included. For the whole application, in the root component:

```svelte
<script>
  import { setLabels, es } from "tallao";
  setLabels(es); // or setLabels({ ...es, close: "Salir" })
</script>
```

An explicit prop (`closeLabel`, `emptyText`, ToolCallCard's `labels`…) takes precedence over this.

If there is no common root component (Astro islands: each one is its own root),
`setDefaultLabels(es)` changes the kit's starting texts everywhere, without context. It is module
state: on the server every request shares it, so with several languages call it only in the
browser.

### Triggers

Popover, Tooltip and DropdownMenu take their trigger as a snippet, with the props it must carry
(`aria-*`, events and the element reference):

```svelte
<DropdownMenu label="Project actions">
  {#snippet trigger(props)}<Button {...props}>Actions</Button>{/snippet}
  <MenuItem onSelect={edit}>Edit</MenuItem>
  <MenuSeparator />
  <MenuItem variant="danger" onSelect={remove}>Delete</MenuItem>
</DropdownMenu>
```

## Navigation on server-rendered sites

NavMenu and BottomNav are plain markup that works without hydration: render them from an Astro
page with no `client:` directive. Snippets (your own icon set) cannot come from Astro, so put
them in a small Svelte wrapper and render that:

```svelte
<!-- GamesMenu.svelte -->
<script>
  import { NavMenu } from "tallao";
  import { Gamepad2 } from "lucide-svelte";
  let { groups } = $props();
</script>

<NavMenu label="Games" {groups}>
  {#snippet icon(item)}<Gamepad2 size={18} />{/snippet}
</NavMenu>
```

NavMenu is a `<details>`: without JavaScript it opens and closes with its trigger only (Escape
and a click outside need hydration), and `align="end"` keeps a menu at the right end of a
header inside the screen. BottomNav leaves a spacer of its own height where it is rendered; to
pad the page yourself, use `padding-bottom: calc(var(--ta-bottom-nav-height) +
env(safe-area-inset-bottom))` and `spacer={false}`.

## The floating layer

Popover, Tooltip, DropdownMenu and Combobox share `src/lib/internal/`:

- **The browser's top layer** (Popover API, `popover="manual"`): the panel sits above any
  `z-index` or `overflow: hidden` without moving in the DOM, so it inherits the tokens and works
  inside a Shadow DOM.
- **Positioning** with [Floating UI](https://floating-ui.com): it flips and shifts at the edges,
  and repositions on scroll or resize.
- **A layer stack**: Escape closes only the top layer (and not the `<dialog>` that contains it);
  a click outside closes the layers that do not contain it.

## SvelteKit

tallao works in SvelteKit as is (tested with SvelteKit 3; SvelteKit 2 consumes the same format
but is not tested): it is published with `svelte-package`, so SvelteKit compiles the components
for the server and for the browser. Ids come from `$props.id()` (the same on both sides),
nothing touches `window` on import, the `setLabels` texts travel through context (per request)
and `toast()` does nothing on the server (there the module is a single one for all requests).

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import "tallao/tokens.css";
  import "tallao/base.css";
  import { Toaster } from "tallao";
  let { children } = $props();
</script>

{@render children()}
<Toaster />
```

**SvelteKit forms.** With `name`, each control is submitted in a `<form method="POST">` like a
native one, also without JavaScript: Switch (like a checkbox), Combobox (one or several values),
KeyValueEditor (`name[key]`), DatePicker (ISO), FileUpload (the files, dropped ones included)
and CodeEditor.

SchemaForm is the `<form>` itself: with `name`, its fields are submitted as `name.field`, and an
invalid submission stops before `enhance` sends it.

```svelte
<script>
  import { enhance } from "$app/forms";
  import { fromAction } from "svelte/attachments";
  import { SchemaForm } from "tallao";
</script>

<SchemaForm {schema} name="post" method="POST" {@attach fromAction(enhance)} />
```

`kit-check/` is a SvelteKit 3 app that uses the package like any project and tests it in CI: the
prerender comes out complete and with no state shared between pages (`check-prerender.mjs`), and
in Chromium hydration gives no mismatches, the server ids are the ones that stay and everything
responds afterwards (`tests/hydration.spec.ts`).

```bash
pnpm kit:check
```

## Touch and phones

Every control the kit draws has a 44px touch target under `@media (pointer: coarse)`: either
the control grows (fields, list items, buttons) or, where growing would change the drawing
(an alert's ×, a chip, a copy button, a "show data" toggle), an absolutely positioned `::after`
widens only the hit area. Fields switch to 16px text so iOS does not zoom on focus.
`tests/dom/touch-targets.test.ts` compiles every component that renders its own control and
fails if its CSS has no such rule, so a new component cannot ship without one.

On phones, Dialog (and Sheet, Command, ConfirmDialog) uses `dvh` heights, less padding and a
footer that wraps; floating lists (Combobox, DropdownMenu, ContextMenu) flip, shift and cap
their height at the room left on screen, so they stay usable with the on-screen keyboard
open; the Toaster keeps clear of the safe areas and of a BottomNav, which publishes
`--ta-bottom-nav-offset` while it is shown.

## Inside a Shadow DOM

`tokens.css` defines the tokens on `:root`, which does not reach inside a Shadow DOM. Wrap the
view in `<ThemeScope>`: with `source="kitsuden"` (the default) each `--ta-*` takes the
`--kitsuden-*` variable from the Kitsuden admin, which does cross through inheritance; with
`source="tallao"` it uses the kit's own values. This is how kon views (custom elements) are
built with tallao.

## Themes

Every colour is a `--ta-*` variable in `tokens.css`. Dark theme by default;
`data-tallao-theme="light"` on `<html>` switches to light. Change a variable and the whole kit
is re-themed.

## For AI agents

[AGENTS.md](AGENTS.md) is the guide for coding agents, both those changing the kit and those
building an app with it: entry points, the component map by family, the conventions the code
follows (runes, tokens, labels, SSR, 44px touch targets), commands, tests and the rules a change
must keep. Claude Code reads it through [CLAUDE.md](CLAUDE.md).

- [`.claude/settings.json`](.claude/settings.json): shared permissions. The check, test and build
  scripts and read-only git are allowed; reading `.env` files, `git push` and publishing are denied.
- [`.claude/skills/`](.claude/skills): [`new-component`](.claude/skills/new-component/SKILL.md),
  [`fix-component`](.claude/skills/fix-component/SKILL.md) and
  [`release-check`](.claude/skills/release-check/SKILL.md), plain Markdown any agent can follow.

## Development and tests

```bash
pnpm test      # vitest: behaviour, keyboard and axe (jsdom) + server rendering (Node)
pnpm check     # svelte-check
pnpm package   # builds the package into dist/ and checks it with publint
pnpm dev       # the demo
```

CI (`.github/workflows/ci.yml`) runs `check`, `test`, `package` and `build:demo` (the demo's
production build), then `kit-check/` (the same as `pnpm kit:check`), on every push to `main` and
every pull request. Setup, what each test enforces and how to add a
component are in [CONTRIBUTING.md](CONTRIBUTING.md).

## Contributing, security and licence

- [CONTRIBUTING.md](CONTRIBUTING.md): setup, commands, adding a component and the pull request
  checklist. Open an issue first for a new component (there is a template).
- [SECURITY.md](SECURITY.md): report vulnerabilities privately through
  [GitHub private vulnerability reporting](https://github.com/tallao-ui/tallao/security/advisories/new),
  not in public issues.
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
- [CHANGELOG.md](CHANGELOG.md): every prop, text and class change by version.

[MIT](LICENSE).
