# Namuna provenance — what counts as real data

## Material ledger (required per page)
Every page or component ships with a ledger:
- **real**: figures traceable to a named source (nGeo v2.10.0, nMiti, CBS/NSO, etc.)
- **placeholder**: known empty state (workshop repos), marked explicitly
- **absent**: deliberately not shown (testimonials, metrics nobody gave, logos not licensed)

## Attestation tiers (never collapse to null)
- verified: doubly-attested code (e.g. 548/753 palikas)
- singleSource: one attestation (e.g. 205/753)
- uncoded: declared gap (e.g. 0 uncoded — declare if >0)
- approximate: centroid/boundary approximate, labeled as such

## Hard bans
- Never invent: CBS codes, ward counts, lat/lng, BS dates, pub.dev downloads, GitHub stars, customer logos.
- Never hardcode a BS date; generate from nMiti dataset at build time.
- Never link pub.dev/npm/PyPI without live verification.
- Never claim government affiliation (we are not affiliated with the Government of Nepal).

## Freshness (A19)
Page figures are hand-maintained snapshots — so they are **CI-verified** against the live source of truth (`bindings/meta.json`, fetched by `scripts/verify-live.mjs`). When nGeo's dataset moves, CI fails and the page gets updated — the page never silently drifts from the data. The bindings version (e.g. `v2.15.0`) must be stamped on the page and must match live.

## Gap declaration
If a figure is not fully substantiated, declare the gap visibly (e.g. "approximate centroids", "72 conflicts resolved"). Never paper over a gap.