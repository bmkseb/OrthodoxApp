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
  /** Prefer this video when multiple catalog titles match the needle. */
  videoId?: string;
  image: string;
  /** Chants tab — opens playlist detail. */
  melodyPlaylistId?: string;
};

/** Three curated featured cards per Listen tab. */
export const LISTEN_FEATURED_SEEDS: Record<ListenFeaturedTab, ListenFeaturedSeed[]> = {
  hymns: [
    {
      id: 'hymn-please-you',
      title: 'With What Shall I Please You',
      subtitle: 'Mezmur Debter Zetewahedo',
      titleNeedle: 'With What Shall I Please You',
      videoId: 'CIGBJy_B3VI',
      image: SacredImagery.prayerMary,
    },
    {
      id: 'hymn-alone',
      title: "I Can't Do It Alone",
      subtitle: 'Y.O.T.C. Choir',
      titleNeedle: "Can't Do It Alone",
      videoId: 'HTihxcq1INg',
      image: SacredImagery.listenHymns,
    },
    {
      id: 'hymn-covenant',
      title: 'Covenant of Mercy',
      subtitle: 'Helena Alemu',
      titleNeedle: 'Covenant of Mercy',
      videoId: 'aLQqecKcAMQ',
      image: SacredImagery.listenHymns,
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
