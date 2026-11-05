<!-- Namuna Design Doc v1.0 · slug: panchang-today · status: built · tokens: v1.3 · material: real/absent verified -->

# Spec — panchang-today

**Status log:** built (2026-11-05). Review pass 4 → 4 fixes applied (ghost `#panchang-date` resolved to `#panchang-np`, endpoint hoisted into §4.2, `.panchang-source` spans grid, numbers-today copy + A20 checks promoted to build items).

## 1 · The job

Let a visitor glance at today's Bikram Sambat date, sunrise, and tithi — sourced live from nMiti, never stale, never invented — with a single link to nMiti's full panchang page.

## 2 · Audience & tone

Developers, data users, researchers, pub.dev visitors. Tone: **editorial-austere** — calm, precise, proud; no exclamation marks; no festival name is shown because nMiti does not cover festivals.

## 3 · Sections (order + fate)

| # | Section | Purpose | Composition | What it shows | Fate |
|---|---|---|---|---|---|
| 1 | Hero (map) | Prove the dataset visually; drive to data | 2-col: copy + point map | CBS map, 31304 annotation | Unchanged |
| 2 | **Panchang strip (NEW)** | Today's BS date + sunrise + tithi at a glance | constrained `.panchang-today` section, 2-col grid (left: date/sunrise, right: provenance) | live BS/AD date, sunrise NPT, tithi udaya → madhyahna, as-of stamp | NEW (§4) |
| 3 | Numbers band | The counts the map proves + today line | 4-col stat grid + caption + today line | 7/77/753/6,743 + live date | Unchanged |
| 4 | Today strip (bs-today) | Live BS date, honest | constrained `.bs-today` section | live date, tier, as-of | Unchanged (retained deliberately — see §11) |
| 5 | Data | District index + downloads | section + details + actions | 77 districts | Unchanged |
| 6 | Projects | The three shipped tools | card grid | nGeo, nMiti, nHisab | Unchanged |
| 7 | Workshop | Honest placeholders | 4-col grid | 4 placeholder repos | Unchanged |
| 8 | Method | Why the data is trustworthy | 4-step pipeline + tier bar | 548/205/0 | Unchanged |
| 9 | About | Who + principles | 2-col | namuna definition | Unchanged |
| 10 | Links | Elsewhere | link list | GitHub, pub.dev, sites | Unchanged |
| 11 | Footer | Colophon + links | 3-col footer | projects, elsewhere | Unchanged |

All existing sections otherwise unchanged. Only new addition is the panchang strip inserted between Hero and Numbers band.

## 4 · The strip (detailed)

### 4.1 Markup (target)

Exact fallback markup (pinned — the builder starts from this, then JS enriches in place):

```html
<section class="panchang-today" aria-labelledby="panchang-title">
  <h2 id="panchang-title" class="sr-only">Today's panchang</h2>
  <div class="panchang-grid">
    <div class="panchang-primary">
      <p class="panchang-date" lang="en" aria-live="polite" id="panchang-np">Today, in Bikram Sambat</p>
      <p class="panchang-ad" id="panchang-ad" hidden></p>
      <p class="panchang-sunrise" id="panchang-sunrise" hidden></p>
    </div>
    <p class="panchang-provenance">
      <a class="panchang-tithi-link" id="panchang-tithi"
         href="https://namunaone.github.io/nMiti/panchang.html" rel="noopener">Panchang detail →</a>
    </p>
    <p class="panchang-source" id="panchang-source" style="grid-column: 1 / -1">nMiti unreachable — panchang link above</p>
  </div>
</section>
```

Rules:
- `<p id="panchang-np" lang="en">` keeps `lang="en"` **always** — the Devanagari span (`lang="ne"`) carries its own lang; the English text and the `.panchang-label-en` span inherit `lang="en"`. Never set `lang="ne"` on the `<p>` as a whole.
- Fallback `.panchang-date` → `--text-2xl`, `--font-display`, `--ink-soft`. Rendered state (`.is-rendered`) → `--text-2xl`, `--font-deva`, `--ink`; English label span → `--text-lg`, `--font-display`, `--ink-soft` (inline, single space separator).
- Fallback `#panchang-tithi` = the link alone (text `Panchang detail →`), not a repeated sentence — avoids no-JS visitors reading the same line twice.
- `panchang.source` (fallback): `nMiti unreachable — panchang link above` (network/HTTP/parse failure) **or** `nMiti may be stale — see <a href="https://namunaone.github.io/nMiti/accuracy.html" rel="noopener">nMiti Accuracy →</a>` (staleness trip); distinct conditions, spelled out in §4.5.
- `style="grid-column: 1 / -1"` on `#panchang-source` spans both columns below the primary/provenance row — fallback copy accurate ("panchang link above").

### 4.2 today.json field contract

Fetch endpoint (absolute, normative): `https://namunaone.github.io/nMiti/api/v1/today.json` — same origin; CC0; CORS `*`; `max-age=600`.

Live as of 2026-11-05, verified:

| Path | Type | Example use |
|---|---|---|
| `bs.label_np` | string | `कात्तिक १९, २०८३` — `#panchang-np` (Devanagari span with `lang="ne"`) |
| `bs.label_en` | string | `Kartik 19, 2083 BS` — appended to `#panchang-np` on render inside `<span class="panchang-label-en">` |
| `ad.iso` | string (YYYY-MM-DD) | `2026-11-05` — staleness guard input |
| `ad.label_en` | string | `Thursday, November 5, 2026` — `#panchang-ad` |
| `panchang.sunrise_npt` | string (ISO with offset) | `2026-11-05T06:16:00+05:45` — formatted as `Sunrise 06:16 NPT`; unhidden on render |
| `panchang.tithi.udaya.name` | string | `Krishna Ekadashi` |
| `panchang.tithi.udaya.ends_at` | string (ISO with offset) | `2026-11-05T10:51:00+05:45` |
| `panchang.tithi.madhyahna.name` | string | `Krishna Dwadashi` |
| `panchang.tithi.madhyahna.ends_at` | string (ISO with offset) | `2026-11-06T10:46:00+05:45` |
| `generated_at_utc` | string (ISO 8601) | `2026-11-05T04:23:09.848227Z` — "as of" stamp |
| `panchang.details` | string (URL) | `https://namunaone.github.io/nMiti/panchang.html` — explicit href for "Panchang detail →" |

### 4.3 Rendering

- On successful fetch (staleness guard passed, §4.4):
  - `#panchang-np` → `bs.label_np` (Devanagari span with `lang="ne"`) + `<span class="panchang-label-en">` + `bs.label_en` + `</span>`; `is-rendered` class switches face to `--font-deva` and color to `--ink`.
  - `#panchang-ad` → `ad.label_en`; remove `hidden`.
  - `#panchang-sunrise` → `Sunrise ` + time in HH:MM NPT format (slice `panchang.sunrise_npt` for HH:MM); remove `hidden`.
  - `#panchang-tithi` → `Tithi – ` + `panchang.tithi.udaya.name` + ` ends ` + HH:MM NPT + ` → ` + `panchang.tithi.madhyahna.name`; use spaced en-dashes (U+2013) only; no middle dots (A11).
  - `#panchang-source` → `Source: nMiti panchang engine — engine-computed at build time, as of ` + formatted `generated_at_utc` + ` — ` + link `Panchang detail →` to `panchang.details`.
- `generated_at_utc` format (pinned, same as bs-today): take the first 16 characters (`"2026-11-05T04:23"`), replace `T` with a space, append ` UTC` → `"2026-11-05 04:23 UTC"`. No locale-dependent formatting.
- Fallback (no JS / API unreachable — network/HTTP/parse/timeout):
  - `#panchang-ad`, `#panchang-sunrise` stay `hidden`.
  - `#panchang-np` shows English fallback.
  - `#panchang-tithi` stays as the `Panchang detail →` link (no BS date).
  - `#panchang-source` → `nMiti unreachable — panchang link above`.
- Stale after a previous good render: keep the already-rendered `#panchang-np` / `#panchang-ad` / `#panchang-sunrise` / `#panchang-tithi` values (do not revert to English fallback); change only `#panchang-source` to `nMiti may be stale — see <a href="https://namunaone.github.io/nMiti/accuracy.html" rel="noopener">nMiti Accuracy →</a>`. `aria-live` does **not** re-announce on stale (only first successful render announces).

### 4.4 Staleness guard

Same semantics as bs-today, cleaner implementation:
- Trip if **either**: (a) `ad.iso != todayKTM` (visitor's today computed in `Asia/Kathmandu`: `new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kathmandu' })`), or (b) `generated_at_utc` older than 26h.
- On trip: strip keeps last good render (§4.3, stale-after-good-render) or shows fallback if never fetched; source line shows the "stale" message.
- No `setInterval`. Re-fetch at each of the three midnight runs (00:00/00:30/01:00 NPT) plus every 6h.
- Fetch-in-flight guard: `fetching` boolean; `visibilitychange` throttle 10 min.

### 4.5 Failure modes (network/HTTP/timeout/parse)

- 4s `AbortController`; non-2xx, network error, parse failure → fallback link; source line `nMiti unreachable — panchang link above`.
- `ad.iso` in the future relative to KTM today → treat as trip (staleness), not render.
- `ad.iso` missing/malformed → treat as trip.
- Reduced motion: none; no animation of any kind.

### 4.6 Layout & typography

- Container: `max-width: var(--maxw)`, `margin-inline: auto`, `padding: 1.25rem var(--gutter)`, `border-top: 1px solid var(--line)`, `border-bottom: 1px solid var(--line)`, `background: var(--bg)`.
- Grid: `grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr)` at ≥760px; one column below.
- Text sizes:
  - `#panchang-np` fallback → `--text-2xl`, `--font-display`, `--ink-soft`; rendered → `--text-2xl`, `--font-deva`, `--ink`.
  - `.panchang-label-en` → `--text-lg`, `--font-display`, `--ink-soft`, inline after the Devanagari, single space separator.
  - `#panchang-ad` → `--text-sm`, `--font-body`, `--muted`.
  - `#panchang-sunrise` → `--text-xs`, `--font-mono`, `--muted`.
  - `#panchang-tithi` → `--text-sm`, `--font-body`, `--ink-soft`; rendered as a link, not duplicated with the tithi name line.
  - `#panchang-source` → `--text-xs`, `--font-mono`, `--muted`.
- Minimum height: `min-height: 5rem` (CLS prevention).

### 4.7 Material ledger

- **real**: nMiti `api/v1/today.json` (CC0) — `bs.label_np`, `bs.label_en`, `ad.iso`, `ad.label_en`, `panchang.sunrise_npt`, `panchang.tithi.*`, `generated_at_utc`, `panchang.details`. All rendered values trace to this file and are stamped with `generated_at_utc`.
- **placeholder**: workshop repos unchanged from baseline.
- **absent**: festivals, muhurta, limb meanings — permanently absent from this strip by design (nMiti out of scope).
- **images**: none.

### 4.8 Motion

None. Strip has no animation. `prefers-reduced-motion: reduce` unaffected (global rule covers it).

### 4.9 Accessibility

- `aria-labelledby` on section; visually-hidden `<h2>` as landmark.
- `aria-live="polite"` on `#panchang-np`; one-shot announcement on first successful render; no re-announce on subsequent renders or on stale.
- `bs-today` and `panchang-today` each have their own polite live region; screen-reader users hear the same date twice (once per strip) on load — **documented and accepted**: `bs-today` is the bare date, `panchang-today` is date + sunrise + tithi + source; they are distinct regions for distinct audiences. Builder QA: verify both announce once each on first load, then stay silent.
- `lang="ne"` on the Devanagari span only; English fallback and English `.panchang-label-en` inherit `lang="en"`.
- Touch targets: all links (including fallback and the `Panchang detail →` link) ≥44px (min-height: 44px; display: inline-flex).
- Focus: `:focus-visible` global ring.
- Contrast: `--ink` on `--bg` ≥4.5:1; `--muted` on `--bg` ≥4.5:1 (verified: ≈5.9:1 light, ≈7.0:1 dark).
- Print: strip **prints** as content (not chrome); fallback prints as link.
- Forced colors: `.panchang-today { border: 1px solid CanvasText; background: Canvas; color: CanvasText; }` + links `LinkText`.
- Prefers contrast: `.panchang-source` strengthens to `--ink-soft`.

### 4.10 Adaptation blocks to extend

1. **Print** — add `.panchang-today` to the keep list (not suppression); 2-col grid prints (stacks below print width).
2. **Forced colors** — as above.
3. **Prefers contrast** — `.panchang-source` strengthens to `--ink-soft`.
4. **Reduced motion** — global rule covers.
5. **Responsive** — below 760px, grid collapses to one column.

### 4.11 Open questions

- Nakshatra: **no** — tithi only.
- Sankranti countdown: **deferred** to a separate spec.
- Redundancy between panchang strip and bs-today: **both retained deliberately**. The three live-date mentions (`bs-today`, `panchang-today`, `numbers-today`) are **populated by the same `fetchAndUpdate()` call in the existing fetch IIFE** — no independent fetches, so they cannot drift apart. If a full consolidation is ever wanted, it's a separate resolution, not a silent deletion.
- Build acceptance item (mandatory): update `numbers-today` fallback copy from `Today in Bikram Sambat — see the strip below.` to `Today, live from nMiti →` (panchang strip is now above the numbers band; the old copy is ambiguous).
- A20 build check (mandatory): HEAD/GET verify `https://namunaone.github.io/nMiti/panchang.html` and `https://namunaone.github.io/nMiti/accuracy.html` live at build time; hard fail if either does not resolve. Verify the rendered `Panchang detail →` link too.

## 5 · Hero

Unchanged. Hero contract already met (6-word headline, 10-word sentence, primary CTA visible at 1280×800). **Builder must re-verify A13 (fold check) after inserting the strip below the hero.**

## 6 · Tokens

Existing tokens only. No additions to `:root`. No STYLEGUIDE version bump.

## 7 · Material ledger

- **real**: nMiti `api/v1/today.json` (CC0-1.0); all rendered values trace to it.
- **placeholder**: workshop repos unchanged.
- **absent**: festivals, muhurta, limb meanings — permanently absent from this strip by design.
- **images**: none.

## 8 · Motion

None. Strip has no animation.

## 9 · Accessibility

See §4.9. Summary: labelled region, `aria-live` announcement (once), `lang="ne"` on Devanagari span, touch targets ≥44px, `:focus-visible` ring, ≥4.5:1 contrast, prints, survives high-contrast and forced-colors, no motion.

## 10 · Open questions

See §4.11. Festivals / sankranti are deliberately excluded.

## 11 · Review log

- **Pass 1 — `fix`:** padding contradiction (resolved: 1.25rem everywhere), fallback link target undefined (resolved: `panchang.details`), "iso details url" undefined (resolved: `Panchang detail →` → `panchang.details`), `lang="ne"` on English fallback (resolved: `lang="en"` fallback, `lang="ne"` Devanagari span only), fallback contradictions (resolved), "same model as .bs-today" (resolved: constrained `.section` model), `.panchang-label-en` binding (resolved: `--text-lg`), missing image ledger (added), double placeholder entry (collapsed), redundancy rationale (§4.11), contrast dark-mode claim (≈7.0:1). No waivers.
- **Pass 2 — `fix`:** `ad.iso` added to field contract (§4.2); fallback stale message href named (`accuracy.html`); fallback typography contradiction resolved (`.panchang-date` → display/ink-soft, `is-rendered` → deva/ink; stray `deva` class removed); `generated_at_utc` format pinned (`YYYY-MM-DD HH:MM UTC`, sliced like bs-today’s `asOfStamp`); fetch endpoint named (`https://namunaone.github.io/nMiti/api/v1/today.json`); staleness guard kept aligned to bs-today semantics (`toLocaleDateString('en-CA', { timeZone: 'Asia/Kathmandu' })` — documented as the same semantics with cleaner implementation, not a drift); stale-after-good-render specified (keep last good date, no re-announce, only source line changes); double polite live regions documented; triple date mentions pinned to shared `fetchAndUpdate()`; fallback consistency across §4.1/§4.3 verified. No waivers.
- **Pass 4 — `fix` → resolved:** ghost `#panchang-date` references resolved to actual `#panchang-np`; fetch endpoint hoisted into §4.2 (normative, not just the log); `.panchang-source` pinned to `grid-column: 1 / -1` and fallback copy set to "panchang link above" (accurate); numbers-today copy change promoted to mandatory build item; A20 live-link check named as mandatory build gate; ledger scoped as delta-only (arms, recorded). No waivers.

