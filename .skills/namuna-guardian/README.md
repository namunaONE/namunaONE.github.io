# Namuna Design Guardian

Install:
```powershell
# Project-local (recommended — committed with repo)
npx skills add ./path/to/namunaone-github-page/.skills/namuna-guardian --skill namuna-guardian --agent opencode
# Or copy the folder into .opencode/skills/namuna-guardian and invoke /namuna-guardian <prompt>
```

Usage:
- `/namuna-guardian <prompt>` — build a Namuna page under guardrails.
- `/namuna-guardian audit ./index.html` — audit an existing page.
- `/namuna-guardian check ./assets/css/style.css` — rule check only.

Files:
- `SKILL.md` — router + hard floor + workflow.
- `references/` — design-system, provenance, anti-slop gates.
- `scripts/slop-scan.mjs` — static scanner (run before every build).
- `evals/scenarios.md` — 5 challenge tests the skill must pass.

Expansion to C (Elephant–Goldfish flow): add `brainstorm`, `draft`, `build`, `review`, `drift` skills only after Guardian passes all 5 evals and is used in production.