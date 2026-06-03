import React, { memo } from 'react';

import { StyleSheet, Text, View } from 'react-native';



import { Icon } from '@/components/Icon';

import { MezmurAlbumThumbnail } from '@/components/listen/mezmur-album-thumbnail';

import { OrthodoxPressable } from '@/components/orthodox-pressable';

import { ThemedText } from '@/components/themed-text';

import { SacredImage } from '@/components/ui/sacred-image';

import { MEZMUR_PLAYLIST_RAIL_FRAME } from '@/constants/mezmur-album-art';

import { Layout, Palette, Space, Typography } from '@/constants/theme';



const CARD_WIDTH = MEZMUR_PLAYLIST_RAIL_FRAME.width;

const THUMB_HEIGHT = MEZMUR_PLAYLIST_RAIL_FRAME.height;



type PlaylistRailCardProps = {

  title: string;

  subtitle?: string;

  artist?: string;

  imageUri?: string | null;

  fallbackImageUri?: string;

  progress?: number;

  onPress?: () => void;

  onRemove?: () => void;

  removeLabel?: string;

};



/** Landscape 16:9 rail card for playlists. */

export const PlaylistRailCard = memo(function PlaylistRailCard({

  title,

  subtitle,

  artist,

  imageUri,

  fallbackImageUri,

  progress = 0,

  onPress,

  onRemove,

  removeLabel,

}: PlaylistRailCardProps) {

  const uri = imageUri ?? fallbackImageUri;

  const showProgress = progress > 0;



  return (

    <OrthodoxPressable

      style={styles.wrap}

      onPress={onPress}

      accessibilityRole="button"

      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}>

      <View style={styles.card}>

        {artist ? (

          <MezmurAlbumThumbnail

            artist={artist}

            album={title}

            thumbnailUrl={imageUri}

            style={styles.thumb}

          />

        ) : uri ? (

          <SacredImage uri={uri} style={styles.thumb} contentFit="cover" />

        ) : (

          <View style={[styles.thumb, styles.thumbPlaceholder]}>

            <Icon name="music" size={18} color={Palette.gold} />

          </View>

        )}



        {showProgress ? (

          <View style={styles.progressTrack}>

            <View

              style={[

                styles.progressFill,

                { width: `${Math.min(Math.max(progress, 0), 1) * 100}%` },

              ]}

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

      {subtitle ? (

        <ThemedText type="muted" style={styles.subtitle} numberOfLines={2}>

          {subtitle}

        </ThemedText>

      ) : null}

    </OrthodoxPressable>

  );

});



const styles = StyleSheet.create({

  wrap: {

    width: CARD_WIDTH,

    marginRight: Layout.cardGap,

  },

  card: {

    width: CARD_WIDTH,

    height: THUMB_HEIGHT,

    borderRadius: MEZMUR_PLAYLIST_RAIL_FRAME.borderRadius,

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

  progressTrack: {

    position: 'absolute',

    left: 0,

    right: 0,

    bottom: 0,

    height: 3,

    backgroundColor: 'rgba(255, 255, 255, 0.15)',

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

  thumbPlaceholder: {

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: Palette.card,

  },

  cross: {

    fontSize: 18,

    color: 'rgba(201, 147, 58, 0.4)',

  },

  title: {

    ...Typography.cardTitle,

    fontSize: 13,

    lineHeight: 17,

    color: Palette.text,

  },

  subtitle: {

    marginTop: 2,

    fontSize: 10,

    lineHeight: 14,

    letterSpacing: 0.2,

  },

});


