import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BookshelfSection } from '@/components/read/bookshelf-section';
import { ThemedText } from '@/components/themed-text';
import {
  HorizontalScrollIndicator,
  useHorizontalScrollIndicator,
} from '@/components/ui/scroll-indicator';
import { ChannelRailCard } from '@/components/listen/channel-rail-card';
import { PlaylistRailCard } from '@/components/listen/playlist-rail-card';
import { SacredImagery } from '@/constants/sacred-imagery';
import { Palette, Space } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import {
  encodeRouteParam,
  formatMezmurChannelSubtitle,
  type MezmurArtist,
  type MezmurPlaylistCard,
} from '@/lib/mezmur';

export type MezmurCatalogRailItem = {
  key: string;
  title: string;
  subtitle: string;
  imageUri?: string | null;
  onPress: () => void;
};

type MezmurCatalogShelfProps = {
  title: string;
  artists?: MezmurArtist[];
  playlists?: MezmurPlaylistCard[];
  items?: MezmurCatalogRailItem[];
  onSeeAll?: () => void;
  /** Drop bottom margin when another section follows immediately. */
  compactBottom?: boolean;
};

/** A catalog shelf — themes, channels, or playlists in a horizontal rail. */
export function MezmurCatalogShelf({
  title,
  artists = [],
  playlists = [],
  items = [],
  onSeeAll,
  compactBottom = false,
}: MezmurCatalogShelfProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { values, scrollHandler, onLayout, onContentSizeChange } = useHorizontalScrollIndicator();

  const isChannelRail = artists.length > 0;

  const railItems: MezmurCatalogRailItem[] =
    items.length > 0
      ? items
      : playlists.length > 0
        ? playlists.map((playlist) => ({
            key: `${playlist.artist}-${playlist.album}`,
            title: playlist.album,
            subtitle: `${playlist.artist} · ${playlist.songCount} songs`,
            imageUri: playlist.thumbnailUrl,
            onPress: () =>
              router.push(
                `/listen/${encodeRouteParam(playlist.artist)}/${encodeRouteParam(playlist.album)}` as never
              ),
          }))
        : artists.map((channel) => ({
            key: channel.name,
            title: channel.name,
            subtitle: formatMezmurChannelSubtitle(
              channel.name,
              channel.albumCount,
              channel.songCount
            ),
            imageUri: channel.thumbnailUrl,
            onPress: () => router.push(`/listen/${encodeRouteParam(channel.name)}` as never),
          }));

  if (railItems.length === 0) return null;

  return (
    <View style={[styles.wrap, compactBottom && styles.wrapCompact]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.accent} />
          <ThemedText style={styles.title}>{title}</ThemedText>
        </View>
        {onSeeAll ? (
          <TouchableOpacity
            onPress={onSeeAll}
            accessibilityRole="button"
            accessibilityLabel={`See all ${title}`}>
            <ThemedText type="seeAll" style={styles.seeAll}>
              {t('common.seeAll')}
            </ThemedText>
          </TouchableOpacity>
        ) : null}
      </View>

      <BookshelfSection
        horizontal
        scrollProps={{
          onScroll: scrollHandler,
          onLayout,
          onContentSizeChange,
        }}>
        {railItems.map((item) =>
          isChannelRail ? (
            <ChannelRailCard
              key={item.key}
              title={item.title}
              subtitle={item.subtitle}
              imageUri={item.imageUri}
              onPress={item.onPress}
            />
          ) : (
            <PlaylistRailCard
              key={item.key}
              title={item.title}
              subtitle={item.subtitle}
              imageUri={item.imageUri}
              fallbackImageUri={SacredImagery.listenHymns}
              onPress={item.onPress}
            />
          )
        )}
      </BookshelfSection>

      {railItems.length > 2 ? (
        <View style={styles.hint}>
          <HorizontalScrollIndicator values={values} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Space.s16,
  },
  wrapCompact: {
    marginBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Space.s8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  accent: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: Palette.gold,
    marginRight: Space.s8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: Palette.text,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '500',
  },
  hint: {
    marginTop: Space.s8,
  },
});
