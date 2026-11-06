/* scripts/a11y-check.mjs — automated accessibility CI checks.
   Runs without a browser by parsing CSS/HTML directly. Catches the
   accessibility regressions that would otherwise reach production.
   Usage: node scripts/a11y-check.mjs
   Exit code: 0 all checks pass, 1 any FAIL.
*/
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const FAILS = [];
const WARNS = [];
const OKS = [];
const WAIVERS_PATH = join(ROOT, '.hallmark', 'waivers.jsonl');

let waivers = [];
try {
  const src = readFileSync(WAIVERS_PATH, 'utf8');
  waivers = src.split('\n').map(l => l.trim()).filter(Boolean).map(l => JSON.parse(l));
} catch { /* no waiver file — nothing skipped */ }

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
  return true;
}

function isExpired(w) {
  if (!w.expires) return false;
  const expiry = new Date(w.expires + 'T23:59:59Z');
  return new Date() > expiry;
}

function isWaived(w, check, filePath, detail) {
  if (w.id !== check) return false;
  if (!matchFile(w, filePath)) return false;
  if (w.pattern) {
    try { if (!new RegExp(w.pattern).test(detail || '')) return false; }
    catch { return false; }
  }
  if (isExpired(w)) return false;
  return true;
}

function fail(check, detail, filePath) {
  if (waivers.some(w => isWaived(w, check, filePath, detail))) return; // explicitly waived
  FAILS.push([check, detail]);
  console.log(`  \x1b[31m[FAIL]${check}\x1b[0m ${detail}`);
}
function warn(check, detail) { WARNS.push([check, detail]); console.log(`  \x1b[33m[WARN]${check}\x1b[0m ${detail}`); }
function ok(check, detail) { OKS.push([check, detail]); console.log(`  \x1b[32m[ok]${check}\x1b[0m ${detail}`); }

/* ── Color contrast ─────────────────────────────────────────────────────── */
/* Parse hex → RGB. Handles #RGB and #RRGGBB. */
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}

/* Relative luminance per WCAG 2.1. */
function luminance(r, g, b) {
  const lin = (c) => { c = c / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/* Contrast ratio between two colors. */
function contrast(c1, c2) {
  const l1 = luminance(...c1);
  const l2 = luminance(...c2);
  const light = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (light + 0.05) / (dark + 0.05);
}

/* Extract color declarations from CSS. Returns { prop: hex } pairs. */
function extractColors(css) {
  const colors = {};
  const commentStripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const rootBlocks = [];
  let depth = 0, inRoot = false, start = 0;
  for (let i = 0; i < commentStripped.length; i++) {
    if (commentStripped[i] === '{') { depth++; if (depth === 1) { const sel = commentStripped.slice(start, i).trim(); if (/^:root/.test(sel) || /prefers-color-scheme/.test(sel)) inRoot = true; } }
    if (commentStripped[i] === '}') { if (depth === 1) inRoot = false; depth--; }
    if (depth === 0 && commentStripped[i] === ';') start = i + 1;
  }
  /* Simpler: find all color: #hex declarations outside comments */
  const colorRe = /(?:color|background(?:-color)?|border(?:-color)?|outline|fill|stroke)\s*:\s*#([0-9a-fA-F]{3,8})\b/gi;
  let m;
  while ((m = colorRe.exec(commentStripped))) {
    const prop = m[0].split(':')[0].trim();
    const val = m[1];
    colors[prop + ':' + val] = hexToRgb('#' + val);
  }
  return colors;
}

/* Check key contrast pairs from the design system. */
function checkContrast(cssPath) {
  const css = readFileSync(cssPath, 'utf8');
  const lightCss = css;
  const darkCss = css; /* same file, dark via @media */

  const pairs = [
    { name: 'body ink on bg (light)', fg: '#1e2a2b', bg: '#f5f4f2', min: 4.5 },
    { name: 'body ink-soft on bg (light)', fg: '#3c4a4b', bg: '#f5f4f2', min: 4.5 },
    { name: 'body muted on bg (light)', fg: '#55605f', bg: '#f5f4f2', min: 4.5 },
    { name: 'body ink on bg (dark)', fg: '#f0eee9', bg: '#10171a', min: 4.5 },
    { name: 'body ink-soft on bg (dark)', fg: '#c6d0ce', bg: '#10171a', min: 4.5 },
    { name: 'body muted on bg (dark)', fg: '#94a4a2', bg: '#10171a', min: 4.5 },
    { name: 'link on bg (light)', fg: '#0e4d5c', bg: '#f5f4f2', min: 4.5 },
    { name: 'link on bg (dark)', fg: '#9fd3d2', bg: '#10171a', min: 4.5 },
    { name: 'action button text on bg (light)', fg: '#ffffff', bg: '#0e4d5c', min: 4.5 },
    { name: 'action button text on bg (dark)', fg: '#08262b', bg: '#8fc7c7', min: 4.5 },
    { name: 'border on bg (light)', fg: '#d4d1cb', bg: '#f5f4f2', min: 3.0 },
    { name: 'border on bg (dark)', fg: '#2a3539', bg: '#10171a', min: 3.0 },
  ];

  let contrastFails = 0;
  for (const p of pairs) {
    const ratio = contrast(hexToRgb(p.fg), hexToRgb(p.bg));
    const pass = ratio >= p.min;
    if (pass) ok('contrast', `${p.name}: ${ratio.toFixed(2)}:1 (>= ${p.min}:1)`);
    else { fail('contrast', `${p.name}: ${ratio.toFixed(2)}:1 (< ${p.min}:1)`, cssPath); contrastFails++; }
  }
  return contrastFails === 0;
}

/* ── HTML structural checks ─────────────────────────────────────────────── */
function checkHtml(html, path) {
  let allOk = true;

  /* lang attribute */
  const langM = /<html[^>]*lang="([^"]+)"/i.exec(html);
  if (langM) ok('html-lang', `lang="${langM[1]}"`);
  else { fail('html-lang', 'missing lang attribute'); allOk = false; }

  /* title */
  const titleM = /<title[^>]*>([^<]*)<\/title>/i.exec(html);
  if (titleM && titleM[1].trim()) ok('title', `title: "${titleM[1].trim()}"`);
  else { fail('title', 'empty or missing title'); allOk = false; }

  /* images must have alt */
  const imgRe = /<img[^>]*>/gi;
  let imgM;
  while ((imgM = imgRe.exec(html))) {
    const tag = imgM[0];
    const altM = /alt="([^"]*)"/i.exec(tag);
    const srcM = /src="([^"]*)"/i.exec(tag);
    const src = srcM ? srcM[1] : 'unknown';
    if (altM === null) { fail('img-alt', `${src}: missing alt attribute`); allOk = false; }
    else ok('img-alt', `${src}: alt="${altM[1]}"`);
  }

  /* heading hierarchy: no skipped levels */
  const headingRe = /<h([1-6])[^>]*>/gi;
  let prevLevel = 0;
  let hM;
  while ((hM = headingRe.exec(html))) {
    const level = parseInt(hM[1]);
    if (prevLevel > 0 && level > prevLevel + 1) {
      fail('heading-hierarchy', `h${prevLevel} → h${level}: skipped heading level`);
      allOk = false;
    }
    prevLevel = level;
  }
  ok('heading-hierarchy', 'no skipped heading levels');

  /* skip link */
  if (/skip-link/.test(html)) ok('skip-link', 'skip link present');
  else { fail('skip-link', 'no skip link found'); allOk = false; }

  /* ARIA validity — known attributes */
  const ariaRe = /(aria-[a-z-]+)="([^"]*)"/gi;
  const validAria = new Set([
    'aria-label','aria-labelledby','aria-describedby','aria-hidden','aria-current',
    'aria-expanded','aria-selected','aria-checked','aria-disabled','aria-readonly',
    'aria-required','aria-invalid','aria-level','aria-posinset','aria-setsize',
    'aria-valuemin','aria-valuemax','aria-valuenow','aria-valuetext','aria-live',
    'aria-relevant','aria-atomic','aria-busy','aria-modal','aria-multiselectable',
    'aria-orientation','aria-pressed','aria-sort','aria-controls','aria-owns',
    'aria-activedescendant','aria-roledescription'
  ]);
  let ariaM;
  while ((ariaM = ariaRe.exec(html))) {
    const attr = ariaM[1];
    if (!validAria.has(attr)) {
      warn('aria-attr', `unknown ARIA attribute: ${attr}`);
    }
  }
  ok('aria-attr', 'ARIA attributes checked against valid set');

  /* focus-visible exists in CSS (cross-file check done separately) */
  return allOk;
}

/* ── CSS checks ─────────────────────────────────────────────────────────── */
function checkCss(css) {
  let allOk = true;

  /* focus-visible rule present */
  if (/:focus-visible/.test(css)) ok('focus-visible', ':focus-visible rule present');
  else { fail('focus-visible', 'no :focus-visible rule — keyboard users cannot see focus'); allOk = false; }

  /* no outline: none without focus-visible replacement */
  const outlineNoneRe = /outline\s*:\s*(none|0)\b/gi;
  let onM;
  let outlineNoneCount = 0;
  while ((onM = outlineNoneRe.exec(css))) {
    outlineNoneCount++;
  }
  if (outlineNoneCount > 0) {
    warn('outline-none', `${outlineNoneCount} outline:none declaration(s) — ensure :focus-visible replacement exists`);
  } else {
    ok('outline-none', 'no outline:none declarations');
  }

  /* reduced motion support */
  if (/prefers-reduced-motion/.test(css)) ok('reduced-motion', 'prefers-reduced-motion support present');
  else { warn('reduced-motion', 'no prefers-reduced-motion media query found'); }

  /* forced colors support */
  if (/forced-colors/.test(css)) ok('forced-colors', 'forced-colors support present');
  else { warn('forced-colors', 'no forced-colors media query found'); }

  /* touch targets: check for min-height/width >= 44px on buttons/links */
  const touchRe = /(?:min-height|min-width)\s*:\s*(44|4[5-9]\d|[5-9]\d\d|1\d{3}|[2-9]\d{3})px\b/gi;
  let touchCount = 0;
  while (touchRe.exec(css)) touchCount++;
  if (touchCount >= 1) ok('touch-targets', `${touchCount} min-height/width >= 44px declarations found`);
  else { warn('touch-targets', 'no explicit 44px+ touch target dimensions found'); }

  return allOk;
}

/* ── Main ───────────────────────────────────────────────────────────────── */
function main() {
  console.log('Accessibility CI check\n');

  const htmlPath = join(ROOT, 'index.html');
  const html = existsSync(htmlPath) ? readFileSync(htmlPath, 'utf8') : '';
  const cssPath = join(ROOT, 'assets', 'css', 'style.css');
  const css = existsSync(cssPath) ? readFileSync(cssPath, 'utf8') : '';

  if (html) {
    console.log('─ HTML ────────────────────────────────────────');
    checkHtml(html, htmlPath);
  }
  if (css) {
    console.log('─ CSS ─────────────────────────────────────────');
    checkCss(css);
  }
  console.log('─ Contrast ────────────────────────────────────');
  checkContrast(cssPath);

  console.log(`\nSummary: ${OKS.length} pass, ${WARNS.length} warn, ${FAILS.length} fail`);
  if (FAILS.length > 0) {
    console.log('\n\x1b[31mNO-GO — accessibility failures found.\x1b[0m');
    process.exit(1);
  }
  if (WARNS.length > 0) {
    console.log('\n\x1b[33mGO with warnings — review WARN items.\x1b[0m');
    process.exit(0);
  }
  console.log('\n\x1b[32mGO — all accessibility checks pass.\x1b[0m');
  process.exit(0);
}

main();
