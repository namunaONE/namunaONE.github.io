# ADR 0006 — CI gates the Pages deploy

**Status:** accepted (2026-11-04)

## Context

GitHub Pages can deploy straight from the branch: every push to `main` goes
live, gates or no gates. The Guardian checks (static scanner, self-test, gate
coverage, flow integrity, skill lint, live verification) were advisory unless
someone ran them.

## Decision

`.github/workflows/guardian.yml` runs the full guard on every PR and push, plus
a weekly cron. Deployment uses `actions/deploy-pages` and depends on the guard
job: a failing gate means a no-deploy, not a tripwire discovered afterward.

## Consequences

- A broken or sloppy push cannot reach production; the guard fails first.
- Pages must be configured with Source = "GitHub Actions" (one-time setting).
- A live-source outage (registry down, GitHub API rate limit) must degrade to warnings, not blocks — the guard distinguishes FAIL (blocks) from WARN (visible).
- The weekly cron catches time-based drift (link rot, figure staleness) even when no code changes.
