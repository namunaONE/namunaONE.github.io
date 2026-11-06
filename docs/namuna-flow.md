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
.opencode/skills/namuna-guardian/references/
├── design-system.md      # tokens, type, spacing, motion (from STYLEGUIDE.md)
├── provenance.md         # real / placeholder / absent material ledger
└── anti-slop-gates.md    # A1–A20 pass/fail checks + enforced-by matrix

.opencode/skills/namuna-brainstorm/references/
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

Guardian (`.opencode/skills/namuna-guardian/`) is the hard floor: tokens, provenance, anti-slop gates, scanner, waivers. Flow skills run **inside** Guardian's constraints — they never waive A1–A20 without an explicit waiver record.

## Integrity checks (run in CI)

- `node .opencode/skills/namuna-guardian/scripts/slop-scan.mjs .` — the static gates: hex, motion, layout, proofs, waivers (exact ids in the gates table)
- `node .opencode/skills/namuna-guardian/scripts/self-test.mjs` — fixture pairs proving the scanner catches what it claims
- `node .opencode/skills/namuna-guardian/scripts/gate-coverage.mjs` — audits every gate's "enforced by" claim
- `node .opencode/skills/namuna-guardian/scripts/verify-live.mjs index.html` — link liveness (A20/A15) + figure drift (A19)
- `node scripts/flow.mjs check` — spec states, material ledgers (A17), build log, waivers (A18)
- `node scripts/skill-lint.mjs` — skill structure, path references, gate ranges
- `node scripts/a11y-check.mjs` — accessibility CI: contrast, focus, headings, alt, touch targets
- `node scripts/lighthouse-check.mjs` — performance budget CI: Lighthouse scores + metric budgets
- `node scripts/launch-check.mjs` — pre-ship readiness: specs, waivers, evals, guardian, live

## Expansion

Flow is complete at 7 skills. Any further addition (e.g. `namuna-audit` for one-off page audits) follows the same pattern: one SKILL.md, references only when needed, Guardian floor always respected.