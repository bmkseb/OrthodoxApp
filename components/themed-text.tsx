import { StyleSheet, Text, type TextProps } from 'react-native';

import { Palette, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | 'default'
    | 'pageTitle'
    | 'sectionHeader'
    | 'cardTitle'
    | 'title'
    | 'defaultSemiBold'
    | 'subtitle'
    | 'link'
    | 'muted'
    | 'seeAll';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const colorKey =
    type === 'muted'
      ? 'muted'
      : type === 'seeAll'
        ? 'seeAll'
        : type === 'link'
          ? 'tint'
          : 'text';

  const color = useThemeColor({ light: lightColor, dark: darkColor }, colorKey);

  return (
    <Text
      style={[
        { color: type === 'muted' ? Palette.muted : color },
        type === 'default' ? styles.default : undefined,
        type === 'pageTitle' ? styles.pageTitle : undefined,
        type === 'sectionHeader' ? styles.sectionHeader : undefined,
        type === 'cardTitle' ? styles.cardTitle : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'muted' ? styles.muted : undefined,
        type === 'seeAll' ? styles.seeAll : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: Typography.body,
  pageTitle: Typography.pageTitle,
  sectionHeader: Typography.sectionHeader,
  cardTitle: Typography.cardTitle,
  defaultSemiBold: {
    ...Typography.body,
    fontWeight: '600',
  },
  title: Typography.pageTitle,
  subtitle: Typography.subtitle,
  link: Typography.body,
  muted: Typography.subtitle,
  seeAll: Typography.subtitle,
});
