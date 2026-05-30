import { type ReactNode, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { Layout, Palette, Space, Typography } from '@/constants/theme';

type CollapsibleSectionProps = {
  title: string;
  icon?: IconName;
  defaultOpen?: boolean;
  children: ReactNode;
};

/** Section header that expands/collapses its content, matching the app's section style. */
export function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.container}>
      <OrthodoxPressable
        style={styles.header}
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={title}>
        <View style={styles.titleRow}>
          {icon ? (
            <View style={styles.iconRail}>
              <Icon name={icon} size={17} />
            </View>
          ) : null}
          <ThemedText style={styles.title} numberOfLines={1}>
            {title}
          </ThemedText>
        </View>
        <View style={open ? undefined : styles.chevronClosed}>
          <Icon name="chevron-down" size={18} color={Palette.gold} />
        </View>
      </OrthodoxPressable>

      {open ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.sectionContentBottom,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.s8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  iconRail: {
    width: Layout.iconRailWidth,
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    ...Typography.sectionTitle,
    flexShrink: 1,
  },
  chevronClosed: {
    transform: [{ rotate: '-90deg' }],
  },
  content: {
    marginTop: Layout.sectionHeaderBottom,
  },
});
