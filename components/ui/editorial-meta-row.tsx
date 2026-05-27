import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Spacing } from '@/constants/theme';

type EditorialMetaRowProps = {
  labels: string[];
};

/** Liturgical metadata capsules — small, restrained, grid-aligned. */
export function EditorialMetaRow({ labels }: EditorialMetaRowProps) {
  return (
    <View style={styles.row}>
      {labels.map((label) => (
        <View key={label} style={styles.pill}>
          <ThemedText style={styles.text} numberOfLines={1}>
            {label}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs + 2,
    marginBottom: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs - 1,
    borderRadius: BorderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.14)',
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
  },
  text: {
    fontSize: 9,
    fontWeight: '500',
    color: 'rgba(201, 147, 58, 0.72)',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
