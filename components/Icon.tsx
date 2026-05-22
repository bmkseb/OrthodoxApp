import React from 'react';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

import { Palette } from '@/constants/theme';

export type IconName =
  | 'brain'
  | 'music'
  | 'book'
  | 'calendar'
  | 'pillar'
  | 'scroll'
  | 'sparkle'
  | 'cross'
  | 'sun'
  | 'church'
  | 'moon'
  | 'bookmark'
  | 'share'
  | 'globe'
  | 'flame'
  | 'play'
  | 'pause'
  | 'skip-back'
  | 'skip-forward'
  | 'chevron-left'
  | 'chevron-right'
  | 'search'
  | 'close';

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
};

const STROKE = 1.5;

function IconPaths({ name, color }: { name: IconName; color: string }) {
  const strokeProps = {
    stroke: color,
    strokeWidth: STROKE,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  switch (name) {
    case 'brain':
      return (
        <>
          <Path d="M9 4.5c-2 0-3.5 1.5-3.5 3.5 0 .8.3 1.5.8 2-1 .5-1.8 1.5-1.8 2.8 0 1.7 1.3 3.2 3 3.2" {...strokeProps} />
          <Path d="M9 4.5c2 0 3.5 1.5 3.5 3.5 0 .8-.3 1.5-.8 2 1 .5 1.8 1.5 1.8 2.8 0 1.7-1.3 3.2-3 3.2" {...strokeProps} />
          <Path d="M9 6.5v5" {...strokeProps} />
        </>
      );
    case 'music':
      return (
        <>
          <Path d="M12 3.5v9.5" {...strokeProps} />
          <Path d="M12 3.5l-4.5 1.5v6.5" {...strokeProps} />
          <Circle cx="7.5" cy="13.5" r="2" {...strokeProps} />
          <Circle cx="12" cy="12.5" r="2" {...strokeProps} />
        </>
      );
    case 'book':
      return (
        <>
          <Path d="M4.5 4.5h4.5c1.2 0 2.2 1 2.2 2.2v9.3H6.7c-1.2 0-2.2-1-2.2-2.2V4.5z" {...strokeProps} />
          <Path d="M13.5 4.5H9c-1.2 0-2.2 1-2.2 2.2v9.3h4.5c1.2 0 2.2-1 2.2-2.2V4.5z" {...strokeProps} />
        </>
      );
    case 'calendar':
      return (
        <>
          <Rect x="3.5" y="5" width="11" height="10" rx="1.5" {...strokeProps} />
          <Line x1="3.5" y1="8" x2="14.5" y2="8" {...strokeProps} />
          <Line x1="6.5" y1="3" x2="6.5" y2="6.5" {...strokeProps} />
          <Line x1="11.5" y1="3" x2="11.5" y2="6.5" {...strokeProps} />
        </>
      );
    case 'pillar':
      return (
        <>
          <Path d="M6 4.5h6v1.5H6z" {...strokeProps} />
          <Path d="M7 6v8.5" {...strokeProps} />
          <Path d="M11 6v8.5" {...strokeProps} />
          <Path d="M5.5 14.5h7v1H5.5z" {...strokeProps} />
        </>
      );
    case 'scroll':
      return (
        <>
          <Path d="M5 5.5c0-1.1.9-2 2-2h5c1.7 0 3 1.3 3 3v7.5c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V5.5z" {...strokeProps} />
          <Path d="M7 3.5c-1.1 0-2 .9-2 2" {...strokeProps} />
          <Line x1="8" y1="7.5" x2="12" y2="7.5" {...strokeProps} />
          <Line x1="8" y1="10" x2="12" y2="10" {...strokeProps} />
        </>
      );
    case 'sparkle':
      return (
        <>
          <Path d="M9 2.5v3" {...strokeProps} />
          <Path d="M9 12.5v3" {...strokeProps} />
          <Path d="M2.5 9h3" {...strokeProps} />
          <Path d="M12.5 9h3" {...strokeProps} />
          <Path d="M4.8 4.8l2.1 2.1" {...strokeProps} />
          <Path d="M11.1 11.1l2.1 2.1" {...strokeProps} />
          <Path d="M13.2 4.8l-2.1 2.1" {...strokeProps} />
          <Path d="M6.9 11.1l-2.1 2.1" {...strokeProps} />
        </>
      );
    case 'cross':
      return (
        <>
          <Path d="M9 3v12" {...strokeProps} />
          <Path d="M5.5 6.5h7" {...strokeProps} />
          <Path d="M6.5 4.5h5" {...strokeProps} />
        </>
      );
    case 'sun':
      return (
        <>
          <Circle cx="9" cy="9" r="3" {...strokeProps} />
          <Line x1="9" y1="2" x2="9" y2="4" {...strokeProps} />
          <Line x1="9" y1="14" x2="9" y2="16" {...strokeProps} />
          <Line x1="2" y1="9" x2="4" y2="9" {...strokeProps} />
          <Line x1="14" y1="9" x2="16" y2="9" {...strokeProps} />
          <Line x1="4" y1="4" x2="5.5" y2="5.5" {...strokeProps} />
          <Line x1="12.5" y1="12.5" x2="14" y2="14" {...strokeProps} />
          <Line x1="14" y1="4" x2="12.5" y2="5.5" {...strokeProps} />
          <Line x1="5.5" y1="12.5" x2="4" y2="14" {...strokeProps} />
        </>
      );
    case 'church':
      return (
        <>
          <Path d="M9 2.5v3" {...strokeProps} />
          <Path d="M7 5.5h4" {...strokeProps} />
          <Path d="M5.5 7.5h7v7H5.5z" {...strokeProps} />
          <Path d="M8 10.5h2v4H8z" {...strokeProps} />
        </>
      );
    case 'moon':
      return <Path d="M12.5 4.5a5.5 5.5 0 1 0 0 9 4.5 4.5 0 1 1 0-9z" {...strokeProps} />;
    case 'bookmark':
      return <Path d="M5.5 3.5h7v11l-3.5-2-3.5 2V3.5z" {...strokeProps} />;
    case 'share':
      return (
        <>
          <Circle cx="13" cy="5" r="2" {...strokeProps} />
          <Circle cx="5" cy="9" r="2" {...strokeProps} />
          <Circle cx="13" cy="13" r="2" {...strokeProps} />
          <Line x1="6.8" y1="8" x2="11.2" y2="6" {...strokeProps} />
          <Line x1="6.8" y1="10" x2="11.2" y2="12" {...strokeProps} />
        </>
      );
    case 'globe':
      return (
        <>
          <Circle cx="9" cy="9" r="6.5" {...strokeProps} />
          <Path d="M2.5 9h13" {...strokeProps} />
          <Path d="M9 2.5c2 2 2 11 0 13" {...strokeProps} />
          <Path d="M9 2.5c-2 2-2 11 0 13" {...strokeProps} />
        </>
      );
    case 'flame':
      return (
        <>
          <Path d="M9 3.5c1 2 2.5 3 2.5 5.5a2.5 2.5 0 1 1-5 0c0-1.5 1-2.5 2.5-5.5z" {...strokeProps} />
          <Path d="M9 10.5c.8.8 1.2 1.5 1.2 2.2a1.2 1.2 0 1 1-2.4 0c0-.7.4-1.4 1.2-2.2z" {...strokeProps} />
        </>
      );
    case 'play':
      return <Path d="M7 5.5l6 3.5-6 3.5V5.5z" fill={color} />;
    case 'pause':
      return (
        <>
          <Line x1="7" y1="5.5" x2="7" y2="12.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Line x1="11" y1="5.5" x2="11" y2="12.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </>
      );
    case 'skip-back':
      return (
        <>
          <Path d="M13.5 5.5v7" {...strokeProps} />
          <Path d="M11 9l-5.5 3.5V5.5L11 9z" fill={color} />
        </>
      );
    case 'skip-forward':
      return (
        <>
          <Path d="M4.5 5.5v7" {...strokeProps} />
          <Path d="M7 9l5.5 3.5V5.5L7 9z" fill={color} />
        </>
      );
    case 'chevron-left':
      return <Polyline points="11.5,4.5 6.5,9 11.5,13.5" {...strokeProps} />;
    case 'chevron-right':
      return <Polyline points="6.5,4.5 11.5,9 6.5,13.5" {...strokeProps} />;
    case 'search':
      return (
        <>
          <Circle cx="8" cy="8" r="4.5" {...strokeProps} />
          <Line x1="11.5" y1="11.5" x2="14.5" y2="14.5" {...strokeProps} />
        </>
      );
    case 'close':
      return (
        <>
          <Line x1="5.5" y1="5.5" x2="12.5" y2="12.5" {...strokeProps} />
          <Line x1="12.5" y1="5.5" x2="5.5" y2="12.5" {...strokeProps} />
        </>
      );
    default:
      return null;
  }
}

export function Icon({ name, size = 18, color = Palette.gold }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <IconPaths name={name} color={color} />
    </Svg>
  );
}
