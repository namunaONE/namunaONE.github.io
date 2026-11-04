---
name: namuna-drift-report
description: Elephant drift step. Compare checked-in design spec with current source code; report where they diverge. Run after implementation to keep spec and code honest.
argument-hint: "<design-doc-slug>"
version: 1.0.0
metadata:
  opencode/slash: "true"
---

# namuna-drift-report — Elephant drift step

Use this after `namuna-build` marks a spec `built`. You compare `docs/designs/<slug>/spec.md` against the actual shipped code and report divergences.

## Job

Detect where code has drifted from spec: sections added/removed, tokens changed, figures altered, motion added, Guardian rules violated. Report plainly — no fixing, just finding.

## Workflow

### 0. Read (exhaustive list)

- `docs/designs/<slug>/spec.md` (status must be `built`)
- `docs/designs/<slug>/brief.md`
- The built files listed in the spec's log entry
- `.skills/namuna-guardian/references/design-system.md`
- `.skills/namuna-guardian/references/provenance.md`
- `.skills/namuna-guardian/references/anti-slop-gates.md`
- `.hallmark/waivers.jsonl` (if it exists)

### 1. Drift categories

For each category, compare spec vs code:

| Category | What to check |
|---|---|
| **Sections** | Every spec section present in code? Any extra sections? |
| **Hero** | Headline, sentence, CTA match spec? Visible above fold? |
| **Tokens** | Only spec-approved tokens used? No raw hex added? |
| **Figures** | Every number matches spec + source? Any invented metric? |
| **Motion** | Any animation not in spec? Reduced-motion fallback present? |
| **Links** | All external links still resolve? |
| **Guardian rules** | Any A1–A18 violation introduced since build? |
| **Waivers** | Any waiver used that isn't in `.hallmark/waivers.jsonl`? |

### 2. Generate the drift report

```
# Drift Report — <slug>
Spec: docs/designs/<slug>/spec.md (status: built)
Checked: <files>

## No drift
Sections, tokens, figures, motion, and Guardian rules all match spec.

## Drift found
<category>: <what changed> → <impact>

Example:
- Sections: "About" section added in code but not in spec → unapproved scope creep
- Tokens: raw hex #FF0000 found in assets/css/style.css → violates A1
- Figures: "10K+ users" claimed in hero but not in spec → violates A8 (invented metric)

## Waiver check
Waivers in code: <ids>
Waivers in .hallmark/waivers.jsonl: <ids>
Unrecorded waivers: <ids> → must be added or fixed

## Verdict
- `clean` — code matches spec; no action needed
- `minor` — small drift, fix and re-scan
- `major` — spec and code diverged; rebuild or update spec to match code
```

### 3. Handoff

- `clean` → no action; spec remains source of truth
- `minor` → builder fixes code, re-runs scanner, re-checks
- `major` → either update `spec.md` to match code (then re-review) or revert code to match spec

### Output format

```
Drift report: <slug>
Verdict: <clean | minor | major>
Drift categories: <list>
Unrecorded waivers: <ids> (none)
Recommended next step: <none | fix-and-rescan | update-spec | revert-code>
```