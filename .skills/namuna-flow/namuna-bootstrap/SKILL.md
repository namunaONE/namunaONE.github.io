---
name: namuna-bootstrap
description: Elephant bootstrap step. Create or update documentation for an existing codebase. Scans existing code and generates a spec.md that reflects what actually ships.
argument-hint: "<path-or-slug>"
version: 1.0.0
metadata:
  opencode/slash: "true"
---

# namuna-bootstrap — Elephant bootstrap step

Use this when there is existing code (a page, component, or site) but no approved spec. You scan what exists and generate `docs/designs/<slug>/spec.md` that reflects reality — warts and all — so the codebase has a truthful starting point.

## Job

Create or update documentation for an existing codebase by reverse-engineering it into a Namuna spec: material ledger, token usage, section inventory, and drift from Guardian rules.

## Workflow

### 0. Read what exists (exhaustive list)

- The target path or slug (HTML/CSS/JS files)
- `STYLEGUIDE.md` (project root)
- `.skills/namuna-guardian/references/` (all four files)
- `.hallmark/waivers.jsonl` (if it exists)

### 1. Scan the existing code

Run:
```powershell
node .skills/namuna-guardian/scripts/slop-scan.mjs <target>
```

Record:
- Every hard FAIL and its location
- Every WARN and its location
- Every token actually used vs every token defined
- Every figure, number, or claim and whether its source is visible
- Every external link and whether it resolves

### 2. Generate `docs/designs/<slug>/spec.md`

Write the spec to match what actually exists:

```
# Spec (bootstrapped) — <slug>
Status: draft (existing code, not yet approved)

## The job
<one sentence: what this page does for the visitor>

## Sections
For each section on the page:
- Name, purpose, composition
- What it shows: real data (source named) / placeholder / absent
- One takeaway for the visitor

## Hero
- Headline, sentence, primary action
- Visible at 1280×800 without scrolling? (yes/no)

## Tokens used
- List of `:root` tokens actually referenced in the code
- Any raw hex or literal font-family found (note as violation)

## Material ledger
- real: <list with sources>
- placeholder: <list>
- absent: <list>

## Motion
- Animations used: properties, reduced-motion fallback (yes/no)

## Accessibility
- :focus-visible present? (yes/no)
- Contrast ratios measured?
- Touch targets ≥44px?

## Drift from Guardian rules
- List of A1–A18 violations found in the existing code
- Waivers already in .hallmark/waivers.jsonl
```

### 3. Status

Set status to `draft`. The spec is now reviewable by `namuna-review` and buildable by `namuna-build` once approved.

### 4. Output format

```
Bootstrap complete: <slug>
Files scanned: <n>
Hard fails found: <n>
Waivers already recorded: <n>
Spec written: docs/designs/<slug>/spec.md (status: draft)
Next step: namuna-review <slug>
```