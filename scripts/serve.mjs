/* scripts/serve.mjs — minimal dependency-free static server for CI and local checks.
   Serves the repository root so the Lighthouse budget and a11y checks can crawl
   the site. Replacement for the former local-only _serve.mjs scratch file that
   CI could never see (see .hallmark/log.json, infra/serve-fix).
   Usage: node scripts/serve.mjs [port]   (default 4174)
   Prints "Preview on http://localhost:<port>" when ready (lighthouserc ready pattern). */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = process.cwd();
const PORT = Number(process.argv[2] || process.env.PORT || 4174);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json'
};

const server = createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = resolve(join(ROOT, normalize(urlPath)));
  if (!filePath.startsWith(ROOT) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('404 — not in the dataset');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream' });
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log('Preview on http://localhost:' + PORT);
});
