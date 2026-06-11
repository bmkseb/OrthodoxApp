import { LinearGradient } from 'expo-linear-gradient';
import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { getCalendarRail } from '@/lib/calendar-visual';
import { BorderRadius, Layout, Space } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

export const CALENDAR_RAIL_CARD = {
  width: 168,
  height: 156,
  gap: Space.s8,
} as const;

export const CALENDAR_RAIL_SCROLL_CONTENT = {
  gap: CALENDAR_RAIL_CARD.gap,
  paddingRight: Layout.pagePadding,
} as const;

export type CalendarRailCardProps = {
  title: string;
  subtitle?: string;
  meta: string;
  statusLabel?: string;
  statusActive?: boolean;
  accentColor: string;
  icon: IconName;
  panelTint?: string;
  onPress?: () => void;
};

export const CalendarRailCard = memo(function CalendarRailCard({
  title,
  subtitle,
  meta,
  statusLabel,
  statusActive = false,
  accentColor,
  icon,
  panelTint,
  onPress,
}: CalendarRailCardProps) {
  const { palette, colorScheme } = useThemeTokens();
  const rail = useMemo(
    () => getCalendarRail(palette, colorScheme),
    [colorScheme, palette]
  );

  const dynamic = useMemo(
    () =>
      StyleSheet.create({
        card: {
          borderColor: rail.borderColor,
          backgroundColor: palette.surfaceWarm,
        },
        iconWrap: { backgroundColor: rail.iconBackdrop },
        badge: { backgroundColor: rail.badgeBg },
        badgeActive: { backgroundColor: rail.badgeActiveBg },
        badgeText: { color: palette.muted },
        title: { color: palette.text },
        subtitle: { color: palette.gold },
      }),
    [palette, rail]
  );

  const card = (
    <View style={[styles.card, dynamic.card]}>
      <View style={styles.header}>
        <LinearGradient
          colors={[panelTint ?? rail.badgeActiveBg, ...rail.cardGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
        <View style={[styles.iconWrap, dynamic.iconWrap, { borderColor: `${accentColor}55` }]}>
          <Icon name={icon} size={20} color={accentColor} />
        </View>
        {statusLabel ? (
          <View
            style={[
              styles.badge,
              dynamic.badge,
              statusActive && dynamic.badgeActive,
              { borderColor: `${accentColor}66` },
            ]}>
            <Text
              style={[styles.badgeText, dynamic.badgeText, statusActive && { color: accentColor }]}>
              {statusLabel}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, dynamic.title]} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, dynamic.subtitle]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        <Text style={[styles.meta, { color: accentColor }]} numberOfLines={1}>
          {meta}
        </Text>
      </View>
    </View>
  );

  if (!onPress) return card;

  return (
    <OrthodoxPressable onPress={onPress} style={styles.pressable}>
      {card}
    </OrthodoxPressable>
  );
});

const styles = StyleSheet.create({
  pressable: {},
  card: {
    width: CALENDAR_RAIL_CARD.width,
    minHeight: CALENDAR_RAIL_CARD.height,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
  },
  header: {
    height: 78,
    paddingHorizontal: Space.s12,
    paddingTop: Space.s12,
    paddingBottom: Space.s8,
    position: 'relative',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    opacity: 0.92,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Space.s4,
  },
  badge: {
    position: 'absolute',
    top: Space.s8,
    right: Space.s8,
    paddingHorizontal: Space.s8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  body: {
    paddingHorizontal: Space.s12,
    paddingTop: Space.s8,
    paddingBottom: Space.s12,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  meta: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    marginTop: Space.s4,
  },
});
