import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  CalendarRailCard,
  CALENDAR_RAIL_SCROLL_CONTENT,
} from '@/components/calendar/calendar-rail-card';
import { getFeastRailAccent } from '@/lib/calendar-visual';
import { BookshelfSection } from '@/components/read/bookshelf-section';
import { ShelfSubsectionHeader } from '@/components/read/shelf-subsection-header';
import {
  HorizontalScrollIndicator,
  useHorizontalScrollIndicator,
} from '@/components/ui/scroll-indicator';
import { useTranslation } from '@/hooks/use-translation';
import { calendarRailLabels, formatGregorianDateShort } from '@/lib/calendar-i18n';
import type { UpcomingFeast } from '@/data/orthodoxCalendar';
import { Space } from '@/constants/theme';

type UpcomingFeastsProps = {
  feasts: UpcomingFeast[];
  title: string;
  onPressFeast?: (feast: UpcomingFeast) => void;
};

export const UpcomingFeasts = memo(function UpcomingFeasts({
  feasts,
  title,
  onPressFeast,
}: UpcomingFeastsProps) {
  const { t, mode } = useTranslation();
  const { values, scrollHandler, onLayout, onContentSizeChange } = useHorizontalScrollIndicator();

  if (feasts.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <ShelfSubsectionHeader title={title} />

      <BookshelfSection
        horizontal
        scrollProps={{
          onScroll: scrollHandler,
          onLayout,
          onContentSizeChange,
          contentContainerStyle: CALENDAR_RAIL_SCROLL_CONTENT,
        }}>
        {feasts.map((feast) => {
          const accent = getFeastRailAccent(feast.type);
          const feastKey = `${feast.date.getFullYear()}-${feast.month}-${feast.day}-${feast.nameEn}`;
          const labels = calendarRailLabels(feast.nameEn, feast.nameGeez, mode);

          return (
            <CalendarRailCard
              key={feastKey}
              title={labels.title}
              subtitle={labels.subtitle}
              meta={formatGregorianDateShort(feast.date, mode)}
              statusLabel={
                feast.daysRemaining === 0
                  ? t('calendar.today')
                  : t('calendar.daysRemaining', { count: feast.daysRemaining })
              }
              statusActive={feast.daysRemaining <= 7}
              accentColor={accent.accentColor}
              icon={accent.icon}
              panelTint={accent.panelTint}
              onPress={onPressFeast ? () => onPressFeast(feast) : undefined}
            />
          );
        })}
      </BookshelfSection>

      {feasts.length > 2 ? (
        <View style={styles.hint}>
          <HorizontalScrollIndicator values={values} />
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Space.s12,
  },
  hint: {
    marginTop: Space.s8,
  },
});
