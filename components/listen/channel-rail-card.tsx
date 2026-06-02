import { Image } from 'expo-image';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { Layout, Palette, Space, Typography } from '@/constants/theme';

export const CHANNEL_AVATAR_SIZE = 104;
const CARD_WIDTH = 120;

type ChannelRailCardProps = {
  title: string;
  subtitle?: string;
  imageUri?: string | null;
  onPress?: () => void;
};

/** Circular channel avatar for horizontal catalog rails. */
export const ChannelRailCard = memo(function ChannelRailCard({
  title,
  subtitle,
  imageUri,
  onPress,
}: ChannelRailCardProps) {
  return (
    <OrthodoxPressable
      style={styles.wrap}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}>
      <View style={styles.avatarRing}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <ThemedText style={styles.avatarInitial}>{title.charAt(0)}</ThemedText>
          </View>
        )}
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
    alignItems: 'center',
  },
  avatarRing: {
    width: CHANNEL_AVATAR_SIZE,
    height: CHANNEL_AVATAR_SIZE,
    borderRadius: CHANNEL_AVATAR_SIZE / 2,
    overflow: 'hidden',
    marginBottom: Space.s8,
    backgroundColor: Palette.surfaceWarm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorderThin,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.card,
  },
  avatarInitial: {
    color: Palette.gold,
    fontSize: 32,
    fontWeight: '700',
  },
  title: {
    ...Typography.cardTitle,
    fontSize: 13,
    lineHeight: 17,
    textAlign: 'center',
    color: Palette.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
