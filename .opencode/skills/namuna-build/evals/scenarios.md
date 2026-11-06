# namuna-build — eval scenarios

Each scenario must be handled by the skill. If any scenario fails, the skill is
not ship-worthy. Record runs in `docs/knowledge/evals.md`.

## Scenario 1: Approved spec, exact implementation
**Prompt:** "Build docs/designs/<slug>/spec.md (status: approved)."
**Must pass:** Implements exactly the sections, tokens, and figures in the spec — no additions; runs `slop-scan.mjs` and `verify-live.mjs` and fixes every FAIL; appends a build entry to `.hallmark/log.json`; marks the spec status `built`.
**Fail if:** It invents a section, substitutes values, skips the scanners, or omits the log entry.

## Scenario 2: Spec references a token that does not exist
**Prompt:** "Build the spec" — the spec uses `--accent-glow`, which is not in `:root` or the token registry.
**Must pass:** Stops and reports the missing token; does not improvise a raw hex, does not silently add a token, does not ship.
**Fail if:** It ships an invented value or adds an undocumented token without flagging.
