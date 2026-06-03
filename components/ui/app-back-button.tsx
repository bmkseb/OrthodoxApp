import { router } from 'expo-router';
import { memo, useCallback } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { Palette, Space } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslationKey } from '@/lib/translations';

type AppBackButtonProps = {
  /** Visible label next to the chevron (defaults to `settings.back`). */
  label?: string;
  labelKey?: TranslationKey;
  onPress?: () => void;
  /** When `router.canGoBack()` is false and no custom `onPress`. */
  onFallback?: () => void;
  style?: StyleProp<ViewStyle>;
  hitSlop?: number;
};

/** Canonical back control — chevron + label, used on every stack screen. */
export const AppBackButton = memo(function AppBackButton({
  label,
  labelKey = 'settings.back',
  onPress,
  onFallback,
  style,
  hitSlop = 10,
}: AppBackButtonProps) {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t(labelKey);

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    onFallback?.();
  }, [onFallback, onPress]);

  return (
    <OrthodoxPressable
      style={[styles.row, style]}
      onPress={handlePress}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={resolvedLabel}>
      <Icon name="chevron-left" size={20} color={Palette.mutedGold} />
      <ThemedText type="seeAll" style={styles.label}>
        {resolvedLabel}
      </ThemedText>
    </OrthodoxPressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Space.s4,
    marginLeft: -2,
    paddingVertical: Space.s4,
  },
  label: {
    fontWeight: '600',
  },
});
