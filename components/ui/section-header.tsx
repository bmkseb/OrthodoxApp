import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { SacredSectionHeader } from '@/components/ui/bilingual-header';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from '@/hooks/use-translation';
import type { HeaderKey } from '@/lib/translations';
import { Layout, Space, Typography } from '@/constants/theme';

const SECTION_ICON_SIZE = 17;

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
      <View style={styles.titleRow}>
        {icon ? (
          <View style={styles.iconRail}>
            <Icon name={icon} size={SECTION_ICON_SIZE} />
          </View>
        ) : null}
        <View style={styles.labelRail}>
          {headerKey ? (
            <SacredSectionHeader headerKey={headerKey} style={styles.header} />
          ) : (
            <ThemedText style={styles.fallbackTitle} numberOfLines={1}>
              {title}
            </ThemedText>
          )}
        </View>
      </View>

      {onSeeAllPress ? (
        <TouchableOpacity
          style={styles.seeAllWrap}
          accessibilityRole="button"
          accessibilityLabel={`See all ${title ?? headerKey ?? 'section'}`}
          onPress={onSeeAllPress}>
          <ThemedText type="seeAll" style={styles.seeAll} numberOfLines={1}>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Layout.sectionHeaderBottom,
    gap: Space.s8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  iconRail: {
    width: Layout.iconRailWidth,
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexShrink: 0,
  },
  labelRail: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  header: {
    flex: 1,
    minWidth: 0,
  },
  fallbackTitle: {
    ...Typography.sectionTitle,
    flexShrink: 1,
  },
  seeAllWrap: {
    flexShrink: 0,
    paddingLeft: Space.s8,
    paddingTop: Space.s4,
    minWidth: 56,
    alignItems: 'flex-end',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '500',
  },
});
