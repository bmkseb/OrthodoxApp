import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ScriptureBackBar } from '@/components/scripture/scripture-back-bar';
import { VerseList } from '@/components/scripture/verse-list';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { getBibleBook, getBookTitle } from '@/data/bibleCanon';
import { useScriptureLang } from '@/hooks/use-scripture-lang';
import { useTranslation } from '@/hooks/use-translation';
import { fetchChapterVerses } from '@/lib/scripture';
import { Layout, Palette } from '@/constants/theme';
import type { VerseRecord } from '@/types/scripture';

export default function ChapterReaderScreen() {
  const { bookId, chapter: chapterParam } = useLocalSearchParams<{
    bookId: string;
    chapter: string;
  }>();
  const lang = useScriptureLang();
  const { t } = useTranslation();
  const chapter = Number(chapterParam);
  const book = bookId ? getBibleBook(bookId) : undefined;

  const [verses, setVerses] = useState<VerseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!bookId || !Number.isFinite(chapter)) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchChapterVerses(bookId, chapter);
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

  if (!book || !Number.isFinite(chapter)) {
    return (
      <ScreenScrollView>
        <ScriptureBackBar />
        <EmptyState title={t('scripture.chapterNotFound')} />
      </ScreenScrollView>
    );
  }

  const bookTitle = getBookTitle(book, lang);

  return (
    <ScreenScrollView>
      <ScriptureBackBar />
      <ThemedText type="muted" style={styles.eyebrow}>
        {bookTitle}
      </ThemedText>
      <ThemedText style={styles.heading}>
        {t('scripture.chapter')} {chapter}
      </ThemedText>

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
          <VerseList verses={verses} lang={lang} />
        </View>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  eyebrow: { marginBottom: 4 },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: Layout.sectionGap,
  },
  spinner: { marginTop: 32 },
  body: { paddingBottom: Layout.sectionContentBottom },
});
