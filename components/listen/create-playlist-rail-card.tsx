import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { LISTEN_RAIL_FRAME } from '@/constants/listen-layout';
import { Palette, Space, Typography } from '@/constants/theme';

const FRAME = LISTEN_RAIL_FRAME;

type CreatePlaylistRailCardProps = {
  title: string;
  onPress: () => void;
};

/** First tile in the playlist rail — compact “+” action matching other rail cards. */
export const CreatePlaylistRailCard = memo(function CreatePlaylistRailCard({
  title,
  onPress,
}: CreatePlaylistRailCardProps) {
  return (
    <OrthodoxPressable
      style={[styles.wrap, { width: FRAME.width, marginRight: FRAME.gap }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}>
      <View
        style={[
          styles.card,
          {
            width: FRAME.width,
            height: FRAME.height,
            borderRadius: FRAME.borderRadius,
          },
        ]}>
        <View style={styles.inner}>
          <Icon name="music" size={22} color={Palette.gold} />
          <ThemedText style={styles.plus}>+</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.title} numberOfLines={2}>
        {title}
      </ThemedText>
    </OrthodoxPressable>
  );
});

const styles = StyleSheet.create({
  wrap: {},
  card: {
    overflow: 'hidden',
    marginBottom: Space.s8,
    backgroundColor: 'rgba(201, 147, 58, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.32)',
    borderStyle: 'dashed',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.s4,
  },
  plus: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.mutedGold,
  },
  title: {
    ...Typography.cardTitle,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
    color: Palette.gold,
  },
});
