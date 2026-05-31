import { useLocalSearchParams } from 'expo-router';

import type { ScriptureLang } from '@/types/scripture';

const VALID: ScriptureLang[] = ['english', 'amharic', 'geez'];

export function useScriptureLang(): ScriptureLang {
  const { lang } = useLocalSearchParams<{ lang?: string }>();
  if (lang && VALID.includes(lang as ScriptureLang)) {
    return lang as ScriptureLang;
  }
  return 'english';
}

export function scriptureLangQuery(lang: ScriptureLang): string {
  return `?lang=${lang}`;
}

/** Build a typed chapter route, optionally jumping to a specific verse. */
export function scriptureChapterRoute(
  bookId: string,
  chapter: number,
  lang: ScriptureLang,
  verse?: number
) {
  return {
    pathname: '/book/[bookId]/[chapter]' as const,
    params: {
      bookId,
      chapter: String(chapter),
      lang,
      ...(verse && Number.isFinite(verse) ? { verse: String(verse) } : {}),
    },
  };
}
