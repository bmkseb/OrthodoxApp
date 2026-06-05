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
