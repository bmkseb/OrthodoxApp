import { translate, type LanguageMode, type TranslationKey } from '@/lib/translations';

export type PlayerTrackCopy = {
  title: string;
  artist: string;
  /** Section label — Hymn, Sermon, Melody (never duplicates title). */
  categoryLabel?: string;
  /** Optional tiny secondary line (Ge'ez accent) when not merged into title. */
  accentLine?: string;
};

type ResolveOptions = {
  mode: LanguageMode;
  titleKey?: TranslationKey;
  title?: string;
  artistKey?: TranslationKey;
  artist?: string;
  categoryLabel?: string;
};

/** Bilingual player title rules — single title line, no duplication. */
export function resolvePlayerTrackCopy({
  mode,
  titleKey,
  title,
  artistKey,
  artist,
  categoryLabel,
}: ResolveOptions): PlayerTrackCopy {
  const resolvedArtist = artistKey ? translate(artistKey, mode === 'am' ? 'am' : 'en') : (artist ?? '');
  const resolvedCategory = categoryLabel;

  if (titleKey === 'listen.yaredMelody') {
    const en = translate('listen.yaredMelody', 'en');
    const am = translate('listen.yaredMelody', 'am');
    if (mode === 'am') {
      return { title: am, artist: resolvedArtist, categoryLabel: resolvedCategory };
    }
    if (mode === 'bilingual') {
      return { title: en, artist: resolvedArtist, categoryLabel: resolvedCategory };
    }
    return { title: en, artist: resolvedArtist, categoryLabel: resolvedCategory };
  }

  const resolvedTitle = titleKey
    ? translate(titleKey, mode === 'am' ? 'am' : 'en')
    : (title ?? '');

  return {
    title: resolvedTitle,
    artist: resolvedArtist,
    categoryLabel: resolvedCategory,
  };
}

/** Re-resolve display copy when language mode changes. */
export function resolvePlayerCopyFromTrack(
  mode: LanguageMode,
  track: {
    title: string;
    artist: string;
    category?: string;
    titleKey?: TranslationKey;
    artistKey?: TranslationKey;
    categoryLabel?: string;
  }
): PlayerTrackCopy {
  if (track.titleKey || track.artistKey) {
    return resolvePlayerTrackCopy({
      mode,
      titleKey: track.titleKey,
      title: track.title,
      artistKey: track.artistKey,
      artist: track.artist,
      categoryLabel: track.categoryLabel ?? track.category,
    });
  }
  return {
    title: track.title,
    artist: track.artist,
    categoryLabel: track.categoryLabel ?? track.category,
  };
}
