import { Image, type ImageProps, type ImageStyle } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, type StyleProp } from 'react-native';

import { Palette } from '@/constants/theme';

type SacredImageProps = {
  uri: string;
  style?: StyleProp<ImageStyle>;
  contentFit?: ImageProps['contentFit'];
  priority?: ImageProps['priority'];
  recyclingKey?: string;
};

/** Non-blocking hero/thumbnail — card-tone fill, disk cache, short fade-in */
export const SacredImage = memo(function SacredImage({
  uri,
  style,
  contentFit = 'cover',
  priority = 'normal',
  recyclingKey,
}: SacredImageProps) {
  return (
    <Image
      source={{ uri }}
      style={[styles.image, style]}
      contentFit={contentFit}
      cachePolicy="memory-disk"
      transition={180}
      priority={priority}
      recyclingKey={recyclingKey ?? uri}
    />
  );
});

const styles = StyleSheet.create({
  image: {
    backgroundColor: Palette.card,
  },
});
