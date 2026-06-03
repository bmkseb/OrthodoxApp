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
      id: 'sermon-rise-week-8',
      title: 'Rise & Measure (Week 8)',
      subtitle: 'SPOT Church',
      titleNeedle: 'Rise & Measure (Week 8)',
      videoId: 'kGaqDpBNk18',
      image: SacredImagery.listenSermons,
    },
    {
      id: 'sermon-lent-resurrection',
      title: 'The Resurrection Of Christ',
      subtitle: 'SPOT Church · Great Lent 2026',
      titleNeedle: 'The Resurrection Of Christ',
      videoId: 'r8oEIePeAsI',
      image: SacredImagery.listenSermons,
    },
    {
      id: 'sermon-lent-light',
      title: 'The Light Has Come Into The World',
      subtitle: 'SPOT Church · Great Lent 2026',
      titleNeedle: 'The Light Has Come Into The World',
      videoId: 'fORJ7m3vt6s',
      image: SacredImagery.prayerOrthodox,
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
