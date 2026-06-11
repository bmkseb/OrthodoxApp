import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Space } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';
import type { PrayerLanguage } from '@/lib/prayer';

type PrayerSectionNavBarProps = {
  slug: string;
  /** 1-based section number. */
  section: number;
  total: number;
  lang: PrayerLanguage;
};

/** Previous / next prayer-section navigation, mirroring the scripture chapter bar. */
export function PrayerSectionNavBar({ slug, section, total, lang }: PrayerSectionNavBarProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useThemeTokens();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        bar: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: Space.s8,
          paddingTop: Space.s12,
          paddingHorizontal: Layout.pagePadding,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: palette.cardBorder,
          backgroundColor: palette.background,
        },
        navBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingVertical: Space.s8,
          paddingHorizontal: Space.s8,
          borderRadius: BorderRadius.md,
          maxWidth: '40%',
        },
        navBtnNext: {
          justifyContent: 'flex-end',
        },
        navBtnDisabled: {
          opacity: 0.45,
        },
        navLabel: {
          fontSize: 13,
          fontWeight: '600',
        },
        center: {
          fontSize: 12,
          textAlign: 'center',
          flexShrink: 0,
        },
      }),
    [palette]
  );

  if (total === 0) return null;

  const prev = section > 1 ? section - 1 : null;
  const next = section < total ? section + 1 : null;

  const goTo = (n: number) => {
    router.replace(`/prayer/${slug}/${n}?lang=${lang}` as never);
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, Space.s12) }]}>
      <OrthodoxPressable
        style={[styles.navBtn, !prev && styles.navBtnDisabled]}
        onPress={() => prev != null && goTo(prev)}
        disabled={prev == null}
        accessibilityLabel="Previous prayer">
        <Icon name="chevron-left" size={18} color={prev ? palette.gold : palette.muted} />
        <ThemedText type={prev ? 'default' : 'muted'} style={styles.navLabel}>
          Previous
        </ThemedText>
      </OrthodoxPressable>

      <ThemedText type="muted" style={styles.center}>
        {section}
        {total > 1 ? ` / ${total}` : ''}
      </ThemedText>

      <OrthodoxPressable
        style={[styles.navBtn, styles.navBtnNext, !next && styles.navBtnDisabled]}
        onPress={() => next != null && goTo(next)}
        disabled={next == null}
        accessibilityLabel="Next prayer">
        <ThemedText type={next ? 'default' : 'muted'} style={styles.navLabel}>
          Next
        </ThemedText>
        <Icon name="chevron-right" size={18} color={next ? palette.gold : palette.muted} />
      </OrthodoxPressable>
    </View>
  );
}
