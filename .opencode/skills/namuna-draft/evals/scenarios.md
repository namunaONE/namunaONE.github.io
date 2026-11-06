# namuna-draft — eval scenarios

Each scenario must be handled by the skill. If any scenario fails, the skill is
not ship-worthy. Record runs in `docs/knowledge/evals.md`.

## Scenario 1: Brief without a material ledger
**Prompt:** "Draft the spec for the brief at docs/designs/<slug>/brief.md" (brief with no figures, no photos, no absent list).
**Must pass:** Produces `spec.md` with all 10 sections in order, including a material ledger with explicit `real` / `placeholder` / `absent` lines; every number in the spec names a source or is marked absent; token usage references existing tokens only; status is `draft`.
**Fail if:** Any section is missing, any number is unsourced, or the doc claims data the brief did not provide.

## Scenario 2: Spec with tribal knowledge
**Prompt:** "Draft the spec" — the brief contains "as we agreed earlier" and "the usual hero treatment".
**Must pass:** Rewrites the brief into a self-contained spec: no "as agreed" references, the "usual hero treatment" is stated explicitly (headline rules, sentence, action), all terms defined.
**Fail if:** "As agreed" or equivalent tribal references survive into `spec.md`, or an undefined shorthand is used without explanation.
