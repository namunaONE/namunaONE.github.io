# Slop patterns — the named tells

Every pattern below was observed, named, and answered. When a review flags
"P04", this file is the reference. Fields: **Tell** (how to spot it), **Why it's
slop** (what it costs), **The fix** (what ships instead), **Checked by** (the
gate or tool that catches it).

Gate ids refer to `.opencode/skills/namuna-guardian/references/anti-slop-gates.md`.
`scanner` = `slop-scan.mjs`, `live` = `verify-live.mjs`, `flow` = `scripts/flow.mjs`.

---

## P01 · Invented metric
**Tell:** a number with no source in the same sentence ("10K+ users", "99.9% uptime", "trusted by 200 teams").
**Why it's slop:** it fabricates authority; once one fake number ships, every number is suspect.
**The fix:** name the source and scope, or drop the claim. Gaps are declared, never filled.
**Checked by:** A8 (scanner wordlist, tripwire) + A17 (flow: material ledger) + review.

## P02 · Testimonial wall
**Tell:** quotes, logos, or "trusted by" rows that cannot be traced to written consent.
**Why it's slop:** manufacturing endorsement is fabrication; government-adjacent claims additionally violate the not-affiliated disclaimer.
**The fix:** absent until attributable consent exists; if shown, name the person, role, and date.
**Checked by:** A8 + A17.

## P03 · Dead authority link
**Tell:** a link to pub.dev/npm/PyPI/registry/docs that was never fetched.
**Why it's slop:** a 404 on the flagship link destroys the credibility the rest of the page earned.
**The fix:** verify live before linking; link the GitHub folder with "not yet published" wording when a registry has nothing.
**Checked by:** A15 + A20 (live).

## P04 · Stale figure
**Tell:** a hand-maintained number that no longer matches its source (version, count, points).
**Why it's slop:** the page asserts something false while claiming to be verified.
**The fix:** every figure lives in `design/figures.json` with a live source; CI checks page ↔ registry ↔ source.
**Checked by:** A19 (live, registry-driven) + weekly cron.

## P05 · Static holy date
**Tell:** a hardcoded "today" — a Bikram Sambat date, "updated for 2026", a rollover-sensitive value.
**Why it's slop:** it is wrong the next day without anyone touching it.
**The fix:** generate from the data source (nMiti) at read time, or omit; never type a date you cannot trace.
**Checked by:** A14 (scanner) + provenance rules.

## P06 · Placeholder as product
**Tell:** an empty repo shown as shipped — roadmap dates, promised screenshots, "coming soon" badges.
**Why it's slop:** it implies delivery that does not exist.
**The fix:** dashed placeholder styling, an explicit "placeholder" label, no dates.
**Checked by:** A16 (judged rubric) + A17.

## P07 · Vanity metric creep
**Tell:** counts that drift daily (commit counts, stars) presented as headline stats.
**Why it's slop:** high maintenance, low meaning; it ages the page within hours.
**The fix:** keep only if the registry can verify them; use warn severity so drift is visible but not blocking; prefer stable, meaningful stats.
**Checked by:** A19 (registry, warn severity) + review.

## P08 · Purple-to-blue gradient
**Tell:** the default generative gradient on hero, buttons, or accents.
**Why it's slop:** it is the visual signature of template output; it says nothing about the client.
**The fix:** the token palette, one accent voice, flat surfaces with hairline structure.
**Checked by:** A12 (scanner) + A1 (tokens only).

## P09 · Glassmorphism and glow
**Tell:** blurred translucent cards, neon shadows, gradient borders on dark.
**Why it's slop:** decoration standing in for hierarchy; contrast and legibility pay for it.
**The fix:** opaque surfaces, 1px lines, real elevation from one shadow scale.
**Checked by:** A1 + review rubric (J8).

## P10 · Emoji iconography
**Tell:** 🚀 📊 ✅ used as UI icons or status markers.
**Why it's slop:** renders inconsistently per OS, reads as chat, not product.
**The fix:** words, real SVG glyphs, or semantic chips ("Verified", "Placeholder").
**Checked by:** A12 (scanner) + status-never-color-alone rule.

## P11 · Card-in-card
**Tell:** a surface nested inside an identical surface for no structural reason.
**Why it's slop:** fake depth; the eye finds no hierarchy.
**The fix:** one surface per nesting level; differentiate with type and spacing, not another box.
**Checked by:** review rubric (J8) + component rules.

## P12 · Eyebrow everywhere
**Tell:** every section opens with a small tracked-uppercase label.
**Why it's slop:** the template tell; it decorates instead of informing.
**The fix:** waive deliberately (documented) or use plain section numbering; never let it become the default.
**Checked by:** A9 (scanner warn) + explicit waivers only.

## P13 · Tracked caps as texture
**Tell:** letter-spacing stretched onto labels purely for "designer" feel.
**Why it's slop:** hurts readability at small sizes; imitates editorial print without its reasons.
**The fix:** either drop the tracking or record it as a deliberate waiver with contrast verification.
**Checked by:** A10 (scanner warn) + waivers.

## P14 · Middle-dot meta string
**Tell:** "Fast · Simple · Free" — decorative separators between vibe words.
**Why it's slop:** marketing fragments standing where facts should be.
**The fix:** full sentences with sources; separators only where a list is real.
**Checked by:** A11 (scanner warn) + waivers.

## P15 · Decorative status dot
**Tell:** colored dots next to labels with no semantic meaning.
**Why it's slop:** implies state (online, verified) that is not there; color-only meaning is also an a11y fail.
**The fix:** words; if a dot is semantic, pair it with text and a legend.
**Checked by:** A11 + status-never-color-alone rule.

## P16 · `transition: all`
**Tell:** broad transitions on every property.
**Why it's slop:** unpredictable motion, layout thrash, broken reduced-motion handling.
**The fix:** explicit properties, transform/opacity for motion, 150–250ms.
**Checked by:** A2 (scanner).

## P17 · Animated layout properties
**Tell:** width/height/top/left in transitions or keyframes.
**Why it's slop:** jank; forces layout on every frame.
**The fix:** transform and opacity only.
**Checked by:** A3 (scanner).

## P18 · Motion without a reduce path
**Tell:** an animation added with no `prefers-reduced-motion: reduce` fallback.
**Why it's slop:** motion is the most common accessibility casualty of fast builds.
**The fix:** every file that animates declares its reduce behaviour.
**Checked by:** A7 (scanner, file-level).

## P19 · Raw hex drift
**Tell:** a color literal outside the token layer (`color: #ffffff` in a component).
**Why it's slop:** the design system starts lying; dark mode and contrast guarantees break.
**The fix:** a semantic token (add one if the role is real), or a documented fixed-primitive token where the role must never flip.
**Checked by:** A1 (scanner) + `tokens-check.mjs` (registry ↔ CSS ↔ docs).

## P20 · Silent waiver & doc drift
**Tell:** a rule exception with no record; docs describing an older system (stale ranges, moved paths, wrong version).
**Why it's slop:** the system of record stops matching reality, so every future build starts from a lie.
**The fix:** waivers in `.hallmark/waivers.jsonl` with reason + expiry; docs checked by `skill-lint.mjs`, `tokens-check.mjs`, and `gate-coverage.mjs`.
**Checked by:** A18 (scanner) + CI integrity checks.

---

## Using this file

- **Builders:** before inventing a visual device, check whether it is a pattern above.
- **Reviewers (Goldfish):** cite the pattern id in findings ("P04 — stale figure: pub.dev version").
- **Adding a pattern:** only when it has been observed in a real review or drift report, with a specific fix. This file grows from evidence, not imagination.
