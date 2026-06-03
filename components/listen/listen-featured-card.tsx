import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { LISTEN_FEATURED_HEIGHT } from '@/constants/listen-layout';
import { BorderRadius, Opacity, Palette, Space } from '@/constants/theme';

type ListenFeaturedCardProps = {
  title: string;
  subtitle: string;
  imageUri?: string;
  height?: number;
  onPress?: () => void;
  style?: { width?: number };
};

/** Streaming-style hero card for the Listen tab featured carousel. */
export const ListenFeaturedCard = memo(function ListenFeaturedCard({
  title,
  subtitle,
  imageUri,
  height = LISTEN_FEATURED_HEIGHT,
  onPress,
  style,
}: ListenFeaturedCardProps) {
  const card = (
    <View style={[styles.card, { height }, style?.width != null && { width: style.width }]}>
      <Image source={{ uri: imageUri }} style={styles.artwork} contentFit="cover" cachePolicy="memory-disk" />
      <LinearGradient
        colors={['rgba(12, 10, 8, 0.05)', 'rgba(12, 10, 8, 0.45)', 'rgba(0, 0, 0, 0.88)']}
        locations={[0.2, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.bottom}>
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        <View style={styles.playBtn} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Icon name="play" size={22} color={Palette.background} />
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <OrthodoxPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
        {card}
      </OrthodoxPressable>
    );
  }

  return card;
});

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `rgba(201, 147, 58, ${Opacity.goldBorder})`,
    backgroundColor: Palette.surfaceWarm,
  },
  artwork: {
    ...StyleSheet.absoluteFillObject,
  },
  bottom: {
    position: 'absolute',
    left: Space.s16,
    right: Space.s16,
    bottom: Space.s16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Space.s12,
    zIndex: 2,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: Space.s4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.35,
    lineHeight: 28,
    color: Palette.text,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 19,
    color: 'rgba(245, 236, 215, 0.78)',
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.gold,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
});
