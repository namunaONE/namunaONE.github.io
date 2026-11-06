/* scripts/skill-lint.mjs — structural lint for the Namuna skill system.
   Checks:
     1. every SKILL.md carries YAML frontmatter with name + description
     2. backticked path references resolve (repo root / skill dir / skills dir)
     3. gate ranges "A1–A{n}" match the current maximum gate in anti-slop-gates.md
     4. every referenced gate id exists in anti-slop-gates.md
   Usage: node scripts/skill-lint.mjs
   Exit code: 0 clean, 1 on violations.
*/
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const SKILLS_DIR = '.opencode/skills';
const GATES_DOC = join(SKILLS_DIR, 'namuna-guardian', 'references', 'anti-slop-gates.md');

/* Paths that live in sibling repos / live endpoints, not in this repository.
   A backticked token matches if it equals the entry or ends with "/<entry>". */
const REMOTE_SHORTHAND = [
  'bindings/meta.json',   // nGeo repo (raw.githubusercontent.com/namunaONE/nGeo)
  'api/v1/today.json',    // nMiti live endpoint
];

const gatesDoc = readFileSync(GATES_DOC, 'utf8');
const gateIds = new Set();
for (const line of gatesDoc.split('\n')) {
  const m = /^\|\s*(A\d+)\s*\|/.exec(line);
  if (m) gateIds.add(m[1]);
}
const maxGate = Math.max(...[...gateIds].map(id => Number(id.slice(1))));

const targets = [];
for (const d of readdirSync(SKILLS_DIR)) {
  const dir = join(SKILLS_DIR, d);
  if (!statSync(dir).isDirectory()) continue;
  for (const f of ['SKILL.md', 'README.md']) {
    if (existsSync(join(dir, f))) targets.push({ path: join(dir, f), base: dir });
  }
  for (const sub of ['references', 'evals']) {
    const subDir = join(dir, sub);
    if (!existsSync(subDir)) continue;
    for (const f of readdirSync(subDir)) {
      if (f.endsWith('.md')) targets.push({ path: join(subDir, f), base: dir });
    }
  }
}
targets.push({ path: 'docs/namuna-flow.md', base: 'docs' });
for (const folder of ['docs/knowledge', 'docs/decisions']) {
  if (!existsSync(folder)) continue;
  for (const f of readdirSync(folder)) {
    if (f.endsWith('.md')) targets.push({ path: join(folder, f), base: folder });
  }
}

const violations = [];
const norm = (p) => p.replace(/\\/g, '/');

/* 0 · every skill ships evals (no skill without a scenario file). */
for (const d of readdirSync(SKILLS_DIR)) {
  const dir = join(SKILLS_DIR, d);
  if (!statSync(dir).isDirectory()) continue;
  if (existsSync(join(dir, 'SKILL.md')) && !existsSync(join(dir, 'evals', 'scenarios.md'))) {
    violations.push(`${norm(dir)}: missing evals/scenarios.md — every skill must ship evals`);
  }
}

for (const t of targets) {
  const src = readFileSync(t.path, 'utf8');
  const file = norm(t.path);

  // 1 · SKILL.md frontmatter
  if (basename(t.path) === 'SKILL.md') {
    const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(src);
    if (!fm) violations.push(`${file}: missing YAML frontmatter`);
    else {
      if (!/name:\s*\S+/.test(fm[1])) violations.push(`${file}: frontmatter missing "name"`);
      if (!/description:\s*\S+/.test(fm[1])) violations.push(`${file}: frontmatter missing "description"`);
    }
  }

  // 2 · backticked path references
  for (const m of src.matchAll(/`([^`\n]+)`/g)) {
    let token = m[1].trim();
    if (!token || token.startsWith('http') || token.includes('://')) continue;
    if (token.includes('<') || token.includes('*') || token.includes('…') || token.includes('$') || token.includes('{')) continue;
    token = token.replace(/[.,;:)\]]+$/, '');
    if (!token.includes('/') || /\s/.test(token)) continue;
    if (!/\/$/.test(token) && !/\.[A-Za-z0-9]{1,6}$/.test(token)) continue;
    if (REMOTE_SHORTHAND.some(r => token === r || token.endsWith('/' + r))) continue;
    const candidates = [token, join(t.base, token), join(SKILLS_DIR, token)];
    if (!candidates.some(c => existsSync(c))) {
      violations.push(`${file}: references missing path \`${token}\``);
    }
  }

  // 3 · gate ranges
  for (const m of src.matchAll(/A1\s*[–—−-]\s*A(\d+)/g)) {
    if (Number(m[1]) !== maxGate) {
      violations.push(`${file}: gate range "A1–A${m[1]}" is stale (current floor is A1–A${maxGate})`);
    }
  }

  // 4 · gate ids referenced must exist
  for (const m of src.matchAll(/(?<![A-Za-z0-9])A(\d+)\b/g)) {
    const id = `A${m[1]}`;
    if (!gateIds.has(id)) {
      violations.push(`${file}: references unknown gate ${id}`);
    }
  }
}

console.log(`Skill lint — ${targets.length} file(s), gates A1..A${maxGate}\n`);
if (violations.length) {
  console.log('\x1b[31mVIOLATIONS:\x1b[0m');
  for (const v of violations) console.log(`  - ${v}`);
  process.exit(1);
}
console.log('All skill files resolve, gate ranges current, gate ids known.');
