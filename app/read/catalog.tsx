import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { BorderRadius, Layout, Palette, Spacing } from '@/constants/theme';

const ITEMS = [
  {
    id: 'horologium',
    title: "Matshafa Se'atat",
    subtitle: 'Book of Hours · 7 Canonical Prayers',
    geez: 'መጽሐፈ ሰዓታት',
    route: '/horologium',
  },
  {
    id: 'bible',
    title: 'Holy Bible',
    subtitle: '81 Books · EOTC Canon',
    geez: 'መጽሐፍ ቅዱስ',
    route: '/catalog',
  },
];

export default function CatalogScreen() {
  return (
    <ScreenScrollView>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button">
          <ThemedText type="seeAll">← Back</ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedText style={styles.pageTitle}>Orthodox Catalog</ThemedText>
      <ThemedText style={styles.pageGeez}>ዝርዝረ መጻሕፍት</ThemedText>
      <ThemedText type="muted" style={styles.description}>
        The sacred texts of the Ethiopian Orthodox Tewahedo Church.
      </ThemedText>

      {ITEMS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.row}
          onPress={() => router.push(item.route)}
          accessibilityRole="button">
          <View style={styles.rowText}>
            <ThemedText style={styles.rowGeez}>{item.geez}</ThemedText>
            <ThemedText style={styles.rowTitle}>{item.title}</ThemedText>
            <ThemedText type="muted" style={styles.rowSubtitle}>{item.subtitle}</ThemedText>
          </View>
          <ThemedText style={styles.arrow}>›</ThemedText>
        </TouchableOpacity>
      ))}
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
    marginBottom: 4,
  },
  pageGeez: {
    fontSize: 18,
    color: Palette.gold,
    marginBottom: Spacing.sm,
  },
  description: {
    marginBottom: Layout.sectionGap,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Layout.cardBorder,
    backgroundColor: Palette.card,
  },
  rowText: {
    flex: 1,
  },
  rowGeez: {
    fontSize: 14,
    color: Palette.gold,
    marginBottom: 2,
  },
  rowTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 13,
  },
  arrow: {
    fontSize: 24,
    color: Palette.gold,
    marginLeft: Spacing.sm,
  },
});
