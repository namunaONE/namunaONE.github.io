/* scripts/lighthouse-check.mjs — Lighthouse performance budget check.
   Runs Lighthouse against the locally served site and asserts against
   the performance budget defined in lighthouserc.json.
   Usage: node scripts/lighthouse-check.mjs [url]
   Exit code: 0 all budgets met, 1 any budget violated.
*/
import { execSync, spawn } from 'node:child_process';
import { readFileSync, existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = process.cwd();
const URL = process.argv[2] || 'http://localhost:4174';
const CONFIG_PATH = join(ROOT, 'lighthouserc.json');
const TMP_REPORT = join(tmpdir(), `namuna-lighthouse-${Date.now()}.json`);
const SERVER_SCRIPT = join(ROOT, 'scripts', 'serve.mjs');

let serverProc = null;

/* Ensure the local server is running for Lighthouse to crawl. */
async function ensureServer() {
  const [host, port] = URL.replace(/^https?:\/\//, '').split(':');
  const p = parseInt(port, 10) || 80;
  const h = JSON.stringify(host); // properly quoted for node -e

  // Try to reach the server via a raw HTTP fetch
  let reachable = false;
  try {
    await fetch(`${URL}/`, { signal: AbortSignal.timeout(3000) });
    reachable = true;
  } catch { reachable = false; }

  if (reachable) return;

  // server not reachable — start it. spawn (not execSync): a server never
  // exits, so execSync would block the check until its timeout; spawn detaches
  // and lets the wait loop below poll for readiness.
  try {
    serverProc = spawn(process.execPath, [SERVER_SCRIPT], {
      cwd: ROOT,
      detached: true,
      stdio: 'ignore'
    });
    serverProc.unref();
  } catch {
    fail('server-start', `could not start local server at ${URL} — is scripts/serve.mjs present?`);
    return;
  }

  // wait for it to come up
  for (let i = 0; i < 30; i++) {
    try {
      execSync(`node -e "const {createConnection}=require('net');const s=createConnection(${h},${p});s.on('connect',()=>process.exit(0));s.on('error',()=>process.exit(1));setTimeout(()=>process.exit(1),3000);"`, { timeout: 5000 });
      return;
    } catch { /* keep waiting */ }
    try { execSync('sleep 1', { timeout: 2000 }); } catch {}
  }
  fail('server-start', `could not start local server at ${URL}`);
}

const FAILS = [];
const OKS = [];
const WARNS = [];

function fail(check, detail) { FAILS.push([check, detail]); console.log(`  \x1b[31m[FAIL]${check}\x1b[0m ${detail}`); }
function warn(check, detail) { WARNS.push([check, detail]); console.log(`  \x1b[33m[WARN]${check}\x1b[0m ${detail}`); }
function ok(check, detail) { OKS.push([check, detail]); console.log(`  \x1b[32m[ok]${check}\x1b[0m ${detail}`); }

/* Load budget assertions from lighthouserc.json. */
function loadBudget() {
  if (!existsSync(CONFIG_PATH)) {
    fail('budget-config', `lighthouserc.json not found`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  } catch (e) {
    fail('budget-config', `lighthouserc.json not valid JSON: ${e.message}`);
    return null;
  }
}

/* Run Lighthouse CLI and parse JSON output. */
function runLighthouse(url) {
  try {
    execSync(
      `npx lighthouse "${url}" --output=json --output-path="${TMP_REPORT}" --quiet --preset=desktop`,
      { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024, timeout: 180000, shell: true }
    );
    return JSON.parse(readFileSync(TMP_REPORT, 'utf8'));
  } catch (e) {
    const stdout = e.stdout ? e.stdout.toString() : '';
    const stderr = e.stderr ? e.stderr.toString() : '';
    throw new Error(`Lighthouse failed: ${e.message}\nstdout: ${stdout.slice(0, 500)}\nstderr: ${stderr.slice(0, 500)}`);
  } finally {
    try { unlinkSync(TMP_REPORT); } catch { /* ignore */ }
  }
}

/* Extract audit values. */
function getAudit(report, id) {
  const a = report.audits?.[id];
  if (!a) return null;
  return {
    numericValue: a.numericValue,
    score: a.score,
    displayValue: a.displayValue,
    title: a.title
  };
}

/* Assert against budget. */
function assert(report, id, type, maxNumericValue, minScore) {
  const a = getAudit(report, id);
  if (!a) {
    warn(id, `audit not found in report`);
    return;
  }
  let passed = true;
  let detail = `${a.displayValue || a.numericValue?.toFixed(2) || 'N/A'}`;

  if (maxNumericValue !== undefined && a.numericValue !== undefined) {
    if (a.numericValue > maxNumericValue) {
      passed = false;
      detail += ` (budget: <= ${maxNumericValue})`;
    }
  }
  if (minScore !== undefined && a.score !== null) {
    const scorePct = Math.round(a.score * 100);
    if (scorePct < minScore) {
      passed = false;
      detail += ` (budget: score >= ${minScore})`;
    }
  }

  if (passed) ok(id, detail);
  else fail(id, detail);
}

async function main() {
  console.log(`Lighthouse performance budget check\nTarget: ${URL}\n`);

  const config = loadBudget();
  if (!config) process.exit(1);

  const assertions = config.ci?.assert?.assertions || {};
  const assertionKeys = Object.keys(assertions);

  if (assertionKeys.length === 0) {
    warn('budget-config', 'no assertions found in lighthouserc.json');
  }

  // Ensure the local server is running (for local runs and CI)
  await ensureServer();

  let report;
  try {
    report = runLighthouse(URL);
  } catch (e) {
    if (serverProc) try { serverProc.kill(); } catch { /* ignore */ }
    fail('lighthouse-run', e.message);
    console.log(`\n${FAILS.length} fail(s), ${WARNS.length} warn(s), ${OKS.length} ok.`);
    process.exit(1);
  }
  if (serverProc) try { serverProc.kill(); } catch { /* ignore */ }

  for (const key of assertionKeys) {
    const assertion = assertions[key];
    const type = assertion[0]; // 'error' or 'warn'
    const configValue = assertion[1] || {}; // { minScore, maxNumericValue, ... }

    if (key.startsWith('categories:')) {
      const category = key.split(':')[1];
      const score = report.categories?.[category]?.score;
      const minScore = configValue.minScore;
      const scorePct = score !== undefined ? Math.round(score * 100) : undefined;
      const passed = scorePct !== undefined && scorePct >= minScore;
      if (passed) ok(key, `score ${scorePct} (>= ${minScore})`);
      else {
        const level = type === 'warn' ? warn : fail;
        level(key, `score ${scorePct ?? 'N/A'} (< ${minScore})`);
      }
    } else {
      const maxNumericValue = configValue.maxNumericValue;
      const minScore = configValue.minScore;
      const a = getAudit(report, key);
      if (!a) {
        if (type === 'warn') warn(key, `audit not found in report`);
        else fail(key, `audit not found in report`);
        continue;
      }
      let passed = true;
      let detail = `${a.displayValue || a.numericValue?.toFixed(2) || 'N/A'}`;

      if (maxNumericValue !== undefined && a.numericValue !== undefined) {
        if (a.numericValue > maxNumericValue) {
          passed = false;
          detail += ` (budget: <= ${maxNumericValue})`;
        }
      }
      if (minScore !== undefined && a.score !== null) {
        if (a.score < minScore) {
          passed = false;
          detail += ` (budget: score >= ${minScore})`;
        }
      }

      if (passed) ok(key, detail);
      else {
        const level = type === 'warn' ? warn : fail;
        level(key, detail);
      }
    }
  }

  console.log(`\nSummary: ${OKS.length} pass, ${WARNS.length} warn, ${FAILS.length} fail`);
  if (FAILS.length > 0) {
    console.log('\n\x1b[31mNO-GO — performance budget violated.\x1b[0m');
    process.exit(1);
  }
  if (WARNS.length > 0) {
    console.log('\n\x1b[33mGO with warnings — review WARN items.\x1b[0m');
    process.exit(0);
  }
  console.log('\n\x1b[32mGO — all performance budgets met.\x1b[0m');
  process.exit(0);
}

main();
