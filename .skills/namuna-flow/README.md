# Namuna Flow — Elephant–Goldfish design pipeline

Phase 2 of the Namuna Design system. Composable skills for spec-first, review-before-build design work.

## Skills

| Skill | Role | Context | Triggers |
|---|---|---|---|
| `namuna-brainstorm` | Elephant — deep context | Full repo, STYLEGUIDE, references, log | Rough idea → concept brief |
| `namuna-draft` | Elephant — deep context | Full repo, approved brief | Brief → `docs/designs/<slug>/spec.md` |
| `namuna-review` | Goldfish — zero context | Draft spec + source code only | Spec → ship/fix/rebuild/recapture |

## Pipeline

```
namuna-brainstorm <prompt>
    ↓ (user approves brief)
namuna-draft <slug>
    ↓ (spec written)
namuna-review <slug>
    ↓ (reviewer says ship)
namuna-build <slug>   ← your coding agent, builds from spec only
```

## References (shared truth)

```
.skills/namuna-flow/references/
├── design-system.md      # tokens, type, spacing, motion (from STYLEGUIDE.md)
├── provenance.md         # real / placeholder / absent material ledger
├── anti-slop-gates.md    # A1–A18 pass/fail checks
├── macrostructures.md    # 21 page shapes (load only the one you pick)
├── themes/index.json     # 50 theme catalog (deal 3, pick 1)
└── direction.md          # custom-run replacement for draw/layout/genre
```

## Status states

- `draft` — spec still being written
- `approved` — review passed; ready to build
- `built` — code shipped; drift-check pending
- `drifted` — code no longer matches spec (run `namuna-drift`)

## Relation to Guardian

Guardian (`.skills/namuna-guardian/`) is the hard floor: tokens, provenance, anti-slop gates, scanner, waivers. Flow skills run **inside** Guardian's constraints — they never waive A1–A18 without an explicit waiver record.

## Expansion

- `namuna-build` — implement from approved spec only (your coding agent, context-limited to spec)
- `namuna-resolve` — work through review findings and agree on changes
- `namuna-bootstrap` — create or update documentation for an existing codebase
- `namuna-drift-report` — compare checked-in spec with current source code; report divergences