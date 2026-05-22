import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LanguageProvider } from '@/contexts/language-context';
import { LanguageGate } from '@/components/navigation/language-gate';
import { VignetteOverlay } from '@/components/ui/vignette-overlay';
import { Animation, Palette } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const OrthodoxNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Palette.gold,
    background: Palette.background,
    card: Palette.card,
    text: Palette.text,
    border: 'rgba(255, 255, 255, 0.12)',
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <LanguageGate>
          <ThemeProvider value={OrthodoxNavigationTheme}>
            <View style={styles.root}>
              <Stack
                screenOptions={{
                  contentStyle: { backgroundColor: Palette.background },
                  animation: 'slide_from_bottom',
                  animationDuration: Animation.detailSlideMs,
                }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'none' }} />
                <Stack.Screen name="catalog" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
                <Stack.Screen name="settings" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <VignetteOverlay />
            </View>
            <StatusBar style="light" />
          </ThemeProvider>
        </LanguageGate>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background,
  },
});
