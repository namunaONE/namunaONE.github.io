# Decisions (ADRs)

Irreversible or expensive-to-reverse choices, with the reasons kept. One file
per decision, format: Context → Decision → Consequences.

| # | Decision | Status |
|---|---|---|
| 0001 | No webfonts — system font stacks only | accepted |
| 0002 | OS-driven theme only, no toggle | accepted |
| 0003 | No build step for the site | accepted |
| 0004 | Contact is GitHub-only | accepted |
| 0005 | Static BS date in the hero sample card stays, waived explicitly (A14) | accepted, expires 2027-01-01 |
| 0006 | CI gates the Pages deploy | accepted |
| 0007 | Machine-readable registries (`design/tokens.json`, `design/figures.json`) | accepted |

When a decision is reversed, do not delete its ADR — mark it `superseded by NNNN`
and write the new one.
