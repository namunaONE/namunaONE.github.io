# Concept Brief — panchang-today

**Shape**: strip insertion on the existing umbrella page (component scope, not a new page) · genre: **editorial** · job: let a visitor see today's Bikram Sambat date + panchang limbs at a glance, with a path to nMiti's detail page.

**Theme**: restraint within v1.3 (by request) · derived from: namunaFORE/nMiti already ship this design language; no new palette, no new theme drawn from the catalog. Premium comes from material honesty (live verified data, Devanagari-first typography, declared provenance) — not gradients, glass, or decorative noise.

**Chrome**: nav: unchanged (no new entries) · footer: unchanged (colophon micro-tightening only).

**Hero**: unchanged — atlas-first hero is the signature; "753 places. Every one coded." (5 words) stays. Panchang strip sits **immediately below the hero**, **above the numbers band** — "Full Today on Top" without touching the hero contract.

**Signature**: a live, bilingual panchang strip that prints its evidence tier and source — the first thing a visitor sees after the hero is proof that this site trusts nMiti's engine, not its own memory.

**Sections**: Hero · **Panchang strip (new)** · Numbers band · Today strip · Data · Projects · Workshop · Method · About · Links · Footer.

**Material**: real: `api/v1/today.json` (CC0, `r12-verified`, `bs.label_np`, `ad.label_en`, `panchang.*`, `sunrise_npt`, `generated_at_utc`) · pictures: none · absent: festivals (nMiti out of scope), muhurta, limb meanings — all permanently absent from this strip.

**Sweep**: slop-scan + gates + finish review (after build).
