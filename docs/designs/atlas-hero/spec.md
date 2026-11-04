<!-- Namuna Design Doc v1.0 · slug: atlas-hero · status: built · tokens: v1.3 · material: real/absent verified -->
# Spec — atlas-hero

**Status log:** draft → review pass 1 (`fix`: annotation/crop alignment, numbers double-gap) → resolve (spec amended) → review pass 2 (`ship`) → **built** (scanner 0 hard fails · Lighthouse 100/100/100 · sweep 360–1440 clean · finish-review fix: hero entrance animation removed — Lighthouse sampled mid-fade contrast; restraint per 2026 motion research)

## 1 · The job
Get verified Nepal administrative data into a developer's hands — download it, explore it, or install the package.

## 2 · Audience & tone
Developers, data users, researchers, pub.dev visitors. Tone: **editorial-austere** — calm, precise, proud. No exclamation marks.

## 3 · Sections (order + fate)

| # | Section | Purpose | Surface | Fate |
|---|---|---|---|---|
| 1 | **Hero (map)** | Prove the dataset visually; drive to data | paper | Rebuilt: h1 + sentence + actions + full-width point map + CBS annotation + caption |
| 2 | Numbers band | The counts the map proves | full-bleed teal | Kept; `padding-top: 2rem`, hero `padding-bottom: 1.5rem` (no double gap) |
| 3 | Projects | The three shipped tools | paper, airy | Pills → mono meta lines; arrows removed from internal links |
| 4 | Workshop | Honest placeholders | paper | Eyebrow removed; content unchanged |
| 5 | Method | Why the data is trustworthy | paper | Eyebrow removed; "Verified, not asserted." opens |
| 6 | **Data** | District index + downloads | paper | NEW: absorbs old atlas `<details>` index + GeoJSON/Data-Explorer actions |
| 7 | About | Who + principles | paper | Eyebrow → visible `h2` "About" with terracotta rule |
| 8 | Links | Elsewhere | paper | Eyebrow removed; h2 "Find us" stands |
| 9 | Footer | Colophon + links | ink | Unchanged |

## 4 · Hero (detailed)

- **h1:** `753 places. Every one coded.` (5 words — true: 753/753 carry CBS codes)
- **Sentence:** `Verified administrative data for all of Nepal — offline, bilingual, free.` (11 words; scope substantiated by caption tiers + Method section)
- **Actions:** primary `Download the dataset` → `#data` · ghost `How we verify` → `#method`
- **Map:** `assets/nepal-mark.svg` full-width, `height: auto` (no crop — annotation alignment depends on it), eager + `fetchpriority="high"`
- **Annotation:** absolute at `left: 54.19%; top: 64.88%` (offset +14px right, −50% up): `CBS 31304 — Bharatpur (भरतपुर), verified` — mono, `--ink-soft`, leader dash to the dot. Projected from nGeo bindings v2.15.0, cbsCode 31304. Verified gap-to-dot: **0px at 360/768/1024/1440**. At ≤560px the annotation flips above the dot (centered, vertical leader) to stay inside the viewport.
- **Caption:** `753 palika centroids, approximate — nGeo bindings v2.15.0, CC-BY-4.0. 548 codes doubly attested, 205 single-source, 0 invented.`
- **Numbers strip:** 7 / 77 / 753 / 6,743 with Devanagari labels — directly beneath map.
- **Motto:** "Sharing is Caring." demoted from hero h1 to motto (lives in og card, profile, footer intent).

## 5 · Demolition (applied site-wide)

- **Eyebrows:** all 7 removed. `h2`s gain a 24px terracotta hairline above (`.section-head h2::before`).
- **Pills:** project cards → single mono meta line (`v2.10.0 — MIT, data CC-BY-4.0, zero dependencies` / `active — code MIT, data CC0, Dart 3`). nHisab keeps ONE pill: `Invite-only PWA`; 49/49 tests moved into its description. Hero trust chips deleted. Atlas tags deleted with section.
- **Arrows:** `↗` kept only on external links (github.com, pub.dev). Internal links plain. Footer `↑` kept.
- **Middle-dot meta:** `.eco-line` → sentence. Footer fine print + colophon keep dots (legal-line convention).
- **Dotted grid:** removed from hero (was duplicated on atlas frame; frame deleted entirely).
- **Sample cards:** markup + CSS deleted; evidence became the map annotation.

## 6 · Tokens
Existing tokens only. Component-level overrides (recorded, not tokenized): `.hero h1` → `clamp(2.4rem, 5.5vw, 3.6rem)`; `.hero-map` height auto (content-driven). Deleted styles: `.eyebrow`, `.hero-art`, `.sample-card`, `.sc-*`, `.atlas-panel`, `.atlas-stats`, `.atlas-map*`, `.legend*`, `pill-flagship`, float/hero-rise/mark-drift keyframes. Retained: `.district-groups`, `.atlas-list`, `.numbers`, parallax (retargeted to `.hero-map`, −20px).

## 7 · Material ledger
- **real:** dataset v2.15.0 (dataAsOf 2026-10-27, bindings/meta.json) · 753/77/7 counts · CBS 31304 Bharatpur (verified tier) · 548/205/0 tiers · map SVG (generated from bindings) · version/commit figures on cards
- **placeholder:** workshop repos (unchanged, "Do not cite" line kept)
- **absent:** testimonials, download counts, npm/PyPI install counts, logos, photos

## 8 · Motion
- Map rings breathe (inside SVG; untouched). **No hero entrance animation** (finish-review fix).
- Hero map: scroll drift `translate 0 → −20px` over first 90vh (`scroll(root block)`). Reduced-motion: disabled by global rule.
- Scroll reveals (view-timeline) retained for below-fold blocks.

## 9 · Accessibility
- Map `alt` rewritten for hero role; annotation is real text, `--ink-soft` on `--bg` (≥ 6.4:1 both modes); CBS info in annotation + caption.
- `:focus-visible` unchanged; touch targets unchanged; print: map prints (`.hero-art` removed from suppression), annotations print.

## 10 · Open questions
- nMiti live BS date + real file sizes: **Phase C3**, not faked.
- `--dot` / `--aura` / `--watermark` tokens now unused (kept; harmless).

## Review log
- **Pass 1 — `fix`:** (1) annotation/crop misalignment under `object-fit: cover` → resolved: no crop, `height: auto`; (2) double gap map→numbers → resolved: `.numbers{padding-top:2rem}`, hero `padding-bottom:1.5rem`.
- **Pass 2 — `ship`.**
- **Finish review:** Lighthouse flagged lede/buttons at 2.04:1 — sampled mid-entrance-fade. Fix: hero entrance animation removed (aligns with 2026 restraint research). Re-audit: 100/100/100.