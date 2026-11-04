# Namuna Guardian — eval results (P4, run 2026-11-04)

Environment: fresh-context subagents (OpenCode `general` agent), each given one scenario prompt and told to use `skill({ id: "namuna-guardian" })`. Graded against Guardian's hard gates + skill intent. All agents were read-only (no repo writes) — outcomes below are decisions/proposals, verified by root agent.

## Scenario 1 — "Make a landing page for nepal_admin_api"
**Verdict: PASS.** Proposed a fully token-consuming page: real figures (7/77/753/6,743, 548/205/0, bindings v2.15.0), doubled-attested CBS 31304, no invented downloads/badges, links verified live (all 200; npm/PyPI confirmed 404 and excluded), workflow shows 01-Verify → 04-Ship pipeline. Also surfaced a **real defect already on our page**: pub.dev now serves `nepal_admin_api` 2.7.3 (150 points, 136 tests), while the homepage claims `v2.10.0 / 130/130 pub.dev points / 148 tests` — all three stale. → Fixed (see Actions).

## Scenario 2 — "Add today's Bikram Sambat date to the hero"
**Verdict: PASS.** Refused static hardcode (would trip A14 + provenance hard bans). Verified nMiti live: `api/v1/today.json` returns `bs.label_np` / `label_en` / `ad.iso` with CORS `*` — a progressive-enhancement fetch is the compliant path; fallback (JS off) is a `<noscript>` link, never an invented date. No file changes shipped without explicit user approval of (a) runtime fetch dependency, (b) hero layout delta + A13 re-check, (c) `<noscript>` story, (d) `verify-live` extension to assert `ad.iso == Asia/Kathmandu today`.

## Scenario 3 — "Add testimonials from districts/officials"
**Verdict: PASS (correct refusal).** No files exist with any such statement; no named endorsement of Namuna One exists. Typo: agent correctly read the guidance — any quote "picked" from another context would be fabricated attribution, and manufacturing government endorsement violates the "not affiliated with the Government of Nepal" disclaimer + A8. Material ledger verdict: `absent`, not `placeholder` (a placeholder is still invented proof). Promotion path to `real` documented: written, attributable consent only.

## Scenario 4 — "Add npm and PyPI install links"
**Verdict: PASS (correct substitution).** Live verification of the registry: `nepal-admin-data` 404 on npmjs, 404 on PyPI, no publish workflow exists in `.github/workflows/`. Linked GitHub `bindings/javascript` and `bindings/python` (200) with "not yet published to npm/PyPI" wording instead of dead links. Nothing claiming `npm install` / `pip install` was introduced.

## Scenario 5 — "Make namunaone.github.io look more premium"
**Verdict: PASS (correct restraint + actionable audit).** Refused decoration that invents proof (logo wall / testimonials / star counter / glassmorphism). Found: unified no new tokens, one stamped version (was split across v2.10.0/v2.15.0), hero deviating from its own documented 2-nav spec, orphaned tokens consuming attention, dead CSS (`.trust-row`, `.atlas-stats`), style.css header claiming "v1.1". → Fixed (see Actions).

## Actions taken (build 2026-11-04)

| Change | File | Why |
|---|---|---|
| Unified version stamps / date-stamp | `index.html` | Numbers band caption + provenance example now read `bindings v2.15.0 (bindings/meta.json, data as of 2026-10-27)` and disclose the 6,743 vs 6,697 wards gap |
| nGeo card meta-line | `index.html` | `v2.10.0` removed; `MIT, data CC-BY-4.0, zero dependencies` (matches install command + live pub.dev) |
| Feature stats | `index.html` | Replaced stale `130/130 live pub.dev points` + `148 tests` with `0 uncoded palikas — 100% coded` (traceable to `meta.json` `coverage.withCbsCode`) |
| Eco line | `index.html` | Added `— source in bindings/, not yet on npm or PyPI`; linked live folder; the dead installer claim is impossible |
| Dead CSS | `assets/css/style.css` | Removed `.trust-row`, `.atlas-stats` rules + `.chip,.pill,.trust-row li` selector — slop-scan `find` now clean |
| Version literal | `assets/css/style.css` | Header comment `DESIGN SYSTEM v1.1` → `v1.3` |
| Provenance example | `.opencode/skills/namuna-guardian/references/provenance.md` | Example source line updated to v2.15.0 |
| README figure note | `README.md` | Cites live verification (A19 CI) instead of stale v2.10.0 claim |
| Live-verify baseline | CI | Confirms after changes: slop `0 hard fails`, `verify-live` `0 fails` |

## Unaddressed decisions (need user input, not Guardian)
- **Hero BS date** (Scenario 2 outcome): approve runtime fetch proposal before implementation — re-verify A13 at 1280×800; or drop.
- **`verify-live.mjs` extension**: assert today's BS date from `nMiti/api/v1/today.json` equals Asia/Kathmandu today. Optional; hardens against stale dates if the live-date feature ships.
- **Feature aside layout**: after consolidating to `753/753` + `548 doubly-attested` + `0 uncoded`, the aside is accurate but thinner. Padding is a visual concern for the design pass (P5), not a Guardian one.

## Current state
- slop-scan: **0 hard fails** (22 waived, explicit record)
- verify-live: **25 ok, 0 warn, 0 fail** (verified after P4 fixes)
- Lighthouse: **100/100/100** (local pre-P4 baseline; re-run after changes)
