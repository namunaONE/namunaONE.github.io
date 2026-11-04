/* namuna-guardian slop-scan.mjs
   Static anti-slop scanner for HTML/CSS/JS.
   Usage: node scripts/slop-scan.mjs <file-or-dir> [--render]
   Exit code: 0 clean, 1 if hard FAILs found.

   Waiver format (.hallmark/waivers.jsonl, one JSON object per line):
     id (required)       - gate id, e.g. "A9"
     file (optional)     - substring match on file path (legacy, still supported)
     glob (optional)     - glob pattern with * and ** (preferred)
     line (optional)     - specific line number; omit to match all lines in file
     pattern (optional)  - regex matched against the finding's line text (content-based, survives line shifts)
     expires (optional)  - ISO date YYYY-MM-DD; waiver inactive after this date
     reason (required)   - written justification
     scope (deprecated)  - legacy field; maps to "any file" with a deprecation warning

   Matching rules:
     - id must match the finding's gate id
     - file or glob must match the finding's file path (if neither, matches any file)
     - line must match if specified (if omitted, matches any line)
     - expires must not be in the past (if specified)
*/
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const FAIL_COLOR = '\x1b[31m';
const WARN_COLOR = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

const hardFails = [
  { id: 'A2', re: /transition\s*:\s*all\b/ },
  { id: 'A3', re: /(width|height|top|left)\s*:.*\btransition/ },
  { id: 'A4', re: /html\s*\{\s*[^}]*overflow-x:\s*(?!clip\b)/ },
  { id: 'A5', re: /grid-template-columns:\s*(?!.*minmax\(0\s*,)/ },
  { id: 'A8', re: /\b(testimonial|trusted by|case study|logo wall)\b/i },
  { id: 'A14', re: /\b(BS|Bikram Sambat)\b.*\d{4}/ },
];

const warns = [
  { id: 'A9', re: /text-transform:\s*uppercase/ },
  { id: 'A10', re: /font-variant-caps:\s*small-caps|letter-spacing:\s*0\.\d/ },
  { id: 'A11', re: /\b·\b|→|🟢|🔴|🟡/ },
  { id: 'A12', re: /linear-gradient.*purple.*blue/i },
];

function scanFile(path) {
  let src;
  try { src = readFileSync(path, 'utf8'); } catch { return []; }
  const results = [];
  const lines = src.split('\n');
  lines.forEach((line, i) => {
    [...hardFails, ...warns].forEach(({ id, re }) => {
      if (re.test(line)) results.push({ id, file: path, line: i + 1, text: line.trim().slice(0, 120) });
    });
  });
  return results;
}

function walk(dir) {
  let results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      // Skip node_modules, .git, dist, build
      if (['node_modules', '.git', 'dist', 'build'].includes(e.name)) continue;
      results = results.concat(walk(full));
    } else if (['.html', '.css', '.js'].includes(extname(e.name))) {
      results = results.concat(scanFile(full));
    }
  }
  return results;
}

const target = process.argv[2];
if (!target) { console.error('Usage: node scripts/slop-scan.mjs <file-or-dir> [--render]'); process.exit(2); }

/* ── Waiver loading & matching ─────────────────────────────────────────────── */
let waivers = [];
let waiverLoadError = null;
try {
  const waiverSrc = readFileSync(join(process.cwd(), '.hallmark/waivers.jsonl'), 'utf8');
  waivers = waiverSrc.split('\n').map(l => l.trim()).filter(Boolean).map(l => JSON.parse(l));
} catch (e) {
  if (e.code !== 'ENOENT') waiverLoadError = e.message;
}

function norm(p) { return (p || '').replace(/\\/g, '/'); }

function globToRegex(glob) {
  let pattern = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*');
  // Allow matching anywhere in the path (implicit ** prefix)
  if (!pattern.startsWith('.*')) pattern = '.*' + pattern;
  return new RegExp(pattern + '$');
}

function matchFile(w, filePath) {
  const fp = norm(filePath);
  if (w.glob) return globToRegex(w.glob).test(fp);
  if (w.file) return fp.includes(norm(w.file));
  if (w.scope) {
    console.warn(`${DIM}[DEPRECATED] Waiver ${w.id} uses "scope" instead of "file"/"glob". Treating as any file. Migrate to glob.${RESET}`);
    return true;
  }
  // No file/glob/scope specified — matches any file
  return true;
}

function isExpired(w) {
  if (!w.expires) return false;
  const expiry = new Date(w.expires + 'T23:59:59Z');
  return new Date() > expiry;
}

function isWaived(w, id, filePath, line, text) {
  if (w.id !== id) return false;
  if (!matchFile(w, filePath)) return false;
  if (w.line && String(w.line) !== String(line)) return false;
  if (w.pattern) {
    try {
      if (!new RegExp(w.pattern).test(text || '')) return false;
    } catch { return false; }
  }
  if (isExpired(w)) return false;
  return true;
}

/* ── Scan ──────────────────────────────────────────────────────────────────── */
let results = statSync(target).isDirectory() ? walk(target) : scanFile(target);

const waived = results.filter(r => waivers.some(w => isWaived(w, r.id, r.file, r.line, r.text)));
const expired = waivers.filter(w => isExpired(w));
results = results.filter(r => !waivers.some(w => isWaived(w, r.id, r.file, r.line, r.text)));

const hardIds = new Set(['A1','A2','A3','A4','A5','A6','A8','A13','A14','A15','A16','A17','A18']);
const hard = results.filter(r => hardIds.has(r.id));
const soft = results.filter(r => !hardIds.has(r.id));

/* ── Output ────────────────────────────────────────────────────────────────── */
console.log(`Scan: ${target}`);
console.log(`Findings: ${results.length + waived.length} (hard ${hard.length}, soft ${soft.length}, waived ${waived.length})`);

if (waiverLoadError) {
  console.log(`${FAIL_COLOR}Waiver load error: ${waiverLoadError}${RESET}`);
}

if (expired.length) {
  console.log(`${BOLD}Expired waivers (no longer active):${RESET}`);
  for (const w of expired) {
    console.log(`  ${FAIL_COLOR}[${w.id}]${RESET} expired ${w.expires} — ${w.reason || ''}`);
  }
}

if (waived.length) {
  console.log(`${BOLD}Waived (explicit record):${RESET}`);
  for (const w of waived) {
    // find the matching waiver for display
    const match = waivers.find(x => isWaived(x, w.id, w.file, w.line, w.text));
    const expiry = match && match.expires ? ` (expires ${match.expires})` : '';
    console.log(`  ${WARN_COLOR}[${w.id}]${RESET} L${w.line}: ${match ? match.reason : ''}${expiry}`);
  }
}

if (results.length) {
  for (const r of results) {
    const color = hardIds.has(r.id) ? FAIL_COLOR : WARN_COLOR;
    console.log(`${color}[${r.id}]${RESET} L${r.line}: ${r.text}`);
  }
}

// Summary line for CI
console.log(`\nSummary: ${hard.length} hard fail(s), ${soft.length} warn(s), ${waived.length} waived, ${expired.length} expired.`);

process.exit(hard.length > 0 ? 1 : 0);
