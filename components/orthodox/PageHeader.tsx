import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { BilingualHeader } from '@/components/orthodox/BilingualHeader';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { Layout } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';

const ICON_SIZE = 22;
const ICON_STROKE = 1.5;
const ACTION_GAP = 16;

type PageHeaderProps = {
  /** English page title (e.g. "Read"). */
  title: string;
  /** Optional Amharic/Ge'ez form (e.g. "መጽሐፍ"). */
  geez?: string;
  /** Override the bell handler. Defaults to a no-op (notification screen TBD). */
  onPressBell?: () => void;
};

/**
 * Unified header used by every tab screen.
 * Language selection lives in Settings — not duplicated here.
 */
export function PageHeader({ title, geez, onPressBell }: PageHeaderProps) {
  const { t } = useTranslation();
  const { user, isGuest } = useAuth();
  const { palette } = useTheme();

  const initial =
    (user?.displayName?.charAt(0) ??
      user?.email?.charAt(0) ??
      (isGuest ? 'G' : 'B')).toUpperCase();

  const handleBell = useCallback(() => {
    onPressBell?.();
  }, [onPressBell]);

  const handleSettings = useCallback(() => {
    router.push('/settings');
  }, []);

  const handleAvatar = useCallback(() => {
    if (user || isGuest) router.push('/profile');
    else router.push('/auth/welcome');
  }, [user, isGuest]);

  return (
    <View style={styles.container}>
      <View style={styles.titleBlock}>
        <BilingualHeader
          amharic={geez ?? title}
          english={title}
          size={28}
          weight="700"
          letterSpacing={-0.6}
        />
      </View>

      <View style={styles.actions}>
        <OrthodoxPressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.notifications')}
          onPress={handleBell}
          style={styles.actionBtn}>
          <Icon name="bell" size={ICON_SIZE} color={palette.gold} strokeWidth={ICON_STROKE} />
        </OrthodoxPressable>

        <OrthodoxPressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.title')}
          onPress={handleSettings}
          style={styles.actionBtn}>
          <Icon name="settings" size={ICON_SIZE} color={palette.gold} strokeWidth={ICON_STROKE} />
        </OrthodoxPressable>

        <OrthodoxPressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.profile')}
          onPress={handleAvatar}>
          <View style={styles.avatarRing}>
            <View style={[styles.avatar, { backgroundColor: palette.card }]}>
              <Text style={[styles.avatarLetter, { color: palette.gold }]}>{initial}</Text>
            </View>
          </View>
        </OrthodoxPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginHorizontal: -Layout.pagePadding,
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ACTION_GAP,
  },
  actionBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
