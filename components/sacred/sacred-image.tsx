import { Image, ImageContentFit } from 'expo-image';
import React, { memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { Palette } from '@/constants/theme';

type SacredImageProps = {
  source: string | number;
  style?: ViewStyle;
  contentFit?: ImageContentFit;
  transition?: number;
};

function SacredImageComponent({
  source,
  style,
  contentFit = 'cover',
  transition = 200,
}: SacredImageProps) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.placeholder} />
      <Image
        source={typeof source === 'string' ? { uri: source } : source}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        transition={transition}
        cachePolicy="memory-disk"
      />
    </View>
  );
}

export const SacredImage = memo(SacredImageComponent);

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: Palette.card,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1A1610',
  },
});
