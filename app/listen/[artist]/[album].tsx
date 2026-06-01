import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { MezmurSongRow } from '@/components/listen/mezmur-song-row';
import { ScriptureBackBar } from '@/components/scripture/scripture-back-bar';
import { ScriptureBookHeader } from '@/components/scripture/scripture-book-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SearchBar } from '@/components/ui/search-bar';
import { Layout, Palette, Space, Spacing } from '@/constants/theme';
import { useAudioPlayer } from '@/contexts/audio-player-context';
import { useRecentSearches } from '@/hooks/use-recent-searches';
import { useTranslation } from '@/hooks/use-translation';
import {
  decodeRouteParam,
  fetchSongsByArtistAlbum,
  filterByQuery,
  mezmurListToAudioTracks,
  mezmurToAudioTrack,
  type Mezmur,
} from '@/lib/mezmur';

const MUTED_GOLD = '#8A8070';

export default function ListenSongsScreen() {
  const { t } = useTranslation();
  const { playTrack } = useAudioPlayer();
  const { artist: artistParam, album: albumParam } = useLocalSearchParams<{
    artist: string;
    album: string;
  }>();
  const artist = decodeRouteParam(artistParam);
  const album = decodeRouteParam(albumParam);

  const [songs, setSongs] = useState<Mezmur[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { recentSearches, addRecentSearch } = useRecentSearches(
    `listen-songs-${artist}-${album}`
  );

  const load = useCallback(async () => {
    if (!artist || !album) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchSongsByArtistAlbum(artist, album);
      setSongs(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load songs.');
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, [album, artist]);

  useEffect(() => {
    void load();
  }, [load]);

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

  if (!artist || !album) {
    return (
      <ScreenScrollView includeFloatingChrome>
        <ScriptureBackBar />
        <EmptyState title="Playlist not found" />
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView includeFloatingChrome>
      <ScriptureBackBar />
      <ScriptureBookHeader title={album} subtitle={artist} />

      <View style={styles.searchWrap}>
        <SearchBar
          placeholder="Search songs"
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
      ) : songs.length === 0 ? (
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
              {index < filteredSongs.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  searchWrap: { marginBottom: Space.s16 },
  spinner: { marginTop: Spacing.xxl },
  list: { marginTop: 2 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Layout.cardBorder,
    marginLeft: 60,
  },
});
