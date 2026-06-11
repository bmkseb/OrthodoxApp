import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ReadCoverThumb } from '@/components/read/read-cover-thumb';
import { ThemedText } from '@/components/themed-text';
import type { ReadCoverFocus, ReadCoverSource, ReadCoverTone } from '@/constants/read-cover-art';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

type CatalogBookRowProps = {
  title: string;
  subtitle: string;
  /** Ge'ez/Amharic title shown above the English title in non-English UI modes. */
  geez?: string;
  /** Whether to render the Ge'ez line (typically `mode !== 'en'`). */
  showGeez?: boolean;
  /** Leading glyph giving the row a distinct identity. */
  icon?: IconName;
  /** When set, shows a mini book jacket instead of the icon glyph. */
  bookId?: string;
  coverSource?: ReadCoverSource;
  coverTone?: ReadCoverTone;
  coverFocus?: ReadCoverFocus;
  onPress: () => void;
};

/**
 * One row in the Orthodox Catalog. Shared so every catalog book — Scripture,
 * prayer books, the Liturgy — renders with the same chrome and behavior.
 */
export const CatalogBookRow = memo(function CatalogBookRow({
  title,
  subtitle,
  geez,
  showGeez = false,
  icon,
  bookId,
  coverSource,
  coverTone,
  coverFocus,
  onPress,
}: CatalogBookRowProps) {
  const { palette } = useThemeTokens();
  const showCover = coverSource != null && bookId != null;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: Spacing.md - 2,
          paddingHorizontal: 2,
          minHeight: 56,
        },
        leading: {
          marginRight: Spacing.md,
        },
        iconWrap: {
          width: 42,
          height: 42,
          borderRadius: BorderRadius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${palette.gold}1A`,
        },
        rowText: {
          flex: 1,
          minWidth: 0,
        },
        rowGeez: {
          fontSize: 13,
          color: palette.gold,
          marginBottom: 3,
        },
        rowTitle: {
          fontSize: 16,
          fontWeight: '600',
          lineHeight: 21,
          color: palette.text,
        },
        rowSubtitle: {
          fontSize: 12.5,
          lineHeight: 17,
          marginTop: 2,
        },
        arrow: {
          fontSize: 22,
          color: palette.mutedGold,
          marginLeft: Spacing.sm,
        },
      }),
    [palette]
  );

  return (
    <OrthodoxPressable style={styles.row} onPress={onPress} accessibilityRole="button">
      {showCover ? (
        <View style={styles.leading}>
          <ReadCoverThumb
            bookId={bookId}
            source={coverSource}
            tone={coverTone}
            focus={coverFocus}
            width={40}
            height={56}
          />
        </View>
      ) : icon ? (
        <View style={[styles.leading, styles.iconWrap]}>
          <Icon name={icon} size={20} color={palette.gold} />
        </View>
      ) : null}
      <View style={styles.rowText}>
        {showGeez && geez ? <ThemedText style={styles.rowGeez}>{geez}</ThemedText> : null}
        <ThemedText style={styles.rowTitle} numberOfLines={1}>
          {title}
        </ThemedText>
        <ThemedText type="muted" style={styles.rowSubtitle} numberOfLines={1}>
          {subtitle}
        </ThemedText>
      </View>
      <ThemedText style={styles.arrow}>›</ThemedText>
    </OrthodoxPressable>
  );
});
