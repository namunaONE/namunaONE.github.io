# Drift Report — atlas-hero
Spec: docs/designs/atlas-hero/spec.md (status: built)
Checked: index.html, assets/css/style.css, assets/js/main.js

## No drift

Sections, tokens, figures, motion, links, Guardian rules, and waivers all match spec.

- **Sections**: Atlas hero section (point map hero with verified CBS annotation) inserted as specified. No extra sections. ✓
- **Hero**: Headline "753 places. Every one confirmed." (~5 words), sentence, and primary CTA visible at 1280×800. ✓
- **Tokens**: Only spec-approved tokens used. No raw hex in atlas-hero CSS. ✓
- **Figures**: All figures (7/77/753/6,743, 548/205/0, 72 conflicts resolved) trace to nGeo bindings/meta.json. ✓
- **Motion**: Pure CSS scroll-driven reveals; prefers-reduced-motion kill rule honored. ✓
- **Links**: All external links resolve (verify-live: 0 fail). ✓
- **Guardian rules**: slop-scan 0 hard fails, 0 warns. ✓
- **Waivers**: No new waivers used. ✓

## Waiver check
Waivers in code: (none new)
Waivers in .hallmark/waivers.jsonl: A9, A10, A11, A14
Unrecorded waivers: none

## Verdict
- `clean` — code matches spec; no action needed

Recommended next step: none