# ADR 0007 — Machine-readable registries for tokens and figures

**Status:** accepted (2026-11-05)

## Context

Truth used to live in several human-maintained copies at once: the `:root`
blocks in `style.css`, the token tables in `STYLEGUIDE.md`, the token list in
`.opencode/skills/namuna-guardian/references/design-system.md` — and for numbers, the page itself plus whatever
the maintainer remembered. Copies drift; drift is how verified pages start
lying. The A1 and A19 gates were only enforceable once a machine-readable
source existed.

## Decision

Two registries:

- `design/tokens.json` — every custom property in the `:root` blocks (light,
  dark, contrast-more), regenerated from CSS with
  `node scripts/tokens-check.mjs --write`. CI verifies CSS ↔ registry in both
  directions and that docs mention no token that does not exist.
- `design/figures.json` — every published figure with its page pattern and
  live source. `verify-live.mjs` checks page ↔ registry ↔ source (A19).

Severities: `fail` blocks CI; `warn` reports (fast-moving values like commit
counts); `info` is registered for page-presence only (manual sources).

## Consequences

- Editing `:root` means running `--write` (or the same edit twice, which the
  check will catch).
- Adding a figure to the page means adding a registry entry — the guard will
  not let an unregistered claim hide.
- Docs cannot name phantom tokens; ranges and ids are checked by
  `skill-lint.mjs`.
- Registries are versioned alongside the code they describe; they are not
  generated at deploy time (the site has no build step — ADR 0003).
