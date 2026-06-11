import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { SacredSectionHeader } from '@/components/ui/bilingual-header';
import { ThemedText } from '@/components/themed-text';
import { getCeremonialSectionHeaderStyle, Layout, Space } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';
import { useTranslation } from '@/hooks/use-translation';
import type { HeaderKey } from '@/lib/translations';

type SectionHeaderProps = {
  headerKey?: HeaderKey;
  title?: string;
  /** @deprecated Icons removed — ceremonial serif headers read cleaner without rails. */
  icon?: unknown;
  onSeeAllPress?: () => void;
  /** @deprecated All section headers share the same ceremonial weight now. */
  emphasis?: 'default' | 'strong';
};

export function SectionHeader({
  headerKey,
  title,
  onSeeAllPress,
}: SectionHeaderProps) {
  const { t } = useTranslation();
  const { palette } = useThemeTokens();
  const ceremonialTitle = getCeremonialSectionHeaderStyle(palette.text);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        {headerKey ? (
          <SacredSectionHeader headerKey={headerKey} style={styles.header} />
        ) : (
          <ThemedText style={[ceremonialTitle, styles.fallbackTitle]} numberOfLines={1}>
            {title}
          </ThemedText>
        )}
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
    marginBottom: Layout.sectionInner,
    gap: Space.s8,
  },
  titleRow: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  header: {
    flex: 1,
    minWidth: 0,
  },
  fallbackTitle: {
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
