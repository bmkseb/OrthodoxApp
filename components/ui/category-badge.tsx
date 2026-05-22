import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { BorderRadius, Layout, Palette } from '@/constants/theme';

type CategoryBadgeProps = ViewProps;

export function CategoryBadge({ style, ...props }: CategoryBadgeProps) {
  return (
    <View style={[styles.badge, style]} {...props}>
      <Text style={styles.cross}>†</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: Layout.badgeSize,
    height: Layout.badgeSize,
    borderRadius: BorderRadius.sm / 2,
    backgroundColor: Palette.crimson,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cross: {
    color: Palette.gold,
    fontSize: 8,
    lineHeight: 9,
  },
});
