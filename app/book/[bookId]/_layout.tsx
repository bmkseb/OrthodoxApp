import { Stack } from 'expo-router';

import { Palette } from '@/constants/theme';

export default function BookLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Palette.background },
        animation: 'none',
      }}
    />
  );
}
