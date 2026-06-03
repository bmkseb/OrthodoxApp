import { Keyboard, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { MezmurSongRow } from '@/components/listen/mezmur-song-row';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { ScrollIndicator, useScrollIndicator } from '@/components/ui/scroll-indicator';
import { BorderRadius, Layout, Palette, Space, Spacing } from '@/constants/theme';
import { SacredImagery } from '@/constants/sacred-imagery';
import type { ListenRecentSearchEntry, ListenRecentSearchKind } from '@/hooks/use-listen-recent-searches';

const KIND_LABEL: Record<ListenRecentSearchKind, string> = {
  query: 'Search',
  song: 'Song',
  playlist: 'Playlist',
  channel: 'Channel',
  sermon: 'Sermon',
  video: 'Video',
  melody: 'Chant',
};

function entrySubtitle(entry: ListenRecentSearchEntry): string {
  if (entry.subtitle) return entry.subtitle;
  return KIND_LABEL[entry.kind];
}

function entryThumbnail(entry: ListenRecentSearchEntry): string | undefined {
  if (entry.thumbnailUrl) return entry.thumbnailUrl;
  if (entry.kind === 'query') return undefined;
  return SacredImagery.listenHymns;
}

type ListenRecentSearchesPanelProps = {
  entries: ListenRecentSearchEntry[];
  onPressEntry: (entry: ListenRecentSearchEntry) => void;
  onRemoveEntry: (id: string) => void;
  onClearAll: () => void;
  bottomInset: number;
  showScrollIndicator?: boolean;
};

export function ListenRecentSearchesPanel({
  entries,
  onPressEntry,
  onRemoveEntry,
  onClearAll,
  bottomInset,
  showScrollIndicator = false,
}: ListenRecentSearchesPanelProps) {
  const { values, scrollHandler, onLayout, onContentSizeChange } = useScrollIndicator();

  return (
    <View style={styles.root}>
      <ThemedText style={styles.heading}>Recent Searches</ThemedText>

      {entries.length === 0 ? (
        <ThemedText type="muted" style={styles.empty}>
          Your recent searches will appear here.
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
                  <MezmurSongRow
                    title={entry.title}
                    subtitle={entrySubtitle(entry)}
                    thumbnailUrl={entryThumbnail(entry)}
                    onPress={() => {
                      Keyboard.dismiss();
                      onPressEntry(entry);
                    }}
                    onRemove={() => onRemoveEntry(entry.id)}
                    removeIcon="close"
                    removeLabel={`Remove ${entry.title} from recent searches`}
                  />
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
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Layout.cardBorder,
    marginLeft: 68,
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
