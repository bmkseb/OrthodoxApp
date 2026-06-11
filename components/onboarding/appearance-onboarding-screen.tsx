import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppearanceOptionList } from '@/components/settings/appearance-option-list';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { Space, Typography } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { useTranslation } from '@/hooks/use-translation';

const ANIM_CFG = { reduceMotion: ReduceMotion.Never } as const;

type AppearanceOnboardingScreenProps = {
  onDone: () => void;
};

export function AppearanceOnboardingScreen({ onDone }: AppearanceOnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { palette, preference, setPreference } = useTheme();
  const { t } = useTranslation();

  const enterOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const enterLift = useSharedValue(reduceMotion ? 0 : 14);

  React.useEffect(() => {
    if (reduceMotion) return;
    enterOpacity.value = withTiming(1, {
      duration: 520,
      easing: Easing.out(Easing.cubic),
      ...ANIM_CFG,
    });
    enterLift.value = withTiming(0, {
      duration: 520,
      easing: Easing.out(Easing.cubic),
      ...ANIM_CFG,
    });
  }, [enterLift, enterOpacity, reduceMotion]);

  const enterStyle = useAnimatedStyle(() => ({
    opacity: enterOpacity.value,
    transform: [{ translateY: enterLift.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.root,
        enterStyle,
        {
          paddingTop: insets.top + Space.s40,
          paddingBottom: Math.max(insets.bottom, Space.s24) + Space.s24,
        },
      ]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.text }]}>{t('settings.appearance')}</Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            {t('settings.appearanceDescription')}
          </Text>
        </View>

        <AppearanceOptionList />

        <OrthodoxPressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.continue')}
          onPress={() => {
            void setPreference(preference).then(onDone);
          }}
          style={[styles.continueBtn, { backgroundColor: palette.gold }]}>
          <Text style={[styles.continueBtnText, { color: palette.backgroundDeep }]}>
            {t('settings.continue')}
          </Text>
        </OrthodoxPressable>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: Space.s24,
  },
  scroll: {
    flexGrow: 1,
    gap: Space.s24,
  },
  header: {
    gap: Space.s8,
    marginBottom: Space.s8,
  },
  title: {
    ...Typography.pageTitle,
    fontSize: 30,
  },
  subtitle: {
    ...Typography.body,
    lineHeight: 22,
  },
  continueBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Space.s8,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
