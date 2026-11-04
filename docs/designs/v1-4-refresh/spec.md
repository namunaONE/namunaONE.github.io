<!-- Namuna Design Doc v1.0 · slug: v1-4-refresh · status: built · tokens: v1.3 · material: real/absent verified -->

# Spec — v1-4-refresh

**Status log:** built (2026-11-04). Review pass 3 returned ship.

## 1 · The job

Get verified Nepal administrative data into a developer's hands — download it, explore it, or install the package. (Unchanged from atlas-hero.)

## 2 · Audience & tone

Developers, data users, researchers, pub.dev visitors. Tone: **editorial-austere** — calm, precise, proud. No exclamation marks. (Unchanged.)

## 3 · Sections (order + fate)

Each row below lists name, purpose, composition, and what it shows. Unchanged sections are defined in `docs/designs/atlas-hero/spec.md` (status: built) and are not re-specified here.

| # | Section | Purpose | Composition | What it shows | Fate |
|---|---|---|---|---|---|
| 1 | Hero (map) | Prove the dataset visually; drive to data | 2-col: copy + point map | 753 palika centroids, CBS 31304 annotation | Unchanged |
| 2 | Numbers band ("Nepal now") | The counts the map proves + today's date | 4-col stat grid + caption + today line | 7/77/753/6,743 + live BS/AD date | Modified (§4.1) |
| 3 | Today strip (bs-today) | Live BS date, honest | constrained section, 2-col grid | live BS/AD date, tier, as-of | Unchanged (shipped) |
| 4 | Data | District index + downloads | section + details + actions | 77 districts, GeoJSON/Explorer links | Unchanged |
| 5 | Projects | The three shipped tools | card grid (feature + 2) | nGeo, nMiti, nHisab cards | Modified (§4.3) |
| 6 | Workshop | Honest placeholders | 4-col workshop grid | nWeather, nBhumi, nTransit, nElection | Unchanged |
| 7 | Method | Why the data is trustworthy | 4-step pipeline + tier bar | 548/205/0 tiers, 72/72 conflicts | Modified (§4.2) |
| 8 | About | Who + principles | 2-col: dictionary + principles | namuna definition, 5 principles | Unchanged |
| 9 | Links | Elsewhere | link list | GitHub, pub.dev, bindings, sites, llms.txt | Micro-tightening |
| 10 | Footer | Colophon + links | 3-col footer | projects, elsewhere, colophon | Micro-tightening |

## 4 · Changes (detailed)

### 4.1 Numbers band — "Nepal now" line

- Add a new element inside `.numbers-inner`, after `.numbers-caption`:
  - `<p class="numbers-today" id="numbers-today">Today in Bikram Sambat — see the strip below.</p>` (fallback, no date, no BS date literal — A14-safe). The fallback uses an em dash because it is prose, not a date separator.
- Styling: `--text-xs`, `--font-mono`, `--band-muted`, `margin-top: 0.6rem`. No `letter-spacing` (A10). No middle dots (A11): separators are spaced en-dashes (U+2013, ` – `) or commas only. No uppercase (A9).
- Mobile: below 760px, `.numbers-today` inherits the band's full width and wraps naturally (single paragraph, no grid change).
- The bs-today fetch (in `main.js`) is extended: inside `render()`, after the staleness guard passes and the strip is rendered, if `#numbers-today` exists, set its `textContent` to `Today in Nepal – ` + `bs.label_np` + ` – ` + `ad.label_en` (spaced en-dashes, U+2013). If the fetch fails or the data is stale, `render()` returns early and `#numbers-today` keeps its fallback text.

### 4.2 Method section — tier-split bar

- Add a new element inside `.method` section, after `.method-steps` and before `.method-note`:
  - `<div class="tier-bar reveal" aria-label="CBS code attestation tiers">` containing:
    - `.tier-bar-track` (display: flex; full width; height 12px; border-radius 999px; overflow hidden; background `--line`) with three child segments:
      - `.tier-seg.tier-verified` — width 72.78% (548/753) — background `--good`.
      - `.tier-seg.tier-single` — width 27.22% (205/753) — background `--warn`.
      - `.tier-seg.tier-uncoded` — width 0% (0/753) — background `--muted`.
    - `.tier-legend` (`<ul>`, display flex, flex-wrap wrap, gap 1rem, list-style none, padding 0, margin 1rem 0 0) with three `<li>`:
      - `<li><span class="tier-dot tier-verified"></span> 548 verified — doubly attested CBS codes</li>` (dot background `--good`)
      - `<li><span class="tier-dot tier-single"></span> 205 single-source — one attestation</li>` (dot background `--warn`)
      - `<li><span class="tier-dot tier-uncoded"></span> 0 uncoded — 100% coded</li>` (dot background `--muted`)
      - Legend text: `--text-sm`, `--font-body`, `--ink-soft`, sentence case, no `letter-spacing`, no `text-transform` (A9/A10 clean). `.tier-dot`: 10px square, border-radius 999, inline-block, margin-right 0.4rem, vertical-align middle.
    - `.tier-note` (`<p>`, `--text-xs`, `--font-mono`, `--muted`, margin-top 0.75rem): `72 conflicts, 72 resolved — each with a written record of which source won, and why. <a href="https://github.com/namunaONE/nGeo#-data-verification-pipeline" rel="noopener">Read the pipeline ↗</a>`. The link uses `display: inline-flex; align-items: center; min-height: 44px;` so the touch target applies.
    - `.tier-source` (`<p>`, `--text-xs`, `--font-mono`, `--muted`, margin-top 0.25rem): `Source: nGeo bindings v2.15.0 (bindings/meta.json) — 753 local bodies, 548 doubly attested, 205 single-source, 0 uncoded, 72 conflicts resolved.` (em dashes U+2014 in prose labels; no middle dots — A11).
- The bar track is `aria-hidden="true"` (decorative; the legend carries the accessible text). The container `.tier-bar` keeps `aria-label="CBS code attestation tiers"`. `.tier-bar` gets the `.reveal` class for scroll reveal (transform/opacity only, reduced-motion-safe, consistent with `.method-steps`).
- All figures trace to nGeo bindings v2.15.0. Percentages: 548/753 = 72.78%, 205/753 = 27.22%.
- The bar is CSS-only (no JS, no animation). `prefers-reduced-motion` unaffected (no animation added).
- Responsive: below 760px, the legend wraps (flex-wrap: wrap); the bar stays full-width.
- Print: the tier bar prints (content, not in suppression list). `.tier-bar, .tier-legend, .tier-note, .tier-source` are not suppressed.
- Forced colors: `.tier-bar-track { border: 1px solid CanvasText; background: Canvas; }`; `.tier-seg { background: CanvasText; }`; `.tier-dot { border: 1px solid CanvasText; }`; `.tier-note a { color: LinkText; }`.
- High contrast: `.tier-bar-track { border-width: 2px; }`; `.tier-dot { border-width: 2px; }`.

### 4.3 nGeo feature card alignment

- Component-level CSS tweaks only (no markup changes, no new tokens):
  - `.feature-aside` padding: `1.5rem`.
  - `.f-stat`: `margin-bottom: 0.75rem` (last child 0).
  - `.f-label`: unchanged (existing mono label; already waived under A9/A10 as part of the design system).
  - `.install` in `.card--feature`: `margin-top: 0.9rem`.
  - `.eco-line` in `.card--feature`: final rule `margin: 0.75rem 0 0` (reconciles with existing `margin: -0.4rem 0 1rem`).

### 4.4 Links / footer micro-tightening

- Colophon version string: `site v1.3.0` → `site v1.4.0` (in `index.html`).
- Footer bottom fine print: unchanged.
- Link rows: unchanged.
- No other markup changes.

### 4.5 JS changes

- Extend the bs-today fetch IIFE in `main.js`: inside `render()`, after the staleness guard passes and the strip is rendered, if `#numbers-today` exists, set its `textContent` to `Today in Nepal – ` + `bs.label_np` + ` – ` + `ad.label_en` (spaced en-dashes, U+2013). If the fetch fails or the data is stale, `render()` returns early and `#numbers-today` keeps its fallback text.
- No new fetch, no new timer. Reuses the existing endpoint and fetch-in-flight guard.

### 4.6 Tokens

Existing tokens only. No additions to `:root`. No new primitives, no new semantics. No STYLEGUIDE.md version bump (v1.3 unchanged; component-level tweaks only). The colophon version (site v1.4.0) is a site version, not a design system version.

### 4.7 Material ledger

- **real**: nGeo bindings v2.15.0 (7, 77, 753, 6,743; 548/205/0 tiers; 72 conflicts resolved) · nMiti today.json (CC0) · existing map SVG.
- **placeholder**: workshop repos (unchanged).
- **absent**: same as before (testimonials, download counts, logos, photos).

### 4.9 Accessibility

- Tier bar: `.tier-bar-track` is `aria-hidden="true"` (decorative; legend carries the accessible text). `.tier-bar` has `aria-label="CBS code attestation tiers"`. `.tier-note` provides context.
- Touch targets: legend items are text; the only interactive element is the `Read the pipeline ↗` link (`display: inline-flex; align-items: center; min-height: 44px;`).
- Contrast: `--good` on `--bg` ≥ 4.5:1 (green-700 on stone-50); `--warn` on `--bg` ≥ 4.5:1 (amber-700 on stone-50, borderline — verify). Dark mode: `--good`/`--warn` are green-300/amber-300 on stone-900, passes.
- Print: tier bar prints (content, not in suppression list).
- Forced colors: handled (§4.2).
- High contrast: handled (§4.2).

### 4.10 Open questions

- Whether the tier bar should link to a specific nGeo file (e.g., the adjudication record) rather than the README anchor: deferred — the README anchor is the current target.
- Whether to add a "last updated" date to the numbers band: no — the caption already has "data as of 2026-10-27".

## 5 · Hero

Unchanged. Hero contract (headline ≤7 words: `753 places. Every one coded.` (5 words); sentence ≤12 words: `Verified administrative data for all of Nepal — offline, bilingual, free.` (10 words); primary action `Download the dataset` → `#data`) already met and not touched.

## 6 · Tokens

Existing tokens only. No additions. No STYLEGUIDE bump (v1.3 unchanged).

## 7 · Material ledger

- **real**: nGeo bindings v2.15.0 (7, 77, 753, 6,743; 548/205/0 tiers; 72 conflicts resolved) · nMiti today.json (CC0) · existing map SVG.
- **placeholder**: workshop repos (unchanged).
- **absent**: same as before (testimonials, download counts, logos, photos).

## 8 · Motion

Tier bar: no animation (static). All existing motion unchanged. Reduced motion: the global `@media (prefers-reduced-motion: reduce)` rule (in `assets/css/style.css`, §4 adaptations) already kills all animation/transition; the tier bar adds no motion of its own, so it is covered.

## 9 · Accessibility

See §4.9. Summary: tier bar `aria-hidden` on track, legend as accessible text, `aria-label` on container, touch targets ≥44px, contrast ≥4.5:1, prints, survives high-contrast and forced-colors, no motion.

## 10 · Open questions

See §4.10.

## Review log

- **Pass 1 — `fix`:** deliberation noise, tier-legend styling, tier-bar-track layout, em/en-dash terminology, forced-colors/print concreteness, numbers-today mobile, eco-line margin, reveal decision. No waivers.
- **Pass 2 — `fix`:** tier-dot background per tier, tier-note a display:inline-flex for 44px, reveal waffle resolved to yes, #numbers-today update pinned inside render() after staleness check, tier-bar source attribution added, §3 section table gained composition/what-it-shows columns, numbers-today fallback em-dash clarified as prose. No waivers.
- **Pass 3 — `ship`:** all ten gates pass; only minor self-flagged items (borderline --warn contrast to verify at build, cosmetic §4.8 numbering skip, four forced-colors rules sufficient). No waivers. Handoff to namuna-build.
