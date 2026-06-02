import { SacredImagery } from '@/constants/sacred-imagery';
import type { TranslationKey } from '@/lib/translations';

export type ListenFeaturedTab = 'hymns' | 'sermons' | 'melodies';

export type ListenFeaturedSeed = {
  id: string;
  title?: string;
  subtitle?: string;
  titleKey?: TranslationKey;
  subtitleKey?: TranslationKey;
  /** When set, plays a catalog song whose title contains this string (if found). */
  titleNeedle?: string;
  image: string;
  /** Chants tab — opens playlist detail. */
  melodyPlaylistId?: string;
};

/** Three curated featured cards per Listen tab. */
export const LISTEN_FEATURED_SEEDS: Record<ListenFeaturedTab, ListenFeaturedSeed[]> = {
  hymns: [
    {
      id: 'hymn-covenant',
      title: 'Covenant of Mercy',
      subtitle: 'Helena Alemu',
      titleNeedle: 'Covenant of Mercy',
      image: SacredImagery.listenHymns,
    },
    {
      id: 'hymn-wudase',
      title: 'Wudase Mariam',
      subtitle: 'Marian Hymn',
      titleNeedle: 'Wudase',
      image: SacredImagery.prayerMary,
    },
    {
      id: 'hymn-trinity',
      title: 'Praise to the Trinity',
      subtitle: 'Orthodox Hymn',
      titleNeedle: 'Trinity',
      image: SacredImagery.readManuscript,
    },
  ],
  sermons: [
    {
      id: 'sermon-repentance',
      title: 'The Path of Repentance',
      subtitle: 'Fr. Daniel Habtemariam',
      titleNeedle: 'Repentance',
      image: SacredImagery.listenSermons,
    },
    {
      id: 'sermon-faith',
      title: 'Living by Faith',
      subtitle: 'Sunday Homily',
      titleNeedle: 'Faith',
      image: SacredImagery.prayerOrthodox,
    },
    {
      id: 'sermon-gospel',
      title: 'The Gospel Today',
      subtitle: 'Parish Teaching',
      titleNeedle: 'Gospel',
      image: SacredImagery.listenSermons,
    },
  ],
  melodies: [
    {
      id: 'melody-geez',
      titleKey: 'listen.yaredGez',
      subtitleKey: 'listen.yaredShelfYaredawi',
      melodyPlaylistId: 'geez',
      image: SacredImagery.listenMelodies,
    },
    {
      id: 'melody-wudase',
      titleKey: 'listen.yaredWudaseMariam',
      subtitleKey: 'listen.yaredShelfDailyPrayer',
      melodyPlaylistId: 'wudase-mariam',
      image: SacredImagery.prayerMary,
    },
    {
      id: 'melody-timkat',
      titleKey: 'listen.yaredTimkat',
      subtitleKey: 'listen.yaredShelfMahletFeast',
      melodyPlaylistId: 'timkat',
      image: SacredImagery.continueLiturgy,
    },
  ],
};
