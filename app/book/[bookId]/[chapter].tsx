import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChapterNavBar } from '@/components/scripture/chapter-nav-bar';
import { ScripturePageScroll } from '@/components/scripture/scripture-page-scroll';
import { ScriptureBackBar } from '@/components/scripture/scripture-back-bar';
import { ScriptureBookHeader } from '@/components/scripture/scripture-book-header';
import { VerseList } from '@/components/scripture/verse-list';
import { EmptyState } from '@/components/ui/empty-state';
import { ParchmentGrainOverlay } from '@/components/sacred/parchment-grain-overlay';
import { SacredAtmosphere } from '@/components/sacred/sacred-atmosphere';
import { ThemedView } from '@/components/themed-view';
import { getBibleBook, getBookTitle } from '@/data/bibleCanon';
import { useScriptureLang } from '@/hooks/use-scripture-lang';
import { recordReadingProgress } from '@/hooks/use-reading-progress';
import { useTranslation } from '@/hooks/use-translation';
import { fetchBookChapters, fetchChapterVerses } from '@/lib/scripture';
import { Layout, Palette, Spacing } from '@/constants/theme';
import type { VerseRecord } from '@/types/scripture';

const NAV_BAR_HEIGHT = 56;

export default function ChapterReaderScreen() {
  const { bookId, chapter: chapterParam } = useLocalSearchParams<{
    bookId: string;
    chapter: string;
  }>();
  const lang = useScriptureLang();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const chapter = Number(chapterParam);
  const book = bookId ? getBibleBook(bookId) : undefined;

  const [chapters, setChapters] = useState<number[]>([]);
  const [verses, setVerses] = useState<VerseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!bookId || !Number.isFinite(chapter)) return;
    setLoading(true);
    setError(null);
    try {
      const [chapterList, rows] = await Promise.all([
        fetchBookChapters(bookId),
        fetchChapterVerses(bookId, chapter),
      ]);
      setChapters(chapterList);
      setVerses(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('scripture.loadError'));
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }, [bookId, chapter, t]);

  useEffect(() => {
    load();
  }, [load]);

  // Remember the reader's position so "Continue Reading" can resume here.
  useEffect(() => {
    if (!bookId || !book || !Number.isFinite(chapter)) return;
    void recordReadingProgress({
      bookId,
      chapter,
      totalChapters: chapters.length || chapter,
      lang,
      updatedAt: Date.now(),
    });
  }, [bookId, book, chapter, chapters.length, lang]);

  if (!book || !Number.isFinite(chapter)) {
    return (
      <ThemedView style={styles.root}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.md }]}>
          <ScriptureBackBar />
          <EmptyState title={t('scripture.chapterNotFound')} />
        </ScrollView>
      </ThemedView>
    );
  }

  const bookTitle = getBookTitle(book, lang);
  const bottomInset = Math.max(insets.bottom, Spacing.md) + NAV_BAR_HEIGHT;

  return (
    <ThemedView style={styles.root}>
      <SacredAtmosphere />
      <ParchmentGrainOverlay />
      <ScripturePageScroll
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        trackInsetTop={insets.top + Spacing.md}
        trackInsetBottom={bottomInset}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor={Palette.gold} />
        }
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing.md,
            paddingBottom: bottomInset,
          },
        ]}>
        <ScriptureBackBar bookmark={{ bookId, chapter, lang, bookTitle }} />
        <ScriptureBookHeader
          title={bookTitle}
          subtitle={`${t('scripture.chapter')} ${chapter}`}
        />

        {loading ? (
          <ActivityIndicator color={Palette.gold} style={styles.spinner} />
        ) : error ? (
          <EmptyState title={error} suggestion={t('scripture.tryAgain')} />
        ) : verses.length === 0 ? (
          <EmptyState
            title={t('scripture.noVersesTitle')}
            suggestion={t('scripture.noChaptersIngest')}
          />
        ) : (
          <View style={styles.body}>
            <VerseList
              verses={verses}
              lang={lang}
              bookId={bookId}
              chapter={chapter}
              bookTitle={bookTitle}
            />
          </View>
        )}
      </ScripturePageScroll>

      <View style={styles.navSlot}>
        <ChapterNavBar bookId={bookId} chapter={chapter} chapters={chapters} lang={lang} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.pagePadding,
  },
  spinner: { marginTop: 32 },
  body: { paddingBottom: Layout.headerContentGap },
  navSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
