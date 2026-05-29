import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { useAuth } from '@/contexts/auth-context';
import { Palette } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';

type ProfileNavButtonProps = {
  accentColor?: string;
};

export function ProfileNavButton({ accentColor = Palette.gold }: ProfileNavButtonProps) {
  const { t } = useTranslation();
  const { user, isGuest } = useAuth();

  const initial =
    (user?.displayName?.charAt(0) ?? user?.email?.charAt(0) ?? (isGuest ? 'G' : '☩')).toUpperCase();

  const handlePress = useCallback(() => {
    if (user || isGuest) {
      router.push('/profile');
    } else {
      router.push('/auth/welcome');
    }
  }, [user, isGuest]);

  return (
    <OrthodoxPressable
      accessibilityRole="button"
      accessibilityLabel={t('settings.profile')}
      onPress={handlePress}>
      <View style={styles.ring}>
        <View style={styles.avatar}>
          <Text style={[styles.initial, { color: accentColor }]}>{initial}</Text>
        </View>
      </View>
    </OrthodoxPressable>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Palette.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
