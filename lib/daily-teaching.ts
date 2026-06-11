import { DAILY_TEACHINGS, type DailyTeaching } from '@/data/daily-teachings';
import { formatGregorianDateLong } from '@/lib/calendar-i18n';
import { learnText } from '@/lib/learn-i18n';
import type { LanguageMode } from '@/lib/translations';

export type ResolvedDailyTeaching = {
  teaching: DailyTeaching;
  dateKey: string;
  dateLabel: string;
  title: string;
  category: string;
  paragraphs: string[];
  scripture: {
    text: string;
    reference: string;
    bookId?: string;
    chapter?: number;
  };
  reflection: string;
  prayer: string;
  saveSlug: string;
};

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dayOfYearIndex(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 86_400_000;
  return Math.floor(diff / oneDay);
}

export function getDailyTeachingForDate(date: Date): DailyTeaching {
  const index = dayOfYearIndex(date) % DAILY_TEACHINGS.length;
  return DAILY_TEACHINGS[index];
}

export function resolveDailyTeaching(date: Date, mode: LanguageMode): ResolvedDailyTeaching {
  const teaching = getDailyTeachingForDate(date);
  const dateKey = toDateKey(date);

  return {
    teaching,
    dateKey,
    dateLabel: formatGregorianDateLong(date, mode),
    title: learnText(teaching.titleEn, teaching.titleAm, mode),
    category: learnText(teaching.categoryEn, teaching.categoryAm, mode),
    paragraphs: teaching.paragraphsEn.map((en, index) =>
      learnText(en, teaching.paragraphsAm[index] ?? en, mode)
    ),
    scripture: {
      text: learnText(teaching.scripture.textEn, teaching.scripture.textAm, mode),
      reference: learnText(teaching.scripture.referenceEn, teaching.scripture.referenceAm, mode),
      bookId: teaching.scripture.bookId,
      chapter: teaching.scripture.chapter,
    },
    reflection: learnText(teaching.reflectionEn, teaching.reflectionAm, mode),
    prayer: learnText(teaching.prayerEn, teaching.prayerAm, mode),
    saveSlug: `daily-teaching-${dateKey}`,
  };
}

export function buildDailyTeachingShareMessage(resolved: ResolvedDailyTeaching): string {
  return [
    resolved.title,
    resolved.dateLabel,
    '',
    resolved.paragraphs[0] ?? '',
    '',
    `\u201C${resolved.scripture.text}\u201D`,
    resolved.scripture.reference,
  ].join('\n');
}
