import { type Href } from 'expo-router';

import { type IconName } from '@/components/Icon';
import { resolveReadCoverSource, type ReadCoverSource } from '@/constants/read-cover-art';
import { SacredImagery } from '@/constants/sacred-imagery';

export type CatalogGenre = 'scripture' | 'prayer';

export type CatalogBook = {
  id: string;
  title: string;
  subtitle: string;
  /** Ge'ez/Amharic title, shown in non-English UI modes. */
  geez: string;
  /** Leading glyph that gives each row a distinct identity. */
  icon: IconName;
  /** Optional subsection label used to group rows within a shelf. */
  group?: string;
  image: ReadCoverSource;
  route: Href;
};

export type CatalogShelfData = {
  genre: CatalogGenre;
  title: string;
  geez: string;
  description: string;
  /** Compact metadata chips shown under the description. */
  highlights: string[];
  books: CatalogBook[];
};

const SCRIPTURE_BOOKS: CatalogBook[] = [
  {
    id: 'bible',
    title: 'Holy Bible',
    subtitle: '81 Books · EOTC Canon',
    geez: 'መጽሐፍ ቅዱስ',
    icon: 'book',
    image: resolveReadCoverSource('bible', SacredImagery.continueBible),
    route: '/catalog',
  },
  {
    id: 'enoch',
    title: 'Book of Enoch',
    subtitle: 'Metshafe Henok · In the Holy Bible',
    geez: 'መጽሐፈ ሄኖክ',
    icon: 'scroll',
    image: resolveReadCoverSource('bible', SacredImagery.continueBible),
    route: '/book/enoch/1' as Href,
  },
];

const PRAYER_BOOKS: CatalogBook[] = [
  {
    id: 'daily-prayer',
    title: 'Daily Prayer',
    subtitle: 'YeZewitir Tselot · Everyday Prayers',
    geez: 'የዘወትር ጸሎት',
    icon: 'sun',
    group: 'Daily Use',
    image: resolveReadCoverSource('daily-prayer', SacredImagery.prayerDaily),
    route: '/prayer/daily-prayer' as Href,
  },
  {
    id: 'wudase-mariam',
    title: 'Praise of Our Lady Mary',
    subtitle: 'Prayers to the Theotokos',
    geez: 'ውዳሴ ማርያም',
    icon: 'cross',
    group: 'Marian Praises',
    image: resolveReadCoverSource('wudase-mariam', SacredImagery.prayerMary),
    route: '/prayer/wudase-mariam' as Href,
  },
  {
    id: 'horologium',
    title: "Matshafa Se'atat",
    subtitle: 'Book of Hours · 7 Canonical Prayers',
    geez: 'መጽሐፈ ሰዓታት',
    icon: 'church',
    group: 'Divine Services',
    image: resolveReadCoverSource('horologium', SacredImagery.readManuscript),
    route: '/horologium' as Href,
  },
  {
    id: 'liturgy',
    title: 'The Liturgy',
    subtitle: 'Kidase · The Divine Liturgy',
    geez: 'ቅዳሴ',
    icon: 'cross',
    group: 'Divine Services',
    image: resolveReadCoverSource('liturgy', SacredImagery.continueLiturgy),
    route: '/catalog' as Href,
  },
];

/** The Orthodox Catalog, organized into genre shelves. */
export const CATALOG_SHELVES: CatalogShelfData[] = [
  {
    genre: 'scripture',
    title: 'Scripture',
    geez: 'መጻሕፍተ ቅዱሳት',
    description: 'The canonical Scriptures of the Ethiopian Orthodox Tewahedo Church.',
    highlights: ['81 Books', 'EOTC Canon', 'Sacred Scripture'],
    books: SCRIPTURE_BOOKS,
  },
  {
    genre: 'prayer',
    title: 'Prayer',
    geez: 'ጸሎታት',
    description: 'Prayers, praises, and the divine services of the Church.',
    highlights: ['Daily Office', 'Marian Praises', 'Divine Liturgy'],
    books: PRAYER_BOOKS,
  },
];

/** Resolve a shelf by genre, defaulting to Scripture for unknown values. */
export function shelfForGenre(genre: string | undefined): CatalogShelfData {
  return CATALOG_SHELVES.find((shelf) => shelf.genre === genre) ?? CATALOG_SHELVES[0];
}
