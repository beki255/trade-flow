import React from 'react';
import Svg, { Path, Rect, Circle, Line, Polygon } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const TruckIcon: React.FC<IconProps> = ({ size = 16, color = '#0284C7' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 6a1 1 0 011-1h11a1 1 0 011 1v9H2V6z"
      fill={color}
      opacity={0.15}
    />
    <Path
      d="M2 6a1 1 0 011-1h11a1 1 0 011 1v9H2V6zM15 9h4.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V15H15V9z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <Circle cx="6" cy="18" r="2" stroke={color} strokeWidth="1.8" fill="#FFFFFF" />
    <Circle cx="18" cy="18" r="2" stroke={color} strokeWidth="1.8" fill="#FFFFFF" />
    <Line x1="8" y1="18" x2="16" y2="18" stroke={color} strokeWidth="1.8" />
  </Svg>
);

export const PlayIcon: React.FC<IconProps> = ({ size = 16, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polygon points="6,4 20,12 6,20" fill={color} />
  </Svg>
);

export const PauseIcon: React.FC<IconProps> = ({ size = 16, color = '#B45309' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="6" y="5" width="4" height="14" rx="1.5" fill={color} />
    <Rect x="14" y="5" width="4" height="14" rx="1.5" fill={color} />
  </Svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 16, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 13l4 4L19 7"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const RouteArrowIcon: React.FC<IconProps> = ({ size = 20, color = '#0284C7' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="3" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path
      d="M14 7l5 5-5 5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SpeedometerIcon: React.FC<IconProps> = ({ size = 16, color = '#0284C7' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4a9 9 0 00-9 9c0 3.1 1.6 5.8 4 7.4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M17 20.4c2.4-1.6 4-4.3 4-7.4a9 9 0 00-9-9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Line
      x1="12"
      y1="13"
      x2="16"
      y2="9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Circle cx="12" cy="13" r="1.5" fill={color} />
  </Svg>
);

export const ClockIcon: React.FC<IconProps> = ({ size = 16, color = '#059669' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <Path
      d="M12 7v5l3 3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const RouteIcon: React.FC<IconProps> = ({ size = 16, color = '#7C3AED' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth="2" />
    <Circle cx="18" cy="6" r="3" stroke={color} strokeWidth="2" />
    <Path
      d="M9 18h4a4 4 0 004-4V9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export const ShipperIcon: React.FC<IconProps> = ({ size = 14, color = '#475569' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="4" width="16" height="16" rx="2" stroke={color} strokeWidth="1.8" />
    <Path d="M9 9h6M9 13h6M9 17h3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const WarningIcon: React.FC<IconProps> = ({ size = 16, color = '#EF4444' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3L2 20h20L12 3z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="12" y1="9" x2="12" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="17" r="1" fill={color} />
  </Svg>
);

export const NavigationIcon: React.FC<IconProps> = ({ size = 16, color = '#0284C7' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polygon points="12,2 19,21 12,17 5,21" stroke={color} strokeWidth="2" strokeLinejoin="round" />
  </Svg>
);
