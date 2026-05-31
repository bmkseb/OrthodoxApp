import { StyleSheet, Text, View } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { Layout, Palette, Spacing } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import type { PrayerLanguage } from '@/lib/prayer';
import type { TranslationKey } from '@/lib/translations';

type PrayerLanguageTabsProps = {
  available: PrayerLanguage[];
  value: PrayerLanguage;
  onChange: (lang: PrayerLanguage) => void;
};

/**
 * Per-book language toggle. Renders only the tabs in `available`; when a book
 * supports a single language there is nothing to switch, so it renders nothing.
 */
export function PrayerLanguageTabs({ available, value, onChange }: PrayerLanguageTabsProps) {
  const { t } = useTranslation();

  if (available.length <= 1) return null;

  return (
    <View style={styles.segmentedRow}>
      {available.map((lang) => {
        const isActive = lang === value;
        return (
          <OrthodoxPressable
            key={lang}
            style={styles.segmentTab}
            onPress={() => onChange(lang)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}>
            <Text style={[styles.segmentLabel, isActive && styles.segmentLabelActive]}>
              {t(`catalog.${lang}` as TranslationKey)}
            </Text>
            {isActive ? <View style={styles.segmentIndicator} /> : null}
          </OrthodoxPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segmentedRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Layout.cardBorder,
  },
  segmentTab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 10,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Palette.muted,
  },
  segmentLabelActive: {
    color: Palette.text,
    fontWeight: '600',
  },
  segmentIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '18%',
    right: '18%',
    height: 2,
    borderRadius: 1,
    backgroundColor: Palette.gold,
  },
});
