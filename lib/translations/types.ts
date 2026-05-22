export type LanguageMode = 'en' | 'bilingual' | 'am';

export type TabKey = keyof TranslationDictionary['tabs'];

export type TranslationDictionary = typeof import('./en').default;

export type TranslationKey =
  | `nav.${keyof TranslationDictionary['nav']}`
  | `sections.${keyof TranslationDictionary['sections']}`
  | `learn.${keyof TranslationDictionary['learn']}`
  | `listen.${keyof TranslationDictionary['listen']}`
  | `calendar.${keyof TranslationDictionary['calendar']}`
  | `catalog.${keyof TranslationDictionary['catalog']}`
  | `settings.${keyof TranslationDictionary['settings']}`
  | `common.${keyof TranslationDictionary['common']}`
  | `greeting.${keyof TranslationDictionary['greeting']}`
  | `tabs.${keyof TranslationDictionary['tabs']}`
  | `content.${keyof TranslationDictionary['content']}`
  | `explore.${keyof TranslationDictionary['explore']}`;

export type HeaderKey =
  | keyof TranslationDictionary['nav']
  | keyof TranslationDictionary['sections']
  | `learn.${keyof TranslationDictionary['learn']}`
  | `listen.${keyof TranslationDictionary['listen']}`
  | `calendar.${keyof TranslationDictionary['calendar']}`
  | `content.${keyof TranslationDictionary['content']}`;

export type HeaderDisplay = {
  primary: string;
  accent?: string;
  layout: 'inline' | 'amharic' | 'english';
};
