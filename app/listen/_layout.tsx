import { Stack } from 'expo-router';

import { Palette } from '@/constants/theme';

export default function ListenLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Palette.background },
      }}
    />
  );
}
