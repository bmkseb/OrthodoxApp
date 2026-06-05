/**
 * Build annual morning / qidase / anaphora / evening readings from
 * https://www.ethiopianorthodox.org/calendar.html
 *
 * Preserves punctuation and spacing from the source PDFs (colons, commas, etc.).
 *
 * Run: node scripts/build-eotc-lectionary.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'data', 'eotcAnnualLectionary.ts');
const CACHE_DIR = path.join(__dirname, '.eotc-lectionary-cache');

const SOURCE_PAGE = 'https://www.ethiopianorthodox.org/calendar.html';

const MONTH_PDFS = [
  { month: 1, url: 'https://www.ethiopianorthodox.org/annualreadings/januaryreadings.pdf' },
  { month: 2, url: 'https://www.ethiopianorthodox.org/annualreadings/februaryreading.pdf' },
  { month: 3, url: 'https://www.ethiopianorthodox.org/annualreadings/marchcalendar.pdf' },
  { month: 4, url: 'https://www.ethiopianorthodox.org/annualreadings/april.pdf' },
  { month: 5, url: 'https://www.ethiopianorthodox.org/annualreadings/mayreadings.pdf' },
  { month: 6, url: 'https://www.ethiopianorthodox.org/annualreadings/junereadings.pdf' },
  { month: 7, url: 'https://www.ethiopianorthodox.org/annualreadings/july.pdf' },
  { month: 8, url: 'https://www.ethiopianorthodox.org/annualreadings/augustreadings.pdf' },
  { month: 9, url: 'https://www.ethiopianorthodox.org/annualreadings/septemberreadin.pdf' },
  { month: 10, url: 'https://www.ethiopianorthodox.org/annualreadings/octoberreading.pdf' },
  { month: 11, url: 'https://www.ethiopianorthodox.org/annualreadings/novemberreading.pdf' },
  { month: 12, url: 'https://www.ethiopianorthodox.org/annualreadings/decemberreading.pdf' },
];

const MONTH_PREFIX = {
  1: 'Jan',
  2: 'Feb',
  3: 'Mar',
  4: 'Apr',
  5: 'May',
  6: 'Jun',
  7: 'Jul',
  8: 'Aug',
  9: 'Sep',
  10: 'Oct',
  11: 'Nov',
  12: 'Dec',
};

const BOOK =
  'Ps(?:alm)?\\.?|Isa(?:iah)?|Jer(?:emiah)?|Eze(?:kiel)?|Dan(?:iel)?|Hos(?:ea)?|Joe(?:l)?|Amo(?:s)?|Oba(?:diah)?|Jon(?:ah)?|Mic(?:ah)?|Nah(?:um)?|Hab(?:akkuk)?|Zep(?:haniah)?|Hag(?:gai)?|Zec(?:hariah)?|Mal(?:achi)?|Gen(?:esis)?|Exo(?:dus)?|Lev(?:iticus)?|Num(?:bers)?|Deu(?:teronomy)?|Jos(?:hua)?|Jdg(?:es)?|Rut(?:h)?|1Sa|2Sa|1Ki|2Ki|1Ch|2Ch|1Cr|2Cr|2Kg|Ezr(?:a)?|Neh(?:emiah)?|Est(?:her)?|Job|Pro(?:verbs)?|Ecc(?:lesiastes)?|Son(?:g)?|Lam(?:entations)?|Sir(?:ach)?|Tob(?:it)?|TWS|Mat(?:thew)?|Mrk|Mark|Luk(?:e)?|Lk|Jhn|Jn|John|Act(?:s)?|Ac|Rom(?:ans)?|Rm|1Co|2Co|Gal(?:atians)?|Eph(?:esians)?|Phl|Php|Phi(?:lippians)?|Col(?:ossians)?|1Th|2Th|1Tm|2Tm|1Pt|2Pt|1Jn|2Jn|3Jn|Jud(?:e)?|Jd|Heb(?:rews)?|Hb|Rev(?:elation)?|Co|Jam|Plm|Tts|Tt|Ep|2Ts|S\\.\\s*F\\.';

const ANAPHORA_MARKER_RE = /^A-\d+(?:\/\d+)?/i;

const READING_LINE_RE = new RegExp(
  `^(?:\\d+\\s+)?(?:${BOOK})\\b|^A-\\d+(?:\\/\\d+)?`,
  'i'
);

/** Trim line ends only — keep internal colons, commas, and spacing. */
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

/**
 * Ana column is only the anaphora number (e.g. 4, 14, A-10).
 * Any scripture on the same line belongs in Evening.
 */
function splitAnaphoraMarkerLine(line) {
  const trimmed = line.trim();

  const aMarker = trimmed.match(/^A-(\d+(?:\/\d+)?)(?:\s+(.+))?$/i);
  if (aMarker) {
    return { marker: aMarker[1], eveningLead: aMarker[2]?.trim() || null };
  }

  const numbered = trimmed.match(/^(\d{1,2})\s+(.+)$/);
  if (numbered) {
    return { marker: numbered[1], eveningLead: numbered[2] };
  }

  const numberedOnly = trimmed.match(/^(\d{1,2})$/);
  if (numberedOnly) {
    return { marker: numberedOnly[1], eveningLead: null };
  }

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

  return {
    anaphora,
    evening: [...eveningLeads, ...evening],
  };
}

function extractReadingLines(block) {
  const readings = [];
  let hiatus = false;

  for (const raw of block.split(/\n/)) {
    const line = preserveLine(raw);
    if (!line.trim()) continue;
    if (/festal\s+hiatus/i.test(line)) {
      hiatus = true;
      continue;
    }
    if (isReadingLine(line)) {
      readings.push(line);
    }
  }

  return { readings, hiatus };
}

function splitFourColumns(readings) {
  if (readings.length === 0) {
    return { morning: [], liturgical: [], anaphora: [], evening: [] };
  }

  const aMarkerIndex = readings.findIndex((line) => ANAPHORA_MARKER_RE.test(line.trim()));
  if (aMarkerIndex >= 0) {
    const before = readings.slice(0, aMarkerIndex);
    const { marker, eveningLead } = splitAnaphoraMarkerLine(readings[aMarkerIndex]);
    const evening = [
      ...(eveningLead ? [eveningLead] : []),
      ...readings.slice(aMarkerIndex + 1),
    ];
    return {
      morning: before.slice(0, 3),
      liturgical: before.slice(3),
      anaphora: [marker],
      evening,
    };
  }

  const morning = readings.slice(0, Math.min(3, readings.length));
  let rest = readings.slice(3);

  if (rest.length === 0) {
    return { morning, liturgical: [], anaphora: [], evening: [] };
  }

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
  return {
    morning,
    liturgical,
    anaphora: split.anaphora,
    evening: split.evening,
  };
}

function extractSections(block) {
  const { readings, hiatus } = extractReadingLines(block);
  const sections = splitFourColumns(readings);
  return { ...sections, hiatus };
}

function parseDayBlock(month, day, ethMonth, ethDay, block) {
  const { morning, liturgical, anaphora, evening, hiatus } = extractSections(block);
  return {
    key: `${month}-${day}`,
    gregorianMonth: month,
    gregorianDay: day,
    ethiopianMonth: ethMonth,
    ethiopianDay: ethDay,
    morning,
    liturgical,
    anaphora,
    evening,
    ...(hiatus ? { hiatus: true } : {}),
  };
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
      const block = text.slice(start, end);
      const ethMatch = block.match(/\b(\d{1,2})\s*\/\s*(\d{1,2})\b/);
      const parsed = parseDayBlock(
        month,
        day,
        ethMatch ? Number(ethMatch[1]) : null,
        ethMatch ? Number(ethMatch[2]) : null,
        block
      );
      days[parsed.key] = parsed;
    }
    return days;
  }

  const numericRegex = /(?:^|\n)\s*(\d{1,2})\s*\r?\n\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*\r?\n/g;
  const numericMatches = [...text.matchAll(numericRegex)];

  for (let i = 0; i < numericMatches.length; i++) {
    const day = Number(numericMatches[i][1]);
    if (day < 1 || day > 31) continue;

    const ethMonth = Number(numericMatches[i][2]);
    const ethDay = Number(numericMatches[i][3]);
    const start = numericMatches[i].index + numericMatches[i][0].length;
    const end = i + 1 < numericMatches.length ? numericMatches[i + 1].index : text.length;
    const block = text.slice(start, end);

    days[`${month}-${day}`] = parseDayBlock(month, day, ethMonth, ethDay, block);
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
    const block = body.slice(start, end);
    const ethMatch = block.match(/\bA-(\d{1,2})\b/);
    days[`${month}-${day}`] = parseDayBlock(
      month,
      day,
      ethMatch ? Number(ethMatch[1]) : null,
      day,
      block
    );
  }

  return days;
}

async function loadPdfText(month, url) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const cachePath = path.join(CACHE_DIR, `month-${month}.pdf`);

  if (!fs.existsSync(cachePath)) {
    console.log(`Downloading month ${month}…`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
    fs.writeFileSync(cachePath, Buffer.from(await res.arrayBuffer()));
  }

  const parsed = await pdf(fs.readFileSync(cachePath));
  return parsed.text ?? '';
}

function emitTs(allDays) {
  const entries = Object.entries(allDays).sort(([a], [b]) => {
    const [am, ad] = a.split('-').map(Number);
    const [bm, bd] = b.split('-').map(Number);
    return am === bm ? ad - bd : am - bm;
  });

  const lines = entries.map(([key, day]) => {
    const fields = [
      `gregorianMonth: ${day.gregorianMonth}`,
      `gregorianDay: ${day.gregorianDay}`,
      day.ethiopianMonth != null ? `ethiopianMonth: ${day.ethiopianMonth}` : null,
      day.ethiopianDay != null ? `ethiopianDay: ${day.ethiopianDay}` : null,
      day.hiatus ? `hiatus: true` : null,
      `morning: ${JSON.stringify(day.morning)}`,
      `liturgical: ${JSON.stringify(day.liturgical)}`,
      `anaphora: ${JSON.stringify(day.anaphora)}`,
      `evening: ${JSON.stringify(day.evening)}`,
    ].filter(Boolean);

    return `  '${key}': { ${fields.join(', ')} },`;
  });

  return `/** Auto-generated by scripts/build-eotc-lectionary.mjs — do not edit by hand. */
/** Source: ${SOURCE_PAGE} */

export type LectionaryRefs = {
  morning: string[];
  /** Qidase (ቅዳሴ) */
  liturgical: string[];
  /** Anaphora (አናብራ) — numbered in the annual calendar (e.g. 4–14). */
  anaphora: string[];
  evening: string[];
};

export const EOTC_LECTIONARY_SOURCE_URL = '${SOURCE_PAGE}';

export type EotcDayLectionary = LectionaryRefs & {
  gregorianMonth: number;
  gregorianDay: number;
  ethiopianMonth?: number;
  ethiopianDay?: number;
  hiatus?: boolean;
};

/** Keys are \`gregorianMonth-gregorianDay\` (e.g. \`9-11\` = 11 September). */
export const EOTC_ANNUAL_LECTIONARY: Record<string, EotcDayLectionary> = {
${lines.join('\n')}
};

const EMPTY: LectionaryRefs = { morning: [], liturgical: [], anaphora: [], evening: [] };

export function getEotcLectionaryForDate(
  _year: number,
  month: number,
  day: number
): LectionaryRefs & { ethiopianMonth?: number; ethiopianDay?: number; hiatus?: boolean } {
  const entry = EOTC_ANNUAL_LECTIONARY[\`\${month + 1}-\${day}\`];
  if (!entry) return { ...EMPTY };
  return {
    morning: [...entry.morning],
    liturgical: [...entry.liturgical],
    anaphora: [...entry.anaphora],
    evening: [...entry.evening],
    ethiopianMonth: entry.ethiopianMonth,
    ethiopianDay: entry.ethiopianDay,
    hiatus: entry.hiatus,
  };
}
`;
}

async function main() {
  const allDays = {};

  for (const { month, url } of MONTH_PDFS) {
    const text = await loadPdfText(month, url);
    let parsed = parseMonthText(month, text);
    if (Object.keys(parsed).length === 0) {
      parsed = parseCompactMonthText(month, text);
    }
    console.log(`Month ${month}: ${Object.keys(parsed).length} days`);
    Object.assign(allDays, parsed);
  }

  const bookInAnaphora = new RegExp(`\\b(?:${BOOK})\\b`, 'i');
  let warnings = 0;
  for (const [key, day] of Object.entries(allDays)) {
    for (const entry of day.anaphora) {
      const afterMarker = entry.replace(/^A-\d+(?:\/\d+)?\s*/i, '').trim();
      if (afterMarker && bookInAnaphora.test(afterMarker)) {
        console.warn(`  ⚠ ${key}: anaphora still contains reading text → "${entry}"`);
        warnings++;
      }
    }
  }

  fs.writeFileSync(OUT_FILE, emitTs(allDays), 'utf8');
  console.log(`Wrote ${Object.keys(allDays).length} day entries → ${OUT_FILE}`);
  if (warnings > 0) console.warn(`${warnings} anaphora entries may need review.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
