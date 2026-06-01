import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { MezmurPlaylistRow } from '@/components/listen/mezmur-playlist-row';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SearchBar } from '@/components/ui/search-bar';
import { Layout, Palette, Space, Spacing } from '@/constants/theme';
import { useRecentSearches } from '@/hooks/use-recent-searches';
import { useTranslation } from '@/hooks/use-translation';
import {
  decodeRouteParam,
  encodeRouteParam,
  fetchAlbumsByArtist,
  filterByQuery,
  type MezmurAlbum,
} from '@/lib/mezmur';

const MUTED_GOLD = '#8A8070';

export default function ListenAlbumsScreen() {
  const { t, mode } = useTranslation();
  const { artist: artistParam } = useLocalSearchParams<{ artist: string }>();
  const artist = decodeRouteParam(artistParam);

  const [albums, setAlbums] = useState<MezmurAlbum[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { recentSearches, addRecentSearch } = useRecentSearches(`listen-playlists-${artist}`);

  const load = useCallback(async () => {
    if (!artist) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchAlbumsByArtist(artist);
      setAlbums(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load playlists.');
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  }, [artist]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredAlbums = useMemo(
    () => filterByQuery(albums, searchQuery, (album) => [album.name]),
    [albums, searchQuery]
  );

  if (!artist) {
    return (
      <ScreenScrollView includeFloatingChrome>
        <OrthodoxPressable style={styles.topBar} onPress={() => router.back()}>
          <ThemedText type="seeAll">← {t('settings.back')}</ThemedText>
        </OrthodoxPressable>
        <EmptyState title="Channel not found" />
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView includeFloatingChrome>
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

      <ThemedText style={styles.pageTitle}>{artist}</ThemedText>
      {mode !== 'en' ? <ThemedText style={styles.pageGeez}>መዝሙር</ThemedText> : null}
      <ThemedText type="muted" style={styles.description}>
        Playlists from this channel.
      </ThemedText>

      <View style={styles.searchWrap}>
        <SearchBar
          placeholder="Search playlists"
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
      ) : albums.length === 0 ? (
        <EmptyState title="No playlists found" suggestion="Try again later." />
      ) : filteredAlbums.length === 0 ? (
        <EmptyState title="No playlists match your search" suggestion="Try a different term." />
      ) : (
        <View style={styles.list}>
          {filteredAlbums.map((album, index) => (
            <View key={album.name}>
              <MezmurPlaylistRow
                title={album.name}
                songCount={album.songCount}
                thumbnailUrl={album.thumbnailUrl}
                onPress={() =>
                  router.push(
                    `/listen/${encodeRouteParam(artist)}/${encodeRouteParam(album.name)}` as never
                  )
                }
              />
              {index < filteredAlbums.length - 1 ? <View style={styles.divider} /> : null}
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
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
    marginBottom: 4,
  },
  pageGeez: {
    fontSize: 18,
    color: Palette.gold,
    marginBottom: Spacing.sm,
  },
  description: {
    marginBottom: Layout.sectionGap,
    lineHeight: 22,
  },
  searchWrap: { marginBottom: Space.s16 },
  spinner: { marginTop: 32 },
  list: {
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Layout.cardBorder,
    marginLeft: 64,
  },
});
