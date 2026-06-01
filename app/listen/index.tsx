import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SearchBar } from '@/components/ui/search-bar';
import { BorderRadius, Layout, Palette, Space, Spacing } from '@/constants/theme';
import { MEZMUR_LANGUAGE_SHELVES, shelfForMezmurLanguage } from '@/data/mezmurCatalog';
import { useRecentSearches } from '@/hooks/use-recent-searches';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslationKey } from '@/lib/translations';
import {
  clearMezmurCache,
  encodeRouteParam,
  fetchArtistsByLanguage,
  filterByQuery,
  type MezmurArtist,
} from '@/lib/mezmur';
import { isSupabaseConfigured } from '@/lib/supabase';

const MUTED_GOLD = '#8A8070';

export default function ListenArtistsScreen() {
  const { t, mode } = useTranslation();
  const { language } = useLocalSearchParams<{ language?: string }>();
  const shelf = shelfForMezmurLanguage(typeof language === 'string' ? language : undefined);

  const [artists, setArtists] = useState<MezmurArtist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { recentSearches, addRecentSearch } = useRecentSearches('listen-channels');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      clearMezmurCache();
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const rows = await fetchArtistsByLanguage(shelf.language);
      setArtists(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load mezmur.');
      setArtists([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shelf.language]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredArtists = useMemo(
    () => filterByQuery(artists, searchQuery, (artist) => [artist.name]),
    [artists, searchQuery]
  );

  return (
    <ScreenScrollView
      includeFloatingChrome
      refreshing={refreshing}
      onRefresh={() => load(true)}>
      <OrthodoxPressable
        style={styles.topBar}
        onPress={() => {
          if (router.canGoBack()) router.back();
          else router.push('/(tabs)/listen');
        }}
        accessibilityRole="button"
        accessibilityLabel={t('settings.back')}>
        <ThemedText type="seeAll">← {t('settings.back')}</ThemedText>
      </OrthodoxPressable>

      <ThemedText style={styles.eyebrow}>Hymns Catalog</ThemedText>
      <ThemedText style={styles.pageTitle}>{shelf.title}</ThemedText>
      {mode !== 'en' ? <ThemedText style={styles.pageGeez}>{shelf.geez}</ThemedText> : null}
      <ThemedText type="muted" style={styles.description}>
        {shelf.description}
      </ThemedText>

      <View style={styles.switcher}>
        {MEZMUR_LANGUAGE_SHELVES.map((option) => {
          const active = option.language === shelf.language;
          return (
            <OrthodoxPressable
              key={option.language}
              style={[styles.switchTab, active && styles.switchTabActive]}
              onPress={() => router.setParams({ language: option.language })}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}>
              <ThemedText style={[styles.switchLabel, active && styles.switchLabelActive]}>
                {t(`catalog.${option.language}` as TranslationKey)}
              </ThemedText>
            </OrthodoxPressable>
          );
        })}
      </View>

      <View style={styles.searchWrap}>
        <SearchBar
          placeholder="Search channels"
          placeholderTextColor={MUTED_GOLD}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearchSubmit={(term) => {
            setSearchQuery(term);
            void addRecentSearch(term);
          }}
          recentSearches={recentSearches}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={Palette.gold} style={styles.spinner} />
      ) : error ? (
        <EmptyState title={error} suggestion={t('scripture.tryAgain')} />
      ) : artists.length === 0 ? (
        <EmptyState
          title="No mezmur found"
          suggestion={
            isSupabaseConfigured()
              ? 'Run the mezmur sync script to populate the catalog.'
              : 'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file.'
          }
        />
      ) : filteredArtists.length === 0 ? (
        <EmptyState title="No channels match your search" suggestion="Try a different term." />
      ) : (
        <View style={styles.list}>
          {filteredArtists.map((artist, index) => (
            <View key={artist.name}>
              <OrthodoxPressable
                style={styles.row}
                onPress={() => router.push(`/listen/${encodeRouteParam(artist.name)}` as never)}
                accessibilityRole="button">
                {artist.thumbnailUrl ? (
                  <Image source={{ uri: artist.thumbnailUrl }} style={styles.thumb} contentFit="cover" />
                ) : (
                  <View style={[styles.thumb, styles.thumbPlaceholder]}>
                    <ThemedText style={styles.thumbInitial}>{artist.name.charAt(0)}</ThemedText>
                  </View>
                )}
                <View style={styles.rowBody}>
                  <ThemedText style={styles.rowTitle} numberOfLines={2}>
                    {artist.name}
                  </ThemedText>
                  <ThemedText type="muted" style={styles.rowMeta}>
                    {artist.albumCount} {artist.albumCount === 1 ? 'playlist' : 'playlists'} · {artist.songCount}{' '}
                    {artist.songCount === 1 ? 'song' : 'songs'}
                  </ThemedText>
                </View>
                <Text style={styles.chevron}>›</Text>
              </OrthodoxPressable>
              {index < filteredArtists.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>
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
  searchWrap: { marginBottom: Space.s16 },
  spinner: { marginTop: Spacing.xxl },
  list: { marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 2,
    gap: 12,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.2)',
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Layout.cardBorder,
  },
  thumbInitial: {
    color: Palette.gold,
    fontSize: 20,
    fontWeight: '700',
  },
  rowBody: { flex: 1, gap: 4 },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.text,
    lineHeight: 22,
  },
  rowMeta: { fontSize: 13, lineHeight: 18 },
  chevron: { color: Palette.mutedGold, fontSize: 22 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Layout.cardBorder,
    marginLeft: 64,
  },
});
