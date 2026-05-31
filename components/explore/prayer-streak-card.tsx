import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ThemedText } from '@/components/themed-text';
import { Layout, Palette, Space } from '@/constants/theme';

type PrayerStreakCardProps = {
  title: string;
  subtitle: string;
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/** Monday-based index for today (0 = Mon … 6 = Sun). */
function todayMondayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

/** Day-of-month number for each day in the current Mon–Sun week. */
function weekDayNumbers(): number[] {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - todayMondayIndex());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.getDate();
  });
}

/** Compact, personal hero for the Explore tab — a reason to come back daily. */
export const PrayerStreakCard = memo(function PrayerStreakCard({
  title,
  subtitle,
}: PrayerStreakCardProps) {
  const todayIndex = todayMondayIndex();
  const dayNumbers = weekDayNumbers();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.flameBadge}>
          <Icon name="flame" size={20} color={Palette.gold} />
        </View>
        <View style={styles.text}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText type="muted" style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </ThemedText>
        </View>
      </View>

      <View style={styles.weekRow}>
        {DAY_LABELS.map((label, i) => {
          const completed = i < todayIndex;
          const isToday = i === todayIndex;
          return (
            <View key={label} style={styles.dayCol}>
              <View
                style={[
                  styles.dot,
                  completed && styles.dotDone,
                  isToday && styles.dotToday,
                ]}>
                <ThemedText
                  style={[
                    styles.dotNumber,
                    (completed || isToday) && styles.dotNumberActive,
                  ]}>
                  {dayNumbers[i]}
                </ThemedText>
              </View>
              <ThemedText
                style={[styles.dayLabel, (completed || isToday) && styles.dayLabelActive]}>
                {label}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: Layout.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.35)',
    backgroundColor: Palette.surface,
    paddingHorizontal: Space.s16,
    paddingVertical: Space.s12,
    // Subtle gold glow
    shadowColor: Palette.gold,
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s12,
  },
  flameBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 147, 58, 0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.35)',
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: Palette.muted,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Space.s12,
    paddingTop: Space.s12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(201, 147, 58, 0.16)',
  },
  dayCol: {
    alignItems: 'center',
    gap: Space.s4 + 1,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    // Missed / future day — faint empty border.
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(168, 160, 146, 0.35)',
    backgroundColor: 'transparent',
  },
  dotDone: {
    // Completed day — solid gold outline, no fill.
    borderWidth: 1.5,
    borderColor: Palette.gold,
  },
  dotToday: {
    borderWidth: 2,
    borderColor: Palette.gold,
    backgroundColor: 'rgba(201, 147, 58, 0.15)',
  },
  dotNumber: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.muted,
  },
  dotNumberActive: {
    color: Palette.gold,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: Palette.muted,
  },
  dayLabelActive: {
    color: Palette.gold,
  },
});
