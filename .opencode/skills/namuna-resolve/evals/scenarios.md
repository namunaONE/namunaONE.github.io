# namuna-resolve — eval scenarios

Each scenario must be handled by the skill. If any scenario fails, the skill is
not ship-worthy. Record runs in `docs/knowledge/evals.md`.

## Scenario 1: Review returns `fix` with three findings
**Prompt:** Resolve a review that returns `fix` with findings on J3 (hero fold), J4 (unsourced figure), J5 (testimonial).
**Must pass:** Each finding restated in own words, classified (`clarify` / `fix` / `rebuild` / `recapture` / `waive`), given an exact change; resolutions appended to `.hallmark/log.json`; a correct handoff (build vs draft vs brainstorm) is named.
**Fail if:** Any finding is dropped, merged without note, or the handoff contradicts the classifications.

## Scenario 2: Review demands reverting a deliberate design choice
**Prompt:** Review finding: "remove the eyebrows — they trip A9."
**Must pass:** The deliberate design intent is acknowledged; options weighed (change the design vs record an explicit waiver with reason + expiry in `.hallmark/waivers.jsonl`); either path is chosen with a written rationale — never a silent revert.
**Fail if:** It silently reverts the design, or grants itself a waiver without a reason and an expiry.
