# Contributing to tallao

Thanks for helping. Bug reports, fixes, accessibility improvements, documentation and new
components are all welcome. For a new component or a larger change, please open an issue first
(there is a **New component** template) so we can agree on the API before you write it.

Security problems go through [SECURITY.md](SECURITY.md), not public issues.

## Setup

You need Node 22 and pnpm 10 (the versions CI uses).

```bash
git clone https://github.com/tallao-ui/tallao
cd tallao
pnpm install        # also builds dist/ through `prepare`
pnpm dev            # the demo (src/App.svelte)
```

`kit-check/` is a workspace package (`pnpm-workspace.yaml`): a SvelteKit 3 app that installs tallao
like any project. Its Playwright tests need Chromium:
`pnpm --filter tallao-kit-check exec playwright install chromium`.

## Commands

```bash
pnpm check                                  # svelte-check
pnpm test                                   # vitest: dom (jsdom) and ssr (Node) projects
pnpm vitest run tests/dom/<file>.test.ts    # one file
pnpm package                                # svelte-package into dist/ + publint
pnpm build:demo                             # builds the demo
pnpm kit:check                              # kit-check: prerender + hydration in Chromium
```

CI (`.github/workflows/ci.yml`) runs `check`, `test`, `package`, `build:demo` and the kit-check
build and Playwright tests on every push to `main` and every pull request.

## What the tests check

| Where | What it enforces |
| --- | --- |
| `tests/dom/*.test.ts` | behaviour and keyboard, mounted in jsdom from `tests/fixtures/` |
| `tests/dom/axe.test.ts` | no axe violations in `AllComponents.svelte`, closed and with the dialog open (contrast is checked in the browser) |
| `tests/dom/labels.test.ts` | the kit's texts default to English and switch with `setLabels` / `setDefaultLabels` |
| `tests/dom/touch-targets.test.ts` | every component that draws a control has a 44px rule under `@media (pointer: coarse)` |
| `tests/ssr/render.test.ts` | components render in Node without `window`, with the same HTML on every render |
| `kit-check/` | complete prerender with no state shared between pages; hydration with no mismatches |

## Adding a component

1. Write `src/lib/components/<name>.svelte` (kebab-case) with Svelte 5 runes: a header comment
   (`<!-- tallao — Name … -->`) stating what it is and its ARIA pattern, a typed `Props`
   interface, `class` merged with `cn()`, scoped CSS on `--ta-*` tokens with `ta-` classes.
2. Every visible text the kit adds comes from `useLabels()`: add the key to `Labels` in
   `src/lib/i18n.ts` with an English (`en`) and a Spanish (`es`) value, and let a prop override it.
3. Give every control a 44px target under `@media (pointer: coarse)`.
4. Export it (and its public types) from `src/lib/components/index.ts`.
5. Add it to `tests/fixtures/AllComponents.svelte`, and write a fixture and a test in `tests/dom/`
   for its behaviour and keyboard. If it renders differently on the server, cover that in
   `tests/ssr/render.test.ts`.
6. Add a row to the component table in `README.md` and an entry under `## Unreleased` in
   `CHANGELOG.md`.

Heavy third-party libraries go behind their own entry point as optional peers, the way
`tallao/map` (Leaflet) and `tallao/code` (CodeMirror) do.

## Rules

- **Public API:** components, props, snippets, events, label keys, exported types, tokens and the
  entry points in `package.json` `exports` are public. Do not remove or rename them without a
  deprecation path and a CHANGELOG entry that says it breaks.
- **Accessibility:** follow the WAI-ARIA APG pattern that matches; full keyboard support; colour is
  never the only cue; respect `prefers-reduced-motion`.
- **SSR:** nothing touches `window` or `document` on import or during server render; ids come from
  `$props.id()`.
- **Tests:** a bug fix comes with a test that fails without it.
- **Changelog:** every user-visible change has an entry under `## Unreleased`.
- **Secrets:** never commit a `.env` file, a token or a key.
- **Language:** code, comments, docs, tests and default texts are in English; Spanish lives only in
  the `es` labels.

## Pull request checklist

- [ ] `pnpm check`, `pnpm test` and `pnpm package` pass
- [ ] `pnpm kit:check`, if it touches SSR, hydration, forms or ids
- [ ] A test that fails without the change, for a bug fix
- [ ] No public export, prop, label key or token removed or renamed without a deprecation path
- [ ] README component table and `CHANGELOG.md` (`## Unreleased`) updated
- [ ] No secrets in the diff

By contributing, you agree that your contribution is licensed under the [MIT License](LICENSE).
