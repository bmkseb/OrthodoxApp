import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ScriptureBackBar } from '@/components/scripture/scripture-back-bar';
import { ScriptureBookHeader } from '@/components/scripture/scripture-book-header';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { BorderRadius, Layout, Palette, Spacing } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import {
  clearMezmurCache,
  encodeRouteParam,
  fetchArtists,
  type MezmurArtist,
} from '@/lib/mezmur';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function ListenArtistsScreen() {
  const { t } = useTranslation();
  const [artists, setArtists] = useState<MezmurArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setArtists(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load mezmur.');
      setArtists([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ScreenScrollView
      includeFloatingChrome={false}
      refreshing={refreshing}
      onRefresh={() => load(true)}>
      <ScriptureBackBar />
      <ScriptureBookHeader title="Mezmur" subtitle="Browse channels" />

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
      ) : (
        <View style={styles.list}>
          {artists.map((artist, index) => (
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
                    {artist.albumCount} {artist.albumCount === 1 ? 'album' : 'albums'} · {artist.songCount}{' '}
                    {artist.songCount === 1 ? 'song' : 'songs'}
                  </ThemedText>
                </View>
                <Text style={styles.chevron}>›</Text>
              </OrthodoxPressable>
              {index < artists.length - 1 ? <View style={styles.divider} /> : null}
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
    paddingVertical: 12,
    paddingHorizontal: 2,
    gap: 12,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.card,
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
  chevron: { color: Palette.muted, fontSize: 16 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Layout.cardBorder,
    marginLeft: 64,
  },
});
