export type CalendarEventType = 'feast' | 'fast' | 'marian' | 'saint' | 'major_feast' | 'lectionary';

import {
  EOTC_LECTIONARY_SOURCE_URL,
  getEotcLectionaryForDate,
  type LectionaryRefs,
} from '@/data/eotcAnnualLectionary';
import {
  getDayInfo as getLiturgicalDayInfo,
  type FeastType,
  type LiturgicalFeast,
  isCurrentlyFasting,
} from '@/lib/eotc-liturgical-calendar';

export type { LectionaryRefs };
export { EOTC_LECTIONARY_SOURCE_URL };

export type CalendarEvent = {
  month: number;
  day: number;
  nameEn: string;
  nameGeez: string;
  type: CalendarEventType;
  isMajor?: boolean;
  saint?: string;
  lectionary?: LectionaryRefs;
};

export type FastingPeriod = {
  id: string;
  nameEn: string;
  nameGeez: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
};

export type CalendarFilter = 'all' | 'feasts' | 'fasts' | 'saints' | 'marian' | 'lectionary';

export const FASTING_PERIODS: FastingPeriod[] = [
  {
    id: 'tsome-nebiyat',
    nameEn: 'Tsome Nebiyat (Advent)',
    nameGeez: 'ጾመ ነቢያት',
    startMonth: 10,
    startDay: 25,
    endMonth: 0,
    endDay: 6,
  },
  {
    id: 'hudadi',
    nameEn: 'Hudadi (Great Lent)',
    nameGeez: 'ሁዳዴ',
    startMonth: 1,
    startDay: 24,
    endMonth: 3,
    endDay: 10,
  },
  {
    id: 'tsome-hawariyat',
    nameEn: 'Tsome Hawariyat (Apostles)',
    nameGeez: 'ጾመ ሐዋርያት',
    startMonth: 4,
    startDay: 20,
    endMonth: 6,
    endDay: 11,
  },
  {
    id: 'filseta',
    nameEn: 'Filseta (Assumption Fast)',
    nameGeez: 'ፍልሰታ',
    startMonth: 7,
    startDay: 7,
    endMonth: 7,
    endDay: 16,
  },
];

/** Curated lectionary overrides for major national feasts (Gregorian dates vary slightly by year). */
const FEAST_LECTIONARY_OVERRIDES: Record<string, LectionaryRefs> = {
  'Christmas (Genna)': {
    morning: ['Isaiah 9', 'Hebrews 1', 'Matthew 1'],
    liturgical: ['Luke 2', 'Titus 2'],
    anaphora: [],
    evening: ['Micah 5', 'Galatians 4', 'John 1'],
  },
  'Epiphany (Timket)': {
    morning: ['Isaiah 43', 'Acts 10', 'Mark 1'],
    liturgical: ['Matthew 3', 'Romans 6'],
    anaphora: [],
    evening: ['Isaiah 12', '1 John 5', 'John 3'],
  },
  'Meskel (Finding of the True Cross)': {
    morning: ['John 3', 'Philippians 2'],
    liturgical: ['Matthew 16', '1 Corinthians 1'],
    anaphora: [],
    evening: ['Galatians 6', 'Mark 8'],
  },
  'Fasika (Easter)': {
    morning: ['Acts 10', 'Romans 6', 'Mark 16'],
    liturgical: ['1 Corinthians 15', 'John 20'],
    anaphora: [],
    evening: ['Isaiah 25', 'Colossians 3', 'Luke 24'],
  },
};

const SAINTS_BY_DAY: Record<number, string> = {
  1: 'St. Basil the Great',
  2: 'St. Gregory the Theologian',
  3: 'St. John Chrysostom',
  4: 'St. George',
  5: 'St. Michael',
  6: 'St. Gabriel',
  7: 'St. Raphael',
  8: 'St. Uriel',
  9: 'St. Tekle Haymanot',
  10: 'St. Yared',
  11: 'St. Lalibela',
  12: 'St. Frumentius',
  13: 'St. Moses the Black',
  14: 'St. Anthony',
  15: 'St. Mary of Egypt',
  16: 'St. Athanasius',
  17: 'St. Cyril of Alexandria',
  18: 'St. Ephrem the Syrian',
  19: 'St. Pachomius',
  20: 'St. Macarius',
  21: 'St. Samuel of Waldeba',
  22: 'St. Aragawi',
  23: 'St. Gabra Manfas Qeddus',
  24: 'St. Cyriacus',
  25: 'St. Mark the Evangelist',
  26: 'St. Luke the Evangelist',
  27: 'St. Matthew the Apostle',
  28: 'St. Thomas the Apostle',
};

function feastTypeToCalendarType(type: FeastType): CalendarEventType {
  if (type === 'mary') return 'marian';
  if (type === 'saint') return 'saint';
  if (type === 'angel') return 'feast';
  return 'major_feast';
}

function liturgicalFeastToEvent(
  feast: LiturgicalFeast,
  month: number,
  day: number
): CalendarEvent {
  return {
    month,
    day,
    nameEn: feast.name,
    nameGeez: feast.nameAm,
    type: feastTypeToCalendarType(feast.type),
    isMajor: feast.isMajor,
    lectionary: FEAST_LECTIONARY_OVERRIDES[feast.name],
  };
}

export function getEventsForDate(year: number, month: number, day: number): CalendarEvent[] {
  const liturgical = getLiturgicalDayInfo(new Date(year, month, day));
  return liturgical.feasts.map((feast) => liturgicalFeastToEvent(feast, month, day));
}

export function isFastingDay(month: number, day: number): boolean {
  for (const period of FASTING_PERIODS) {
    if (isDateInPeriod(month, day, period)) return true;
  }
  return false;
}

function isDateInPeriod(month: number, day: number, period: FastingPeriod): boolean {
  const start = period.startMonth * 100 + period.startDay;
  const end = period.endMonth * 100 + period.endDay;
  const current = month * 100 + day;
  if (start <= end) {
    return current >= start && current <= end;
  }
  return current >= start || current <= end;
}

export function getSaintForDate(year: number, month: number, day: number): string {
  const events = getEventsForDate(year, month, day);
  if (events[0]?.saint) return events[0].saint;
  return SAINTS_BY_DAY[day] ?? 'St. Unknown';
}

export function getDayInfo(year: number, month: number, day: number) {
  const events = getEventsForDate(year, month, day);
  const fasting = isCurrentlyFasting(new Date(year, month, day));
  const majorFeast = events.find((e) => e.isMajor);
  const hasFeast = events.some((e) => e.type === 'feast' || e.type === 'major_feast');
  const hasMarian = events.some((e) => e.type === 'marian');
  const saint = getSaintForDate(year, month, day);
  const annualLectionary = getEotcLectionaryForDate(year, month, day);
  const feastLectionary = majorFeast?.lectionary ?? events[0]?.lectionary;
  const lectionary: LectionaryRefs = feastLectionary ?? {
    morning: annualLectionary.morning,
    liturgical: annualLectionary.liturgical,
    anaphora: annualLectionary.anaphora,
    evening: annualLectionary.evening,
  };

  return {
    events,
    fasting,
    majorFeast,
    hasFeast,
    hasMarian,
    hasSaint: true,
    saint,
    lectionary,
    ethiopianMonth: annualLectionary.ethiopianMonth,
    ethiopianDay: annualLectionary.ethiopianDay,
    lectionaryHiatus: annualLectionary.hiatus,
    lectionarySourceUrl: EOTC_LECTIONARY_SOURCE_URL,
    primaryEvent: majorFeast ?? events[0],
  };
}

export function matchesFilter(
  filter: CalendarFilter,
  info: ReturnType<typeof getDayInfo>
): boolean {
  if (filter === 'all') return true;
  if (filter === 'feasts') return info.hasFeast || !!info.majorFeast;
  if (filter === 'fasts') return info.fasting;
  if (filter === 'saints') return info.hasSaint;
  if (filter === 'marian') return info.hasMarian;
  if (filter === 'lectionary') return !!info.lectionary;
  return true;
}

export type UpcomingFeast = CalendarEvent & {
  date: Date;
  daysRemaining: number;
};

export function getUpcomingMajorFeasts(count = 5, fromDate = new Date()): UpcomingFeast[] {
  const start = new Date(fromDate);
  start.setHours(0, 0, 0, 0);

  const upcoming: UpcomingFeast[] = [];
  const seen = new Set<string>();
  const cursor = new Date(start);

  for (let i = 0; i < 366 && upcoming.length < count; i++) {
    const liturgical = getLiturgicalDayInfo(cursor);

    for (const feast of liturgical.feasts) {
      if (!feast.isMajor) continue;

      const occurrenceKey = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}-${feast.name}`;
      if (seen.has(occurrenceKey)) continue;
      seen.add(occurrenceKey);

      const daysRemaining = Math.ceil(
        (cursor.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );

      upcoming.push({
        ...liturgicalFeastToEvent(feast, cursor.getMonth(), cursor.getDate()),
        date: new Date(cursor),
        daysRemaining,
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return upcoming.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, count);
}

export const CALENDAR_FILTERS: { key: CalendarFilter; labelKey: string }[] = [
  { key: 'all', labelKey: 'calendar.all' },
  { key: 'feasts', labelKey: 'calendar.feasts' },
  { key: 'fasts', labelKey: 'calendar.fasts' },
  { key: 'saints', labelKey: 'calendar.saintsFilter' },
  { key: 'marian', labelKey: 'calendar.marian' },
  { key: 'lectionary', labelKey: 'calendar.lectionary' },
];
