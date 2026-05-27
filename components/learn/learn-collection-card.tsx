import React, { useCallback, useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, UIManager, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon, type IconName } from '@/components/Icon';
import { LearnTopicRow } from '@/components/learn/learn-topic-row';
import type { LearnCollection, LearnTopic } from '@/data/learnLibrary';
import { learnText, levelLabel } from '@/lib/learn-i18n';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from '@/hooks/use-translation';
import { BorderRadius, Layout, Palette, Space, Typography } from '@/constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type LearnCollectionCardProps = {
  collection: LearnCollection;
  defaultExpanded?: boolean;
  onTopicPress?: (topic: LearnTopic, collection: LearnCollection) => void;
};

export function LearnCollectionCard({
  collection,
  defaultExpanded = false,
  onTopicPress,
}: LearnCollectionCardProps) {
  const { mode, t } = useTranslation();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const title = learnText(collection.titleEn, collection.titleAm, mode);
  const description = learnText(collection.descriptionEn, collection.descriptionAm, mode);
  const topicCount = collection.topics.length;

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  }, []);

  return (
    <View style={styles.wrap}>
      <OrthodoxPressable onPress={toggle} accessibilityRole="button" accessibilityState={{ expanded }}>
        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(53, 48, 40, 0.7)', 'rgba(28, 24, 20, 0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Icon name={collection.icon} size={18} />
            </View>
            <View style={styles.headerCopy}>
              <ThemedText style={styles.title} numberOfLines={2}>
                {title}
              </ThemedText>
              <ThemedText style={styles.description} numberOfLines={2}>
                {description}
              </ThemedText>
              <ThemedText style={styles.count}>
                {t('learn.topicsCount', { count: topicCount })}
              </ThemedText>
            </View>
            <Text style={[styles.chevron, expanded && styles.chevronOpen]}>›</Text>
          </View>
        </View>
      </OrthodoxPressable>

      {expanded ? (
        <View style={styles.topicsPanel}>
          <View style={styles.panelDivider}>
            <Text style={styles.panelCross}>☩</Text>
          </View>
          {collection.topics.map((topic, index) => (
            <LearnTopicRow
              key={topic.id}
              title={learnText(topic.titleEn, topic.titleAm, mode)}
              readMin={topic.readMin}
              levelLabel={topic.level ? levelLabel(topic.level, mode) : undefined}
              isLast={index === collection.topics.length - 1}
              onPress={() => onTopicPress?.(topic, collection)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: Layout.cardGap },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorderThin,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Space.s16,
    gap: Space.s12,
    zIndex: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorderThin,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  headerCopy: { flex: 1, minWidth: 0, gap: Space.s4 },
  title: {
    ...Typography.cardTitle,
    fontSize: 18,
    color: Palette.text,
  },
  description: {
    ...Typography.body,
    fontSize: 13,
    color: Palette.muted,
  },
  count: {
    ...Typography.metadata,
    color: Palette.muted,
    marginTop: Space.s4,
    textTransform: 'none',
    letterSpacing: 0.2,
  },
  chevron: {
    fontSize: 20,
    color: Palette.muted,
    fontWeight: '300',
    marginTop: 4,
    transform: [{ rotate: '0deg' }],
  },
  chevronOpen: {
    transform: [{ rotate: '90deg' }],
  },
  topicsPanel: {
    marginTop: Space.s8,
    marginLeft: Space.s8,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(201, 147, 58, 0.12)',
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(18, 16, 14, 0.65)',
    overflow: 'hidden',
  },
  panelDivider: {
    alignItems: 'center',
    paddingVertical: Space.s8,
  },
  panelCross: {
    fontSize: 9,
    color: 'rgba(201, 147, 58, 0.28)',
  },
});
