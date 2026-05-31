import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Palette, Space } from '@/constants/theme';
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
        <Icon name="chevron-left" size={18} color={prev ? Palette.gold : Palette.muted} />
        <ThemedText style={[styles.navLabel, !prev && styles.navLabelDisabled]}>Previous</ThemedText>
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
        <ThemedText style={[styles.navLabel, !next && styles.navLabelDisabled]}>Next</ThemedText>
        <Icon name="chevron-right" size={18} color={next ? Palette.gold : Palette.muted} />
      </OrthodoxPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.s8,
    paddingTop: Space.s12,
    paddingHorizontal: Layout.pagePadding,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Layout.cardBorder,
    backgroundColor: Palette.background,
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
    color: Palette.text,
  },
  navLabelDisabled: {
    color: Palette.muted,
  },
  center: {
    fontSize: 12,
    textAlign: 'center',
    flexShrink: 0,
  },
});
