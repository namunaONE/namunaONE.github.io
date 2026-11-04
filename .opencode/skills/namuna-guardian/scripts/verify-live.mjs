/* namuna-guardian verify-live.mjs
   Live-source verification: external link liveness (A20) + figure drift vs
   nGeo bindings/meta.json (A19). Complements the static slop-scan.
   Usage: node scripts/verify-live.mjs [page]
   Exit code: 0 clean, 1 if FAIL.
*/
import { readFileSync } from 'node:fs';

const page = process.argv[2] || 'index.html';
const html = readFileSync(page, 'utf8');
const FAILS = [];
const WARNS = [];
const OKS = [];

const OK = new Set([200, 301, 302, 303, 307, 308]);
const SOFT = new Set([403, 405, 429, 501, 503, 999]); // bot walls / method blocked — verify manually

/* ── A20 · link liveness ─────────────────────────────────────────────── */
const hrefs = [...new Set([...html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map(m => m[1]))];
for (const url of hrefs) {
  let status = null;
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15000) });
    status = res.status;
    if (!OK.has(status) && !SOFT.has(status)) {
      const res2 = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
      status = res2.status;
    }
  } catch (e) {
    WARNS.push(['A20', url, `network error: ${e?.message || e}`]);
    continue;
  }
  if (OK.has(status)) OKS.push(['A20', `${status} ${url}`]);
  else if (SOFT.has(status)) WARNS.push(['A20', url, `status ${status} (bot-wall or HEAD blocked) — verify manually`]);
  else FAILS.push(['A20', url, `status ${status} — dead or moved link`]);
}

/* ── bs-today: nMiti today.json liveness + shape (A20, added by bs-today spec) ── */
try {
  const tj = await fetch('https://namunaone.github.io/nMiti/api/v1/today.json', { signal: AbortSignal.timeout(15000) });
  if (!OK.has(tj.status)) FAILS.push(['A20', 'today.json', `status ${tj.status} — nMiti today.json unavailable`]);
  else {
    const body = await tj.json();
    if (!body || !body.bs || !body.bs.label_np || !body.ad || !body.ad.iso || !body.generated_at_utc) {
      FAILS.push(['A20', 'today.json', 'shape mismatch — required fields missing']);
    } else {
      OKS.push(['A20', `today.json ok (${body.bs.label_np} / ${body.ad.iso})`]);
    }
  }
} catch (e) {
  WARNS.push(['A20', 'today.json', `network error: ${e?.message || e}`]);
}

/* ── A19 · figure drift vs live bindings meta ────────────────────────── */
const META_URL = 'https://raw.githubusercontent.com/namunaONE/nGeo/main/bindings/meta.json';
try {
  const meta = await (await fetch(META_URL, { signal: AbortSignal.timeout(15000) })).json();

  // Page figures — source: index.html (hand-maintained snapshots, CI-verified here).
  // Keys per bindings/meta.json: coverage.declaredWards (the declared national figure
  // the page shows; substantiatedWards 6697 differs by the 8 documented roster gaps).
  const expected = {
    localBodies: 753,
    districts: 77,
    provinces: 7,
    declaredWards: 6743,
    doublyAttestedCodes: 548,
    singleSourceCodes: 205,
    withCbsCode: 753
  };
  for (const [key, pageValue] of Object.entries(expected)) {
    const live = meta.coverage[key];
    if (live !== pageValue) FAILS.push(['A19', key, `live ${live} ≠ page ${pageValue} — update the figures in ${page}`]);
    else OKS.push(['A19', `${key} = ${pageValue}`]);
  }

  // Bindings version must be stamped on the page (atlas/data note)
  if (!html.includes(`v${meta.version}`)) {
    FAILS.push(['A19', 'bindings version', `live v${meta.version} not stamped on page — update the Data section note`]);
  } else OKS.push(['A19', `bindings v${meta.version} stamped on page`]);
} catch (e) {
  WARNS.push(['A19', META_URL, `fetch failed: ${e?.message || e}`]);
}

/* ── Report ──────────────────────────────────────────────────────────── */
for (const [id, msg] of OKS) console.log(`  \x1b[32m[${id} OK]\x1b[0m ${msg}`);
for (const [id, subject, msg] of WARNS) console.log(`  \x1b[33m[${id} WARN]\x1b[0m ${subject} — ${msg}`);
for (const [id, subject, msg] of FAILS) console.log(`  \x1b[31m[${id} FAIL]\x1b[0m ${subject} — ${msg}`);
console.log(`\nLive verification: ${OKS.length} ok, ${WARNS.length} warn, ${FAILS.length} fail`);
process.exit(FAILS.length > 0 ? 1 : 0);