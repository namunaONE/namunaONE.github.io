---
name: namuna-resolve
description: Elephant resolve step. Work through namuna-review findings and agree on changes. Mediates fix/rebuild/recapture decisions; records resolutions in the build log.
argument-hint: "<design-doc-slug>"
version: 1.0.0
metadata:
  opencode/slash: "true"
---

# namuna-resolve — Elephant resolve step

Use this after `namuna-review` returns `fix`, `rebuild`, or `recapture`. You mediate between the reviewer's findings and the builder's implementation, agreeing on exactly what changes and recording them.

## Job

Resolve review findings into concrete, agreed-upon changes. Update the spec or the plan, record the resolution, and hand back to the appropriate flow skill.

## Workflow

### 0. Read (exhaustive list)

- `docs/designs/<slug>/spec.md`
- `docs/designs/<slug>/brief.md`
- The `namuna-review` output (first word + gates + issues)
- `.skills/namuna-guardian/references/anti-slop-gates.md`
- `.hallmark/waivers.jsonl` (if it exists)

### 1. Classify each review finding

For every issue the reviewer raised, classify into one of:

| Classification | Meaning | Action |
|---|---|---|
| `clarify` | Spec is ambiguous; needs rewording | Edit `spec.md` |
| `fix` | Small correction; spec intent is sound | Edit `spec.md`, then rebuild |
| `rebuild` | Section or structure is wrong | Rewrite section in `spec.md` |
| `recapture` | Material is insufficient | Return to `namuna-brainstorm` |
| `waive` | Deliberate exception to a Guardian rule | Record in `.hallmark/waivers.jsonl` |

### 2. Resolve each finding

For each finding:
1. Restate the issue in your own words.
2. State the classification and the exact change.
3. If a waiver is requested, write the waiver line (id, file, line, reason) and add it to `.hallmark/waivers.jsonl`.
4. Update `spec.md` status to `draft` (if changes are made) or keep `approved` (if no spec change needed).

### 3. Resolution log

Append to `.hallmark/log.json`:
```json
{
  "slug": "<slug>",
  "event": "resolve",
  "reviewerFirstWord": "<ship|fix|rebuild|recapture>",
  "resolutions": [
    { "gate": "J3", "classification": "fix", "change": "..." },
    { "gate": "J4", "classification": "waive", "waiverId": "..." }
  ],
  "timestamp": "<ISO 8601>"
}
```

### 4. Handoff

- If `fix` → hand to `namuna-build` (builder fixes, reviewer re-checks)
- If `rebuild` → hand to `namuna-draft` (rewrite spec sections)
- If `recapture` → hand to `namuna-brainstorm` (ask for material again)
- If all resolved with no code change → confirm `ship` and hand to `namuna-build`

### Output format

```
Resolve: <slug>
Reviewer first word: <word>
Resolutions:
- <gate>: <classification> → <change>
Waivers recorded: <ids>
Next step: <namuna-build | namuna-draft | namuna-brainstorm | ship>
```