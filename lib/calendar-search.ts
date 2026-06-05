import {
  FEAST_ABIY_TSOM,
  FEAST_TSOME_HAWARIAT,
  getFeast,
  getNineveh,
  MONTH_SENE,
} from 'eotc-calendar';
import * as EthiopianDate from 'ethiopian-date';

import { getDayInfo, type LiturgicalFeast } from '@/lib/eotc-liturgical-calendar';

const { toEthiopian, toGregorian } = EthiopianDate as {
  toEthiopian: (year: number, month: number, day: number) => [number, number, number];
  toGregorian: (date: [number, number, number]) => [number, number, number];
};

export type CalendarSearchGroup = 'feasts' | 'fasting';

export type CalendarSearchHit = {
  id: string;
  group: CalendarSearchGroup;
  title: string;
  subtitle: string;
  date: Date;
};

export type CalendarSearchResults = {
  feasts: CalendarSearchHit[];
  fasting: CalendarSearchHit[];
};

type EthiopianParts = { year: number; month: number; day: number };

const LENT_DAYS = 56;
const NINEVEH_FAST_DAYS = 3;
const MAX_FEAST_HITS = 24;
const MAX_FASTING_HITS = 32;
const SCAN_YEARS = 2;

type FastingPeriodDef = {
  id: string;
  label: string;
  keywords: string[];
  getRange: (ethYear: number) => { start: EthiopianParts; end: EthiopianParts };
};

const FASTING_PERIODS: FastingPeriodDef[] = [
  {
    id: 'lent',
    label: 'Great Lent (Hudadi)',
    keywords: ['lent', 'hudadi', 'abiy tsom', 'great lent', 'ጾመ አብይ'],
    getRange: (ethYear) => {
      const [month, day] = getFeast(FEAST_ABIY_TSOM, ethYear);
      const start = { year: ethYear, month, day };
      return { start, end: addEthiopianDays(start, LENT_DAYS - 1) };
    },
  },
  {
    id: 'nineveh',
    label: 'Fast of Nineveh',
    keywords: ['nineveh', 'ninevah', 'neghuse', 'neguse', 'ጾመ ነነዌ'],
    getRange: (ethYear) => {
      const [month, day] = getNineveh(ethYear);
      const start = { year: ethYear, month, day };
      return { start, end: addEthiopianDays(start, NINEVEH_FAST_DAYS - 1) };
    },
  },
  {
    id: 'apostles',
    label: 'Fast of Apostles',
    keywords: ['apostles', 'hawariyat', 'hawariy', 'tsome hawariyat', 'ጾመ ሐዋርያት'],
    getRange: (ethYear) => {
      const [month, day] = getFeast(FEAST_TSOME_HAWARIAT, ethYear);
      return {
        start: { year: ethYear, month, day },
        end: { year: ethYear, month: MONTH_SENE, day: 27 },
      };
    },
  },
  {
    id: 'mary',
    label: 'Fast of Mary (Filseta)',
    keywords: ['fast of mary', 'filseta fast', 'assumption fast', 'ጾመ ፍልሰታ'],
    getRange: (ethYear) => ({
      start: { year: ethYear, month: 12, day: 1 },
      end: { year: ethYear, month: 12, day: 15 },
    }),
  },
  {
    id: 'advent',
    label: 'Advent (Tsome Nebiyat)',
    keywords: ['advent', 'nebiyat', 'tsome nebiyat', 'ጾመ ነቢያት'],
    getRange: (ethYear) => ({
      start: { year: ethYear, month: 3, day: 15 },
      end: { year: ethYear, month: 4, day: 28 },
    }),
  },
  {
    id: 'wednesday',
    label: 'Wednesday fast',
    keywords: ['wednesday fast', 'wednesday fasting', 'wednesdays'],
    getRange: () => ({ start: { year: 0, month: 0, day: 0 }, end: { year: 0, month: 0, day: 0 } }),
  },
  {
    id: 'friday',
    label: 'Friday fast',
    keywords: ['friday fast', 'friday fasting', 'fridays'],
    getRange: () => ({ start: { year: 0, month: 0, day: 0 }, end: { year: 0, month: 0, day: 0 } }),
  },
];

function gregorianToEthiopian(date: Date): EthiopianParts {
  const [year, month, day] = toEthiopian(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
  return { year, month, day };
}

function ethiopianToDate(parts: EthiopianParts): Date {
  const [gYear, gMonth, gDay] = toGregorian([parts.year, parts.month, parts.day]);
  return new Date(gYear, gMonth - 1, gDay);
}

function addEthiopianDays(parts: EthiopianParts, days: number): EthiopianParts {
  const date = ethiopianToDate(parts);
  date.setDate(date.getDate() + days);
  return gregorianToEthiopian(date);
}

function compareEthiopian(a: EthiopianParts, b: EthiopianParts): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

function eachDateInRange(
  start: EthiopianParts,
  end: EthiopianParts,
  fromDate: Date,
  onDate: (date: Date) => void
) {
  let cursor = ethiopianToDate(start);
  const rangeEnd = ethiopianToDate(end);
  const floor = new Date(fromDate);
  floor.setHours(0, 0, 0, 0);

  while (cursor <= rangeEnd) {
    if (cursor >= floor) onDate(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
}

export function normalizeCalendarQuery(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[?!.]/g, '')
    .replace(
      /^(when is|when's|what is|what's|where is|tell me about|show me)\s+(the\s+)?/i,
      ''
    )
    .trim();
}

function formatHitDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function feastMatches(feast: LiturgicalFeast, query: string): boolean {
  if (!query) return false;
  const targets = [feast.name, feast.nameAm].map((value) => value.toLowerCase());
  const words = query.split(/\s+/).filter((word) => word.length > 1);

  return targets.some((target) => {
    if (target.includes(query)) return true;
    if (words.length === 0) return false;
    return words.every((word) => target.includes(word));
  });
}

function periodMatches(period: FastingPeriodDef, query: string): boolean {
  const haystack = [period.label, ...period.keywords].join(' ').toLowerCase();
  if (haystack.includes(query)) return true;
  const words = query.split(/\s+/).filter((word) => word.length > 1);
  if (words.length === 0) return false;
  return words.every((word) => haystack.includes(word));
}

function searchFeasts(query: string, fromDate: Date): CalendarSearchHit[] {
  const hits: CalendarSearchHit[] = [];
  const seen = new Set<string>();
  const cursor = new Date(fromDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(fromDate);
  end.setFullYear(end.getFullYear() + SCAN_YEARS);

  while (cursor <= end && hits.length < MAX_FEAST_HITS) {
    const liturgical = getDayInfo(cursor);
    for (const feast of liturgical.feasts) {
      if (!feastMatches(feast, query)) continue;
      const key = `${feast.name}-${cursor.toISOString().slice(0, 10)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({
        id: key,
        group: 'feasts',
        title: feast.name,
        subtitle: formatHitDate(cursor),
        date: new Date(cursor),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return hits;
}

function searchWeekdayFasts(
  weekday: 3 | 5,
  label: string,
  fromDate: Date
): CalendarSearchHit[] {
  const hits: CalendarSearchHit[] = [];
  const cursor = new Date(fromDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(fromDate);
  end.setDate(end.getDate() + 90);

  while (cursor <= end && hits.length < 12) {
    if (cursor.getDay() === weekday) {
      const liturgical = getDayInfo(cursor);
      if (liturgical.isFasting && liturgical.fastingReason === (weekday === 3 ? 'Wednesday' : 'Friday')) {
        hits.push({
          id: `${label}-${cursor.toISOString().slice(0, 10)}`,
          group: 'fasting',
          title: label,
          subtitle: formatHitDate(cursor),
          date: new Date(cursor),
        });
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return hits;
}

function searchFastingPeriods(query: string, fromDate: Date): CalendarSearchHit[] {
  const hits: CalendarSearchHit[] = [];
  const matched = FASTING_PERIODS.filter((period) => periodMatches(period, query));
  if (matched.length === 0) return hits;

  for (const period of matched) {
    if (period.id === 'wednesday') {
      hits.push(...searchWeekdayFasts(3, period.label, fromDate));
      continue;
    }
    if (period.id === 'friday') {
      hits.push(...searchWeekdayFasts(5, period.label, fromDate));
      continue;
    }

    const startEthYear = gregorianToEthiopian(fromDate).year;
    for (let ethYear = startEthYear; ethYear <= startEthYear + SCAN_YEARS; ethYear++) {
      const { start, end } = period.getRange(ethYear);
      if (compareEthiopian(end, start) < 0) continue;

      eachDateInRange(start, end, fromDate, (date) => {
        if (hits.length >= MAX_FASTING_HITS) return;
        const liturgical = getDayInfo(date);
        if (!liturgical.isFasting) return;
        hits.push({
          id: `${period.id}-${date.toISOString().slice(0, 10)}`,
          group: 'fasting',
          title: period.label,
          subtitle: formatHitDate(date),
          date,
        });
      });
    }
  }

  return hits
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, MAX_FASTING_HITS);
}

export function searchCalendar(query: string, fromDate = new Date()): CalendarSearchResults {
  const normalized = normalizeCalendarQuery(query.trim());
  if (!normalized) {
    return { feasts: [], fasting: [] };
  }

  const fasting = searchFastingPeriods(normalized, fromDate);
  const feasts = searchFeasts(normalized, fromDate);

  return { feasts, fasting };
}

export function hasCalendarSearchResults(results: CalendarSearchResults): boolean {
  return results.feasts.length > 0 || results.fasting.length > 0;
}
