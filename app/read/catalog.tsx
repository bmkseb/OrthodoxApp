import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { BorderRadius, Layout, Palette, Spacing } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';

const ITEMS: {
  id: string;
  title: string;
  subtitle: string;
  geez: string;
  route: Href;
}[] = [
  {
    id: 'bible',
    title: 'Holy Bible',
    subtitle: '81 Books · EOTC Canon',
    geez: 'መጽሐፍ ቅዱስ',
    route: '/catalog',
  },
  {
    id: 'daily-prayer',
    title: 'Daily Prayer',
    subtitle: 'YeZewitir Tselot · Everyday Prayers',
    geez: 'የዘወትር ጸሎት',
    route: '/prayer/daily-prayer' as Href,
  },
  {
    id: 'horologium',
    title: "Matshafa Se'atat",
    subtitle: 'Book of Hours · 7 Canonical Prayers',
    geez: 'መጽሐፈ ሰዓታት',
    route: '/horologium',
  },
  {
    id: 'liturgy',
    title: 'The Liturgy',
    subtitle: 'Kidase · The Divine Liturgy',
    geez: 'ቅዳሴ',
    route: '/catalog',
  },
] as const;

export default function CatalogScreen() {
  const { t, mode } = useTranslation();

  return (
    <ScreenScrollView includeFloatingChrome={false}>
      <OrthodoxPressable
        style={styles.topBar}
        onPress={() => {
          if (router.canGoBack()) router.back();
          else router.push('/(tabs)/read');
        }}
        accessibilityRole="button"
        accessibilityLabel={t('settings.back')}>
        <ThemedText type="seeAll">← {t('settings.back')}</ThemedText>
      </OrthodoxPressable>

      <ThemedText style={styles.pageTitle}>Orthodox Catalog</ThemedText>
      {mode !== 'en' ? (
        <ThemedText style={styles.pageGeez}>ዝርዝረ መጻሕፍት</ThemedText>
      ) : null}
      <ThemedText type="muted" style={styles.description}>
        The sacred texts of the Ethiopian Orthodox Tewahedo Church.
      </ThemedText>

      {ITEMS.map((item) => (
        <OrthodoxPressable
          key={item.id}
          style={styles.row}
          onPress={() => router.push(item.route)}
          accessibilityRole="button">
          <View style={styles.rowText}>
            {mode !== 'en' ? (
              <ThemedText style={styles.rowGeez}>{item.geez}</ThemedText>
            ) : null}
            <ThemedText style={styles.rowTitle}>{item.title}</ThemedText>
            <ThemedText type="muted" style={styles.rowSubtitle}>{item.subtitle}</ThemedText>
          </View>
          <ThemedText style={styles.arrow}>›</ThemedText>
        </OrthodoxPressable>
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
