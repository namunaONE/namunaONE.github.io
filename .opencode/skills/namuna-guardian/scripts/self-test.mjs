/* namuna-guardian self-test.mjs
   Fixture assertions for slop-scan.mjs: each deliberately-bad file must FAIL,
   each deliberately-good file must PASS. Proves the scanner still catches the
   tells it claims to catch (anti-slop tooling that lies is itself slop).
   Usage: node .opencode/skills/namuna-guardian/scripts/self-test.mjs
   Exit code: 0 all expectations met, 1 otherwise.
*/
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const scan = join(here, 'slop-scan.mjs');
const fixtures = join(here, '..', 'evals', 'fixtures');

const cases = [
  { file: 'bad-a1.css', expect: 1, why: 'raw hex outside tokens must fail A1' },
  { file: 'good-a1.css', expect: 0, why: 'tokens-only CSS must pass' },
  { file: 'bad-a7.css', expect: 1, why: 'motion without a reduced-motion fallback must fail A7' },
  { file: 'good-a7.css', expect: 0, why: 'motion with a reduced-motion fallback must pass' },
];

let failed = 0;
for (const c of cases) {
  const res = spawnSync(process.execPath, [scan, join(fixtures, c.file)], { encoding: 'utf8' });
  const ok = res.status === c.expect;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${c.file} — expected exit ${c.expect}, got ${res.status} (${c.why})`);
  if (!ok) {
    failed++;
    console.log((res.stdout || '').split('\n').slice(0, 12).join('\n'));
    console.log((res.stderr || '').split('\n').slice(0, 6).join('\n'));
  }
}

console.log(`\nself-test: ${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
