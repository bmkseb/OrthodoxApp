import {
  FEAST_ABIY_TSOM,
  FEAST_DEBREZEIT,
  FEAST_ERGET,
  FEAST_HOSAENA,
  FEAST_PERAQLITOS,
  FEAST_RIKBE_KAHINAT,
  FEAST_SIQLET,
  FEAST_TINSAE,
  FEAST_TSOME_HAWARIAT,
  getFeast,
  getNineveh,
  i18n_Months_am,
  MONTH_SENE,
} from 'eotc-calendar';
import * as EthiopianDate from 'ethiopian-date';

const { toEthiopian, toGregorian } = EthiopianDate as {
  toEthiopian: (year: number, month: number, day: number) => [number, number, number];
  toGregorian: (date: [number, number, number]) => [number, number, number];
};

export type FeastType = 'lord' | 'mary' | 'angel' | 'saint' | 'new_year';

export type LiturgicalFeast = {
  name: string;
  nameAm: string;
  type: FeastType;
  isMajor: boolean;
};

export type EthiopianDateInfo = {
  year: number;
  month: number;
  day: number;
  monthName: string;
};

export type LiturgicalDayInfo = {
  ethiopianDate: EthiopianDateInfo;
  isFasting: boolean;
  fastingReason: string | null;
  feasts: LiturgicalFeast[];
};

type EthiopianParts = { year: number; month: number; day: number };

const ETHIOPIAN_MONTH_NAMES_EN: Record<number, string> = {
  1: 'Meskerem',
  2: 'Tikimt',
  3: 'Hidar',
  4: 'Tahsas',
  5: 'Ter',
  6: 'Yekatit',
  7: 'Megabit',
  8: 'Miazia',
  9: 'Ginbot',
  10: 'Sene',
  11: 'Hamle',
  12: 'Nehase',
  13: 'Pagumen',
};

const MONTHLY_FEAST_DAYS: Record<
  number,
  Omit<LiturgicalFeast, 'isMajor'> & { isMajor?: boolean }
> = {
  7: { name: 'Holy Trinity', nameAm: 'ቅድስት ሥላሴ', type: 'lord' },
  12: { name: 'St. Michael the Archangel', nameAm: 'ቅዱስ ሚካኤል', type: 'angel' },
  16: { name: 'Kidane Mihret (Covenant of Mercy)', nameAm: 'ኪዳነ ምሕረት', type: 'mary' },
  21: { name: 'Holy Virgin Mary', nameAm: 'እመቤታችን ማርያም', type: 'mary' },
  27: { name: 'Medhane Alem (Savior of the World)', nameAm: 'መድኃኔ ዓለም', type: 'lord' },
  29: { name: 'Bale Wold (Feast of God the Son)', nameAm: 'ባለ ወልድ', type: 'lord' },
};

const FIXED_FEASTS: Array<{
  month: number;
  day: number;
  feast: LiturgicalFeast;
}> = [
  {
    month: 1,
    day: 1,
    feast: {
      name: 'Enkutatash (Ethiopian New Year)',
      nameAm: 'እንቁጣጣሽ',
      type: 'new_year',
      isMajor: true,
    },
  },
  {
    month: 1,
    day: 17,
    feast: {
      name: 'Meskel (Finding of the True Cross)',
      nameAm: 'መስቀል',
      type: 'lord',
      isMajor: true,
    },
  },
  {
    month: 4,
    day: 29,
    feast: {
      name: 'Christmas (Genna)',
      nameAm: 'ገና',
      type: 'lord',
      isMajor: true,
    },
  },
  {
    month: 5,
    day: 11,
    feast: {
      name: 'Epiphany (Timket)',
      nameAm: 'ጥምቀት',
      type: 'lord',
      isMajor: true,
    },
  },
  {
    month: 5,
    day: 12,
    feast: {
      name: 'St. Michael the Archangel (Ter 12)',
      nameAm: 'ቅዱስ ሚካኤል',
      type: 'angel',
      isMajor: true,
    },
  },
  {
    month: 6,
    day: 16,
    feast: {
      name: 'Kidane Mihret (annual)',
      nameAm: 'ኪዳነ ምሕረት',
      type: 'mary',
      isMajor: false,
    },
  },
  {
    month: 9,
    day: 1,
    feast: {
      name: 'Lideta (Birth of the Virgin Mary)',
      nameAm: 'ልደታ ለማርያም',
      type: 'mary',
      isMajor: false,
    },
  },
  {
    month: 10,
    day: 21,
    feast: {
      name: 'Birth of St. John the Baptist',
      nameAm: 'ትውልደ ቅዱስ ዮሐንስ ቀዳማዊ',
      type: 'saint',
      isMajor: false,
    },
  },
  {
    month: 11,
    day: 19,
    feast: {
      name: 'St. Gabriel the Archangel',
      nameAm: 'ቅዱስ ገብርኤል',
      type: 'angel',
      isMajor: false,
    },
  },
  {
    month: 12,
    day: 1,
    feast: {
      name: 'Start of Fast of Mary (Filseta)',
      nameAm: 'ጾመ ፍልሰታ',
      type: 'mary',
      isMajor: false,
    },
  },
  {
    month: 12,
    day: 13,
    feast: {
      name: 'Transfiguration (Debre Tabor)',
      nameAm: 'ደብረ ታቦር',
      type: 'lord',
      isMajor: true,
    },
  },
  {
    month: 12,
    day: 16,
    feast: {
      name: 'Filseta (Assumption of Mary)',
      nameAm: 'ፍልሰታ',
      type: 'mary',
      isMajor: true,
    },
  },
  {
    month: 12,
    day: 24,
    feast: {
      name: 'St. Tekle Haymanot',
      nameAm: 'አቡነ ተክለ ሃይማኖት',
      type: 'saint',
      isMajor: false,
    },
  },
];

const MOVABLE_FEASTS: Array<{
  feastId: Parameters<typeof getFeast>[0];
  feast: LiturgicalFeast;
}> = [
  {
    feastId: FEAST_HOSAENA,
    feast: {
      name: 'Hosanna (Palm Sunday)',
      nameAm: 'ሆሳዕና',
      type: 'lord',
      isMajor: false,
    },
  },
  {
    feastId: FEAST_DEBREZEIT,
    feast: {
      name: 'Debre Zeit',
      nameAm: 'ደብረ ዘይት',
      type: 'lord',
      isMajor: false,
    },
  },
  {
    feastId: FEAST_SIQLET,
    feast: {
      name: 'Siqlet (Good Friday)',
      nameAm: 'ስቅለት',
      type: 'lord',
      isMajor: true,
    },
  },
  {
    feastId: FEAST_TINSAE,
    feast: {
      name: 'Fasika (Easter)',
      nameAm: 'ፋሲካ',
      type: 'lord',
      isMajor: true,
    },
  },
  {
    feastId: FEAST_RIKBE_KAHINAT,
    feast: {
      name: 'Rikbe Kahinat',
      nameAm: 'ርክበ ካህናት',
      type: 'lord',
      isMajor: false,
    },
  },
  {
    feastId: FEAST_ERGET,
    feast: {
      name: 'Erget (Ascension)',
      nameAm: 'ዕርገት',
      type: 'lord',
      isMajor: true,
    },
  },
  {
    feastId: FEAST_PERAQLITOS,
    feast: {
      name: 'Pentecost (Paraklitos)',
      nameAm: 'ጰራቅሊጦስ',
      type: 'lord',
      isMajor: true,
    },
  },
];

const LENT_DAYS = 56;
const NINEVEH_FAST_DAYS = 3;

function gregorianToEthiopian(date: Date): EthiopianParts {
  const [year, month, day] = toEthiopian(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
  return { year, month, day };
}

function addEthiopianDays(parts: EthiopianParts, days: number): EthiopianParts {
  const [gYear, gMonth, gDay] = toGregorian([parts.year, parts.month, parts.day]);
  const gregorian = new Date(gYear, gMonth - 1, gDay);
  gregorian.setDate(gregorian.getDate() + days);
  return gregorianToEthiopian(gregorian);
}

function compareEthiopian(a: EthiopianParts, b: EthiopianParts): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

function isBetweenEthiopian(
  current: EthiopianParts,
  start: Pick<EthiopianParts, 'month' | 'day'>,
  end: Pick<EthiopianParts, 'month' | 'day'>
): boolean {
  const y = current.year;
  return (
    compareEthiopian(current, { year: y, month: start.month, day: start.day }) >= 0 &&
    compareEthiopian(current, { year: y, month: end.month, day: end.day }) <= 0
  );
}

function dedupeFeasts(feasts: LiturgicalFeast[]): LiturgicalFeast[] {
  const seen = new Set<string>();
  return feasts.filter((feast) => {
    const key = `${feast.name}|${feast.nameAm}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getFixedFeasts(month: number, day: number): LiturgicalFeast[] {
  const feasts: LiturgicalFeast[] = [];

  for (const entry of FIXED_FEASTS) {
    if (entry.month === month && entry.day === day) {
      feasts.push(entry.feast);
    }
  }

  if (month >= 1 && month <= 12) {
    const monthly = MONTHLY_FEAST_DAYS[day];
    if (monthly) {
      feasts.push({ ...monthly, isMajor: monthly.isMajor ?? false });
    }
  }

  return feasts;
}

function getMovableFeasts(ethYear: number, month: number, day: number): LiturgicalFeast[] {
  const feasts: LiturgicalFeast[] = [];

  for (const entry of MOVABLE_FEASTS) {
    const [feastMonth, feastDay] = getFeast(entry.feastId, ethYear);
    if (feastMonth === month && feastDay === day) {
      feasts.push(entry.feast);
    }
  }

  return feasts;
}

function isInJoyfulPeriod(current: EthiopianParts): boolean {
  const [easterMonth, easterDay] = getFeast(FEAST_TINSAE, current.year);
  const [pentecostMonth, pentecostDay] = getFeast(FEAST_PERAQLITOS, current.year);
  return isBetweenEthiopian(
    current,
    { month: easterMonth, day: easterDay },
    { month: pentecostMonth, day: pentecostDay }
  );
}

function getSeasonalFastingReason(current: EthiopianParts): string | null {
  const year = current.year;

  const [lentMonth, lentDay] = getFeast(FEAST_ABIY_TSOM, year);
  const lentStart = { year, month: lentMonth, day: lentDay };
  const lentEnd = addEthiopianDays(lentStart, LENT_DAYS - 1);
  if (
    compareEthiopian(current, lentStart) >= 0 &&
    compareEthiopian(current, lentEnd) <= 0
  ) {
    return 'Lent';
  }

  const [ninevehMonth, ninevehDay] = getNineveh(year);
  const ninevehStart = { year, month: ninevehMonth, day: ninevehDay };
  const ninevehEnd = addEthiopianDays(ninevehStart, NINEVEH_FAST_DAYS - 1);
  if (
    compareEthiopian(current, ninevehStart) >= 0 &&
    compareEthiopian(current, ninevehEnd) <= 0
  ) {
    return 'Fast of Nineveh';
  }

  const [apostlesMonth, apostlesDay] = getFeast(FEAST_TSOME_HAWARIAT, year);
  if (
    isBetweenEthiopian(current, { month: apostlesMonth, day: apostlesDay }, { month: MONTH_SENE, day: 27 })
  ) {
    return 'Fast of Apostles';
  }

  if (isBetweenEthiopian(current, { month: 12, day: 1 }, { month: 12, day: 15 })) {
    return 'Fast of Mary';
  }

  if (isBetweenEthiopian(current, { month: 3, day: 15 }, { month: 4, day: 28 })) {
    return 'Advent';
  }

  return null;
}

function getWeekdayFastingReason(date: Date): 'Wednesday' | 'Friday' | null {
  const weekday = date.getDay();
  if (weekday === 3) return 'Wednesday';
  if (weekday === 5) return 'Friday';
  return null;
}

function resolveFasting(
  date: Date,
  current: EthiopianParts,
  feasts: LiturgicalFeast[]
): { isFasting: boolean; fastingReason: string | null } {
  if (isInJoyfulPeriod(current)) {
    return { isFasting: false, fastingReason: null };
  }

  const hasMajorFeast = feasts.some((feast) => feast.isMajor);
  const weekday = getWeekdayFastingReason(date);
  if (hasMajorFeast && weekday) {
    return { isFasting: false, fastingReason: null };
  }

  const seasonal = getSeasonalFastingReason(current);
  if (seasonal) {
    return { isFasting: true, fastingReason: seasonal };
  }

  if (weekday) {
    return { isFasting: true, fastingReason: weekday };
  }

  return { isFasting: false, fastingReason: null };
}

export function getDayInfo(date: Date): LiturgicalDayInfo {
  const eth = gregorianToEthiopian(date);
  const monthName =
    ETHIOPIAN_MONTH_NAMES_EN[eth.month] ?? i18n_Months_am[eth.month as keyof typeof i18n_Months_am] ?? '';

  const feasts = dedupeFeasts([
    ...getFixedFeasts(eth.month, eth.day),
    ...getMovableFeasts(eth.year, eth.month, eth.day),
  ]);

  const { isFasting, fastingReason } = resolveFasting(date, eth, feasts);

  return {
    ethiopianDate: {
      year: eth.year,
      month: eth.month,
      day: eth.day,
      monthName,
    },
    isFasting,
    fastingReason,
    feasts,
  };
}

export function isCurrentlyFasting(date: Date): boolean {
  return getDayInfo(date).isFasting;
}

const AMETE_ALEM_OFFSET = 5500;

export type EvangelistYear = {
  name: string;
  nameAm: string;
};

export function getEvangelistYear(ethYear: number): EvangelistYear {
  const remainder = (ethYear + AMETE_ALEM_OFFSET) % 4;
  switch (remainder) {
    case 1:
      return { name: 'Matthew', nameAm: 'ማቴዎስ' };
    case 2:
      return { name: 'Mark', nameAm: 'ማርቆስ' };
    case 3:
      return { name: 'Luke', nameAm: 'ሉቃስ' };
    default:
      return { name: 'John', nameAm: 'ዮሐንስ' };
  }
}

export type LiturgicalSeasonKey =
  | 'advent'
  | 'christmas'
  | 'epiphany'
  | 'ordinary'
  | 'nineveh'
  | 'lent'
  | 'holyWeek'
  | 'easter'
  | 'ascension'
  | 'pentecost'
  | 'apostlesFast'
  | 'marysFast';

export function getLiturgicalSeason(date: Date): LiturgicalSeasonKey {
  const current = gregorianToEthiopian(date);
  const year = current.year;

  const [hosaenaMonth, hosaenaDay] = getFeast(FEAST_HOSAENA, year);
  const [tinsaeMonth, tinsaeDay] = getFeast(FEAST_TINSAE, year);
  const [ergetMonth, ergetDay] = getFeast(FEAST_ERGET, year);
  const [pentecostMonth, pentecostDay] = getFeast(FEAST_PERAQLITOS, year);
  const [lentMonth, lentDay] = getFeast(FEAST_ABIY_TSOM, year);
  const [ninevehMonth, ninevehDay] = getNineveh(year);
  const [apostlesMonth, apostlesDay] = getFeast(FEAST_TSOME_HAWARIAT, year);

  const beforeEaster = addEthiopianDays({ year, month: tinsaeMonth, day: tinsaeDay }, -1);
  if (
    compareEthiopian(current, { year, month: hosaenaMonth, day: hosaenaDay }) >= 0 &&
    compareEthiopian(current, beforeEaster) <= 0
  ) {
    return 'holyWeek';
  }

  const ninevehEnd = addEthiopianDays({ year, month: ninevehMonth, day: ninevehDay }, NINEVEH_FAST_DAYS - 1);
  if (
    compareEthiopian(current, { year, month: ninevehMonth, day: ninevehDay }) >= 0 &&
    compareEthiopian(current, ninevehEnd) <= 0
  ) {
    return 'nineveh';
  }

  const beforeHolyWeek = addEthiopianDays({ year, month: hosaenaMonth, day: hosaenaDay }, -1);
  if (
    compareEthiopian(current, { year, month: lentMonth, day: lentDay }) >= 0 &&
    compareEthiopian(current, beforeHolyWeek) <= 0
  ) {
    return 'lent';
  }

  if (
    isBetweenEthiopian(
      current,
      { month: tinsaeMonth, day: tinsaeDay },
      { month: pentecostMonth, day: pentecostDay }
    )
  ) {
    return 'easter';
  }

  if (current.month === ergetMonth && current.day === ergetDay) {
    return 'ascension';
  }

  if (current.month === pentecostMonth && current.day === pentecostDay) {
    return 'pentecost';
  }

  if (
    isBetweenEthiopian(current, { month: apostlesMonth, day: apostlesDay }, { month: MONTH_SENE, day: 27 })
  ) {
    return 'apostlesFast';
  }

  if (isBetweenEthiopian(current, { month: 12, day: 1 }, { month: 12, day: 16 })) {
    return 'marysFast';
  }

  if (isBetweenEthiopian(current, { month: 3, day: 15 }, { month: 4, day: 28 })) {
    return 'advent';
  }

  if (isBetweenEthiopian(current, { month: 4, day: 29 }, { month: 5, day: 10 })) {
    return 'christmas';
  }

  if (current.month === 5 && current.day === 11) {
    return 'epiphany';
  }

  return 'ordinary';
}

/** Fast periods tracked separately for accent color and upcoming-fasts carousel. */
const FAST_ONLY_BANNER_SEASONS: ReadonlySet<LiturgicalSeasonKey> = new Set([
  'nineveh',
  'apostlesFast',
  'marysFast',
]);

export function getActiveFastSeason(date: Date): LiturgicalSeasonKey | null {
  const season = getLiturgicalSeason(date);
  return FAST_ONLY_BANNER_SEASONS.has(season) ? season : null;
}

function ethiopianPartsToDate(parts: EthiopianParts): Date {
  const [gYear, gMonth, gDay] = toGregorian([parts.year, parts.month, parts.day]);
  return new Date(gYear, gMonth - 1, gDay);
}

function ethiopianDayOffset(current: EthiopianParts, start: EthiopianParts): number {
  const startMs = ethiopianPartsToDate(start).getTime();
  const currentMs = ethiopianPartsToDate(current).getTime();
  return Math.floor((currentMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
}

function ethiopianInclusiveSpan(start: EthiopianParts, end: EthiopianParts): number {
  return ethiopianDayOffset(end, start);
}

export type SeasonBannerSubtitle =
  | { kind: 'fast'; total: number; current: number }
  | { kind: 'season'; total: number; current: number }
  | { kind: 'nineveh' }
  | { kind: 'holyWeek' };

export type SeasonBannerMeta = {
  bannerSeason: LiturgicalSeasonKey;
  activeFastSeason: LiturgicalSeasonKey | null;
  subtitle: SeasonBannerSubtitle | null;
  showFastingBadge: boolean;
};

export function getSeasonBannerMeta(date: Date): SeasonBannerMeta {
  const current = gregorianToEthiopian(date);
  const year = current.year;
  const actualSeason = getLiturgicalSeason(date);
  const activeFast = getActiveFastSeason(date);
  const bannerSeason = actualSeason;
  const isFasting = getDayInfo(date).isFasting;

  let subtitle: SeasonBannerSubtitle | null = null;

  if (actualSeason === 'lent') {
    const [lentMonth, lentDay] = getFeast(FEAST_ABIY_TSOM, year);
    const lentStart = { year, month: lentMonth, day: lentDay };
    const dayNum = ethiopianDayOffset(current, lentStart);
    subtitle = { kind: 'fast', total: LENT_DAYS, current: dayNum };
  } else if (actualSeason === 'advent') {
    const adventStart = { year, month: 3, day: 15 };
    const dayNum = ethiopianDayOffset(current, adventStart);
    subtitle = { kind: 'fast', total: 40, current: dayNum };
  } else if (actualSeason === 'marysFast') {
    const marysStart = { year, month: 12, day: 1 };
    const dayNum = ethiopianDayOffset(current, marysStart);
    subtitle = { kind: 'fast', total: 16, current: dayNum };
  } else if (actualSeason === 'apostlesFast') {
    const [apostlesMonth, apostlesDay] = getFeast(FEAST_TSOME_HAWARIAT, year);
    const apostlesStart = { year, month: apostlesMonth, day: apostlesDay };
    const apostlesEnd = { year, month: MONTH_SENE, day: 27 };
    const dayNum = ethiopianDayOffset(current, apostlesStart);
    const total = ethiopianInclusiveSpan(apostlesStart, apostlesEnd);
    subtitle = { kind: 'fast', total, current: dayNum };
  } else if (actualSeason === 'nineveh') {
    subtitle = { kind: 'nineveh' };
  } else if (actualSeason === 'holyWeek') {
    subtitle = { kind: 'holyWeek' };
  } else if (actualSeason === 'easter') {
    const [tinsaeMonth, tinsaeDay] = getFeast(FEAST_TINSAE, year);
    const [pentecostMonth, pentecostDay] = getFeast(FEAST_PERAQLITOS, year);
    const dayNum = ethiopianDayOffset(current, { year, month: tinsaeMonth, day: tinsaeDay });
    const total = ethiopianInclusiveSpan(
      { year, month: tinsaeMonth, day: tinsaeDay },
      { year, month: pentecostMonth, day: pentecostDay }
    );
    subtitle = { kind: 'season', total, current: dayNum };
  }

  return {
    bannerSeason,
    activeFastSeason: activeFast,
    subtitle,
    showFastingBadge: isFasting,
  };
}

export type UpcomingFastPeriod = {
  key: LiturgicalSeasonKey;
  name: string;
  nameAm: string;
  startDate: Date;
  endDate: Date;
  daysRemaining: number;
  isActive: boolean;
};

function buildFastPeriod(
  key: LiturgicalSeasonKey,
  name: string,
  nameAm: string,
  start: EthiopianParts,
  end: EthiopianParts
): UpcomingFastPeriod {
  const startDate = ethiopianPartsToDate(start);
  const endDate = ethiopianPartsToDate(end);
  return { key, name, nameAm, startDate, endDate, daysRemaining: 0, isActive: false };
}

function fastPeriodsForEthYear(ethYear: number): UpcomingFastPeriod[] {
  const [ninevehMonth, ninevehDay] = getNineveh(ethYear);
  const [lentMonth, lentDay] = getFeast(FEAST_ABIY_TSOM, ethYear);
  const [hosaenaMonth, hosaenaDay] = getFeast(FEAST_HOSAENA, ethYear);
  const [apostlesMonth, apostlesDay] = getFeast(FEAST_TSOME_HAWARIAT, ethYear);

  const lentStart = { year: ethYear, month: lentMonth, day: lentDay };
  const lentEnd = addEthiopianDays(lentStart, LENT_DAYS - 1);
  const ninevehStart = { year: ethYear, month: ninevehMonth, day: ninevehDay };
  const ninevehEnd = addEthiopianDays(ninevehStart, NINEVEH_FAST_DAYS - 1);
  const holyWeekStart = { year: ethYear, month: hosaenaMonth, day: hosaenaDay };
  const [tinsaeMonth, tinsaeDay] = getFeast(FEAST_TINSAE, ethYear);
  const holyWeekEnd = addEthiopianDays({ year: ethYear, month: tinsaeMonth, day: tinsaeDay }, -1);
  const apostlesStart = { year: ethYear, month: apostlesMonth, day: apostlesDay };
  const apostlesEnd = { year: ethYear, month: MONTH_SENE, day: 27 };
  const marysStart = { year: ethYear, month: 12, day: 1 };
  const marysEnd = { year: ethYear, month: 12, day: 16 };
  const adventStart = { year: ethYear, month: 3, day: 15 };
  const adventEnd = { year: ethYear, month: 4, day: 28 };

  return [
    buildFastPeriod('nineveh', 'Fast of Nineveh', 'ጾመ ነነዌ', ninevehStart, ninevehEnd),
    buildFastPeriod('lent', 'Great Lent (Hudadi)', 'ዐቢይ ጾም', lentStart, lentEnd),
    buildFastPeriod('holyWeek', 'Holy Week (Himamat)', 'ሰሙነ ሕማማት', holyWeekStart, holyWeekEnd),
    buildFastPeriod('apostlesFast', 'Fast of the Apostles', 'ጾመ ሐዋርያት', apostlesStart, apostlesEnd),
    buildFastPeriod('marysFast', 'Fast of Mary (Filseta)', 'ጾመ ፍልሰታ', marysStart, marysEnd),
    buildFastPeriod('advent', 'Advent Fast', 'ጾመ ነቢያት', adventStart, adventEnd),
  ];
}

export function getUpcomingFasts(count = 4, fromDate = new Date()): UpcomingFastPeriod[] {
  const today = new Date(fromDate);
  today.setHours(0, 0, 0, 0);
  const eth = gregorianToEthiopian(today);

  const periods = [...fastPeriodsForEthYear(eth.year), ...fastPeriodsForEthYear(eth.year + 1)];

  const msPerDay = 1000 * 60 * 60 * 24;
  const enriched = periods.map((period) => {
    const start = new Date(period.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(period.endDate);
    end.setHours(23, 59, 59, 999);
    const isActive = today >= start && today <= end;
    const daysRemaining = isActive
      ? 0
      : Math.max(0, Math.ceil((start.getTime() - today.getTime()) / msPerDay));
    return { ...period, isActive, daysRemaining };
  });

  const active = enriched.filter((p) => p.isActive);
  const upcoming = enriched
    .filter((p) => !p.isActive && p.startDate >= today)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const seen = new Set<string>();
  const result: UpcomingFastPeriod[] = [];

  for (const period of [...active, ...upcoming]) {
    const dedupeKey = `${period.key}-${period.startDate.toISOString()}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    result.push(period);
    if (result.length >= count) break;
  }

  return result;
}

export function getEthiopianMonthsInGregorianMonth(
  year: number,
  month: number
): { months: number[]; ethYear: number } {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthSet = new Set<number>();
  let ethYear = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const info = getDayInfo(new Date(year, month, day));
    monthSet.add(info.ethiopianDate.month);
    ethYear = info.ethiopianDate.year;
  }

  return { months: Array.from(monthSet).sort((a, b) => a - b), ethYear };
}

export function formatGregorianDateLong(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatEthiopianDateLong(eth: EthiopianDateInfo): string {
  return `${eth.monthName} ${eth.day}, ${eth.year} E.C.`;
}
