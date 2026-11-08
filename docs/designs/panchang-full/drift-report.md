# Drift report — panchang-full

Checked 2026-11-08 against `docs/designs/panchang-full/spec.md`.

- `#panchang-limbs` renders nakshatra (+ end time), yoga, karana (+ noon changeover when different), and the Adhika/Kshaya masa flag exactly as specified; comma-joined, hidden when empty.
- `#panchang-festival` renders `Today – ` (comma-joined) and `Next – name, AD date` exactly as specified; em-dash joined, hidden when empty.
- Both elements are optional in the render guard; no changes to the required-element guard or the staleness/fallback paths.
- nGeo eco-line copy matches §5 verbatim; no new hrefs (A20 clean).
- llms.txt nMiti bullet carries the live-pages line; all five pages verified live 200.
- `?v=1.4.2` present in both index.html and 404.html.

## Verdict

- `clean` — code matches spec; no action needed
