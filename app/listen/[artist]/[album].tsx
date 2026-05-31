import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ScriptureBackBar } from '@/components/scripture/scripture-back-bar';
import { ScriptureBookHeader } from '@/components/scripture/scripture-book-header';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Layout, Palette, Spacing } from '@/constants/theme';
import { useAudioPlayer } from '@/contexts/audio-player-context';
import { useTranslation } from '@/hooks/use-translation';
import {
  decodeRouteParam,
  fetchSongsByArtistAlbum,
  mezmurListToAudioTracks,
  mezmurToAudioTrack,
  type Mezmur,
} from '@/lib/mezmur';

export default function ListenSongsScreen() {
  const { t } = useTranslation();
  const { playTrack, openFullPlayer } = useAudioPlayer();
  const { artist: artistParam, album: albumParam } = useLocalSearchParams<{
    artist: string;
    album: string;
  }>();
  const artist = decodeRouteParam(artistParam);
  const album = decodeRouteParam(albumParam);

  const [songs, setSongs] = useState<Mezmur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const playSong = useCallback(
    (song: Mezmur) => {
      const queue = mezmurListToAudioTracks(songs);
      playTrack(mezmurToAudioTrack(song), { queue, autoPlay: true });
      openFullPlayer();
    },
    [openFullPlayer, playTrack, songs]
  );

  if (!artist || !album) {
    return (
      <ScreenScrollView includeFloatingChrome={false}>
        <ScriptureBackBar />
        <EmptyState title="Playlist not found" />
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView includeFloatingChrome={false}>
      <ScriptureBackBar />
      <ScriptureBookHeader title={album} subtitle={artist} />

      {loading ? (
        <ActivityIndicator color={Palette.gold} style={styles.spinner} />
      ) : error ? (
        <EmptyState title={error} suggestion={t('scripture.tryAgain')} />
      ) : songs.length === 0 ? (
        <EmptyState title="No songs found" suggestion="Try again later." />
      ) : (
        <View style={styles.list}>
          {songs.map((song, index) => (
            <View key={song.videoId}>
              <OrthodoxPressable
                style={styles.row}
                onPress={() => playSong(song)}
                accessibilityRole="button">
                <ThemedText style={styles.rowTitle} numberOfLines={2}>
                  {song.title}
                </ThemedText>
                <Text style={styles.chevron}>›</Text>
              </OrthodoxPressable>
              {index < songs.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  spinner: { marginTop: Spacing.xxl },
  list: { marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 2,
    gap: 8,
  },
  rowTitle: {
    fontSize: 15,
    color: Palette.text,
    flex: 1,
    flexShrink: 1,
    lineHeight: 21,
  },
  chevron: { color: Palette.muted, fontSize: 16 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Layout.cardBorder,
  },
});
