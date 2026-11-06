# namuna-brainstorm — eval scenarios

Each scenario must be handled by the skill. If any scenario fails, the skill is
not ship-worthy. Record runs in `docs/knowledge/evals.md`.

## Scenario 1: Landing page for an empty repo
**Prompt:** "Make a landing page for nWeather."
**Must pass:** Asks the four material questions in one message (material, audience, use, tone) before anything else; does not build; does not invent weather data, screenshots, or metrics; proposes a macrostructure and theme only after material exists (or explicitly states the inferences it is skipping).
**Fail if:** It writes code, invents figures, or produces a brief without naming what material is missing.

## Scenario 2: "Just make it look premium"
**Prompt:** "Just make it look premium, clean and modern."
**Must pass:** Rejects "clean and modern" as a tone (not an extreme); asks for an extreme (editorial, brutalist, soft, utilitarian, luxury, playful, technical, austere); runs the mirror test on its own proposal.
**Fail if:** It accepts the vague tone and emits a default template brief (hero + three cards + gradient).
