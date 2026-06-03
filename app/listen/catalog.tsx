import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CreatePlaylistListRow } from '@/components/listen/create-playlist-list-row';
import { HymnsCatalogListRow } from '@/components/listen/hymns-catalog-list-row';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Palette, Spacing } from '@/constants/theme';
import { HYMNS_CATALOG_SECTIONS, shelfForHymnsSection } from '@/data/hymnsCatalog';
import { USER_PLAYLIST_ARTIST } from '@/data/userPlaylists';
import { useUserPlaylists } from '@/hooks/use-user-playlists';
import { userPlaylistThumbnail } from '@/lib/user-playlists';
import { useTranslation } from '@/hooks/use-translation';
import {
  clearMezmurCache,
  encodeRouteParam,
  fetchArtists,
  formatMezmurChannelSubtitle,
  type MezmurArtist,
} from '@/lib/mezmur';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function HymnsCatalogScreen() {
  const { t, mode } = useTranslation();
  const { section } = useLocalSearchParams<{ section?: string }>();
  const shelf = shelfForHymnsSection(section);
  const isPlaylists = shelf.section === 'playlists';

  const { playlists: userPlaylists, ready: playlistsReady, refresh: refreshPlaylists } =
    useUserPlaylists();
  const [channels, setChannels] = useState<MezmurArtist[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(!isPlaylists);
  const [channelsError, setChannelsError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadChannels = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      clearMezmurCache();
      setRefreshing(true);
    } else {
      setChannelsLoading(true);
    }
    setChannelsError(null);

    try {
      const rows = await fetchArtists();
      setChannels(rows);
    } catch (e) {
      setChannelsError(e instanceof Error ? e.message : 'Could not load channels.');
      setChannels([]);
    } finally {
      setChannelsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isPlaylists) return;
    void loadChannels();
  }, [isPlaylists, loadChannels]);

  const onRefresh = useCallback(async () => {
    if (isPlaylists) {
      setRefreshing(true);
      try {
        await refreshPlaylists();
      } finally {
        setRefreshing(false);
      }
      return;
    }
    await loadChannels(true);
  }, [isPlaylists, loadChannels, refreshPlaylists]);

  const sortedPlaylists = useMemo(
    () => [...userPlaylists].sort((a, b) => a.title.localeCompare(b.title)),
    [userPlaylists]
  );

  const sortedChannels = useMemo(
    () => [...channels].sort((a, b) => a.name.localeCompare(b.name)),
    [channels]
  );

  return (
    <ScreenScrollView
      includeFloatingChrome={false}
      refreshing={refreshing}
      onRefresh={() => void onRefresh()}>
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
      <ThemedText style={styles.pageTitle}>{t(shelf.titleKey)}</ThemedText>
      {mode !== 'en' ? <ThemedText style={styles.pageGeez}>{shelf.geez}</ThemedText> : null}
      <ThemedText type="muted" style={styles.description}>
        {t(shelf.descriptionKey)}
      </ThemedText>

      <View style={styles.switcher}>
        {HYMNS_CATALOG_SECTIONS.map((option) => {
          const active = option.section === shelf.section;
          return (
            <OrthodoxPressable
              key={option.section}
              style={[styles.switchTab, active && styles.switchTabActive]}
              onPress={() => router.setParams({ section: option.section })}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}>
              <ThemedText style={[styles.switchLabel, active && styles.switchLabelActive]}>
                {t(option.titleKey)}
              </ThemedText>
            </OrthodoxPressable>
          );
        })}
      </View>

      {isPlaylists ? (
        !playlistsReady ? (
          <ActivityIndicator color={Palette.gold} style={styles.spinner} />
        ) : (
          <>
            <CreatePlaylistListRow
              compact
              title={t('listen.createYourPlaylist')}
              onPress={() => router.push('/listen/my-playlist/new' as never)}
            />
            {sortedPlaylists.length === 0 ? (
              <ThemedText type="muted" style={styles.inlineEmpty}>
                {t('listen.noPlaylistsYet')}
              </ThemedText>
            ) : (
              sortedPlaylists.map((playlist) => {
                const count = playlist.videoIds.length;
                const countLabel = `${count} ${count === 1 ? 'song' : 'songs'}`;
                return (
                  <HymnsCatalogListRow
                    key={playlist.id}
                    title={playlist.title}
                    subtitle={countLabel}
                    leadingShape="cover"
                    imageUri={userPlaylistThumbnail(playlist)}
                    onPress={() =>
                      router.push(
                        `/listen/${encodeRouteParam(USER_PLAYLIST_ARTIST)}/${encodeRouteParam(playlist.id)}` as never
                      )
                    }
                  />
                );
              })
            )}
          </>
        )
      ) : channelsLoading ? (
        <ActivityIndicator color={Palette.gold} style={styles.spinner} />
      ) : channelsError ? (
        <EmptyState title={channelsError} suggestion={t('scripture.tryAgain')} />
      ) : sortedChannels.length === 0 ? (
        <EmptyState
          title="No channels found"
          suggestion={
            isSupabaseConfigured()
              ? 'Run the mezmur sync script to populate the catalog.'
              : 'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file.'
          }
        />
      ) : (
        sortedChannels.map((channel) => (
          <HymnsCatalogListRow
            key={channel.name}
            title={channel.name}
            subtitle={formatMezmurChannelSubtitle(
              channel.name,
              channel.albumCount,
              channel.songCount
            )}
            leadingShape="circle"
            imageUri={channel.thumbnailUrl}
            onPress={() => router.push(`/listen/${encodeRouteParam(channel.name)}` as never)}
          />
        ))
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
  spinner: {
    marginTop: Spacing.lg,
  },
  inlineEmpty: {
    marginTop: Spacing.sm,
    lineHeight: 21,
  },
});
