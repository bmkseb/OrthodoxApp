import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type TabBarPropsContextValue = {
  props: BottomTabBarProps | null;
  syncProps: (next: BottomTabBarProps) => void;
};

const TabBarPropsContext = createContext<TabBarPropsContextValue | null>(null);

export function TabBarPropsProvider({ children }: { children: ReactNode }) {
  const [props, setProps] = useState<BottomTabBarProps | null>(null);

  const syncProps = useCallback((next: BottomTabBarProps) => {
    setProps((prev) => {
      if (
        prev &&
        prev.state.index === next.state.index &&
        prev.state.routes === next.state.routes
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ props, syncProps }), [props, syncProps]);

  return <TabBarPropsContext.Provider value={value}>{children}</TabBarPropsContext.Provider>;
}

/** Mounted inside Tabs `tabBar` — stores props for the root overlay. */
export function TabBarPropsSync(tabProps: BottomTabBarProps) {
  const ctx = useContext(TabBarPropsContext);
  if (!ctx) return null;

  useLayoutEffect(() => {
    ctx.syncProps(tabProps);
  }, [ctx, tabProps]);

  return null;
}

export function useTabBarProps() {
  const ctx = useContext(TabBarPropsContext);
  if (!ctx) throw new Error('useTabBarProps must be used within TabBarPropsProvider');
  return ctx.props;
}
