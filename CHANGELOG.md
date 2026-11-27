# Changelog

## Unreleased

Parts of the KTG Studio bot builder (kon-dc) that any builder can use.

- **`FlowNode`** (new, Generative UI): one editable step of a flow you build or watch run. Props:
  `label`, `description`, `index`, `status` (`FlowNodeStatus`: Steps' `pending`, `running`,
  `done`, `failed`, `skipped`, plus `stopped`), `statusLabel`, `selected`, `invalid`, `color`
  (any CSS colour for the icon and its tint), `onclick` (makes the body one button with
  `aria-pressed`), `ref` (bindable root, e.g. for a Beam), `class`, and the `icon`, `children`
  (text under the description) and `actions` (controls beside the body) snippets. Every run state
  but `pending` shows its word; `running` sets `aria-current="step"`. Tokens
  `--ta-flow-node-glow` and `--ta-flow-node-tone`, read with a fallback, so an ancestor can set them. Exports `FlowNodeStatus`.
- **`PromptInput` mentions**: `mentions` (`PromptMentionSource[]`: a `trigger` character, its
  `items` as `PromptMention` `{ id, label, hint?, color? }`, and the list's `label`), `maxMentions`
  (default 8) and `onMention(trigger, item)`. A trigger at the start of a word opens a listbox of
  matches above the box (names that start with what was typed first); the field keeps focus with
  `aria-activedescendant`; arrows move, Enter or Tab insert `trigger + label + space`, Escape
  closes, and Enter with the list closed still sends. Exports `PromptMention` and
  `PromptMentionSource`.
- **`ThemeToggle`** (new, Navigation and layout): the dark/light button. It sets
  `data-tallao-theme` on `<html>`, remembers the choice in localStorage (`storageKey`, default
  `"tallao-theme"`; `null` remembers nothing) and reveals it with `themeTransition` from the click
  (`transition`: `"circle"` default, `"ink"`, `"fade"`, `"none"`). Props: bindable `theme`,
  `variant`, `size`, `lightLabel`, `darkLabel`, `onchange`. On mount it takes the stored choice,
  else the attribute already on `<html>`, else dark. Exports `Theme`.
- **`SortableList` `variant="bare"`**: rows draw no card of their own, for content that is its own
  card (FlowNode). The grabbed and drop-target states mark the content; the handle rests dimmed
  until the row is hovered or focused, and stays full on touch. New token `--ta-sortable-gap` sets
  the gap between rows in both variants.
- **`AppShell` `flush`**: the content fills the main area edge to edge, with no padding and no
  scroll of its own, for a page that lays itself out to the full height (an editor, a canvas, a
  map).
- **Icon**: 13 new strokes: `message`, `hash`, `coin`, `branch`, `chip`, `slash`, `pill`, `form`,
  `bolt`, `play`, `sun`, `moon` and `more`.
- **Labels**: new keys `stopped`, `themeToLight` and `themeToDark`, in English and Spanish. A
  `Labels` object of your own (another language) needs them.

## 0.8.0 — 2026-11-26

The first release on npm.

- **On npm as `tallao`.** `pnpm add tallao` (or `npm install tallao`) replaces
  `pnpm add github:tallao-ui/tallao`, which still installs `main` and builds `dist/` through
  `prepare`. The package ships `dist/`, the docs MCP server, its data and `llms.txt`; no tests and
  no sources. `package.json` gains `keywords`, `homepage`, `bugs` and `publishConfig.access`.
- **`npx tallao mcp`** (new `bin/tallao.mjs`): starts the docs MCP server from the package, with
  no clone. MCP client settings: `{ "command": "npx", "args": ["-y", "tallao", "mcp"] }`.
  `tallao --version` and `tallao --help` too. `get_setup` gives the npm install command, and
  `get_component` links each source file on GitHub.
- **MCP input limit.** `get_component`, `search_components` and `list_components` refuse a name,
  query or family longer than 200 characters (`MAX_INPUT`) before matching: a 200,000-character
  name kept the server busy for about 11 s in the closest-name search.
- **`tallao/llms.txt`** (new export): the component index for agents, inside the package.
- **`prepack`** builds `dist/`, regenerates `docs/gen/components.json` and checks `llms.txt`, so a
  packed tarball never carries stale files; **`prepublishOnly`** runs `check`, `test` and
  publint.

- **`themeTransition(update, options)`** (new, `tallao/motion`): runs a page-wide change (a theme
  switch) inside a View Transition revealed from a point. Options: `from` (a mouse or pointer event,
  `{ x, y }` or an element's centre; default the viewport centre; a keyboard click reveals from the
  clicked element, also when the listener sits on the document), `style` (`"circle"` default, `"ink"`, `"fade"`), `duration` (ms, default 650). It sets
  `data-ta-theme-transition="<style>"` and the inline `--ta-vt-x`, `--ta-vt-y`, `--ta-vt-r` (distance
  to the farthest corner) and `--ta-vt-duration` on `<html>` for the length of the transition, skips
  a reveal still running, and clears them after. Without View Transitions or under reduced motion it
  just runs `update`. An error thrown by `update` rejects the returned promise in both paths. Exports `ThemeTransitionStyle` and `ThemeTransitionOptions`.
- **`tallao/base.css`**: the theme-transition CSS, scoped by `html[data-ta-theme-transition]` (a
  `ta-vt-circle` clip-path, a `ta-vt-ink` mask, a `ta-vt-fade` cross-fade), and the new custom
  property `--ta-ink-mask` on `:root`: an inline SVG blot (a circle displaced by `feTurbulence` +
  `feDisplacementMap`) that a site can replace with its own brush.
- **`impact(options)`** attachment and **`playImpact(el, options)`** (new, `tallao/motion`): an anime
  impact frame on a confirm, inspired by finktheartist/sakuga-vfx (MIT) and written from scratch.
  The element squashes on `pointerdown` and springs back on release (Web Animations, token
  durations); a click (keyboard too) plays a burst on one shared, `aria-hidden`, click-through
  canvas over the viewport, removed after 1.5 s idle. Options: `flavor` (`"manga"`: spiky burst,
  cloud puffs, speed wedges, a word such as ドン!; `"nordic"`: burst, frost shards, crossed slashes,
  a ring of Elder Futhark runes drawn as lines, a word such as SKÁL!), `words` (`[]` for none),
  `intensity` (`"full"` or `"light"`: small squash and three wedges, no lettering), `color` (default
  `--ta-impact-color`, then `--ta-accent`). Nothing under reduced motion, on a disabled control
  (`:disabled` or `aria-disabled="true"`) or on a right-click. Exports `ImpactFlavor` and
  `ImpactOptions`. Shown in the motion demo with the three theme transitions.

- **ProgressiveBlur** (new): a decorative blur that grows toward one edge of its positioned parent:
  three stacked layers, each a stronger `backdrop-filter: blur()` under a shorter `mask-image`
  gradient. Props: `side` (`"top"` | `"bottom"`, default `"bottom"`), `size` (CSS length or percent,
  default `"60%"`), `strength` (px of the strongest layer, default 14; the others are 1/7 and 3/7 of
  it), `class`, and any other attribute on the root. `aria-hidden`, `pointer-events: none`. Under
  `pointer: coarse` one layer at half the strength (backdrop filters repaint on every scroll frame);
  without `backdrop-filter` support it draws nothing. No JavaScript.
- **ReadingProgress** (new): a 3px accent bar that fills as the reader scrolls. Props: `target`
  (an element to measure: progress is `-top / (height - innerHeight)`, updated on passive
  `scroll`/`resize` once per animation frame), `position` (`"fixed"` at the top of the viewport,
  default, or `"absolute"` on the bottom edge of a sticky header), `class`, and any other attribute
  on the root. Without `target` it is CSS only (`animation-timeline: scroll(root)`) and hidden where
  scroll-driven animations are not supported. `aria-hidden`; fills from the start edge, right to
  left in RTL. `animation-timeline` sits in its own, more specific rule: in the same rule as the
  `animation` shorthand, lightningcss folds both into one shorthand that browsers reject.
- **Button** `variant="aurora"` (new value): the primary fill inside a conic gradient border of the
  accents that turns (a registered `--ta-aurora-angle`, 4 s a turn, 1.6 s on hover) with a soft accent
  glow, for the one main action of a page. It turns only under `prefers-reduced-motion:
  no-preference` and not with `data-tallao-motion="reduce"`; the 44px touch rule still applies.

- **SegmentedBar** (new): a total split into its parts, after the analytics and overview pages of the
  loopo template. Props: `segments` (`BarSegment`: `label`, `value`, `delta?`, `color?`), `title`,
  `hideTitle`, `total`, `totalLabel`, `locale`, `format`, `deltaFormat`. A named group; the bar is
  decoration, the rows are a list with the share and the change in words. Segments grow in, staggered;
  none under reduced motion.
- **CohortGrid** (new): retention by cohort as a table. Props: `cohorts` (`Cohort`: `label`, `size?`,
  `values`), `periods`, `title`, `hideTitle`, `cohortLabel`, `sizeLabel`, `max`, `color`, `locale`,
  `format`. Scrolls sideways in a focusable region; cells fade in along the diagonal; none under
  reduced motion. New label key: `cohort` (en "Cohort", es "Cohorte").
- **LineChart** `compare` (new prop, a `ChartSeries`): a previous period or a target drawn as a dashed,
  quieter line behind the series, in the text colour. It enters the scale, the legend (a dashed mark),
  the tooltip, the readout and the data table. **ChartLegend** items take `dashed` for that mark.
- **BarChart** draws negative values: they grow the other way from the zero line, and the scale gets
  round bounds on both sides of zero. Stacked, positives pile up and negatives pile down (money in and
  money out in one chart), and the total in the tooltip and the table is now the net sum. Before, a
  negative value was drawn as nothing and left out of a stacked total; charts with only positive values
  are unchanged.

**Effects for agent screens, and an MCP server for the docs.**

- **Terminal** (new): what an agent runs, as a terminal window that writes itself. `lines`
  (`TerminalLine`: `kind` = `command` | `output` | `success` | `error` | `info` | `comment`, `text`),
  `title`, `label`, `speed` (28 ms per character), `lineDelay` (420 ms), `autoplay` (true), `prompt`
  ("$"), `replay` (true), `replayLabel`, `onDone`. Commands are typed after the prompt, the others
  appear whole, each kind with a mark (✓ ✗ i #). The animated lines are `aria-hidden` and a hidden
  list holds the whole transcript from the start; the group is `aria-busy` while it plays. Reduced
  motion and the server render the whole text at once. Exports `TerminalLine` and `TerminalKind`.
  New labels: `terminal`, `terminalReplay`.
- **EventFeed** (new): an agent's activity as a list where a new event enters at the top and the
  others glide down. `events` (`FeedEvent`: `id`, `title`, `detail`, `time`, `tone`, `icon`),
  `limit`, `ariaLabel`, `announce` (a polite live region, off by default), `emptyText` and an
  `item` snippet. Tones (`default`, `accent`, `success`, `warning`, `error`, `info`) pick an icon as
  a second cue. 120–240 ms, opacity and transform; still under reduced motion. Exports `FeedEvent`
  and `FeedTone`. New labels: `eventFeed`, `noEvents`.
- **Beam** (new): a pulse of light along a line between two elements, drawn as an SVG inside
  their positioned `container`, from edge to edge (`gap`), redrawn by a ResizeObserver. `from`,
  `to`, `curvature`, `duration`, `delay`, `reverse`, `active`, `tone`, `width`. `aria-hidden`;
  under reduced motion only the line.
- **MCP server** (`pnpm mcp`, `scripts/mcp-server.mjs` + `scripts/mcp-core.mjs`): stdio, JSON-RPC,
  no dependencies. Tools `list_components`, `search_components`, `get_component` (import line,
  docs URL, the demo's code or the header example, props table, parts, the accessibility contract)
  and `get_setup` (from the "Use" section of `llms.txt`), all from `docs/gen/components.json`.
- Tests: `tests/dom/agent-effects.test.ts`, `tests/ssr/mcp.test.ts`; `tests/setup.ts` stands in for
  `Element.getAnimations` (jsdom has none; Svelte's `animate:` asks for it).

**Docs, and a landing that shows the kit as it is now.**

- **Docs** (new, `docs/`, published at `/docs/` next to the landing): a page for each of the 133
  components (117 pages; parts such as CardHeader live in their parent's), with the live demo and
  its code (Preview / Code), how to install it, its props with types and defaults, and its contract
  (keyboard, ARIA, SSR) from the header comment. Hash routes, search (`/`), English and Spanish
  chrome, theme and accent. Everything but the demos is read from the component sources by
  `scripts/docs-data.mjs`, which reuses the parsers of `scripts/llms.mjs` (now exported; the
  output of `llms.txt` does not change). Demos are `docs/demos/<slug>.svelte` and import from
  `"tallao"` like a user's code. New scripts: `docs:data`, `docs:dev`, `docs:build`, `docs:check`
  (svelte-check over every demo); CI runs the last two and the Pages workflow builds the docs.
- **Landing**: the 13 newest components, with live replicas of DocumentTabs, CodeDiff, TreeView,
  SortableList, TagInput and PasswordInput; a calmer first screen (announcement, stack, inspector
  on demand); a Spanish version (`?lang=es`, `/es/`); a closing call to action; the logos; and each
  catalogue chip opens its docs page. Counts corrected (133 components, 500+ tests).
- **Brand on the landing and the docs**: the wordmark is big in the first screen and writes itself on
  load while its orange comma falls into place (the two are separate images, `site/brand/tallao-letters-*`
  and `tallao-comma.*`; still, with no animation, under reduced motion). The comma is also the headline's
  streaming cursor, the mark under the section you are in, and the dot of every "new" label (landing and
  docs). The inspector's panel moves above the wordmark so it covers no text.
- **Landing rhythm and length**: each section's line draws itself in violet to orange and starts with
  the comma, and its big number is written with a comma falling beside it; three sections lean on a soft
  violet / orange glow. Section 01 now tells a story (the "replica" note moved to the end, with a link to
  the docs); the rest of the specimens in "Controls" and "New" are folded (a link, a chip or the command
  palette opens the fold it points into); the catalogue shows 6 components per family. The page goes
  from 17.4 to 14.5 screens at 1366×768. Stale figures in the Stat specimen corrected.

**Lists, outlines and forms that take them.**

- **CodeBlock**: new optional `actions` snippet, rendered in the header beside the copy button
  (for buttons such as "Copy for X"). Backwards compatible.
- **CodeDiff** (new): a line diff of two code texts (DiffView compares the fields of a record).
  `before`, `after`, `mode` (`unified` | `split`; split falls back to unified on a container
  narrower than 560 px), `beforeLabel`, `afterLabel`, `ariaLabel`, `lineNumbers`, `context` (3),
  `fold` (long unchanged runs become a button "N unchanged lines" with `aria-expanded`),
  `normalize`, `maxHeight`, `wrap`, `emptyText` and an `actions` snippet that gets
  `{ added, removed }`. The header says `+A −R` in text and in words; every changed line has a
  sign column and a hidden "Added" / "Removed"; changed characters are an `<ins>` (underlined) or
  a `<del>` (struck through). A `<figure>` with a `role="list"` of lines; line numbers are
  `aria-hidden`. Also exports the pure `diffLines(before, after, { normalize })` (Myers O(ND),
  falls back to "all removed, all added" past 2000 edits; paired lines carry `marks`) and the
  types `DiffLine` and `CodeDiffKind`. New labels: `noDifferences`, `unchangedLines`, `codeDiff`,
  `diffBefore`, `diffAfter`.
- **DocumentTabs** (new): editor-style tabs for open documents or conversations, the companion of
  Tabs (which is unchanged). `items` (`DocumentTab`: `id`, `label`, `title`, `busy`, `dirty`,
  `closable`, `controls`, `tabId`), `value` (bindable), `ariaLabel`, `onchange`, `onclose(id)`,
  `onadd` (draws a "+" button), `addLabel`, `closeLabel(tab)`, `busyLabel`, `dirtyLabel`,
  `panels` (default `false`: the page renders the panels, as in Tabs), `end` and `children`
  snippets. Each tab is a `role="tab"` button with a close button as its SIBLING (`tabindex="-1"`,
  named "Close {label}"); the tablist owns the tabs with `aria-owns`. Arrows (mirrored in RTL),
  Home and End move focus and select; Delete or Backspace on a tab, the close button and a
  middle click call `onclose` (the component removes nothing) and, once the tab is gone, focus
  and selection move to its neighbour. `busy` shows a Spinner and the hidden text "Working",
  `dirty` a dot and "Unsaved changes". Tabs scroll sideways, the selected one is scrolled into
  view, labels are cut at 14rem with the full text in `title`. 44px targets under coarse
  pointers, no transitions under reduced motion. New labels: `closeTab`, `newTab`, `tabBusy`,
  `tabDirty`.
- **ChatThread** (new): the scrolling area of a conversation. It follows the newest content
  (watched with a ResizeObserver, so streamed text and loading images keep it pinned) and stops
  following when the reader scrolls up; a "Jump to latest" button (`jumpLabel`, label
  `jumpToLatest`) brings it back. A focusable region with `role="log"`, a name (`label`,
  label `conversation`) and `aria-live="off"`, so it does not re-read every token. `follow`
  is bindable; `threshold` (48 px) says how near the bottom still counts. Exposes
  `scrollToLatest()`. No smooth scrolling under reduced motion.
- **ScenePlayer** (new): a "video" drawn with components, for tutorials that change with the
  product. `scenes` (`PlayerScene`: `id`, `title`, `duration` in ms, `caption`) and a `scene`
  snippet that gets the scene and its progress (0–1). Play / Pause, previous / next chapter,
  a seek bar (`role="slider"`, value text "0:12 of 1:30"), a chapter list (`aria-current`)
  and captions shown and read once by a polite live region. Keys with focus in the player:
  Space or K, ← → (5 s), Home / End, N / P. `time` and `playing` are bindable; `autoplay`
  never starts under reduced motion, where scenes are drawn at progress 1; it pauses when the
  tab is hidden. Props: `label`, `chapters`, `playLabel`, `pauseLabel`, `previousLabel`,
  `nextLabel`, `seekLabel`, `chaptersLabel`, `onSceneChange`, `onEnd`; exports `formatTime`.
  New labels: `player`, `playerRole`, `play`, `pause`, `previousChapter`, `nextChapter`, `seek`,
  `chapters`, `timeOf`.
- **PasswordInput** (new): a password or secret-key field with a show / hide button. A real
  `<input>` (type `password` or `text`), so password managers, paste, autofill and `name` in a
  native form keep working; other attributes go to it. The toggle is a `<button type="button">`
  with `aria-pressed` and the name "Show password" (`toggleLabel`, label `showPassword`), reached
  with Tab after the field; a click keeps focus in the field. Props: `value`, `revealed` (both
  bindable), `ref`, `disabled`, `onRevealChange`, `class`. 44px targets and 16px text under
  `pointer: coarse`.
- **FloatingScene** (new): a decorative 3D backdrop of frosted glass tiles at four depths behind
  the content (`children`). `tiles` (texts drawn on them), `count`, `clear` (a horizontal band
  kept free for the content, `[34, 66]` by default), `seed` (deterministic layout,
  the same on the server; exported as `layoutScene` with the `SceneTile` type), `parallax`
  (default on: the pointer tilts the layers through two CSS custom properties, once per frame),
  `drift` (default off: a slow 10–14 s float), `glow` (a soft accent light). The stage is
  `aria-hidden` with no pointer events; under reduced motion the tiles stay still. Coloured by
  `--ta-accent`, `--ta-accent-2` and `--ta-text`.
- **Install from GitHub with Corepack.** `pnpm add github:tallao-ui/tallao` in a Docker image with
  Corepack failed in `prepare` with `ERR_PNPM_IGNORED_BUILDS`: the nested install runs in the
  package's own folder, which named no package manager, so Corepack picked the newest pnpm, which
  refuses esbuild's build script. `package.json` now declares `"packageManager": "pnpm@10.29.2"`,
  and `pnpm-workspace.yaml` approves esbuild's build (`onlyBuiltDependencies`).
- **FileUpload** takes files from the clipboard and shows image thumbnails. `paste` (`true`:
  while focus is in the zone; `"document"`: anywhere on the page, except a text paste into a
  field, which is left alone) adds the clipboard's files through the same `accept` / `maxSize` /
  `maxFiles` checks; a paste with only text is never taken, and nameless pastes ("image.png")
  are named "Pasted image 1.png"… (`pastedName`). The zone then shows a hint (`pasteLabel`),
  linked to the input with `aria-describedby`. `previews` draws a decorative thumbnail
  (`.ta-upload-thumb`, an object URL freed when the file is removed or the component unmounts)
  for image files. New labels: `pasteFiles`, `pastedFileName`.
- **SortableList** (new): rows put in another order (`items`, `key`, `label`, a `row` snippet,
  `onReorder(from, to)`; the list moves nothing itself). Drag a row by its handle with the mouse;
  or press the handle (a button with `aria-pressed`) and move it with ↑ ↓ / Home / End or the Move
  up / Move down buttons it shows while picked up (touch), press the handle again to drop it,
  Escape to put it back. Focus follows the row; every step is announced in an `aria-live` region.
  Props: `ariaLabel`, `disabled`, `handleLabel`, `moveUpLabel`, `moveDownLabel`, `instructions`,
  `class`; other attributes go to the `<ol>`. New labels: `moveItem`, `moveUp`, `moveDown`,
  `sortInstructions`, `sortPicked`, `sortMoved`, `sortDropped`, `sortCancelled`.
- **TagInput** (new): a list of short free-text values as removable chips (`values`, bindable).
  Enter or a `separators` character (`[","]`) adds what was typed, also when the separator
  arrives as text with no key event (Android keyboards, autocomplete); a pasted list is split on
  them and on new lines, Backspace in the empty field takes the last value back to edit. Before
  adding it checks `pattern` (anchored, like `<input pattern>`; `patternMessage` says why),
  `maxItems` (the field is disabled when full) and repeats (`unique`, default `true`); what does
  not pass stays in the field with the reason under it (`role="alert"`, linked with
  `aria-describedby`). Props: `placeholder`, `disabled`, `id`, `name` (one hidden input per value),
  `ariaLabel`, `removeLabel` (label `removeItem`), `invalidLabel` (label `invalid`), `onchange`;
  other attributes go to the text field. 44px targets under `pointer: coarse`.
- **TreeView** (new): the APG tree view with single selection. `items` (`TreeNode`: `id`,
  `label`, `description`, `badge`, `badgeTone`, `disabled`, `children`), bindable `selected` and
  `expanded`, `ariaLabel`, `onselect`, and a `node` snippet to draw a node yourself. Arrows move,
  open and close, Home/End, Enter or Space select, `*` opens the siblings, typing a letter jumps;
  roving tabindex; `aria-level`, `aria-setsize`, `aria-posinset`, `aria-expanded`,
  `aria-selected`. Exports `TreeNode`.
- **SchemaForm**: arrays. An array of strings, numbers or integers is a TagInput (numbers come
  back as numbers; `items.pattern` and `maxItems` are checked per value), and an array of objects
  is one fieldset per item with Remove and an Add button (`minItems` / `maxItems` limit both).
  Fields inside items validate like any other, the list validates its count, and removing an item
  forgets the errors of the list. `JsonSchema` gains `minItems` and `maxItems`. New label
  `addItem` ("Add" / "Añadir").
- **SchemaForm**: a schema held in `$state` (one a page loads from an API) no longer crashes the
  form. Its `default`s are copied as JSON; `structuredClone` refused the reactive proxies with a
  `DataCloneError` and nothing rendered.
- **LineChart**, **BarChart** (and every chart with "Show data"): the "Show data" button is at least
  24 × 24 px with a fine pointer (WCAG 2.2 target size); it was 22px tall.
- **Field**: with `error`, its control gets `aria-invalid="true"` and `aria-describedby` pointing at
  the message (kept alongside ids it already had), and both are removed when the error goes. The
  message has an id now. Before, only the label wrapping it tied the error to the control.
- **KpiCard**: in a narrow card the sparkline moves under the figure instead of breaking the
  figure across two lines ("35.1 / K").

**Flows, calendars, decks and date ranges.**

- **DiffView**: `redacted` on a `DiffChange`, and `redactedLabel` (label `redacted`: "hidden" /
  "oculto"). A secret field that changed, with no values to show, is listed as changed and both
  sides read "hidden" in italics, never struck through. Before, the only way to show one was two
  equal stand-in values, which DiffView reads as unchanged and leaves out.
- **Dialog**, **ConfirmDialog**: a dialog with no content draws no body. A ConfirmDialog with
  only a title and a description had an empty padded `.ta-dialog-body` between the header's rule
  and the footer's, a blank band. ConfirmDialog hands its `children` on as it got them; on a
  Sheet with no body the footer still sits at the bottom.
- **Checkbox**, **DataTable**, **Switch**, **SelectionBar**: 24px targets on a fine pointer. The
  checkbox label, the sortable header button and the "select all" label are at least 24px tall
  (they were 16–21px), a checkbox with no text is 24px wide too, and the switch track has a 24px
  hit area around its 16–20px drawing.
- **ThemeScope** (`source="kitsuden"`): the text on a solid status fill (`--ta-on-success`,
  `--ta-on-warning`, `--ta-on-info`, `--ta-on-danger`) follows the admin's `--kitsuden-on-status`,
  `--ta-info` its `--kitsuden-info` and `--ta-on-accent-2` its `--kitsuden-on-accent`, with the
  former fixed values as fallbacks: on the admin's light theme a solid badge had dark text on a
  dark fill.
- **SankeyChart**: `links` (`SankeyLink[]`: `source`, `target`, `value`), `nodes` (`SankeyNode[]`:
  `id`, `label`, `color`), `title`, `hideTitle`, `unit`, `height`, `width`, `nodePadding`, `align`
  (`justify`, `left`), `locale`, `format`, `fromLabel`, `toLabel`, `valueLabel`, `emptyText`,
  `showDataLabel`, `hideDataLabel`. The layout is the kit's own (`internal/sankey.ts`); links
  that would close a cycle are not drawn and are marked in the table.
- **CalendarHeatmap**: `data` (`CalendarHeatmapDay[]`: `date`, `value`), `title`, `hideTitle`,
  `start`, `end`, `weekStartsOn`, `unit`, `max`, `levels`, `color`, `locale`, `format`,
  `lessLabel`, `moreLabel`, `emptyText`.
- **CardStack**: `items`, `index` (bindable), `loop`, `peek`, `label`, `previousLabel`,
  `nextLabel`, `onchange` and the `card` snippet. `--ta-cardstack-bg` sets the plate behind
  each card.
- **DateRangePicker**: `value` (bindable `DateRange`: `start`, `end`), `min`, `max`, `locale`,
  `weekStartsOn`, `presets` (`DateRangePreset[]`), `name`, `startName`, `endName`, `disabled`,
  `inline`, `ariaLabel`, `startLabel`, `endLabel`, `buttonLabel`, `onchange`.
- **FilterBar / FilterChip**: a `date` filter with `range: true` (FilterChip: `range`) edits two
  dates with a DateRangePicker and stores them as `"start..end"`.
- **RadarChart**: text no longer scales with the drawing. It is laid out in real pixels for
  the width it has, axis names are 11px at any `size` and break into two lines when long, and
  the scale's figures run between the first two axes instead of on one (they sat on points).
- **Badge**: on the light theme the soft tones reach 4.5:1 on their tint. A new token,
  `--ta-tone-ink` (0% on dark, 55% on light), is how much of the text colour a tinted text
  takes; the dark theme renders as before.
- New label keys, in `en` and `es`: `less`, `more`, `startDate`, `endDate`, `chooseDates`,
  `lastDays`, `thisMonth`, `cards`, `from`, `to`, `value`, `flowsNotDrawn`.

**Motion: leaving.**

- Dialog and Sheet fade out, and their panel leaves the way it came (a dialog shrinks, a sheet
  slides to its edge): the closed `<dialog>` stays painted through
  `transition-behavior: allow-discrete` on `display` and `overlay`; where the browser has
  not got it, closing is instant as before. Popover, DropdownMenu (and ContextMenu's menus that
  use it), the DateRangePicker panel and toasts leave with a short `scaleIn` / `fade` from
  `tallao/motion`. All of it is interruptible and off under reduced motion.
- **DataTable**: a row that is deleted fades out before it goes (a change of page, order or
  filter still swaps the rows at once). **TableRow** has a new prop for it, `exit`.
- **Checkbox**: the check draws itself (and a dash when `indeterminate`). It is still the
  native `<input type="checkbox">` (name, value, form, Space, `:indeterminate`); the kit now
  draws its box (`appearance: none`) with an SVG mark next to it, so the markup inside the
  label changed (a `ta-checkbox-box` wrapper). Under forced colours the system's checkbox is
  used.

**Agent run components.** What a screen that shows a model at work needs, composed in
`src/AgentDemo.svelte` (the "Agent screen" section of the demo).

- **Thinking**: `running`, `summary`, `seconds`, `steps`, `open` (bindable), `runningLabel`,
  `doneLabel`, `onOpenChange` and `children` (the trace).
- **StreamingText**: `text`, `stream` (an `AsyncIterable<string>`), `streaming`, `caret`, `onDone`.
- **ToolChips**: `calls` (`ToolChipCall[]`: `id`, `verb`, `target`, `icon`, `status`, `added`,
  `removed`, `name`, `args`, `result`), `messages`, `summary`, `open` (bindable), `collapsible`,
  `ariaLabel`, `onOpenChange`.
- **TaskList**: `tasks` (`TaskItem[]`: `id`, `title`, `status`, `done`, `total`, `meta`,
  `detail`), `variant` (`list`, `capsule`), `open` and `expanded` (bindable), `label`, `labels`
  and the `details` snippet. Steps is unchanged: it shows a plan, TaskList work in flight.
- **ApprovalCard**: `title`, `requester`, `description`, `changes`, `tool`, `args`, `risk`,
  `riskLevel`, `status` (`pending`, `approved`, `rejected`, `expired`), `outcome`, `level`,
  `shortcuts`, `approveLabel`, `rejectLabel`, `editLabel`, `requestLabel`, `onApprove`,
  `onReject`, `onEdit` and `children`.
- **ContextCards**: `items` (`ContextItem[]`: `id`, `title`, `type`, `meta`, `excerpt`, `href`,
  `icon`), `label`, `layout` (`row`, `stack`), `removeLabel`, `onRemove`.
- **RecommendationCard**: `title`, `description`, `reasons`, `confidence`, `level`,
  `actionLabel` + `onAction` / `actionHref`, `secondaryLabel` + `onSecondary`, `onDismiss`,
  `dismissLabel`, `reasonsLabel` and `children`. **InsightCard**: `title`, `label`, `value`,
  `unit`, `delta`, `deltaLabel`, `goodWhen`, `trend`, `text`, `tone`, `level`, `locale`,
  `format`, `deltaFormat`, `actionLabel` + `actionHref` / `onAction` and `children`.
- **Icon**: new names `file`, `terminal`, `sparkle`, `database`, `image`, `globe`, `shield`,
  `text`, `refresh`.
- New label keys, in `en` and `es`: `thinking`, `thoughtFor`, `secondsShort`, `minutesShort`,
  `toolCallOne`, `toolCalls`, `messageOne`, `messages`, `linesAdded`, `linesRemoved`, `tasks`,
  `tasksDone`, `details`, `approvalRequested`, `approved`, `editFirst`, `expired`, `riskLow`,
  `riskMedium`, `riskHigh`, `context`, `removeItem`, `confidenceLow`, `confidenceMedium`,
  `confidenceHigh`, `reasons`.

**Motion.** A motion system for the kit and for apps built with it.

- Tokens in `tokens.css`: `--ta-duration-fast` (120ms), `--ta-duration-base` (180ms),
  `--ta-duration-slow` (240ms), `--ta-ease-out`, `--ta-ease-in-out`, `--ta-ease-spring` and
  `--ta-motion` (1 or 0). Reduced motion is one switch: `prefers-reduced-motion`, or
  `data-tallao-motion="reduce"` on `<html>` (`"full"` overrides the system); `base.css` stops
  every animation and transition under the attribute.
- New entry point **`tallao/motion`**: the transitions `fade`, `rise`, `scaleIn`, `slide`,
  `collapse`, the helpers `stagger` and `crossfade`, the attachments `press`, `shimmer`,
  `drawCheck`, `rollNumber`, `tabIndicator`, the functions `shake`, `viewTransition`,
  `prefersReducedMotion`, `easeOut`, `easeInOut` and the constants `DURATION` and `EASE`.
- In the kit's components: Dialog, Sheet, Popover, DropdownMenu, Toaster, Progress and Switch
  take their durations and easings from the tokens (a sheet uses the slow one, the backdrop
  fades in, the Switch thumb has a spring); Tooltip fades in; an Accordion section's content
  settles in when opened; Tabs (underline, one row) draws one underline that slides to the
  selected tab after hydration (the server still renders each tab's own; internal: a
  `ta-tabs-indicator` element inside the tablist and the class `ta-tabs--sliding`); Checkbox
  gives under the pointer; a DataTable row that is added fades in. Button's busy spinner now
  stops under reduced motion (it did not).
- `src/MotionDemo.svelte` (the "Motion" section of the demo) shows each piece with a replay
  button and a "Reduce motion" switch.

**Charts and counters.**

- **RadarChart**: `data`, `axis`, `series`, `title`, `hideTitle`, `max`, `levels`, `size`,
  `axisLabel`, `locale`, `format`, `emptyText`, `showDataLabel`, `hideDataLabel`.
- **RollingCounter**: `value`, `label`, `locale`, `format` (`Intl.NumberFormatOptions`), `size`.

**For agents building with the kit.**

- `llms.txt` at the repository root: every component with its purpose, props and a usage
  example, generated from the sources by `scripts/llms.mjs` (`pnpm llms`);
  `tests/ssr/llms.test.ts` fails while it is stale.
- A new skill, `.claude/skills/build-with-tallao`: which components to pick for an agent run
  screen, an admin list / detail page and a public dashboard, and the motion rules.

**Building blocks for an admin panel.** What a "model list" and a "record detail" page need, so
the Kitsuden admin and the kon views can be built from the kit alone. `src/AdminDemo.svelte` (the
"Admin" section of the demo) composes them into both pages and is the reference to copy.

- **AppShell**: `breakpoint` (`sm` 640px, `md` 768px, `lg` 1024px), `sidebarOpen` (bindable),
  `height`, `landmarks`, `mainId`, `menuLabel`, `navLabel`, `skipLabel`, `closeLabel` and the
  snippets `sidebar` (gets `{ mobile, close }`), `breadcrumb`, `command`, `user`, `topbar`. It
  lays out a Sidebar, a top bar and the page; below the breakpoint the sidebar is rendered in a
  modal sheet opened by a menu button. Sidebar itself is unchanged.
- **PageHeader**: `title`, `level`, `description`, `divider` and the snippets `breadcrumb`,
  `status`, `meta`, `actions`, `tabs`, `children`. `--ta-page-header-gap` sets the space under it.
- **FilterBar**: `filters` (`FilterDef[]`: `key`, `label`, `type`, `options`, `hidden`,
  `placeholder`), `value` (bindable `FilterValues`), `search`, `searchKey`, `searchPlaceholder`,
  `searchLabel`, `ariaLabel`, `addFilterLabel`, `clearAllLabel`, `locale`, `onchange`, the `end`
  snippet and the `clear()` method; plus the functions `filtersToQuery` and `filtersFromQuery`.
- **FilterChip**: `label`, `type` (`select`, `boolean`, `date`, `text`), `options`, `value`
  (bindable), `removable`, `placeholder`, `locale`, `removeLabel`, `anyLabel`, `yesLabel`,
  `noLabel`, `onchange`, `onremove` and the `openEditor()` method.
- **SavedViews**: `views` (`SavedView[]`: `name`, `query`), `current` (bindable), `query`,
  `label`, `saveLabel`, `renameLabel`, `deleteLabel`, `deleteConfirmTitle`, `nameLabel`,
  `emptyText`, `onSelect`, `onSave`, `onRename`, `onDelete`.
- **EmptyState**: `variant` (`empty`, `no-results`, `error`), `title`, `description`, `icon`,
  `level` (`null` for a paragraph), `size`, `actionLabel` + `onAction` / `actionHref`,
  `onClearFilters`, `clearFiltersLabel`, `onRetry`, `retryLabel`, `retrying` and the snippets
  `actions` and `children`.
- **SaveBar**: `dirty`, `saving`, `error`, `savedText`, `form`, `secondaryActions`
  (`SaveBarAction[]`: `id`, `label`, `name`, `value`, `onSelect`), `disableWhenClean`, `sticky`,
  `saveLabel`, `cancelLabel`, `dirtyText`, `savingText`, `ariaLabel`, `onSave`, `onCancel`,
  `cancelHref` and `children`.
- **DiffView**: `changes` (`DiffChange[]`: `field`, `label`, `before`, `after`), `compact`,
  `showUnchanged`, `collapseAfter`, `format`, `ariaLabel`, `beforeLabel`, `afterLabel`,
  `addedLabel`, `removedLabel`, `changedLabel`, `emptyValueLabel`, `showMoreLabel`,
  `showLessLabel`, `emptyText`; plus the function `diffKind`.
- **DescriptionList**: `items` (`DescriptionItem[]`: `label`, `value`, `copy`, `href`, `mono`),
  `layout` (`auto`, `stacked`), `columns`, `ariaLabel`, `emptyValue`, `copyLabel`, `copiedLabel`
  and the `value` snippet.
- **Kbd**: `keys`, `platform` (`auto`, `mac`, `other`), `separator`, `size`, or a single key as
  content.
- **DataTable** (every existing prop works as before): `density` (bindable `DataDensity`) with
  `densityToggle`; `visibleColumns` (bindable) with `columnChooser` and `hideable` per column;
  `rowHref` and `linkColumn`; the `rowActions` snippet (a pinned last column; `actions` is
  unchanged); `loadingRows`; `error` and `onRetry`; the snippets `toolbar`, `empty` (gets
  `{ filtered, clear }`) and `errorState`; `compactLabel`, `columnsLabel`, `onDensityChange`,
  `onVisibleColumnsChange`. `aria-sort` on sortable headers was already there. Changes in what
  it renders: `loading` with no rows now draws one skeleton per cell (it was one bar per row), and
  the empty row holds an EmptyState (the class `ta-datatable-empty` is gone). The root is now a
  size container (`container-type: inline-size`).
- **MenuItem**: `checked` and `checkType` (`checkbox`, `radio`): a `menuitemcheckbox` or
  `menuitemradio` with `aria-checked` and a check mark. The menu keyboard now reaches every
  `menuitem*` role.
- New label keys, in `en` and `es`: `filters`, `addFilter`, `clearAll`, `noActiveFilters`,
  `activeFilterOne`, `activeFilters`, `removeFilter`, `yes`, `no`, `emptyTitle`,
  `noResultsTitle`, `errorTitle`, `retry`, `unsavedChanges`, `saving`, `formActions`, `changes`,
  `added`, `removed`, `changed`, `noChanges`, `emptyValue`, `showMore`, `showLess`,
  `keyCommand`, `keyOption`, `keyShift`, `keyControl`, `compactRows`, `columns`, `savedViews`,
  `saveView`, `renameView`, `deleteView`, `deleteViewConfirm`, `viewName`, `noSavedViews`,
  `delete`, `openNavigation`, `skipToContent`.

**Charts and BI for public pages.** What a dashboard, a report or an infographic needed and the
kit did not have. Every chart takes plain arrays (the JSON shape is in each header comment),
formats numbers through `format` / `locale`, shows a labelled empty state (`emptyText`, default
text `noData`), carries its values in text (a legend, a list or the "Show data" table) and is
drawn in SVG or HTML with no chart library.

- **BarChart**: `stacked` (one bar per category, with the total in the tooltip, the readout and
  a `totalLabel` column of the table), `orientation="horizontal"` (category names on the left;
  ↑ ↓ step through the rows and the slider is `aria-orientation="vertical"`; the height grows
  with the rows unless `height` is set), `hideTitle` and `emptyText`. ↑ ↓ now also step through
  columns.
- **LineChart**: `stacked` (stacked areas), `domain={[min, max]}` for a scale that does not start
  at zero, `hideTitle`, `emptyText`, `totalLabel`. The last axis label is right-aligned so it is
  not cut off.
- **DonutChart**: `data` (`DonutSlice[]`: `label`, `value`, `color`), `title`, `hideTitle`,
  `innerRadius` (0 draws a pie), `size`, `centerLabel`, `centerValue`, `legend` (`right`,
  `bottom`, `hidden`), `maxSlices` + `otherLabel`, `format`, `locale`, `emptyText`.
- **ScatterChart**: `data` (`ScatterPoint[]`: `x`, `y`, `label`, `group`), `title`, `hideTitle`,
  `xLabel`, `yLabel`, `height`, `xDomain`, `yDomain`, `xRef`, `yRef`, `showLabels`, `format`,
  `xFormat`, `yFormat`, `labelHeader`, `groupHeader`, `emptyText`, `showDataLabel`,
  `hideDataLabel`. A colour and a shape per group; a slider over the points like the other charts.
- **Heatmap**: `data` (`HeatmapCell[]`: `x`, `y`, `value`), `title`, `hideTitle`, `xs`, `ys`,
  `cornerLabel`, `showValues`, `min`, `max`, `color`, `format`, `locale`, `emptyText`. A real
  table in a focusable scrolling region; `--ta-heatmap-sticky-bg` sets the background of the
  fixed row headers.
- **Funnel**: `data` (`FunnelStep[]`), `title`, `hideTitle`, `align`, `color`, `format`,
  `locale`, `stepLabel`, `emptyText`.
- **BarList**: `data` (`BarListItem[]`: `label`, `value`, `href`, `note`, `color`), `title`,
  `ariaLabel`, `ranked`, `max`, `limit`, `color`, `format`, `locale`, `emptyText`.
- **Sparkline**: `data` (numbers), `label`, `width`, `height`, `variant` (`line`, `bar`), `area`,
  `color`, `format`, `locale`, `ariaLabel`.
- **KpiCard**: `label`, `value`, `unit`, `delta`, `deltaLabel`, `deltaFormat`, `goodWhen` (`up`,
  `down`, `none`), `trend`, `target`, `targetLabel`, `format`, `locale`, `span`. Stat is unchanged.
- **Gauge**: `value`, `min`, `max`, `label`, `variant` (`semi`, `ring`), `tone`, `target`,
  `targetLabel`, `size`, `format`, `locale`.
- **BigNumber**: `value`, `prefix`, `unit`, `label`, `size`, `align`, `animate`, `duration`,
  `color`, `format`, `locale`. **IconArray**: `value`, `total`, `label`, `columns`, `shape`,
  `size`, `color`, `showSummary`, `countLabel` and the `icon` snippet. **Timeline**: `items`
  (`TimelineItem[]`: `date`, `title`, `description`, `tag`, `tone`, `href`, `current`),
  `ariaLabel`, `locale`, `dateFormat`, `emptyText`. **ComparisonBar**: `left`, `right`
  (`ComparisonSide`: `label`, `value`, `color`), `title`, `ariaLabel`, `showShare`, `format`,
  `locale`.
- **DashboardGrid** (`columns`, `gap`; container queries: 4 → 2 → 1 columns), **DashboardItem**
  (`span`) and **ChartCard** (`title`, `description`, `level`, `note`, `source`, `sourceHref`,
  `sourceLabel`, `span`, and the `toolbar` and `footer` snippets).
- **ChartLegend**: `items` (`ChartLegendItem[]`: `label`, `value`, `color`, `shape`), `marker`,
  `orientation`. BarChart and LineChart now draw their legend with it.
- New label keys, in `en` and `es`: `noData`, `other`, `total`, `source`, `target`, `trendUp`,
  `trendDown`, `trendFlat`, `better`, `worse`, `countOf`, `trendSummary`, `ofPreviousStep`,
  `label`, `group`.
- Internal: BarChart and LineChart share their figure, legend, empty state, data table and
  drawing styles through `internal/chart-figure.svelte`. Class changes: the legend is
  `ta-legend` / `ta-legend-item` / `ta-legend-mark` (was `ta-chart-legend` with
  `ta-chart-swatch` / `ta-chart-line`), and the hidden caption is `ta-chart-hidden` (was
  `ta-hidden`). The "Show data" link takes the accent mixed with the text colour, so it is
  readable on the light theme too.

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
