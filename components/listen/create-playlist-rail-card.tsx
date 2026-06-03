import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { MEZMUR_PLAYLIST_RAIL_FRAME } from '@/constants/mezmur-album-art';
import { Layout, Palette, Space, Typography } from '@/constants/theme';

const CARD_WIDTH = MEZMUR_PLAYLIST_RAIL_FRAME.width;
const THUMB_HEIGHT = MEZMUR_PLAYLIST_RAIL_FRAME.height;

type CreatePlaylistRailCardProps = {
  title: string;
  subtitle?: string;
  onPress: () => void;
};

export const CreatePlaylistRailCard = memo(function CreatePlaylistRailCard({
  title,
  subtitle,
  onPress,
}: CreatePlaylistRailCardProps) {
  return (
    <OrthodoxPressable
      style={styles.wrap}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}>
      <View style={styles.card}>
        <View style={styles.inner}>
          <View style={styles.iconRing}>
            <Icon name="music" size={18} color={Palette.gold} />
          </View>
          <ThemedText style={styles.plus}>+</ThemedText>
        </View>
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
    overflow: 'hidden',
    marginBottom: Space.s8,
    backgroundColor: 'rgba(201, 147, 58, 0.07)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.32)',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  iconRing: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 147, 58, 0.14)',
  },
  plus: {
    fontSize: 18,
    fontWeight: '600',
    color: Palette.mutedGold,
    letterSpacing: 1,
  },
  title: {
    ...Typography.cardTitle,
    fontSize: 13,
    lineHeight: 17,
    color: Palette.gold,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 14,
  },
});
