import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { GeometricWatermark } from '@/components/sacred/geometric-watermark';
import { BilingualHeader } from '@/components/ui/bilingual-header';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from '@/hooks/use-translation';
import type { HeaderKey } from '@/lib/translations';
import { Layout, Spacing } from '@/constants/theme';

type SectionHeaderProps = {
  headerKey?: HeaderKey;
  title?: string;
  icon?: IconName;
  onSeeAllPress?: () => void;
};

export function SectionHeader({ headerKey, title, icon, onSeeAllPress }: SectionHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.titleWrap}>
        <View style={styles.titleRow}>
          {icon ? <Icon name={icon} size={18} /> : null}
          {headerKey ? (
            <BilingualHeader headerKey={headerKey} variant="section" />
          ) : (
            <ThemedText style={styles.fallbackTitle}>{title}</ThemedText>
          )}
        </View>
        <GeometricWatermark style={styles.watermark} />
      </View>

      {onSeeAllPress ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`See all ${title ?? headerKey ?? 'section'}`}
          onPress={onSeeAllPress}>
          <ThemedText type="seeAll" style={styles.seeAll}>
            {t('common.seeAll')}
          </ThemedText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.sectionGap,
  },
  titleWrap: {
    position: 'relative',
    flexShrink: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  watermark: {
    position: 'absolute',
    right: -28,
    top: -10,
  },
  seeAll: {
    fontSize: Spacing.sm + 6,
    fontWeight: '500',
  },
});
