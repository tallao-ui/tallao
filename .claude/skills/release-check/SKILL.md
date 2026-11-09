---
name: release-check
description: >-
  Full pre-release verification of the tallao kit. Use when the user asks "is it ready to
  release", "run the release checks", "pre-release check", "verify everything", or before bumping
  the version or tagging a release.
---

# Release check

Run every step, even after a failure, and report a table: step, result, and what failed.
Do not fix anything unless the user asks; do not commit, tag or push.

1. **Types.** `pnpm check`
2. **Tests.** `pnpm test` (dom and ssr projects), in the background; read the summary. Rerun a
   file alone if a worker failed to start.
3. **Package.** `pnpm package` (svelte-package + publint) passes, and `dist/` holds every entry
   point in `package.json` `exports`: `index.js`, `map/index.js`, `code/index.js`, `tokens.css`,
   `base.css`, each with its `.d.ts` where `exports` names one.
4. **Demo.** `pnpm build:demo`
5. **Real app.** `pnpm kit:check` (needs Chromium:
   `pnpm --filter tallao-kit-check exec playwright install chromium`).
6. **Exports and docs agree.** Every `export { default as X }` in `src/lib/components/index.ts`,
   `src/lib/map/index.ts` and `src/lib/code/index.ts` appears in the README component table (parts
   such as `CardHeader` or `MenuItem` may share their parent's row), and no row names a component
   that is not exported.
7. **Version and changelog.** The `package.json` version is the top released heading of
   `CHANGELOG.md`, or `## Unreleased` holds the changes waiting for the next one. The README
   version badge matches `package.json`.
8. **Labels.** Every key of `Labels` in `src/lib/i18n.ts` has an `en` and an `es` value
   (`pnpm check` enforces it), and no component hard-codes a visible English string.
9. **Spanish scan.** Code, docs and default texts are English; Spanish lives only in the `es`
   labels. Search tracked files outside `src/lib/i18n.ts`:
   ```bash
   git grep -nIwiE 'para|los|las|que|con|una|del|está|también|cuando|según|ningún' -- \
     ':!pnpm-lock.yaml' ':!src/lib/i18n.ts' ':!*.json' | head -50
   ```
   Review each hit; prose is not fine, identifiers kept for compatibility are.
10. **Secrets scan.** No `.env` file is tracked (`git ls-files | grep -E '(^|/)\.env'` prints
    nothing), and no key or token is in the tree:
    ```bash
    git grep -nIE '(sk-ant-|sk_live_|ghp_|github_pat_|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY)' | head
    ```
    Never print a matching value in the report: name the file and line only.
11. **Clean tree.** `git status --short` shows only intended changes: no `dist/`, `demo-dist/`,
    `.svelte-kit/`, logs or scratch files.
