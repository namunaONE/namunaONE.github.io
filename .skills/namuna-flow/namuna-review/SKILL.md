---
name: namuna-review
description: Goldfish (zero-context) review step. Fresh agent reads only the draft spec + source code; checks completeness, clarity, self-containment, implementation readiness. No conversation bias.
argument-hint: "<design-doc-path>"
version: 1.0.0
metadata:
  opencode/slash: "true"
---

# namuna-review — Goldfish (zero context)

Use this after `namuna-draft` produces `docs/designs/<slug>/spec.md`. You hold **zero context** about the conversation that produced the brief. You read only: the design doc, the current source code, STYLEGUIDE.md, and the guardian references. You are a fresh pair of eyes.

## Job

Stress-test the draft spec. Confirm completeness, clarity, self-containment, and implementation readiness. Your first word is one of: `recapture`, `rebuild`, `fix`, or `ship`.

## Workflow

### 0. What you may read (exhaustive list)

- `docs/designs/<slug>/spec.md` and `brief.md`
- `STYLEGUIDE.md` (project root)
- `.skills/namuna-guardian/references/` (all four files)
- The current page/component source code (HTML/CSS/JS)
- `.hallmark/waivers.jsonl` (if it exists)

You may **not** read chat history, prior reviewer notes, or the builder's reasoning. If the doc doesn't say it, it doesn't exist.

### 1. Completeness check

Does the doc answer all of:
- [ ] One sentence job statement
- [ ] Audience and tone (extreme named)
- [ ] Every section: name, purpose, composition, what it shows
- [ ] Hero: headline ≤7 words, sentence ≤12 words, primary action
- [ ] Token usage: existing tokens only, or justified additions in tokens.md
- [ ] Material ledger: real / placeholder / absent for every figure and photo
- [ ] Motion: transform/opacity only, reduced-motion fallback named
- [ ] Accessibility: focus, contrast ≥4.5:1 body, touch targets ≥44px, print
- [ ] Open questions listed (or explicitly "none")

### 2. Clarity check

Read `spec.md` aloud. Could a developer who has never met the namunaONE team implement this without asking questions? If any section requires tribal knowledge, mark it `UNCLEAR` and say what's missing.

### 3. Self-containment check

- [ ] No reference to "the thing we discussed" or "as agreed"
- [ ] Every number traces to a source named in the doc
- [ ] No invented metrics, testimonials, or dead links
- [ ] Workshop repos shown as placeholders only, no shipping promises

### 4. Implementation readiness check

Run `node .skills/namuna-guardian/scripts/slop-scan.mjs <target-files>` on the current code. Record any hard FAILs. The doc must not propose anything that violates the hard floor (A1–A18).

### 5. Judged gates

For each gate, answer PASS / WARN / FAIL:

| Gate | Question |
|---|---|
| J1 | Job is specific and achievable on one page |
| J2 | Tone is an extreme, not "clean and modern" |
| J3 | Hero fits above the fold at 1280×800 |
| J4 | All figures have named sources |
| J5 | No invented proof anywhere |
| J6 | Mobile response described (not ignored) |
| J7 | Reduced motion fallback named |
| J8 | Tokens used consistently (no raw hex outside token block) |
| J9 | Material ledger complete (real / placeholder / absent) |
| J10 | No workshop repo masquerading as shipped product |

### 6. Finish review (your first word)

Based on the gates:

- **`recapture`** — the material is insufficient; go back to `namuna-brainstorm` and ask for material again
- **`rebuild`** — the spec structure is wrong; rewrite `spec.md` sections
- **fix** — specific, correctable issues; list them, then the builder fixes and you re-review
- **ship** — approve; the builder may proceed to `namuna-build`

Your output must start with exactly one of these four words, followed by your reasoning.

### 7. Output format

```
<first-word>: <reasoning>

Gates:
- J1 PASS/FAIL: ...
- J2 PASS/FAIL: ...
...

Issues to fix:
- <issue> (gate Jx)

Waivers requested:
- <id>: <reason>  (only if builder wants to record a deliberate exception)

Next step:
- namuna-build <slug>   (if ship)
- namuna-draft <slug>   (if fix/rebuild)
- namuna-brainstorm     (if recapture)
```

Score the fixes yourself after the builder responds. A fabricated pass is itself slop.