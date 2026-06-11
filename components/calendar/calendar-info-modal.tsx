import { useMemo, useState, type ReactNode } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CalendarLegendPreview } from '@/components/calendar/calendar-legend-preview';
import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { useTranslation } from '@/hooks/use-translation';
import { getEthiopianMonthName } from '@/lib/calendar-i18n';
import { CALENDAR_VISUAL } from '@/lib/calendar-visual';
import type { TranslationKey } from '@/lib/translations';
import {
  DAYS_OF_WEEK,
  ETHIOPIAN_MONTHS,
  EVANGELIST_CYCLE,
  LITURGICAL_GUIDE_SECTIONS,
  LITURGICAL_GUIDE_LINK,
  LITURGICAL_GUIDE_SOURCE,
  MONTHLY_FEAST_DAYS,
  NATIONAL_RELIGIOUS_FEASTS,
  type LiturgicalGuideSection,
} from '@/lib/calendar-liturgical-guide';
import { BorderRadius, Layout, Opacity, Palette, Space } from '@/constants/theme';

type CalendarInfoModalProps = {
  visible: boolean;
  onClose: () => void;
};

type LegendItem = {
  id: string;
  titleKey: TranslationKey;
  detailKey: TranslationKey;
  preview: ReactNode;
};

function GuideAccordion({
  section,
  expanded,
  onToggle,
}: {
  section: LiturgicalGuideSection;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.accordion}>
      <OrthodoxPressable style={styles.accordionHeader} onPress={onToggle}>
        <Text style={styles.accordionTitle}>{section.title}</Text>
        <Icon name={expanded ? 'chevron-down' : 'chevron-right'} size={16} color={Palette.muted} />
      </OrthodoxPressable>
      {expanded ? (
        <View style={styles.accordionBody}>
          {section.paragraphs?.map((paragraph) => (
            <Text key={paragraph.slice(0, 40)} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
          {section.bullets?.map((group) => (
            <View key={group.label ?? group.items[0]} style={styles.bulletGroup}>
              {group.label ? <Text style={styles.bulletLabel}>{group.label}</Text> : null}
              {group.items.map((item) => (
                <View key={item} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function CalendarInfoModal({ visible, onClose }: CalendarInfoModalProps) {
  const { t, mode } = useTranslation();
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>('calendar');
  const legendItems = useMemo<LegendItem[]>(
    () => [
      {
        id: 'day-labels',
        titleKey: 'calendar.legendDayLabels',
        detailKey: 'calendar.legendDayLabelsDetail',
        preview: <CalendarLegendPreview dayLabel="15" ethiopianLabel="Tahsas 8" />,
      },
      {
        id: 'today',
        titleKey: 'calendar.legendToday',
        detailKey: 'calendar.legendTodayDetail',
        preview: (
          <CalendarLegendPreview
            today
            todayOnCell
            dayLabel="31"
            ethiopianLabel="25"
          />
        ),
      },
      {
        id: 'major-lord',
        titleKey: 'calendar.legendMajorLord',
        detailKey: 'calendar.legendMajorLordDetail',
        preview: (
          <CalendarLegendPreview
            feastBg={CALENDAR_VISUAL.majorLordBg}
            dotColor={CALENDAR_VISUAL.dotGold}
          />
        ),
      },
      {
        id: 'major-mary',
        titleKey: 'calendar.legendMajorMary',
        detailKey: 'calendar.legendMajorMaryDetail',
        preview: (
          <CalendarLegendPreview
            feastBg={CALENDAR_VISUAL.majorMaryBg}
            dotColor={CALENDAR_VISUAL.dotBlue}
          />
        ),
      },
      {
        id: 'marian',
        titleKey: 'calendar.legendMarian',
        detailKey: 'calendar.legendMarianDetail',
        preview: <CalendarLegendPreview dotColor={CALENDAR_VISUAL.dotBlue} ethiopianLabel="21" />,
      },
      {
        id: 'angel',
        titleKey: 'calendar.legendAngel',
        detailKey: 'calendar.legendAngelDetail',
        preview: <CalendarLegendPreview dotColor={CALENDAR_VISUAL.dotPurple} ethiopianLabel="12" />,
      },
      {
        id: 'other-feast',
        titleKey: 'calendar.legendOtherFeast',
        detailKey: 'calendar.legendOtherFeastDetail',
        preview: <CalendarLegendPreview dotColor={CALENDAR_VISUAL.dotGold} ethiopianLabel="7" />,
      },
      {
        id: 'seasonal-fast',
        titleKey: 'calendar.legendSeasonalFast',
        detailKey: 'calendar.legendSeasonalFastDetail',
        preview: <CalendarLegendPreview fastSeason />,
      },
      {
        id: 'wed-fri',
        titleKey: 'calendar.legendWedFri',
        detailKey: 'calendar.legendWedFriDetail',
        preview: <CalendarLegendPreview fastWeekday />,
      },
      {
        id: 'feast-on-fast',
        titleKey: 'calendar.legendFeastOnFast',
        detailKey: 'calendar.legendFeastOnFastDetail',
        preview: (
          <CalendarLegendPreview
            feastBg={CALENDAR_VISUAL.majorLordBg}
            dotColor={CALENDAR_VISUAL.dotGold}
            fastSeason
          />
        ),
      },
    ],
    []
  );

  const ethiopianMonthRows = useMemo(
    () =>
      ETHIOPIAN_MONTHS.map((month, index) => ({
        ...month,
        index,
        localizedName: getEthiopianMonthName(index + 1, mode),
      })),
    [mode]
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{t('calendar.infoTitle')}</Text>
            <Text style={styles.subtitle}>{t('calendar.infoSubtitle')}</Text>
          </View>
          <OrthodoxPressable onPress={onClose} style={styles.closeBtn} accessibilityLabel={t('calendar.close')}>
            <Icon name="close" size={20} color={Palette.text} />
          </OrthodoxPressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Space.s32 }]}>
          <Text style={styles.sectionHeading}>{t('calendar.calendarKey')}</Text>
          <View style={styles.card}>
            {legendItems.map((item, index) => (
              <View
                key={item.id}
                style={[styles.legendRow, index < legendItems.length - 1 && styles.legendRowBorder]}>
                {item.preview}
                <View style={styles.legendCopy}>
                  <Text style={styles.legendTitle}>{t(item.titleKey)}</Text>
                  <Text style={styles.legendDetail}>{t(item.detailKey)}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.sectionHeading}>{t('calendar.ethiopianMonths')}</Text>
          <View style={styles.card}>
            {ethiopianMonthRows.map((month) => (
              <View
                key={month.name}
                style={[
                  styles.listRow,
                  month.index < ETHIOPIAN_MONTHS.length - 1 && styles.listRowBorder,
                ]}>
                <Text style={styles.listIndex}>{month.index + 1}.</Text>
                <View style={styles.listCopy}>
                  <Text style={styles.listTitle}>{month.localizedName}</Text>
                  <Text style={styles.listMeta}>{month.period}</Text>
                </View>
              </View>
            ))}
            <Text style={styles.note}>
              Pagumen: 5 days at year end (6 in a leap year). Each year of the four-year cycle is
              dedicated to an Evangelist in order: {EVANGELIST_CYCLE.join(', ')}. The year of Luke is
              the Ethiopian leap year.
            </Text>
          </View>

          <Text style={styles.sectionHeading}>{t('calendar.daysOfWeek')}</Text>
          <View style={styles.card}>
            {DAYS_OF_WEEK.map((entry, index) => (
              <View key={entry.day} style={[styles.listRow, index < DAYS_OF_WEEK.length - 1 && styles.listRowBorder]}>
                <Text style={styles.listTitle}>{entry.day}</Text>
                <Text style={styles.listMeta}>{entry.names}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionHeading}>{t('calendar.monthlyFeastDays')}</Text>
          <View style={styles.card}>
            {MONTHLY_FEAST_DAYS.map((entry, index) => (
              <View
                key={entry.day}
                style={[styles.listRow, index < MONTHLY_FEAST_DAYS.length - 1 && styles.listRowBorder]}>
                <Text style={styles.listIndex}>{entry.day}</Text>
                <Text style={styles.listTitle}>{entry.feast}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionHeading}>{t('calendar.nationalFeasts')}</Text>
          <View style={styles.card}>
            {NATIONAL_RELIGIOUS_FEASTS.map((feast, index) => (
              <View
                key={feast.name}
                style={[styles.listRow, index < NATIONAL_RELIGIOUS_FEASTS.length - 1 && styles.listRowBorder]}>
                <View style={styles.listCopy}>
                  <Text style={styles.listTitle}>{feast.name}</Text>
                  <Text style={styles.listMeta}>{feast.ethiopian}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.sectionHeading}>{t('calendar.liturgicalYear')}</Text>
          {LITURGICAL_GUIDE_SECTIONS.map((section) => (
            <GuideAccordion
              key={section.id}
              section={section}
              expanded={expandedId === section.id}
              onToggle={() => setExpandedId((current) => (current === section.id ? null : section.id))}
            />
          ))}

          <Text style={styles.source}>{LITURGICAL_GUIDE_SOURCE}</Text>
          <Text style={styles.sourceLink}>{LITURGICAL_GUIDE_LINK}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.pagePadding,
    paddingVertical: Space.s16,
    borderBottomWidth: 1,
    borderBottomColor: `rgba(201, 147, 58, ${Opacity.goldBorder})`,
  },
  headerCopy: {
    flex: 1,
    paddingRight: Space.s12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: Palette.mutedGold,
  },
  closeBtn: {
    padding: Space.s8,
  },
  scrollContent: {
    paddingHorizontal: Layout.pagePadding,
    paddingTop: Space.s16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Palette.muted,
    marginBottom: Space.s8,
    marginTop: Space.s8,
  },
  card: {
    backgroundColor: Palette.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: `rgba(201, 147, 58, ${Opacity.goldBorder})`,
    padding: Space.s16,
    marginBottom: Space.s16,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.s12,
    paddingVertical: Space.s8,
  },
  legendRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  legendCopy: {
    flex: 1,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.text,
    marginBottom: 2,
  },
  legendDetail: {
    fontSize: 12,
    lineHeight: 17,
    color: Palette.muted,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s8,
    paddingVertical: Space.s8,
  },
  listRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  listIndex: {
    width: 22,
    fontSize: 13,
    fontWeight: '600',
    color: Palette.gold,
  },
  listCopy: {
    flex: 1,
  },
  listTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Palette.text,
  },
  listMeta: {
    fontSize: 12,
    color: Palette.muted,
    marginTop: 1,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    color: Palette.muted,
    marginTop: Space.s8,
    paddingTop: Space.s8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  accordion: {
    backgroundColor: Palette.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: `rgba(201, 147, 58, ${Opacity.goldBorder})`,
    marginBottom: Space.s8,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.s16,
    paddingVertical: Space.s12,
  },
  accordionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
    paddingRight: Space.s8,
  },
  accordionBody: {
    paddingHorizontal: Space.s16,
    paddingBottom: Space.s16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
    color: Palette.muted,
    marginTop: Space.s12,
  },
  bulletGroup: {
    marginTop: Space.s12,
  },
  bulletLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: Space.s4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.s8,
    marginTop: Space.s4,
  },
  bulletDot: {
    fontSize: 13,
    lineHeight: 20,
    color: Palette.gold,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: Palette.muted,
  },
  source: {
    fontSize: 11,
    lineHeight: 16,
    color: Palette.muted,
    fontStyle: 'italic',
    marginTop: Space.s16,
    marginBottom: Space.s4,
  },
  sourceLink: {
    fontSize: 11,
    lineHeight: 16,
    color: Palette.mutedGold,
    marginBottom: Space.s8,
  },
});
