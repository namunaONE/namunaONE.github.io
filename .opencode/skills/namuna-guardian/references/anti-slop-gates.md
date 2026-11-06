# Namuna anti-slop gates

Pass/fail checks run by tooling and by human review. Every FAIL-severity gate is
either automated (scanner / live check / flow check) or carries a written rubric
under "Judged rubrics" — no silent gaps. `scripts/gate-coverage.mjs` verifies
this table stays true to the code and fails CI if a gate loses its enforcement.

| ID | Gate | Severity | Enforced by |
|---|---|---|---|
| A1 | No literal color hex outside the token layer | FAIL | scanner |
| A2 | No `transition: all` | FAIL | scanner |
| A3 | No animated `width`/`height`/`top`/`left` | FAIL | scanner |
| A4 | `overflow-x: clip` on html | FAIL | scanner |
| A5 | Image grid tracks use `minmax(0,1fr)` | FAIL | scanner |
| A6 | Every interactive element has `:focus-visible` | FAIL | judged |
| A7 | Motion honors `prefers-reduced-motion: reduce` | FAIL | scanner |
| A8 | No invented metric/testimonial/logo/case-study count | FAIL | scanner |
| A9 | No eyebrow (tracked uppercase subhead) | WARN | scanner |
| A10 | No tracked-capital / small-cap labels | WARN | scanner |
| A11 | No middle-dot meta, glued arrows, decorative dots | WARN | scanner |
| A12 | No emoji icon, no purple-to-blue gradient | WARN | scanner |
| A13 | Hero headline+sentence+CTA visible at 1280×800 | FAIL | judged |
| A14 | Static BS date sourced from nMiti data only | FAIL | scanner |
| A15 | Dead package link (pub.dev/npm/PyPI) | FAIL | live |
| A16 | Empty repo shown with fake roadmap/screenshot | FAIL | judged |
| A17 | One material ledger present (real/placeholder/absent) | FAIL | flow |
| A18 | Waivers recorded explicitly, never silent | FAIL | scanner |
| A19 | Page figures match live `bindings/meta.json`; version stamped on page | FAIL | live |
| A20 | Every external link resolves (verified, not assumed) | FAIL | live |

## Enforcement legend

- **scanner** — `.opencode/skills/namuna-guardian/scripts/slop-scan.mjs` (static; runs on every push/PR)
- **live** — `.opencode/skills/namuna-guardian/scripts/verify-live.mjs` (network; runs on every push/PR + weekly cron)
- **flow** — `scripts/flow.mjs` (spec/log/waiver integrity; runs on every push/PR)
- **judged** — no automation exists yet; the rubric below is mandatory for review, and `gate-coverage.mjs` fails if the rubric goes missing

## Context allowances (built into the scanner, not waivers)

- **A1** — hex is allowed inside `:root` token blocks (the token layer), inside
  `@media print` blocks (print primitives), and as mask stencils (property names
  matching `mask` / `-webkit-mask`). In HTML, hex is allowed in presentational
  attributes that cannot resolve CSS custom properties (`fill`, `stroke`,
  `content` for `theme-color`); hex inside `style="..."` attributes or `<style>`
  blocks is flagged.
- **A7** — file-level heuristic: any file declaring keyframes/animation/transition
  (CSS) or `requestAnimationFrame`/`.animate(` (JS) must contain a
  `prefers-reduced-motion: reduce` fallback in the same file.
- **A8** — the wordlist is a tripwire for review, not proof; the material ledger
  (A17) and provenance review remain the authority.
- **A15** — covered by the A20 pass in `verify-live.mjs`: every external URL,
  including package registries, is fetched before it may ship.

## Judged rubrics

### A6 — focus-visible
Every interactive element (links, buttons, inputs, summary) must show a visible
focus ring. The global `:focus-visible` rule covers unstyled elements; the
reviewer confirms that elements with custom `:hover` styles do not suppress or
override focus styles, and that focus is visible in both themes and in
`forced-colors: active`. Automation (browser check) is planned; until then the
reviewer records a PASS/FAIL line for A6 in the review output.

### A13 — hero contract
At a 1280×800 viewport with the page at scroll position 0 and no reduced-motion
preference: the h1 headline, its one-sentence lede, and the primary action are
all fully visible without scrolling. The reviewer opens the page at that size
(or uses a screenshot/measurement) and records the verdict; any change that
touches hero markup, fonts, or top-of-page chrome re-checks A13.

### A16 — placeholder honesty
Every empty/placeholder repo (nWeather, nBhumi, nTransit, nElection) renders as
a placeholder in a dashed or otherwise non-shipped state: no roadmap dates, no
promised screenshots, no "coming soon" dates, no implied shipping. Live repos
may link to real screenshots only. The reviewer checks the workshop section
copy against the current state of each repository and records the verdict.

## Reviewer questions (finish gate)

- Does every number name its source?
- Is every gap declared?
- Does the page work without JS?
- Is dark mode token-swapped, not recolored?
- Does it pass `slop-scan` + `verify-live` + `flow check` + `skill-lint`, with
  every FAIL-severity gate either automated or rubric-checked?
