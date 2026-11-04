# Namuna anti-slop gates

Pass/fail checks run by `scripts/slop-scan.mjs` and by human review.

| ID | Gate | Severity |
|---|---|---|
| A1 | No literal color hex outside `:root` token block | FAIL |
| A2 | No `transition: all` | FAIL |
| A3 | No animated `width`/`height`/`top`/`left` | FAIL |
| A4 | `overflow-x: clip` on html+body | FAIL |
| A5 | Image grid tracks use `minmax(0,1fr)` | FAIL |
| A6 | Every interactive element has `:focus-visible` | FAIL |
| A7 | Animation honors `prefers-reduced-motion: reduce` | FAIL |
| A8 | No invented metric/testimonial/logo/case-study count | FAIL |
| A9 | No eyebrow (tracked uppercase subhead) | WARN |
| A10 | No tracked-capital / small-cap labels | WARN |
| A11 | No middle-dot meta, glued arrows, decorative dots | WARN |
| A12 | No emoji icon, no purple-to-blue gradient | WARN |
| A13 | Hero headline+sentence+CTA visible at 1280×800 | FAIL |
| A14 | Static BS date sourced from nMiti data only | FAIL |
| A15 | Dead package link (pub.dev/npm/PyPI) | FAIL |
| A16 | Empty repo shown with fake roadmap/screenshot | FAIL |
| A17 | One material ledger present (real/placeholder/absent) | FAIL |
| A18 | Waivers recorded explicitly, never silent | FAIL |

Reviewer questions (finish gate):
- Does every number name its source?
- Is every gap declared?
- Does the page work without JS?
- Is dark mode token-swapped, not recolored?
- Does it pass `slop-scan --render`?