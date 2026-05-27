import React, { memo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTranslation } from '@/hooks/use-translation';
import { showsTranslatedAccent } from '@/lib/translations';
import type { HeaderKey } from '@/lib/translations';
import { Layout, Palette, Space, Typography } from '@/constants/theme';

type BilingualHeaderVariant = 'page' | 'section' | 'compact';

type BilingualHeaderProps = {
  headerKey: HeaderKey;
  variant?: BilingualHeaderVariant;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
};

const GOLD_ACCENT = 'rgba(201, 147, 58, 0.72)';

const VARIANT_STYLES = {
  page: {
    primary: Typography.pageTitle,
    accent: { fontSize: 20, fontWeight: '500' as const, lineHeight: 28 },
    pipe: { fontSize: 20, lineHeight: 28, fontWeight: '300' as const },
  },
  section: {
    primary: Typography.sectionTitle,
    accent: { fontSize: 16, fontWeight: '500' as const, lineHeight: 22 },
    pipe: { fontSize: 16, lineHeight: 22, fontWeight: '300' as const },
  },
  compact: {
    primary: Typography.cardTitle,
    accent: { fontSize: 14, fontWeight: '500' as const, lineHeight: 18 },
    pipe: { fontSize: 14, lineHeight: 18, fontWeight: '300' as const },
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
  const variantStyles = VARIANT_STYLES[variant];
  // Bilingual accent appears only beside large page/section headers in hybrid mode.
  // Compact variant (used in pills, cards, micro contexts) never shows bilingual text.
  const showInlineTranslation =
    variant !== 'compact' && showsTranslatedAccent(mode) && !!display.accent;

  return (
    <View style={[headerStyles.container, style]}>
      {showInlineTranslation ? (
        <View style={headerStyles.inlineRow}>
          <ThemedText style={[variantStyles.primary, headerStyles.primary]} numberOfLines={1}>
            {display.primary}
          </ThemedText>
          <ThemedText
            style={[variantStyles.accent, headerStyles.accent, ethiopicStyle]}
            numberOfLines={1}>
            {display.accent}
          </ThemedText>
        </View>
      ) : (
        <ThemedText
          style={[
            variantStyles.primary,
            headerStyles.primary,
            mode === 'am' ? ethiopicStyle : undefined,
          ]}
          numberOfLines={variant === 'page' ? 2 : 1}>
          {display.primary}
        </ThemedText>
      )}

      {subtitle ? (
        <ThemedText type="muted" style={headerStyles.subtitle} numberOfLines={2}>
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
});

const headerStyles = StyleSheet.create({
  container: {
    gap: Layout.titleSubtitleGap,
    minWidth: 0,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'nowrap',
    gap: Space.s8,
    minWidth: 0,
    flexShrink: 1,
  },
  accent: {
    color: GOLD_ACCENT,
    flexShrink: 1,
    minWidth: 0,
    opacity: 0.95,
  },
  pipe: {
    color: GOLD_ACCENT,
    flexShrink: 0,
  },
  primary: {
    color: Palette.text,
    flexShrink: 0,
  },
  subtitle: {
    marginTop: Space.s4,
    ...Typography.body,
    color: Palette.muted,
  },
});

export const SacredPageHeader = memo(function SacredPageHeader(props: BilingualHeaderProps) {
  return <BilingualHeader {...props} variant={props.variant ?? 'page'} />;
});

export const SacredSectionHeader = memo(function SacredSectionHeader(props: BilingualHeaderProps) {
  return <BilingualHeader {...props} variant={props.variant ?? 'section'} />;
});
