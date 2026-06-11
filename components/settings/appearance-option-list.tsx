import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { useTheme, type ThemePreference } from '@/contexts/theme-context';
import { BorderRadius, Space } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';

type AppearanceOption = {
  value: ThemePreference;
  labelKey: 'settings.themeLight' | 'settings.themeDark' | 'settings.themeSystem';
  descriptionKey:
    | 'settings.themeLightDesc'
    | 'settings.themeDarkDesc'
    | 'settings.themeSystemDesc';
  icon: IconName;
};

const OPTIONS: AppearanceOption[] = [
  {
    value: 'light',
    labelKey: 'settings.themeLight',
    descriptionKey: 'settings.themeLightDesc',
    icon: 'sun',
  },
  {
    value: 'dark',
    labelKey: 'settings.themeDark',
    descriptionKey: 'settings.themeDarkDesc',
    icon: 'moon',
  },
  {
    value: 'system',
    labelKey: 'settings.themeSystem',
    descriptionKey: 'settings.themeSystemDesc',
    icon: 'settings',
  },
];

type AppearanceOptionListProps = {
  onSelect?: () => void;
};

export function AppearanceOptionList({ onSelect }: AppearanceOptionListProps) {
  const { t } = useTranslation();
  const { preference, setPreference, palette } = useTheme();

  const handleSelect = (next: ThemePreference) => {
    if (next === preference) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    void setPreference(next);
    onSelect?.();
  };

  return (
    <View style={styles.list}>
      {OPTIONS.map((option) => {
        const selected = preference === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => handleSelect(option.value)}
            style={[
              styles.row,
              {
                backgroundColor: selected ? 'rgba(201, 147, 58, 0.08)' : palette.surface,
                borderColor: selected ? palette.gold : palette.border,
              },
            ]}>
            <View style={[styles.iconWrap, { backgroundColor: palette.surfaceWarm }]}>
              <Icon name={option.icon} size={18} color={palette.gold} />
            </View>
            <View style={styles.copy}>
              <Text style={[styles.label, { color: palette.text }]}>{t(option.labelKey)}</Text>
              <Text style={[styles.description, { color: palette.muted }]}>
                {t(option.descriptionKey)}
              </Text>
            </View>
            {selected ? (
              <Text style={[styles.check, { color: palette.gold }]} accessibilityLabel="Selected">
                ✓
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Space.s12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s12,
    paddingHorizontal: Space.s16,
    paddingVertical: Space.s12,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  check: {
    fontSize: 18,
    fontWeight: '700',
  },
});
