/* scripts/launch-check.mjs — pre-ship launch readiness checklist.
   Runs before any deploy. Produces a go/no-go decision based on:
     - spec states (built specs need clean drift reports)
     - waiver currency (no expired waivers)
     - eval coverage (every skill ships evals)
     - guardian integrity (slop-scan, flow, skill-lint, gate-coverage)
     - live verification (verify-live: 0 fails)
   Usage: node scripts/launch-check.mjs
   Exit code: 0 = GO (ready to deploy), 1 = NO-GO (fix findings first).
*/
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DESIGNS = join(ROOT, 'docs', 'designs');
const LOG_PATH = join(ROOT, '.hallmark', 'log.json');
const WAIVERS_PATH = join(ROOT, '.hallmark', 'waivers.jsonl');
const SKILLS_DIR = join(ROOT, '.opencode', 'skills');

const VALID_STATUS = new Set(['draft', 'approved', 'built', 'drifted']);
const BUILD_LOG_STATUSES = new Set(['built', 'build', 'build-backfill']);
const VALID_DRIFT_VERDICTS = new Set(['clean', 'minor', 'major']);

const results = []; // { check, status, detail, critical }

function ok(check, detail) { results.push({ check, status: 'PASS', detail, critical: false }); }
function warn(check, detail) { results.push({ check, status: 'WARN', detail, critical: false }); }
function fail(check, detail) { results.push({ check, status: 'FAIL', detail, critical: true }); }

function readJson(p) { return JSON.parse(readFileSync(p, 'utf8')); }
function readJsonl(p) { return readFileSync(p, 'utf8').split('\n').map(l => l.trim()).filter(Boolean).map(l => JSON.parse(l)); }

/* ── 1 · Spec states ─────────────────────────────────────────────────────── */
function checkSpecs() {
  if (!existsSync(DESIGNS)) { fail('specs', 'docs/designs/ missing'); return; }
  let specs = 0, builtWithoutDrift = 0, invalidStatus = 0;
  for (const entry of readdirSync(DESIGNS)) {
    const dir = join(DESIGNS, entry);
    if (!statSync(dir).isDirectory()) continue;
    const specPath = join(dir, 'spec.md');
    if (!existsSync(specPath)) { fail('specs', `${entry}: missing spec.md`); continue; }
    specs++;
    const src = readFileSync(specPath, 'utf8');
    const statusM = /status:\s*(\w+)/.exec(src);
    const status = statusM ? statusM[1] : null;
    if (!VALID_STATUS.has(status)) { invalidStatus++; fail('specs', `${entry}: invalid status "${status}"`); continue; }

    // Built specs need a drift report with verdict
    if (status === 'built' || status === 'drifted') {
      const driftPath = join(dir, 'drift-report.md');
      if (!existsSync(driftPath)) {
        builtWithoutDrift++;
        fail('specs', `${entry}: status "${status}" but no drift-report.md`);
        continue;
      }
      const driftSrc = readFileSync(driftPath, 'utf8');
      const verdictM = /(?:^Verdict:\s*|- `)(clean|minor|major)(?:`|\s)/m.exec(driftSrc);
      const verdict = verdictM ? verdictM[1] : null;
      if (!VALID_DRIFT_VERDICTS.has(verdict)) {
        fail('specs', `${entry}: drift-report.md has no valid verdict`);
        continue;
      }
      if (verdict !== 'clean') {
        fail('specs', `${entry}: drift verdict "${verdict}" — not clean, do not deploy`);
        continue;
      }
    }
  }
  if (invalidStatus === 0 && builtWithoutDrift === 0) {
    ok('specs', `${specs} spec(s): all valid statuses, all built specs have clean drift reports`);
  }
}

/* ── 2 · Waiver currency ─────────────────────────────────────────────────── */
function checkWaivers() {
  let total = 0, expired = 0, details = [];
  if (!existsSync(WAIVERS_PATH)) {
    ok('waivers', 'no waiver file (no waivers in use)');
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  for (const line of readFileSync(WAIVERS_PATH, 'utf8').split('\n').map(l => l.trim()).filter(Boolean)) {
    total++;
    const w = JSON.parse(line);
    if (!w.id || !w.reason || !w.expires) { fail('waivers', `waiver ${w.id || '?'}: missing id/reason/expires`); continue; }
    if (w.expires < today) { expired++; details.push(`${w.id} expired ${w.expires}`); }
  }
  if (expired === 0) ok('waivers', `${total}/${total} waivers current (none expired)`);
  else fail('waivers', `${expired} expired waiver(s): ${details.join(', ')}`);
}

/* ── 3 · Postmortem readiness ────────────────────────────────────────────── */
function checkPostmortems() {
  const pmDir = join(ROOT, '.hallmark', 'postmortems');
  if (!existsSync(pmDir)) {
    ok('postmortems', 'no postmortems directory (no incidents yet)');
    return;
  }
  const files = readdirSync(pmDir).filter(f => f.endsWith('.md') && f !== 'README.md' && f !== 'TEMPLATE.md');
  if (files.length === 0) {
    ok('postmortems', 'no open postmortems');
    return;
  }
  let openCount = 0;
  const openList = [];
  for (const f of files) {
    const src = readFileSync(join(pmDir, f), 'utf8');
    const statusM = /^\*\*Status:\*\*\s*(\w+)/m.exec(src);
    const status = statusM ? statusM[1] : 'unknown';
    if (status === 'open') {
      openCount++;
      openList.push(f);
    }
  }
  if (openCount === 0) {
    ok('postmortems', `${files.length} postmortem(s), all closed`);
  } else {
    fail('postmortems', `${openCount} open postmortem(s): ${openList.join(', ')} — close all follow-up actions before deploy`);
  }
}

/* ── 4 · Eval coverage ───────────────────────────────────────────────────── */
function checkEvals() {
  let skills = 0, withEvals = 0, missing = [];
  if (!existsSync(SKILLS_DIR)) { ok('evals', 'no skills dir'); return; }
  for (const d of readdirSync(SKILLS_DIR)) {
    const dir = join(SKILLS_DIR, d);
    if (!statSync(dir).isDirectory()) continue;
    if (!existsSync(join(dir, 'SKILL.md'))) continue;
    skills++;
    if (existsSync(join(dir, 'evals', 'scenarios.md'))) withEvals++;
    else missing.push(d);
  }
  if (missing.length === 0) ok('evals', `${withEvals}/${skills} skills ship evals`);
  else fail('evals', `missing evals/scenarios.md: ${missing.join(', ')}`);
}

/* ── 4 · Guardian integrity (run the actual checks) ─────────────────────── */
async function runGuardianChecks() {
  const { execSync } = await import('node:child_process');

  /* Sub-check stdout is captured, not inherited. On failure, print its tail so
     CI logs show WHY a sub-check failed instead of a bare "violated" line. */
  function printSubOutput(out, e) {
    const text = out !== null && out !== undefined
      ? String(out)
      : e && (e.stdout || e.stderr)
        ? String(e.stdout || '') + '\n' + String(e.stderr || '')
        : e && e.message ? String(e.message) : '';
    if (!text.trim()) return;
    const tail = text.trimEnd().split('\n').slice(-40).map(l => '    ' + l).join('\n');
    console.log('    └─ sub-check output (tail):\n' + tail);
  }
  // slop-scan
  try {
    const out = execSync('node .opencode/skills/namuna-guardian/scripts/slop-scan.mjs .', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    const m = /Summary: (\d+) hard fail\(s\)/.exec(out);
    const hardFails = Number(m?.[1] ?? 0);
    if (hardFails === 0) ok('guardian', 'slop-scan: 0 hard fails');
    else { printSubOutput(out); fail('guardian', `slop-scan: ${hardFails} hard fail(s) — deploy blocked`); }
  } catch (e) { printSubOutput(null, e); fail('guardian', `slop-scan exited with error`); }

  // flow check
  try {
    execSync('node scripts/flow.mjs check', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    ok('guardian', 'flow check: spec states, ledgers, build log, waivers consistent');
  } catch (e) { fail('guardian', 'flow check: violations found — deploy blocked'); }

  // skill-lint
  try {
    execSync('node scripts/skill-lint.mjs', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    ok('guardian', 'skill-lint: all skill files resolve, gate ranges current');
  } catch (e) { fail('guardian', 'skill-lint: violations found — deploy blocked'); }

  // gate-coverage
  try {
    execSync('node .opencode/skills/namuna-guardian/scripts/gate-coverage.mjs', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    ok('guardian', 'gate-coverage: all gate enforcement claims verified');
  } catch (e) { fail('guardian', 'gate-coverage: unverified gate claims — deploy blocked'); }

  // verify-live
  try {
    const out = execSync('node .opencode/skills/namuna-guardian/scripts/verify-live.mjs index.html', { encoding: 'utf8', timeout: 60000, maxBuffer: 10 * 1024 * 1024 });
    const m = /Live verification: \d+ ok, \d+ warn, (\d+) fail/.exec(out);
    const fails = Number(m?.[1] ?? 0);
    if (fails === 0) ok('guardian', 'verify-live: 0 link/figure fails');
    else { printSubOutput(out); fail('guardian', `verify-live: ${fails} fail(s) — deploy blocked`); }
  } catch (e) { printSubOutput(null, e); fail('guardian', `verify-live: network check failed`); }

  // accessibility (a11y)
  try {
    execSync('node scripts/a11y-check.mjs', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    ok('guardian', 'a11y-check: contrast, focus, headings, alt, touch targets — all pass');
  } catch (e) { fail('guardian', 'a11y-check: accessibility failures — deploy blocked'); }

  // performance budget (lighthouse)
  try {
    execSync('node scripts/lighthouse-check.mjs http://localhost:4174', { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024, timeout: 300000 });
    ok('guardian', 'lighthouse-check: performance budgets met');
  } catch (e) { printSubOutput(null, e); fail('guardian', 'lighthouse-check: performance budget violated — deploy blocked'); }
}

/* ── 5 · Log integrity ───────────────────────────────────────────────────── */
function checkLog() {
  if (!existsSync(LOG_PATH)) { fail('log', '.hallmark/log.json missing'); return; }
  let log;
  try { log = readJson(LOG_PATH); } catch { fail('log', '.hallmark/log.json not valid JSON'); return; }
  if (!Array.isArray(log)) { fail('log', '.hallmark/log.json is not an array'); return; }
  ok('log', `${log.length} build/resolution/drift entries recorded`);
}

/* ── Main ───────────────────────────────────────────────────────────────── */
async function main() {
  console.log(`Launch readiness check — ${new Date().toISOString()}\n`);

  checkSpecs();
  checkWaivers();
  checkPostmortems();
  checkEvals();
  checkLog();
  await runGuardianChecks();

  const fails = results.filter(r => r.status === 'FAIL').length;
  const warns = results.filter(r => r.status === 'WARN').length;

  console.log('\nResults:\n');
  for (const r of results) {
    const mark = r.status === 'PASS' ? '\x1b[32m✓\x1b[0m' : r.status === 'WARN' ? '\x1b[33m⚠\x1b[0m' : '\x1b[31m✗\x1b[0m';
    console.log(`  ${mark} ${r.check.padEnd(12)} ${r.status.padEnd(5)} ${r.detail}`);
  }

  console.log(`\nSummary: ${results.length - fails - warns} pass, ${warns} warn, ${fails} fail.`);

  if (fails > 0) {
    console.log('\n\x1b[31mNO-GO — launch blocked. Fix every FAIL before deploy.\x1b[0m');
    process.exit(1);
  }
  if (warns > 0) {
    console.log('\n\x1b[33mGO with warnings — deploy is allowed, but review WARN items before merging.\x1b[0m');
    process.exit(0);
  }
  console.log('\n\x1b[32mGO — all checks pass. Ready to deploy.\x1b[0m');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
