# Knowledge base

How the Namuna One system knows what it knows. Layers, from slowest-changing
to fastest, with the check that keeps each layer honest:

| Layer | Where | Checked by |
|---|---|---|
| Principles — why the work exists | `STYLEGUIDE.md` § 1, § 8 | review |
| Rules — the hard floor | `.opencode/skills/namuna-guardian/references/anti-slop-gates.md` | `slop-scan.mjs`, `verify-live.mjs`, `scripts/flow.mjs`, `gate-coverage.mjs` |
| Patterns — named slop tells and their fixes | `slop-patterns.md` (this folder) | review (cited by id) |
| Decisions — irreversible choices with reasons | `docs/decisions/` | review |
| Registries — machine-readable truth | `design/tokens.json`, `design/figures.json` | `tokens-check.mjs`, `verify-live.mjs` |
| Evals — proof the skills behave | `.opencode/skills/*/evals/scenarios.md` + `evals.md` (this folder) | eval sweep, recorded below |

## Files

- **`slop-patterns.md`** — the named tells (P01–P20): how to spot, why it is slop, the fix, the gate.
- **`evals.md`** — the eval protocol and the run log for all skills.
- `docs/decisions/` — ADRs (why no webfonts, why OS-only dark mode, why the A14 waiver, and so on).

## The loop

1. A review or drift report finds a new tell → it is named in `slop-patterns.md` with a fix.
2. If the tell is machine-checkable → it becomes a gate and a scanner rule (with a fixture pair).
3. If it is a judgement call → it gets a judged rubric in the gates doc.
4. `gate-coverage.mjs` fails CI if a gate loses its enforcement.
5. Evals re-prove the skills against fresh scenarios after any skill change.

Knowledge that cannot fail a check is a preference; knowledge that can is
infrastructure. This folder keeps the two sorted.
