import { Image } from 'expo-image';

import { memo, useMemo } from 'react';

import { type ImageStyle, type StyleProp } from 'react-native';



import { BorderRadius } from '@/constants/theme';

import { youtubeListThumbnailUrl } from '@/lib/youtube-thumbnail';



/** 16:9 list row — matches Mezmur Debter / playlist album frame proportions. */

export const VIDEO_THUMB_ROW_WIDTH = 56;

export const VIDEO_THUMB_ROW_HEIGHT = Math.round((VIDEO_THUMB_ROW_WIDTH * 9) / 16);

export const VIDEO_THUMB_ROW_GAP = 10;

/** Subtle corners on small row thumbs (md was too pill-like). */
export const VIDEO_THUMB_BORDER_RADIUS = BorderRadius.sm;



/** Options sheet header thumbnail. */

export const VIDEO_THUMB_SHEET_WIDTH = 72;

export const VIDEO_THUMB_SHEET_HEIGHT = Math.round((VIDEO_THUMB_SHEET_WIDTH * 9) / 16);



export function videoThumbHeightForWidth(width: number): number {

  return Math.round((width * 9) / 16);

}



type VideoThumbnailProps = {

  uri: string;

  videoId?: string;

  style?: StyleProp<ImageStyle>;

  width?: number;

  height?: number;

  /** Space before title text. Default 10 in rows; pass 0 in sheet headers. */

  spacing?: number;

  borderRadius?: number;

};



export const VideoThumbnail = memo(function VideoThumbnail({

  uri,

  videoId,

  style,

  width = VIDEO_THUMB_ROW_WIDTH,

  height = VIDEO_THUMB_ROW_HEIGHT,

  spacing = VIDEO_THUMB_ROW_GAP,

  borderRadius = VIDEO_THUMB_BORDER_RADIUS,

}: VideoThumbnailProps) {

  const sourceUri = useMemo(

    () => youtubeListThumbnailUrl(videoId ?? '', uri),

    [uri, videoId]

  );



  return (

    <Image

      source={{ uri: sourceUri }}

      style={[

        {

          width,

          height,

          marginRight: spacing,

          borderRadius,

          overflow: 'hidden',

        },

        style,

      ]}

      contentFit="cover"

    />

  );

});

