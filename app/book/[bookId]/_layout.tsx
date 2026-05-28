import { Stack } from 'expo-router';

import { Animation, Palette } from '@/constants/theme';

export default function BookLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Palette.background },
        animation: 'slide_from_bottom',
        animationDuration: Animation.detailSlideMs,
      }}
    />
  );
}
