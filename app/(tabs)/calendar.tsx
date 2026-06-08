import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CalendarDayDetailSheet } from '@/components/calendar/calendar-day-detail-sheet';
import { CalendarInfoModal } from '@/components/calendar/calendar-info-modal';
import { CalendarMonthGrid } from '@/components/calendar/calendar-month-grid';
import { SeasonBanner } from '@/components/calendar/season-banner';
import { TodayHeader } from '@/components/calendar/today-header';
import { UpcomingFasts } from '@/components/calendar/upcoming-fasts';
import { UpcomingFeasts } from '@/components/calendar/upcoming-feasts';
import { PageHeader } from '@/components/orthodox/PageHeader';
import { SacredAtmosphere } from '@/components/sacred/sacred-atmosphere';
import { ThemedView } from '@/components/themed-view';
import { useFloatingBottomInset } from '@/hooks/use-floating-bottom-inset';
import { useTranslation } from '@/hooks/use-translation';
import { getUpcomingMajorFeasts, type UpcomingFeast } from '@/data/orthodoxCalendar';
import { getEthiopianMonthsInGregorianMonth, getUpcomingFasts } from '@/lib/eotc-liturgical-calendar';
import { Layout, Space } from '@/constants/theme';

const GREGORIAN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = useFloatingBottomInset();
  const now = useMemo(() => new Date(), []);
  const today = useMemo(
    () => ({ year: now.getFullYear(), month: now.getMonth(), day: now.getDate() }),
    [now]
  );

  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.month);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.day);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [legendVisible, setLegendVisible] = useState(false);

  const upcomingFasts = useMemo(() => getUpcomingFasts(4, now), [now]);
  const upcomingFeasts = useMemo(() => getUpcomingMajorFeasts(5, now), [now]);

  const { gregorianMonthLabel, ethiopianMonthLabel } = useMemo(() => {
    const { monthNames, ethYear } = getEthiopianMonthsInGregorianMonth(viewYear, viewMonth);
    return {
      gregorianMonthLabel: `${GREGORIAN_MONTHS[viewMonth]} ${viewYear}`,
      ethiopianMonthLabel:
        monthNames.length > 0 ? `${monthNames.join(' / ')} ${ethYear}` : `${ethYear}`,
    };
  }, [viewMonth, viewYear]);

  const sheetDay = selectedDay ?? today.day;

  const bannerDate = useMemo(() => {
    if (sheetVisible) {
      return new Date(viewYear, viewMonth, sheetDay);
    }
    return now;
  }, [now, sheetDay, sheetVisible, viewMonth, viewYear]);

  const openSheetForDay = useCallback((day: number) => {
    setSelectedDay(day);
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  const goPrevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth]);

  const goNextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth]);

  const goPrevYear = useCallback(() => {
    setViewYear((y) => y - 1);
  }, []);

  const goNextYear = useCallback(() => {
    setViewYear((y) => y + 1);
  }, []);

  const goToToday = useCallback(() => {
    setViewYear(today.year);
    setViewMonth(today.month);
    setSelectedDay(today.day);
  }, [today]);

  const navigateDay = useCallback(
    (delta: number) => {
      const next = new Date(viewYear, viewMonth, sheetDay + delta);
      setViewYear(next.getFullYear());
      setViewMonth(next.getMonth());
      setSelectedDay(next.getDate());
    },
    [sheetDay, viewMonth, viewYear]
  );

  const handleFeastPress = useCallback((feast: UpcomingFeast) => {
    setViewYear(feast.date.getFullYear());
    setViewMonth(feast.date.getMonth());
    setSelectedDay(feast.date.getDate());
    setSheetVisible(true);
  }, []);

  return (
    <ThemedView style={styles.screen}>
      <SacredAtmosphere />
      <BottomSheetModalProvider>
        <View
          style={[
            styles.screenBody,
            {
              paddingTop: insets.top + Space.s8,
              paddingBottom: scrollBottomPadding,
            },
          ]}>
          <PageHeader title={t('nav.calendar')} geez="ቀን ዘመን" />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            <SeasonBanner date={bannerDate} onOpenLegend={() => setLegendVisible(true)} />
            <TodayHeader
              date={now}
              todayLabel={t('calendar.today')}
              onPressToday={goToToday}
            />
            <CalendarMonthGrid
              year={viewYear}
              month={viewMonth}
              today={today}
              gregorianMonthLabel={gregorianMonthLabel}
              ethiopianMonthLabel={ethiopianMonthLabel}
              onSelectDay={openSheetForDay}
              onPrevMonth={goPrevMonth}
              onNextMonth={goNextMonth}
              onPrevYear={goPrevYear}
              onNextYear={goNextYear}
            />
            <UpcomingFasts fasts={upcomingFasts} />
            <UpcomingFeasts feasts={upcomingFeasts} onPressFeast={handleFeastPress} />
          </ScrollView>
        </View>

        <CalendarDayDetailSheet
          visible={sheetVisible}
          year={viewYear}
          month={viewMonth}
          day={sheetDay}
          onClose={handleCloseSheet}
          onPrevDay={() => navigateDay(-1)}
          onNextDay={() => navigateDay(1)}
        />

        <CalendarInfoModal visible={legendVisible} onClose={() => setLegendVisible(false)} />
      </BottomSheetModalProvider>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenBody: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: Layout.pagePadding,
  },
  scrollContent: {
    paddingBottom: Space.s32,
  },
});
