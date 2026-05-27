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
  | 'search'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'rewind'
  | 'forward'
  | 'heart'
  | 'list'
  | 'play'
  | 'pause'
  | 'skip-back'
  | 'skip-forward'
  | 'close'
  | 'sun'
  | 'church'
  | 'moon'
  | 'bookmark'
  | 'share'
  | 'globe'
  | 'flame';

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

const STROKE = 1.5;

export function Icon({ name, size = 18, color = Palette.gold, strokeWidth = STROKE }: IconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'brain':
      return (
        <Svg {...props}>
          <Path d="M8 5c-2 1-3 3-3 5a4 4 0 0 0 4 4" />
          <Path d="M16 5c2 1 3 3 3 5a4 4 0 0 1-4 4" />
          <Path d="M12 5v14" />
          <Path d="M9 12h6" />
        </Svg>
      );
    case 'music':
      return (
        <Svg {...props}>
          <Path d="M9 18V5l10-2v13" />
          <Circle cx="7" cy="18" r="2" />
          <Circle cx="17" cy="16" r="2" />
        </Svg>
      );
    case 'book':
      return (
        <Svg {...props}>
          <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <Line x1="8" y1="6" x2="16" y2="6" />
          <Line x1="8" y1="10" x2="14" y2="10" />
        </Svg>
      );
    case 'calendar':
      return (
        <Svg {...props}>
          <Rect x="3" y="4" width="18" height="18" rx="2" />
          <Line x1="16" y1="2" x2="16" y2="6" />
          <Line x1="8" y1="2" x2="8" y2="6" />
          <Line x1="3" y1="10" x2="21" y2="10" />
          <Circle cx="8" cy="14" r="0.5" fill={color} stroke="none" />
          <Circle cx="12" cy="14" r="0.5" fill={color} stroke="none" />
          <Circle cx="16" cy="14" r="0.5" fill={color} stroke="none" />
        </Svg>
      );
    case 'pillar':
      return (
        <Svg {...props}>
          <Path d="M8 3h8v3H8z" />
          <Path d="M7 6h10v12H7z" />
          <Path d="M6 18h12v3H6z" />
          <Line x1="12" y1="6" x2="12" y2="18" />
        </Svg>
      );
    case 'scroll':
      return (
        <Svg {...props}>
          <Path d="M6 4h10a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H6" />
          <Path d="M6 4a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3" />
          <Line x1="8" y1="8" x2="14" y2="8" />
          <Line x1="8" y1="12" x2="12" y2="12" />
        </Svg>
      );
    case 'sparkle':
      return (
        <Svg {...props}>
          <Path d="M12 3l1.2 4.2L17.5 8.5l-4.3 1.2L12 14l-1.2-4.3L6.5 8.5l4.3-1.3z" />
          <Path d="M19 14l.6 2.1 2.1.6-2.1.6L19 20l-.6-2.1-2.1-.6 2.1-.6z" />
        </Svg>
      );
    case 'cross':
      return (
        <Svg {...props}>
          <Path d="M12 4v16" />
          <Path d="M7 8h10" />
          <Path d="M9 6l3-2 3 2" />
          <Path d="M9 18l3 2 3-2" />
        </Svg>
      );
    case 'search':
      return (
        <Svg {...props}>
          <Circle cx="11" cy="11" r="7" />
          <Line x1="16.5" y1="16.5" x2="21" y2="21" />
        </Svg>
      );
    case 'chevron-left':
      return (
        <Svg {...props}>
          <Polyline points="15 18 9 12 15 6" />
        </Svg>
      );
    case 'chevron-right':
      return (
        <Svg {...props}>
          <Polyline points="9 18 15 12 9 6" />
        </Svg>
      );
    case 'chevron-down':
      return (
        <Svg {...props}>
          <Polyline points="6 9 12 15 18 9" />
        </Svg>
      );
    case 'rewind':
      return (
        <Svg {...props}>
          <Path d="M11 7v10l-7-5 7-5z" />
          <Path d="M18 7v10l-7-5 7-5z" />
        </Svg>
      );
    case 'forward':
      return (
        <Svg {...props}>
          <Path d="M13 7v10l7-5-7-5z" />
          <Path d="M6 7v10l7-5-7-5z" />
        </Svg>
      );
    case 'heart':
      return (
        <Svg {...props}>
          <Path d="M12 20s-7-4.35-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 15.65 12 20 12 20z" />
        </Svg>
      );
    case 'list':
      return (
        <Svg {...props}>
          <Line x1="8" y1="6" x2="21" y2="6" />
          <Line x1="8" y1="12" x2="21" y2="12" />
          <Line x1="8" y1="18" x2="21" y2="18" />
          <Line x1="3" y1="6" x2="3.01" y2="6" />
          <Line x1="3" y1="12" x2="3.01" y2="12" />
          <Line x1="3" y1="18" x2="3.01" y2="18" />
        </Svg>
      );
    case 'play':
      return (
        <Svg {...props}>
          <Polyline points="9 6 17 12 9 18 9 6" fill={color} />
        </Svg>
      );
    case 'pause':
      return (
        <Svg {...props}>
          <Line x1="9" y1="6" x2="9" y2="18" />
          <Line x1="15" y1="6" x2="15" y2="18" />
        </Svg>
      );
    case 'skip-back':
      return (
        <Svg {...props}>
          <Polyline points="11 6 5 12 11 18" />
          <Line x1="5" y1="6" x2="5" y2="18" />
        </Svg>
      );
    case 'skip-forward':
      return (
        <Svg {...props}>
          <Polyline points="13 6 19 12 13 18" />
          <Line x1="19" y1="6" x2="19" y2="18" />
        </Svg>
      );
    case 'close':
      return (
        <Svg {...props}>
          <Line x1="18" y1="6" x2="6" y2="18" />
          <Line x1="6" y1="6" x2="18" y2="18" />
        </Svg>
      );
    case 'sun':
      return (
        <Svg {...props}>
          <Circle cx="12" cy="12" r="4" />
          <Line x1="12" y1="2" x2="12" y2="5" />
          <Line x1="12" y1="19" x2="12" y2="22" />
          <Line x1="2" y1="12" x2="5" y2="12" />
          <Line x1="19" y1="12" x2="22" y2="12" />
          <Line x1="4.2" y1="4.2" x2="6.3" y2="6.3" />
          <Line x1="17.7" y1="17.7" x2="19.8" y2="19.8" />
          <Line x1="4.2" y1="19.8" x2="6.3" y2="17.7" />
          <Line x1="17.7" y1="6.3" x2="19.8" y2="4.2" />
        </Svg>
      );
    case 'church':
      return (
        <Svg {...props}>
          <Path d="M12 3v4" />
          <Path d="M8 7h8" />
          <Path d="M6 10h12v11H6z" />
          <Path d="M10 14h4v7h-4z" />
        </Svg>
      );
    case 'moon':
      return (
        <Svg {...props}>
          <Path d="M20 14a8 8 0 1 1-8-8 6 6 0 0 0 8 8z" />
        </Svg>
      );
    case 'bookmark':
      return (
        <Svg {...props}>
          <Path d="M6 4h12v16l-6-4-6 4V4z" />
        </Svg>
      );
    case 'share':
      return (
        <Svg {...props}>
          <Path d="M16 8l-8 4 8 4" />
          <Circle cx="6" cy="12" r="2" />
          <Circle cx="18" cy="8" r="2" />
          <Circle cx="18" cy="16" r="2" />
        </Svg>
      );
    case 'globe':
      return (
        <Svg {...props}>
          <Circle cx="12" cy="12" r="9" />
          <Path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </Svg>
      );
    case 'flame':
      return (
        <Svg {...props}>
          <Path d="M12 3c-1 4-4 5-4 9a4 4 0 0 0 8 0c0-3-2.5-4.5-4-9z" />
          <Path d="M12 14v3" opacity={0.5} />
        </Svg>
      );
    default:
      return null;
  }
}
