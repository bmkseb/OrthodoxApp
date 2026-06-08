import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { getReadingsByDate } from '@/data/lectionary';
import {
  FEASTS_INFO,
  getFeastDescription,
  resolveFeastInfoKey,
  SEASONS,
} from '@/lib/calendar-content';
import {
  formatEthiopianDateLong,
  getActiveFastSeason,
  getDayInfo,
  getEvangelistYear,
  getLiturgicalSeason,
} from '@/lib/eotc-liturgical-calendar';
import { expandScriptureRef } from '@/lib/lectionary-display';
import { BorderRadius, Palette, Space } from '@/constants/theme';

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const GREGORIAN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type CalendarDayDetailSheetProps = {
  visible: boolean;
  year: number;
  month: number;
  day: number;
  onClose: () => void;
  onPrevDay: () => void;
  onNextDay: () => void;
};

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function formatRefs(refs: string[]): string[] {
  return refs
    .map((r) => expandScriptureRef(r))
    .filter((r) => r.length > 0);
}

function ReadingGroup({ title, refs, isLast = false }: { title: string; refs: string[]; isLast?: boolean }) {
  const [open, setOpen] = useState(false);
  const lines = formatRefs(refs);
  if (lines.length === 0) return null;

  return (
    <View style={[styles.readingGroup, isLast && styles.readingGroupLast]}>
      <OrthodoxPressable style={styles.readingGroupHeader} onPress={() => setOpen((v) => !v)}>
        <Text style={styles.readingGroupTitle}>{title}</Text>
        <Icon name={open ? 'chevron-down' : 'chevron-right'} size={16} color={Palette.muted} />
      </OrthodoxPressable>
      {open
        ? lines.map((line, i) => (
            <Text
              key={`${title}-${line}-${i}`}
              style={[styles.readingLine, i === lines.length - 1 && styles.readingLineLast]}>
              {line}
            </Text>
          ))
        : null}
    </View>
  );
}

export function CalendarDayDetailSheet({
  visible,
  year,
  month,
  day,
  onClose,
  onPrevDay,
  onNextDay,
}: CalendarDayDetailSheetProps) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);
  const date = useMemo(() => new Date(year, month, day), [year, month, day]);

  const liturgical = useMemo(() => getDayInfo(date), [date]);
  const seasonKey = useMemo(() => getLiturgicalSeason(date), [date]);
  const activeFast = useMemo(() => getActiveFastSeason(date), [date]);
  const season = SEASONS[seasonKey];
  const fastSeason = activeFast ? SEASONS[activeFast] : null;
  const evangelist = getEvangelistYear(liturgical.ethiopianDate.year);
  const readings = getReadingsByDate(month + 1, day);

  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => sheetRef.current?.snapToIndex(1));
    } else {
      sheetRef.current?.close();
    }
  }, [visible, year, month, day]);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.45} />
    ),
    []
  );

  const gregorianLabel = `${WEEKDAY_NAMES[date.getDay()]}, ${GREGORIAN_MONTHS[month]} ${day}`;

  const fastingTitle = liturgical.isFasting
    ? fastSeason
      ? `${fastSeason.name}`
      : liturgical.fastingReason
        ? `Fasting — ${liturgical.fastingReason}`
        : 'Fasting'
    : 'No fasting today';

  const fastingBody = liturgical.isFasting
    ? fastSeason?.description ?? season.fastingRule
    : seasonKey === 'easter'
      ? 'Wednesday and Friday fasting is suspended during the Easter season.'
      : 'No fasting is required on this day.';

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}>
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <View style={styles.dateHeader}>
          <OrthodoxPressable
            style={styles.dayNavBtn}
            onPress={onPrevDay}
            accessibilityLabel="Previous day">
            <Icon name="chevron-left" size={20} color="#1C1510" />
          </OrthodoxPressable>

          <View style={styles.dateCopy}>
            <Text style={styles.gregorianDate}>{gregorianLabel}</Text>
            <Text style={styles.ethiopianMeta}>
              {formatEthiopianDateLong(liturgical.ethiopianDate)} · Year of {evangelist.name}
            </Text>
            <Text style={styles.seasonMeta}>
              {season.name}
            </Text>
          </View>

          <OrthodoxPressable
            style={styles.dayNavBtn}
            onPress={onNextDay}
            accessibilityLabel="Next day">
            <Icon name="chevron-right" size={20} color="#1C1510" />
          </OrthodoxPressable>
        </View>

        <View style={styles.section}>
          <SectionLabel title="Fasting" />
          <View style={[styles.fastingCard, liturgical.isFasting && styles.fastingCardActive]}>
            <Text style={[styles.fastingTitle, liturgical.isFasting && styles.fastingTitleActive]}>
              {fastingTitle}
            </Text>
            <Text style={styles.fastingBody}>{fastingBody}</Text>
          </View>
        </View>

        {liturgical.feasts.length > 0 ? (
          <View style={styles.section}>
            <SectionLabel title="Feasts" />
            {liturgical.feasts.map((feast) => {
              const infoKey = resolveFeastInfoKey(feast);
              const info = infoKey ? FEASTS_INFO[infoKey] : null;
              const description = getFeastDescription(feast) ?? info?.description;

              return (
                <View key={`${feast.name}-${feast.nameAm}`} style={styles.feastCard}>
                  <View style={styles.feastIconBox}>
                    <Text style={styles.feastIconText}>
                      {feast.type === 'mary' ? '✦' : feast.type === 'angel' ? '✧' : '☩'}
                    </Text>
                  </View>
                  <View style={styles.feastCopy}>
                    <Text style={styles.feastName}>{feast.name}</Text>
                    <Text style={styles.feastNameAm}>{feast.nameAm}</Text>
                    {description ? <Text style={styles.feastDescription}>{description}</Text> : null}
                    <View style={styles.feastBadge}>
                      <Text style={styles.feastBadgeText}>
                        {feast.isMajor ? 'Major feast' : 'Monthly feast'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {readings ? (
          <View style={styles.section}>
            <SectionLabel title="Readings" />
            <View style={styles.readingsCard}>
              {(
                [
                  { title: 'Morning', refs: readings.morning },
                  readings.qidase.epistle
                    ? { title: 'Qidase — Epistle', refs: [readings.qidase.epistle] }
                    : null,
                  readings.qidase.catholicEpistle
                    ? { title: 'Qidase — Catholic Epistle', refs: [readings.qidase.catholicEpistle] }
                    : null,
                  readings.qidase.acts ? { title: 'Qidase — Acts', refs: [readings.qidase.acts] } : null,
                  { title: 'Qidase — Psalm', refs: [readings.qidase.psalm] },
                  { title: 'Qidase — Gospel', refs: [readings.qidase.gospel] },
                  { title: 'Evening', refs: readings.evening },
                ].filter((group): group is { title: string; refs: string[] } => group !== null)
              ).map((group, index, groups) => (
                <ReadingGroup
                  key={group.title}
                  title={group.title}
                  refs={group.refs}
                  isLast={index === groups.length - 1}
                />
              ))}
            </View>
          </View>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: '#F7F4EF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  handle: {
    backgroundColor: '#C8C0B5',
    width: 40,
  },
  content: {
    paddingHorizontal: Space.s24,
    paddingBottom: Space.s48,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s8,
    marginBottom: Space.s24,
  },
  dateCopy: {
    flex: 1,
    alignItems: 'center',
  },
  gregorianDate: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1510',
    marginBottom: Space.s4,
    textAlign: 'center',
  },
  ethiopianMeta: {
    fontSize: 13,
    color: '#6B6258',
    textAlign: 'center',
  },
  seasonMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B6914',
    textAlign: 'center',
    marginTop: Space.s8,
  },
  section: {
    marginBottom: Space.s24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#9A9085',
    marginBottom: Space.s8,
  },
  fastingCard: {
    backgroundColor: '#EFEBE4',
    borderRadius: BorderRadius.md,
    padding: Space.s16,
  },
  fastingCardActive: {
    backgroundColor: '#F3EBE8',
  },
  fastingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1510',
    marginBottom: Space.s8,
  },
  fastingTitleActive: {
    color: '#6B2C2C',
  },
  fastingBody: {
    fontSize: 13,
    lineHeight: 19,
    color: '#5C534A',
  },
  feastCard: {
    flexDirection: 'row',
    gap: Space.s12,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E5DFD5',
    padding: Space.s16,
    marginBottom: Space.s8,
  },
  feastIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#EFEBE4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feastIconText: {
    fontSize: 16,
    color: '#6B6258',
  },
  feastCopy: {
    flex: 1,
  },
  feastName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1510',
  },
  feastNameAm: {
    fontSize: 13,
    color: '#6B6258',
    marginTop: 2,
    marginBottom: Space.s8,
  },
  feastDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#5C534A',
    marginBottom: Space.s8,
  },
  feastBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201, 147, 58, 0.16)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  feastBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8B6914',
  },
  readingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E5DFD5',
    overflow: 'hidden',
  },
  readingGroup: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5DFD5',
  },
  readingGroupLast: {
    borderBottomWidth: 0,
  },
  readingGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.s16,
    paddingVertical: Space.s12,
  },
  readingGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1510',
  },
  readingLine: {
    fontSize: 13,
    lineHeight: 20,
    color: '#5C534A',
    paddingHorizontal: Space.s16,
    paddingBottom: Space.s4,
  },
  readingLineLast: {
    paddingBottom: Space.s12,
  },
  dayNavBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5DFD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
