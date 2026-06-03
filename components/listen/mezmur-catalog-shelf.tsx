import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BookshelfSection } from '@/components/read/bookshelf-section';
import { ShelfSubsectionHeader } from '@/components/read/shelf-subsection-header';
import {
  HorizontalScrollIndicator,
  useHorizontalScrollIndicator,
} from '@/components/ui/scroll-indicator';
import { ChannelRailCard } from '@/components/listen/channel-rail-card';
import { CreatePlaylistRailCard } from '@/components/listen/create-playlist-rail-card';
import { PlaylistRailCard } from '@/components/listen/playlist-rail-card';
import {
  LISTEN_CHANNEL_RAIL_SCROLL_CONTENT,
  LISTEN_RAIL_SCROLL_CONTENT,
} from '@/constants/listen-layout';
import { SacredImagery } from '@/constants/sacred-imagery';
import { Space } from '@/constants/theme';
import type { SavedListenKind } from '@/hooks/use-saved-hymns';
import {
  encodeRouteParam,
  formatMezmurChannelSubtitle,
  type MezmurArtist,
  type MezmurPlaylistCard,
} from '@/lib/mezmur';
import type { LanguageMode } from '@/lib/translations';

export type MezmurCatalogRailItem = {
  key: string;
  title: string;
  subtitle?: string;
  artist?: string;
  imageUri?: string | null;
  collageUris?: string[];
  onPress: () => void;
  variant?: 'create' | 'playlist';
};

type MezmurCatalogShelfProps = {
  title: string;
  artists?: MezmurArtist[];
  playlists?: MezmurPlaylistCard[];
  items?: MezmurCatalogRailItem[];
  onSeeAll?: () => void;
  /** Drop bottom margin when another section follows immediately. */
  compactBottom?: boolean;
  /** Wording for channel subtitles (songs vs sermons). */
  channelKind?: SavedListenKind;
  languageMode?: LanguageMode;
  /** When `items` are channel cards (circular avatars), set to `channel`. */
  railKind?: 'channel' | 'playlist';
};

/** A catalog shelf — themes, channels, or playlists in a horizontal rail. */
export function MezmurCatalogShelf({
  title,
  artists = [],
  playlists = [],
  items = [],
  onSeeAll,
  compactBottom = false,
  channelKind = 'hymn',
  languageMode = 'en',
  railKind,
}: MezmurCatalogShelfProps) {
  const router = useRouter();
  const { values, scrollHandler, onLayout, onContentSizeChange } = useHorizontalScrollIndicator();

  const isChannelRail = railKind === 'channel' || artists.length > 0;

  const railItems: MezmurCatalogRailItem[] =
    items.length > 0
      ? items
      : playlists.length > 0
        ? playlists.map((playlist) => ({
            key: `${playlist.artist}-${playlist.album}`,
            title: playlist.album,
            subtitle: `${playlist.artist} · ${playlist.songCount} songs`,
            artist: playlist.artist,
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
              channel.songCount,
              { kind: channelKind, mode: languageMode }
            ),
            imageUri: channel.thumbnailUrl,
            onPress: () => router.push(`/listen/${encodeRouteParam(channel.name)}` as never),
          }));

  if (railItems.length === 0) return null;

  return (
    <View style={[styles.wrap, compactBottom && styles.wrapCompact]}>
      <ShelfSubsectionHeader title={title} onSeeAllPress={onSeeAll} />

      <BookshelfSection
        horizontal
        scrollProps={{
          onScroll: scrollHandler,
          onLayout,
          onContentSizeChange,
          contentContainerStyle: isChannelRail
            ? LISTEN_CHANNEL_RAIL_SCROLL_CONTENT
            : LISTEN_RAIL_SCROLL_CONTENT,
        }}>
        {railItems.map((item) => {
          if (item.variant === 'create') {
            return (
              <CreatePlaylistRailCard
                key={item.key}
                title={item.title}
                onPress={item.onPress}
              />
            );
          }
          if (isChannelRail) {
            return (
              <ChannelRailCard
                key={item.key}
                title={item.title}
                subtitle={item.subtitle}
                imageUri={item.imageUri}
                onPress={item.onPress}
              />
            );
          }
          return (
            <PlaylistRailCard
              key={item.key}
              title={item.title}
              subtitle={item.subtitle}
              artist={item.artist}
              imageUri={item.imageUri}
              collageUris={item.collageUris}
              fallbackImageUri={item.imageUri ? SacredImagery.listenHymns : undefined}
              onPress={item.onPress}
            />
          );
        })}
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
    marginBottom: Space.s12,
  },
  wrapCompact: {
    marginBottom: 0,
  },
  hint: {
    marginTop: Space.s8,
  },
});
