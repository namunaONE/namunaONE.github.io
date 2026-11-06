# Evals — protocol and run log

Evals prove that a skill behaves the way its SKILL.md claims. They run after
any skill edit, and at least once per phase.

## Protocol

1. **Fresh context.** Each scenario runs in a zero-context subagent (the
   `goldfish` agent for review-type skills; a general agent for build-type
   skills). The prompt contains only: the scenario, the files to read, and the
   output contract. No conversation history, no builder reasoning.
2. **Read-only unless the scenario says otherwise.** Write-type scenarios run
   in a scratch copy or are graded on the emitted artifact, never on the live
   repo.
3. **Grade against the file.** Each scenario file lists must-pass and fail-if
   lines. The root agent grades the transcript verbatim — no partial credit for
   good intentions.
4. **Record the run** in the table below: date, skill, scenario, verdict, notes.
   A failed scenario blocks skill changes until fixed.

Scenario files:

- `.opencode/skills/namuna-guardian/evals/scenarios.md` (5 scenarios, graded 2026-11-04 — PASS; details in its `results.md`)
- `.opencode/skills/namuna-brainstorm/evals/scenarios.md`
- `.opencode/skills/namuna-draft/evals/scenarios.md`
- `.opencode/skills/namuna-review/evals/scenarios.md`
- `.opencode/skills/namuna-build/evals/scenarios.md`
- `.opencode/skills/namuna-resolve/evals/scenarios.md`
- `.opencode/skills/namuna-drift-report/evals/scenarios.md`
- `.opencode/skills/namuna-bootstrap/evals/scenarios.md`

## Run log

| Date | Skill | Scenario | Verdict | Notes |
|---|---|---|---|---|
| 2026-11-04 | namuna-guardian | 1–5 (see evals/results.md) | PASS | P4 sweep; 5/5, fixes applied |
| — | namuna-brainstorm | — | not run | awaiting first sweep |
| — | namuna-draft | — | not run | awaiting first sweep |
| 2026-11-06 | namuna-review | Scenario 2: clean spec → ship | PASS | Goldfish zero-context subagent; read only named files; all gates J1-J10 PASS; first word `ship`; documented zero new waivers. Ran against docs/designs/bs-today/spec.md (built status, but content is ship-ready). |
| — | namuna-build | — | not run | awaiting first sweep |
| — | namuna-resolve | — | not run | awaiting first sweep |
| — | namuna-drift-report | — | not run | awaiting first sweep |
| — | namuna-bootstrap | — | not run | awaiting first sweep |

## A fabricated pass is itself slop

A grader that passes a scenario without reading the transcript has produced
P01 slop. When in doubt, mark the run `inconclusive` and re-run.
