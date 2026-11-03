# Namuna One — Design System v1.2

The visual and interaction rules behind **namunaone.github.io**.
Stone + Deep Teal, terracotta accent. System fonts only. Zero third-party requests.

> Rule 1: components consume **semantic tokens** only — never primitives, never raw hex.
> Rule 2: one accent voice. Terracotta is an accent; it is never body text.
> Rule 3: every state is legible — focus, hover, active, disabled, dark, high-contrast, print.

---

## 1 · Identity

| Element | Rule |
|---|---|
| Wordmark | `Namuna One` — Inter/body stack, 700. "One" tinted `--teal`. |
| Tile | Rounded square (14px @ 64px), `--teal-600`, Devanagari **न** in `--stone-50`, 5px `--terra-500` dot top-right. |
| Motto | **Sharing is Caring.** — always sentence case, period included. |
| Devanagari | नमूना ("namūnā" — sample/pattern) is the anchor glyph; used as watermark, never as a headline substitute. |
| Tagline / description | "Verified, offline-first open data and Dart tools for Nepal." |

Assets: `assets/favicon.svg` (same mark) · `assets/og.svg` (1200×630 social card).

---

## 2 · Tokens

### 2.1 Primitives (raw palette — never used by components)

| Token | Light value | Note |
|---|---|---|
| `--stone-50` | `#F5F4F2` | warm paper |
| `--stone-100` | `#ECEAE6` | sunken surface |
| `--stone-200` | `#E3E1DD` | hairline |
| `--stone-300` | `#D4D1CB` | strong line |
| `--stone-600` | `#55605F` | muted text |
| `--stone-700` | `#3C4A4B` | secondary text |
| `--stone-800` | `#1E2A2B` | ink |
| `--stone-900` | `#10171A` | dark page |
| `--teal-600` | `#0E4D5C` | brand primary |
| `--teal-700` | `#0A3A47` | hover / band |
| `--teal-300` | `#8FC7C7` | dark-mode primary |
| `--terra-500` | `#C4552D` | accent |
| `--terra-600` | `#A83F20` | accent text (AA) |
| `--green-700` | `#166E4F` | verified/stable (light) |
| `--green-300` | `#7BD3AE` | verified/stable (dark) |
| `--amber-700` | `#8A5A00` | invite-only (light) |
| `--amber-300` | `#EFC27A` | invite-only (dark) |

### 2.2 Semantics (components use ONLY these)

| Role | Light | Dark |
|---|---|---|
| `--bg` | stone-50 | stone-900 |
| `--surface` | `#FFFFFF` | `#171F22` |
| `--surface-sunken` | stone-100 | `#202A2E` |
| `--ink` / `--ink-soft` / `--muted` | stone-800 / 700 / 600 | `#F0EEE9` / `#C6D0CE` / `#94A4A2` |
| `--line` / `--line-strong` / `--line-hover` | 200 / 300 / `#B9C9C7` | `#2A3539` / `#3A474B` / `#4B5C60` |
| `--teal` / `--teal-soft` | 600 / 50 | 300 / `#172C31` |
| `--link` / `--link-hover` | 600 / 700 | 400 / `#C4E7E6` |
| `--accent` / `--accent-strong` / `--accent-soft` | 500 / 600 / 50 | 300 / 300 / `#33201A` |
| `--action-bg` / `--action-fg` / `--action-bg-hover` | 600 / white / 700 | 300 / `#08262B` / `#B3DCDC` |
| `--code-bg` / `--code-fg` | stone-800 / `#D9E4E2` | `#0B1214` / `#CFDCDA` |
| `--footer-bg` / `--footer-fg` / `--footer-muted` | stone-800 / stone-50 / `#9FB8B4` | `#0A1012` / `#F0EEE9` / `#8FA3A0` |
| `--band-bg` / `--band-fg` / `--band-muted` | teal-700 / white / `#C3D4D1` | teal-800 / `#F2F8F6` / `#A8C4C0` |
| `--good` / `--good-soft` | green-700 / 50 | green-300 / 900 |
| `--warn` / `--warn-soft` | amber-700 / 50 | amber-300 / 900 |
| `--focus` | teal-600 | teal-300 |
| `--map-palika` / `--map-district` / `--map-province` | `#1C5B6B` / `#0E4D5C` / `#C4552D` | `#8FC7C7` / `#D7EEEC` / `#F0A583` |

Dark values activate via `@media (prefers-color-scheme: dark)`. Never test dark mode by adding a class — the OS drives it.

**Contrast targets:** body ≥ 4.5:1 · large display ≥ 3:1 · UI borders ≥ 3:1 · small mono labels ≥ 4.5:1.

---

## 3 · Typography

System stacks — no webfont files ship:

```css
--font-display: 'Fraunces', 'Iowan Old Style', 'Palatino Linotype', Georgia, serif;
--font-body:    'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
--font-deva:    'Noto Serif Devanagari', 'Nirmala UI', 'Mangal', serif;
--font-mono:    ui-monospace, 'Cascadia Code', 'SF Mono', Consolas, monospace;
```

| Token | Size | Use |
|---|---|---|
| `--text-xs` | 0.72rem (11.5px) | mono labels, pills, repo paths |
| `--text-sm` | 0.875rem | small print, UI |
| `--text-base` | 1.0625rem (17px) | body |
| `--text-lg` | 1.1875rem | lede |
| `--text-xl` | clamp(1.45–1.8rem) | card headings |
| `--text-2xl` | clamp(1.9–2.8rem) | section h2 |
| `--text-hero` | clamp(2.85–4.75rem) | hero h1 only |

Rules: headings `text-wrap: balance`, paragraphs `text-wrap: pretty`; measure ≤ 68ch; body line-height 1.65, headings 1.08; Devanagari always rendered in a Devanagari face, 1.2em minimum.

---

## 4 · Layout, spacing, geometry

- Container: 1120px max, gutter `clamp(1.25rem, 4vw, 2.5rem)`.
- Section rhythm: `--section-y` = clamp(3.5rem, 8vw, 6rem); 4pt base / 8pt rhythm.
- Radii: 16 cards · 12 buttons/monograms · 8 chips/inputs.
- Breakpoints: 1000px (3→2 cards, about stacks), 760px (nav collapses, hero stacks, cards 1-col), 420px (workshop 1-col).
- Hero: 2-col 1.05/0.95 until 760px, then art-first stacked. `min-height: min(88svh, 860px)`.
- Anchor targets get `scroll-margin-top: 5.25rem` (sticky header offset).
- Editorial numbering: `01 · The data`, `02 · Portfolio`, `03 · In the workshop`, `04 · About`, `05 · Elsewhere` — mono eyebrow, terracotta rule.

---

## 5 · Components

| Component | Spec |
|---|---|
| **Button primary** | `--action-bg`, 44px min height, radius 8, 600 weight; hover lifts 1px (pointer only) |
| **Button ghost** | transparent, 1px `--line-strong`, text `--ghost-fg`; hover teal-soft fill |
| **Nav** | sticky, blurred `--bg` at 82%, hairline appears on scroll; active section = `aria-current="true"` teal-soft pill |
| **Card** | surface, 1px line, 16 radius, faint shadow; hover lift 3px + `--line-hover` (pointer only) |
| **Feature card** | nGeo spans both columns (bento); internal 2-col: content + `--surface-sunken` metrics panel. Stacks below 1000px. |
| **Atlas panel** | surface card holding the Nepal point map; copy column + map column, 1-col below 1000px. Map sits on a dotted grid frame. |
| **Point map** | `assets/nepal-mark.svg` — generated from nGeo `bindings/geojson` (753 palikas · 77 districts · 7 provinces). Dots adapt via `prefers-color-scheme` inside the SVG; legend uses `--map-*`. |
| **District index** | native `<details>` — 77 districts grouped by province, English + Devanagari, no JS. |
| **Pill** | mono 0.68rem, 999 radius; semantic: stable → green, active → teal, invite → amber, flagship → action fill, chip → sunken |
| **Install block** | `--code-bg`, mono 0.78rem, copy button right; announces "Copied" via live region |
| **Monogram** | 56px, 12 radius, fixed primitives (geo teal · miti terracotta · hisab stone-800) so dark mode never flips brand tiles |
| **Sample card** | floating evidence card in hero; 212px max; subtle 6–8.5s float, disabled by reduced-motion |
| **Stat band** | deep-teal full-bleed; numerals in display serif; English uppercase label + Devanagari label below (`lang="ne"`) |
| **Colophon** | mono 0.68rem footer line: system fonts · hand-written · no trackers · version |
| **Dictionary card** | sticky on desktop ≥1000px; headword display serif + Devanagari accent |
| **Link row** | 48px min; hover shifts 4px + arrow slides 3px |
| **Footer** | dedicated dark tokens (never `--ink`), 3 columns → 1 under 760px |

---

## 6 · Motion

- Durations: `--dur-fast` 150ms · `--dur` 250ms; easing `--ease-out` cubic-bezier(0.22, 0.61, 0.36, 1).
- Hero copy rises in on load (0.65s, staggered 60–80ms) via the independent `translate` property, not `transform`.
- Section blocks use **pure-CSS scroll-driven reveals** (`animation-timeline: view()`, `animation-range: entry 6%–55%`) where supported; unsupported browsers get static content. Reveals animate `translate`/`opacity` only, so card hover lifts (transform) never conflict.
- Nothing loops except the hero sample cards (decorative).
- `prefers-reduced-motion: reduce` kills all animation/transition and smooth scroll.

---

## 7 · Accessibility & adaptation

- Skip link, landmarks, one `h1`, ordered headings, `aria-labelledby` per section.
- Focus: 3px `--focus` ring, 3px offset, visible on every interactive element.
- Touch targets ≥ 44px (nav toggle 44, menu rows 48, link rows 48).
- Copy actions announce via `role="status" aria-live="polite"`.
- Status is never color alone: icon + text ("✓ CBS · Verified", "Invite-only PWA").
- `prefers-contrast: more`: muted → ink-soft, borders strengthen to 2px.
- `forced-colors: active`: system colors for buttons, cards, band, footer.
- Print: white background, nav/hero-art suppressed, external URLs expand inline.
- Dark mode: OS-driven via `prefers-color-scheme`; `color-scheme` + dual `theme-color` metas.

---

## 8 · Content voice

- Sentence case everywhere except the wordmark and proper nouns.
- Numbers are claims: every figure names its source or its scope. If a number can't be sourced, it doesn't ship.
- "Verified" is scoped, never decorative: say what was checked, by whom, when (nGeo tiers: 548 verified / 205 singleSource / 0 unverified).
- No exclamation marks, no growth-hack verbs. Calm, precise, proud.
- Nepali terms carry Devanagari on first use: नमूना, हिसाब, भूमि.

---

## 9 · Change workflow

1. Change a **primitive** only if the palette itself changes.
2. Change a **semantic** value to retheme a role (e.g., `--band-bg`).
3. Never hand-edit component CSS to a new hex — add or adjust a token instead.
4. Test: light, dark, 360/768/1024/1440 widths, keyboard-only, reduced motion, print preview.
5. Bump this document's version and note the change in the README if semantics changed.
