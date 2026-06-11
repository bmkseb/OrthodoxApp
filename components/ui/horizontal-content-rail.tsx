import React, { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Layout, Space } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

type HorizontalContentRailProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Recessed horizontal reel — visible bounds on light and dark page backgrounds. */
export function HorizontalContentRail({ children, style }: HorizontalContentRailProps) {
  const { palette, sacred, colorScheme } = useThemeTokens();

  const panelBg =
    colorScheme === 'light' ? sacred.functionalWarm : palette.backgroundDeep;

  return (
    <View
      style={[
        styles.outer,
        {
          backgroundColor: panelBg,
          borderColor: palette.border,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: -Layout.pagePadding,
    paddingVertical: Space.s12,
    paddingHorizontal: Layout.pagePadding,
    borderRadius: Layout.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
