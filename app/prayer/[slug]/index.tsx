import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { PrayerLanguageTabs } from '@/components/prayer/prayer-language-tabs';
import { ScriptureBookHeader } from '@/components/scripture/scripture-book-header';
import { ThemedText } from '@/components/themed-text';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Layout, Palette, Spacing } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import {
  fetchPrayerBook,
  fetchPrayerSections,
  pickPrayerText,
  PRAYER_LANGUAGES,
  type PrayerBook,
  type PrayerLanguage,
  type PrayerSection,
} from '@/lib/prayer';
import { usePrayerLanguagePreference } from '@/hooks/use-prayer-language';

/** Reading route by 1-based section number (parallels scripture book/chapter). */
function readingHref(slug: string, sectionNumber: number, lang: PrayerLanguage) {
  return `/prayer/${slug}/${sectionNumber}?lang=${lang}`;
}

export default function PrayerBookScreen() {
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const bookSlug = Array.isArray(slug) ? slug[0] : (slug ?? 'daily-prayer');

  const [book, setBook] = useState<PrayerBook | null>(null);
  const [sections, setSections] = useState<PrayerSection[]>([]);
  const [loading, setLoading] = useState(true);
  const { language: lang, setLanguage } = usePrayerLanguagePreference();

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchPrayerBook(bookSlug)
      .then(async (fetchedBook) => {
        if (!active) return;
        setBook(fetchedBook);
        if (fetchedBook) {
          const fetchedSections = await fetchPrayerSections(fetchedBook.id);
          if (active) setSections(fetchedSections);
        }
      })
      .catch(() => {
        // Offline / RLS error: leave empty state.
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [bookSlug]);

  const headerTitle = book
    ? pickPrayerText({ en: book.titleEn, am: book.titleAm, geez: book.titleGeez }, lang)
    : 'Prayer';
  const headerSubtitle = book?.titleGeez ?? book?.titleAm ?? undefined;

  return (
    <ScreenScrollView includeFloatingChrome={false}>
      <OrthodoxPressable style={styles.topBar} onPress={() => router.back()}>
        <ThemedText type="seeAll">{t('settings.back')}</ThemedText>
      </OrthodoxPressable>

      <ScriptureBookHeader title={headerTitle} subtitle={headerSubtitle} />

      {book ? (
        <PrayerLanguageTabs available={PRAYER_LANGUAGES} value={lang} onChange={setLanguage} />
      ) : null}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Palette.gold} />
        </View>
      ) : !book ? (
        <ThemedText type="muted" style={styles.empty}>
          This prayer book is unavailable right now. Check your connection and try again.
        </ThemedText>
      ) : sections.length === 0 ? (
        <ThemedText type="muted" style={styles.empty}>
          No sections have been added to this prayer book yet.
        </ThemedText>
      ) : (
        <View style={styles.bookList}>
          {sections.map((section, index) => {
            const title = pickPrayerText(
              { en: section.titleEn, am: section.titleAm, geez: section.titleGeez },
              lang
            );
            return (
              <View key={section.id}>
                <OrthodoxPressable
                  style={styles.scriptureRow}
                  onPress={() => router.push(readingHref(bookSlug, index + 1, lang) as never)}
                  accessibilityRole="button">
                  <ThemedText style={styles.scriptureText} numberOfLines={2}>
                    {title}
                  </ThemedText>
                  <Text style={styles.rowChevron}>›</Text>
                </OrthodoxPressable>
                {index < sections.length - 1 ? <View style={styles.rowDivider} /> : null}
              </View>
            );
          })}
        </View>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: { marginBottom: Layout.headerContentGap },
  centered: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  empty: {
    lineHeight: 22,
  },
  bookList: {
    marginTop: 2,
  },
  scriptureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 2,
    gap: 8,
  },
  scriptureText: {
    fontSize: 15,
    color: Palette.text,
    flex: 1,
    flexShrink: 1,
    lineHeight: 21,
  },
  rowChevron: { color: Palette.muted, fontSize: 16 },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Layout.cardBorder,
  },
});
