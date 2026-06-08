import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(ROOT, 'data', 'lectionary');

let total = 0;
let unclear = 0;

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.ts') && x !== 'types.ts' && x !== 'index.ts')) {
  const t = fs.readFileSync(path.join(dir, f), 'utf8');
  const days = (t.match(/gregorianDay:/g) || []).length;
  const u = (t.match(/UNCLEAR/g) || []).length;
  total += days;
  unclear += u;
  if (u > 0) console.log(`${f}: ${days} days, ${u} UNCLEAR`);
}

const expected = { january: 31, february: 28, march: 31, april: 30, may: 31, june: 30, july: 31, august: 31, september: 30, october: 31, november: 30, december: 31 };

for (const [month, count] of Object.entries(expected)) {
  const t = fs.readFileSync(path.join(dir, `${month}.ts`), 'utf8');
  const days = (t.match(/gregorianDay:/g) || []).length;
  if (days !== count) console.warn(`  ⚠ ${month}: expected ${count}, got ${days}`);
}

console.log(`\nTotal days: ${total} (expected 365)`);
console.log(`UNCLEAR markers: ${unclear}`);

const { getTodayReadings, getReadingsByDate, allReadings } = await import('../data/lectionary/index.ts');

const jan7 = getReadingsByDate(1, 7);
const jan19 = getReadingsByDate(1, 19);
console.log(`Jan 7 evening: ${JSON.stringify(jan7?.evening)}`);
console.log(`Jan 19 evening: ${JSON.stringify(jan19?.evening)}`);
console.log(`Today (${new Date().toDateString()}): ${getTodayReadings()?.gregorianDate ?? 'NOT FOUND'}`);
console.log(`All have psalm+gospel: ${allReadings.every((r) => r.qidase.psalm && r.qidase.gospel)}`);
