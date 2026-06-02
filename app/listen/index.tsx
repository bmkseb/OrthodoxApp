import { Image } from 'expo-image';

import { router, useLocalSearchParams } from 'expo-router';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';



import { MezmurPlaylistRow } from '@/components/listen/mezmur-playlist-row';

import { OrthodoxPressable } from '@/components/orthodox-pressable';

import { ThemedText } from '@/components/themed-text';

import { EmptyState } from '@/components/ui/empty-state';

import { ScreenScrollView } from '@/components/ui/screen-scroll-view';

import { SearchBar } from '@/components/ui/search-bar';

import { BorderRadius, Layout, Palette, Space, Spacing } from '@/constants/theme';

import {

  MEZMUR_CATEGORY_SHELVES,

  shelfForMezmurCategory,

  type MezmurCategory,

} from '@/data/mezmurCatalog';

import { useRecentSearches } from '@/hooks/use-recent-searches';

import { useTranslation } from '@/hooks/use-translation';

import {

  clearMezmurCache,

  encodeRouteParam,

  fetchPlaylistsByCategory,

  filterByQuery,

  type MezmurPlaylistCard,

} from '@/lib/mezmur';

import { isSupabaseConfigured } from '@/lib/supabase';



const MUTED_GOLD = '#8A8070';



function emptyPlaylistsByCategory(): Record<MezmurCategory, MezmurPlaylistCard[]> {

  return { nisiha: [], praise: [], maryam: [], fasting: [], other: [] };

}



export default function ListenThemesScreen() {

  const { t } = useTranslation();

  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();

  const activeCategory =

    typeof categoryParam === 'string' && categoryParam

      ? shelfForMezmurCategory(categoryParam).id

      : null;

  const categoryShelf = activeCategory ? shelfForMezmurCategory(activeCategory) : null;



  const [playlistsByCategory, setPlaylistsByCategory] =

    useState<Record<MezmurCategory, MezmurPlaylistCard[]>>(emptyPlaylistsByCategory);

  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const recentKey = activeCategory

    ? `listen-theme-playlists-${activeCategory}`

    : 'listen-themes';

  const { recentSearches, addRecentSearch } = useRecentSearches(recentKey);



  const load = useCallback(async (isRefresh = false) => {

    if (isRefresh) {

      clearMezmurCache();

      setRefreshing(true);

    } else {

      setLoading(true);

    }

    setError(null);



    try {

      const grouped = await fetchPlaylistsByCategory();

      setPlaylistsByCategory(grouped);

    } catch (e) {

      setError(e instanceof Error ? e.message : 'Could not load mezmur.');

      setPlaylistsByCategory(emptyPlaylistsByCategory());

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  }, []);



  useEffect(() => {

    void load();

  }, [load]);



  useEffect(() => {

    setSearchQuery('');

  }, [activeCategory]);



  const themeSummaries = useMemo(

    () =>

      MEZMUR_CATEGORY_SHELVES.map((item) => {

        const playlists = playlistsByCategory[item.id];

        const songCount = playlists.reduce((sum, playlist) => sum + playlist.songCount, 0);

        return {

          shelf: item,

          playlists,

          playlistCount: playlists.length,

          songCount,

          thumbnailUrl: playlists.find((p) => p.thumbnailUrl)?.thumbnailUrl ?? null,

        };

      }).filter((entry) => entry.playlistCount > 0),

    [playlistsByCategory]

  );



  const filteredThemes = useMemo(

    () =>

      filterByQuery(themeSummaries, searchQuery, (entry) => [t(entry.shelf.titleKey)]),

    [searchQuery, t, themeSummaries]

  );



  const playlistsForCategory = useMemo(() => {

    if (!activeCategory) return [];

    return filterByQuery(

      playlistsByCategory[activeCategory],

      searchQuery,

      (playlist) => [playlist.album, playlist.artist]

    );

  }, [activeCategory, playlistsByCategory, searchQuery]);



  const totalPlaylistCount = useMemo(

    () => Object.values(playlistsByCategory).reduce((sum, list) => sum + list.length, 0),

    [playlistsByCategory]

  );



  const pageTitle = categoryShelf ? t(categoryShelf.titleKey) : t('listen.mezmurThemesShelf');

  const pageDescription = categoryShelf

    ? 'Playlists in this theme.'

    : 'Browse hymns by theme — from every channel.';



  return (

    <ScreenScrollView

      includeFloatingChrome

      refreshing={refreshing}

      onRefresh={() => load(true)}>

      <OrthodoxPressable

        style={styles.topBar}

        onPress={() => {

          if (activeCategory) {

            router.setParams({ category: '' });

            return;

          }

          if (router.canGoBack()) router.back();

          else router.push('/(tabs)/listen');

        }}

        accessibilityRole="button"

        accessibilityLabel={t('settings.back')}>

        <ThemedText type="seeAll">← {t('settings.back')}</ThemedText>

      </OrthodoxPressable>



      <ThemedText style={styles.eyebrow}>Hymns Catalog</ThemedText>

      <ThemedText style={styles.pageTitle}>{pageTitle}</ThemedText>

      <ThemedText type="muted" style={styles.description}>

        {pageDescription}

      </ThemedText>



      <View style={styles.searchWrap}>

        <SearchBar

          placeholder={activeCategory ? 'Search playlists' : 'Search themes'}

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

      ) : totalPlaylistCount === 0 ? (

        <EmptyState

          title="No mezmur found"

          suggestion={

            isSupabaseConfigured()

              ? 'Run the mezmur sync script to populate the catalog.'

              : 'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file.'

          }

        />

      ) : activeCategory ? (

        playlistsForCategory.length === 0 ? (

          <EmptyState title="No playlists match your search" suggestion="Try a different term." />

        ) : playlistsByCategory[activeCategory].length === 0 ? (

          <EmptyState title="No playlists in this theme yet" suggestion="Try again after syncing." />

        ) : (

          <View style={styles.list}>

            {playlistsForCategory.map((playlist, index) => (

              <View key={`${playlist.artist}-${playlist.album}`}>

                <MezmurPlaylistRow

                  title={playlist.album}

                  songCount={playlist.songCount}

                  thumbnailUrl={playlist.thumbnailUrl}

                  onPress={() =>

                    router.push(

                      `/listen/${encodeRouteParam(playlist.artist)}/${encodeRouteParam(playlist.album)}` as never

                    )

                  }

                />

                {index < playlistsForCategory.length - 1 ? <View style={styles.divider} /> : null}

              </View>

            ))}

          </View>

        )

      ) : filteredThemes.length === 0 ? (

        <EmptyState title="No themes match your search" suggestion="Try a different term." />

      ) : (

        <View style={styles.list}>

          {filteredThemes.map((entry, index) => {

            const playlistLabel =

              entry.playlistCount === 1 ? 'playlist' : 'playlists';

            const songLabel = entry.songCount === 1 ? 'song' : 'songs';



            return (

              <View key={entry.shelf.id}>

                <OrthodoxPressable

                  style={styles.channelRow}

                  onPress={() =>

                    router.setParams({ category: entry.shelf.id })

                  }

                  accessibilityRole="button"

                  accessibilityLabel={t(entry.shelf.titleKey)}>

                  {entry.thumbnailUrl ? (

                    <Image

                      source={{ uri: entry.thumbnailUrl }}

                      style={styles.thumb}

                      contentFit="cover"

                    />

                  ) : (

                    <View style={[styles.thumb, styles.thumbPlaceholder]}>

                      <ThemedText style={styles.thumbInitial}>

                        {t(entry.shelf.titleKey).charAt(0)}

                      </ThemedText>

                    </View>

                  )}

                  <View style={styles.rowBody}>

                    <ThemedText style={styles.rowTitle} numberOfLines={2}>

                      {t(entry.shelf.titleKey)}

                    </ThemedText>

                    <ThemedText type="muted" style={styles.rowMeta}>

                      {entry.playlistCount} {playlistLabel} · {entry.songCount} {songLabel}

                    </ThemedText>

                  </View>

                  <Text style={styles.chevron}>›</Text>

                </OrthodoxPressable>

                {index < filteredThemes.length - 1 ? <View style={styles.divider} /> : null}

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
    width: 112,
    height: 63,
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

    marginLeft: 124,

  },

});

