import { memo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { Layout, Palette, Space } from '@/constants/theme';

const { width } = Dimensions.get('window');
const GAP = Space.s12;

export type Category = {
  id: string;
  label: string;
  icon: IconName;
  onPress?: () => void;
};

export const CategoryGrid = memo(function CategoryGrid({
  items,
  columns = 4,
}: {
  items: Category[];
  columns?: number;
}) {
  const contentWidth = width - Layout.pagePadding * 2;
  const tileWidth = (contentWidth - GAP * (columns - 1)) / columns;

  return (
    <View style={styles.grid}>
      {items.map((c) => (
        <OrthodoxPressable
          key={c.id}
          onPress={c.onPress}
          accessibilityRole="button"
          accessibilityLabel={c.label}
          style={{ width: tileWidth }}>
          <View style={styles.badge}>
            <Icon name={c.icon} size={24} color={Palette.gold} />
          </View>
          <ThemedText style={styles.label} numberOfLines={2}>
            {c.label}
          </ThemedText>
        </OrthodoxPressable>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  badge: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.28)',
  },
  label: {
    marginTop: Space.s8,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: Palette.text,
    lineHeight: 15,
  },
});
