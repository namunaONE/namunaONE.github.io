# ADR 0001 — No webfonts; system font stacks only

**Status:** accepted (2026-11-04)

## Context

The site must load with zero third-party requests and no FOUT. The brand voice
is editorial-austere; the display face (Fraunces) and body face (Inter) are
named first in the stacks, but shipping font files adds weight, licensing
surface, and a network dependency.

## Decision

The stacks name a tasteful local fallback chain and ship no font files:

- display: `'Fraunces', 'Iowan Old Style', 'Palatino Linotype', Georgia, serif`
- body: `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
- Devanagari: `'Noto Serif Devanagari', 'Nirmala UI', 'Mangal', serif`
- mono: `ui-monospace, 'Cascadia Code', Consolas, monospace`

Visitors with Fraunces/Inter installed get the intended faces; everyone else
gets a local serif/sans that matches the tone.

## Consequences

- Page weight and request count stay minimal; no FOUT by construction.
- Typography varies slightly across platforms; layout must tolerate it (it does — system stacks are metric-different, so no fixed-width text beyond `ch` measures).
- If webfonts are ever added, this ADR must be superseded and the zero-third-party claim removed from the README and llms.txt.
