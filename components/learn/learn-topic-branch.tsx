import React, { useCallback, useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, UIManager, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { LearnTopicRow } from '@/components/learn/learn-topic-row';
import type { LearnCollection, LearnTopic } from '@/data/learnLibrary';
import { learnText, levelLabel } from '@/lib/learn-i18n';
import { isLearnSacramentHeader } from '@/lib/learn-sacraments';
import { useTranslation } from '@/hooks/use-translation';
import { Space } from '@/constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type LearnTopicBranchProps = {
  topic: LearnTopic;
  collection: LearnCollection;
  depth?: number;
  isLast?: boolean;
  onTopicPress?: (topic: LearnTopic, collection: LearnCollection) => void;
};

export function LearnTopicBranch({
  topic,
  collection,
  depth = 0,
  isLast = false,
  onTopicPress,
}: LearnTopicBranchProps) {
  const { mode } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const slug = topic.slug ?? topic.id;
  const children = topic.children ?? [];
  const hasContent = (topic.passageCount ?? 1) > 0;
  const hasChildren = children.length > 0;
  const isSectionHeader = isLearnSacramentHeader(slug) || (!hasContent && hasChildren);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((value) => !value);
  }, []);

  const handlePress = useCallback(() => {
    if (hasChildren) {
      toggle();
      return;
    }
    if (hasContent) onTopicPress?.(topic, collection);
  }, [hasChildren, hasContent, onTopicPress, topic, collection, toggle]);

  return (
    <>
      <LearnTopicRow
        title={learnText(topic.titleEn, topic.titleAm, mode)}
        readMin={topic.readMin}
        levelLabel={topic.level ? levelLabel(topic.level, mode) : undefined}
        depth={depth}
        isSectionHeader={isSectionHeader}
        isLast={isLast && !(hasChildren && expanded)}
        expandable={hasChildren}
        expanded={expanded}
        onPress={hasChildren || hasContent ? handlePress : undefined}
      />

      {hasChildren && expanded ? (
        <View style={[styles.nestedPanel, depth > 0 && styles.nestedPanelDeep]}>
          {children.map((child, index) => (
            <LearnTopicBranch
              key={`${child.id}-${depth + 1}`}
              topic={child}
              collection={collection}
              depth={depth + 1}
              isLast={index === children.length - 1}
              onTopicPress={onTopicPress}
            />
          ))}
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  nestedPanel: {
    marginLeft: Space.s8,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(201, 147, 58, 0.1)',
  },
  nestedPanelDeep: {
    marginLeft: Space.s12,
  },
});
