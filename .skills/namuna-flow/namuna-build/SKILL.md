---
name: namuna-build
description: Elephant build step. Implement from an approved spec only. Context-limited to the spec + tokens + Guardian references. Does not improvise design decisions.
argument-hint: "<design-doc-slug>"
version: 1.0.0
metadata:
  opencode/slash: "true"
---

# namuna-build — Elephant build step

Use this after `namuna-review` returns `ship` for `docs/designs/<slug>/spec.md`. You build the page/component strictly from the approved spec. You do not invent new design decisions, metrics, or claims.

## Job

Turn the approved spec into shipped code (HTML/CSS/JS) under the project root, then run the Guardian scanner and record the build in `.hallmark/log.json`.

## Workflow

### 0. Read the approved spec and constraints (exhaustive list)

- `docs/designs/<slug>/spec.md` — status must be `approved`
- `docs/designs/<slug>/brief.md`
- `STYLEGUIDE.md` (project root)
- `.skills/namuna-guardian/references/design-system.md`
- `.skills/namuna-guardian/references/provenance.md`
- `.skills/namuna-guardian/references/anti-slop-gates.md`
- `.hallmark/waivers.jsonl` (if it exists)

You may **not** read chat history, prior reviewer reasoning, or any document not listed above. If the spec doesn't say it, it doesn't ship.

### 1. Build rules

- **Spec fidelity.** Every section, token, figure, and claim in the spec is implemented exactly as described. No additions, no substitutions.
- **Tokens only.** Every color and font goes through a declared `:root` semantic token. No literal hex or `font-family` beyond the token block.
- **Provenance.** Every figure carries its source + scope. Gaps are declared visibly. No invented metrics, testimonials, or logos.
- **No slop tells.** No eyebrows (unless explicitly waived in `.hallmark/waivers.jsonl`), no tracked-capital labels, no middle-dot meta, no emoji icons, no purple-to-blue gradients, no card-in-card.
- **Hero contract.** Headline ≤7 words, sentence ≤12 words, one or two actions, all visible at 1280×800 without scrolling.
- **Motion.** Transform/opacity only. `prefers-reduced-motion: reduce` fallback required.
- **Accessibility.** `:focus-visible` on every interactive element, contrast ≥4.5:1 body text, touch targets ≥44px.
- **Grid.** Image-bearing tracks use `minmax(0, 1fr)`.
- **No dead links.** Verify pub.dev/npm/PyPI URLs are live before linking.

### 2. Implementation steps

1. Navigate to the project root (or the page directory if this is a multi-page site).
2. Write/edit the HTML, CSS, and JS files named in the spec.
3. Keep existing stylesheets append-only: imports go right after the last `@import`, never below a rule.
4. Do not touch files outside the spec's scope.

### 3. Verify (Guardian sweep)

Run:
```powershell
node .skills/namuna-guardian/scripts/slop-scan.mjs <built-files>
```

- Fix every hard FAIL (A1, A2, A3, A4, A5, A6, A8, A13, A14, A15, A16, A17, A18).
- Fix or explicitly waive every WARN in `.hallmark/waivers.jsonl` with a reason.
- Confirm 0 hard fails before declaring built.

### 4. Log the build

Append to `.hallmark/log.json`:
```json
{
  "slug": "<slug>",
  "status": "built",
  "spec": "docs/designs/<slug>/spec.md",
  "files": ["<file1>", "<file2>"],
  "waivers": [<waiver ids used>],
  "timestamp": "<ISO 8601>",
  "reviewer": "<who said ship>"
}
```

### 5. Status

Mark `spec.md` header status: `built`. The build is now drift-checkable by `namuna-drift-report`.

### Output format

```
Build complete: <slug>
Files: <list>
Waivers: <ids> (none)
Scanner: 0 hard fails, <n> waived (explicit)
Status: built — ready for drift-check
```