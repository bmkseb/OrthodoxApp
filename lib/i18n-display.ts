import type { LanguageMode } from '@/lib/translations';

/**
 * Bilingual copy helper — English-only mode NEVER shows Amharic.
 * Hybrid uses ` | ` between accent and English (inline, accent first).
 */
export function localizedText(
  english: string,
  amharic: string,
  mode: LanguageMode,
  separator: string = ' | '
): string {
  if (mode === 'am') return amharic;
  if (mode === 'bilingual') return `${amharic}${separator}${english}`;
  return english;
}

/** @deprecated use localizedText */
export const learnText = localizedText;
