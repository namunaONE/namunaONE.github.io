# Namuna Flow — Elephant–Goldfish design pipeline

Phase 2 of the Namuna Design system. Composable skills for spec-first, review-before-build design work.

## Skills

| Skill | Role | Context | Triggers |
|---|---|---|---|
| `namuna-brainstorm` | Elephant — deep context | Full repo, STYLEGUIDE, references, log | Rough idea → concept brief |
| `namuna-draft` | Elephant — deep context | Full repo, approved brief | Brief → `docs/designs/<slug>/spec.md` |
| `namuna-review` | Goldfish — zero context | Draft spec + source code only | Spec → ship/fix/rebuild/recapture |
| `namuna-build` | Elephant — deep context | Approved spec + tokens + references | Spec → shipped code |
| `namuna-resolve` | Elephant — deep context | Review findings + spec + waivers | fix/rebuild/recapture → agreed changes |
| `namuna-bootstrap` | Elephant — deep context | Existing code + references | Existing code → draft spec |
| `namuna-drift-report` | Elephant — deep context | Built spec + shipped code | Built code → drift verdict |

## Pipeline

```
namuna-brainstorm <prompt>
    ↓ (user approves brief)
namuna-draft <slug>
    ↓ (spec written)
namuna-review <slug>
    ↓ (reviewer says ship)
namuna-build <slug>          ← builds from spec only
    ↓ (code shipped)
namuna-drift-report <slug>   ← compares spec vs code
```

Review loop (when review doesn't say ship):
```
namuna-review <slug> → fix/rebuild/recapture
    ↓
namuna-resolve <slug>     → agrees changes, records waivers
    ↓
namuna-draft <slug>       (rewrite)  OR  namuna-brainstorm (recapture)  OR  namuna-build (fix)
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
- `drifted` — code no longer matches spec (run `namuna-drift-report`)

## Relation to Guardian

Guardian (`.skills/namuna-guardian/`) is the hard floor: tokens, provenance, anti-slop gates, scanner, waivers. Flow skills run **inside** Guardian's constraints — they never waive A1–A18 without an explicit waiver record.

## Expansion

Flow is complete at 7 skills. Any further addition (e.g. `namuna-audit` for one-off page audits) follows the same pattern: one SKILL.md, references only when needed, Guardian floor always respected.