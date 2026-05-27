import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { EXPLORE_QUICK_CHIPS } from '@/constants/explore-content';
import { Rhythm, Space } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslationKey } from '@/lib/translations';

export function ExploreQuickChips() {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {EXPLORE_QUICK_CHIPS.map((chip) => (
        <OrthodoxPressable key={chip.id} style={styles.chip} accessibilityRole="button">
          <Icon name={chip.icon as IconName} size={14} color="rgba(201, 147, 58, 0.85)" />
          <Text style={styles.label}>{t(chip.labelKey as TranslationKey)}</Text>
        </OrthodoxPressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Space.s8,
    paddingVertical: Space.s4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s8,
    paddingHorizontal: Space.s12,
    paddingVertical: Space.s8,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.18)',
    backgroundColor: 'rgba(28, 24, 20, 0.65)',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(248, 240, 221, 0.92)',
    letterSpacing: 0.1,
  },
});
