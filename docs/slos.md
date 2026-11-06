# SLOs — Namuna Design Guardian

Measurable targets for the anti-slop system. These are Service Level Objectives
with explicit error budgets: if a budget is consumed, no new features ship until
the reliability work is done.

Targets are set from measured baselines (see `scripts/slo-check.mjs`) and
reviewed monthly in the weekly CI cron review.

## SLO 1 · CI Green Rate

**Definition:** Percentage of guardian CI runs (guard job) that pass all gates
without manual override or waiver-expiry failure.

**Target:** 100% — any red guard run blocks deploy by design
(`.github/workflows/guardian.yml`, deploy depends on guard).

**Error budget:** 0 red runs per calendar month. A single red run consumes the
entire monthly budget and triggers a postmortem (see `.hallmark/postmortems/`).
The run is either fixed (code or gate) or the gate is permanently removed —
never overridden.

**Measurement:** CI run history on `main` + PRs. Baseline: not yet measured
(CI newly enabled).

## SLO 2 · Scanner False Positive Rate

**Definition:** Percentage of scanner findings that are *not* real slop — i.e.
findings that required a waiver or were dismissed without fixing.

**Target:** 0% — every scanner finding is either fixed in code or covered by an
explicit, non-expired waiver with a written reason.

**Error budget:** 0 false positives per release. If a scanner rule produces a
finding that isn't actionable, the rule is fixed or removed — never ignored.

**Measurement:** `slop-scan.mjs` run count vs. waiver count vs. fix count.
Baseline: 27 waived findings (all explicit, all expire 2027-01-01), 0 hard
fails, 0 warns on the product code.

## SLO 3 · Eval Pass Rate

**Definition:** Percentage of skill eval scenarios that pass when run against
the current skill implementation.

**Target:** 100% — every skill ships evals (`evals/scenarios.md`) and every
scenario must pass before the skill changes.

**Error budget:** 0 failing scenarios. A failing eval blocks the corresponding
skill change until fixed.

**Measurement:** `skill-lint.mjs` confirms every skill has evals; eval sweep
grades each scenario. Baseline: namuna-review Scenario 2 → `ship` (pass). All
other skills: evals written, not yet graded.

## SLO 4 · Scan Time

**Definition:** Wall-clock time for the full guardian guard job (slop-scan +
self-test + gate-coverage + flow check + skill-lint + verify-live).

**Target:** < 120 seconds total — fast enough not to block PR merges.

**Error budget:** If p95 scan time exceeds 120s for three consecutive weeks,
the slowest check is optimized or parallelized.

**Measurement:** CI step timing. Baseline (local, single-threaded):
- slop-scan full repo: ~120 ms
- flow check: ~103 ms
- skill-lint: ~143 ms
- verify-live (network): variable, depends on endpoint responsiveness

## SLO 5 · Waiver Currency

**Definition:** Percentage of waivers in `.hallmark/waivers.jsonl` that have
not passed their `expires` date.

**Target:** 100% — no expired waivers. `gate-coverage.mjs` and CI fail on any
expired waiver.

**Error budget:** 0 expired waivers. An expired waiver means its finding is
re-exposed as a hard fail until re-evaluated.

**Measurement:** `slop-scan.mjs` reports expired waivers separately; CI fails
if any exist. Baseline: 0 expired, 5 active waivers (all expire 2027-01-01).

## SLO 6 · Figure Freshness

**Definition:** Percentage of `fail`-severity figures in `design/figures.json`
that match their live source on every CI run.

**Target:** 100% — any figure drift is a hard fail (A19).

**Error budget:** 0 drifting figures. A drifted figure is fixed on the page or
the registry is corrected with a documented reason.

**Measurement:** `verify-live.mjs` A19 pass/fail count. Baseline: 0 fails,
1 warn (nMiti commit count drift — warn severity by design for fast-moving
values).

---

## Error Budget Policy

| Budget | Exhausted when | Consequence | Postmortem required |
|---|---|---|---|
| Monthly CI red runs | 1 red run in a month | Feature freeze | Yes — `.hallmark/postmortems/` |
| Scanner false positives | 1 unactionable finding | Rule fixed or removed before next PR | Yes — if a rule must be removed |
| Eval failures | 1 failing scenario | Skill change blocked | Yes — skill not ship-worthy until fixed |
| Scan time p95 | >120s for 3 weeks | Slowest check optimized | Yes — if not resolved in 2 weeks |
| Expired waivers | 1 expired waiver | CI fails until re-evaluated | Yes — waiver silently expired |
| Figure drift | 1 drifting `fail` figure | CI blocks deploy | Yes — stale figure shipped |

**Postmortem rule:** Every exhausted budget requires a blameless postmortem in
`.hallmark/postmortems/` before feature work resumes. The postmortem must have
all follow-up actions closed before it is marked `closed`.

## Review Cadence

- **Weekly** (CI cron Mondays 03:00 UTC): verify SLO 1 (CI green rate), SLO 5
  (waiver currency), SLO 6 (figure freshness).
- **Monthly**: review all SLOs against measured data; adjust targets only with
  a documented reason.
- **Per-release**: verify SLO 3 (eval pass rate) before any skill change ships.

---

## Appendix: Baselines (measured 2026-11-06)

| SLO | Metric | Baseline | Target |
|---|---|---|---|
| SLO 1 | CI green rate | N/A (CI newly enabled) | 100% |
| SLO 2 | False positive rate | 0% (0 hard fails, 0 warns) | 0% |
| SLO 3 | Eval pass rate | 1/1 graded (namuna-review S2 → ship) | 100% |
| SLO 4 | Scan time | ~366 ms static + network-dependent verify-live | < 120 s |
| SLO 5 | Waiver currency | 100% (0 expired) | 100% |
| SLO 6 | Figure freshness | 0 fail, 1 warn | 0 fail |
