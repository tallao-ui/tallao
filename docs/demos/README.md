# Docs demos

One file per component: `docs/demos/<slug>.svelte` (the slug is the component's name in kebab-case:
`TagInput` → `tag-input.svelte`). The docs page of a component draws it live in the "Preview" tab and
shows the very same file in the "Code" tab, so **write it as the code a user would copy**.

## Rules

- Import from the package the way a user does: `import { Button } from "tallao"`, and
  `from "tallao/motion"`, `"tallao/map"`, `"tallao/code"` where it applies. Never from `$lib`.
- Svelte 5 runes only (`$state`, `$derived`, `$props`), `<script lang="ts">`. No `export let`, no stores.
- Short: aim for 8–40 lines. Real, believable content (an agent's run, a record list, a release
  checklist), never lorem ipsum. Show the variants and states that matter, not all of them.
- Interactive where the component is: bind a value, show what a callback received, open the dialog.
- Accessible: every control gets a visible label or an `ariaLabel`.
- Colours only through `--ta-*` tokens (`rgb(var(--ta-text-dim))`); no hard-coded colours.
- First line, optional: `<!-- layout: center -->` sets the stage (it is stripped from the code shown):
  - `center` (default): a row of small things, wrapped and centred: buttons, badges, icons.
  - `stack`: a column up to 30rem: fields, alerts, cards.
  - `wide`: full width: tables, charts, dashboards, shells.
  - `; height: 22` (rem) adds a minimum height for things that open a panel or fly out.

## Check

```bash
pnpm docs:check     # svelte-check on the docs and every demo (props are type-checked)
pnpm docs:dev       # http://localhost:5173 (hash routes: #/c/<slug>)
```

## Writing one

1. Read the component's source in `src/lib/components/<slug>.svelte` (GameMap: `src/lib/map/game-map.svelte`,
   CodeEditor: `src/lib/code/code-editor.svelte`): its header comment is the contract, its `Props` are the API.
   `docs/gen/components.json` has the same, parsed (run `pnpm docs:data` to refresh it).
2. Look for believable data and compositions to reuse in `src/App.svelte`, `src/AgentDemo.svelte` and
   `src/AdminDemo.svelte`: they already use most components with real-looking content.
3. A component with parts (Card → CardHeader, CardTitle…; Table → TableRow…; DropdownMenu → MenuItem…;
   DragBoard → DropZone, DragItem; DashboardGrid → DashboardItem; FilterBar → FilterChip) is ONE page: use
   the parts in the same demo.
4. Run the check and fix every error that names your files. Other demos may be in progress and fail; ignore those:

   ```bash
   npx svelte-check --tsconfig ./docs/tsconfig.json --output machine --threshold error 2>&1 | grep -E "demos[\/](your-slug|other-slug)|COMPLETED"
   ```

Existing demos to copy the tone from: `alert.svelte` (stack), `toaster.svelte` (an action with feedback),
`icon.svelte` (a data-driven set).
