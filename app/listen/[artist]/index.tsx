import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { HymnsCatalogListRow } from '@/components/listen/hymns-catalog-list-row';
import { MezmurSongRow } from '@/components/listen/mezmur-song-row';
import { AppBackButton } from '@/components/ui/app-back-button';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { CatalogListDivider } from '@/components/ui/catalog-list-divider';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SearchBar } from '@/components/ui/search-bar';
import { Layout, Palette, Space, Spacing } from '@/constants/theme';
import { isMezmurSongsOnlyChannel } from '@/data/mezmurCatalog';
import { useAudioPlayer } from '@/contexts/audio-player-context';
import { useRecentSearches } from '@/hooks/use-recent-searches';
import { useTranslation } from '@/hooks/use-translation';
import {
  decodeRouteParam,
  encodeRouteParam,
  fetchAlbumsByArtist,
  fetchSongsByArtist,
  filterByQuery,
  mezmurListToAudioTracks,
  mezmurToAudioTrack,
  type Mezmur,
  type MezmurAlbum,
} from '@/lib/mezmur';
import { isBundledSermonChannel } from '@/lib/sermon-catalog';

const MUTED_GOLD = '#8A8070';

export default function ListenAlbumsScreen() {
  const { t, mode } = useTranslation();
  const { playTrack } = useAudioPlayer();
  const { artist: artistParam } = useLocalSearchParams<{ artist: string }>();
  const artist = decodeRouteParam(artistParam);
  const songsOnly = artist ? isMezmurSongsOnlyChannel(artist) : false;
  const isSermonChannel = artist ? isBundledSermonChannel(artist) : false;

  const [albums, setAlbums] = useState<MezmurAlbum[]>([]);
  const [songs, setSongs] = useState<Mezmur[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recentKey = songsOnly ? `listen-songs-${artist}` : `listen-playlists-${artist}`;
  const { recentSearches, addRecentSearch } = useRecentSearches(recentKey);

  const load = useCallback(async () => {
    if (!artist) return;
    setLoading(true);
    setError(null);
    try {
      if (songsOnly) {
        setSongs(await fetchSongsByArtist(artist));
        setAlbums([]);
      } else {
        setAlbums(await fetchAlbumsByArtist(artist));
        setSongs([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load channel.');
      setAlbums([]);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, [artist, songsOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredAlbums = useMemo(
    () => filterByQuery(albums, searchQuery, (album) => [album.name]),
    [albums, searchQuery]
  );

  const filteredSongs = useMemo(
    () => filterByQuery(songs, searchQuery, (song) => [song.title, song.language]),
    [searchQuery, songs]
  );

  const playSong = useCallback(
    (song: Mezmur) => {
      const queue = mezmurListToAudioTracks(songs);
      playTrack(mezmurToAudioTrack(song), { queue, autoPlay: true, openFullPlayer: true });
    },
    [playTrack, songs]
  );

  if (!artist) {
    return (
      <ScreenScrollView includeFloatingChrome>
        <AppBackButton style={styles.topBar} />
        <EmptyState title="Channel not found" />
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView includeFloatingChrome>
      <AppBackButton
        style={styles.topBar}
        onFallback={() => router.push('/(tabs)/listen')}
      />

      <ThemedText style={styles.pageTitle}>{artist}</ThemedText>
      {mode !== 'en' ? <ThemedText style={styles.pageGeez}>መዝሙር</ThemedText> : null}
      <ThemedText type="muted" style={styles.description}>
        {songsOnly ? 'Songs from this channel.' : 'Playlists from this channel.'}
      </ThemedText>

      <View style={styles.searchWrap}>
        <SearchBar
          placeholder={songsOnly ? 'Search songs' : 'Search playlists'}
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
      ) : songsOnly ? (
        songs.length === 0 ? (
          <EmptyState title="No songs found" suggestion="Try again later." />
        ) : filteredSongs.length === 0 ? (
          <EmptyState title="No songs match your search" suggestion="Try a different term." />
        ) : (
          <View style={styles.list}>
            {filteredSongs.map((song, index) => (
              <View key={song.videoId}>
                <MezmurSongRow
                  title={song.title}
                  subtitle={song.language ?? undefined}
                  thumbnailUrl={song.thumbnailUrl}
                  audioTrack={mezmurToAudioTrack(song)}
                  onPress={() => playSong(song)}
                />
                {index < filteredSongs.length - 1 ? <View style={styles.songDivider} /> : null}
              </View>
            ))}
          </View>
        )
      ) : albums.length === 0 ? (
        <EmptyState title="No playlists found" suggestion="Try again later." />
      ) : filteredAlbums.length === 0 ? (
        <EmptyState title="No playlists match your search" suggestion="Try a different term." />
      ) : (
        <View style={styles.list}>
          {filteredAlbums.map((album, index) => {
            const countLabel = isSermonChannel
              ? album.songCount === 1
                ? t('listen.oneSermon')
                : t('listen.nSermons').replace('{n}', String(album.songCount))
              : `${album.songCount} ${album.songCount === 1 ? 'song' : 'songs'}`;
            return (
              <View key={album.name}>
                <HymnsCatalogListRow
                  title={album.name}
                  subtitle={countLabel}
                  leadingShape="cover"
                  albumArtist={artist}
                  albumName={album.name}
                  albumThumbnailUrl={album.thumbnailUrl}
                  onPress={() =>
                    router.push(
                      `/listen/${encodeRouteParam(artist)}/${encodeRouteParam(album.name)}` as never
                    )
                  }
                />
                {index < filteredAlbums.length - 1 ? <CatalogListDivider /> : null}
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
  songDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Layout.cardBorder,
    marginLeft: 68,
  },
});
