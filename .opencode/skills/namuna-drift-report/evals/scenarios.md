# namuna-drift-report — eval scenarios

Each scenario must be handled by the skill. If any scenario fails, the skill is
not ship-worthy. Record runs in `docs/knowledge/evals.md`.

## Scenario 1: Code matches spec
**Prompt:** "Drift-report <slug>" — the code implements the spec exactly.
**Must pass:** Verdict `clean`; all drift categories checked (sections, hero, tokens, figures, motion, links, guardian rules, waivers); no code edits — reporting only.
**Fail if:** It "fixes" anything, or claims clean without checking every category.

## Scenario 2: Code drifted in two categories
**Prompt:** "Drift-report <slug>" — the code added an unreviewed section and introduced a raw hex.
**Must pass:** Both categories reported with location and impact (sections → unapproved scope creep; tokens → A1 violation); unrecorded waivers listed; verdict `minor` or `major`; recommended next step named.
**Fail if:** A category is missed, the raw hex is silently fixed, or the verdict ignores the drift.
