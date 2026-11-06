/* namuna-guardian gate-coverage.mjs
   Audits the "Enforced by" claim in references/anti-slop-gates.md against the
   code. A FAIL-severity gate must be automated (scanner / live / flow) or carry
   a judged rubric — and the claim must match reality, not the doc's memory.
   Usage: node .opencode/skills/namuna-guardian/scripts/gate-coverage.mjs
   Exit code: 0 every gate verified, 1 on any violation.
*/
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..', '..', '..');

const gatesDocPath = join(here, '..', 'references', 'anti-slop-gates.md');
const scannerPath = join(here, 'slop-scan.mjs');
const livePath = join(here, 'verify-live.mjs');
const flowPath = join(root, 'scripts', 'flow.mjs');

const gatesDoc = readFileSync(gatesDocPath, 'utf8');
const scanner = readFileSync(scannerPath, 'utf8');
const live = readFileSync(livePath, 'utf8');
const flow = existsSync(flowPath) ? readFileSync(flowPath, 'utf8') : '';

const VALID_SEVERITIES = new Set(['FAIL', 'WARN']);
const VALID_ENFORCEMENT = new Set(['scanner', 'live', 'flow', 'judged']);

const rows = [];
for (const line of gatesDoc.split('\n')) {
  const m = /^\|\s*(A\d+)\s*\|([^|]+)\|([^|]+)\|([^|]+)\|\s*$/.exec(line);
  if (!m) continue;
  rows.push({ id: m[1], gate: m[2].trim(), severity: m[3].trim(), enforced: m[4].trim() });
}

const problems = [];
const checks = [];

const seen = new Set();
for (const r of rows) {
  if (seen.has(r.id)) problems.push(`${r.id}: duplicate row`);
  seen.add(r.id);
  if (!VALID_SEVERITIES.has(r.severity)) problems.push(`${r.id}: invalid severity "${r.severity}"`);
  if (!VALID_ENFORCEMENT.has(r.enforced)) problems.push(`${r.id}: invalid enforcement "${r.enforced}"`);

  let ok = true;
  let detail = r.enforced;

  if (r.enforced === 'scanner') {
    ok = new RegExp(`id:\\s*'${r.id}'`).test(scanner);
    if (!ok) detail += ' (no scanner rule found)';
  } else if (r.enforced === 'live') {
    ok = new RegExp(`\\b${r.id}\\b`).test(live);
    if (!ok) detail += ' (id not found in verify-live.mjs)';
  } else if (r.enforced === 'flow') {
    ok = new RegExp(`\\b${r.id}\\b`).test(flow);
    if (!ok) detail += ' (id not found in scripts/flow.mjs)';
  } else if (r.enforced === 'judged') {
    const hasSection = /## Judged rubrics/.test(gatesDoc);
    const hasRubric = new RegExp(`###\\s+${r.id}\\b`).test(gatesDoc);
    ok = hasSection && hasRubric;
    if (!ok) detail += ' (no judged rubric heading in anti-slop-gates.md)';
  }

  checks.push({ id: r.id, severity: r.severity, enforced: r.enforced, ok, detail });
  if (!ok) problems.push(`${r.id}: enforcement claim not verified — ${detail}`);
}

// Structure: A1..A20 must all be present, no extras
const expected = Array.from({ length: 20 }, (_, i) => `A${i + 1}`);
for (const id of expected) {
  if (!seen.has(id)) problems.push(`${id}: missing from anti-slop-gates.md table`);
}
for (const id of seen) {
  if (!expected.includes(id)) problems.push(`${id}: unexpected gate id (expected A1..A20)`);
}

console.log('Gate coverage audit — claims checked against code\n');
for (const c of checks) {
  const mark = c.ok ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
  console.log(`  ${mark} ${c.id.padEnd(4)} ${c.severity.padEnd(5)} ${c.detail}`);
}

const automated = checks.filter(c => c.enforced !== 'judged').length;
const judged = checks.filter(c => c.enforced === 'judged').length;
console.log(`\n${checks.length} gates: ${automated} automated, ${judged} judged (rubric-checked).`);

if (problems.length) {
  console.log(`\n\x1b[31mVIOLATIONS:\x1b[0m`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
console.log('All gate enforcement claims verified.');
