# ADR 0004 — Contact is GitHub-only

**Status:** accepted (2026-11-04)

## Context

The site needs at least one contact path. Options: a mailto address (spam
surface, a mailbox to monitor), a form (backend, spam handling, privacy
questions), or the GitHub organisation page.

## Decision

The Links section and footer point to `github.com/namunaONE` only. No email
address, no form, no chat widget.

## Consequences

- Issues and discussions are public, searchable, and archived — the same standard the data is held to.
- Users without a GitHub account cannot open an issue; they can still read and use everything.
- If a contact channel is added later, it gets a row in the Links section and this ADR is superseded.
