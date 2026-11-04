/* namuna-guardian slop-scan.mjs
   Static anti-slop scanner for HTML/CSS/JS.
   Usage: node scripts/slop-scan.mjs <file-or-dir> [--render]
   Exit code: 0 clean, 1 if hard FAILs found.
*/
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const FAIL_COLOR = '\x1b[31m';
const WARN_COLOR = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

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
    if (e.isDirectory()) results = results.concat(walk(full));
    else if (['.html', '.css', '.js'].includes(extname(e.name))) results = results.concat(scanFile(full));
  }
  return results;
}

const target = process.argv[2];
if (!target) { console.error('Usage: node scripts/slop-scan.mjs <file-or-dir> [--render]'); process.exit(2); }

/* Explicit waivers: .hallmark/waivers.jsonl, one JSON per line: {id, file, line?, reason} */
let waivers = [];
try {
  const waiverSrc = readFileSync(join(process.cwd(), '.hallmark/waivers.jsonl'), 'utf8');
  waivers = waiverSrc.split('\n').map(l => l.trim()).filter(Boolean).map(l => JSON.parse(l));
} catch { /* no waiver file — nothing skipped */ }
function norm(p) { return (p || '').replace(/\\/g, '/'); }
function isWaived(id, file, line) {
  const f = norm(file);
  return waivers.some(w => w.id === id && (!w.file || f.includes(norm(w.file))) && (!w.line || String(w.line) === String(line)));
}

let results = statSync(target).isDirectory() ? walk(target) : scanFile(target);
const waived = results.filter(r => isWaived(r.id, r.file, r.line));
results = results.filter(r => !isWaived(r.id, r.file, r.line));

const hardIds = new Set(['A1','A2','A3','A4','A5','A6','A8','A13','A14','A15','A16','A17','A18']);
const hard = results.filter(r => hardIds.has(r.id));
const soft = results.filter(r => !hardIds.has(r.id));

console.log(`Scan: ${target}`);
console.log(`Findings: ${results.length + waived.length} (hard ${hard.length}, soft ${soft.length}, waived ${waived.length})`);
if (waived.length) {
  console.log(`${BOLD}Waived (explicit record):${RESET}`);
  for (const w of waived) console.log(`  ${WARN_COLOR}[${w.id}]${RESET} ${w.line ? 'L'+w.line+': ' : ''}${w.reason || ''}`);
}
for (const r of results) {
  const color = hardIds.has(r.id) ? FAIL_COLOR : WARN_COLOR;
  console.log(`${color}[${r.id}]${RESET} L${r.line}: ${r.text}`);
}

process.exit(hard.length > 0 ? 1 : 0);