import { readFileSync } from 'node:fs';
const content = readFileSync('index.html', 'utf8');
for (const phrase of ["Today's", "Today’s", "Nepal's", "Nepal’s", 'nMiti today\'s', "'"]) {
  const count = content.split(phrase).length - 1;
  console.log("'" + phrase.replace(/'/g, "\\'") + "' →", count);
}
const pats = [/[A-Za-z]+'[A-Za-z]/g];
for (const p of pats) {
  const m = content.match(p);
  if (m) console.log('matches:', m.length, [...new Set(m)]);
}