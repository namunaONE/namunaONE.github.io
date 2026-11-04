# Namuna Design System — tokens only source of truth

## Token layers
Always primitive → semantic → component. Components consume only semantics.

### Primitives (raw palette — never used by components directly)
Stone: #F5F4F2 / #ECEAE6 / #E3E1DD / #D4D1CB / #B8B4AC / #8A8A84 / #55605F / #3C4A4B / #1E2A2B / #10171A
Teal: #E4ECEA / #D2E0DD / #0E4D5C / #0A3A47 / #07262C
Terracotta: #F7E8DF / #F0A583 / #C4552D / #A83F20
Green: #E7F2EC / #7BD3AE / #166E4F
Amber: #FBF3E4 / #EFC27A / #8A5A00

### Semantics (used by components)
--bg: stone-50 (dark: stone-900)
--surface: #FFFFFF (dark: #171F22)
--ink: stone-800 (dark: #F0EEE9)
--ink-soft: stone-700 (dark: #C6D0CE)
--muted: stone-600 (dark: #94A4A2)
--line: stone-200 (dark: #2A3539)
--teal / --teal-soft / --teal-strong
--accent / --accent-strong / --accent-soft
--good / --good-soft / --warn / --warn-soft
--action-bg / --action-fg / --action-bg-hover
--focus / --selection-bg / --selection-fg

### Type
--font-display: Georgia / serif stack (display)
--font-body: Inter / system-ui / sans (body)
--font-deva: Noto Serif Devanagari / Nirmala UI / Mangal (Devanagari)
--font-mono: ui-monospace / Consolas (code)

Type scale:
--text-xs 0.72rem | --text-sm 0.875rem | --text-base 1.0625rem | --text-lg 1.1875rem | --text-xl clamp(1.45rem,2.6vw,1.8rem) | --text-2xl clamp(1.9rem,4.5vw,2.8rem) | --text-hero clamp(2.85rem,7vw,4.75rem)

### Geometry
--radius-lg 16px | --radius 12px | --radius-sm 8px
--gutter clamp(1.25rem,4vw,2.5rem)
--maxw 1120px

### Motion
--dur-fast 150ms | --dur 250ms | --ease-out cubic-bezier(0.22,0.61,0.36,1)

### Contrast requirements
Body text ≥ 4.5:1. Large text ≥ 3:1. UI borders ≥ 3:1. Small mono labels ≥ 4.5:1.
Dark mode: `prefers-color-scheme: dark` overrides only tokens; geometry and radii never change.
Reduced motion: kills all animation/transition and smooth scroll.