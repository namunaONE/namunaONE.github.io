# Drift Report — bs-today
Spec: docs/designs/bs-today/spec.md (status: built)
Checked: index.html, assets/css/style.css, assets/js/main.js

## No drift

Sections, tokens, figures, motion, links, Guardian rules, and waivers all match spec.

- **Sections**: Strip inserted between numbers band and data section as specified. No extra sections. ✓
- **Hero**: Unchanged (spec says "unchanged"). ✓
- **Tokens**: Only spec-approved tokens used in new CSS (--bg, --line, --maxw, --gutter, --text-*, --font-*, --ink, --ink-soft, --muted, --link, --link-hover, --teal-soft, --radius-sm, --dur-fast, --ease-out). No raw hex in bs-today CSS. ✓
- **Figures**: No new figures introduced (strip shows live data from nMiti). ✓
- **Motion**: No animation added (spec says "None"). ✓
- **Links**: All external links resolve (verify-live: 26 ok, 0 fail). ✓
- **Guardian rules**: slop-scan 0 hard fails, 0 warns. ✓
- **Waivers**: No new waivers used. A14 waiver still covers hero's static BS date (unchanged). ✓

## Waiver check
Waivers in code: (none new)
Waivers in .hallmark/waivers.jsonl: A9, A10, A11, A14
Unrecorded waivers: none

## Verdict
- `clean` — code matches spec; no action needed

Recommended next step: none