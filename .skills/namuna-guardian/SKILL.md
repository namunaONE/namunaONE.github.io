---
name: namuna-guardian
description: Design guardrail for Namuna One. Kills AI slop: invented metrics, generic templates, token-less styling, unverifiable claims. Use when building, redesigning, or auditing Namuna One pages, components, or design tokens.
argument-hint: "<prompt> | audit <path> | check <path>"
version: 1.0.0
metadata:
  opencode/slash: "true"
---

# Namuna Design Guardian

## When to use
Build or edit any Namuna One page, card, section, token, or design change. Use for audits (`audit <path>`) or rule checks (`check <path>`). Do NOT use for generic, non-Namuna work.

## Hard floor — never waivable
These rules bind every output. A build that breaks one does not ship.

1. **Tokens only.** Every color and font goes through a declared `:root` semantic token (primitive → semantic → component). No literal hex or `font-family` beyond the token block.
2. **No cheap animation.** Never `transition: all`. Never animate `width`, `height`, `top`, or `left`. Transform/opacity only.
3. **Horizontal safety.** `overflow-x: clip` on `html` and `body`. Never `hidden`, never `100vw`.
4. **Grid integrity.** Image-bearing grid tracks use `minmax(0, 1fr)`; display heads carry `overflow-wrap: break-word; min-width: 0`.
5. **Focus visible.** Every interactive element has an immediate `:focus-visible` ring.
6. **Motion contract.** Every animation has a `prefers-reduced-motion: reduce` fallback; content is visible with scripting off.
7. **No invented proof.** Never invent metrics, testimonials, logos, dates, screenshots, or case-study counts.
8. **No slop tells.** Never an eyebrow; never tracked-capital or small-cap labels; no middle-dot meta strings, glued arrows, decorative status dots, emoji icons, purple-to-blue gradients, or card-in-card.
9. **Hero contract.** Headline, one sentence, and primary action visible at 1280×800 without scrolling.
10. **Evidence ledger.** Every figure carries source + scope. Gaps are declared, never hidden. One material ledger per page: real / placeholder / absent.
11. **No dead links.** Never link pub.dev/npm/PyPI without verifying the package exists live first.
12. **Workshop honesty.** Empty repos render as "placeholder" only — no roadmap dates, promised screenshots, or implied shipping.
13. **Consistency.** One primary CTA style, one container width, one radius per nesting level.

## Namuna-specific anti-slop rules
- **No static BS dates.** No hardcoded Bikram Sambat dates anywhere — historical year ranges only when dataset-sourced (waived, e.g. A14).
- **No fake subsidiaries.** No "trusted by", government endorsement, or cooperative-core claims — we are not affiliated with the Government of Nepal.
- **Workshop ≠ product.** nWeather, nBhumi, nTransit, nElection are shown as public placeholders, never as shipped products.
- **Freshness is verified, not assumed.** Page figures must match live `bindings/meta.json` (A19) and every external link must resolve (A20) — enforced by `scripts/verify-live.mjs` + CI.

## Workflow (always)
1. Read the current page and project tokens first.
2. Build the material ledger: real / placeholder / absent.
3. Load `references/design-system.md`, `references/provenance.md`, `references/anti-slop-gates.md`.
4. Make the smallest deviation from the current design.
5. Run `node scripts/slop-scan.mjs <path>`. Fix every FAIL.
6. Run `node scripts/verify-live.mjs index.html` — external links (A20) + figure drift vs `bindings/meta.json` (A19). Fix every FAIL.
7. Record any waiver explicitly with reason; never waive silently.
8. Record decisions in `.hallmark/log.json` so consecutive builds diversify.

## Gates
- **Hard FAIL** → build does not ship.
- **WARN** → fix or record explicit waiver line.
- **INFO** → advisory.

## Expansion path
Guardian is phase 1 (proof + rules). Phase 2 expands to flow skills (`brainstorm`, `draft`, `build`, `review`, `drift`) — the Elephant–Goldfish pipeline — once Guardian is proven. Do not add flow skills before Guardian passes every eval below.