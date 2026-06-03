import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChannelAvatarImage } from '@/components/listen/channel-avatar-image';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { LISTEN_CHANNEL_RAIL } from '@/constants/listen-layout';
import { Palette, Space, Typography } from '@/constants/theme';

/** @deprecated Use LISTEN_CHANNEL_RAIL.avatarSize */
export const CHANNEL_AVATAR_SIZE = LISTEN_CHANNEL_RAIL.avatarSize;

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
      style={[styles.wrap, { width: LISTEN_CHANNEL_RAIL.cardWidth }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}>
      <ChannelAvatarImage
        channelName={title}
        size={LISTEN_CHANNEL_RAIL.avatarSize}
        imageUri={imageUri}
        style={styles.avatar}
      />
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
    alignItems: 'center',
  },
  avatar: {
    marginBottom: Space.s8,
  },
  title: {
    ...Typography.cardTitle,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
    textAlign: 'center',
    color: Palette.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    letterSpacing: 0.15,
  },
});
