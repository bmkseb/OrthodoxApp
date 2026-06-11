import { Stack } from 'expo-router';

import { useTheme } from '@/contexts/theme-context';

export default function BookLayout() {
  const { palette } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.background },
        animation: 'none',
      }}
    />
  );
}
