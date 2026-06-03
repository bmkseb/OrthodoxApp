import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { Palette } from '@/constants/theme';

type UserAvatarBadgeProps = {
  /** Outer diameter (matches profile nav at 36, album hero row at 22). */
  size?: number;
  accentColor?: string;
};

/** Circular initial badge — same look as the header profile button. */
export function UserAvatarBadge({ size = 22, accentColor = Palette.gold }: UserAvatarBadgeProps) {
  const { user, isGuest } = useAuth();
  const initial = (
    user?.displayName?.charAt(0) ??
    user?.email?.charAt(0) ??
    (isGuest ? 'G' : '☩')
  ).toUpperCase();

  const ring = size;
  const inner = Math.max(size - 6, 16);
  const fontSize = Math.round(inner * 0.43);

  return (
    <View
      style={[
        styles.ring,
        {
          width: ring,
          height: ring,
          borderRadius: ring / 2,
        },
      ]}>
      <View
        style={[
          styles.avatar,
          {
            width: inner,
            height: inner,
            borderRadius: inner / 2,
          },
        ]}>
        <Text style={[styles.initial, { color: accentColor, fontSize }]}>{initial}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    backgroundColor: Palette.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
