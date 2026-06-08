/**
 * Build data/lectionary/* from assets/readings/*.pdf (EOTC annual lectionary).
 * Run: node scripts/build-lectionary-readings.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PDF_DIR = path.join(ROOT, 'assets', 'readings');
const OUT_DIR = path.join(ROOT, 'data', 'lectionary');

const MONTH_FILES = [
  { month: 1, file: 'january.pdf', exportName: 'januaryReadings' },
  { month: 2, file: 'february.pdf', exportName: 'februaryReadings' },
  { month: 3, file: 'march.pdf', exportName: 'marchReadings' },
  { month: 4, file: 'april.pdf', exportName: 'aprilReadings' },
  { month: 5, file: 'may.pdf', exportName: 'mayReadings' },
  { month: 6, file: 'june.pdf', exportName: 'juneReadings' },
  { month: 7, file: 'july.pdf', exportName: 'julyReadings' },
  { month: 8, file: 'august.pdf', exportName: 'augustReadings' },
  { month: 9, file: 'september.pdf', exportName: 'septemberReadings' },
  { month: 10, file: 'october.pdf', exportName: 'octoberReadings' },
  { month: 11, file: 'november.pdf', exportName: 'novemberReadings' },
  { month: 12, file: 'december.pdf', exportName: 'decemberReadings' },
];

const MONTH_PREFIX = {
  1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
  7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec',
};

const MONTH_NAMES = {
  1: 'january', 2: 'february', 3: 'march', 4: 'april', 5: 'may', 6: 'june',
  7: 'july', 8: 'august', 9: 'september', 10: 'october', 11: 'november', 12: 'december',
};

const GREGORIAN_MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const EXPECTED_DAYS = { 1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31 };

/** Jan 1 = Ethiopian month 4, day 22 (per annual lectionary PDFs). */
const ETH_ANCHOR = { month: 4, day: 22 };

const BOOK =
  'Ps(?:alm)?\\.?|Isa(?:iah)?|Jer(?:emiah)?|Eze(?:kiel)?|Dan(?:iel)?|Hos(?:ea)?|Joe(?:l)?|Amo(?:s)?|Oba(?:diah)?|Jon(?:ah)?|Mic(?:ah)?|Nah(?:um)?|Hab(?:akkuk)?|Zep(?:haniah)?|Hag(?:gai)?|Zec(?:hariah)?|Mal(?:achi)?|Gen(?:esis)?|Exo(?:dus)?|Ex\\b|Lev(?:iticus)?|Num(?:bers)?|Deu(?:teronomy)?|Jos(?:hua)?|Jdg(?:es)?|Rth(?:uth)?|1Sa|2Sa|1Ki|2Ki|1Ch|2Ch|1Cr|2Cr|2Kg|Ezr(?:a)?|Neh(?:emiah)?|Est(?:her)?|Job|Pro(?:verbs)?|Ecc(?:lesiastes)?|Son(?:g)?|Lam(?:entations)?|Sir(?:ach)?|Tob(?:it)?|TWS|Mat(?:thew)?|Mrk|Mark|Luk(?:e)?|Lk|Jhn|Jn|John|Act(?:s)?|Ac|Rom(?:ans)?|Rm|1Co|2Co|Gal(?:atians)?|Eph(?:esians)?|Phl|Php|Phi(?:lippians)?|Col(?:ossians)?|1Th|2Th|1Tm|2Tm|1Pt|2Pt|1Jn|2Jn|3Jn|Jud(?:e)?|Jd|Heb(?:rews)?|Hb|Rev(?:elation)?|Co|Jam|Plm|Tts|Tt|Ep|2Ts|S\\.\\s*F\\.';

const ANAPHORA_MARKER_RE = /^A-\d+(?:\/\d+)?/i;
const READING_LINE_RE = new RegExp(`^(?:\\d+\\s+)?(?:${BOOK})\\b|^A-\\d+(?:\\/\\d+)?`, 'i');
const PSALM_RE = /^Ps(?:alm)?\.?\b/i;
const GOSPEL_RE = /^(?:Mat|Mrk|Luk|Jhn|Mark|Lk|Jn|Mt)\b/i;
const ACTS_RE = /^(?:Act(?:s)?|Ac)\b/i;
const CATHOLIC_RE = /^(?:1Jn|2Jn|3Jn|1Pt|2Pt|Jud|Jam)\b/i;
const EPISTLE_RE =
  /^(?:Rom|Rm|1Cr|2Cr|Gal|Eph|Ep|Phl|Col|1Tm|2Tm|Tt|Tts|Phm|Hb|Heb|1Th|2Th|Co|1Co|2Co|2Tm|Rev)\b/i;

const EVENING_HIATUS_DATES = new Set(['1-7', '1-19']);

function preserveLine(raw) {
  return raw.replace(/\r/g, '').replace(/\s+$/g, '');
}

function isReadingLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/festal\s+hiatus/i.test(trimmed)) return false;
  if (/^\d{1,2}\s*\/\s*\d{1,2}$/.test(trimmed)) return false;
  if (ANAPHORA_MARKER_RE.test(trimmed)) return true;
  if (READING_LINE_RE.test(trimmed)) return true;
  if (/:\s*[\d]/i.test(trimmed)) return true;
  return false;
}

function isAnaphoraLine(line) {
  const trimmed = line.trimStart();
  return /^\d+\s+\S/.test(trimmed) || ANAPHORA_MARKER_RE.test(trimmed);
}

function splitAnaphoraMarkerLine(line) {
  const trimmed = line.trim();
  const aMarker = trimmed.match(/^A-(\d+(?:\/\d+)?)(?:\s+(.+))?$/i);
  if (aMarker) return { marker: aMarker[1], eveningLead: aMarker[2]?.trim() || null };

  const numbered = trimmed.match(/^(\d{1,2})\s+(.+)$/);
  if (numbered) return { marker: numbered[1], eveningLead: numbered[2] };

  const numberedOnly = trimmed.match(/^(\d{1,2})$/);
  if (numberedOnly) return { marker: numberedOnly[1], eveningLead: null };

  return { marker: trimmed.replace(/^A-/i, ''), eveningLead: null };
}

function applyAnaphoraSplit(anaphoraLines, evening) {
  const anaphora = [];
  const eveningLeads = [];
  for (const line of anaphoraLines) {
    const { marker, eveningLead } = splitAnaphoraMarkerLine(line);
    anaphora.push(marker);
    if (eveningLead) eveningLeads.push(eveningLead);
  }
  return { anaphora, evening: [...eveningLeads, ...evening] };
}

function extractReadingLines(block) {
  const readings = [];
  let hiatus = false;
  let morningHiatus = false;
  let readingCountBeforeHiatus = 0;
  let inlineAna = null;

  for (const raw of block.split(/\n/)) {
    const line = preserveLine(raw);
    if (!line.trim()) continue;

    const trimmed = line.trim();
    const anaOnly = trimmed.match(/^(\d{1,2})$/);
    if (anaOnly) {
      inlineAna = Number(anaOnly[1]);
      continue;
    }

    const anaHiatus = trimmed.match(/^(\d{1,2})\s+festal\s+hiatus\s*$/i);
    if (anaHiatus) {
      inlineAna = Number(anaHiatus[1]);
      hiatus = true;
      morningHiatus = readingCountBeforeHiatus <= 3;
      continue;
    }

    if (/festal\s+hiatus/i.test(line)) {
      hiatus = true;
      morningHiatus = readingCountBeforeHiatus <= 3;
      continue;
    }

    if (isReadingLine(line)) {
      readingCountBeforeHiatus++;
      readings.push(line);
    }
  }

  return { readings, hiatus, morningHiatus, inlineAna };
}

function findAnaIndex(readings) {
  return readings.findIndex((line) => {
    const trimmed = line.trim();
    return ANAPHORA_MARKER_RE.test(trimmed) || /^\d{1,2}$/.test(trimmed) || isAnaphoraLine(line);
  });
}

function splitFourColumns(readings, inlineAna = null) {
  if (readings.length === 0) {
    return {
      morning: [],
      liturgical: [],
      anaphora: inlineAna != null ? [String(inlineAna)] : [],
      evening: [],
    };
  }

  const aMarkerIndex = readings.findIndex((line) => ANAPHORA_MARKER_RE.test(line.trim()));
  if (aMarkerIndex >= 0) {
    const before = readings.slice(0, aMarkerIndex);
    const { marker, eveningLead } = splitAnaphoraMarkerLine(readings[aMarkerIndex]);
    const evening = [...(eveningLead ? [eveningLead] : []), ...readings.slice(aMarkerIndex + 1)];
    return {
      morning: before.slice(0, 3),
      liturgical: before.slice(3),
      anaphora: [marker],
      evening,
    };
  }

  const anaIndex = findAnaIndex(readings.slice(3));
  if (anaIndex >= 0) {
    const splitAt = 3 + anaIndex;
    const { marker, eveningLead } = splitAnaphoraMarkerLine(readings[splitAt]);
    const evening = [...(eveningLead ? [eveningLead] : []), ...readings.slice(splitAt + 1)];
    return {
      morning: readings.slice(0, 3),
      liturgical: readings.slice(3, splitAt),
      anaphora: [marker],
      evening,
    };
  }

  if (inlineAna != null) {
    const morning = readings.slice(0, Math.min(3, readings.length));
    const body = readings.slice(3);
    if (body.length > 5) {
      return {
        morning,
        liturgical: body.slice(0, -3),
        anaphora: [String(inlineAna)],
        evening: body.slice(-3),
      };
    }
    return { morning, liturgical: body, anaphora: [String(inlineAna)], evening: [] };
  }

  const morning = readings.slice(0, Math.min(3, readings.length));
  let rest = readings.slice(3);
  if (rest.length === 0) return { morning, liturgical: [], anaphora: [], evening: [] };

  let evening = rest.length >= 3 ? rest.slice(-3) : rest;
  rest = rest.length >= 3 ? rest.slice(0, -3) : [];

  const liturgical = [];
  const anaphoraRaw = [];
  for (const line of rest) {
    if (isAnaphoraLine(line)) anaphoraRaw.push(line);
    else liturgical.push(line);
  }

  if (anaphoraRaw.length === 0 && evening.length > 0 && isAnaphoraLine(evening[0])) {
    anaphoraRaw.push(evening[0]);
    evening = evening.slice(1);
  }

  const split = applyAnaphoraSplit(anaphoraRaw, evening);
  return { morning, liturgical, anaphora: split.anaphora, evening: split.evening };
}

function extractSections(block) {
  const { readings, hiatus, morningHiatus, inlineAna } = extractReadingLines(block);
  const sections = splitFourColumns(readings, inlineAna);
  return { ...sections, hiatus, morningHiatus };
}

function parseQidase(liturgical) {
  const qidase = {};
  const unknown = [];

  for (const raw of liturgical) {
    const line = raw.trim();
    if (/festal\s+hiatus/i.test(line)) continue;
    if (PSALM_RE.test(line)) qidase.psalm = line;
    else if (GOSPEL_RE.test(line)) qidase.gospel = line;
    else if (ACTS_RE.test(line)) qidase.acts = line;
    else if (CATHOLIC_RE.test(line)) qidase.catholicEpistle = line;
    else if (EPISTLE_RE.test(line)) qidase.epistle = line;
    else unknown.push(line);
  }

  for (const line of unknown) {
    if (!qidase.epistle) qidase.epistle = line;
    else if (!qidase.catholicEpistle) qidase.catholicEpistle = line;
    else if (!qidase.acts) qidase.acts = line;
    else if (!qidase.psalm) qidase.psalm = line;
    else if (!qidase.gospel) qidase.gospel = line;
  }

  if (!qidase.psalm) qidase.psalm = 'UNCLEAR - please verify';
  if (!qidase.gospel) qidase.gospel = 'UNCLEAR - please verify';

  return qidase;
}

function parseAna(anaphora) {
  if (!anaphora?.length) return null;
  const raw = String(anaphora[0]).replace(/^A-/i, '');
  const slash = raw.split('/')[0];
  const n = Number.parseInt(slash, 10);
  return Number.isFinite(n) ? n : null;
}

function gregorianDayOfYear(month, day) {
  let n = day - 1;
  for (let m = 1; m < month; m++) n += GREGORIAN_MONTH_DAYS[m - 1];
  return n;
}

function computeEthiopianDate(month, day) {
  const offset = gregorianDayOfYear(month, day);
  let ethMonth = ETH_ANCHOR.month;
  let ethDay = ETH_ANCHOR.day + offset;

  while (ethDay > 30) {
    ethDay -= 30;
    ethMonth += 1;
    if (ethMonth > 13) ethMonth = 1;
  }

  return `${ethMonth}/${ethDay}`;
}

function parseEthiopianFromBlock(block) {
  const match = block.match(/(?:^|\n)\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*(?:\r?\n|$)/);
  if (!match) return null;
  const ethMonth = Number(match[1]);
  const ethDay = Number(match[2]);
  if (ethMonth < 1 || ethMonth > 13 || ethDay < 1 || ethDay > 30) return null;
  return `${ethMonth}/${ethDay}`;
}

function toDayReadings(month, day, block) {
  const { morning, liturgical, anaphora, evening, hiatus, morningHiatus } = extractSections(block);
  const qidase = parseQidase(liturgical);

  let morningOut = [...morning];
  if (morningHiatus && !morningOut.includes('Festal hiatus')) {
    morningOut = ['Festal hiatus', ...morningOut];
  }

  let eveningOut = [...evening];
  const dateKey = `${month}-${day}`;
  if (EVENING_HIATUS_DATES.has(dateKey)) {
    eveningOut = ['Festal hiatus'];
  } else if (hiatus && !morningHiatus && eveningOut.length === 0) {
    eveningOut = ['Festal hiatus'];
  }

  const ethFromPdf = parseEthiopianFromBlock(block);

  return {
    gregorianMonth: month,
    gregorianDay: day,
    gregorianDate: `${MONTH_PREFIX[month]} ${day}`,
    ethiopianDate: ethFromPdf ?? computeEthiopianDate(month, day),
    morning: morningOut,
    qidase,
    evening: eveningOut,
    ana: parseAna(anaphora),
  };
}

function parseDayBlock(month, day, block) {
  return toDayReadings(month, day, block);
}

function parseMonthText(month, text) {
  const prefix = MONTH_PREFIX[month];
  const days = {};
  const namedRegex = new RegExp(`\\b${prefix}\\s+(\\d{1,2})\\b`, 'gi');
  const namedMatches = [...text.matchAll(namedRegex)];

  if (namedMatches.length > 0) {
    for (let i = 0; i < namedMatches.length; i++) {
      const day = Number(namedMatches[i][1]);
      if (day < 1 || day > 31) continue;
      const start = namedMatches[i].index + namedMatches[i][0].length;
      const end = i + 1 < namedMatches.length ? namedMatches[i + 1].index : text.length;
      days[day] = parseDayBlock(month, day, text.slice(start, end));
    }
    return days;
  }

  const numericRegex = /(?:^|\n)\s*(\d{1,2})\s*\r?\n\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*\r?\n/g;
  const numericMatches = [...text.matchAll(numericRegex)];
  for (let i = 0; i < numericMatches.length; i++) {
    const day = Number(numericMatches[i][1]);
    if (day < 1 || day > 31) continue;
    const start = numericMatches[i].index + numericMatches[i][0].length;
    const end = i + 1 < numericMatches.length ? numericMatches[i + 1].index : text.length;
    days[day] = parseDayBlock(month, day, text.slice(start, end));
  }
  return days;
}

function parseCompactMonthText(month, text) {
  const days = {};
  const bodyStart = text.search(/\bDay\b/i);
  const body = bodyStart >= 0 ? text.slice(bodyStart) : text;
  const dayStartRegex = /(?:^|\n)\s*(\d{1,2})\s*\r?\n(?=[A-Za-z])/g;
  const matches = [...body.matchAll(dayStartRegex)];

  for (let i = 0; i < matches.length; i++) {
    const day = Number(matches[i][1]);
    if (day < 1 || day > 31) continue;
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : body.length;
    days[day] = parseDayBlock(month, day, body.slice(start, end));
  }
  return days;
}

async function loadPdfText(filePath) {
  const parsed = await pdf(fs.readFileSync(filePath));
  return parsed.text ?? '';
}

function serializeQidase(q) {
  const parts = [];
  if (q.epistle) parts.push(`epistle: ${JSON.stringify(q.epistle)}`);
  if (q.catholicEpistle) parts.push(`catholicEpistle: ${JSON.stringify(q.catholicEpistle)}`);
  if (q.acts) parts.push(`acts: ${JSON.stringify(q.acts)}`);
  parts.push(`psalm: ${JSON.stringify(q.psalm)}`);
  parts.push(`gospel: ${JSON.stringify(q.gospel)}`);
  return `{\n      ${parts.join(',\n      ')}\n    }`;
}

function emitMonthFile(exportName, readings) {
  const entries = readings
    .map(
      (day) => `  {
    gregorianMonth: ${day.gregorianMonth},
    gregorianDay: ${day.gregorianDay},
    gregorianDate: ${JSON.stringify(day.gregorianDate)},
    ethiopianDate: ${JSON.stringify(day.ethiopianDate)},
    morning: ${JSON.stringify(day.morning)},
    qidase: ${serializeQidase(day.qidase)},
    evening: ${JSON.stringify(day.evening)},
    ana: ${day.ana == null ? 'null' : day.ana},
  }`
    )
    .join(',\n');

  return `/** Auto-generated by scripts/build-lectionary-readings.mjs — do not edit by hand. */
import type { DayReadings } from './types';

export const ${exportName}: DayReadings[] = [
${entries}
];
`;
}

function emitIndex(monthExports) {
  const imports = monthExports
    .map(({ exportName, monthName }) => `import { ${exportName} } from './${monthName}';`)
    .join('\n');
  const spreads = monthExports.map(({ exportName }) => `  ...${exportName},`).join('\n');

  return `/** Auto-generated by scripts/build-lectionary-readings.mjs — do not edit by hand. */
import type { DayReadings } from './types';
${imports}

export const allReadings: DayReadings[] = [
${spreads}
];

export function getTodayReadings(): DayReadings | undefined {
  const today = new Date();
  return getReadingsByDate(today.getMonth() + 1, today.getDate());
}

export function getReadingsByDate(month: number, day: number): DayReadings | undefined {
  return allReadings.find((r) => r.gregorianMonth === month && r.gregorianDay === day);
}

export function getReadingsByEthiopianDate(ethiopianDate: string): DayReadings | undefined {
  return allReadings.find((r) => r.ethiopianDate === ethiopianDate);
}

export type { DayReadings, QidaseReadings, ScriptureRef } from './types';
`;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const monthExports = [];
  let total = 0;

  for (const { month, file, exportName } of MONTH_FILES) {
    const pdfPath = path.join(PDF_DIR, file);
    if (!fs.existsSync(pdfPath)) throw new Error(`Missing PDF: ${pdfPath}`);

    const text = await loadPdfText(pdfPath);
    let parsed = parseMonthText(month, text);
    if (Object.keys(parsed).length === 0) parsed = parseCompactMonthText(month, text);

    let readings = Object.keys(parsed)
      .map(Number)
      .sort((a, b) => a - b)
      .map((day) => parsed[day]);

    if (month === 2 && readings.length > 28) {
      readings = readings.filter((r) => r.gregorianDay <= 28);
    }

    const monthName = MONTH_NAMES[month];
    const outPath = path.join(OUT_DIR, `${monthName}.ts`);
    fs.writeFileSync(outPath, emitMonthFile(exportName, readings), 'utf8');

    console.log(`Month ${month} (${monthName}): ${readings.length} days (expected ${EXPECTED_DAYS[month]})`);
    if (readings.length !== EXPECTED_DAYS[month]) {
      console.warn(`  ⚠ Day count mismatch for ${monthName}`);
    }
    total += readings.length;
    monthExports.push({ exportName, monthName });
  }

  fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), emitIndex(monthExports), 'utf8');
  console.log(`\nWrote ${total} total day entries → data/lectionary/`);
  if (total !== 365) console.warn(`Expected 365 entries, got ${total}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
