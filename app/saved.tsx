import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { SavedChapterList, SavedVerseList } from '@/components/read/saved-read-content';
import { AppBackButton } from '@/components/ui/app-back-button';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Palette, Spacing } from '@/constants/theme';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { useSavedVerses } from '@/hooks/use-saved-verses';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslationKey } from '@/lib/translations';

export type SavedReadSection = 'chapters' | 'verses';

const SAVED_SECTIONS: {
  id: SavedReadSection;
  titleKey: TranslationKey;
  geez: string;
  description: string;
  emptyTitle: string;
  emptySuggestion: string;
}[] = [
  {
    id: 'chapters',
    titleKey: 'sections.savedChapters',
    geez: 'ምዕራፎች',
    description: 'Bookmarked pages from scripture and prayer books.',
    emptyTitle: 'No saved chapters yet',
    emptySuggestion: 'Tap the bookmark icon while reading to save a chapter here.',
  },
  {
    id: 'verses',
    titleKey: 'sections.savedVerses',
    geez: 'ጥቅሶች እና ማስታወሻ',
    description: 'Highlighted verses and personal notes from your reading.',
    emptyTitle: 'No saved verses or notes yet',
    emptySuggestion: 'Tap a verse while reading to highlight it or add a note.',
  },
];

function parseSavedSection(value: string | string[] | undefined): SavedReadSection {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === 'verses' ? 'verses' : 'chapters';
}

function sectionForId(id: SavedReadSection) {
  return SAVED_SECTIONS.find((section) => section.id === id) ?? SAVED_SECTIONS[0];
}

export default function SavedScreen() {
  const { section: sectionParam } = useLocalSearchParams<{ section?: string }>();
  const section = parseSavedSection(sectionParam);
  const active = sectionForId(section);
  const { t, mode } = useTranslation();
  const { saved } = useSavedVerses();
  const { bookmarks } = useBookmarks();

  const isEmpty =
    section === 'chapters' ? bookmarks.length === 0 : saved.length === 0;

  return (
    <ScreenScrollView includeFloatingChrome={false}>
      <AppBackButton
        style={styles.topBar}
        onFallback={() => router.push('/(tabs)/read')}
      />

      <ThemedText style={styles.eyebrow}>{t('sections.saved')}</ThemedText>
      <ThemedText style={styles.pageTitle}>{t(active.titleKey)}</ThemedText>
      {mode !== 'en' ? <ThemedText style={styles.pageGeez}>{active.geez}</ThemedText> : null}
      <ThemedText type="muted" style={styles.description}>
        {active.description}
      </ThemedText>

      <View style={styles.switcher}>
        {SAVED_SECTIONS.map((option) => {
          const selected = option.id === section;
          return (
            <OrthodoxPressable
              key={option.id}
              style={[styles.switchTab, selected && styles.switchTabActive]}
              onPress={() => router.setParams({ section: option.id })}
              accessibilityRole="button"
              accessibilityState={{ selected }}>
              <ThemedText style={[styles.switchLabel, selected && styles.switchLabelActive]}>
                {t(option.titleKey)}
              </ThemedText>
            </OrthodoxPressable>
          );
        })}
      </View>

      {isEmpty ? (
        <EmptyState title={active.emptyTitle} suggestion={active.emptySuggestion} />
      ) : section === 'chapters' ? (
        <SavedChapterList />
      ) : (
        <SavedVerseList />
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    marginBottom: Spacing.sm,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Palette.mutedGold,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    lineHeight: 36,
    marginBottom: 4,
  },
  pageGeez: {
    fontSize: 17,
    color: Palette.gold,
    marginBottom: 4,
  },
  description: {
    marginBottom: Spacing.md,
    lineHeight: 21,
  },
  switcher: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  switchTab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.3)',
  },
  switchTabActive: {
    backgroundColor: 'rgba(201, 147, 58, 0.16)',
    borderColor: Palette.gold,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Palette.muted,
  },
  switchLabelActive: {
    color: Palette.text,
  },
});
