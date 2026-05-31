import { forwardRef, type ReactNode } from 'react';
import { StyleSheet, View, type ScrollViewProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { ScrollIndicator, useScrollIndicator } from '@/components/ui/scroll-indicator';

type ScripturePageScrollProps = ScrollViewProps & {
  children: ReactNode;
  /** Space at the top of the viewport the thumb should stay below (e.g. safe-area inset). */
  trackInsetTop?: number;
  /** Space at the bottom of the viewport the thumb should stay above (e.g. nav bar). */
  trackInsetBottom?: number;
};

/**
 * Scripture scroll view with a custom right-edge position indicator that appears
 * while the reader is scrolling and fades out shortly after scrolling stops.
 */
export const ScripturePageScroll = forwardRef<Animated.ScrollView, ScripturePageScrollProps>(
  function ScripturePageScroll(
    { children, trackInsetTop = 0, trackInsetBottom = 0, onScroll, ...rest },
    ref
  ) {
    const { values, scrollHandler } = useScrollIndicator();

    return (
      <View style={styles.root}>
        <Animated.ScrollView {...rest} ref={ref} onScroll={scrollHandler} scrollEventThrottle={16}>
          {children}
        </Animated.ScrollView>

        <ScrollIndicator
          values={values}
          trackInsetTop={trackInsetTop}
          trackInsetBottom={trackInsetBottom}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
