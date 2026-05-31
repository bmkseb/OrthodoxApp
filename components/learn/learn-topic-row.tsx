import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/theme';

type LearnTopicRowProps = {
  title: string;
  readMin?: number;
  levelLabel?: string;
  depth?: number;
  isSectionHeader?: boolean;
  isLast?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  onPress?: () => void;
};

export function LearnTopicRow({
  title,
  readMin,
  levelLabel,
  depth = 0,
  isSectionHeader = false,
  isLast,
  expandable = false,
  expanded = false,
  onPress,
}: LearnTopicRowProps) {
  return (
    <>
      <OrthodoxPressable
        style={[styles.row, depth > 0 && { paddingLeft: 20 + depth * 16 }]}
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : 'text'}
        accessibilityState={{ disabled: !onPress, expanded: expandable ? expanded : undefined }}>
        <View style={styles.dotGlow}>
          <View style={styles.dotCore} />
        </View>
        <View style={styles.copy}>
          <ThemedText
            style={[styles.title, isSectionHeader && styles.titleSection, depth > 0 && styles.titleChild]}
            numberOfLines={2}>
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
        {expandable ? (
          <View style={[styles.expandChevron, expanded && styles.expandChevronOpen]}>
            <Icon name="chevron-right" size={16} color={Palette.gold} />
          </View>
        ) : onPress ? (
          <Text style={styles.chevron}>›</Text>
        ) : null}
      </OrthodoxPressable>
      {!isLast ? <View style={[styles.divider, depth > 0 && { marginLeft: 34 + depth * 16 }]} /> : null}
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
  dotGlow: {
    width: 10,
    height: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 147, 58, 0.16)',
    marginTop: 2,
    shadowColor: Palette.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 4,
    elevation: 2,
  },
  dotCore: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Palette.gold,
  },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: Palette.text,
    letterSpacing: -0.1,
    lineHeight: 19,
  },
  titleSection: {
    fontSize: 15,
    fontWeight: '600',
  },
  titleChild: {
    fontSize: 13.5,
    fontWeight: '400',
    color: 'rgba(244, 236, 216, 0.88)',
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
  expandChevron: {
    transform: [{ rotate: '0deg' }],
  },
  expandChevronOpen: {
    transform: [{ rotate: '90deg' }],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 34,
    marginRight: 16,
    backgroundColor: 'rgba(201, 147, 58, 0.08)',
  },
});
