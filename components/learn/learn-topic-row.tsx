import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

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
  const { palette } = useThemeTokens();

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
          backgroundColor: palette.goldLight,
          marginTop: 2,
          shadowColor: palette.gold,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.55,
          shadowRadius: 4,
          elevation: 2,
        },
        dotCore: {
          width: 5,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: palette.gold,
        },
        copy: { flex: 1, minWidth: 0, gap: 2 },
        title: {
          fontSize: 14,
          fontWeight: '500',
          color: palette.text,
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
          color: palette.muted,
        },
        meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
        metaText: {
          fontSize: 10,
          color: palette.muted,
          letterSpacing: 0.25,
          textTransform: 'uppercase',
        },
        metaDot: { color: palette.muted, fontSize: 10 },
        chevron: {
          color: palette.mutedGold,
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
          backgroundColor: palette.border,
        },
      }),
    [palette]
  );

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
            <Icon name="chevron-right" size={16} color={palette.gold} />
          </View>
        ) : onPress ? (
          <Text style={styles.chevron}>›</Text>
        ) : null}
      </OrthodoxPressable>
      {!isLast ? <View style={[styles.divider, depth > 0 && { marginLeft: 34 + depth * 16 }]} /> : null}
    </>
  );
}
