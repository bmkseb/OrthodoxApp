import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { CalendarDayDetailSheet } from '@/components/calendar/calendar-day-detail-sheet';
import { CalendarInfoModal } from '@/components/calendar/calendar-info-modal';
import { CalendarMonthGrid } from '@/components/calendar/calendar-month-grid';
import { SeasonBanner } from '@/components/calendar/season-banner';
import { TodayHeader } from '@/components/calendar/today-header';
import { UpcomingFasts } from '@/components/calendar/upcoming-fasts';
import { UpcomingFeasts } from '@/components/calendar/upcoming-feasts';
import { PageHeader } from '@/components/orthodox/PageHeader';
import { SectionBlock } from '@/components/ui/section-block';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { useTranslation } from '@/hooks/use-translation';
import { getUpcomingMajorFeasts, type UpcomingFeast } from '@/data/orthodoxCalendar';
import { getEthiopianMonthsInGregorianMonth, getUpcomingFasts } from '@/lib/eotc-liturgical-calendar';
import { Space } from '@/constants/theme';

const GREGORIAN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarScreen() {
  const { t } = useTranslation();
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
    <BottomSheetModalProvider>
      <ScreenScrollView contentContainerStyle={styles.scrollContent}>
        <PageHeader title={t('nav.calendar')} geez="ቀን ዘመን" />

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
        {upcomingFasts.length > 0 ? (
          <SectionBlock headerKey="upcomingFasts">
            <UpcomingFasts fasts={upcomingFasts} contentOnly />
          </SectionBlock>
        ) : null}
        <SectionBlock headerKey="upcomingFeasts">
          <UpcomingFeasts feasts={upcomingFeasts} onPressFeast={handleFeastPress} contentOnly />
        </SectionBlock>
      </ScreenScrollView>

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
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Space.s16,
  },
});
