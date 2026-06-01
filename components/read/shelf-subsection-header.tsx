import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Palette, Space } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';

type ShelfSubsectionHeaderProps = {
  title: string;
  onSeeAllPress?: () => void;
};

/** Compact shelf label with gold accent — matches Orthodox Catalog (Prayer, Scripture, …). */
export function ShelfSubsectionHeader({ title, onSeeAllPress }: ShelfSubsectionHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.accent} />
        <ThemedText style={styles.title} numberOfLines={1}>
          {title}
        </ThemedText>
      </View>

      {onSeeAllPress ? (
        <TouchableOpacity
          onPress={onSeeAllPress}
          accessibilityRole="button"
          accessibilityLabel={`See all ${title}`}>
          <ThemedText type="seeAll" style={styles.seeAll}>
            {t('common.seeAll')}
          </ThemedText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Space.s8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  accent: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: Palette.gold,
    marginRight: Space.s8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: Palette.text,
    flexShrink: 1,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '500',
  },
});
