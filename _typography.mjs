import { readFileSync } from 'node:fs';
const files = ['index.html', '404.html'];

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const lines = src.split('\n');
  console.log('=== ' + f + ' ===');
  lines.forEach((line, i) => {
    if (line.includes("\\'") || line.includes('&quot;')) return; // skip escapes
    if (/'[A-Za-z]/.test(line) && /(\w's|\w're|\w't|sources'|\w've|\w'll)\b/.test(line)) {
      console.log((i+1).toString().padStart(4) + ' AP: ' + line.trim().slice(0, 130));
    }
    if (/"/.test(line) && !line.includes('"')) {
      // straight double quotes in copy (excluding attr values where only one " appears)
      const copyQuotes = [...line.matchAll(/(?<=^|>)[^<]*?"[^<]*?"(?![a-zA-Z])/g)];
      // simpler: flag lines with both "..." display pairs in visible text
      if (/>\s*[^<>]*"[^<>]*"[^<>]*</.test(line)) console.log((i+1).toString().padStart(4) + ' DQ: ' + line.trim().slice(0, 130));
    }
  });
  // also check for straight double quotes in text nodes simply
  lines.forEach((line, i) => {
    const matches = line.match(/>([^<]*)"([^<]*)"/g);
    if (matches) {
      for (const m of matches) console.log((i+1).toString().padStart(4) + ' SQ: ' + m.slice(0, 130));
    }
  });
}