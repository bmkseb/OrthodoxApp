import React, { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { getManuscriptEdgeTokens } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

const SPINE_WIDTH = 3;

type ManuscriptEdgeFrameProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/** Square manuscript rubric — 3px gold spine, hairline on the other three sides. */
export function ManuscriptEdgeFrame({ children, style, contentStyle }: ManuscriptEdgeFrameProps) {
  const { colorScheme } = useThemeTokens();
  const edge = getManuscriptEdgeTokens(colorScheme);

  return (
    <View
      style={[
        styles.frame,
        {
          backgroundColor: edge.background,
          borderLeftColor: edge.spineGold,
          borderTopColor: edge.hairline,
          borderRightColor: edge.hairline,
          borderBottomColor: edge.hairline,
        },
        style,
      ]}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: 'stretch',
    borderRadius: 0,
    borderLeftWidth: SPINE_WIDTH,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
});
