import React, { memo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTranslation } from '@/hooks/use-translation';
import type { HeaderKey } from '@/lib/translations';
import { Layout, Palette } from '@/constants/theme';

type BilingualHeaderVariant = 'page' | 'section' | 'compact';

type BilingualHeaderProps = {
  headerKey: HeaderKey;
  variant?: BilingualHeaderVariant;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
};

const VARIANT_STYLES = {
  page: {
    accent: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26 },
    primary: { fontSize: 30, fontWeight: '700' as const, lineHeight: 36 },
    dividerWidth: 28,
  },
  section: {
    accent: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
    primary: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
    dividerWidth: 22,
  },
  compact: {
    accent: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
    primary: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
    dividerWidth: 18,
  },
};

export const BilingualHeader = memo(function BilingualHeader({
  headerKey,
  variant = 'page',
  subtitle,
  style,
}: BilingualHeaderProps) {
  const { header, ethiopicStyle, mode } = useTranslation();
  const display = header(headerKey);
  const styles = VARIANT_STYLES[variant];
  const showAccent = mode !== 'am' && display.accent;

  return (
    <View style={[headerStyles.container, style]}>
      {showAccent ? (
        <>
          <ThemedText
            style={[
              styles.accent,
              { color: `rgba(201, 147, 58, 0.75)` },
              ethiopicStyle,
            ]}>
            {display.accent}
          </ThemedText>
          <View style={[headerStyles.divider, { width: styles.dividerWidth }]} />
        </>
      ) : null}
      <ThemedText style={[styles.primary, headerStyles.primary]}>
        {display.primary}
      </ThemedText>
      {subtitle ? (
        <ThemedText type="muted" style={headerStyles.subtitle}>
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
});

const headerStyles = StyleSheet.create({
  container: {
    gap: Layout.titleSubtitleGap,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(201, 147, 58, 0.22)',
    marginVertical: 2,
  },
  primary: {
    color: Palette.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 2,
  },
});
