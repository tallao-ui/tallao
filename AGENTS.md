# tallao: notes for AI agents

Read by Codex, Claude Code (through `CLAUDE.md`) and other agents, both those working on this
repository and those building an app with the kit. The human documentation is `README.md`; the
history of every prop, text and class is `CHANGELOG.md`.

## What this repository is

A **Svelte 5** UI kit for generative interfaces, extracted from the Kitsuden admin and decoupled
from Tailwind, stores and APIs. Plain CSS on `--ta-*` tokens, accessible by keyboard and screen
reader, SSR-ready (SvelteKit). It is published with `svelte-package` and installed from GitHub; the
Kitsuden admin views and kons use it, and so do Astro sites as islands.

## Using the kit in an app

```bash
pnpm add github:tallao-ui/tallao   # builds dist/ on install through `prepare`
```

```svelte
<script>
  import "tallao/tokens.css";
  import "tallao/base.css";
  import { Button, Dialog, DropdownMenu, MenuItem } from "tallao";
</script>
```

| Entry point | What it holds |
| --- | --- |
| `tallao` | every component, `toast()` / `toasts`, `setLabels`, `setDefaultLabels`, `useLabels`, `en`, `es`, `cn`, and the public types |
| `tallao/map` | `GameMap` (optional peers `leaflet`, `sveaflet`) |
| `tallao/code` | `CodeEditor` (optional peers `@codemirror/*`, `@lezer/highlight`) |
| `tallao/tokens.css` | every `--ta-*` variable; dark by default, `data-tallao-theme="light"` on `<html>` for light |
| `tallao/base.css` | base styles |

Requires Svelte 5.29 or later (`peerDependencies`). Before using a component, read its header
comment in `src/lib/components/<name>.svelte` and its `Props` interface: they are the reference,
not your memory of other kits. Do not invent props, variants or snippets.

- **Triggers.** Popover, Tooltip and DropdownMenu take the trigger as a snippet and hand it the
  props it must carry: `{#snippet trigger(props)}<Button {...props}>…</Button>{/snippet}`.
- **Texts.** The kit's own texts are English by default; `setLabels(es)` in the root component
  switches them (per request, through context). With no common root (Astro islands),
  `setDefaultLabels(es)`, only in the browser when a server serves several languages. An explicit
  prop (`closeLabel`, `emptyText`, ToolCallCard's `labels`…) wins over both.
- **Forms.** With `name`, Switch, Combobox, KeyValueEditor, DatePicker, FileUpload and CodeEditor
  submit in a plain `<form method="POST">`, also without JavaScript. SchemaForm is the `<form>`.
- **Shadow DOM.** `:root` tokens do not reach inside a Shadow DOM: wrap the view in
  `<ThemeScope>` (`source="kitsuden"` maps `--kitsuden-*` to `--ta-*`). This is how kon views
  (custom elements) use the kit.
- **Server-rendered navigation.** NavMenu, MegaMenu and BottomNav are `<details>`-based markup that
  works with no hydration.

## Component map

All under `src/lib/components/` (kebab-case file, PascalCase export in `components/index.ts`).

| Family | Components |
| --- | --- |
| Actions and feedback | Button, Badge, Spinner, Alert, Progress, Skeleton, Toaster + `toast()`, CopyButton, Stat, Icon, Avatar |
| Forms | Input, Textarea, Select, Checkbox, Label, Field, SearchInput, NumberInput, Slider, Switch, Toggle, ToggleGroup, RadioGroup, Rating, InputOTP, Combobox, KeyValueEditor, FileUpload, Calendar, DatePicker, SchemaForm, CodeEditor (`tallao/code`) |
| Overlays and menus | Dialog, Sheet, ConfirmDialog, Popover, Tooltip, DropdownMenu + MenuItem / MenuSeparator / MenuLabel, ContextMenu, Command |
| Navigation and layout | Card (+ CardHeader / CardTitle / CardContent / CardFooter), Tabs, Accordion, Breadcrumb, Pagination, Sidebar, NavMenu, MegaMenu, BottomNav, SplitPane, Carousel, ThemeScope |
| Data | Table (+ TableHeader / TableBody / TableRow / TableHead / TableCell), DataTable, MonthView, CompareSlider, SelectionBar, DragBoard + DropZone / DragItem, GameMap (`tallao/map`) |
| Charts and BI | BarChart, LineChart, DonutChart, ScatterChart, Heatmap, Funnel, BarList, Sparkline, Gauge, ChartLegend, KpiCard, BigNumber, IconArray, Timeline, ComparisonBar, DashboardGrid + DashboardItem, ChartCard |
| Generative UI | PromptInput, ToolCallCard, ChatMessage, Steps, SuggestionChips, CodeBlock, Sources, UsageMeter |

Shared code: `src/lib/internal/` (floating layer: top layer + Floating UI positioning + layer
stack in `layers.ts`, `position.ts`, `menu.ts`; focus, scroll lock, dates, charts, drag board),
`src/lib/i18n.ts` (the `Labels` interface and `en` / `es`), `src/lib/utils.ts` (`cn`),
`src/lib/toast.svelte.ts`, `src/lib/tokens.css`, `src/lib/base.css`. `src/App.svelte` is the demo
(`pnpm dev`); `kit-check/` is a SvelteKit 3 app that consumes the package in CI.

## Conventions in the code

- **Svelte 5 runes only:** `$props()` with a typed `Props` interface, `$state`, `$derived`,
  `$effect`, snippets for content. No `export let`, no `on:` directives, no stores.
- **Header comment:** components open with `<!-- tallao — Name … -->` describing what they are and
  the contract they keep (ARIA pattern, keyboard, SSR behaviour). A new one must have it.
- **Pass-through:** `class` is merged with `cn("ta-…", className)`; many components also spread the
  remaining props (`...rest`) onto their root element, and their `Props` says so.
- **Styling:** plain scoped CSS, classes prefixed `ta-`, colours only through `--ta-*` tokens
  (`rgb(var(--ta-surface) / <alpha>)`). No Tailwind, no hard-coded theme colours.
- **Texts:** never hard-code a user-visible string. Add a key to `Labels` in `src/lib/i18n.ts`,
  give it an English value in `en` and a Spanish one in `es` (the types make both required), read
  it with `useLabels()`, and let a prop override it.
- **SSR:** nothing touches `window` or `document` on import or during server render; ids come from
  `$props.id()`, never `Math.random()`.
- **Accessibility:** follow the matching WAI-ARIA APG pattern; colour is never the only cue;
  respect `prefers-reduced-motion`.
- **Touch:** every control a component draws has a 44px target under `@media (pointer: coarse)`
  (the control grows, or an absolutely positioned `::after` widens the hit area). Fields use 16px
  text there. `tests/dom/touch-targets.test.ts` fails a component that lacks the rule.

## Commands

```bash
pnpm test        # vitest: dom project (jsdom: behaviour, keyboard, axe) + ssr project (Node)
pnpm check       # svelte-check
pnpm package     # svelte-package into dist/ + publint
pnpm build:demo  # builds the demo
pnpm dev         # the demo
pnpm kit:check   # the SvelteKit app in kit-check/: prerender + hydration in Chromium (Playwright)
pnpm vitest run tests/dom/<file>.test.ts   # one file
```

CI (`.github/workflows/ci.yml`) runs `check`, `test`, `package`, `build:demo` and the kit-check
build and Playwright tests on every push to `main` and every pull request.

## Tests

- `tests/dom/*.test.ts` mount components from fixtures in `tests/fixtures/` with
  `@testing-library/svelte`; `tests/axe.ts` gives `axeViolations(root)` (contrast is checked in the
  browser, not in jsdom). `tests/setup.ts` polyfills the modal `<dialog>` for jsdom.
- `tests/ssr/render.test.ts` renders the fixtures with `svelte/server`, without `window`, and
  checks the HTML is identical across renders (stable ids).
- `tests/fixtures/AllComponents.svelte` feeds the axe and SSR suites: a new component goes in it.

## Rules

- **Never break a public export.** Removing or renaming a component, prop, snippet, event, label
  key, type or token is a breaking change: it needs a deprecation path and a CHANGELOG entry that
  says so. Internal classes and data attributes can change, and the CHANGELOG notes it.
- **A new component comes with** its export in `components/index.ts` (and its types), a fixture and
  a test in `tests/dom/` (behaviour, keyboard, axe), an entry in `AllComponents.svelte`, a touch
  rule, a row in the README component table and an entry under `## Unreleased` in `CHANGELOG.md`.
- **A bug fix comes with** a test that fails without it.
- **Dependencies:** heavy libraries stay optional peers behind their own entry point (as
  `tallao/map` and `tallao/code` do). The only runtime dependency is `@floating-ui/dom`.
- **Language:** code, comments, docs, tests and default texts are in English; Spanish lives only
  in the `es` labels.
- Never write a token or key into a file, and never commit `dist/`, `demo-dist/` or `.svelte-kit/`.

## Tools for agents

- `.claude/settings.json`: shared Claude Code permissions. `pnpm check`, `test`, `package`,
  `build:demo`, `kit:check`, single vitest files and read-only git are allowed; reading `.env`
  files, `git push` and `pnpm publish` / `npm publish` are denied.
- `.claude/skills/`: step-by-step skills, usable by any agent that reads Markdown:
  - `new-component`: add a component with its export, labels, touch rule, tests and docs;
  - `fix-component`: change or fix a component without breaking its public contract;
  - `release-check`: the full pre-release verification.
- `CONTRIBUTING.md`: setup, commands and the pull request checklist.
