import { readFileSync } from 'node:fs';
const files = ['index.html', '404.html'];
const pats = [
  { id: 'A', re: /\.\.\./ },
  { id: 'ellipsis', re: /…/ },
  { id: 'aria-label', re: /aria-label/ },
  { id: 'nav-toggle', re: /nav-toggle/ },
  { id: 'target_blank', re: /target="_blank"/ },
  { id: 'link', re: /<link rel/i },
  { id: 'scroll-margin', re: /scroll-margin/i },
  { id: 'touch-action', re: /touch-action/i },
  { id: 'overscroll', re: /overscroll-behavior/i },
];
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const lines = src.split('\n');
  console.log('=== ' + f + ' ===');
  lines.forEach((line, i) => {
    for (const { id, re } of pats) {
      if (re.test(line)) console.log(`${(i+1).toString().padStart(4)} [${id}] ${line.trim().slice(0, 140)}`);
    }
  });
}