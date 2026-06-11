import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GlobalAudioChrome } from '@/components/audio/global-audio-chrome';
import { LanguageGate } from '@/components/navigation/language-gate';
import { ThemeGate } from '@/components/navigation/theme-gate';
import { LanguageProvider } from '@/contexts/language-context';
import { AudioPlayerProvider } from '@/contexts/audio-player-context';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider, useTheme } from '@/contexts/theme-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Animation } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootStack() {
  const { palette, colorScheme } = useTheme();

  const navigationTheme = {
    ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: palette.gold,
      background: palette.background,
      card: palette.card,
      text: palette.text,
      border: palette.border,
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <GestureHandlerRootView style={[styles.root, { backgroundColor: palette.background }]}>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: palette.background },
            animation: 'slide_from_bottom',
            animationDuration: Animation.detailSlideMs,
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'none' }} />
          <Stack.Screen
            name="catalog"
            options={{ headerShown: false, animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="read/catalog"
            options={{ headerShown: false, animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="book/[bookId]" options={{ headerShown: false }} />
          <Stack.Screen
            name="learn/catalog"
            options={{ headerShown: false, animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="learn/[slug]"
            options={{ headerShown: false, animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="learn/daily"
            options={{ headerShown: false, animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="prayer/[slug]"
            options={{ headerShown: false, animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="listen"
            options={{ headerShown: false, animation: 'slide_from_bottom' }}
          />
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
        <GlobalAudioChrome />
      </GestureHandlerRootView>
      <StatusBar style={palette.statusBar} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AudioPlayerProvider>
              <ThemeGate>
                <LanguageGate>
                  <RootStack />
                </LanguageGate>
              </ThemeGate>
            </AudioPlayerProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
