import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { MezmurAlbumThumbnail } from '@/components/listen/mezmur-album-thumbnail';
import { ThumbnailCollage } from '@/components/listen/thumbnail-collage';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { ChannelAvatarImage } from '@/components/listen/channel-avatar-image';
import { mezmurChannelImageSource } from '@/constants/mezmur-channel-art';
import { BorderRadius, Palette, Spacing } from '@/constants/theme';

const LEADING_SIZE = 42;

export type HymnsCatalogListRowProps = {
  title: string;
  subtitle: string;
  onPress: () => void;
  /** Circular avatar (channels). */
  imageUri?: string | null;
  collageUris?: string[];
  leadingShape?: 'circle' | 'cover';
  /** Renders bundled / remote album art in the cover slot. */
  albumArtist?: string;
  albumName?: string;
  albumThumbnailUrl?: string | null;
};

function LeadingVisual({
  title,
  imageUri,
  collageUris,
  leadingShape,
  albumArtist,
  albumName,
  albumThumbnailUrl,
}: Pick<
  HymnsCatalogListRowProps,
  | 'title'
  | 'imageUri'
  | 'collageUris'
  | 'leadingShape'
  | 'albumArtist'
  | 'albumName'
  | 'albumThumbnailUrl'
>) {
  const shape = leadingShape ?? (albumArtist ? 'cover' : 'circle');

  if (shape === 'cover' && albumArtist && albumName) {
    return (
      <View style={styles.cover}>
        <MezmurAlbumThumbnail
          artist={albumArtist}
          album={albumName}
          thumbnailUrl={albumThumbnailUrl}
          style={StyleSheet.absoluteFill}
        />
      </View>
    );
  }

  const channelSource =
    shape === 'circle' ? mezmurChannelImageSource(title, imageUri ?? null) : null;

  if (channelSource && shape === 'circle') {
    return (
      <ChannelAvatarImage
        channelName={title}
        size={LEADING_SIZE}
        imageUri={imageUri}
        style={styles.avatar}
      />
    );
  }

  if (channelSource) {
    return (
      <Image
        source={channelSource}
        style={styles.cover}
        contentFit="cover"
      />
    );
  }

  const collage = collageUris?.filter(Boolean) ?? [];
  if (collage.length > 0 && !imageUri && shape === 'cover') {
    return (
      <View style={styles.cover}>
        <ThumbnailCollage uris={collage} style={StyleSheet.absoluteFill} />
      </View>
    );
  }

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={shape === 'circle' ? styles.avatar : styles.cover}
        contentFit="cover"
      />
    );
  }

  const placeholderStyle = shape === 'circle' ? styles.avatar : styles.coverIcon;
  return (
    <View style={[placeholderStyle, styles.placeholder]}>
      {shape === 'circle' ? (
        <ThemedText style={styles.avatarInitial}>{title.charAt(0)}</ThemedText>
      ) : (
        <Icon name="music" size={18} color={Palette.gold} />
      )}
    </View>
  );
}

/** Card row for Hymns Catalog See All and channel playlist lists. */
export const HymnsCatalogListRow = memo(function HymnsCatalogListRow({
  title,
  subtitle,
  onPress,
  imageUri,
  collageUris,
  leadingShape,
  albumArtist,
  albumName,
  albumThumbnailUrl,
}: HymnsCatalogListRowProps) {
  return (
    <OrthodoxPressable
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}>
      <LeadingVisual
        title={title}
        imageUri={imageUri}
        collageUris={collageUris}
        leadingShape={leadingShape}
        albumArtist={albumArtist}
        albumName={albumName}
        albumThumbnailUrl={albumThumbnailUrl}
      />
      <View style={styles.rowText}>
        <ThemedText style={styles.rowTitle} numberOfLines={1}>
          {title}
        </ThemedText>
        <ThemedText type="muted" style={styles.rowSubtitle} numberOfLines={1}>
          {subtitle}
        </ThemedText>
      </View>
      <ThemedText style={styles.arrow}>›</ThemedText>
    </OrthodoxPressable>
  );
});

/** @deprecated Use HymnsCatalogListRow */
export const HymnsCatalogChannelRow = HymnsCatalogListRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md - 2,
    paddingHorizontal: 2,
    minHeight: 56,
  },
  avatar: {
    marginRight: Spacing.md,
  },
  cover: {
    width: LEADING_SIZE,
    height: LEADING_SIZE,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(201, 147, 58, 0.08)',
  },
  coverIcon: {
    width: LEADING_SIZE,
    height: LEADING_SIZE,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 147, 58, 0.1)',
  },
  avatarInitial: {
    color: Palette.gold,
    fontSize: 17,
    fontWeight: '700',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
    color: Palette.text,
  },
  rowSubtitle: {
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 2,
  },
  arrow: {
    fontSize: 22,
    color: Palette.mutedGold,
    marginLeft: Spacing.sm,
  },
});
