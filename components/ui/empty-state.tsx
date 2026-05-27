import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Layout, Palette } from '@/constants/theme';

type EmptyStateProps = {
  title?: string;
  suggestion?: string;
};

export function EmptyState({
  title = 'No results found',
  suggestion = 'Try a different search term',
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.cross}>☩</ThemedText>
      <ThemedText type="default">{title}</ThemedText>
      {suggestion ? <ThemedText type="muted">{suggestion}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.sectionGap,
    gap: Layout.titleSubtitleGap,
    paddingHorizontal: Layout.pagePadding,
  },
  cross: {
    fontSize: 48,
    color: Palette.gold,
    opacity: 0.4,
    marginBottom: 8,
  },
});
