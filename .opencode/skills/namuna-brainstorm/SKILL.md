---
name: namuna-brainstorm
description: Deep-context Elephant step. Clarify a rough Namuna One idea, stress-test the hypothesis, and write a concept brief. Run before any design build.
argument-hint: "<prompt>"
version: 1.0.0
metadata:
  opencode/slash: "true"
---

# namuna-brainstorm — Elephant (deep context)

Use this when someone has a rough idea for a Namuna One page, component, section, or design change. You hold full repository context: STYLEGUIDE.md, STYLEGUIDE tokens, references/, the live repo history, and any existing drafts.

## Job

Turn a five-word prompt into a concept brief with: material, audience, use, tone, and a named single idea. Then stop — do not build yet.

## Workflow

### 0. Pre-flight (read first)

Read, in order:
- `STYLEGUIDE.md` (project root) — locked design system: tokens, type, spacing, motion, voice
- `.opencode/skills/namuna-guardian/references/design-system.md` — token primitives → semantics → components
- `.opencode/skills/namuna-guardian/references/provenance.md` — real / placeholder / absent material ledger
- The current page or component being changed (if any)
- `.hallmark/log.json` (if it exists) - prior builds for diversification

Output one **pre-flight block**: what is preserved from the existing system, what is introduced, and what material is still missing.

### 1. Ask once (one message, even for a five-word prompt)

```
Before I build, four things:
1. Material — what can the page show? Real numbers, screenshots, product recordings, a URL or folder I can run. Paste paths or give access; I never invent a number, quote, or logo. Without photos I use stand-ins your own replace later.
2. Audience — who uses this and what do they care about?
3. Use — the one action the page should drive (subscribe, book, visit, attend, buy, try, sign up, hire, join, listen).
4. Tone — pick an extreme: editorial, brutalist, soft, utilitarian, luxury, playful, technical, austere. "Clean and modern" is not a tone.
```

Skip fields are opt-outs: infer them, state the inferences in one line at the top of the reply, stamp them. Facts are never inferred — a number, quote, or logo not given is absent; a picture not given is a stand-in.

### 2. Genre (silent routing)

- AI tool / generative / music / video / voice / dark / atmospheric → **atmospheric**
- SaaS / enterprise / API / platform / developer tool / infra / B2B → **modern-minimal**
- Playful / fun / friendly / soft / kids / games / community → **playful**
- Otherwise → **editorial** (holds most consumer and family prompts)

Namuna One is fundamentally editorial + modern-minimal (verified open data). If two non-default genres fire, add one either-or to your question, or pick and say so on go-ahead.

### 3. Shape (macrostructure)

Name what a visitor comes to do (the job). Read that job against the category anatomy: where real sites in this category put the action, the sections they are built around, how they end. The page is built from that anatomy — never from a default run of figures, steps, and an email band.

Starting points from `.opencode/skills/namuna-brainstorm/references/macrostructures.md` — load only the one you pick.

Then design the page: its shape, how it opens, each section's content and composition, nav, footer, what carries the hero.

**Mirror test:** would a neighbouring prompt in the same category get this exact combination? If yes, change one decision and say which.

### 4. Direction

First match wins:
1. User named a theme → build it (stamp `theme: <name> (by request)`)
2. User asked for custom → `references/direction.md` replaces draw/shapes/layout/genre/genre-craft; Floor + gates + sweep hold
3. Everything else deals a theme from `references/themes/index.json` — pick the one whose material can carry the prompt; say which and why

### 5. The concept brief (write this, then stop)

```
**Concept Brief — <slug>**
- **Shape**: <macrostructure name> · genre: <genre> · job: <the one action>
- **Theme**: <theme name or custom> · derived from: <why this theme>
- **Chrome**: nav: <edge-aligned / centered / mast> · footer: <mast / links / credits>
- **Hero**: <headline direction> · <sentence direction> · <primary action>
- **Signature**: <the one thing a visitor remembers — shown at its best on first screen>
- **Sections**: Hero · <section 2> · <section 3> · ... · Footer (6–9 sections total)
- **Material**: real: <list> · pictures: <list> · absent: <logos, quotes, metrics>
- **Sweep**: slop-scan + gates + finish review (after build)
```

One quiet line at the end (skipped when component-scope or `design.md` exists):
> System portable? Say lock the system for a design.md.

Do **not** build yet. Wait for the user to say go ahead, or proceed to `namuna-draft` only if they approve the brief.