/* namuna-guardian verify-live.mjs
   Live-source verification: external link liveness (A20) + published-figure
   drift (A19) against the registry in design/figures.json. Complements the
   static slop-scan.
   A15 (dead package links) is covered by the A20 pass below — package
   registries (pub.dev, npm, PyPI) are fetched with every other external URL.
   Usage: node scripts/verify-live.mjs [page]
   Exit code: 0 clean, 1 if FAIL.
*/
import { readFileSync, existsSync } from 'node:fs';

const page = process.argv[2] || 'index.html';
const html = readFileSync(page, 'utf8');
const FAILS = [];
const WARNS = [];
const OKS = [];

const OK = new Set([200, 301, 302, 303, 307, 308]);
const SOFT = new Set([403, 405, 429, 501, 503, 999]); // bot walls / method blocked — verify manually

const META_URL = 'https://raw.githubusercontent.com/namunaONE/nGeo/main/bindings/meta.json';
const NMITI_CORE_URL = 'https://raw.githubusercontent.com/namunaONE/nMiti/main/data/calendar_bs_core_1975_2083.csv';
const REGISTRY_PATH = 'design/figures.json';

const fetchCache = new Map();
async function getText(url) {
  if (fetchCache.has(url)) return fetchCache.get(url);
  const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  fetchCache.set(url, text);
  return text;
}
async function getJson(url) {
  return JSON.parse(await getText(url));
}
const pathGet = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
const fmt = (v, format) => {
  if (format === 'locale' && typeof v === 'number') return v.toLocaleString('en-US');
  return String(v);
};

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

/* ── A19 · figure drift vs design/figures.json ───────────────────────── */
if (!existsSync(REGISTRY_PATH)) {
  FAILS.push(['A19', REGISTRY_PATH, 'figure registry missing — every published figure must be registered']);
} else {
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));
  const pageBase = page.replace(/\\/g, '/').split('/').pop();

  const check = async (f) => {
    const id = f.id;
    const severity = f.severity || 'fail';
    const fail = (msg) => (severity === 'fail' ? FAILS : severity === 'warn' ? WARNS : OKS).push(['A19', id, msg]);

    if (f.page && f.page !== pageBase) return;

    // 1 · page pattern
    const m = new RegExp(f.pattern).exec(html);
    if (!m) return fail(`pattern not found on page: ${f.pattern}`);
    const pageValue = m[1];
    if (f.value !== undefined && pageValue !== f.value) {
      return fail(`page shows "${pageValue}", registry expects "${f.value}" — update the page or the registry`);
    }

    // 2 · live source
    const src = f.source || {};
    try {
      if (src.type === 'ngeo-meta') {
        const meta = await getJson(META_URL);
        const live = fmt(pathGet(meta, src.path), f.format);
        if (f.value === undefined) {
          if (live !== pageValue) return fail(`live ${src.path} = "${live}" but page shows "${pageValue}"`);
          return OKS.push(['A19', `${id}: page = live = ${live}`]);
        }
        if (live !== f.value) return fail(`live ${src.path} = "${live}" ≠ registry "${f.value}"`);
        return OKS.push(['A19', `${id} = ${f.value}`]);
      }
      if (src.type === 'ngeo-meta-derive') {
        const meta = await getJson(META_URL);
        const [a, b] = src.subtract;
        const live = fmt(pathGet(meta, a) - pathGet(meta, b), f.format);
        if (live !== f.value) return fail(`derive(${a} − ${b}) = "${live}" ≠ registry "${f.value}"`);
        return OKS.push(['A19', `${id} = ${f.value} (derived)`]);
      }
      if (src.type === 'nmiti-core-rows') {
        const csv = await getText(NMITI_CORE_URL);
        const rows = csv.split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).length - 1; // minus header
        if (String(rows) !== f.value) return fail(`nMiti core CSV has ${rows} data rows ≠ registry "${f.value}"`);
        return OKS.push(['A19', `${id} = ${f.value} (CSV rows)`]);
      }
      if (src.type === 'text-contains') {
        const text = await getText(src.url);
        if (!text.includes(src.text)) return fail(`source text "${src.text}" not found at ${src.url}`);
        return OKS.push(['A19', `${id} = ${f.value} (source text)`]);
      }
      if (src.type === 'github-commits') {
        const res = await fetch(`https://api.github.com/repos/${src.repo}/commits?per_page=1`, {
          headers: { accept: 'application/vnd.github+json' },
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) return WARNS.push(['A19', id, `GitHub API HTTP ${res.status} — verify commit count manually`]);
        const link = res.headers.get('link') || '';
        const last = /[?&]page=(\d+)>;\s*rel="last"/.exec(link);
        const count = last ? last[1] : '1';
        if (count !== f.value) return WARNS.push(['A19', id, `live ${count} commits ≠ page "${f.value}" — update the card`]);
        return OKS.push(['A19', `${id} = ${f.value} commits`]);
      }
      if (src.type === 'manual') {
        return OKS.push(['A19 (manual)', `${id}: registered — ${src.note || 'verify by hand'}`]);
      }
      return WARNS.push(['A19', id, `unknown source type "${src.type}"`]);
    } catch (e) {
      return WARNS.push(['A19', id, `source fetch failed: ${e?.message || e}`]);
    }
  };

  for (const f of registry.figures) await check(f);
}

/* ── Report ──────────────────────────────────────────────────────────── */
for (const [id, msg] of OKS) console.log(`  \x1b[32m[${id} OK]\x1b[0m ${msg}`);
for (const [id, subject, msg] of WARNS) console.log(`  \x1b[33m[${id} WARN]\x1b[0m ${subject} — ${msg}`);
for (const [id, subject, msg] of FAILS) console.log(`  \x1b[31m[${id} FAIL]\x1b[0m ${subject} — ${msg}`);
console.log(`\nLive verification: ${OKS.length} ok, ${WARNS.length} warn, ${FAILS.length} fail`);
process.exit(FAILS.length > 0 ? 1 : 0);
