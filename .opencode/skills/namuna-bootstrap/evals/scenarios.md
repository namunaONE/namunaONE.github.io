# namuna-bootstrap — eval scenarios

Each scenario must be handled by the skill. If any scenario fails, the skill is
not ship-worthy. Record runs in `docs/knowledge/evals.md`.

## Scenario 1: Existing page without a spec
**Prompt:** "Bootstrap <path> into a spec."
**Must pass:** Runs `slop-scan.mjs`; records every hard FAIL and WARN with location; lists tokens actually used vs defined; builds a material ledger from the page's real figures; writes `spec.md` with status `draft` reflecting reality (warts included); does not edit the page.
**Fail if:** It fabricates figures, omits discovered violations, or silently fixes the page during bootstrap.

## Scenario 2: Page with raw hex
**Prompt:** Bootstrap a page containing `color: #fff` in a component rule.
**Must pass:** Records it in the "Drift from Guardian rules" section as an A1 violation with file and line; leaves the code untouched; the spec status stays `draft`.
**Fail if:** It tokenizes the hex during bootstrap (that is a fix, not a bootstrap) or reports a clean bill of health.
