import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type Animated from 'react-native-reanimated';

import { ChapterNavBar } from '@/components/scripture/chapter-nav-bar';
import { PrayerLanguageTabs } from '@/components/prayer/prayer-language-tabs';
import { ScripturePageScroll } from '@/components/scripture/scripture-page-scroll';
import { ScriptureBackBar } from '@/components/scripture/scripture-back-bar';
import { ScriptureBookHeader } from '@/components/scripture/scripture-book-header';
import { VerseList } from '@/components/scripture/verse-list';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ParchmentGrainOverlay } from '@/components/sacred/parchment-grain-overlay';
import { SacredAtmosphere } from '@/components/sacred/sacred-atmosphere';
import { ThemedView } from '@/components/themed-view';
import { getBibleBook, getBookTitle } from '@/data/bibleCanon';
import { usePrayerLanguagePreference } from '@/hooks/use-prayer-language';
import { recordReadingProgress } from '@/hooks/use-reading-progress';
import { useTranslation } from '@/hooks/use-translation';
import { defaultPrayerLanguage, PRAYER_LANGUAGE_NAMES, type PrayerLanguage } from '@/lib/prayer';
import { fetchBookChapters, fetchChapterVerses, formatScriptureNumber } from '@/lib/scripture';
import { parseScrollTarget, useScrollToTarget } from '@/hooks/use-scroll-to-target';
import { Layout, Spacing } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';
import type { ScriptureLang, VerseRecord } from '@/types/scripture';

const hasText = (value: string | null | undefined) => Boolean(value && value.trim());
// The scripture reader always offers these three; missing text shows a message.
const SCRIPTURE_LANGS: PrayerLanguage[] = ['english', 'amharic', 'geez'];

const NAV_BAR_HEIGHT = 56;

export default function ChapterReaderScreen() {
  const { bookId, chapter: chapterParam, verse: verseParam } = useLocalSearchParams<{
    bookId: string;
    chapter: string;
    verse?: string;
  }>();
  const { t } = useTranslation();
  const { palette } = useThemeTokens();
  const insets = useSafeAreaInsets();
  const chapter = Number(chapterParam);
  const scrollToVerse = parseScrollTarget(verseParam);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const contentRef = useRef<View>(null);
  const book = bookId ? getBibleBook(bookId) : undefined;

  const [chapters, setChapters] = useState<number[]>([]);
  const [verses, setVerses] = useState<VerseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightVerse, setHighlightVerse] = useState<number | undefined>(scrollToVerse);

  // Same trilingual picker as the prayer reader: the choice persists app-wide,
  // the picker always shows all three languages, and a chapter missing the
  // selected language shows a message instead of silently using another.
  const { language: langPreference, setLanguage } = usePrayerLanguagePreference();
  const effectiveLang = SCRIPTURE_LANGS.includes(langPreference)
    ? langPreference
    : defaultPrayerLanguage(SCRIPTURE_LANGS);
  const lang: ScriptureLang = effectiveLang === 'transliteration' ? 'english' : effectiveLang;
  const langHasContent = verses.some((v) =>
    hasText(lang === 'amharic' ? v.text_amharic : lang === 'geez' ? v.text_geez : v.text_english)
  );

  const contentReady = !loading && verses.length > 0;
  const { registerTargetRef } = useScrollToTarget(
    scrollRef,
    contentRef,
    scrollToVerse,
    contentReady,
    64
  );

  useEffect(() => {
    setHighlightVerse(scrollToVerse);
  }, [scrollToVerse, bookId, chapter]);

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
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        trackInsetTop={insets.top + Spacing.md}
        trackInsetBottom={bottomInset}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor={palette.gold} />
        }
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing.md,
            paddingBottom: bottomInset,
          },
        ]}>
        <View ref={contentRef} collapsable={false}>
          <ScriptureBackBar bookmark={{ bookId, chapter, lang, bookTitle }} showTextSize />
          <ScriptureBookHeader
            title={bookTitle}
            subtitle={`${t('scripture.chapter')} ${formatScriptureNumber(chapter, lang)}`}
          />

          <PrayerLanguageTabs
            available={SCRIPTURE_LANGS}
            value={effectiveLang}
            onChange={setLanguage}
          />

          {loading ? (
            <ActivityIndicator color={palette.gold} style={styles.spinner} />
          ) : error ? (
            <EmptyState title={error} suggestion={t('scripture.tryAgain')} />
          ) : verses.length === 0 ? (
            <EmptyState
              title={t('scripture.noVersesTitle')}
              suggestion={t('scripture.noChaptersIngest')}
            />
          ) : !langHasContent ? (
            <ThemedText type="muted" style={styles.fallback}>
              This chapter is not yet available in {PRAYER_LANGUAGE_NAMES[lang]}. Please select
              another language.
            </ThemedText>
          ) : (
            <View style={styles.body}>
              <VerseList
                verses={verses}
                lang={lang}
                bookId={bookId}
                chapter={chapter}
                bookTitle={bookTitle}
                scrollToVerse={highlightVerse}
                registerVerseRef={registerTargetRef}
              />
            </View>
          )}
        </View>
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
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.pagePadding,
  },
  spinner: { marginTop: 32 },
  fallback: {
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    paddingVertical: Spacing.xl,
  },
  body: { paddingBottom: Layout.headerContentGap },
  navSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
