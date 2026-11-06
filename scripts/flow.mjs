/* scripts/flow.mjs — Namuna Flow integrity checks (draft → approved → built → drifted).
   Usage:
     node scripts/flow.mjs status        # read-only overview of every spec
     node scripts/flow.mjs check         # strict: exit 1 on any violation
   Checks (check mode):
     - spec header: slug matches its directory, status is a known state
     - approved/built/drifted specs carry a material ledger (A17)
     - built/drifted specs have a build entry in .hallmark/log.json
     - every waiver referenced in the log exists in .hallmark/waivers.jsonl
     - every waiver is well-formed (id + reason + expires) and not expired
*/
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DESIGNS = join(ROOT, 'docs', 'designs');
const LOG_PATH = join(ROOT, '.hallmark', 'log.json');
const WAIVERS_PATH = join(ROOT, '.hallmark', 'waivers.jsonl');

const VALID_STATUS = new Set(['draft', 'approved', 'built', 'drifted']);
const LEDGER_REQUIRED_FOR = new Set(['approved', 'built', 'drifted']);
const BUILD_LOG_REQUIRED_FOR = new Set(['built', 'drifted']);

const read = (p) => readFileSync(p, 'utf8');
const readJson = (p) => JSON.parse(read(p));
const readJsonl = (p) => read(p).split('\n').map(l => l.trim()).filter(Boolean).map(l => JSON.parse(l));

function parseSpec(slug, path) {
  const src = read(path);
  const header = /<!--[\s\S]*?-->/.exec(src);
  const headerText = header ? header[0] : '';
  const slugM = /slug:\s*([\w-]+)/.exec(headerText);
  const statusM = /status:\s*(\w+)/.exec(headerText);
  const hasLedger = /material ledger/i.test(src);
  return {
    slug,
    path: path.replace(ROOT + '\\', '').replace(ROOT + '/', '').replace(/\\/g, '/'),
    headerSlug: slugM ? slugM[1] : null,
    status: statusM ? statusM[1] : null,
    hasLedger,
    hasBrief: existsSync(join(DESIGNS, slug, 'brief.md')),
    hasTokens: existsSync(join(DESIGNS, slug, 'tokens.md')),
    hasDrift: existsSync(join(DESIGNS, slug, 'drift-report.md')),
  };
}

function gather() {
  const specs = [];
  if (existsSync(DESIGNS)) {
    for (const entry of readdirSync(DESIGNS)) {
      const dir = join(DESIGNS, entry);
      if (!statSync(dir).isDirectory()) continue;
      const specPath = join(dir, 'spec.md');
      if (existsSync(specPath)) specs.push(parseSpec(entry, specPath));
    }
  }
  const log = existsSync(LOG_PATH) ? readJson(LOG_PATH) : [];
  const waivers = existsSync(WAIVERS_PATH) ? readJsonl(WAIVERS_PATH) : [];
  return { specs, log, waivers };
}

function runStatus() {
  const { specs, log, waivers } = gather();
  console.log('Flow status\n');
  console.log('  slug'.padEnd(20) + 'status'.padEnd(10) + 'brief  tokens drift  log');
  for (const s of specs) {
    const logEntries = log.filter(e => e.slug === s.slug);
    console.log(
      `  ${s.slug.padEnd(18)}${String(s.status).padEnd(10)}` +
      `${s.hasBrief ? '✓     ' : '—     '}${s.hasTokens ? '✓     ' : '—     '}${s.hasDrift ? '✓     ' : '—     '}` +
      `${logEntries.length} entr${logEntries.length === 1 ? 'y' : 'ies'}`
    );
  }
  console.log(`\n  ${specs.length} spec(s), ${log.length} log entr${log.length === 1 ? 'y' : 'ies'}, ${waivers.length} waiver(s).`);
  const verdicts = specs.filter(s => s.hasDrift).map(s => s.slug);
  if (verdicts.length) console.log(`  drift reports: ${verdicts.join(', ')}`);
}

function runCheck() {
  const { specs, log, waivers } = gather();
  const problems = [];
  const waiverIds = new Set(waivers.map(w => w.id));

  for (const s of specs) {
    if (s.headerSlug !== s.slug) {
      problems.push(`[flow] ${s.slug}: header slug "${s.headerSlug}" does not match directory name`);
    }
    if (!VALID_STATUS.has(s.status)) {
      problems.push(`[flow] ${s.slug}: unknown status "${s.status}" (expected draft|approved|built|drifted)`);
    }
    if (LEDGER_REQUIRED_FOR.has(s.status) && !s.hasLedger) {
      problems.push(`[A17] ${s.slug}: no material ledger (real/placeholder/absent) in spec`);
    }
    if (BUILD_LOG_REQUIRED_FOR.has(s.status)) {
      const built = log.some(e => e.slug === s.slug && (e.status === 'built' || e.event === 'build' || e.event === 'build-backfill'));
      if (!built) problems.push(`[flow] ${s.slug}: status "${s.status}" but no build entry in .hallmark/log.json`);
    }
    for (const e of log.filter(e => e.slug === s.slug)) {
      for (const ref of e.waivers || []) {
        const m = /\bA\d+\b/.exec(String(ref));
        if (m && !waiverIds.has(m[0])) {
          problems.push(`[A18] ${s.slug}: log references waiver ${m[0]} that is not recorded in .hallmark/waivers.jsonl`);
        }
      }
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  for (const w of waivers) {
    if (!w.id || !String(w.reason || '').trim() || !w.expires) {
      problems.push(`[A18] waiver ${w.id || '?'}: must carry id + reason + expires`);
      continue;
    }
    if (w.expires < today) problems.push(`[A18] waiver ${w.id}: expired ${w.expires} — re-evaluate the finding`);
  }

  console.log('Flow check\n');
  for (const s of specs) {
    const flags = [
      s.headerSlug === s.slug ? 'slug ✓' : 'slug ✗',
      VALID_STATUS.has(s.status) ? `status ${s.status} ✓` : `status ${s.status} ✗`,
      s.hasLedger ? 'ledger ✓' : 'ledger ✗',
    ];
    console.log(`  ${s.slug.padEnd(18)}${flags.join('  ')}`);
  }

  if (problems.length) {
    console.log(`\n\x1b[31mVIOLATIONS:\x1b[0m`);
    for (const p of problems) console.log(`  - ${p}`);
    process.exit(1);
  }
  console.log(`\n${specs.length} spec(s) checked, ${waivers.length} waiver(s) valid, log consistent.`);
}

const cmd = process.argv[2] || 'status';
if (cmd === 'status') runStatus();
else if (cmd === 'check') runCheck();
else {
  console.error('Usage: node scripts/flow.mjs [status|check]');
  process.exit(2);
}
