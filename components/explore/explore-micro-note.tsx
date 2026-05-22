import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Spacing } from '@/constants/theme';

type ExploreMicroNoteProps = {
  text: string;
  icon?: IconName;
};

export function ExploreMicroNote({ text, icon = 'scroll' }: ExploreMicroNoteProps) {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={14} />
      <ThemedText type="muted" style={styles.text} numberOfLines={2}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: ManuscriptTokens.fadedGold,
    backgroundColor: 'rgba(30, 26, 20, 0.55)',
    marginBottom: Layout.headerContentGap,
  },
  text: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
