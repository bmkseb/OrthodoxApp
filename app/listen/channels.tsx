import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SearchBar } from '@/components/ui/search-bar';
import { BorderRadius, Layout, Palette, Space, Spacing } from '@/constants/theme';
import { useRecentSearches } from '@/hooks/use-recent-searches';
import { useTranslation } from '@/hooks/use-translation';
import {
  clearMezmurCache,
  encodeRouteParam,
  fetchArtists,
  filterByQuery,
  formatMezmurChannelSubtitle,
  type MezmurArtist,
} from '@/lib/mezmur';
import { isSupabaseConfigured } from '@/lib/supabase';

const MUTED_GOLD = '#8A8070';

export default function ListenChannelsScreen() {
  const { t } = useTranslation();
  const [channels, setChannels] = useState<MezmurArtist[]>([]);
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
      const rows = await fetchArtists();
      setChannels(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load channels.');
      setChannels([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredChannels = useMemo(
    () => filterByQuery(channels, searchQuery, (channel) => [channel.name]),
    [channels, searchQuery]
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
      <ThemedText style={styles.pageTitle}>{t('listen.mezmurChannelsShelf')}</ThemedText>
      <ThemedText type="muted" style={styles.description}>
        Browse playlists from each mezmur channel.
      </ThemedText>

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
      ) : channels.length === 0 ? (
        <EmptyState
          title="No channels found"
          suggestion={
            isSupabaseConfigured()
              ? 'Run the mezmur sync script to populate the catalog.'
              : 'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file.'
          }
        />
      ) : filteredChannels.length === 0 ? (
        <EmptyState title="No channels match your search" suggestion="Try a different term." />
      ) : (
        <View style={styles.list}>
          {filteredChannels.map((channel, index) => {
            const meta = formatMezmurChannelSubtitle(
              channel.name,
              channel.albumCount,
              channel.songCount
            );

            return (
              <View key={channel.name}>
                <OrthodoxPressable
                  style={styles.channelRow}
                  onPress={() =>
                    router.push(`/listen/${encodeRouteParam(channel.name)}` as never)
                  }
                  accessibilityRole="button"
                  accessibilityLabel={channel.name}>
                  {channel.thumbnailUrl ? (
                    <Image
                      source={{ uri: channel.thumbnailUrl }}
                      style={styles.thumb}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.thumb, styles.thumbPlaceholder]}>
                      <ThemedText style={styles.thumbInitial}>
                        {channel.name.charAt(0)}
                      </ThemedText>
                    </View>
                  )}
                  <View style={styles.rowBody}>
                    <ThemedText style={styles.rowTitle} numberOfLines={2}>
                      {channel.name}
                    </ThemedText>
                    <ThemedText type="muted" style={styles.rowMeta}>
                      {meta}
                    </ThemedText>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </OrthodoxPressable>
                {index < filteredChannels.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            );
          })}
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
  description: {
    marginBottom: Spacing.md,
    lineHeight: 21,
  },
  searchWrap: { marginBottom: Space.s16 },
  spinner: { marginTop: Spacing.xxl },
  list: { marginTop: 2 },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 2,
    gap: 12,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    marginLeft: 76,
  },
});
