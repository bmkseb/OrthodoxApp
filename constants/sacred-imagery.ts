/** Curated sacred imagery — monasteries, fog, candlelight, manuscripts (warm muted grade). */
export const SacredImagery = {
  readingHero:
    'https://images.unsplash.com/photo-1509316785289-025f5b846398?w=1200&q=80&auto=format&fit=crop',
  readingJohn:
    'https://images.unsplash.com/photo-1470071459604-3b5ec3ee7b3d?w=800&q=80&auto=format&fit=crop',
  readingPsalms:
    'https://images.unsplash.com/photo-1518173946687-a81c461964be?w=800&q=80&auto=format&fit=crop',
  reflection:
    'https://images.unsplash.com/photo-1519682337059-a94d519337bc?w=1200&q=80&auto=format&fit=crop',
  prayerDaily:
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80&auto=format&fit=crop',
  prayerMary:
    'https://images.unsplash.com/photo-1528360983277-13ca9d060de6?w=600&q=80&auto=format&fit=crop',
  prayerOrthodox:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format&fit=crop',
  continueHorologium:
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80&auto=format&fit=crop',
  continueBible:
    'https://images.unsplash.com/photo-1419242902214-272b403754b7?w=600&q=80&auto=format&fit=crop',
  continueLiturgy:
    'https://images.unsplash.com/photo-1509316975882-7a37f46b5c0e?w=600&q=80&auto=format&fit=crop',
  listenHymns:
    'https://images.unsplash.com/photo-1519682337059-a94d519337bc?w=800&q=80&auto=format&fit=crop',
  listenSermons:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&auto=format&fit=crop',
  listenMelodies:
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80&auto=format&fit=crop',
  readFeatured:
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&q=80&auto=format&fit=crop',
  readManuscript:
    'https://images.unsplash.com/photo-1509316975882-7a37f46b5c0e?w=600&q=80&auto=format&fit=crop',
  learnContinue:
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&q=80&auto=format&fit=crop',
} as const;

export const EXPLORE_QUICK_CHIPS = [
  { id: 'reading', labelKey: 'explore.chipDailyReading' as const, icon: 'book' as const },
  { id: 'prayer', labelKey: 'explore.chipPrayer' as const, icon: 'sun' as const },
  { id: 'hymns', labelKey: 'explore.chipHymns' as const, icon: 'music' as const },
  { id: 'saints', labelKey: 'explore.chipSaints' as const, icon: 'cross' as const },
] as const;
