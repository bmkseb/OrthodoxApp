import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ScriptureBackBar } from '@/components/scripture/scripture-back-bar';
import { ScriptureBookHeader } from '@/components/scripture/scripture-book-header';
import { EmptyState } from '@/components/ui/empty-state';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { getBibleBook, getBookTitle } from '@/data/bibleCanon';
import { useScriptureLang, scriptureLangQuery } from '@/hooks/use-scripture-lang';
import { useTranslation } from '@/hooks/use-translation';
import { fetchBookChapters, formatScriptureNumber, hasScriptureSample } from '@/lib/scripture';
import { isSupabaseConfigured } from '@/lib/supabase';
import { BorderRadius, Layout, Palette } from '@/constants/theme';

export default function BookChaptersScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const lang = useScriptureLang();
  const { t } = useTranslation();
  const book = bookId ? getBibleBook(bookId) : undefined;

  const [chapters, setChapters] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!bookId) return;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchBookChapters(bookId);
      setChapters(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('scripture.loadError'));
      setChapters([]);
    } finally {
      setLoading(false);
    }
  }, [bookId, t]);

  useEffect(() => {
    load();
  }, [load]);

  if (!book) {
    return (
      <ScreenScrollView includeFloatingChrome={false}>
        <ScriptureBackBar />
        <EmptyState title={t('scripture.bookNotFound')} />
      </ScreenScrollView>
    );
  }

  const title = getBookTitle(book, lang);
  const langQ = scriptureLangQuery(lang);

  return (
    <ScreenScrollView includeFloatingChrome={false}>
      <ScriptureBackBar />
      <ScriptureBookHeader title={title} subtitle={t('scripture.selectChapter')} />

      {loading ? (
        <ActivityIndicator color={Palette.gold} style={styles.spinner} />
      ) : error ? (
        <EmptyState title={error} suggestion={t('scripture.tryAgain')} />
      ) : chapters.length === 0 ? (
        <EmptyState
          title={t('scripture.noChaptersTitle')}
          suggestion={
            isSupabaseConfigured()
              ? t('scripture.noChaptersSupabase')
              : hasScriptureSample(bookId!)
                ? t('scripture.noChaptersSample')
                : t('scripture.noChaptersIngest')
          }
        />
      ) : (
        <View style={styles.grid}>
          {chapters.map((chapter) => (
            <OrthodoxPressable
              key={chapter}
              style={styles.chapterCell}
              onPress={() => router.push(`/book/${bookId}/${chapter}${langQ}`)}>
              <ThemedText style={styles.chapterNum}>
                {formatScriptureNumber(chapter, lang)}
              </ThemedText>
              <ThemedText type="muted" style={styles.chapterLabel}>
                {t('scripture.chapter')}
              </ThemedText>
            </OrthodoxPressable>
          ))}
        </View>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  spinner: { marginTop: 32 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chapterCell: {
    width: '30%',
    minWidth: 96,
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Layout.cardBorder,
    backgroundColor: Palette.card,
  },
  chapterNum: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.gold,
  },
  chapterLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
