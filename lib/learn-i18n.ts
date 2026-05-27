import type { LanguageMode } from '@/lib/translations';

export function learnText(en: string, am: string, mode: LanguageMode): string {
  if (mode === 'am') return am;
  if (mode === 'bilingual') return `${am} | ${en}`;
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
