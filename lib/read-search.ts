import {
  BIBLE_CANON_81,
  getBookTitle,
  NEW_TESTAMENT_BOOKS,
  OLD_TESTAMENT_BOOKS,
  type BibleBook,
} from '@/data/bibleCanon';
import { HOROLOGIUM_HOURS } from '@/data/horologium';
import { buildSearchSnippet } from '@/lib/search-snippets';
import { parseChapterReference, parseScriptureReference, searchVerses, type VerseSearchResult } from '@/lib/scripture';
import type { ScriptureLang } from '@/types/scripture';

export type ReadSearchHeaderHit = {
  id: string;
  title: string;
  subtitle?: string;
};

export type ReadSearchContentHit = {
  id: string;
  title: string;
  subtitle?: string;
  snippet: string;
  bookId?: string;
  chapter?: number;
  verse?: number;
  horologiumHourId?: string;
};

type CatalogEntry = {
  id: string;
  titles: string[];
  subtitle?: string;
  route: '/horologium' | '/catalog' | '/read/catalog';
};

/** Everything browsable from the Read tab — not just the 81-book canon. */
const READ_CATALOG: CatalogEntry[] = [
  {
    id: 'horologium',
    titles: [
      "Matshafa Se'atat",
      'መጽሐፈ ሰዓታት',
      'Horologium',
      'Book of Hours',
      "Se'atat",
    ],
    subtitle: 'Book of Hours · 7 Canonical Prayers',
    route: '/horologium',
  },
  {
    id: 'bible',
    titles: ['Holy Bible', 'መጽሐፍ ቅዱስ', 'Metsafe Kidus', 'Scripture', 'Bible'],
    subtitle: '81 Books · EOTC Canon',
    route: '/catalog',
  },
  {
    id: 'catalog',
    titles: ['Orthodox Catalog', 'ዝርዝረ መጻሕፍት', 'Sacred texts', 'Catalog'],
    subtitle: 'All sacred manuscripts',
    route: '/read/catalog',
  },
  {
    id: 'liturgy',
    titles: ['Liturgy', 'Kidase', 'The Liturgy', 'Kidase'],
    subtitle: 'Divine Liturgy',
    route: '/catalog',
  },
];

function matchesQuery(text: string, q: string): boolean {
  return text.toLowerCase().includes(q);
}

function bookMatches(book: BibleBook, q: string, raw: string, lang: ScriptureLang): boolean {
  return (
    matchesQuery(book.title_english, q) ||
    matchesQuery(book.title_vernacular, q) ||
    matchesQuery(book.title_geez, q) ||
    book.title_vernacular.includes(raw) ||
    book.title_geez.includes(raw) ||
    matchesQuery(getBookTitle(book, lang), q)
  );
}

/** Books, catalog entries, prayer hours, and chapter references on the Read tab. */
export function searchReadHeaders(term: string, lang: ScriptureLang): ReadSearchHeaderHit[] {
  const raw = term.trim();
  const q = raw.toLowerCase();
  if (!q) return [];

  const hits: ReadSearchHeaderHit[] = [];
  const seen = new Set<string>();

  const push = (hit: ReadSearchHeaderHit) => {
    if (seen.has(hit.id)) return;
    seen.add(hit.id);
    hits.push(hit);
  };

  for (const entry of READ_CATALOG) {
    if (entry.titles.some((title) => matchesQuery(title, q) || title.includes(raw))) {
      push({
        id: `catalog-${entry.id}`,
        title: entry.titles[0],
        subtitle: entry.subtitle,
      });
    }
  }

  if (matchesQuery('old testament', q) || matchesQuery('ብሉይ ኪዳን', q)) {
    push({
      id: 'testament-ot',
      title: 'Old Testament',
      subtitle: `${OLD_TESTAMENT_BOOKS.length} books`,
    });
  }
  if (matchesQuery('new testament', q) || matchesQuery('አዲስ ኪዳን', q)) {
    push({
      id: 'testament-nt',
      title: 'New Testament',
      subtitle: `${NEW_TESTAMENT_BOOKS.length} books`,
    });
  }

  for (const book of BIBLE_CANON_81) {
    if (!bookMatches(book, q, raw, lang)) continue;
    push({
      id: `book-${book.book_id}`,
      title: getBookTitle(book, lang),
      subtitle: `${book.testament} · ${book.canon_tier} canon`,
    });
  }

  for (const hour of HOROLOGIUM_HOURS) {
    const hourTexts = [
      hour.nameEnglish,
      hour.nameAmharic,
      hour.nameGeez,
      hour.timeLabel,
      hour.description,
    ];
    if (hourTexts.some((text) => matchesQuery(text, q) || text.includes(raw))) {
      push({
        id: `hour-${hour.id}`,
        title: hour.nameEnglish,
        subtitle: `${hour.nameGeez} · ${hour.timeLabel}`,
      });
    }
  }

  const chapterRef = parseChapterReference(raw);
  if (chapterRef) {
    const book = BIBLE_CANON_81.find((b) => b.book_id === chapterRef.bookId);
    const bookTitle = book ? getBookTitle(book, lang) : chapterRef.bookId;
    push({
      id: `chapter:${chapterRef.bookId}:${chapterRef.chapter}`,
      title: `${bookTitle} ${chapterRef.chapter}`,
      subtitle: 'Chapter',
    });
  }

  const verseRef = parseScriptureReference(raw);
  if (verseRef) {
    const book = BIBLE_CANON_81.find((b) => b.book_id === verseRef.bookId);
    const bookTitle = book ? getBookTitle(book, lang) : verseRef.bookId;
    push({
      id: `verse-ref:${verseRef.bookId}:${verseRef.chapter}:${verseRef.verse}`,
      title: `${bookTitle} ${verseRef.chapter}:${verseRef.verse}`,
      subtitle: 'Verse',
    });
  }

  return hits.slice(0, 12);
}

/** Prayer text and verse matches across everything on the Read tab. */
export async function searchReadContent(
  term: string,
  lang: ScriptureLang
): Promise<ReadSearchContentHit[]> {
  const raw = term.trim();
  const q = raw.toLowerCase();
  if (!q) return [];

  const hits: ReadSearchContentHit[] = [];

  for (const hour of HOROLOGIUM_HOURS) {
    const blocks: { label: string; text: string }[] = [
      { label: hour.nameEnglish, text: hour.description },
      { label: 'Opening', text: hour.openingPrayers.join(' ') },
      { label: 'Intercessions', text: hour.intercessions.join(' ') },
      { label: 'Closing', text: hour.closingPrayer },
    ];

    for (const block of blocks) {
      if (!matchesQuery(block.text, q)) continue;
      hits.push({
        id: `horologium-${hour.id}-${block.label}`,
        title: hour.nameEnglish,
        subtitle: block.label,
        snippet: buildSearchSnippet(block.text, raw),
        horologiumHourId: hour.id,
      });
      break;
    }
    if (hits.length >= 20) return hits;
  }

  const verseHits: VerseSearchResult[] = await searchVerses(raw, lang);
  for (const hit of verseHits) {
    hits.push({
      id: `verse-${hit.bookId}-${hit.chapter}-${hit.verse}`,
      title: hit.reference,
      snippet: hit.snippet,
      bookId: hit.bookId,
      chapter: hit.chapter,
      verse: hit.verse,
    });
    if (hits.length >= 20) return hits;
  }

  return hits;
}

export function resolveReadHeaderRoute(
  hitId: string,
  lang: ScriptureLang
): { pathname: string; params?: Record<string, string> } | null {
  if (hitId.startsWith('catalog-')) {
    const id = hitId.replace('catalog-', '');
    const entry = READ_CATALOG.find((e) => e.id === id);
    return entry ? { pathname: entry.route } : null;
  }
  if (hitId.startsWith('book-')) {
    const bookId = hitId.slice('book-'.length);
    return { pathname: `/book/${bookId}`, params: { lang } };
  }
  if (hitId.startsWith('hour-')) {
    const hourId = hitId.slice('hour-'.length);
    return { pathname: `/horologium/${hourId}` };
  }
  if (hitId.startsWith('chapter:')) {
    const [, bookId, chapter] = hitId.split(':');
    if (!bookId || !chapter) return null;
    return { pathname: `/book/${bookId}/${chapter}`, params: { lang } };
  }
  if (hitId.startsWith('verse-ref:')) {
    const [, bookId, chapter, verse] = hitId.split(':');
    if (!bookId || !chapter || !verse) return null;
    return { pathname: `/book/${bookId}/${chapter}`, params: { lang, verse } };
  }
  if (hitId === 'testament-ot' || hitId === 'testament-nt') {
    return { pathname: '/catalog', params: { lang } };
  }
  return null;
}
