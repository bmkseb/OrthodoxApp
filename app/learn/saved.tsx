import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SavedTeachingList } from '@/components/learn/saved-learn-content';
import { AppBackButton } from '@/components/ui/app-back-button';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SearchBar } from '@/components/ui/search-bar';
import { ThemedText } from '@/components/themed-text';
import { Palette, Space, Spacing } from '@/constants/theme';
import { useRecentSearches } from '@/hooks/use-recent-searches';
import { useSavedTeachings } from '@/hooks/use-saved-teachings';
import { useTranslation } from '@/hooks/use-translation';

const MUTED_GOLD = '#8A8070';

export default function SavedLearnScreen() {
  const { t, mode } = useTranslation();
  const { entries } = useSavedTeachings();
  const [searchQuery, setSearchQuery] = useState('');
  const { recentSearches, addRecentSearch } = useRecentSearches('learn-saved');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(q) ||
        (entry.subtitle?.toLowerCase().includes(q) ?? false)
    );
  }, [entries, searchQuery]);

  const handleSearchSubmit = (term: string) => {
    setSearchQuery(term);
    void addRecentSearch(term);
  };

  const isEmpty = filtered.length === 0;

  return (
    <ScreenScrollView includeFloatingChrome={false}>
      <AppBackButton
        style={styles.topBar}
        onFallback={() => router.push('/(tabs)/learn')}
      />

      <ThemedText style={styles.eyebrow}>{t('learn.savedTeachings')}</ThemedText>
      <ThemedText style={styles.pageTitle}>{t('learn.savedTeachings')}</ThemedText>
      {mode !== 'en' ? <ThemedText style={styles.pageGeez}>ትምህርት</ThemedText> : null}
      <ThemedText type="muted" style={styles.description}>
        {t('learn.savedEmptyHint')}
      </ThemedText>

      <View style={styles.searchWrap}>
        <SearchBar
          placeholder={t('learn.searchLearn')}
          placeholderTextColor={MUTED_GOLD}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          recentSearches={recentSearches}
        />
      </View>

      {isEmpty ? (
        <EmptyState
          title={t('learn.noSavedTeachings')}
          suggestion={t('learn.savedEmptyHint')}
        />
      ) : (
        <SavedTeachingList variant="catalog" entries={filtered} />
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
  searchWrap: {
    marginBottom: Space.s16,
  },
});
