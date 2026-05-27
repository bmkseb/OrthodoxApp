export type CalendarEventType = 'feast' | 'fast' | 'marian' | 'saint' | 'major_feast' | 'lectionary';

export type LectionaryRefs = {
  morning: string[];
  liturgical: string[];
  evening: string[];
};

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

/** Gregorian Easter dates (Ethiopian Orthodox approximation by year) */
const FASIKA_BY_YEAR: Record<number, { month: number; day: number }> = {
  2024: { month: 4, day: 5 },
  2025: { month: 3, day: 20 },
  2026: { month: 3, day: 12 },
  2027: { month: 4, day: 4 },
};

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

const FIXED_EVENTS: CalendarEvent[] = [
  {
    month: 0,
    day: 7,
    nameEn: 'Genna (Christmas)',
    nameGeez: 'ገና',
    type: 'major_feast',
    isMajor: true,
    saint: 'Our Lord Jesus Christ',
    lectionary: {
      morning: ['Isaiah 9', 'Hebrews 1', 'Matthew 1'],
      liturgical: ['Luke 2', 'Titus 2'],
      evening: ['Micah 5', 'Galatians 4', 'John 1'],
    },
  },
  {
    month: 0,
    day: 19,
    nameEn: 'Timkat (Epiphany)',
    nameGeez: 'ጥምቀት',
    type: 'major_feast',
    isMajor: true,
    saint: 'Baptism of Our Lord',
    lectionary: {
      morning: ['Isaiah 43', 'Acts 10', 'Mark 1'],
      liturgical: ['Matthew 3', 'Romans 6'],
      evening: ['Isaiah 12', '1 John 5', 'John 3'],
    },
  },
  {
    month: 0,
    day: 22,
    nameEn: 'Marian Feast',
    nameGeez: 'የማርያም በዓል',
    type: 'marian',
    isMajor: true,
    saint: 'St. Mary',
    lectionary: {
      morning: ['Luke 1', 'Galatians 4'],
      liturgical: ['John 2'],
      evening: ['Song of Songs 2', 'Revelation 12'],
    },
  },
  {
    month: 4,
    day: 1,
    nameEn: 'Marian Feast',
    nameGeez: 'የማርያም በዓል',
    type: 'marian',
    isMajor: true,
    saint: 'St. Mary',
  },
  {
    month: 5,
    day: 12,
    nameEn: 'Mikael Feast',
    nameGeez: 'ቅዱስ ሚካኤል',
    type: 'feast',
    isMajor: true,
    saint: 'St. Michael the Archangel',
  },
  {
    month: 7,
    day: 22,
    nameEn: 'Marian Feast (Filseta)',
    nameGeez: 'ፍልሰታ',
    type: 'marian',
    isMajor: true,
    saint: 'St. Mary',
  },
  {
    month: 8,
    day: 11,
    nameEn: 'Enkutatash (New Year)',
    nameGeez: 'እንቁጣጣሽ',
    type: 'major_feast',
    isMajor: true,
    saint: 'St. John the Baptist',
  },
  {
    month: 8,
    day: 27,
    nameEn: 'Meskel (Finding of the Cross)',
    nameGeez: 'መስቀል',
    type: 'major_feast',
    isMajor: true,
    saint: 'Holy Cross',
    lectionary: {
      morning: ['John 3', 'Philippians 2'],
      liturgical: ['Matthew 16', '1 Corinthians 1'],
      evening: ['Galatians 6', 'Mark 8'],
    },
  },
  {
    month: 10,
    day: 8,
    nameEn: 'Mikael Feast',
    nameGeez: 'ቅዱስ ሚካኤል',
    type: 'feast',
    isMajor: true,
    saint: 'St. Michael the Archangel',
  },
];

const DEFAULT_LECTIONARY: LectionaryRefs = {
  morning: ['Nehemiah 13', '1 John 5', 'Luke 1'],
  liturgical: ['Isaiah 6', 'Romans 8', 'Matthew 5'],
  evening: ['Psalm 91', 'Hebrews 11', 'John 6'],
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

export function getFasikaDate(year: number): { month: number; day: number } | null {
  return FASIKA_BY_YEAR[year] ?? null;
}

export function getEventsForYear(year: number): CalendarEvent[] {
  const events = [...FIXED_EVENTS];
  const fasika = getFasikaDate(year);
  if (fasika) {
    events.push({
      month: fasika.month,
      day: fasika.day,
      nameEn: 'Fasika (Easter)',
      nameGeez: 'ፋሲካ',
      type: 'major_feast',
      isMajor: true,
      saint: 'Resurrection of Our Lord',
      lectionary: {
        morning: ['Acts 10', 'Romans 6', 'Mark 16'],
        liturgical: ['1 Corinthians 15', 'John 20'],
        evening: ['Isaiah 25', 'Colossians 3', 'Luke 24'],
      },
    });
  }
  return events;
}

export function getEventsForDate(year: number, month: number, day: number): CalendarEvent[] {
  return getEventsForYear(year).filter((e) => e.month === month && e.day === day);
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
  const fasting = isFastingDay(month, day);
  const majorFeast = events.find((e) => e.isMajor);
  const hasFeast = events.some((e) => e.type === 'feast' || e.type === 'major_feast');
  const hasMarian = events.some((e) => e.type === 'marian');
  const saint = getSaintForDate(year, month, day);
  const lectionary = majorFeast?.lectionary ?? events[0]?.lectionary ?? DEFAULT_LECTIONARY;

  return {
    events,
    fasting,
    majorFeast,
    hasFeast,
    hasMarian,
    hasSaint: true,
    saint,
    lectionary,
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
  const year = fromDate.getFullYear();
  const events = getEventsForYear(year).filter((e) => e.isMajor);

  const upcoming: UpcomingFeast[] = [];
  const seen = new Set<string>();

  for (const event of events) {
    let date = new Date(year, event.month, event.day);
    if (date < fromDate) {
      date = new Date(year + 1, event.month, event.day);
    }

    const occurrenceKey = `${date.getFullYear()}-${event.month}-${event.day}-${event.nameEn}`;
    if (seen.has(occurrenceKey)) continue;
    seen.add(occurrenceKey);

    const daysRemaining = Math.ceil(
      (date.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    upcoming.push({ ...event, date, daysRemaining });
  }

  return upcoming
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, count);
}

export const CALENDAR_FILTERS: { key: CalendarFilter; labelKey: string }[] = [
  { key: 'all', labelKey: 'calendar.all' },
  { key: 'feasts', labelKey: 'calendar.feasts' },
  { key: 'fasts', labelKey: 'calendar.fasts' },
  { key: 'saints', labelKey: 'calendar.saintsFilter' },
  { key: 'marian', labelKey: 'calendar.marian' },
  { key: 'lectionary', labelKey: 'calendar.lectionary' },
];
