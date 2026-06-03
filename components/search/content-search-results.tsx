import React from 'react';
import { ActivityIndicator, Keyboard, StyleSheet, View } from 'react-native';
import { Image, type ImageSourcePropType } from 'expo-image';

import { ChannelAvatarImage } from '@/components/listen/channel-avatar-image';
import {
  VIDEO_THUMB_BORDER_RADIUS,
  VIDEO_THUMB_ROW_HEIGHT,
  VIDEO_THUMB_ROW_WIDTH,
  videoThumbHeightForWidth,
  VideoThumbnail,
} from '@/components/listen/video-thumbnail';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Palette, Spacing } from '@/constants/theme';

export type ContentSearchHit = {
  id: string;
  title: string;
  subtitle?: string;
  snippet?: string;
  /** When set (including null), renders a leading thumbnail on the left. */
  imageUri?: string | null;
  /** YouTube video id — uses mqdefault (16:9, no letterbox bars). */
  videoId?: string;
  /** Renders a circular thumbnail (e.g. mezmur channels). */
  circularImage?: boolean;
  /** 16:9 landscape thumbnail (e.g. mezmur playlists). */
  wideImage?: boolean;
  /** Square album art — full image visible (no crop). */
  albumArt?: boolean;
  imageSource?: ImageSourcePropType;
  /** Header rows (books, topics, chapters) omit the quote snippet. */
  isHeader?: boolean;
  onPress: () => void;
};

type ContentSearchResultsProps = {
  heading: string;
  hits: ContentSearchHit[];
  loading?: boolean;
  emptyLabel?: string;
};

export function ContentSearchResults({
  heading,
  hits,
  loading = false,
  emptyLabel,
}: ContentSearchResultsProps) {
  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={Palette.gold} />
      </View>
    );
  }

  if (hits.length === 0) {
    if (!emptyLabel) return null;
    return (
      <ThemedText type="muted" style={styles.empty}>
        {emptyLabel}
      </ThemedText>
    );
  }

  return (
    <View style={styles.wrap}>
      <ThemedText style={styles.heading}>{heading}</ThemedText>
      <View style={styles.list}>
        {hits.map((hit, index) => {
          const showImage = hit.imageUri !== undefined;
          const circular = showImage && hit.circularImage;
          const wide = showImage && hit.wideImage && !circular && !hit.albumArt;
          const albumArt = showImage && hit.albumArt && !circular;
          return (
          <View key={hit.id}>
            <OrthodoxPressable
              style={[styles.row, showImage && styles.rowWithImage]}
              onPress={() => {
                Keyboard.dismiss();
                hit.onPress();
              }}
              accessibilityRole="button"
              accessibilityLabel={`${hit.title}. ${hit.isHeader ? hit.subtitle ?? hit.title : hit.snippet ?? hit.title}`}>
              {showImage ? (
                hit.imageUri && !hit.imageSource && !circular && !albumArt ? (
                  <VideoThumbnail
                    uri={hit.imageUri}
                    videoId={hit.videoId}
                    width={wide ? 64 : undefined}
                    height={wide ? videoThumbHeightForWidth(64) : undefined}
                    spacing={8}
                  />
                ) : circular && hit.imageUri !== undefined ? (
                  <ChannelAvatarImage
                    channelName={hit.title}
                    size={52}
                    imageUri={hit.imageUri}
                    style={styles.thumbCircleAvatar}
                  />
                ) : hit.imageUri || hit.imageSource ? (
                  <Image
                    source={hit.imageSource ?? { uri: hit.imageUri! }}
                    style={[
                      styles.thumb,
                      wide && styles.thumbWide,
                      albumArt && styles.thumbAlbumArt,
                    ]}
                    contentFit={albumArt ? 'cover' : 'contain'}
                  />
                ) : (
                  <View
                    style={[
                      styles.thumb,
                      circular && styles.thumbCircle,
                      wide && styles.thumbWide,
                      albumArt && styles.thumbAlbumArt,
                      styles.thumbPlaceholder,
                    ]}>
                    <ThemedText style={styles.thumbGlyph}>{hit.title.charAt(0)}</ThemedText>
                  </View>
                )
              ) : null}
              <View style={styles.copy}>
                <ThemedText style={[styles.title, hit.isHeader && styles.headerTitle]} numberOfLines={1}>
                  {hit.title}
                </ThemedText>
                {hit.subtitle ? (
                  <ThemedText style={styles.subtitle} numberOfLines={1}>
                    {hit.subtitle}
                  </ThemedText>
                ) : null}
                {!hit.isHeader && hit.snippet ? (
                  <ThemedText style={styles.snippet} numberOfLines={3}>
                    {hit.snippet}
                  </ThemedText>
                ) : null}
              </View>
              <ThemedText style={styles.chevron}>›</ThemedText>
            </OrthodoxPressable>
            {index < hits.length - 1 ? (
              <View
                style={[
                  styles.divider,
                  showImage &&
                    (albumArt
                      ? styles.dividerWithAlbumArt
                      : wide
                        ? styles.dividerWithWideImage
                        : circular
                          ? styles.dividerWithCircleImage
                          : styles.dividerWithImage),
                ]}
              />
            ) : null}
          </View>
        );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: Layout.sectionHeaderGap },
  heading: {
    fontSize: 12,
    fontWeight: '500',
    color: Palette.mutedGold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  list: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorderThin,
    backgroundColor: 'rgba(22, 19, 16, 0.75)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
  },
  rowWithImage: {
    alignItems: 'center',
  },
  thumb: {
    width: VIDEO_THUMB_ROW_WIDTH,
    height: VIDEO_THUMB_ROW_HEIGHT,
    marginRight: 8,
    borderRadius: VIDEO_THUMB_BORDER_RADIUS,
    overflow: 'hidden',
    backgroundColor: Palette.card,
  },
  thumbCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 8,
  },
  thumbCircleAvatar: {
    marginRight: 8,
  },
  thumbWide: {
    width: 64,
    height: videoThumbHeightForWidth(64),
    marginRight: 8,
    borderRadius: VIDEO_THUMB_BORDER_RADIUS,
    overflow: 'hidden',
  },
  thumbAlbumArt: {
    width: 58,
    height: Math.round((58 * 3) / 4),
    borderRadius: BorderRadius.md,
    marginRight: 8,
    overflow: 'hidden',
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbGlyph: {
    color: Palette.gold,
    fontSize: 16,
    fontWeight: '700',
  },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
  },
  headerTitle: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 12,
    color: Palette.gold,
  },
  snippet: {
    fontSize: 13,
    lineHeight: 19,
    color: Palette.muted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
    color: 'rgba(201, 147, 58, 0.45)',
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
    backgroundColor: 'rgba(201, 147, 58, 0.1)',
  },
  dividerWithImage: {
    marginLeft: Spacing.md + 56 + 8,
  },
  dividerWithCircleImage: {
    marginLeft: Spacing.md + 52 + Spacing.sm,
  },
  dividerWithWideImage: {
    marginLeft: Spacing.md + 64 + 8,
  },
  dividerWithAlbumArt: {
    marginLeft: Spacing.md + 58 + 8,
  },
  loadingWrap: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
});
