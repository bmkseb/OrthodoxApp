import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ScriptureBackBar } from '@/components/scripture/scripture-back-bar';
import { ScriptureBookHeader } from '@/components/scripture/scripture-book-header';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { BorderRadius, Layout, Palette } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import {
  decodeRouteParam,
  encodeRouteParam,
  fetchAlbumsByArtist,
  type MezmurAlbum,
} from '@/lib/mezmur';

export default function ListenAlbumsScreen() {
  const { t } = useTranslation();
  const { artist: artistParam } = useLocalSearchParams<{ artist: string }>();
  const artist = decodeRouteParam(artistParam);

  const [albums, setAlbums] = useState<MezmurAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (!artist) {
    return (
      <ScreenScrollView includeFloatingChrome={false}>
        <ScriptureBackBar />
        <EmptyState title="Channel not found" />
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView includeFloatingChrome={false}>
      <ScriptureBackBar />
      <ScriptureBookHeader title={artist} subtitle="Select a playlist" />

      {loading ? (
        <ActivityIndicator color={Palette.gold} style={styles.spinner} />
      ) : error ? (
        <EmptyState title={error} suggestion={t('scripture.tryAgain')} />
      ) : albums.length === 0 ? (
        <EmptyState title="No playlists found" suggestion="Try again later." />
      ) : (
        <View style={styles.grid}>
          {albums.map((album) => (
            <OrthodoxPressable
              key={album.name}
              style={styles.playlistCell}
              onPress={() =>
                router.push(
                  `/listen/${encodeRouteParam(artist)}/${encodeRouteParam(album.name)}` as never
                )
              }
              accessibilityRole="button">
              <ThemedText style={styles.playlistTitle} numberOfLines={3}>
                {album.name}
              </ThemedText>
              <ThemedText type="muted" style={styles.playlistMeta}>
                {album.songCount} {album.songCount === 1 ? 'song' : 'songs'}
              </ThemedText>
            </OrthodoxPressable>
          ))}
        </View>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  spinner: { marginTop: 32 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  playlistCell: {
    width: '30%',
    minWidth: 96,
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Layout.cardBorder,
    backgroundColor: Palette.card,
  },
  playlistTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.gold,
    textAlign: 'center',
    lineHeight: 18,
  },
  playlistMeta: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
