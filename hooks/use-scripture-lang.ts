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
