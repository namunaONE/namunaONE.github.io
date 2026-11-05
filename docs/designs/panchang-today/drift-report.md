# Drift Report — panchang-today
Spec: docs/designs/panchang-today/spec.md (status: built)
Checked: index.html, assets/css/style.css, assets/js/main.js

## No drift

- **Section**: Strip inserted between Hero and Numbers band exactly as specified (`.panchang-today`, constrained width, 2-column grid).
- **Tokens**: Existing semantic tokens only; no new tokens; no raw hex; forced-colors uses system colors.
- **Fallback**: Static HTML carries no BS date — fallback shows "Today, in Bikram Sambat" (Devanagari face, no static date). Fallback link targets nMiti panchang page with discernible text (`Panchang detail →`).
- **Fetch**: Same-origin endpoint; 4s AbortController; staleness guard (KTM today + 26h SLA); fetch-in-flight guard; `visibilitychange` throttle.
- **A11y**: `lang="ne"` only on Devanagari span (fallback inherits `lang="en"`); `aria-live="polite"` one-shot; ≥44px targets; keyboard focus via global `:focus-visible`.
- **Links**: `panchang.html` and `accuracy.html` both resolve — verified live (200) at build; A20 in CI.
- **Motion**: None added; reduced-motion honored (no animation to kill).

## Build-time verification

- slop-scan: **0 hard, 0 soft** (27 waived — all pre-recorded; 3 new A11 arrow waivers for main.js link labels, consistent with index.html convention).
- verify-live: **27 ok, 0 warn, 0 fail** — including panchang.html link (200) and today.json shape.
- node --check main.js: clean.
- Browser (localhost preview): fetch renders Devanagari date, Gregorian line, sunrise, tithi (both conventions), aria-live announces once; stale path shows fallback without touching good data.
- Hero A13 fold: unchanged — panchang strip is below the hero; hero layout and 5-word headline unaffected.

## Verdict

- `clean` — code matches spec; no action needed

Recommended next step: none
