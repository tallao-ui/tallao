## What and why

## Components touched

<!-- e.g. DataTable (new prop `stickyHeader`), i18n (new label `clearAll`) -->

## How it was tested

- [ ] `pnpm check`
- [ ] `pnpm test` (dom and ssr projects)
- [ ] `pnpm package`
- [ ] `pnpm kit:check`, if it touches SSR, hydration, forms or ids
- [ ] A test that fails without this change, if it fixes a bug
- [ ] Keyboard and screen reader behaviour checked for the components touched
- [ ] No public export, prop, label key or token removed or renamed without a deprecation path
- [ ] New texts added to `en` and `es` in `src/lib/i18n.ts`
- [ ] README component table and `CHANGELOG.md` (`## Unreleased`) updated
- [ ] No secrets, tokens or `.env` files in the diff
