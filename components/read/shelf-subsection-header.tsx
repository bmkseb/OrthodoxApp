import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getMiniSectionHeaderStyle, Space } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';
import { useTranslation } from '@/hooks/use-translation';

type ShelfSubsectionHeaderProps = {
  title: string;
  onSeeAllPress?: () => void;
};

/** Compact shelf label — ceremonial serif mini-header (Prayer, Scripture, …). */
export function ShelfSubsectionHeader({ title, onSeeAllPress }: ShelfSubsectionHeaderProps) {
  const { t } = useTranslation();
  const { palette } = useThemeTokens();

  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={[styles.accent, { backgroundColor: palette.gold }]} />
        <Text style={getMiniSectionHeaderStyle(palette.text)} numberOfLines={1}>
          {title}
        </Text>
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
    marginRight: Space.s8,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '500',
  },
});
