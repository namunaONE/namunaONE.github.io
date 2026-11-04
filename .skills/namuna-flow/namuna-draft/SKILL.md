---
name: namuna-draft
description: Elephant draft step. Turn an approved concept brief into a living design doc under docs/designs/, section by section. Does not build the page.
argument-hint: "<brief-slug-or-path>"
version: 1.0.0
metadata:
  opencode/slash: "true"
---

# namuna-draft — Elephant (deep context)

Use this after `namuna-brainstorm` approves a concept brief. You hold full repository context: STYLEGUIDE.md, tokens, references/, provenance rules, the live site code, and the approved brief.

## Job

Turn the concept brief into a living design document under `docs/designs/<slug>/`, written section by section. The doc is the spec that `namuna-review` (Goldfish, zero context) and `namuna-build` will check against.

## Workflow

### 0. Read the brief and the system

- The approved concept brief from `namuna-brainstorm`
- `STYLEGUIDE.md` (project root)
- `.skills/namuna-guardian/references/design-system.md`
- `.skills/namuna-guardian/references/provenance.md`
- `.skills/namuna-guardian/references/anti-slop-gates.md`
- The page/component being designed (if it exists)

### 1. Create the design doc structure

```text
docs/designs/<slug>/
├── brief.md            (copy of the approved concept brief)
├── spec.md             (the living design doc — this file)
├── tokens.md           (token values used, any additions)
└── assets/             (referenced images, diagrams — optional)
```

`spec.md` sections (in order):

1. **Header** — slug, date, status (draft / approved / built), author
2. **The job** — one sentence: what the visitor comes to do
3. **Audience & tone** — who, what they care about, the tone extreme
4. **Sections** — each section: name, purpose, composition, what it shows (real data vs placeholder), the one thing it makes the visitor feel
5. **Hero** — headline (≤7 words), sentence (≤12 words), one or two actions, visibility at 1280×800
6. **Tokens** — which existing tokens are used; any new token must be justified and added to `tokens.md`
7. **Material ledger** — real / placeholder / absent (every figure, photo, quote)
8. **Motion** — which animation, what property (transform/opacity only), reduced-motion fallback
9. **Accessibility** — focus, landmarks, touch targets, contrast ratios, print
10. **Open questions** — anything still unresolved

### 2. Write spec.md section by section

Each section must answer:
- What is this section for?
- What real data does it show? (source + scope)
- What is the one thing the visitor takes away?
- How does it respond on mobile and reduced motion?

### 3. The stamp

First non-empty line of `spec.md`:

```
<!-- Namuna Design Doc v1.0 · slug: <slug> · status: draft · tokens: v1 · material: real/placeholder/absent verified -->
```

### 4. Status and handoff

- `draft` → not ready for review; still editing
- `approved` → ready for `namuna-review`
- `built` → code shipped; drift-check pending

Do not build the page yet. Stop at `spec.md` + `tokens.md`. Wait for `namuna-review` approval or user go-ahead before `namuna-build`.