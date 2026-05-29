import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Palette } from '@/constants/theme';
import { useLanguage } from '@/contexts/language-context';
import type { LanguageMode } from '@/lib/translations';

const MUTED_GOLD = '#8A8070';
const SHEET_BG = '#1A1815';
const ACTIVE_TINT = 'rgba(201, 147, 58, 0.08)';
const ENTER_MS = 220;
const EXIT_MS = 180;
// Delay before auto-closing after a selection — long enough for the user to
// register the checkmark moving but short enough to feel snappy.
const CLOSE_DELAY_MS = 200;

type LanguageOption = {
  mode: LanguageMode;
  label: string;
  preview: React.ReactNode;
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

function PreviewEnglish() {
  return <Text style={styles.previewEnglish}>Logos</Text>;
}

function PreviewBilingual() {
  return (
    <View style={styles.previewRow}>
      <Text style={styles.previewAmharic}>ቃል</Text>
      <Text style={styles.previewPipe}>|</Text>
      <Text style={styles.previewEnglish}>Logos</Text>
    </View>
  );
}

function PreviewAmharic() {
  return <Text style={styles.previewAmharic}>ቃል</Text>;
}

const OPTIONS: LanguageOption[] = [
  { mode: 'en', label: 'English', preview: <PreviewEnglish /> },
  { mode: 'bilingual', label: 'English + አማርኛ', preview: <PreviewBilingual /> },
  { mode: 'am', label: 'አማርኛ', preview: <PreviewAmharic /> },
];

export function LanguageSelectorSheet({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { mode, setMode } = useLanguage();

  // 0 = fully hidden, 1 = fully presented. Drives both the dim and sheet slide.
  const presented = useSharedValue(0);

  useEffect(() => {
    presented.value = withTiming(visible ? 1 : 0, {
      duration: visible ? ENTER_MS : EXIT_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [visible, presented]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: presented.value * 0.6,
  }));

  const sheetStyle = useAnimatedStyle(
    (): ViewStyle => ({
      transform: [{ translateY: (1 - presented.value) * 360 }],
      opacity: presented.value,
    })
  );

  const handleSelect = (next: LanguageMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setMode(next);
    // Let the checkmark move first, then dismiss.
    setTimeout(() => {
      runOnJS(onClose)();
    }, CLOSE_DELAY_MS);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents={visible ? 'auto' : 'none'}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Dismiss" />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: 24 + Math.max(insets.bottom, 8) },
            sheetStyle,
          ]}
          pointerEvents={visible ? 'auto' : 'none'}>
          <View style={styles.handle} />

          <Text style={styles.title} allowFontScaling={false}>
            Display Language
          </Text>
          <Text style={styles.subtitle} allowFontScaling={false}>
            Choose how headers appear throughout the app
          </Text>

          <View style={styles.list}>
            {OPTIONS.map((option) => {
              const isActive = option.mode === mode;
              return (
                <Pressable
                  key={option.mode}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  onPress={() => handleSelect(option.mode)}
                  style={[styles.option, isActive && styles.optionActive]}>
                  <View style={styles.optionCopy}>
                    <Text
                      style={[styles.optionLabel, !isActive && styles.optionLabelInactive]}
                      allowFontScaling={false}>
                      {option.label}
                    </Text>
                    <View style={styles.optionPreview}>{option.preview}</View>
                  </View>
                  <View style={styles.optionCheck}>
                    {isActive ? <Icon name="cross" size={18} color={Palette.gold} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheet: {
    backgroundColor: SHEET_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(201, 147, 58, 0.3)',
    marginBottom: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Palette.text,
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '400',
    color: MUTED_GOLD,
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  list: {
    marginTop: 18,
    gap: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'transparent',
    opacity: 0.85,
  },
  optionActive: {
    backgroundColor: ACTIVE_TINT,
    opacity: 1,
  },
  optionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.text,
    letterSpacing: -0.1,
  },
  optionLabelInactive: {
    color: 'rgba(245, 236, 215, 0.78)',
  },
  optionPreview: {
    marginTop: 2,
  },
  optionCheck: {
    width: 28,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  previewAmharic: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.gold,
    lineHeight: 20,
  },
  previewPipe: {
    fontSize: 15,
    fontWeight: '300',
    color: 'rgba(201, 147, 58, 0.45)',
    lineHeight: 20,
  },
  previewEnglish: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
    lineHeight: 20,
  },
});
