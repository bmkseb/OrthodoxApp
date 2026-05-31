import type { LanguageMode } from '@/lib/translations';

export function learnText(en: string, am: string, mode: LanguageMode): string {
  const amharic = am?.trim();
  if (mode === 'am') return amharic || en;
  // English first, then Amharic in Ge'ez script — and omit Amharic when it's
  // missing or identical to the English (avoids "English | English").
  if (mode === 'bilingual' && amharic && amharic !== en) return `${en}  ${amharic}`;
  return en;
}

export function levelLabel(level: 'foundational' | 'advanced' | 'liturgical', mode: LanguageMode): string {
  const labels = {
    foundational: { en: 'Foundational', am: 'መሠረታዊ' },
    advanced: { en: 'Advanced', am: 'የላቀ' },
    liturgical: { en: 'Liturgical', am: 'ቅዳሴያዊ' },
  };
  const l = labels[level];
  return learnText(l.en, l.am, mode);
}
