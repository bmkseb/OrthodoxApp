import { StyleSheet, Text, View } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import {
  formatEthiopianDateLong,
  getDayInfo,
  getEvangelistYear,
} from '@/lib/eotc-liturgical-calendar';
import { Palette, Space } from '@/constants/theme';

type TodayHeaderProps = {
  date?: Date;
  onPressToday?: () => void;
  todayLabel?: string;
};

export function TodayHeader({
  date = new Date(),
  onPressToday,
  todayLabel = 'Today',
}: TodayHeaderProps) {
  const info = getDayInfo(date);
  const evangelist = getEvangelistYear(info.ethiopianDate.year);

  return (
    <View style={styles.wrap}>
      <OrthodoxPressable onPress={onPressToday} disabled={!onPressToday}>
        <Text style={styles.todayLabel}>{todayLabel}</Text>
      </OrthodoxPressable>
      <Text style={styles.meta} numberOfLines={2}>
        {formatEthiopianDateLong(info.ethiopianDate)}
        <Text style={styles.dot}> · </Text>
        Year of {evangelist.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.s12,
    marginBottom: Space.s12,
    paddingBottom: Space.s8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  todayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.text,
  },
  meta: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    color: Palette.muted,
    lineHeight: 17,
  },
  dot: {
    color: Palette.muted,
  },
});
