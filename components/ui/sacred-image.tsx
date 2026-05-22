import React, { memo } from 'react';
import { Image, type ImageSource } from 'expo-image';
import { StyleSheet, type ImageStyle, type StyleProp } from 'react-native';

type SacredImageProps = {
  source: ImageSource;
  style?: StyleProp<ImageStyle>;
  contentFit?: 'cover' | 'contain' | 'fill';
  transition?: number;
};

export const SacredImage = memo(function SacredImage({
  source,
  style,
  contentFit = 'cover',
  transition = 300,
}: SacredImageProps) {
  return (
    <Image
      source={source}
      style={[styles.image, style]}
      contentFit={contentFit}
      transition={transition}
    />
  );
});

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});
