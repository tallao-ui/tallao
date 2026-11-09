# Security policy

## Supported versions

tallao is before 1.0. Only the latest release receives security fixes; a fix ships in the next
version and is recorded in `CHANGELOG.md`.

## Reporting a vulnerability

Please do not open a public issue. Report it privately through
[GitHub private vulnerability reporting](https://github.com/tallao-ui/tallao/security/advisories/new).

Include what you can of:

- the affected component or file, and the tallao version or commit;
- the steps to reproduce it, ideally with a minimal Svelte component or a failing test;
- what an attacker gains (for example script injection through a prop, a link or pasted
  content), and what control over the input they need first.

You can expect an acknowledgement within a week. Once a fix is ready, it is released with an
advisory that credits you, unless you prefer otherwise.

## Scope

In scope: the components and code in `src/lib/`, the CSS it ships, and the package as published
from this repository.

Out of scope: the apps that use the kit (report those to their own projects; for Kitsuden, to
[Kitsuden](https://github.com/Kitsuden/kitsuden/security/advisories/new)), vulnerabilities in
third-party dependencies with no tallao-specific impact (report them upstream), and the demo
pages.
