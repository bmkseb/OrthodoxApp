import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { PrayerLanguageTabs } from '@/components/prayer/prayer-language-tabs';
import { ScriptureBackBar } from '@/components/scripture/scripture-back-bar';
import { ScriptureBookHeader } from '@/components/scripture/scripture-book-header';
import { ThemedText } from '@/components/themed-text';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Palette, Spacing } from '@/constants/theme';
import {
  fetchPrayerVerses,
  pickPrayerText,
  PRAYER_LANGUAGES,
  type PrayerLanguage,
  type PrayerVerse,
} from '@/lib/prayer';

function parseLangs(raw: string | undefined): PrayerLanguage[] {
  const parts = (raw ?? '')
    .split(',')
    .map((p) => p.trim())
    .filter((p): p is PrayerLanguage => PRAYER_LANGUAGES.includes(p as PrayerLanguage));
  return parts.length > 0 ? parts : ['english'];
}

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default function PrayerSectionScreen() {
  const params = useLocalSearchParams<{
    sectionId: string;
    titleEn?: string;
    titleAm?: string;
    titleGeez?: string;
    lang?: string;
    langs?: string;
  }>();

  const sectionId = first(params.sectionId);
  const titleEn = first(params.titleEn);
  const titleAm = first(params.titleAm);
  const titleGeez = first(params.titleGeez);
  const availableLanguages = parseLangs(first(params.langs));
  const initialLang = parseLangs(first(params.lang))[0];

  const [lang, setLang] = useState<PrayerLanguage>(
    availableLanguages.includes(initialLang) ? initialLang : 'english'
  );
  const [verses, setVerses] = useState<PrayerVerse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchPrayerVerses(sectionId)
      .then((fetched) => {
        if (active) setVerses(fetched);
      })
      .catch(() => {
        if (active) setVerses([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [sectionId]);

  const headerTitle = pickPrayerText(
    { en: titleEn, am: titleAm || null, geez: titleGeez || null },
    lang
  );

  return (
    <ScreenScrollView includeFloatingChrome={false}>
      <ScriptureBackBar />
      <ScriptureBookHeader title={headerTitle || 'Prayer'} />

      <PrayerLanguageTabs available={availableLanguages} value={lang} onChange={setLang} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Palette.gold} />
        </View>
      ) : verses.length === 0 ? (
        <ThemedText type="muted" style={styles.empty}>
          No verses have been added to this section yet.
        </ThemedText>
      ) : (
        <View style={styles.body}>
          {verses.map((verse) => (
            <ThemedText key={verse.id} style={styles.verse}>
              {pickPrayerText(
                { en: verse.contentEn, am: verse.contentAm, geez: verse.contentGeez },
                lang
              )}
            </ThemedText>
          ))}
        </View>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  empty: {
    lineHeight: 22,
  },
  body: {
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  verse: {
    fontSize: 17,
    lineHeight: 28,
    color: Palette.text,
  },
});
