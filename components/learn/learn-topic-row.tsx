import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { Layout, Palette } from '@/constants/theme';

type LearnTopicRowProps = {
  title: string;
  readMin?: number;
  levelLabel?: string;
  isLast?: boolean;
  onPress?: () => void;
};

export function LearnTopicRow({ title, readMin, levelLabel, isLast, onPress }: LearnTopicRowProps) {
  return (
    <>
      <OrthodoxPressable style={styles.row} onPress={onPress} accessibilityRole="button">
        <View style={styles.dot} />
        <View style={styles.copy}>
          <ThemedText style={styles.title} numberOfLines={2}>
            {title}
          </ThemedText>
          {readMin || levelLabel ? (
            <View style={styles.meta}>
              {readMin ? <ThemedText style={styles.metaText}>{readMin} min</ThemedText> : null}
              {readMin && levelLabel ? <Text style={styles.metaDot}>·</Text> : null}
              {levelLabel ? <ThemedText style={styles.metaText}>{levelLabel}</ThemedText> : null}
            </View>
          ) : null}
        </View>
        <Text style={styles.chevron}>›</Text>
      </OrthodoxPressable>
      {!isLast ? <View style={styles.divider} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 12,
    paddingLeft: 20,
    gap: 10,
    minHeight: 48,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(201, 147, 58, 0.45)',
    marginTop: 2,
  },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: Palette.text,
    letterSpacing: -0.1,
    lineHeight: 19,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: {
    fontSize: 10,
    color: Palette.muted,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
  },
  metaDot: { color: Palette.muted, fontSize: 10 },
  chevron: {
    color: 'rgba(201, 147, 58, 0.4)',
    fontSize: 15,
    fontWeight: '300',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 34,
    marginRight: 16,
    backgroundColor: 'rgba(201, 147, 58, 0.08)',
  },
});
