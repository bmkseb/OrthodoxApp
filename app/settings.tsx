import { router, Stack } from 'expo-router';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppearanceOptionList } from '@/components/settings/appearance-option-list';
import { AppBackButton } from '@/components/ui/app-back-button';
import { SacredAtmosphere } from '@/components/sacred/sacred-atmosphere';
import { ScrollIndicator, useScrollIndicator } from '@/components/ui/scroll-indicator';
import { BorderRadius, Layout, Space, Typography } from '@/constants/theme';
import { useLanguage } from '@/contexts/language-context';
import { useTheme } from '@/contexts/theme-context';
import { LANGUAGE_MODES } from '@/lib/translations';
import type { LanguageMode } from '@/lib/translations';
import { useTranslation } from '@/hooks/use-translation';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import * as Haptics from 'expo-haptics';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { palette } = useTheme();
  const { mode, setMode } = useLanguage();
  const { values: scrollIndicator, scrollHandler } = useScrollIndicator();

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/explore');
  }, []);

  const handleLanguage = (next: LanguageMode) => {
    if (next === mode) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    void setMode(next);
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SacredAtmosphere />

      <View style={[styles.topBar, { paddingTop: insets.top + Space.s8 }]}>
        <AppBackButton onPress={handleBack} style={styles.backBtn} />
        <Text style={[styles.topTitle, { color: palette.text }]}>{t('settings.title')}</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <View style={styles.scrollArea}>
        <AnimatedScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Space.s40 }]}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>{t('settings.appearance')}</Text>
            <Text style={[styles.sectionDescription, { color: palette.muted }]}>
              {t('settings.appearanceDescription')}
            </Text>
            <AppearanceOptionList />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>{t('settings.language')}</Text>
            <Text style={[styles.sectionDescription, { color: palette.muted }]}>
              {t('settings.languageDescription')}
            </Text>
            <View style={styles.list}>
              {LANGUAGE_MODES.map((option) => {
                const selected = mode === option.mode;
                const descriptionKey =
                  option.mode === 'en'
                    ? 'settings.modeEnDesc'
                    : option.mode === 'bilingual'
                      ? 'settings.modeBilingualDesc'
                      : 'settings.modeAmDesc';
                return (
                  <OrthodoxPressable
                    key={option.mode}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => handleLanguage(option.mode)}
                    style={[
                      styles.row,
                      {
                        backgroundColor: selected ? 'rgba(201, 147, 58, 0.08)' : palette.surface,
                        borderColor: selected ? palette.gold : palette.border,
                      },
                    ]}>
                    <View style={styles.copy}>
                      <Text style={[styles.label, { color: palette.text }]}>{t(option.labelKey)}</Text>
                      <Text style={[styles.description, { color: palette.muted }]}>
                        {t(descriptionKey)}
                      </Text>
                    </View>
                    {selected ? (
                      <Text style={[styles.check, { color: palette.gold }]} accessibilityLabel="Selected">
                        ✓
                      </Text>
                    ) : null}
                  </OrthodoxPressable>
                );
              })}
            </View>
          </View>
        </AnimatedScrollView>

        <ScrollIndicator
          values={scrollIndicator}
          trackInsetTop={insets.top + Space.s8 + 44}
          trackInsetBottom={insets.bottom + Space.s40}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.pagePadding,
    paddingBottom: Space.s12,
  },
  backBtn: {
    marginRight: Space.s8,
  },
  topTitle: {
    flex: 1,
    ...Typography.sectionTitle,
    fontSize: 22,
    textAlign: 'center',
  },
  topBarSpacer: {
    width: 40,
  },
  scrollArea: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Layout.pagePadding,
    gap: Space.s32,
    paddingTop: Space.s8,
  },
  section: {
    gap: Space.s12,
  },
  sectionTitle: {
    ...Typography.sectionTitle,
    fontSize: 20,
  },
  sectionDescription: {
    ...Typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
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
