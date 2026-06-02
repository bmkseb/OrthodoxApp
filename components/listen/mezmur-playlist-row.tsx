import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Palette, Spacing } from '@/constants/theme';

type MezmurPlaylistRowProps = {
  title: string;
  songCount: number;
  thumbnailUrl?: string | null;
  onPress: () => void;
};

/** Flat playlist row — matches channel rows in the hymns See All list. */
export const MezmurPlaylistRow = memo(function MezmurPlaylistRow({
  title,
  songCount,
  thumbnailUrl,
  onPress,
}: MezmurPlaylistRowProps) {
  const countLabel = `${songCount} ${songCount === 1 ? 'song' : 'songs'}`;

  return (
    <OrthodoxPressable
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${countLabel}`}>
      {thumbnailUrl ? (
        <Image source={{ uri: thumbnailUrl }} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <Icon name="music" size={20} color={Palette.gold} />
        </View>
      )}
      <View style={styles.rowBody}>
        <ThemedText style={styles.rowTitle} numberOfLines={2}>
          {title}
        </ThemedText>
        <ThemedText type="muted" style={styles.rowMeta}>
          {countLabel}
        </ThemedText>
      </View>
      <Text style={styles.chevron}>›</Text>
    </OrthodoxPressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 2,
    gap: Spacing.sm + 2,
  },
  thumb: {
    width: 112,
    height: 63,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.2)',
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Layout.cardBorder,
  },
  rowBody: { flex: 1, gap: 4 },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.text,
    lineHeight: 22,
  },
  rowMeta: { fontSize: 13, lineHeight: 18 },
  chevron: { color: Palette.mutedGold, fontSize: 22 },
});
