/* namuna-guardian slop-scan.mjs
   Static anti-slop scanner for HTML/CSS/JS.
   Usage: node .opencode/skills/namuna-guardian/scripts/slop-scan.mjs <file-or-dir>
   Exit code: 0 clean, 1 if hard FAILs found.

   Gates implemented here (see references/anti-slop-gates.md):
     A1  No literal color hex outside the token layer.
         CSS: hex allowed only inside :root blocks, @media print blocks, or mask
         stencils (property name matching /^(-\\w+-)?mask/). ID-selector hashes
         are ignored. HTML: hex allowed in presentational attributes that cannot
         resolve CSS custom properties (fill/stroke/content); flagged inside
         style="..." attributes and <style> blocks.
     A2  No `transition: all`. A3 no animated width/height/top/left. A4
         overflow-x must be clip on html. A5 grid tracks use minmax(0, ...).
     A7  Motion (keyframes / animation / transition / rAF in JS) requires a
         `prefers-reduced-motion: reduce` fallback in the same file.
     A8  Invented-proof vocabulary (wordlist; corroborated by provenance review).
     A9-A12  Soft tells (warn): eyebrow caps, tracked caps, middle dots/arrows,
         emoji/purple-blue gradient.
     A14 Static BS dates not sourced from nMiti data.
     A18 Waivers must be well-formed: id + reason + expires, never silent.

   Waiver format (.hallmark/waivers.jsonl, one JSON object per line):
     id (required)       - gate id, e.g. "A9"
     file (optional)     - substring match on file path (legacy, still supported)
     glob (optional)     - glob pattern with * and ** (preferred)
     line (optional)     - specific line number; omit to match all lines in file
     pattern (optional)  - regex matched against the finding's line text
     expires (optional)  - ISO date YYYY-MM-DD; waiver inactive after this date
     reason (required)   - written justification
     scope (deprecated)  - legacy field; maps to "any file" with a deprecation warning
*/
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
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

const lineOf = (src, idx) => src.slice(0, idx).split('\n').length;

/* ── A1 · literal color hex outside the token layer ────────────────────────── */
function cssA1Findings(path, src) {
  const findings = [];
  const stack = [];
  let inComment = false;
  let inString = null;
  let lastBound = 0;
  let line = 1;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '\n') { line++; continue; }
    if (inComment) {
      if (ch === '*' && src[i + 1] === '/') { inComment = false; i++; }
      continue;
    }
    if (inString) {
      if (ch === inString && src[i - 1] !== '\\') inString = null;
      continue;
    }
    if (ch === '/' && src[i + 1] === '*') { inComment = true; i++; continue; }
    if (ch === '"' || ch === "'") { inString = ch; continue; }
    if (ch === '{') { stack.push(src.slice(lastBound, i).replace(/\/\*[\s\S]*?\*\//g, '').trim()); lastBound = i + 1; continue; }
    if (ch === '}') { stack.pop(); lastBound = i + 1; continue; }
    if (ch === ';') { lastBound = i + 1; continue; }
    if (ch !== '#') continue;
    const m = /^#[0-9a-fA-F]{3,8}\b/.exec(src.slice(i));
    if (!m) continue;
    const seg = src.slice(lastBound, i).replace(/\/\*[\s\S]*?\*\//g, '');
    const colon = seg.lastIndexOf(':');
    if (colon === -1) continue; /* selector context: ID selector, not a color */
    const propM = /([-\w]+)\s*$/.exec(seg.slice(0, colon));
    const prop = propM ? propM[1] : '';
    const ctx = stack.join('||');
    const inRoot = /:root/.test(ctx);
    const inPrint = /@media\s*print/.test(ctx);
    const isMask = /^(-\w+-)?mask/.test(prop);
    if (!inRoot && !inPrint && !isMask) {
      findings.push({ id: 'A1', file: path, line, text: src.slice(i, i + 40).split('\n')[0] });
    }
    i += m[0].length - 1;
  }
  return findings;
}

function htmlA1Findings(path, src) {
  const findings = [];
  const attrRe = /style="[^"]*"/g;
  let m;
  while ((m = attrRe.exec(src))) {
    if (/#[0-9a-fA-F]{3,8}\b/.test(m[0])) {
      findings.push({ id: 'A1', file: path, line: lineOf(src, m.index), text: m[0].slice(0, 60) });
    }
  }
  const styleRe = /<style[^>]*>[\s\S]*?<\/style>/g;
  while ((m = styleRe.exec(src))) {
    if (/#[0-9a-fA-F]{3,8}\b/.test(m[0])) {
      findings.push({ id: 'A1', file: path, line: lineOf(src, m.index), text: '<style> block with raw hex' });
    }
  }
  return findings;
}

/* ── A7 · motion requires a reduced-motion fallback ────────────────────────── */
function motionFindings(path, src) {
  const isCss = extname(path).toLowerCase() === '.css';
  const motionRe = isCss
    ? /(@keyframes\s|animation(?:-timeline)?\s*:|transition\s*:)/
    : /(requestAnimationFrame|\.animate\(|scrollIntoView\(\s*\{\s*behavior)/;
  const m = motionRe.exec(src);
  if (!m) return [];
  if (/prefers-reduced-motion:\s*reduce/.test(src) || /prefers-reduced-motion/.test(src) && !isCss) return [];
  return [{ id: 'A7', file: path, line: lineOf(src, m.index), text: 'motion declared without a prefers-reduced-motion: reduce fallback in this file' }];
}

/* ── scanFile ──────────────────────────────────────────────────────────────── */
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
  const ext = extname(path).toLowerCase();
  if (ext === '.css') results.push(...cssA1Findings(path, src), ...motionFindings(path, src));
  else if (ext === '.html') results.push(...htmlA1Findings(path, src), ...motionFindings(path, src));
  else if (ext === '.js') results.push(...motionFindings(path, src));
  return results;
}

function walk(dir) {
  let results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      // Skip dependencies, VCS, build output and deliberately-bad test fixtures
      if (['node_modules', '.git', 'dist', 'build', 'fixtures'].includes(e.name)) continue;
      results = results.concat(walk(full));
    } else if (['.html', '.css', '.js'].includes(extname(e.name))) {
      results = results.concat(scanFile(full));
    }
  }
  return results;
}

const target = process.argv[2];
if (!target) { console.error('Usage: node .opencode/skills/namuna-guardian/scripts/slop-scan.mjs <file-or-dir>'); process.exit(2); }

/* ── Waiver loading, validation (A18) & matching ───────────────────────────── */
let waivers = [];
let waiverLoadError = null;
const waiverFindings = [];
const waiverPath = '.hallmark/waivers.jsonl';
if (existsSync(join(process.cwd(), waiverPath))) {
  try {
    const waiverSrc = readFileSync(join(process.cwd(), waiverPath), 'utf8');
    const rows = waiverSrc.split('\n').map((l, i) => ({ raw: l.trim(), line: i + 1 })).filter(r => r.raw);
    rows.forEach(({ raw, line }) => {
      let w;
      try { w = JSON.parse(raw); } catch (e) {
        waiverFindings.push({ id: 'A18', file: waiverPath, line, text: `waiver is not valid JSON: ${e.message}` });
        return;
      }
      if (!w.id) waiverFindings.push({ id: 'A18', file: waiverPath, line, text: 'waiver missing "id"' });
      if (!w.reason || !String(w.reason).trim()) waiverFindings.push({ id: 'A18', file: waiverPath, line, text: `waiver ${w.id || '?'} missing "reason" — never waive silently` });
      if (!w.expires) waiverFindings.push({ id: 'A18', file: waiverPath, line, text: `waiver ${w.id || '?'} missing "expires" — waivers must expire` });
      if (w.id && (w.reason || '').trim() && w.expires) waivers.push(w);
    });
  } catch (e) {
    waiverLoadError = e.message;
  }
} else {
  waivers = [];
}

function norm(p) { return (p || '').replace(/\\/g, '/'); }

function globToRegex(glob) {
  let pattern = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*');
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
results.push(...waiverFindings);

const waived = results.filter(r => waivers.some(w => isWaived(w, r.id, r.file, r.line, r.text)));
const expired = waivers.filter(w => isExpired(w));
results = results.filter(r => !waivers.some(w => isWaived(w, r.id, r.file, r.line, r.text)));

const hardIds = new Set(['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A13', 'A14', 'A15', 'A16', 'A17', 'A18']);
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
  for (const r of waived) {
    const match = waivers.find(x => isWaived(x, r.id, r.file, r.line, r.text));
    const expiry = match && match.expires ? ` (expires ${match.expires})` : '';
    console.log(`  ${WARN_COLOR}[${r.id}]${RESET} ${norm(r.file).split('/').pop()} L${r.line}: ${match ? match.reason : ''}${expiry}`);
  }
}

if (results.length) {
  for (const r of results) {
    const color = hardIds.has(r.id) ? FAIL_COLOR : WARN_COLOR;
    console.log(`${color}[${r.id}]${RESET} ${r.file} L${r.line}: ${r.text}`);
  }
}

console.log(`\nSummary: ${hard.length} hard fail(s), ${soft.length} warn(s), ${waived.length} waived, ${expired.length} expired.`);

process.exit(hard.length > 0 ? 1 : 0);
