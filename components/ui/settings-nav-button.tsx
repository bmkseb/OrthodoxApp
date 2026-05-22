import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { useTranslation } from '@/hooks/use-translation';
import { Palette } from '@/constants/theme';

type SettingsNavButtonProps = {
  color?: string;
};

export function SettingsNavButton({ color = Palette.muted }: SettingsNavButtonProps) {
  const { t } = useTranslation();

  return (
    <OrthodoxPressable
      style={styles.button}
      onPress={() => router.push('/settings')}
      accessibilityRole="button"
      accessibilityLabel={t('settings.title')}>
      <Icon name="globe" size={20} color={color} />
    </OrthodoxPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 6,
  },
});
