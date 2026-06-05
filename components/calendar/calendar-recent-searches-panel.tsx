import { Keyboard, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { ScrollIndicator, useScrollIndicator } from '@/components/ui/scroll-indicator';
import { BorderRadius, Layout, Palette, Space, Spacing } from '@/constants/theme';
import type { CalendarRecentSearchEntry } from '@/hooks/use-calendar-recent-searches';

const KIND_LABEL: Record<CalendarRecentSearchEntry['kind'], string> = {
  query: 'Search',
  feast: 'Feast',
  fasting: 'Fasting',
};

function entrySubtitle(entry: CalendarRecentSearchEntry): string {
  if (entry.subtitle) return entry.subtitle;
  return KIND_LABEL[entry.kind];
}

type CalendarRecentSearchesPanelProps = {
  entries: CalendarRecentSearchEntry[];
  onPressEntry: (entry: CalendarRecentSearchEntry) => void;
  onRemoveEntry: (id: string) => void;
  onClearAll: () => void;
  bottomInset: number;
  showScrollIndicator?: boolean;
};

export function CalendarRecentSearchesPanel({
  entries,
  onPressEntry,
  onRemoveEntry,
  onClearAll,
  bottomInset,
  showScrollIndicator = false,
}: CalendarRecentSearchesPanelProps) {
  const { values, scrollHandler, onLayout, onContentSizeChange } = useScrollIndicator();

  return (
    <View style={styles.root}>
      <ThemedText style={styles.heading}>Recent Searches</ThemedText>

      {entries.length === 0 ? (
        <ThemedText type="muted" style={styles.empty}>
          Your recent feast and fasting searches will appear here.
        </ThemedText>
      ) : (
        <View style={styles.listShell} onLayout={onLayout}>
          <Animated.ScrollView
            style={styles.listScroll}
            contentContainerStyle={{ paddingBottom: bottomInset }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            onContentSizeChange={onContentSizeChange}>
            <View style={styles.list}>
              {entries.map((entry, index) => (
                <View key={entry.id}>
                  <OrthodoxPressable
                    style={styles.row}
                    onPress={() => {
                      Keyboard.dismiss();
                      onPressEntry(entry);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${entry.title}. ${entrySubtitle(entry)}`}>
                    <View style={styles.iconWrap}>
                      <Icon
                        name={entry.kind === 'query' ? 'search' : 'calendar'}
                        size={16}
                        color={Palette.gold}
                      />
                    </View>
                    <View style={styles.textWrap}>
                      <ThemedText style={styles.title} numberOfLines={2}>
                        {entry.title}
                      </ThemedText>
                      <ThemedText type="muted" style={styles.subtitle} numberOfLines={1}>
                        {entrySubtitle(entry)}
                      </ThemedText>
                    </View>
                    <OrthodoxPressable
                      style={styles.removeBtn}
                      onPress={() => onRemoveEntry(entry.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${entry.title} from recent searches`}>
                      <Icon name="close" size={14} color={Palette.muted} />
                    </OrthodoxPressable>
                  </OrthodoxPressable>
                  {index < entries.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
            </View>

            <View style={styles.clearWrap}>
              <OrthodoxPressable
                style={styles.clearBtn}
                onPress={onClearAll}
                accessibilityRole="button"
                accessibilityLabel="Clear recent searches">
                <ThemedText style={styles.clearLabel}>Clear Recent Searches</ThemedText>
              </OrthodoxPressable>
            </View>
          </Animated.ScrollView>

          {showScrollIndicator ? (
            <ScrollIndicator
              values={values}
              persistent
              trackRight={-Layout.pagePadding + 4}
            />
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
  },
  heading: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Palette.mutedGold,
    marginBottom: Space.s12,
  },
  empty: {
    fontSize: 14,
    lineHeight: 21,
    paddingTop: Space.s8,
  },
  listShell: {
    flex: 1,
    minHeight: 0,
    overflow: 'visible',
  },
  listScroll: {
    flex: 1,
  },
  list: {
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s12,
    paddingVertical: Space.s12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 147, 58, 0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorder,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  removeBtn: {
    padding: Space.s8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Layout.cardBorder,
    marginLeft: 52,
  },
  clearWrap: {
    alignItems: 'center',
    marginTop: Space.s8,
  },
  clearBtn: {
    paddingVertical: Spacing.xs + 1,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorder,
    backgroundColor: 'rgba(30, 26, 20, 0.6)',
  },
  clearLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Palette.mutedGold,
    lineHeight: 16,
  },
});
