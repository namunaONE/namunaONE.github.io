# ADR 0005 — Static BS date in the hero sample card stays, waived explicitly (A14)

**Status:** accepted (2026-11-04), waiver expires 2027-01-01

## Context

A14 (scanner) flags any static Bikram Sambat date. The hero sample card shows
"Kartik 17, 2083" as an illustration of what a verified nMiti date looks like —
it is a sample, not a claim about today. The live date is carried by the
bs-today strip (fetched from nMiti, staleness-guarded). Options considered:

1. Remove the date from the sample card — loses the illustration's point.
2. Make the sample card live too — two live regions for one fact; redundant.
3. Keep it, with an explicit waiver and a reason.

## Decision

Option 3. The waiver lives in `.hallmark/waivers.jsonl`:

- id A14, file `index.html`, content pattern "Bikram Sambat calendar commons" (the nMiti card description — content-keyed, not line-keyed).
- Reason: historical range 1975–2083 BS from the verified nMiti dataset, not a today-claim; the live claim lives in the bs-today strip.
- Expiry: 2027-01-01, so the decision is revisited rather than inherited.

## Consequences

- The sample card keeps its illustrative value without pretending to be live.
- The waiver is visible in every scan (waived, with reason and expiry) and in CI.
- If a future design makes the sample card dynamic, the waiver must be deleted in the same change.
