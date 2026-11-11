---
name: build-with-tallao
description: >-
  Build a screen with the tallao kit: pick the right components and compose them. Use when the
  user asks for "an agent run screen", "a chat with tool calls and approvals", "an admin list
  page", "a record detail / edit page", "a dashboard", "an infographic", or any page "with
  tallao" / "with the kit" in an app that installs it (the Kitsuden admin, a kon view, an Astro
  site). Not for changing the kit itself: that is `new-component` and `fix-component`.
---

# Build with tallao

Read `llms.txt` at the repository root first: every component with its purpose, props and a
usage example, generated from the sources. Then open the header comment of each component you
are going to use (`src/lib/components/<name>.svelte`): it is the contract (ARIA pattern,
keyboard, SSR). Do not invent props, variants or snippets, and do not hand-roll what the kit has.

Each kind of screen below has a working composition in this repository. Copy its order and who
owns which state; change the data.

## 1. An agent run screen — `src/AgentDemo.svelte`

| Need | Component |
| --- | --- |
| What the user asked | `ChatMessage role="user"` |
| What the model was given | `ContextCards` (removable with `onRemove`) |
| Its reasoning | `Thinking` (`running`, `summary`, `steps`; it collapses to "Thought for 12 s") |
| The tools it called | `ToolChips` (a chip with `name` / `args` unfolds a `ToolCallCard`) |
| Work in flight | `TaskList` (rows; `variant="capsule"` next to the prompt) or `Steps` for a plan |
| A human decision | `ApprovalCard` (`changes` → DiffView, `tool` + `args`, `risk`, async `onApprove` / `onReject`) |
| The answer as it arrives | `StreamingText` (`text` that grows, or `stream`) |
| What it cites | `Sources` |
| A next step it suggests | `RecommendationCard`; something it noticed in the data: `InsightCard` |
| Quota | `UsageMeter` |
| The input | `PromptInput` (+ `SuggestionChips`) |

Rules: the page owns the run state and passes it down; nothing here fetches. One `ApprovalCard`
per decision, `status` set by the page once the server answers. Never put the streamed text in
an `aria-live` region of your own: `StreamingText` already speaks it sentence by sentence.

## 2. An admin list / detail page — `src/AdminDemo.svelte`

- Frame: `AppShell` with a `Sidebar`, `Breadcrumb`, a command button (`Kbd`) and the user menu.
  Inside a page that already has landmarks (a kon view in the admin): `landmarks={false}`, or no
  shell, and wrap the view in `ThemeScope`.
- List: `PageHeader` → `FilterBar` (+ `SavedViews` in its `end` snippet) → `SelectionBar` (only
  while something is selected) → `DataTable` (`rowHref`, `rowActions`, `densityToggle`,
  `columnChooser`, `loading`, `error` + `onRetry`, an `empty` snippet with `EmptyState`) →
  `Pagination`. Keep `FilterBar`'s `value` in the URL with `filtersToQuery` / `filtersFromQuery`;
  with a server, `DataTable manual` and the page asks the API.
- Detail: `PageHeader` (status `Badge`, `meta`, `Tabs panels={false}`) → fields (`Field`, `Input`,
  `Select`, `Switch`… or `SchemaForm`) next to a `DescriptionList` ("About") → `Timeline` +
  `DiffView` for history → `SaveBar` (`dirty`, `saving`, `form`).
- Destructive actions go through `ConfirmDialog`; results through `toast()`.

## 3. A public dashboard or infographic — the `#dashboard` section of `src/App.svelte`

- Layout: `DashboardGrid` with `KpiCard` on the first row and each chart in a `ChartCard`
  (`title`, `description`, `source`), `span` per item.
- Pick the chart by the question: change over time `LineChart`; compare categories `BarChart`
  (`stacked`, `orientation="horizontal"` for long names); parts of a whole `DonutChart`; two
  measures `ScatterChart`; a matrix `Heatmap`; a ranking `BarList`; a sequence `Funnel`; a
  profile of several stats `RadarChart`; one figure `Gauge`, `BigNumber`, `Stat`; a live count
  `RollingCounter`; "7 of 10" `IconArray`; two sides `ComparisonBar`; dated events `Timeline`.
- Every chart takes plain arrays and carries its values in text (a legend, the "Show data"
  table): pass `locale` and `format`, and never encode meaning in colour alone.

## Motion

- Use `tallao/motion` and the tokens (`--ta-duration-fast | base | slow`,
  `--ta-ease-out | in-out | spring`), not ad-hoc durations: `rise` for things that enter a list
  or a thread (`stagger(i)` for several), `collapse` for a block that opens, `scaleIn` for
  overlays, `slide` for sheets, `crossfade` for an item that changes place, `shake(node)` on an
  invalid submit, `viewTransition(update)` for a route change.
- 120–240 ms, opacity and transform only, never a delay before the user can act. The kit's own
  overlays, menus, tabs and toasts already move: do not add a second animation on top.
- Reduced motion is handled by the library and the tokens (the system setting or
  `data-tallao-motion="reduce"` on `<html>`): do not write your own `matchMedia` check, and do
  not use raw `transition:` functions from `svelte/transition` that ignore it.

## Before you finish

- Texts: the kit's own are English; `setLabels(es)` in the root for Spanish. Your page's texts
  are yours: pass them as props (`title`, `label`, `actionLabel`…).
- Check it at 390px wide and with the keyboard alone; run the app's type check and tests.
- If the kit lacks a piece, say so and propose it for the kit (`new-component`) rather than
  building a one-off next to the page.
