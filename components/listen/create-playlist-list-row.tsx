import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { MEZMUR_ALBUM_LIST_FRAME } from '@/constants/mezmur-album-art';
import { Palette, Spacing } from '@/constants/theme';

type CreatePlaylistListRowProps = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  /** Tighter row for Hymns Catalog See All (matches catalog list density). */
  compact?: boolean;
};

/** Create playlist row for the playlists See All screen. */
export const CreatePlaylistListRow = memo(function CreatePlaylistListRow({
  title,
  subtitle,
  onPress,
  compact = false,
}: CreatePlaylistListRowProps) {
  return (
    <OrthodoxPressable
      style={[styles.row, compact && styles.rowCompact]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}>
      <View style={[styles.thumb, compact && styles.thumbCompact]}>
        {compact ? (
          <Icon name="plus" size={18} color={Palette.gold} />
        ) : (
          <>
            <View style={styles.iconRing}>
              <Icon name="music" size={20} color={Palette.gold} />
            </View>
            <ThemedText style={styles.plus}>+</ThemedText>
          </>
        )}
      </View>
      <View style={styles.copy}>
        <ThemedText style={[styles.title, compact && styles.titleCompact]} numberOfLines={1}>
          {title}
        </ThemedText>
        {subtitle && !compact ? (
          <ThemedText type="muted" style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </OrthodoxPressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    paddingVertical: Spacing.md - 2,
    paddingHorizontal: 2,
    minHeight: 56,
  },
  rowCompact: {
    paddingVertical: Spacing.md - 2,
  },
  thumb: {
    width: MEZMUR_ALBUM_LIST_FRAME.width,
    height: MEZMUR_ALBUM_LIST_FRAME.height,
    borderRadius: MEZMUR_ALBUM_LIST_FRAME.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(201, 147, 58, 0.1)',
  },
  thumbCompact: {
    width: 42,
    height: 42,
    borderRadius: 21,
    gap: 0,
  },
  iconRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 147, 58, 0.14)',
  },
  plus: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.mutedGold,
    letterSpacing: 0.5,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.gold,
    lineHeight: 22,
  },
  titleCompact: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  chevron: {
    color: Palette.mutedGold,
    fontSize: 22,
    marginLeft: 2,
  },
});
