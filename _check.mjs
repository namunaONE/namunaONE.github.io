import { readFileSync } from 'node:fs';
const lines = readFileSync('index.html','utf8').split('\n');
lines.forEach((l, i) => {
  if (/na-MU-naa/.test(l)) console.log((i+1) + ': ' + l.trim());
  if (l.includes('id="footer-year"')) console.log((i+1) + ': ' + l.trim());
});