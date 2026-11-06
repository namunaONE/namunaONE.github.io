import { readFileSync } from 'node:fs';
for (const f of ['index.html', '404.html']) {
  const lines = readFileSync(f, 'utf8').split('\n');
  lines.forEach((l, i) => {
    const t = l.trim();
    if (t.includes("'") && !/(href=|class=|id=|data-|aria-|rel=|content=|name=|src=|<script|<style|<link)/i.test(t)) {
      console.log(f + ':' + (i+1) + ': ' + t.slice(0, 140));
    }
  });
}