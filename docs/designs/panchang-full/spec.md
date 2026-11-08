<!-- Namuna Design Doc v1.0 · slug: panchang-full · status: built · tokens: v1.3 · material: real/absent verified -->

# Spec — panchang-full

**Status log:** built (2026-11-08). Delta spec over `panchang-today` — everything there is retained unchanged. Single review pass (namuna-review: ship).

## 1 · The job

Show the full panchang at a glance — date, sunrise, tithi, plus nakshatra, yoga, karana, the lunar masa flag, and today's festivals with the next one — all live from nMiti `today.json`, never stale, never invented. Also surface nGeo's latest Explorer features on the nGeo card, and nMiti's live pages in llms.txt.

## 2 · Delta over panchang-today

| # | Addition | Where | What it shows |
|---|---|---|---|
| 1 | `#panchang-limbs` | `.panchang-primary`, after `#panchang-sunrise` | nakshatra udaya + end time, yoga udaya, karana udaya → madhyahna at noon when different, Adhika/Kshaya masa when flagged |
| 2 | `#panchang-festival` | `.panchang-primary`, after `#panchang-limbs` | Today – festivals (name_en, comma-joined); Next – next festival name + AD date |
| 3 | nGeo eco-line | nGeo card, after the bindings eco-line | 3D terrain, satellite basemaps, globe view, population figures from verified source rosters |
| 4 | llms.txt live pages | nMiti bullet in llms.txt | panchang.html, festivals.html, masa.html, muhurta.html, bhadra.html + daily JSON endpoint |

## 3 · today.json field contract (delta)

Endpoint: `https://namunaone.github.io/nMiti/api/v1/today.json` (CC0). Live as of 2026-11-08, verified:

| Path | Type | Example use |
|---|---|---|
| `panchang.nakshatra.udaya.name` / `.ends_at` | string / ISO | `Swati ends 07:30 NPT` |
| `panchang.yoga.udaya.name` | string | `Ayushman` |
| `panchang.karana.udaya.name` | string | `Shakuni` |
| `panchang.karana.madhyahna.name` | string | `Chatushpada` — appended as ` → Chatushpada at noon` when different from udaya |
| `masa.month_name` / `.is_adhika` / `.is_kshaya` | string / boolean / boolean | `Adhika Ashwin masa` / `Kshaya Ashwin masa` when flagged |
| `festivals.today[].name_en` | string | `Lakshmi Puja` — comma-joined after `Today – ` |
| `festivals.next_festival.name_en` / `.ad_date` | string / YYYY-MM-DD | `Next – Gai Puja, 2026-11-09` |

`masa` and `festivals` are top-level today.json keys, siblings of `panchang`.

## 4 · Rendering rules

- Limb parts joined with `, `; festival parts joined with ` — ` (em dash). No middle dots (A11). En dash ` – ` inside the Today/Next labels, matching the tithi line.
- `#panchang-limbs` and `#panchang-festival` are optional in the render guard: a missing element never blocks the rest of the strip (unlike `#panchang-np` et al.).
- Both stay `hidden` until rendered and when there is nothing to show; the English fallback carries no date (A14).
- Rendered by the same `renderPanchang(data)` call as the existing strip — no independent fetch, so nothing drifts apart. Stale/fallback behavior inherits panchang-today unchanged.
- `?v=` cache-bump to 1.4.2 in index.html and 404.html (style.css + main.js both change).

## 5 · nGeo eco-line

Copy (pinned): `New in the Explorer: 3D terrain, satellite basemaps, globe view, and population figures from verified source rosters.` — no new hrefs (zero A20 exposure), reuses the existing `.eco-line` styling, and every claim is limited to features verified present in the nGeo repo (satellite basemaps, 3D terrain + globe view, verified population rosters, provenance sources.json).

## 6 · Material ledger

- **real**: nMiti `api/v1/today.json` (CC0-1.0) — `panchang.nakshatra.*`, `panchang.yoga.*`, `panchang.karana.*`, `masa.*`, `festivals.*`; all rendered values trace to it and share the existing as-of stamp. nGeo Explorer features as verified in the nGeo repo.
- **placeholder**: workshop repos unchanged from baseline.
- **absent**: limb meanings and interpretations, muhurta/bhadra detail on the strip, moonrise (no field in today.json) — absent by design, never faked.
- **images**: none.

## 7 · Accessibility

- The new lines are plain `<p>` elements in the existing `.panchang-primary` flow, styled like `#panchang-sunrise` (`--text-xs`, `--font-mono`, `--muted`).
- Not live regions — `#panchang-np` remains the only polite live region; the limbs/festival lines are read in flow order, no extra announcement.
- Prefers contrast: `.panchang-limbs, .panchang-festival { color: var(--ink-soft); }`. Forced colors: `{ color: CanvasText; }`. Print: inherits the panchang strip keep-list.

## 8 · Motion

None. The additions are text-only; the global reduced-motion rule covers the strip.

## 9 · Open questions

- Muhurta and bhadra pages: exposed via llms.txt only, not the strip — a separate spec if ever wanted on-page.
- Moonrise: absent from today.json; deliberately not computed or faked.
