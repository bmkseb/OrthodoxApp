import React, { memo, useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeTokens } from '@/hooks/use-theme-tokens';
import { useTranslation } from '@/hooks/use-translation';
import { showsTranslatedAccent } from '@/lib/translations';
import type { HeaderKey } from '@/lib/translations';
import { getCeremonialSectionHeaderStyle, Layout, Space, Typography } from '@/constants/theme';

type BilingualHeaderVariant = 'page' | 'section' | 'compact';

type BilingualHeaderProps = {
  headerKey: HeaderKey;
  variant?: BilingualHeaderVariant;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
};

export const BilingualHeader = memo(function BilingualHeader({
  headerKey,
  variant = 'page',
  subtitle,
  style,
}: BilingualHeaderProps) {
  const { header, ethiopicStyle, mode } = useTranslation();
  const { palette } = useThemeTokens();
  const display = header(headerKey);
  const ceremonial = useMemo(
    () => getCeremonialSectionHeaderStyle(palette.text),
    [palette.text]
  );

  const variantStyles = useMemo(() => {
    if (variant === 'section') {
      const accentSize = 15;
      return {
        primary: ceremonial,
        accent: {
          ...ceremonial,
          fontSize: accentSize,
          lineHeight: 20,
          letterSpacing: accentSize * 0.025,
          opacity: 0.88,
        },
        pipe: ceremonial,
      };
    }

    return {
      page: {
        primary: Typography.pageTitle,
        accent: { fontSize: 20, fontWeight: '500' as const, lineHeight: 28 },
        pipe: { fontSize: 20, lineHeight: 28, fontWeight: '300' as const },
      },
      compact: {
        primary: Typography.cardTitle,
        accent: { fontSize: 14, fontWeight: '500' as const, lineHeight: 18 },
        pipe: { fontSize: 14, lineHeight: 18, fontWeight: '300' as const },
      },
    }[variant === 'compact' ? 'compact' : 'page'];
  }, [variant, ceremonial]);

  const showInlineTranslation =
    variant !== 'compact' && showsTranslatedAccent(mode) && !!display.accent;

  return (
    <View style={[headerStyles.container, style]}>
      {showInlineTranslation ? (
        <View style={headerStyles.inlineRow}>
          <ThemedText
            style={[
              variantStyles.primary,
              headerStyles.primary,
              variant === 'section' ? headerStyles.sectionPrimary : undefined,
            ]}
            numberOfLines={1}>
            {display.primary}
          </ThemedText>
          <ThemedText
            style={[
              variantStyles.accent,
              variant === 'section' ? headerStyles.sectionAccent : { color: palette.gold },
              ethiopicStyle,
            ]}
            numberOfLines={1}>
            {display.accent}
          </ThemedText>
        </View>
      ) : (
        <ThemedText
          style={[
            variantStyles.primary,
            headerStyles.primary,
            variant === 'section' ? headerStyles.sectionPrimary : undefined,
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
  sectionAccent: {
    flexShrink: 1,
    minWidth: 0,
  },
  sectionPrimary: {
    flexShrink: 0,
  },
  primary: {
    flexShrink: 0,
  },
  subtitle: {
    marginTop: Space.s4,
    ...Typography.body,
  },
});

export const SacredPageHeader = memo(function SacredPageHeader(props: BilingualHeaderProps) {
  return <BilingualHeader {...props} variant={props.variant ?? 'page'} />;
});

export const SacredSectionHeader = memo(function SacredSectionHeader(props: BilingualHeaderProps) {
  return <BilingualHeader {...props} variant={props.variant ?? 'section'} />;
});
