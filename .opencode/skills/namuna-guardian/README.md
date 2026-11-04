# Namuna Design Guardian

**Already registered with OpenCode** — this folder lives at `.opencode/skills/namuna-guardian/`, so OpenCode discovers it automatically (it appears in `<available_skills>` and loads via the `skill` tool).

For other agents (Claude Code, Codex), install globally:

```powershell
npx skills add namunaONE/namunaone-github-page --skill namuna-guardian -g
```

Usage:
- `/namuna-guardian <prompt>` via the slash command, or ask for a Namuna design change — the description triggers it.
- `audit <path>` / `check <path>` verbs per SKILL.md.

Files:
- `SKILL.md` — router + hard floor + workflow.
- `references/` — design-system, provenance, anti-slop gates.
- `scripts/slop-scan.mjs` — static scanner (run before every build).
- `scripts/verify-live.mjs` — live link + figure-drift verification (A19/A20).
- `evals/scenarios.md` — 5 challenge tests the skill must pass.

Expansion: `namuna-flow` verbs (brainstorm → draft → review → build → resolve → bootstrap → drift-report) live as sibling skills in `.opencode/skills/`.