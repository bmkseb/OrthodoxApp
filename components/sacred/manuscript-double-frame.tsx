import React, { useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Layout } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

const FRAME_INSET = 6;
const OUTER_BORDER = 1.5;
const INNER_BORDER = StyleSheet.hairlineWidth * 2;

type ManuscriptDoubleFrameProps = {
  children: React.ReactNode;
  /** Light ivory scripture card vs dark espresso Bible hero. */
  variant?: 'scripture' | 'hero';
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/** Tooled double-rule manuscript frame — sacred scripture & Bible heroes only. */
export function ManuscriptDoubleFrame({
  children,
  variant = 'scripture',
  style,
  contentStyle,
}: ManuscriptDoubleFrameProps) {
  const { sacred } = useThemeTokens();

  const colors = useMemo(() => {
    if (variant === 'hero') {
      return {
        outer: sacred.heroFrameOuter,
        inner: sacred.heroFrameInner,
        background: 'transparent',
      };
    }
    return {
      outer: sacred.scriptureFrameOuter,
      inner: sacred.scriptureFrameInner,
      background: sacred.scriptureIvory,
    };
  }, [sacred, variant]);

  return (
    <View
      style={[
        styles.outer,
        {
          borderColor: colors.outer,
          backgroundColor: colors.background,
        },
        style,
      ]}>
      <View
        style={[
          styles.inner,
          {
            borderColor: colors.inner,
          },
          contentStyle,
        ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: Layout.cardRadius,
    borderWidth: OUTER_BORDER,
    overflow: 'hidden',
  },
  inner: {
    margin: FRAME_INSET,
    borderRadius: Layout.cardRadius - FRAME_INSET,
    borderWidth: INNER_BORDER,
    overflow: 'hidden',
  },
});
