import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { MezmurAlbumThumbnail } from '@/components/listen/mezmur-album-thumbnail';
import { ThumbnailCollage } from '@/components/listen/thumbnail-collage';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { SacredImage } from '@/components/ui/sacred-image';
import { LISTEN_RANKED_RAIL, LISTEN_RAIL_FRAME } from '@/constants/listen-layout';
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
  /** Netflix-style top-10 rank badge (1–10). */
  rank?: number;
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
  rank,
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

  const accessibilityLabel =
    rank != null
      ? `Number ${rank}. ${title}${metaSecondary ? `. ${metaSecondary}` : ''}`
      : metaSecondary
        ? `${title}. ${metaSecondary}`
        : title;

  const card = (
    <OrthodoxPressable
      style={[styles.wrap, { width: frame.width, marginRight: rank == null ? gap : 0 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
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

  if (rank == null) return card;

  const isDoubleDigit = rank >= 10;

  return (
    <View style={[styles.rankedRow, { marginRight: gap }]}>
      <View
        style={[
          styles.rankColumn,
          {
            width: isDoubleDigit
              ? LISTEN_RANKED_RAIL.rankColumnWidthDouble
              : LISTEN_RANKED_RAIL.rankColumnWidth,
            height: frame.height,
            marginRight: isDoubleDigit
              ? LISTEN_RANKED_RAIL.rankToCardGapDouble
              : LISTEN_RANKED_RAIL.rankToCardGap,
          },
        ]}>
        <View style={styles.rankNumberAnchor}>
          {isDoubleDigit ? (
            <View
              style={styles.rankDigitsRow}
              accessibilityElementsHidden
              importantForAccessibility="no">
              {String(rank)
                .split('')
                .map((digit, index) => (
                  <Text
                    key={`${rank}-${index}`}
                    style={[styles.rankDigit, index === 0 ? styles.rankDigitLeading : null]}
                    allowFontScaling={false}>
                    {digit}
                  </Text>
                ))}
            </View>
          ) : (
            <Text
              style={styles.rankNumber}
              allowFontScaling={false}
              accessibilityElementsHidden
              importantForAccessibility="no">
              {rank}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.rankedCardColumn}>{card}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  rankedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'visible',
  },
  rankColumn: {
    position: 'relative',
    flexShrink: 0,
    overflow: 'visible',
  },
  rankNumberAnchor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  rankedCardColumn: {
    flexShrink: 0,
  },
  rankDigitsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    transform: [{ translateY: LISTEN_RANKED_RAIL.rankTenOffsetY }],
  },
  rankDigit: {
    fontSize: LISTEN_RANKED_RAIL.rankFontSizeDouble,
    fontWeight: '900',
    lineHeight: LISTEN_RANKED_RAIL.rankFontSizeDouble,
    letterSpacing: 0,
    color: Palette.text,
    includeFontPadding: false,
    textShadowColor: Palette.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  rankDigitLeading: {
    marginRight: -2,
  },
  rankNumber: {
    fontSize: LISTEN_RANKED_RAIL.rankFontSize,
    fontWeight: '900',
    lineHeight: LISTEN_RANKED_RAIL.rankFontSize,
    letterSpacing: -3,
    color: Palette.text,
    textAlign: 'center',
    includeFontPadding: false,
    textShadowColor: Palette.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
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
