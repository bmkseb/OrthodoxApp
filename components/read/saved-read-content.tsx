import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { SavedChapterRow } from '@/components/read/saved-chapter-row';
import { SavedVerseRow } from '@/components/read/saved-verse-row';
import { BookshelfSection } from '@/components/read/bookshelf-section';
import { ShelfSubsectionHeader } from '@/components/read/shelf-subsection-header';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { SacredImagery } from '@/constants/sacred-imagery';
import { Layout, Space, Spacing } from '@/constants/theme';
import {
  makeBookmarkId,
  removeBookmark,
  useBookmarks,
} from '@/hooks/use-bookmarks';
import { isPrayerBookId, prayerSlugFromBookId } from '@/hooks/use-reading-progress';
import { useTranslation } from '@/hooks/use-translation';
import { removeSavedVerse, useSavedVerses } from '@/hooks/use-saved-verses';
import { scriptureChapterRoute, scriptureLangQuery } from '@/hooks/use-scripture-lang';
import type { ScriptureLang } from '@/types/scripture';

/** Reader route for a saved page/verse — prayer books and scripture differ. */
function readerRoute(bookId: string, chapter: number, lang: ScriptureLang): string {
  if (isPrayerBookId(bookId)) {
    return `/prayer/${prayerSlugFromBookId(bookId)}/${chapter}?lang=${lang}`;
  }
  return `/book/${bookId}/${chapter}${scriptureLangQuery(lang)}`;
}

function savedImageForBook(bookId: string): string {
  return isPrayerBookId(bookId) ? SacredImagery.prayerDaily : SacredImagery.continueBible;
}

function ListDivider() {
  return <View style={styles.divider} />;
}

type SavedChapterListProps = {
  limit?: number;
  variant?: 'list' | 'catalog';
};

export function SavedChapterList({ limit, variant = 'list' }: SavedChapterListProps) {
  const { bookmarks } = useBookmarks();
  const items = limit != null ? bookmarks.slice(0, limit) : bookmarks;
  const isCatalog = variant === 'catalog';

  if (bookmarks.length === 0) {
    if (isCatalog) {
      return (
        <ThemedText type="muted" style={styles.subsectionEmpty}>
          No saved chapters yet.
        </ThemedText>
      );
    }

    return (
      <BookshelfSection list>
        <ThemedText type="muted" style={styles.subsectionEmpty}>
          No saved chapters yet.
        </ThemedText>
      </BookshelfSection>
    );
  }

  const rows = items.map((bookmark, index) => {
    const id = makeBookmarkId(bookmark.bookId, bookmark.chapter);
    return (
      <View key={id}>
        <SavedChapterRow
          title={bookmark.bookTitle}
          chapter={bookmark.chapter}
          thumbnailUrl={savedImageForBook(bookmark.bookId)}
          variant={variant}
          onPress={() =>
            router.push(
              readerRoute(bookmark.bookId, bookmark.chapter, bookmark.lang) as never
            )
          }
          onRemove={() => void removeBookmark(id)}
        />
        {index < items.length - 1 ? <ListDivider /> : null}
      </View>
    );
  });

  if (isCatalog) {
    return <View style={styles.catalogList}>{rows}</View>;
  }

  return (
    <BookshelfSection list>
      <View style={styles.list}>{rows}</View>
    </BookshelfSection>
  );
}

type SavedVerseListProps = {
  limit?: number;
  variant?: 'list' | 'catalog';
};

export function SavedVerseList({ limit, variant = 'list' }: SavedVerseListProps) {
  const { saved } = useSavedVerses();
  const items = limit != null ? saved.slice(0, limit) : saved;
  const isCatalog = variant === 'catalog';

  if (saved.length === 0) {
    if (isCatalog) {
      return (
        <ThemedText type="muted" style={styles.subsectionEmpty}>
          No saved verses or notes yet.
        </ThemedText>
      );
    }

    return (
      <BookshelfSection list>
        <ThemedText type="muted" style={styles.subsectionEmpty}>
          No saved verses or notes yet.
        </ThemedText>
      </BookshelfSection>
    );
  }

  const rows = items.map((verse, index) => (
    <View key={verse.verseId}>
      <SavedVerseRow
        verse={verse}
        variant={variant}
        onPress={() => {
          if (isPrayerBookId(verse.bookId)) {
            router.push(readerRoute(verse.bookId, verse.chapter, verse.lang) as never);
            return;
          }
          router.push(
            scriptureChapterRoute(
              verse.bookId,
              verse.chapter,
              verse.lang,
              verse.verse
            ) as never
          );
        }}
        onRemove={() => void removeSavedVerse(verse.verseId)}
      />
      {index < items.length - 1 ? <ListDivider /> : null}
    </View>
  ));

  if (isCatalog) {
    return <View style={styles.catalogList}>{rows}</View>;
  }

  return (
    <BookshelfSection list>
      <View style={styles.list}>{rows}</View>
    </BookshelfSection>
  );
}

type SavedReadContentProps = {
  /** Limits items shown in each subsection (Read tab preview). */
  previewLimitPerSection?: number;
  /** Full-page empty state vs compact inline hint. */
  emptyVariant?: 'screen' | 'inline';
};

export function SavedReadContent({
  previewLimitPerSection,
  emptyVariant = 'inline',
}: SavedReadContentProps) {
  const { t } = useTranslation();
  const { saved } = useSavedVerses();
  const { bookmarks } = useBookmarks();

  const isEmpty = saved.length === 0 && bookmarks.length === 0;
  const showSectionSeeAll = previewLimitPerSection != null;
  const openChaptersSeeAll = () =>
    router.push({ pathname: '/saved', params: { section: 'chapters' } } as never);
  const openVersesSeeAll = () =>
    router.push({ pathname: '/saved', params: { section: 'verses' } } as never);

  if (isEmpty) {
    if (emptyVariant === 'screen') {
      return (
        <EmptyState
          title="Nothing saved yet"
          suggestion="Bookmark a page or tap a verse while reading to highlight it or add a note."
        />
      );
    }

    if (previewLimitPerSection != null) {
      return (
        <View style={styles.grouped}>
          <View style={styles.subsection}>
            <ShelfSubsectionHeader
              title={t('sections.savedChapters')}
              onSeeAllPress={showSectionSeeAll ? openChaptersSeeAll : undefined}
            />
            <SavedChapterList limit={previewLimitPerSection} />
          </View>

          <View style={styles.subsection}>
            <ShelfSubsectionHeader
              title={t('sections.savedVerses')}
              onSeeAllPress={showSectionSeeAll ? openVersesSeeAll : undefined}
            />
            <SavedVerseList limit={previewLimitPerSection} />
          </View>
        </View>
      );
    }

    return (
      <ThemedText type="muted" style={styles.inlineEmpty}>
        Bookmark a page or tap a verse while reading to highlight it or add a note.
      </ThemedText>
    );
  }

  return (
    <View style={styles.grouped}>
      <View style={styles.subsection}>
        <ShelfSubsectionHeader
          title={t('sections.savedChapters')}
          onSeeAllPress={showSectionSeeAll ? openChaptersSeeAll : undefined}
        />
        <SavedChapterList limit={previewLimitPerSection} />
      </View>

      <View style={styles.subsection}>
        <ShelfSubsectionHeader
          title={t('sections.savedVerses')}
          onSeeAllPress={showSectionSeeAll ? openVersesSeeAll : undefined}
        />
        <SavedVerseList limit={previewLimitPerSection} />
      </View>
    </View>
  );
}

export function useSavedReadCount(): number {
  const { saved } = useSavedVerses();
  const { bookmarks } = useBookmarks();
  return saved.length + bookmarks.length;
}

const styles = StyleSheet.create({
  grouped: {
    gap: Space.s16,
  },
  subsection: {
    marginBottom: 0,
  },
  list: {
    marginTop: 0,
  },
  catalogList: {
    marginTop: 0,
    paddingRight: Spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Layout.cardBorder,
    marginLeft: 60,
  },
  subsectionEmpty: {
    fontSize: 14,
    lineHeight: 21,
  },
  inlineEmpty: {
    fontSize: 14,
    lineHeight: 21,
  },
});
