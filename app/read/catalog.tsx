import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SectionHeader } from '@/components/ui/section-header';
import { ThemedText } from '@/components/themed-text';
import { Layout, Palette, Spacing } from '@/constants/theme';

export default function CatalogScreen() {
  return (
    <ScreenScrollView>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button">
          <ThemedText type="seeAll">← Back</ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedText style={styles.pageTitle}>Orthodox Catalog 📚</ThemedText>
      <ThemedText type="muted" style={styles.description}>
        Browse the full collection of Orthodox texts, liturgical books, and sacred writings.
      </ThemedText>

      <SectionHeader title="All Books ☩" />
      <ThemedText type="muted">Catalog content coming soon...</ThemedText>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    marginBottom: Spacing.md,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
    marginBottom: Spacing.sm,
  },
  description: {
    marginBottom: Layout.sectionGap,
    lineHeight: 22,
  },
});
