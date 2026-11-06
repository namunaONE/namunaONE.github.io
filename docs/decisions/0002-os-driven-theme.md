# ADR 0002 — OS-driven theme only, no toggle

**Status:** accepted (2026-11-04)

## Context

The site has full light/dark token sets. A toggle needs storage (localStorage),
a pre-paint script to avoid a flash, an accessible control, and state syncing —
all of which fight the "no build step, minimal JS" constraint.

## Decision

Dark mode is driven exclusively by `prefers-color-scheme`; `color-scheme` and
dual `theme-color` metas are declared. There is no in-page toggle, by design.

## Consequences

- Zero flash-of-wrong-theme; zero preference storage; zero extra JS.
- Users who want to override use the OS setting — the same switch every other well-behaved site respects.
- Testing dark mode means changing the OS/appearance setting; never testing by adding a class.
- If a toggle is ever added (e.g. for kiosk use), it must default to the OS value and pass the A13 re-check.
