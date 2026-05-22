import type { TranslationKey } from '@/lib/translations';

export type CalendarEventType = 'feast' | 'fast' | 'marian' | 'saint' | 'major';

export type LectionaryRefs = {
  morning: string[];
  liturgical: string[];
  evening: string[];
};

export type CalendarEvent = {
  id: string;
  date: Date;
  nameEn: string;
  nameAm: string;
  type: CalendarEventType;
  isMajor: boolean;
  saint?: string;
  saintAm?: string;
  image?: string;
  lectionaries: LectionaryRefs;
};

export type FastingPeriod = {
  id: string;
  nameEn: string;
  nameAm: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
};

export type DayInfo = {
  date: Date;
  events: CalendarEvent[];
  isFasting: boolean;
  isMajorFeast: boolean;
  isFeast: boolean;
  isMarian: boolean;
  isSaint: boolean;
  hasLectionary: boolean;
  primaryEvent?: CalendarEvent;
};

export type CalendarFilterId = 'all' | 'feasts' | 'fasts' | 'saints' | 'marian' | 'lectionary';

export type CalendarFilter = {
  id: CalendarFilterId;
  labelKey: TranslationKey;
};

export const CALENDAR_FILTERS: CalendarFilter[] = [
  { id: 'all', labelKey: 'calendar.all' },
  { id: 'feasts', labelKey: 'calendar.feasts' },
  { id: 'fasts', labelKey: 'calendar.fasts' },
  { id: 'saints', labelKey: 'calendar.saintsFilter' },
  { id: 'marian', labelKey: 'calendar.marian' },
  { id: 'lectionary', labelKey: 'calendar.lectionary' },
];

/** Ethiopian Orthodox Easter (Fasika) — Gregorian dates by year */
const FASIKA_DATES: Record<number, { month: number; day: number }> = {
  2024: { month: 4, day: 5 },
  2025: { month: 4, day: 20 },
  2026: { month: 4, day: 12 },
  2027: { month: 4, day: 4 },
  2028: { month: 4, day: 23 },
  2029: { month: 4, day: 8 },
  2030: { month: 4, day: 28 },
};

const DEFAULT_IMAGE = 'https://picsum.photos/600/800?random=saint';

const DEFAULT_LECTIONARIES: LectionaryRefs = {
  morning: ['Nehemiah 13', '1 John 5', 'Luke 1'],
  liturgical: ['Isaiah 7', 'Hebrews 2', 'Matthew 1'],
  evening: ['Psalm 23', 'Romans 8', 'John 3'],
};

const FASTING_PERIODS: FastingPeriod[] = [
  {
    id: 'tsome-nebiyat',
    nameEn: 'Tsome Nebiyat (Advent Fast)',
    nameAm: 'ጾመ ነቢያት',
    startMonth: 11,
    startDay: 15,
    endMonth: 1,
    endDay: 6,
  },
  {
    id: 'tsome-hawariyat',
    nameEn: 'Tsome Hawariyat (Apostles Fast)',
    nameAm: 'ጾመ ሐዋርያት',
    startMonth: 5,
    startDay: 20,
    endMonth: 6,
    endDay: 11,
  },
  {
    id: 'hudadi',
    nameEn: 'Hudadi (Great Lent)',
    nameAm: 'ሁዳዴ',
    startMonth: 2,
    startDay: 24,
    endMonth: 4,
    endDay: 4,
  },
  {
    id: 'filseta-fast',
    nameEn: 'Filseta (Assumption Fast)',
    nameAm: 'ፍልሰታ',
    startMonth: 8,
    startDay: 1,
    endMonth: 8,
    endDay: 14,
  },
];

type FixedFeastDef = {
  key: string;
  month: number;
  day: number;
  nameEn: string;
  nameAm: string;
  type: CalendarEventType;
  isMajor: boolean;
  saint?: string;
  saintAm?: string;
  image?: string;
  lectionaries?: LectionaryRefs;
};

const FIXED_FEASTS: FixedFeastDef[] = [
  {
    key: 'genna',
    month: 1,
    day: 7,
    nameEn: 'Genna (Christmas)',
    nameAm: 'ገና',
    type: 'major',
    isMajor: true,
    saint: 'Our Lord Jesus Christ',
    saintAm: 'እግዚአብሔር ወልድ',
    lectionaries: {
      morning: ['Micah 5', 'Hebrews 1', 'Matthew 1'],
      liturgical: ['Isaiah 9', 'Titus 2', 'Luke 2'],
      evening: ['Psalm 96', 'Galatians 4', 'John 1'],
    },
  },
  {
    key: 'timkat',
    month: 1,
    day: 19,
    nameEn: 'Timkat (Epiphany)',
    nameAm: 'ጥምቀት',
    type: 'major',
    isMajor: true,
    saint: 'Baptism of Our Lord',
    saintAm: 'ጥምቀት እግዚአብሔር',
    lectionaries: {
      morning: ['Isaiah 42', 'Acts 10', 'Mark 1'],
      liturgical: ['Isaiah 43', '1 Peter 3', 'Matthew 3'],
      evening: ['Psalm 29', 'Romans 6', 'John 1'],
    },
  },
  {
    key: 'marian-jan',
    month: 1,
    day: 22,
    nameEn: 'Marian Feast (Kidus Mariam)',
    nameAm: 'በዓል ቅድስት ማርያም',
    type: 'marian',
    isMajor: true,
    saint: 'St. Mary',
    saintAm: 'ቅድስት ማርያም',
  },
  {
    key: 'marian-may',
    month: 5,
    day: 1,
    nameEn: 'Marian Feast (May)',
    nameAm: 'በዓል ቅድስት ማርያም',
    type: 'marian',
    isMajor: true,
    saint: 'St. Mary',
    saintAm: 'ቅድስት ማርያም',
  },
  {
    key: 'mikael-jun',
    month: 6,
    day: 12,
    nameEn: 'Feast of St. Michael',
    nameAm: 'በዓል ቅዱስ ሚካኤል',
    type: 'saint',
    isMajor: false,
    saint: 'St. Michael',
    saintAm: 'ቅዱስ ሚካኤል',
  },
  {
    key: 'marian-aug',
    month: 8,
    day: 22,
    nameEn: 'Marian Feast (Filseta)',
    nameAm: 'በዓል ፍልሰታ',
    type: 'marian',
    isMajor: true,
    saint: 'St. Mary',
    saintAm: 'ቅድስት ማርያም',
  },
  {
    key: 'enkutatash',
    month: 9,
    day: 11,
    nameEn: 'Enkutatash (New Year)',
    nameAm: 'እንቁጣጣሽ',
    type: 'feast',
    isMajor: false,
    saint: 'St. John the Baptist',
    saintAm: 'ቅዱስ ዮሐንስ',
  },
  {
    key: 'meskel',
    month: 9,
    day: 27,
    nameEn: 'Meskel (Finding of the Cross)',
    nameAm: 'መስቀል',
    type: 'major',
    isMajor: true,
    saint: 'Holy Cross',
    saintAm: 'መስቀል',
    lectionaries: {
      morning: ['Exodus 15', '1 Corinthians 1', 'John 12'],
      liturgical: ['Isaiah 53', 'Philippians 2', 'Matthew 27'],
      evening: ['Psalm 22', 'Galatians 6', 'Luke 23'],
    },
  },
  {
    key: 'mikael-nov',
    month: 11,
    day: 8,
    nameEn: 'Feast of St. Michael',
    nameAm: 'በዓል ቅዱስ ሚካኤል',
    type: 'saint',
    isMajor: false,
    saint: 'St. Michael',
    saintAm: 'ቅዱስ ሚካኤል',
  },
];

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function makeDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day);
}

function buildFixedEvent(def: FixedFeastDef, year: number): CalendarEvent {
  const date = makeDate(year, def.month, def.day);
  return {
    id: `${year}-${def.key}`,
    date,
    nameEn: def.nameEn,
    nameAm: def.nameAm,
    type: def.type,
    isMajor: def.isMajor,
    saint: def.saint,
    saintAm: def.saintAm,
    image: def.image ?? DEFAULT_IMAGE,
    lectionaries: def.lectionaries ?? DEFAULT_LECTIONARIES,
  };
}

function buildFasikaEvent(year: number): CalendarEvent | null {
  const fasika = FASIKA_DATES[year];
  if (!fasika) return null;
  const date = makeDate(year, fasika.month, fasika.day);
  return {
    id: `${year}-fasika`,
    date,
    nameEn: 'Fasika (Easter)',
    nameAm: 'ፋሲካ',
    type: 'major',
    isMajor: true,
    saint: 'Resurrection of Our Lord',
    saintAm: 'ትንሣኤ እግዚአብሔር',
    image: DEFAULT_IMAGE,
    lectionaries: {
      morning: ['Exodus 12', '1 Corinthians 15', 'Mark 16'],
      liturgical: ['Isaiah 25', 'Acts 10', 'John 20'],
      evening: ['Psalm 118', 'Romans 6', 'Luke 24'],
    },
  };
}

function isDateInFastingPeriod(date: Date): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return FASTING_PERIODS.some((period) => {
    const { startMonth, startDay, endMonth, endDay } = period;
    if (startMonth <= endMonth) {
      if (month < startMonth || month > endMonth) return false;
      if (month === startMonth && day < startDay) return false;
      if (month === endMonth && day > endDay) return false;
      return true;
    }
    // Wraps year boundary (e.g. Advent Nov 15 – Jan 6)
    if (month > startMonth || (month === startMonth && day >= startDay)) return true;
    if (month < endMonth || (month === endMonth && day <= endDay)) return true;
    return false;
  });
}

function buildSaintOfDay(date: Date): CalendarEvent {
  const saints = [
    { en: 'St. George', am: 'ቅዱስ ጊዮርጊስ' },
    { en: 'St. Tekle Haymanot', am: 'ቅዱስ ተክለ ሃይማኖት' },
    { en: 'St. Gabra Manfas Qeddus', am: 'ቅዱስ ገብረ ምንፈስ ቅዱስ' },
    { en: 'St. Yared', am: 'ቅዱስ ያሬድ' },
    { en: 'St. Moses the Black', am: 'ቅዱስ ሙሴ' },
    { en: 'St. Ephrem', am: 'ቅዱስ ኤፍሬም' },
    { en: 'St. Athanasius', am: 'ቅዱስ አትናቴዎስ' },
  ];
  const idx = (date.getDate() + date.getMonth() * 7) % saints.length;
  const saint = saints[idx];
  return {
    id: `${dateKey(date)}-saint`,
    date,
    nameEn: saint.en,
    nameAm: saint.am,
    type: 'saint',
    isMajor: false,
    saint: saint.en,
    saintAm: saint.am,
    image: DEFAULT_IMAGE,
    lectionaries: DEFAULT_LECTIONARIES,
  };
}

export function getEventsForYear(year: number): CalendarEvent[] {
  const events: CalendarEvent[] = FIXED_FEASTS.map((def) => buildFixedEvent(def, year));
  const fasika = buildFasikaEvent(year);
  if (fasika) events.push(fasika);
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getDayInfo(date: Date): DayInfo {
  const year = date.getFullYear();
  const yearEvents = getEventsForYear(year);
  const dayEvents = yearEvents.filter(
    (e) =>
      e.date.getFullYear() === date.getFullYear() &&
      e.date.getMonth() === date.getMonth() &&
      e.date.getDate() === date.getDate()
  );

  const saintEvent = buildSaintOfDay(date);
  const events = dayEvents.length > 0 ? dayEvents : [saintEvent];
  const isFasting = isDateInFastingPeriod(date);
  const isMajorFeast = events.some((e) => e.isMajor);
  const isFeast = events.some((e) => e.type === 'feast' || e.type === 'major' || e.isMajor);
  const isMarian = events.some((e) => e.type === 'marian');
  const isSaint = events.some((e) => e.type === 'saint') || dayEvents.length === 0;
  const hasLectionary = events.some(
    (e) =>
      e.lectionaries.morning.length > 0 ||
      e.lectionaries.liturgical.length > 0 ||
      e.lectionaries.evening.length > 0
  );

  return {
    date,
    events,
    isFasting,
    isMajorFeast,
    isFeast,
    isMarian,
    isSaint,
    hasLectionary,
    primaryEvent: events[0],
  };
}

export function getStableFeastId(feast: CalendarEvent): string {
  return `${feast.date.getFullYear()}-${feast.date.getMonth()}-${feast.date.getDate()}-${feast.nameEn}`;
}

/** Next occurrence of each major feast — deduplicated by stable id */
export function getUpcomingMajorFeasts(from: Date = new Date(), limit = 5): CalendarEvent[] {
  const year = from.getFullYear();
  const seen = new Set<string>();
  const upcoming: CalendarEvent[] = [];

  const majorDefs = FIXED_FEASTS.filter((f) => f.isMajor);

  for (const def of majorDefs) {
    for (const y of [year, year + 1]) {
      const event = buildFixedEvent(def, y);
      if (event.date < from) continue;
      const id = getStableFeastId(event);
      if (seen.has(id)) continue;
      seen.add(id);
      upcoming.push(event);
    }
  }

  for (const y of [year, year + 1]) {
    const fasika = buildFasikaEvent(y);
    if (!fasika || fasika.date < from) continue;
    const id = getStableFeastId(fasika);
    if (seen.has(id)) continue;
    seen.add(id);
    upcoming.push(fasika);
  }

  return upcoming.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, limit);
}

export function matchesFilter(dayInfo: DayInfo, filter: CalendarFilterId): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'feasts':
      return dayInfo.isFeast || dayInfo.isMajorFeast;
    case 'fasts':
      return dayInfo.isFasting;
    case 'saints':
      return dayInfo.isSaint;
    case 'marian':
      return dayInfo.isMarian;
    case 'lectionary':
      return dayInfo.hasLectionary;
    default:
      return true;
  }
}
