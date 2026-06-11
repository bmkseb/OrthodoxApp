import React, { useCallback, useMemo, useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, UIManager, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { LearnTopicBranch } from '@/components/learn/learn-topic-branch';
import type { LearnCollection, LearnTopic } from '@/data/learnLibrary';
import { learnText } from '@/lib/learn-i18n';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from '@/hooks/use-translation';
import { useThemeTokens } from '@/hooks/use-theme-tokens';
import { GlossyCardGradientFill } from '@/components/ui/glossy-card-gradient-fill';
import { BorderRadius, Space, getGlossyCardBackground } from '@/constants/theme';

const COLLAPSED_HEIGHT = 80;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
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
  const { palette, sacred, colorScheme } = useThemeTokens();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const title = learnText(collection.titleEn, collection.titleAm, mode);
  const description = learnText(collection.descriptionEn, collection.descriptionAm, mode);
  const topicCount = countLessons(collection.topics);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          borderRadius: BorderRadius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: palette.border,
          backgroundColor: 'transparent',
          overflow: 'hidden',
        },
        card: {
          height: COLLAPSED_HEIGHT,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: Space.s12,
          gap: 14,
          zIndex: 1,
        },
        iconWrap: {
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: sacred.medallionFill,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: sacred.medallionRing,
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
          color: palette.text,
          letterSpacing: -0.15,
          lineHeight: 20,
        },
        description: {
          fontSize: 13,
          color: palette.muted,
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
          color: palette.muted,
          letterSpacing: 0.2,
        },
        topicsPanel: {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: palette.border,
          backgroundColor: getGlossyCardBackground(palette, colorScheme, 'deep'),
          overflow: 'hidden',
          zIndex: 1,
        },
        panelDivider: {
          alignItems: 'center',
          paddingVertical: Space.s8,
        },
        panelCross: {
          fontSize: 9,
          color: palette.gold,
          opacity: 0.35,
        },
      }),
    [colorScheme, palette, sacred]
  );

  return (
    <View style={styles.wrap}>
      <GlossyCardGradientFill />
      <OrthodoxPressable onPress={toggle} accessibilityRole="button" accessibilityState={{ expanded }}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Icon name={collection.icon} size={20} color={palette.gold} />
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
              <Icon name="chevron-right" size={18} color={palette.gold} />
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
          {collection.topics.map((topic, index) => (
            <LearnTopicBranch
              key={topic.id}
              topic={topic}
              collection={collection}
              isLast={index === collection.topics.length - 1}
              onTopicPress={onTopicPress}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
