import { memo } from 'react';

import { StyleSheet, Text, View } from 'react-native';



import { Icon } from '@/components/Icon';

import { Image } from 'expo-image';

import { MezmurAlbumThumbnail } from '@/components/listen/mezmur-album-thumbnail';
import { isUserPlaylistArtist } from '@/data/userPlaylists';

import { OrthodoxPressable } from '@/components/orthodox-pressable';

import { ThemedText } from '@/components/themed-text';

import {
  MEZMUR_ALBUM_LIST_FRAME,
  MEZMUR_ALBUM_LIST_FRAME_COMPACT,
} from '@/constants/mezmur-album-art';

import { Layout, Palette, Spacing } from '@/constants/theme';



type MezmurPlaylistRowProps = {

  title: string;

  songCount: number;

  artist?: string;

  thumbnailUrl?: string | null;

  onPress: () => void;

  /** Smaller cover and type — used on channel playlist screens. */
  compact?: boolean;

};



/** Flat playlist row — 16:9 rounded album cover. */

export const MezmurPlaylistRow = memo(function MezmurPlaylistRow({

  title,

  songCount,

  artist,

  thumbnailUrl,

  onPress,

  compact = false,

}: MezmurPlaylistRowProps) {

  const frame = compact ? MEZMUR_ALBUM_LIST_FRAME_COMPACT : MEZMUR_ALBUM_LIST_FRAME;
  const countLabel = `${songCount} ${songCount === 1 ? 'song' : 'songs'}`;

  const isUserPlaylist = Boolean(artist && isUserPlaylistArtist(artist));
  const useRemoteThumb = Boolean(thumbnailUrl) && (!artist || isUserPlaylist);
  const hasThumb = useRemoteThumb || (Boolean(artist) && !isUserPlaylist);



  return (

    <OrthodoxPressable

      style={[styles.row, compact && styles.rowCompact]}

      onPress={onPress}

      accessibilityRole="button"

      accessibilityLabel={`${title}. ${countLabel}`}>

      {hasThumb ? (
        <View style={[styles.thumb, { width: frame.width, height: frame.height, borderRadius: frame.borderRadius }]}>
          {useRemoteThumb ? (
            <Image
              source={{ uri: thumbnailUrl! }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          ) : (
            <MezmurAlbumThumbnail
              artist={artist}
              album={title}
              thumbnailUrl={thumbnailUrl}
              style={StyleSheet.absoluteFill}
            />
          )}
        </View>
      ) : (

        <View
          style={[
            styles.thumb,
            styles.thumbPlaceholder,
            { width: frame.width, height: frame.height, borderRadius: frame.borderRadius },
          ]}>

          <Icon name="music" size={compact ? 16 : 20} color={Palette.gold} />

        </View>

      )}

      <View style={styles.rowBody}>

        <ThemedText style={[styles.rowTitle, compact && styles.rowTitleCompact]} numberOfLines={2}>

          {title}

        </ThemedText>

        <ThemedText type="muted" style={[styles.rowMeta, compact && styles.rowMetaCompact]}>

          {countLabel}

        </ThemedText>

      </View>

      <Text style={[styles.chevron, compact && styles.chevronCompact]}>›</Text>

    </OrthodoxPressable>

  );

});



const styles = StyleSheet.create({

  row: {

    flexDirection: 'row',

    alignItems: 'center',

    paddingVertical: 12,

    paddingHorizontal: 2,

    gap: Spacing.sm + 2,

  },

  rowCompact: {
    paddingVertical: 8,
    gap: Spacing.sm,
  },

  thumb: {

    backgroundColor: Palette.card,

    borderWidth: StyleSheet.hairlineWidth,

    borderColor: 'rgba(201, 147, 58, 0.2)',

    overflow: 'hidden',

  },

  thumbPlaceholder: {

    alignItems: 'center',

    justifyContent: 'center',

    borderWidth: 1,

    borderColor: Layout.cardBorder,

  },

  rowBody: { flex: 1, gap: 4 },

  rowTitle: {

    fontSize: 16,

    fontWeight: '600',

    color: Palette.text,

    lineHeight: 22,

  },

  rowTitleCompact: {
    fontSize: 15,
    lineHeight: 20,
  },

  rowMeta: { fontSize: 13, lineHeight: 18 },

  rowMetaCompact: { fontSize: 12, lineHeight: 16 },

  chevron: { color: Palette.mutedGold, fontSize: 22 },

  chevronCompact: { fontSize: 20 },

});


