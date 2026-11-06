/* scripts/tokens-check.mjs — token registry drift audit.
   The :root blocks in assets/css/style.css are extracted and compared against
   design/tokens.json (the canonical registry). Docs must not invent tokens:
   every `--token` mentioned in STYLEGUIDE.md or references/design-system.md
   must exist in the registry.
   Usage:
     node scripts/tokens-check.mjs --write   # regenerate design/tokens.json from CSS
     node scripts/tokens-check.mjs           # verify (exit 1 on drift)
*/
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const CSS_PATH = 'assets/css/style.css';
const REGISTRY_PATH = 'design/tokens.json';
const DOCS = [
  'STYLEGUIDE.md',
  '.opencode/skills/namuna-guardian/references/design-system.md',
];

/* ── extract :root blocks from the stylesheet ──────────────────────────────── */
function findRootBlocks(src) {
  const blocks = [];
  const stack = [];
  let inComment = false;
  let inString = null;
  let lastBound = 0;
  let depth = 0;
  let pending = null;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
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
    if (ch === '{') {
      const ctx = src.slice(lastBound, i).replace(/\/\*[\s\S]*?\*\//g, '').trim();
      const media = stack.filter(s => /@media/.test(s)).join(' | ');
      stack.push(ctx);
      depth++;
      if (/:root/.test(ctx)) {
        let kind = 'light';
        if (/prefers-color-scheme:\s*dark/.test(media)) kind = 'dark';
        else if (/prefers-contrast:\s*more/.test(media)) kind = 'contrastMore';
        else if (/\bprint\b/.test(media)) kind = 'print';
        pending = { start: i + 1, minDepth: depth, kind };
      }
      lastBound = i + 1;
      continue;
    }
    if (ch === '}') {
      depth--;
      stack.pop();
      lastBound = i + 1;
      if (pending && depth < pending.minDepth) {
        blocks.push({ kind: pending.kind, body: src.slice(pending.start, i) });
        pending = null;
      }
      continue;
    }
  }
  return blocks;
}

function extractTokens(src) {
  const out = { light: {}, dark: {}, contrastMore: {}, print: {} };
  for (const b of findRootBlocks(src)) {
    for (const m of b.body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      const name = m[1];
      const value = m[2].trim().replace(/\s+/g, ' ');
      out[b.kind][name] = value;
    }
  }
  return out;
}

const sortKeys = (obj) => Object.fromEntries(Object.keys(obj).sort().map(k => [k, obj[k]]));

/* ── modes ─────────────────────────────────────────────────────────────────── */
const mode = process.argv[2];
const css = readFileSync(CSS_PATH, 'utf8');
const extracted = extractTokens(css);

if (mode === '--write') {
  mkdirSync(dirname(REGISTRY_PATH), { recursive: true });
  const registry = {
    version: 1,
    source: CSS_PATH,
    note: 'Canonical token registry. Regenerate with `node scripts/tokens-check.mjs --write` after editing the :root blocks; docs must not invent tokens. CI verifies CSS <-> registry in both directions.',
    blocks: {
      light: sortKeys(extracted.light),
      dark: sortKeys(extracted.dark),
      contrastMore: sortKeys(extracted.contrastMore),
    },
  };
  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n');
  const n = Object.keys(extracted.light).length + Object.keys(extracted.dark).length + Object.keys(extracted.contrastMore).length;
  console.log(`tokens-check: wrote ${REGISTRY_PATH} (${n} declarations across light/dark/contrastMore)`);
  process.exit(0);
}

/* ── verify mode ───────────────────────────────────────────────────────────── */
const problems = [];
if (!existsSync(REGISTRY_PATH)) {
  console.error(`tokens-check: missing ${REGISTRY_PATH} — run --write first`);
  process.exit(1);
}
const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));

const kinds = ['light', 'dark', 'contrastMore'];
for (const kind of kinds) {
  const expected = registry.blocks[kind] || {};
  const actual = extracted[kind] || {};
  for (const [k, v] of Object.entries(expected)) {
    if (!(k in actual)) problems.push(`[${kind}] ${k} in registry but not in CSS`);
    else if (actual[k] !== v) problems.push(`[${kind}] ${k}: CSS "${actual[k]}" ≠ registry "${v}"`);
  }
  for (const k of Object.keys(actual)) {
    if (!(k in expected)) problems.push(`[${kind}] ${k} in CSS but not in registry — run --write`);
  }
}

const allTokens = new Set(kinds.flatMap(k => Object.keys(extracted[k] || {})));

/* Mention extraction: wildcard families like `--map-*` are not phantom tokens. */
const mentions = (src) => new Set(
  [...src.replace(/--[a-z0-9-]+\*/g, '').matchAll(/--[a-z0-9][a-z0-9-]*/g)].map(m => m[0])
);

for (const doc of DOCS) {
  if (!existsSync(doc)) { problems.push(`missing doc ${doc}`); continue; }
  const mentioned = mentions(readFileSync(doc, 'utf8'));
  for (const t of mentioned) {
    if (!allTokens.has(t)) problems.push(`${doc}: mentions ${t} which is not in the registry`);
  }
}

const covered = (doc) => {
  if (!existsSync(doc)) return '';
  const mentioned = mentions(readFileSync(doc, 'utf8'));
  const n = [...allTokens].filter(t => mentioned.has(t)).length;
  return `${n}/${allTokens.size}`;
};

console.log('tokens-check — registry vs stylesheet vs docs\n');
console.log(`  registry tokens: ${allTokens.size} (light ${Object.keys(extracted.light).length}, dark ${Object.keys(extracted.dark).length}, contrast-more ${Object.keys(extracted.contrastMore).length})`);
for (const doc of DOCS) console.log(`  ${doc}: ${covered(doc)} tokens mentioned`);

if (problems.length) {
  console.log(`\n\x1b[31mVIOLATIONS:\x1b[0m`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
console.log('\nCSS, registry and docs agree.');
