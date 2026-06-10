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
import { SectionHeader } from '@/components/ui/section-header';
import { useFloatingBottomInset } from '@/hooks/use-floating-bottom-inset';
import { useTranslation } from '@/hooks/use-translation';
import { getUpcomingMajorFeasts, type UpcomingFeast } from '@/data/orthodoxCalendar';
import {
  formatEthiopianMonthsLabel,
  formatGregorianMonthYear,
} from '@/lib/calendar-i18n';
import {
  getEthiopianMonthsInGregorianMonth,
  getUpcomingFasts,
  type UpcomingFastPeriod,
} from '@/lib/eotc-liturgical-calendar';
import { ListenSectionSpacing } from '@/constants/listen-layout';
import { Layout, Space } from '@/constants/theme';
import type { IconName } from '@/components/Icon';

const CALENDAR_CATALOG_ICON: IconName = 'scroll';

export default function CalendarScreen() {
  const { t, mode } = useTranslation();
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
    const { months, ethYear } = getEthiopianMonthsInGregorianMonth(viewYear, viewMonth);
    return {
      gregorianMonthLabel: formatGregorianMonthYear(viewMonth, viewYear, mode),
      ethiopianMonthLabel: formatEthiopianMonthsLabel(months, ethYear, mode),
    };
  }, [mode, viewMonth, viewYear]);

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

  const openCalendarDate = useCallback(
    (date: Date) => {
      setViewYear(date.getFullYear());
      setViewMonth(date.getMonth());
      setSelectedDay(date.getDate());
      setSheetVisible(true);
    },
    []
  );

  const handleFeastPress = useCallback(
    (feast: UpcomingFeast) => {
      openCalendarDate(feast.date);
    },
    [openCalendarDate]
  );

  const handleFastPress = useCallback(
    (fast: UpcomingFastPeriod) => {
      const target = fast.isActive ? now : fast.startDate;
      openCalendarDate(target);
    },
    [now, openCalendarDate]
  );

  return (
    <ThemedView style={styles.screen}>
      <SacredAtmosphere />
      <BottomSheetModalProvider>
        <View
          style={[
            styles.screenBody,
            { paddingTop: insets.top + Space.s8 },
          ]}>
          <PageHeader title={t('nav.calendar')} geez="ቀን ዘመን" />

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: scrollBottomPadding }}>
            <View style={styles.seasonSection}>
              <SeasonBanner date={bannerDate} onOpenLegend={() => setLegendVisible(true)} />
            </View>
            <TodayHeader date={now} todayLabel={t('calendar.today')} />
            <CalendarMonthGrid
              year={viewYear}
              month={viewMonth}
              today={today}
              gregorianMonthLabel={gregorianMonthLabel}
              ethiopianMonthLabel={ethiopianMonthLabel}
              todayLabel={t('calendar.today')}
              onGoToToday={goToToday}
              onSelectDay={openSheetForDay}
              onPrevMonth={goPrevMonth}
              onNextMonth={goNextMonth}
              onPrevYear={goPrevYear}
              onNextYear={goNextYear}
            />

            <View style={styles.catalogSection}>
              <SectionHeader title={t('calendar.catalog')} icon={CALENDAR_CATALOG_ICON} />
              <UpcomingFasts
                title={t('sections.upcomingFasts')}
                fasts={upcomingFasts}
                onPressFast={handleFastPress}
                compactBottom={upcomingFeasts.length > 0}
              />
              <UpcomingFeasts
                title={t('sections.upcomingFeasts')}
                feasts={upcomingFeasts}
                onPressFeast={handleFeastPress}
              />
            </View>
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
  scroll: {
    flex: 1,
  },
  seasonSection: {
    marginBottom: ListenSectionSpacing.primary,
  },
  catalogSection: {
    marginTop: Space.s24,
  },
});
