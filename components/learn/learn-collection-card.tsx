import React, { useCallback, useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, UIManager, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { LearnTopicRow } from '@/components/learn/learn-topic-row';
import type { LearnCollection, LearnTopic } from '@/data/learnLibrary';
import { learnText, levelLabel } from '@/lib/learn-i18n';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from '@/hooks/use-translation';
import { BorderRadius, Palette, Space } from '@/constants/theme';

const MUTED_GOLD = '#8A8070';
const COLLAPSED_HEIGHT = 80;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TopicRowEntry = {
  topic: LearnTopic;
  depth: number;
  isLast: boolean;
};

/** Flatten nested topics into render rows while preserving depth for indentation. */
function flattenTopics(topics: LearnTopic[], depth = 0): TopicRowEntry[] {
  const rows: TopicRowEntry[] = [];
  topics.forEach((topic, index) => {
    const children = topic.children ?? [];
    rows.push({ topic, depth, isLast: index === topics.length - 1 && children.length === 0 });
    if (children.length > 0) {
      rows.push(...flattenTopics(children, depth + 1));
    }
  });
  return rows;
}

function countLessons(topics: LearnTopic[]): number {
  return topics.reduce((total, topic) => {
    const hasExplicitCount = topic.passageCount !== undefined;
    if (!hasExplicitCount || (topic.passageCount ?? 0) > 0) total += 1;
    return total + countLessons(topic.children ?? []);
  }, 0);
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
  const topicRows = flattenTopics(collection.topics);
  const topicCount = countLessons(collection.topics);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  }, []);

  return (
    <View style={styles.wrap}>
      <OrthodoxPressable onPress={toggle} accessibilityRole="button" accessibilityState={{ expanded }}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Icon name={collection.icon} size={20} color={Palette.gold} />
          </View>
          <View style={styles.headerCopy}>
            <ThemedText style={styles.title} numberOfLines={1}>
              {title}
            </ThemedText>
            <ThemedText style={styles.description} numberOfLines={1}>
              {description}
            </ThemedText>
          </View>
          <View style={styles.trailing}>
            <View style={[styles.chevronWrap, expanded && styles.chevronOpen]}>
              <Icon name="chevron-right" size={18} color={Palette.gold} />
            </View>
            <Text style={styles.count} numberOfLines={1} allowFontScaling={false}>
              {t('learn.topicsCount', { count: topicCount })}
            </Text>
          </View>
        </View>
      </OrthodoxPressable>

      {expanded ? (
        <View style={styles.topicsPanel}>
          <View style={styles.panelDivider}>
            <Text style={styles.panelCross}>☩</Text>
          </View>
          {topicRows.map(({ topic, depth, isLast }, index) => {
            const hasContent = (topic.passageCount ?? 1) > 0;
            const isSectionHeader = !hasContent && (topic.children?.length ?? 0) > 0;
            return (
              <LearnTopicRow
                key={`${topic.id}-${depth}`}
                title={learnText(topic.titleEn, topic.titleAm, mode)}
                readMin={topic.readMin}
                levelLabel={topic.level ? levelLabel(topic.level, mode) : undefined}
                depth={depth}
                isSectionHeader={isSectionHeader}
                isLast={index === topicRows.length - 1}
                onPress={
                  hasContent
                    ? () => onTopicPress?.(topic, collection)
                    : undefined
                }
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  card: {
    height: COLLAPSED_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.18)',
    backgroundColor: 'rgba(28, 24, 20, 0.85)',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(201, 147, 58, 0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.text,
    letterSpacing: -0.15,
    lineHeight: 20,
  },
  description: {
    fontSize: 13,
    color: MUTED_GOLD,
    lineHeight: 17,
  },
  trailing: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    minWidth: 56,
  },
  chevronWrap: {
    transform: [{ rotate: '0deg' }],
  },
  chevronOpen: {
    transform: [{ rotate: '90deg' }],
  },
  count: {
    fontSize: 11,
    fontWeight: '500',
    color: MUTED_GOLD,
    letterSpacing: 0.2,
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
