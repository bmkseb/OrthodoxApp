import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LanguageProvider } from '@/contexts/language-context';
import { AudioPlayerProvider } from '@/contexts/audio-player-context';
import { AuthProvider } from '@/contexts/auth-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LanguageGate } from '@/components/navigation/language-gate';
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
        <AuthProvider>
          <AudioPlayerProvider>
            <LanguageGate>
            <ThemeProvider value={OrthodoxNavigationTheme}>
              <GestureHandlerRootView style={styles.root}>
                <Stack
                  screenOptions={{
                    contentStyle: { backgroundColor: Palette.background },
                    animation: 'slide_from_bottom',
                    animationDuration: Animation.detailSlideMs,
                  }}>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'none' }} />
                  <Stack.Screen
                    name="catalog"
                    options={{ headerShown: false, animation: 'slide_from_bottom' }}
                  />
                  <Stack.Screen name="book/[bookId]" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="saved"
                    options={{ headerShown: false, animation: 'slide_from_bottom' }}
                  />
                  <Stack.Screen
                    name="settings"
                    options={{ headerShown: false, animation: 'slide_from_bottom' }}
                  />
                  <Stack.Screen
                    name="auth/welcome"
                    options={{ headerShown: false, animation: 'fade' }}
                  />
                  <Stack.Screen
                    name="profile"
                    options={{ headerShown: false, animation: 'slide_from_bottom' }}
                  />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                </Stack>
              </GestureHandlerRootView>
              <StatusBar style="light" />
            </ThemeProvider>
            </LanguageGate>
          </AudioPlayerProvider>
        </AuthProvider>
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
