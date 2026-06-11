import { i18n_Months_am } from 'eotc-calendar';

import { learnText } from '@/lib/learn-i18n';
import type { SeasonInfo } from '@/lib/calendar-content';
import type { EthiopianDateInfo, EvangelistYear } from '@/lib/eotc-liturgical-calendar';
import type { LanguageMode } from '@/lib/translations';

export { learnText as calendarText };

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

const WEEKDAYS_SHORT_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
const WEEKDAYS_SHORT_AM = ['እሑ', 'ሰኞ', 'ማክ', 'ረቡ', 'ሐሙ', 'ዓር', 'ቅዳ'] as const;

const FASTING_REASONS: Record<string, { en: string; am: string }> = {
  Wednesday: { en: 'Wednesday', am: 'ረቡዕ' },
  Friday: { en: 'Friday', am: 'አርብ' },
  Lent: { en: 'Lent', am: 'ዐቢይ ጾም' },
  'Fast of Nineveh': { en: 'Fast of Nineveh', am: 'ጾመ ነነዌ' },
  'Fast of Apostles': { en: 'Fast of the Apostles', am: 'ጾመ ሐዋርያት' },
  'Fast of Mary': { en: 'Fast of Mary', am: 'ጾመ ፍልሰታ' },
  Advent: { en: 'Advent', am: 'ጾመ ነቢያት' },
};

export function calendarLocale(mode: LanguageMode): string {
  return mode === 'am' ? 'am-ET' : 'en-US';
}

const GEEZ_TO_LATIN: Record<string, string> = {
  'ገና': 'Genna',
  'መስቀል': 'Meskel',
  'ጥምቀት': 'Timket',
  'እንቁጣጣሽ': 'Enkutatash',
  'ጾመ ነነዌ': 'Nineveh',
  'ጾመ ነቢያት': 'Nebiyat',
  'ዐቢይ ጾም': 'Hudadi',
  'ሰሙነ ሕማማት': 'Himamat',
  'ጾመ ሐዋርያት': 'Apostles',
  'ጾመ ፍልሰታ': 'Filseta',
  'ፍልሰታ': 'Filseta',
  'ሆሳዕና': 'Hosanna',
  'ስቅለት': 'Siqlet',
  'ፋሲካ': 'Fasika',
  'ዕርገት': 'Erget',
  'ጰራቅሊጦስ': 'Pentecost',
  'ኪዳነ ምሕረት': 'Kidane Mihret',
};

function isGeEzScript(text: string): boolean {
  return /[\u1200-\u137F]/.test(text);
}

/** Normalize English titles and pull out a Latin-alphabet alias when present. */
export function parseEnglishLabelParts(en: string): { english: string; local?: string } {
  const trimmed = en.trim();
  const match = trimmed.match(/^(.+?)\s*\((.+)\)\s*$/);
  if (!match) return { english: trimmed };

  const first = match[1].trim();
  const second = match[2].trim();
  const local = isGeEzScript(second) ? undefined : second;

  if (second.length > first.length) {
    return { english: second, local: isGeEzScript(first) ? undefined : first };
  }
  return { english: first, local };
}

function latinParenthetical(en: string, am: string): string | undefined {
  const { local } = parseEnglishLabelParts(en);
  if (local) return local;

  const amharic = am?.trim();
  if (amharic) return GEEZ_TO_LATIN[amharic];
  return undefined;
}

export type CalendarDisplayLabels = { primary: string; secondary?: string };

/** English on the first line; Latin alias on the second (en/bilingual). Amharic mode uses Ge'ez only. */
export function calendarDisplayLabels(en: string, am: string, mode: LanguageMode): CalendarDisplayLabels {
  const { english } = parseEnglishLabelParts(en);
  const amharic = am?.trim();

  if (mode === 'am') {
    return { primary: amharic || english };
  }

  const alias = latinParenthetical(en, am);
  if (!alias || alias.toLowerCase() === english.toLowerCase()) {
    return { primary: english };
  }
  return { primary: english, secondary: alias };
}

export function calendarRailLabels(
  en: string,
  am: string,
  mode: LanguageMode
): { title: string; subtitle?: string } {
  const labels = calendarDisplayLabels(en, am, mode);
  return { title: labels.primary, subtitle: labels.secondary };
}

export function parseSeasonBilingualName(name: string): { en: string; am: string | null } {
  const parts = name.split(' — ');
  if (parts.length >= 2) {
    return { en: parts[0].trim(), am: parts.slice(1).join(' — ').trim() };
  }
  return { en: name.trim(), am: null };
}

export function seasonBannerLabels(
  season: SeasonInfo,
  mode: LanguageMode
): CalendarDisplayLabels {
  const { am } = parseSeasonBilingualName(season.name);
  return calendarDisplayLabels(season.nameEn, am ?? '', mode);
}

export function getEthiopianMonthName(month: number, mode: LanguageMode): string {
  if (mode === 'am') {
    return i18n_Months_am[month as keyof typeof i18n_Months_am] ?? ETHIOPIAN_MONTH_NAMES_EN[month] ?? '';
  }
  return ETHIOPIAN_MONTH_NAMES_EN[month] ?? '';
}

export function formatGregorianMonthYear(month: number, year: number, mode: LanguageMode): string {
  const monthName = new Date(year, month, 1).toLocaleDateString(calendarLocale(mode), {
    month: 'long',
  });
  return `${monthName} ${year}`;
}

export function formatGregorianDateLong(date: Date, mode: LanguageMode): string {
  return date.toLocaleDateString(calendarLocale(mode), {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatGregorianDateShort(date: Date, mode: LanguageMode): string {
  return date.toLocaleDateString(calendarLocale(mode), {
    month: 'short',
    day: 'numeric',
  });
}

export function formatGregorianWeekdayDate(
  date: Date,
  month: number,
  day: number,
  mode: LanguageMode
): string {
  const weekday = new Date(date).toLocaleDateString(calendarLocale(mode), { weekday: 'long' });
  const monthName = new Date(date.getFullYear(), month, 1).toLocaleDateString(calendarLocale(mode), {
    month: 'long',
  });
  return `${weekday}, ${monthName} ${day}`;
}

export function formatEthiopianDateLong(eth: EthiopianDateInfo, mode: LanguageMode): string {
  const monthName = getEthiopianMonthName(eth.month, mode);
  const suffix = mode === 'am' ? ' ዓ.ም.' : ' E.C.';
  return `${monthName} ${eth.day}, ${eth.year}${suffix}`;
}

export function formatEthiopianMonthsLabel(months: number[], ethYear: number, mode: LanguageMode): string {
  const monthNames = months
    .map((month) => getEthiopianMonthName(month, mode))
    .filter(Boolean)
    .join(mode === 'am' ? ' / ' : ' / ');
  return monthNames.length > 0 ? `${monthNames} ${ethYear}` : `${ethYear}`;
}

export function formatEvangelistYearLabel(evangelist: EvangelistYear, mode: LanguageMode): string {
  return learnText(`Year of ${evangelist.name}`, `የ${evangelist.nameAm} ዓመት`, mode);
}

export function weekdayShortLabels(mode: LanguageMode): readonly string[] {
  return mode === 'am' ? WEEKDAYS_SHORT_AM : WEEKDAYS_SHORT_EN;
}

export function localizeFastingReason(reason: string | null, mode: LanguageMode): string | null {
  if (!reason) return null;
  const entry = FASTING_REASONS[reason];
  if (!entry) return reason;
  return learnText(entry.en, entry.am, mode);
}

export function feastDisplayLabels(
  nameEn: string,
  nameAm: string,
  mode: LanguageMode
): CalendarDisplayLabels {
  return calendarDisplayLabels(nameEn, nameAm, mode);
}

export function showsEnglishCalendarCopy(mode: LanguageMode): boolean {
  return mode === 'en' || mode === 'bilingual';
}
