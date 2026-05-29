import am from './am';
import en from './en';
import gez from './gez';
import type { HeaderDisplay, HeaderKey, LanguageMode, TabKey, TranslationKey } from './types';

export type { HeaderDisplay, HeaderKey, LanguageMode, TabKey, TranslationKey } from './types';
export { en, am, gez };

const STORAGE_KEY = '@orthodox/language_mode';

export const LANGUAGE_MODES: { mode: LanguageMode; labelKey: TranslationKey }[] = [
  { mode: 'en', labelKey: 'settings.modeEn' },
  { mode: 'bilingual', labelKey: 'settings.modeBilingual' },
  { mode: 'am', labelKey: 'settings.modeAm' },
];

type Params = Record<string, string | number>;

function getNested(obj: Record<string, unknown>, path: string | undefined): string | undefined {
  if (!path || typeof path !== 'string') return undefined;
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === 'string' ? cur : undefined;
}

export function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const val = params[key];
    return val !== undefined ? String(val) : `{{${key}}}`;
  });
}

export function translate(key: TranslationKey, mode: LanguageMode, params?: Params): string {
  if (!key || typeof key !== 'string') return '';
  const dict = mode === 'am' ? am : en;
  const raw = getNested(dict as Record<string, unknown>, key);
  return interpolate(raw ?? key, params);
}

export function getTabLabel(key: TabKey, mode: LanguageMode): string {
  if (mode === 'am') return translate(`tabs.${key}`, 'am');
  return translate(`tabs.${key}`, 'en');
}

export function normalizeStoredMode(stored: string | null): LanguageMode {
  if (stored === 'am' || stored === 'bilingual' || stored === 'en') return stored;
  if (stored === 'liturgical') return 'en';
  // Default to bilingual so headers show both Amharic + English out of the box;
  // users can switch via the globe icon → language sheet.
  return 'bilingual';
}

function resolveHeaderPath(key: HeaderKey) {
  if (
    key.startsWith('learn.') ||
    key.startsWith('listen.') ||
    key.startsWith('calendar.') ||
    key.startsWith('content.')
  ) {
    return {
      enKey: key as TranslationKey,
      amKey: key as TranslationKey,
      geezKey: getNested(gez as Record<string, unknown>, key),
    };
  }
  const inNav = key in en.nav;
  const namespace = inNav ? 'nav' : 'sections';
  const k = key as string;
  return {
    enKey: `${namespace}.${k}` as TranslationKey,
    amKey: `${namespace}.${k}` as TranslationKey,
    geezKey: getNested(gez as Record<string, unknown>, `${namespace}.${k}`),
  };
}

export function resolveHeader(key: HeaderKey, mode: LanguageMode): HeaderDisplay {
  const paths = resolveHeaderPath(key);
  const english = translate(paths.enKey, 'en');
  const amharic = getNested(am as Record<string, unknown>, paths.amKey) ?? english;
  const geezAccent = paths.geezKey ?? amharic;

  if (mode === 'am') return { primary: amharic, layout: 'amharic' };
  if (mode === 'bilingual') return { primary: english, accent: amharic, layout: 'inline' };
  return { primary: english, layout: 'english' };
}

/** True when a translated accent should appear beside English (bilingual only). */
export function showsTranslatedAccent(mode: LanguageMode): boolean {
  return mode === 'bilingual';
}

export function getStorageKey(): string {
  return STORAGE_KEY;
}

export function isAmharicMode(mode: LanguageMode): boolean {
  return mode === 'am';
}
