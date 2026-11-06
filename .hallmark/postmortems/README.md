# Postmortems — blameless failure reviews

When an SLO error budget is consumed (see `docs/slos.md`), a blameless postmortem
is required before feature work resumes. Postmortems live here as numbered
markdown files: `YYYYMMDD-slug.md`.

## When to write one

Any of the following triggers a postmortem:

- A guardian CI run fails (red guard job)
- A scanner rule produces an unfixable false positive
- An eval scenario fails
- Scan time p95 exceeds 120s for three consecutive weeks
- An expired waiver is discovered
- A figure drifts past its budget (A19 hard fail)

## What goes in one

Use the template in `TEMPLATE.md`. Every postmortem must answer:

- **What happened** — the failure, in plain language
- **Impact** — what was affected, who noticed, how long it lasted
- **Root cause** — why it happened, not just what broke
- **Detection** — how it was found (CI, reviewer, user, slop-scan, etc.)
- **Resolution** — how it was fixed, and when
- **Prevention** — which gate/check catches it next time
- **Follow-up actions** — concrete tasks, each with an owner and due date

## Numbering

Files are named `YYYYMMDD-<slug>.md` where the date is the date of the
incident (or discovery). The first postmortem is `0001` if you want a
sequential prefix; otherwise use the date.

## Process

1. Write the postmortem using `TEMPLATE.md`.
2. Add a link to it from this README's index.
3. Add a `.hallmark/log.json` entry (event: `postmortem`, slug: the postmortem slug).
4. Resolve every follow-up action before declaring the postmortem closed.
5. A closed postmortem un-freezes feature work (if a budget freeze was in effect).

## Index

| Date | Slug | Incident | Status |
|------|------|----------|--------|

*(No postmortems written yet — budgets have not been consumed.)*
