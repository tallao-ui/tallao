---
name: fix-component
description: >-
  Fix or change an existing tallao component without breaking its public contract: a bug, a new
  prop or variant, an accessibility or touch fix, a styling change. Use when the user reports a
  bug in a component, or asks to fix, extend, restyle or refactor anything under src/lib/.
---

# Fix or change a component

1. **Read first.** The component's header comment and `Props` interface, the shared code it
   imports from `src/lib/internal/`, and the tests that cover it
   (`grep -rln "<Name>" tests/`). Read its `CHANGELOG.md` entries: they record decisions (why a
   behaviour is the way it is) that a fix must not undo.
2. **Reproduce.** For a bug, write a test that fails before changing code: in `tests/dom/` for
   behaviour, keyboard or ARIA; in `tests/ssr/render.test.ts` for server rendering or unstable ids.
3. **Keep the public contract.** Props, snippets, events, label keys, exported types, `--ta-*`
   tokens and entry points are public. Add, do not rename or remove. If a break is unavoidable,
   keep the old name working, and say so in the CHANGELOG. Internal `ta-` classes and data
   attributes may change; note it in the CHANGELOG.
4. **Keep the conventions.** Runes only; visible texts from `useLabels()` with `en` and `es` values;
   colours from tokens; nothing touching `window` on the server; ids from `$props.id()`; the 44px
   rule under `@media (pointer: coarse)`; `prefers-reduced-motion` respected.
5. **Shared code.** A change in `src/lib/internal/` (layers, positioning, menus, focus, scroll lock)
   affects Popover, Tooltip, DropdownMenu, ContextMenu, Combobox and Dialog alike: run their tests
   too (`tests/dom/floating.test.ts`, `dialog.test.ts`).
6. **Docs stay true.** Update the header comment, the README table row and add an entry under
   `## Unreleased` in `CHANGELOG.md`.
7. **Check.**
   ```bash
   pnpm vitest run tests/dom/<the component's tests>
   pnpm check
   pnpm test
   pnpm package
   ```
   Add `pnpm kit:check` for anything touching SSR, hydration, ids or form submission. Under load,
   rerun a failing file alone before concluding it is broken.

Report what changed, the test that proves it, and anything you could not run. Do not commit unless
asked.
