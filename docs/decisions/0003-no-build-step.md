# ADR 0003 — No build step for the site

**Status:** accepted (2026-11-04)

## Context

Frameworks and static-site generators add a toolchain: dependencies to audit,
a build to reproduce, output to verify against source. This site is small
(one page, one 404, one stylesheet, one script) and mostly hand-authored.

## Decision

Ship hand-written HTML/CSS/JS from the repository root. GitHub Pages serves it
directly. There are no partials, no bundler, no transpiler. Asset URLs carry a
manual `?v=` cache-buster that is bumped when a shared asset changes.

## Consequences

- Anyone can read the deployed source; `view-source` equals the repository.
- Edits require discipline the build would otherwise enforce: cache-buster bumps, no dead CSS, no drift — enforced by `slop-scan`, `tokens-check`, `verify-live`, and the CI guard instead of a bundler.
- Two runtime features (bs-today, panchang-today) fetch live data at read time rather than baking it in — this is only possible because there is no build to bake it in, and it is why they must tolerate stale/unavailable sources.
- If a generator is ever adopted, this ADR must be superseded and the README's "no build step" claim removed in the same change.
