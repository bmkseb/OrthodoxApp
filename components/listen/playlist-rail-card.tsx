import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { MezmurAlbumThumbnail } from '@/components/listen/mezmur-album-thumbnail';
import { ThumbnailCollage } from '@/components/listen/thumbnail-collage';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { SacredImage } from '@/components/ui/sacred-image';
import { LISTEN_RAIL_FRAME } from '@/constants/listen-layout';
import { Layout, Palette, Space, Typography } from '@/constants/theme';

type RailFrame = {
  width: number;
  height: number;
  borderRadius: number;
  gap?: number;
};

type PlaylistRailCardProps = {
  title: string;
  subtitle?: string;
  artist?: string;
  secondaryText?: string;
  imageUri?: string | null;
  collageUris?: string[];
  fallbackImageUri?: string;
  progress?: number;
  /** Progress bar under metadata (continue listening). */
  progressBelow?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  removeLabel?: string;
};

/** Horizontal rail card — playlists and continue listening. */
export const PlaylistRailCard = memo(function PlaylistRailCard({
  title,
  subtitle,
  artist,
  secondaryText,
  imageUri,
  collageUris,
  fallbackImageUri,
  progress = 0,
  progressBelow = false,
  onPress,
  onRemove,
  removeLabel,
}: PlaylistRailCardProps) {
  const frame: RailFrame = LISTEN_RAIL_FRAME;
  const gap = frame.gap ?? Layout.cardGap;
  const uri = imageUri ?? fallbackImageUri;
  const collage = collageUris?.filter(Boolean) ?? [];
  const showCollage = collage.length > 0 && !imageUri;
  const showProgress = progress > 0;
  const metaSecondary = secondaryText ?? subtitle;

  return (
    <OrthodoxPressable
      style={[styles.wrap, { width: frame.width, marginRight: gap }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={metaSecondary ? `${title}. ${metaSecondary}` : title}>
      <View
        style={[
          styles.card,
          {
            width: frame.width,
            height: frame.height,
            borderRadius: frame.borderRadius,
          },
        ]}>
        {artist ? (
          <MezmurAlbumThumbnail
            artist={artist}
            album={title}
            thumbnailUrl={imageUri}
            collageUris={collageUris}
            style={styles.thumb}
          />
        ) : showCollage ? (
          <ThumbnailCollage uris={collage} style={styles.thumb} />
        ) : uri ? (
          <SacredImage uri={uri} style={styles.thumb} contentFit="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Icon name="music" size={18} color={Palette.gold} />
          </View>
        )}

        {showProgress && !progressBelow ? (
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }]}
            />
          </View>
        ) : null}

        {onRemove ? (
          <OrthodoxPressable
            style={styles.removeBtn}
            onPress={onRemove}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={removeLabel ?? 'Remove'}>
            <Icon name="close" size={10} color={Palette.text} />
          </OrthodoxPressable>
        ) : null}
      </View>

      <ThemedText style={styles.title} numberOfLines={2}>
        {title}
      </ThemedText>

      {metaSecondary ? (
        <ThemedText type="muted" style={styles.subtitle} numberOfLines={1}>
          {metaSecondary}
        </ThemedText>
      ) : null}

      {showProgress && progressBelow ? (
        <View style={styles.progressBelowTrack}>
          <View
            style={[styles.progressFill, { width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }]}
          />
        </View>
      ) : null}
    </OrthodoxPressable>
  );
});

const styles = StyleSheet.create({
  wrap: {},
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorderThin,
    overflow: 'hidden',
    backgroundColor: Palette.surfaceWarm,
    marginBottom: Space.s8,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.card,
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressBelowTrack: {
    height: 3,
    marginTop: Space.s4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Palette.gold,
  },
  removeBtn: {
    position: 'absolute',
    top: Space.s8,
    right: Space.s8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12, 10, 8, 0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.45)',
    zIndex: 2,
  },
  title: {
    ...Typography.cardTitle,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
    color: Palette.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.15,
  },
});
