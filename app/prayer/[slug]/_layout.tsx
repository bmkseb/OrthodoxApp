import { Stack } from 'expo-router';

import { useTheme } from '@/contexts/theme-context';

export default function PrayerLayout() {
  const { palette } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.background },
      }}
    />
  );
}
