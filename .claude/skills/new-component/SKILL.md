---
name: new-component
description: >-
  Add a new component to the tallao kit, from file to passing tests and docs. Use when the user
  asks to "add a component", "create a <Name> component", "we need a <widget> in tallao", or for a
  UI piece no existing component in src/lib/components/ covers.
---

# New component

Read `AGENTS.md` first, then one existing component close to the new one (for example
`src/lib/components/spinner.svelte` for a small one, `slider.svelte` or `combobox.svelte` for an
interactive one) and its test in `tests/dom/`. Check `src/lib/components/index.ts`: if a component
already covers the need, extend it instead (use `fix-component`).

1. **File.** `src/lib/components/<kebab-name>.svelte`, opening with
   `<!-- tallao — <Name> … -->`: what it is, the WAI-ARIA APG pattern it follows, its keyboard,
   how it behaves without JavaScript or on the server.
2. **Script.** `<script lang="ts">`, Svelte 5 runes only: a typed `Props` interface with a doc
   comment per prop, `const { …, class: className = "", ...rest }: Props = $props()`, `$state` /
   `$derived` / `$effect`, snippets for content. Ids from `$props.id()`. Nothing touches `window`
   or `document` outside `$effect` or event handlers.
3. **Texts.** No hard-coded visible text: add keys to the `Labels` interface in
   `src/lib/i18n.ts` with values in both `en` and `es`, read them with `const L = useLabels()`, and
   expose a prop that overrides each one.
4. **Styles.** Scoped `<style>`, classes prefixed `ta-<name>`, merged with
   `cn("ta-<name>", className)`. Colours only from tokens: `rgb(var(--ta-…) / <alpha>)`. Respect
   `prefers-reduced-motion`. Add `@media (pointer: coarse)` rules giving every control a 44px
   (`2.75rem`) target, growing the control or widening an absolute `::after`.
5. **Export.** `export { default as <Name> } from "./<kebab-name>.svelte";` plus its public types
   in `src/lib/components/index.ts`. A component that needs a heavy library goes behind its own
   entry point (like `src/lib/map/`) with optional peers in `package.json`.
6. **Tests.**
   - Add it to `tests/fixtures/AllComponents.svelte` (axe and SSR suites use it).
   - A fixture in `tests/fixtures/` if it needs a harness, and `tests/dom/<topic>.test.ts`:
     roles and names, keyboard, the events it fires, and `axeViolations()` from `tests/axe.ts`.
   - If it has server-specific behaviour, a case in `tests/ssr/render.test.ts`.
7. **Docs.** A row in the README component table, in the same style as its neighbours, and an
   entry under `## Unreleased` in `CHANGELOG.md` naming every prop, snippet and new label key.
   Optionally show it in the demo (`src/App.svelte`).
8. **Check.**
   ```bash
   pnpm vitest run tests/dom/<topic>.test.ts tests/dom/touch-targets.test.ts tests/dom/axe.test.ts
   pnpm check
   pnpm test
   pnpm package
   ```
   Add `pnpm kit:check` if it submits in forms or renders on the server in a special way. Fix every
   failure; never add the component to the touch-target `EXEMPT` list without a real reason.

Never write a token or key into a file. Do not commit unless the user asks.
