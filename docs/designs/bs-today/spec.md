<!-- Namuna Design Doc v1.0 · slug: bs-today · status: built · tokens: v1.3 · material: real verified -->

# Spec — bs-today

**Status log:** built (2026-11-04). Review pass 7 returned ship.

## 1 · The job

Let a visitor see today's date in Bikram Sambat, sourced live from nMiti — with its evidence tier and its "as of" timestamp — so the site never types a BS date it can't trace, and never shows one it knows is stale.

## 2 · Audience & tone

Developers, data users, researchers, pub.dev visitors — the same audience as the rest of Namuna One. Tone: **editorial-austere**, calm, precise, proud. No exclamation marks. The strip is a fact line with a source, not a greeting.

## 3 · Sections (order + fate)

No new page sections. One **strip** is inserted into the existing page:

| # | Placement | Purpose | Surface | Fate |
|---|---|---|---|---|
| — | Between the numbers band (`section.numbers`) and the Data section (`#data`) | Today's BS date, live, honest | paper (`--bg`), hairline rules | NEW: one strip, ~1 line tall, progressive (no-JS fallback is a link) |

All other sections (Hero, Numbers band, Data, Projects, Workshop, Method, About, Links, Footer) are **unchanged**. This spec does not touch them.

## 4 · The strip (detailed)

### 4.1 Markup (target)
- A new `<section class="bs-today" aria-labelledby="bs-today-title">` inserted immediately after the closing `</section>` of `.numbers` and before `<section class="section" id="data">`. `.bs-today` is a **constrained section** (not full-bleed): it uses `max-width: var(--maxw)`, `margin-inline: auto`, `padding: 1.5rem var(--gutter)` — the same centering model as `.section`. It does **not** wrap an inner `.container`; the section element itself is the container. (This matches §4.6: the teal numbers band above is the only full-bleed band; the strip is paper.)
- Inside, directly:
  - `<h2 id="bs-today-title" class="sr-only">Today in Bikram Sambat</h2>` (one h1 per page already exists in hero; this is a labelled region, screen-reader only).
  - `.bs-today-grid` — two columns on ≥760px, one column below:
    - **Left (primary):** `<p class="bs-today-date" lang="en" aria-live="polite" id="bs-today-np">Today, in Bikram Sambat</p>` (fallback text, no date, English, `--font-display`, `lang="en"`), then `<a class="bs-today-date-en" id="bs-today-en" href="https://namunaone.github.io/nMiti/" rel="noopener">See the calendar on nMiti ↗</a>` (fallback link, 44px touch target via padding).
    - **Right (provenance, mono):** `<p class="bs-today-source" id="bs-today-source">…</p>` (fallback: `Source: nMiti, open Bikram Sambat calendar commons, CC0, rebuilt every 6 hours (midnight runs 00:00, 00:30, 01:00 NPT plus every 6 hours)`).
  - A `<noscript>` block is NOT used; the static fallback text lives in the elements themselves, and JS upgrades them in place. (Progressive enhancement: the page is fully usable without JS; the date simply isn't claimed.)
- The fallback text contains **no BS date** (A14). The only date-like token in static HTML is the schedule claim "rebuilt every 6 hours", which is a cadence, not a date.

### 4.1a today.json field contract (verified against the live endpoint on 2026-11-04)

Endpoint: `https://namunaone.github.io/nMiti/api/v1/today.json` — static, no keys, CC0, same origin for this site, CORS `*`, `max-age=600`. Builder fetches live; no static copy is shipped (A14).

| Path | Type | Example | Use |
|---|---|---|---|
| `bs.label_np` | string | `कात्तिक १८, २०८३` | `#bs-today-np` (Devanagari, `lang="ne"`) |
| `bs.label_en` | string | `Kartik 18, 2083 BS` | first line of `#bs-today-en` |
| `bs.tier` | string | `r12-verified` | source line |
| `bs.evidence` | string | `r12-verified,live-2026-11-02` | source line |
| `ad.label_en` | string | `Wednesday, November 4, 2026` | `span.bs-today-ad` inside `#bs-today-en` |
| `ad.iso` | string (ISO date) | `2026-11-04` | staleness guard input |
| `generated_at_utc` | string (ISO 8601) | `2026-11-04T09:11:17.472977Z` | "as of" stamp + staleness guard |
| `commit` | string | `33317ce...` | not rendered; logged to `console.debug` for developer reproducibility only |
| `source` | string | `nMiti verified Bikram Sambat dataset (R12 cross-validation, 2026-11-02)` | source line |
| `tomorrow.bs` / `tomorrow.ad` | object / string | — | not used in v1; reserved for a future midnight self-correction pass |

### 4.2 Rendered (after successful fetch)
- `#bs-today-np` → `bs.label_np` (e.g. `कात्तिक १८, २०८३`), in `--font-deva`, `--text-2xl`, `--ink`, with `lang="ne"`.
- `#bs-today-source` → `Source: <source>, tier <tier>, evidence <evidence>, as of <generated_at_utc>, CC0, rebuilt every 6 hours (midnight runs 00:00, 00:30, 01:00 NPT plus every 6 hours; canary re-checks 4 times daily; 26-hour staleness SLA)` followed by a single link `Accuracy ↗` whose `href` is `https://namunaone.github.io/nMiti/accuracy.html`. The raw URL is not printed as text (the link carries it). No middle dots (A11): use commas and spaced en-dashes only. The `<source>` value is interpolated verbatim from `today.json` (e.g. `nMiti verified Bikram Sambat dataset (R12 cross-validation, 2026-11-02)`).
- `#bs-today-en` structure after fetch: because the fallback is an `<a>` and the rendered form is a `<p>`, JS replaces the element via `replaceWith` (creating a new `<p class="bs-today-date-en" id="bs-today-en">Kartik 18, 2083 BS <span class="bs-today-ad">Wednesday, November 4, 2026</span></p>` and preserving the `id`). The `aria-live` region is `#bs-today-np`, which is a stable `<p>` and is never replaced. The fallback (no JS / failure) remains `<a class="bs-today-date-en" id="bs-today-en" href="https://namunaone.github.io/nMiti/" rel="noopener">See the calendar on nMiti ↗</a>`.
- "As of" stamp format: take `generated_at_utc`, slice to 16 characters (`"2026-11-04T09:11"`), replace `T` with a space, append ` UTC` → `"2026-11-04 09:11 UTC"`. No locale-dependent formatting; deterministic across visitors.
- Announcement (one-shot): a `renderedOnce` boolean (initially false). On the first successful render, set `#bs-today-np` text while `aria-live="polite"` is active (announces). On every subsequent render (re-fetch, visibility change), set `aria-live="off"` on `#bs-today-np` before updating text, then restore `aria-live="polite"` after a 60 ms delay, so re-fetches do not re-announce. The fallback link and source line are updated without announcement.

### 4.3 Staleness guard
- nMiti ships `ad.iso` (the Gregorian date the BS date corresponds to) and `generated_at_utc`. Per nMiti's accuracy page (https://namunaone.github.io/nMiti/accuracy.html), the static site is rebuilt three times around Nepal midnight (00:00, 00:30, 01:00 NPT) plus every 6 hours; a correctness canary re-checks 4 times daily and opens an urgent issue on a mismatch or on staleness beyond a 26-hour SLA. Scheduled midnight rebuilds have been observed to be dropped or delayed, so the JSON can lag.
- **Verification (2026-11-04):** the live accuracy page at the URL above was fetched and confirms all four schedule figures (three midnight runs 00:00/00:30/01:00 NPT, every-6-hour cadence, 4×/day canary, 26-hour SLA). The URL resolves (A20). No invention; if the page is later revised, the build must re-verify.
- Worked example (visitor anywhere, KTM date 2026-11-04): fetch returns `ad.iso = "2026-11-03"`. Equality check fails (one day behind) → guard trips → no date rendered, fallback link shown, source line reads `nMiti last built <generated_at_utc> – calendar may be stale; see nMiti ↗`. If `ad.iso = "2026-11-04"` and `generated_at_utc` is 2 hours old, both checks pass → date renders. If `ad.iso = "2026-11-05"` (future), equality also fails → trip (never claim tomorrow's date today).
- Guard trips if **either**: (a) `ad.iso` is not equal to the visitor's current date in `Asia/Kathmandu` (UTC+05:45, no DST) — i.e. any past or future day, including exactly one day behind — **or** (b) `generated_at_utc` is older than **26 hours**. (26h = nMiti's own staleness SLA; cited from the accuracy page.) The visitor's "today" is computed in KTM regardless of the visitor's local timezone: `new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kathmandu' })`.
- On trip: the strip stays on the fallback link and shows `nMiti last built <generated_at_utc> – calendar may be stale; see nMiti ↗` in the source line. This is a declared, visible gap, not a silent failure (provenance.md "Gap declaration").
- Future-date handling (`ad.iso` ahead of the visitor's KTM date) is specified in §4.5 and not repeated here.
- Reason: a stale claim is worse than no claim. This matches nMiti's own stated risk (scheduled midnight rebuilds can be dropped).

### 4.4 Refresh cadence (client)
- Fetch on `DOMContentLoaded` (deferred script already).
- Re-fetch on `visibilitychange` when the document becomes visible, throttled to at most once per 10 minutes (matches `max-age=600`).
- Schedule re-fetches using **two `setTimeout` chains** (no `setInterval`):
  1. **Midnight chain**: target the next of {00:00, 00:30, 01:00} NPT (UTC+05:45, no DST). Compute in absolute (UTC) time to avoid browser-timezone bugs. KTM midnight (00:00) = 18:15 UTC (previous calendar day). The three runs are at 18:15, 18:45, and 19:15 UTC.
     - Concrete JS:
       ```
       const KTM_OFFSET_MS = 5.75 * 3600000;
       const nowUtc = Date.now();
       const ktmNow = new Date(nowUtc + KTM_OFFSET_MS);
       const ktmMidnightUtc = Date.UTC(ktmNow.getUTCFullYear(), ktmNow.getUTCMonth(), ktmNow.getUTCDate(), 0, 0, 0) - KTM_OFFSET_MS;
       const runs = [0, 30, 60].map(m => ktmMidnightUtc + m * 60000);
       const nextRun = runs.find(r => r > nowUtc) || (runs[0] + 86400000);
       const delayMs = nextRun - nowUtc;
       setTimeout(() => { fetchAndUpdate(); armMidnightChain(); }, delayMs);
       ```
  2. **Fallback chain**: a separate `setTimeout` for `now + 6 hours`. In the callback, re-fetch and re-arm to `now + 6 hours`.
  - **Coordination**: both chains call the same shared `fetchAndUpdate()` function, which sets a `fetching` flag to prevent concurrent fetches. If one chain fires while a fetch is in-flight, it skips and re-arms. After a fetch completes (success or failure), both chains re-arm independently. Whichever chain fires first triggers the fetch; the other chain's pending timer is cleared and re-armed to its next target.
  - Re-arm after every fetch (success or failure). Timers are cleared on `pagehide`. Re-fetches are best-effort; failures keep the last good date **only if it passes the staleness guard**, otherwise fall back to the link.
- Fetch-in-flight guard: a module-level boolean `fetching` (initially false). When a timer fires or `visibilitychange` triggers a fetch while `fetching` is true, the trigger is ignored and the timer is re-armed to the next run (no duplicate concurrent fetches). Set `fetching = true` before `fetch`, reset in `finally`. This prevents two `setTimeout` chains from overlapping.

### 4.5 Failure modes
- Network error / non-2xx / parse failure / timeout (AbortController, 4000 ms) → keep fallback link, source line reads `nMiti unreachable – calendar link below`. No console spam beyond one `console.warn`.
- `ad.iso` in the future relative to the visitor's clock → treat as a clock skew; do not render; show the link fallback. (Never claim tomorrow's date today.)
- Reduced motion: no animation added; the `aria-live` announcement is not motion.

### 4.6 Layout & typography
- Strip container: `max-width: var(--maxw)`, `margin-inline: auto`, `padding: 1.5rem var(--gutter)`, `border-top: 1px solid var(--line)`, `border-bottom: 1px solid var(--line)`, `background: var(--bg)` (page paper — the teal band above stays the only full-bleed band; the strip blends into the page, not a floating card).
- Grid: `grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr)` at ≥760px; one column below 760px. Image-bearing tracks use `minmax(0, 1fr)` (A5).
- Primary date (`#bs-today-np`): `--text-2xl`, `--font-deva`, `--ink`, line-height 1.1.
- English BS label (`#bs-today-en` first line, `bs.label_en`): `--text-lg`, `--font-display`, `--ink-soft`.
- Gregorian span (`span.bs-today-ad`, `ad.label_en`): `--text-sm`, `--font-body`, `--muted`.
- Source line: `--text-xs`, `--font-mono`, `--muted`, no letter-spacing (A10), no uppercase (A10), no middle dots (A11) — separators are commas and spaced en-dashes only. (Waiver A11 covers the existing stat chips and link rows; this strip is new code, so it carries no middle dots and needs no waiver.)
- Reserved height: `min-height: 4.5rem` on the grid so fetch-in never shifts layout (CLS).

### 4.7 Accessibility
- `aria-labelledby` on the section; one visually-hidden `<h2>` (landmark).
- `aria-live="polite"` on `#bs-today-np`; announced once on first successful render.
- `lang="ne"` on the Devanagari date; English line `lang="en"` (inherited).
- Focus: the `Accuracy ↗` link and the fallback link both meet 44px touch targets via `min-height: 44px` plus `padding: 0.6rem 0.75rem` and `display: inline-flex; align-items: center;` (no `.btn` class is used; the 44px floor is enforced directly on `.bs-today a`); `:focus-visible` ring from the global rule.
- Contrast: `--ink` on `--bg` ≥ 4.5:1 both modes (existing, unchanged); `--muted` on `--bg` ≥ 4.5:1 (existing, unchanged; verify in dark mode).
- Print: the strip **prints** (it is content, not chrome). Static fallback prints as the link; fetched text prints as rendered. Print CSS must not suppress `.bs-today`.
- High contrast / forced colors: rules added per the existing pattern (border + system colors) so the strip survives both.

### 4.8 Adaptation blocks to extend (concrete CSS edits)

These are the only existing stylesheet blocks the build touches. No new token values.

1. **Print (`@media print`)** — `.bs-today` is not in the existing suppression list (`.site-header, .mobile-menu, .cta-row, .skip-link, .site-footer nav, .numbers, .install .copy-btn, .badge-row, .card::before, .card::after`) and must stay that way: ensure `.bs-today, .bs-today *` are not `display: none`, and that `.bs-today-grid` prints as a 2-column grid (stacks if narrower than the print page). Fetched text prints as rendered; fallback prints as the link. No new suppression entries.
2. **Forced colors (`@media (forced-colors: active)`)** — add `.bs-today { border: 1px solid CanvasText; background: Canvas; color: CanvasText; }`, `.bs-today-date, .bs-today-date-en, .bs-today-ad { color: CanvasText; }`, `.bs-today-source { color: CanvasText; }`, `.bs-today a { color: LinkText; }`.
3. **Prefers contrast (`@media (prefers-contrast: more)`)** — `.bs-today-source` muted text strengthens to `--ink-soft` (mirror the existing `--muted → --ink-soft` override); borders strengthen to 2px.
4. **Reduced motion** — no change; the global kill rule already covers it; the strip adds no animation.
5. **Responsive** — below 760px, `.bs-today-grid` collapses to one column (mirror the `@media (max-width: 760px)` block). Below 420px, no further change (text wraps).

No other adaptation block is touched.

## 5 · Hero

Unchanged. Hero contract (headline ≤7 words, sentence ≤12 words, actions visible at 1280×800) already met by the existing hero and is not touched by this spec. Concrete (from `index.html`): headline `753 places. Every one coded.` (5 words); lede `Verified administrative data for all of Nepal — offline, bilingual, free.` (10 words); actions `Download the dataset` (→ `#data`) and `How we verify` (→ `#method`); map annotation `CBS 31304 — Bharatpur (भरतपुर), verified`. No change to any of these.

## 6 · Tokens

Existing tokens only. No additions to `:root`. No new primitives, no new semantics.

Component-level overrides (recorded, not tokenized):
- `.bs-today-date` (fallback state) → `--text-2xl`, `--font-display`, `--ink-soft` (English placeholder, no Devanagari face).
- `.bs-today-date.is-rendered` (after fetch) → `--font-deva`, `--ink` (Devanagari date; font switches via the `is-rendered` class added by JS).
- `.bs-today-grid` → `grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr)`.

No `tokens.md` additions required (no new tokens).

## 7 · Material ledger

- **real**: nMiti `api/v1/today.json` (CC0-1.0) — `bs.label_np`, `bs.label_en`, `bs.tier`, `bs.evidence`, `ad.label_en`, `generated_at_utc`, `commit`, `source`. All rendered values trace to this file and are stamped with `generated_at_utc`.
- **real**: nMiti accuracy page (https://namunaone.github.io/nMiti/accuracy.html) — cadence figures: "rebuilt every 6 hours", midnight runs at 00:00/00:30/01:00 NPT, canary re-checks 4 times daily, 26-hour staleness SLA. These are printed in the source line and trace to the accuracy page, not to today.json.
- **placeholder**: none.
- **absent**: none. (No metrics, testimonials, logos, or screenshots are introduced.)

## 8 · Motion

None. The strip has no animation. `translate`/`opacity` are not used; `aria-live` is an announcement, not motion. `prefers-reduced-motion: reduce` is unaffected (global rule already kills all animation/transition). The fetch itself is not motion.

## 9 · Accessibility

See §4.7. Summary: labelled region, `aria-live` announcement, `lang="ne"`, 44px targets, focus-visible, ≥4.5:1 contrast, prints, survives high-contrast and forced-colors, no motion.

## 10 · Open questions

- Whether to also surface the BS date in the site's `<title>` / OG card: **no** — the OG card is a static asset (`og.png`) and a dynamic title would fight caching and Lighthouse. Deferred to a later spec if ever.
- Whether to fetch nMiti `meta.json` for dataset version stamping on this strip: **no** — the source line already links to nMiti's accuracy page. Keep the strip to one fetch.
- Real file sizes for nMiti downloads (Phase C3, separate spec) are untouched here.

## Review log

- **Pass 1 — `fix`:** cadence reconciliation, SLA/canary cited, middle dots removed, field contract + structure specified, staleness guard worked example, midnight re-arm, adaptation blocks. No waivers.
- **Pass 2 — `fix`:** staleness threshold reworded (equality not "more than 1 day"), no-JS fallback changed to `<a>`, field contract `Use` column reconciled, midnight recovery extended to all three rebuild runs. No waivers.
- **Pass 3 — `fix`:** duplicate future-date paragraph removed (moved to §4.5), `#bs-today-en` `<a>`→`<p>` replacement mechanism specified via `replaceWith`, source-line link placement clarified (raw URL dropped, carried by `Accuracy ↗` href).
- **Pass 4 — `fix`:** §4.3 duplicate staleness paragraph removed; §4.4 timer composition clarified (two `setTimeout` chains, next wake = earlier of midnight run and now+6h); §4.6 token sizes for `#bs-today-en` BS label (`--text-lg`) and Gregorian span (`--text-sm`) specified. No waivers.
- **Pass 5 — `fix`:** §3/§4.6 surface token reconciled to `--bg` (was `--surface`); §4.2 template interpolates `<source>` verbatim; trip message em dash → spaced en-dash; `commit` logged to `console.debug`; NPT midnight-chain JS computation specified; 44px touch-target padding given concrete value. No waivers.
- **Pass 6 — `fix` (current):** §4.7 contrast clause confirmed on `--bg`; §4.7 touch-target enforcement changed from `.btn` pattern to direct `min-height: 44px` on `.bs-today a`; §4.4 midnight-chain snippet confirmed offset-safe; §4.5 em dash normalized to spaced en-dash; §5 hero contract now restates concrete headline (5 words), lede (10 words), and both actions with their targets. No waivers. Re-review pending.
- **Pass 7 — `ship`:** all ten gates pass; no blocking issues; optional polish only (lang mutation step, chain coordination). No waivers requested. Handoff to namuna-build.
- **Pass 7 — `ship`:** all gates J1–J10 PASS. No issues. No waivers. Approved for build.
