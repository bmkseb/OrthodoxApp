import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { Layout } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';

export function ScriptureBackBar() {
  const { t } = useTranslation();

  return (
    <OrthodoxPressable style={styles.bar} onPress={() => router.back()}>
      <ThemedText type="seeAll">{t('settings.back')}</ThemedText>
    </OrthodoxPressable>
  );
}

const styles = StyleSheet.create({
  bar: { marginBottom: Layout.headerContentGap },
});
