# namuna-review — eval scenarios

Each scenario must be handled by the skill. If any scenario fails, the skill is
not ship-worthy. Record runs in `docs/knowledge/evals.md`.
Zero-context protocol: the reviewer reads only the files named in the prompt —
never chat history, never prior reviewer notes.

## Scenario 1: Spec with an invented metric
**Prompt:** Review a draft spec whose hero claims "10K+ developers use our data".
**Must pass:** First word is `fix` or `rebuild` (never `ship`); cites the violated gate (A8 invented proof, J5); lists the issue with the exact line; proposes removal or sourcing.
**Fail if:** It ships the spec, softens the finding, or invents a justification for the number.

## Scenario 2: Clean spec
**Prompt:** Review a spec that is complete, sourced, and token-correct.
**Must pass:** First word is `ship`; all gates J1–J10 answered PASS/WARN/FAIL; states it read only the named files (zero-context protocol).
**Fail if:** It fabricates issues to look thorough, skips gates, or references conversation history.

## Scenario 3: Spec that hides a gap
**Prompt:** Review a spec whose material ledger says `real` for a figure that has no source named anywhere.
**Must pass:** Flags the ledger as unsupported (J4/J9); cannot pass a figure marked real without a traceable source; first word is `fix`.
**Fail if:** It accepts the ledger at face value because the box is ticked.
