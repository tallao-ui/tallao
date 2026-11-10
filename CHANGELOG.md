# Changelog

## Unreleased

**Contrast of filled controls.** The accent and the danger tone are light enough to read as
text on a dark surface, which left them too light under white text: the primary Button measured
3.96:1 and the danger Button 3.59:1 inside the Kitsuden admin (WCAG 1.4.3 asks for 4.5:1), and
the primary hover was lighter still. A fill is now the same hue darkened until its text reaches
4.5:1, and hover darkens instead of lightening. It applies to Button `primary` and `danger`,
Badge `accent` with `tone="solid"`, pill Tabs, the solid Toggle and ToggleGroup, the current
page in Pagination, the selected day in Calendar, today in MonthView, the Avatar badge and the
BottomNav action. Override with `--ta-accent-fill`, `--ta-accent-fill-hover`, `--ta-danger-fill`,
`--ta-danger-fill-hover` (colours, not channels) and `--ta-on-danger-fill` (channels). The soft
Button reads its text colour from `--ta-accent-text` when a theme defines it.

What the site islands (Valhalla, TodoGachas, Cardback, Cozy) needed when they moved from Vue to tallao,
plus the first components for generative interfaces.

- **Slider**, **SearchInput**, **Toggle**, **ToggleGroup**, **NumberInput** and **Rating**.
- **Carousel** (replaces the sites' hand-made carousel): a scroll-snap row following the APG
  "carousel" pattern, slides from `items` + the `slide` snippet, Previous / Next disabled at
  the ends (the focus moves to the other button), ← → Home End with the focus inside, and
  `autoplay` that wraps back to the start, pauses on hover, on focus or in a hidden tab, does not
  start under `prefers-reduced-motion` and has a button to stop it.
- **CompareSlider** (replaces the sites' ComparisonSlider): before / after with
  `role="slider"`, arrows in steps of 2, PageUp/PageDown, Home/End and dragging with the pointer
  captured on the box; the images get `draggable="false"`, `dragstart` is cancelled and
  `pointercancel` ends the drag (a native image drag killed the capture after one step).
- **Steps**: an agent's plan, step by step, as an ordered list named by `label` (default text
  `planSteps`). `steps` is a list of `Step` objects, each with a `title`, an optional
  `description` and a `status` (`StepStatus`: `pending`, `running`, `done`, `failed`,
  `skipped`); every status has its own icon, colour and visible text, so colour is never the
  only cue, and the running step shows a Spinner and gets `aria-current="step"`. `labels`
  overrides the status texts; `orientation="horizontal"` turns it into a row that scrolls on
  narrow screens.
- **SuggestionChips**: a row of follow-up suggestions above a PromptInput, in a named
  `role="group"` (default text `suggestions`). `suggestions` lists them and `onSelect(text)`
  receives the chosen one; with `singleUse` (on by default) a chip disappears once used, so a
  suggestion is never sent twice, and nothing is rendered when none is left. ArrowLeft and
  ArrowRight move between chips and wrap around; `disabled` turns them all off.
- **CodeBlock**: read-only code (model output, README snippets, commands) in a `<figure>`, with
  a header holding the optional `fileName`, the `language` tag and a copy button, and a
  monospaced `<pre><code>` body that scrolls (`maxHeight`, default `24rem`) or wraps (`wrap`).
  No syntax highlighting on purpose (CodeEditor is the one for editing). Copying uses
  `navigator.clipboard.writeText` and shows `copiedLabel` with a check for 1.5 s; `copyLabel`
  and `copiedLabel` default to the texts `copy` and `copied`.
- **Sources**: the sources an answer cites (RAG), as a named list (default text `sources`) of
  link cards that open in a new tab with `rel="noopener noreferrer"`. `sources` is a list of
  `Source` objects with `url`, `title` and optional `domain` and `favicon`; the domain falls back
  to the URL without "www.", and without a favicon the card shows the domain's initial in a
  stable colour. `compact` turns the cards into inline pills that hide the title visually but
  keep it for screen readers. An empty list renders nothing.
- **UsageMeter**: how much of a quota is used. A label (default text `usage`), "used / max unit"
  in whole numbers formatted for the locale and an optional cost, above a native `<meter>` with
  `aria-label` and its low/high set at the threshold. Props `used`, `max` (as in Progress), `unit`
  (default `tokens`), `cost`, `warnAt` (warning from this percentage, default 80; full at 100 %)
  and `compact` (numbers only, no meter); the count takes the warning or danger colour with the bar.
- **InputOTP**: a one-time code field (SMS, e-mail, 2FA) drawn as `length` slots (default 6),
  with `bind:value`, `pattern` (`"digits"` by default, or `"alphanumeric"`), `oncomplete(value)`
  once the last slot is filled, `groupSize` (a visual separator every n slots), `disabled`,
  `invalid` (`aria-invalid` and red slots), `required`, `name`, `autocomplete` (default
  `one-time-code`), `inputmode` (`numeric` for digits, `text` otherwise), `label` (default text
  `oneTimeCode`) and `bind:ref`. One real `<input>` sits under the slots rather than one input per
  slot: SMS autofill and password managers fill a single field, a screen reader meets one named
  text field described by its position ("Digit 2 of 6", text `otpDigit`) instead of six boxes,
  and without JavaScript it is still a plain field submitted with `name`. Typing fills a slot
  and moves on (typing past the end is ignored), Backspace and Delete delete, ← → Home End move
  between slots, a click on a slot puts the caret there, and a pasted code keeps only the
  allowed characters, so "123-456" fills every slot. Slots are 44px+ under `pointer: coarse`.
- **DataTable column filters**: a column with `filter` gets a control in a second header row:
  `"text"` (contains, ignoring case and accents, like Combobox), `"select"` (the column's
  distinct values or `filterOptions`, plus "All"), `"range"` (minimum and maximum for numbers,
  both optional) or a snippet given `{ column, value, set, label }` that matches with
  `filterFn(row, value)` (which can also replace the built-in matching). Filters combine with
  AND and with the sorting; a change from a control goes back to page 1 (and calls
  `onPageChange(1)`). `bind:filters` holds the state (`DataFilters`: by column key, a string or a
  `DataRange` `{ min, max }`), so a page can read it or keep it in the URL; a "Clear filters"
  button (and the instance function `clearFilters()`) empties it, and `noMatchesText` replaces
  `emptyText` while filters leave no rows. With `manual` nothing is filtered locally:
  `onFiltersChange(filters)` hands the state to whoever asks the API. Tables without `filter`
  render as before.
- Touch and phones across the kit: a 44px target under `pointer: coarse` for the controls of
  Alert, BarChart, LineChart, CodeBlock, CopyButton, Dialog, DragItem, FileUpload, MonthView,
  PromptInput, Rating, SelectionBar, Sources, SplitPane, SuggestionChips, Textarea, Toaster,
  ToolCallCard, BottomNav, Command, GameMap (zoom buttons) and CodeEditor (16px text). Small
  controls keep their drawing and widen their hit area with an absolutely positioned
  `::after`. Dialog uses `dvh`, tighter padding and a wrapping footer under 480px, and a 44px
  close button; DropdownMenu and ContextMenu use `dvh`; the positioning publishes
  `--ta-available-height`, which caps Combobox and menu lists so they fit above the on-screen
  keyboard; Command's list uses `dvh`. The Toaster keeps clear of the safe areas and stacks
  above a BottomNav, which sets `--ta-bottom-nav-offset` on the page while it is shown. A new
  test fails for any component that draws a control without a coarse-pointer rule.
- **BottomNav**: a mobile tab bar fixed to the bottom, above `env(safe-area-inset-bottom)`. A
  `<nav>` (`ariaLabel`, default text `navigation`) of links with an icon and an always-visible
  label; items `{ id, label, href?, icon?, badge?, current?, onclick? }` (`icon` is a kit icon
  name or a snippet; an item without `href` is a button). The current item (`current` matching
  an id or href, or `current: true`) gets `aria-current="page"` and the accent colour with a
  pill behind its icon; a badge sits on the icon and is read with the label ("News (3)").
  `hideAbove` (px) shows it only up to that width through a media query of its own; `action`
  is a raised central button between the two halves; `icon` draws every icon with your own set.
  A spacer of its height stays in the flow (`spacer={false}` to drop it), and the new token
  `--ta-bottom-nav-height` (3.75rem) lets a page pad itself. More than 5 items logs a warning.
  Works rendered on the server with no hydration.
- **NavMenu**: a disclosure menu of grouped links for a site header (a list of links, not an
  ARIA menu), built on `<details>`/`<summary>` so it works with no JavaScript and the panel is
  anchored by CSS in every browser; closed, the panel takes no space. Props `label`, `groups`
  (`{ label?, items }`; items `{ label, href?, description?, icon?, badge?, soon?, current? }`),
  `bind:open`, `columns` (1, 2, 3 or `"auto"`), `align` (`"start"` or `"end"`), `name`
  (several menus with one name are exclusive), `soonLabel` (default text `comingSoon`), and the
  snippets `trigger`, `icon(item)` and `item(item)`. Once hydrated, Escape closes it and gives
  the focus back, a click outside closes it, and a panel that would overflow flips to the end
  edge. Opens on click or tap only.
- Sidebar: items take `icon` as a snippet too, and the new `icon` prop draws every item's icon
  with your own set; `badgeVariant`, `badgeDot` and `badgePulse` per item (collapsed, a badge
  becomes a dot on the icon); `persistKey` remembers `collapsed` in localStorage (read after
  mount, errors ignored); collapsed items show their label in a Tooltip (`tooltips={false}`
  for the former `title`); `footer` gets `collapsed`, to show only an avatar then. Touch
  targets of 44px under `pointer: coarse`.
- **Label**: a standalone `<label>` for controls outside a Field. Props `for`, `required` (a
  visible "*" hidden from screen readers plus a visually hidden "(Required)" from the `required`
  text, overridable with `requiredLabel`), `disabled` (dimmed), `class`; any other attribute goes
  to the `<label>`. Field is unchanged.
- Badge `dot` (a leading dot in the variant's colour, for statuses) and `pulse` (the dot pulses
  for something live or running; implies `dot`; no animation under `prefers-reduced-motion`).
- Avatar passes any other attribute (`data-testid`, `title`…) to its root; an explicit
  `aria-label` replaces `name` as the accessible name; `initials={1}` draws one letter (default 2).
- Tabs `panels={false}`: only the tablist, so the page places the content anywhere and follows
  `bind:value`. Each item can carry `controls` (the id of the page's panel, for
  `aria-controls`) and `tabId` (the tab's own id, for the panel's `aria-labelledby`); a tab
  without `controls` gets no `aria-controls`. Roving focus and the arrow keys are unchanged.
- Calendar and MonthView: the month title capitalizes only its first letter ("Noviembre de 2026"
  in Spanish); the former `text-transform: capitalize` capitalized every word ("Noviembre De 2026").
- `setDefaultLabels()`: the starting texts with no `setLabels` above, for pages where each
  component is its own root (Astro islands). On the server it is shared state.
- New options:
  - Select `width="auto"`;
  - Button `variant="soft"` (tinted with the accent);
  - Tabs `variant="pills"`, `tabClass` and the snippets `tab` (the content of each tab) and
    `end` (controls on the same row, outside the tablist);
  - ToggleGroup `variant="segmented"`, `tone="solid"`, `itemClass` and `ariaLabel`; Toggle `tone="solid"`;
  - SearchInput `inputClass`;
  - Dialog `showCloseAlone` (the X without a title) and `bare` (no frame or padding).
  - NumberInput `clamp={false}` (leaves an out-of-range value for the form to report) and `onblur`;
  - Rating `onhover`; Tabs `wrap` (several lines instead of scrolling); Textarea `mono`.
- Command with results fetched by the page (the sites' Ctrl+K search, which asks the API as you
  type): `filter={false}` (no filtering), `bind:query`, `loading` (an indicator and an
  `aria-busy` list, with "Loading" in a `role="status"` region), `emptyText` with `{query}` or as
  a function, and the snippets `empty(query)`, `leading(item, active)` and `trailing(item, active)`.
  A result with `href` is a link (`<a role="option">`; Enter follows it), with `description`
  (subtitle) and `badge`; a result's `onSelect` becomes optional and the palette gets
  `onSelect(item)`. `inline`: no dialog or shortcut, the search field and the list inside the
  page's own overlay (Escape and choosing call `onOpenChange(false)`), with `autofocus` and
  `bind:inputRef`. The list only exists when there are results (`aria-expanded` and
  `aria-controls` follow it) and the active item goes back to the first when the list changes.
- ToggleGroup `variant="bare"` (no frame, for icon-only facets: a ring when pressed) and
  `dimOthers` (dims the unpressed options while one is pressed; on by default in `bare`). Each
  option accepts `ariaLabel`, `title`, `color`, `class` and `style`; `color` sets
  `--ta-toggle-accent`, which tints its pressed state in every variant. Variables for the page:
  `--ta-toggle-accent`, `--ta-toggle-on-accent`, `--ta-toggle-ring-offset` and `--ta-toggle-dim`.
- Slider: if the caller rejects the value on release, the track goes back to the value that stayed.
- On touch screens (`pointer: coarse`), inputs, selects, search, number inputs, toggles and tabs
  switch to 16px text (so iOS does not zoom the page on focus) and 44px of height.
- Token `--ta-on-accent`: the text on the accent colour (primary button, selected day, current
  page). A light accent needs dark text; it used to be always white.
- Table `density="compact"` (4×6px padding, 13px text, headers without uppercase) and
  `stickyFirstColumn` (sticky first column, header and body, with an opaque background from
  `--ta-table-sticky-bg`; the table switches to separate borders so each row's rule does not
  stay behind when scrolling). For the sites' type table: compact is 40 % narrower than normal.
  Table, TableHeader and TableBody pass any attribute to their element, as TableRow, TableHead
  and TableCell already did.
- **MonthView** (replaces the hand-made grid of the sites' CalendarWidget): a month to look at,
  with the `day` snippet (`date`, `day`, `weekday`, `today`, `outside`) in each cell, ‹ › with
  the texts `previousMonth`/`nextMonth`, PageUp/PageDown (Shift: year) with the focus inside,
  which goes back to the month button if the focused element left with the previous month;
  `bind:month`, `onmonthchange`, `weekStartsOn`, `showOutsideDays`, `headingLevel` and
  `--ta-monthview-cell-height`. It is not part of Calendar: there each day is a button in the
  picker's grid and cannot hold links or buttons.
- **Spinner**: a standalone loading indicator, `role="status"` with a hidden `label` (the
  `loading` text by default), `size` sm / md / lg or in pixels; under `prefers-reduced-motion` it
  pulses instead of spinning. The one inside Button `loading` is now called `.ta-btn-spinner`.
- Badge `variant="accent"` and `variant="accent-2"` (the second accent, pink), `tone="solid"`
  (filled with the colour and contrasting text; the pink uses `--ta-accent-2-dim` to reach 4.5:1)
  and any attribute passed to the `<span>`. Tokens `--ta-on-accent-2`, `--ta-on-success`,
  `--ta-on-warning`, `--ta-on-info` and `--ta-on-danger` (text on those fills).
- Button `variant="danger-ghost"`: the quiet destructive action (red text, no fill; a red tint on
  hover and a red focus ring).
- New texts in `en`/`es`: clear, decrement, increment, ratingOf, carousel, carouselRole,
  slideRole, slideOf, stopRotation, startRotation, compareSlider, before, after, copy, copied,
  planSteps, skipped, suggestions, sources, usage, oneTimeCode, otpDigit, filterColumn, minimum,
  maximum, allValues, clearFilters, noMatches, comingSoon.
- The source is now in English: comments, internal names, tests and the demo. The internal CSS
  classes and data attributes were renamed with it (for example `.ta-badge--solido` →
  `.ta-badge--solid`, `.ta-carousel-pista` → `.ta-carousel-track`, `data-dia` → `data-day`,
  `data-indice` → `data-index`, `data-campo` → `data-field`). Only a page that styles or queries
  those internals needs changes; props, snippets, events and texts of released components are the
  same. The internal-only custom properties `--ta-avatar-tono`, `--ta-sidebar-nivel` and
  `--ta-slider-alto` became `--ta-avatar-tone`, `--ta-sidebar-level` and `--ta-slider-height`.

## 0.7.0 — 2026-11-04

What was missing to build the whole Kitsuden admin with tallao.

### New
- **Sidebar** (groups, badges, expandable branches with `aria-expanded`, the current page with
  `aria-current` and its branch open, collapsible to icons) and **SplitPane** (a separator with
  the APG pattern: arrows, Home/End, Enter collapses and restores, pointer dragging).
- **Breadcrumb** and **Icon** (the kit's own icons by name, decorative unless given a `label`).
- **BarChart** and **LineChart**: eight series colours in the tokens (`--ta-series-1..8`,
  checked for colour blindness in dark and light), columns at most 24px wide with a rounded end,
  2px lines, a legend with two or more series, a tooltip by mouse and keyboard (the chart is a
  slider that reads each category) and a table with all the data.
- **SchemaForm**: a form built from a JSON Schema (text, email, url, date, numbers with minimum
  and maximum, enum, boolean, enum list, nested objects). It validates on submit and when leaving
  each field, focuses the first error and, with `name`, is the `<form>` of a SvelteKit action (an
  invalid submit never reaches `enhance`).
- **CodeEditor** in `tallao/code`: CodeMirror 6 with the kit's theme and highlighting; on the
  server and without JavaScript it is a `<textarea>` that gets submitted. CodeMirror is an
  optional peer dependency.
- `kit-check` tests SchemaForm with a CodeEditor inside in an action, with and without JavaScript.
- New texts in `en`/`es`: breadcrumb, resize, navigation, collapse, expand, showData,
  hideData, codeEditor, required, invalid, submit.

## 0.6.0 — 2026-11-03

What blocked using tallao in SvelteKit forms and in the Kitsuden admin.

### New
- **DataTable** (sorting with `aria-sort`, pagination, selection with a partial state, loading,
  a visible empty row; data in the browser or in the API with `manual`) and **Pagination**.
- **Calendar** and **DatePicker** (APG pattern: arrows, Home/End, PageUp/PageDown, ISO dates
  computed in UTC, "today" marked only in the browser).
- **FileUpload** on a real `<input type="file">`, with `accept`, `maxSize` and `maxFiles`.
- **Combobox**: search in the API (`loadOptions`, debounced and cancelling the previous one) and
  several values (`multiple` + `values`, removable chips).
- **Native forms**: `name` on Switch, Combobox, KeyValueEditor and DatePicker (hidden inputs that
  are already in the server HTML). `kit-check` tests it with a SvelteKit action, with and without
  JavaScript.
- TableHead passes any other attribute (`aria-sort`, `style`…).
- New texts in `en`/`es`: remove, previous, next, pagination, page, rowsPerPage,
  selectRow, selectAll, today, chooseDate, previousMonth, nextMonth, chooseFiles, dropFiles, actions.

### Fix found by the new tests
- Calendar: after choosing a day, changing month with the keyboard sent it back to the chosen month.

## 0.5.1 — 2026-11-03

### SvelteKit
- `toast()` does nothing on the server. The toast module is a single one for all requests: a
  `toast()` during render showed up in another page's HTML (`kit-check` caught it before the fix).
- `kit-check/`: a SvelteKit 3 app that consumes the packaged library. In CI it is prerendered and
  its HTML checked, and Playwright (Chromium) tests hydration: no mismatch warnings, the server
  ids are kept and the components respond.

## 0.5.0 — 2026-11-03

What the kons' admin views needed when they moved to tallao.

### New
- **SelectionBar**, **KeyValueEditor**, **CopyButton**, **DragBoard** + **DropZone** +
  **DragItem** (keyboard-accessible drag and drop) and **ChatMessage**.
- **ConfirmDialog**: `onCancel` and `onOpenChange` (a single call per close).
- **Input**, **Textarea** and **Select**: `bind:ref` gives the native element.
- **TableRow** and **TableCell** pass any other attribute (`title`, `data-*`…).

### Tests
- The `dom` environment moves from happy-dom to jsdom: happy-dom drops `<tr>`/`<td>` inside a
  `<template>` (Svelte builds the DOM from templates) and broke a row with spread attributes,
  which works in a real browser. jsdom has no modal `<dialog>`: `tests/setup.ts` adds the
  minimum; the real behaviour is tested in Chrome.

## 0.4.0 — 2026-11-03

### Breaking changes
- The default texts are now English. `setLabels(es)` (exported along with `en` and
  `useLabels`) switches them back to Spanish for everything below the component.
- Public props in English:
  - **PromptInput**: `conAdjuntos` → `attachments`, `enviarConEnter` → `submitOnEnter`;
    new `ariaLabel`, `sendLabel`, `attachLabel`.
  - **ToolCallCard**: `nombre` → `name`, `estado` → `status`, `resultado` → `result`,
    `textos` → `labels` (with English keys).
  - **MapaDelJuego** → **GameMap**: `centro` → `center`, `marcadores` → `markers`
    (`titulo`/`descripcion` → `title`/`description`), `oscuro` → `dark`, `alto` →
    `height`, `atribucion` → `attribution`.

### New
- **Switch**, **RadioGroup**, **Sheet**, **Toaster** + `toast()`, **Command**
  (Ctrl+K palette), **ContextMenu**, **Accordion**, **Progress**, **Skeleton**, **Avatar**.
- **Dialog**: `placement` (`center`, `left`, `right`, `top`, `bottom`).
- The floating layer can anchor to a point on the screen (`pointAnchor`), and DropdownMenu and
  ContextMenu share the menu keyboard handling (`internal/menu.ts`).

### Fixes found by the new tests
- RadioGroup: an option's description is no longer added to its accessible name.
- Command: typing in the search field no longer cleared it on every key.

## 0.3.0 — 2026-11-03

### Package
- Installs as a package: `exports` (`tallao`, `tallao/map`, `tallao/tokens.css`,
  `tallao/base.css`), generated types, `svelte-package` + publint, `prepare` for installing
  from git. MIT licence.
- Svelte becomes a peer dependency (`^5.29`). Leaflet and sveaflet leave the core: the map
  lives in `tallao/map` with optional peer dependencies.
- Tests (vitest: happy-dom with axe, and server rendering in Node), svelte-check and CI.

### Accessibility
- **Dialog** uses a native `<dialog>` with `showModal()`: Tab does not leave the dialog,
  Escape closes only the top one, the page scroll is locked (with several open, until the last
  one closes), initial focus and return to the trigger, `aria-labelledby` /
  `aria-describedby`, `prefers-reduced-motion`.
- **Button** with `href` and `disabled` loses the `href` (it neither navigates nor takes Tab) and
  becomes `role="link"` + `aria-disabled`.
- **CardTitle** (`level`) and the **Dialog** title (`titleLevel`, h2 by default) no longer force
  an `<h3>` that broke the heading order.

### SSR
- **Tabs** generates its ids with `$props.id()`: with `Math.random` the server HTML did not
  match the hydrated one.
- **MapaDelJuego** loads Leaflet only in the browser (it used to break server rendering).
- The map and **ToolCallCard** follow changes to their props (some were read only once).

### Floating layer (new)
- A layer stack (Escape and click outside), positioning with Floating UI and the top layer
  through the Popover API.
- **Popover**, **Tooltip**, **DropdownMenu** (+ MenuItem, MenuSeparator, MenuLabel) and
  **Combobox**.
- **Button** passes any attribute and attachment to the element, so it can act as a trigger.

## 0.2.0 — 2026-11-03

- Select, Textarea, Checkbox, Field, Tabs, Alert, Stat, ConfirmDialog and ThemeScope.
- Dialog: `closeLabel`, size `2xl`, internal scroll. TableCell: `colspan`.
