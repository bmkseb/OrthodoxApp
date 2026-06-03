import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  getBundledChannelLogoStyle,
  getMezmurChannelArtSource,
  mezmurChannelImageSource,
} from '@/constants/mezmur-channel-art';
import { Layout, Palette } from '@/constants/theme';

type ChannelAvatarImageProps = {
  channelName: string;
  size: number;
  imageUri?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** Circular channel logo — bundled art is zoomed with cover so the ring has no white letterboxing. */
export const ChannelAvatarImage = memo(function ChannelAvatarImage({
  channelName,
  size,
  imageUri,
  style,
}: ChannelAvatarImageProps) {
  const bundled = Boolean(getMezmurChannelArtSource(channelName));
  const source = mezmurChannelImageSource(channelName, imageUri ?? null);
  const logoStyle = bundled ? getBundledChannelLogoStyle(channelName) : null;
  const zoom = logoStyle?.zoom ?? 1;
  const imageSize = Math.round(size * zoom);
  const radius = size / 2;
  const ringBackground =
    channelName === 'Ahadu Studios'
      ? '#0A0A0A'
      : channelName === 'SPOT Church'
        ? '#FFFFFF'
        : channelName === 'ዘኆኅተ ብርሃን ሚዲያ'
          ? '#1E4A8C'
          : Palette.surfaceWarm;

  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: ringBackground,
        },
        style,
      ]}>
      {source ? (
        <Image
          source={source}
          style={{ width: imageSize, height: imageSize }}
          contentFit={logoStyle?.contentFit ?? 'cover'}
          contentPosition={logoStyle?.contentPosition ?? 'center'}
        />
      ) : (
        <ThemedText style={[styles.initial, { fontSize: Math.round(size * 0.3) }]}>
          {channelName.charAt(0)}
        </ThemedText>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  ring: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surfaceWarm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorderThin,
  },
  initial: {
    color: Palette.gold,
    fontWeight: '700',
  },
});
