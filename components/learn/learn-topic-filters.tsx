import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { Palette } from '@/constants/theme';

export const LEARN_TOPIC_FILTERS = [
  'Trinity',
  'Eucharist',
  'Myron',
  'Holy Unction',
  'Mary',
  'Cross',
  'Fasting',
] as const;
export type LearnTopicFilter = (typeof LEARN_TOPIC_FILTERS)[number];

type LearnTopicFiltersProps = {
  activeFilter: LearnTopicFilter | null;
  onChange: (filter: LearnTopicFilter | null) => void;
};

const MUTED_GOLD = '#8A8070';

export function LearnTopicFilters({ activeFilter, onChange }: LearnTopicFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {LEARN_TOPIC_FILTERS.map((filter) => {
        const isActive = filter === activeFilter;
        return (
          <OrthodoxPressable
            key={filter}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(isActive ? null : filter)}
            style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}>
            <Text
              style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}
              numberOfLines={1}
              allowFontScaling={false}>
              {filter}
            </Text>
          </OrthodoxPressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 16,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillInactive: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(201, 147, 58, 0.3)',
  },
  pillActive: {
    backgroundColor: Palette.gold,
    borderColor: Palette.gold,
  },
  label: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  labelInactive: {
    color: MUTED_GOLD,
    fontWeight: '500',
  },
  labelActive: {
    color: '#000000',
    fontWeight: '600',
  },
});
