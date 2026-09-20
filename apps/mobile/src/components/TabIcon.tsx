import React from 'react';
import Svg, { Path, Rect, Circle, G } from 'react-native-svg';

export type TabIconName =
  | 'overview'
  | 'fleet'
  | 'loads'
  | 'bidding'
  | 'earnings'
  | 'trip'
  | 'nav'
  | 'checkin'
  | 'incident'
  | 'pod';

interface TabIconProps {
  name: TabIconName;
  active?: boolean;
  size?: number;
  color?: string;
}

export const TabIcon: React.FC<TabIconProps> = ({
  name,
  active = false,
  size = 22,
  color = active ? '#0284C7' : '#94A3B8',
}) => {
  switch (name) {
    // 1. TRANSPORTER: Overview (4-Grid Dashboard)
    case 'overview':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {active ? (
            <>
              <Rect x="3" y="3" width="7.5" height="7.5" rx="2" fill={color} />
              <Rect x="13.5" y="3" width="7.5" height="7.5" rx="2" fill={color} />
              <Rect x="3" y="13.5" width="7.5" height="7.5" rx="2" fill={color} />
              <Rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" fill={color} />
            </>
          ) : (
            <>
              <Rect x="3" y="3" width="7.5" height="7.5" rx="2" stroke={color} strokeWidth="1.8" />
              <Rect x="13.5" y="3" width="7.5" height="7.5" rx="2" stroke={color} strokeWidth="1.8" />
              <Rect x="3" y="13.5" width="7.5" height="7.5" rx="2" stroke={color} strokeWidth="1.8" />
              <Rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" stroke={color} strokeWidth="1.8" />
            </>
          )}
        </Svg>
      );

    // 2. TRANSPORTER: Fleet (Commercial Heavy Truck)
    case 'fleet':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {active ? (
            <>
              {/* Truck Cargo Body */}
              <Path
                d="M2 5.5A1.5 1.5 0 0 1 3.5 4h10A1.5 1.5 0 0 1 15 5.5V14H2V5.5z"
                fill={color}
              />
              {/* Truck Cab */}
              <Path
                d="M15 8h3.382a1.5 1.5 0 0 1 1.28.72l2.059 3.294A1.5 1.5 0 0 1 22 12.786V14h-7V8z"
                fill={color}
              />
              {/* Windshield */}
              <Path
                d="M16.5 9.5H18.8l1.4 2.2H16.5v-2.2z"
                fill="#FFFFFF"
                opacity="0.4"
              />
              {/* Chassis & Wheels */}
              <Circle cx="6.5" cy="17.5" r="2.5" fill={color} />
              <Circle cx="6.5" cy="17.5" r="1" fill="#FFFFFF" />
              <Circle cx="18.5" cy="17.5" r="2.5" fill={color} />
              <Circle cx="18.5" cy="17.5" r="1" fill="#FFFFFF" />
              <Path d="M4 14.5h16" stroke={color} strokeWidth="2" strokeLinecap="round" />
            </>
          ) : (
            <>
              <Path
                d="M2 5.5A1.5 1.5 0 0 1 3.5 4h10A1.5 1.5 0 0 1 15 5.5V14H2V5.5z"
                stroke={color}
                strokeWidth="1.8"
              />
              <Path
                d="M15 8h3.382a1.5 1.5 0 0 1 1.28.72l2.059 3.294A1.5 1.5 0 0 1 22 12.786V14h-7V8z"
                stroke={color}
                strokeWidth="1.8"
              />
              <Circle cx="6.5" cy="17.5" r="2.2" stroke={color} strokeWidth="1.8" />
              <Circle cx="18.5" cy="17.5" r="2.2" stroke={color} strokeWidth="1.8" />
              <Path d="M9 16h7" stroke={color} strokeWidth="1.8" />
            </>
          )}
        </Svg>
      );

    // 3. TRANSPORTER: Loads (3D Cargo Freight Cube)
    case 'loads':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {active ? (
            <>
              <Path d="M12 2L3 7l9 5 9-5-9-5z" fill={color} opacity="0.85" />
              <Path d="M3 7v10l9 5V12L3 7z" fill={color} opacity="0.7" />
              <Path d="M21 7v10l-9 5V12l9-5z" fill={color} />
              <Path d="M12 12l9-5M12 12L3 7M12 12v10" stroke="#FFFFFF" strokeWidth="1" opacity="0.4" />
            </>
          ) : (
            <>
              <Path
                d="M12 2L3 7l9 5 9-5-9-5z"
                stroke={color}
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <Path
                d="M3 7v10l9 5 9-5V7"
                stroke={color}
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <Path d="M12 12v10" stroke={color} strokeWidth="1.8" />
            </>
          )}
        </Svg>
      );

    // 4. TRANSPORTER: My Bids (Price Tags / Quotation)
    case 'bidding':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {active ? (
            <>
              {/* Back Tag */}
              <Path
                d="M20.5 11.5L13.5 18.5A2.12 2.12 0 0 1 10.5 18.5L7 15l8-8h4v4l1.5 1.5a1.41 1.41 0 0 1 0 2z"
                fill={color}
                opacity="0.4"
              />
              {/* Front Tag */}
              <Path
                d="M17.5 9.5L10.5 16.5A2.12 2.12 0 0 1 7.5 16.5L3 12V4h8l6.5 6.5a1.41 1.41 0 0 1 0 2z"
                fill={color}
              />
              <Circle cx="6.5" cy="7.5" r="1.5" fill="#FFFFFF" />
            </>
          ) : (
            <>
              <Path
                d="M19 10.5L11.5 18A2.12 2.12 0 0 1 8.5 18L3 12.5V4h8.5l7.5 7.5a1.41 1.41 0 0 1 0 2z"
                stroke={color}
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <Circle cx="7.5" cy="7.5" r="1.5" stroke={color} strokeWidth="1.5" />
            </>
          )}
        </Svg>
      );

    // 5. TRANSPORTER: Earnings (Financial Wallet)
    case 'earnings':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {active ? (
            <>
              <Path
                d="M3 7.5A2.5 2.5 0 0 1 5.5 5h14A1.5 1.5 0 0 1 21 6.5V8H4.5A1.5 1.5 0 0 0 3 9.5v8A2.5 2.5 0 0 0 5.5 20h14a1.5 1.5 0 0 0 1.5-1.5V11H16a3 3 0 0 0-3 3v0a3 3 0 0 0 3 3h5v-6H16a1 1 0 0 1-1-1v0a1 1 0 0 1 1-1h5V6.5A2.5 2.5 0 0 0 18.5 4h-13A2.5 2.5 0 0 0 3 6.5v1z"
                fill={color}
              />
              {/* Clasp */}
              <Path
                d="M16 11h5a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-5a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2z"
                fill={color}
              />
              <Circle cx="18" cy="13" r="1" fill="#FFFFFF" />
            </>
          ) : (
            <>
              <Path
                d="M4 6.5A2.5 2.5 0 0 1 6.5 4h13A1.5 1.5 0 0 1 21 5.5V18a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18V6.5z"
                stroke={color}
                strokeWidth="1.8"
              />
              <Path
                d="M16 11h5v4h-5a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2z"
                stroke={color}
                strokeWidth="1.8"
              />
              <Circle cx="18" cy="13" r="1" fill={color} />
            </>
          )}
        </Svg>
      );

    // 6. DRIVER: Trip (Corridor Route Map)
    case 'trip':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {active ? (
            <>
              <Path
                d="M3 6.5l6-3 6 3 6-3v14l-6 3-6-3-6 3V6.5z"
                fill={color}
                opacity="0.25"
              />
              <Path
                d="M3 6.5l6-3 6 3 6-3v14l-6 3-6-3-6 3V6.5z"
                stroke={color}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <Path d="M9 3.5v14M15 6.5v14" stroke={color} strokeWidth="1.8" />
              {/* Route Waypoint Dot */}
              <Circle cx="12" cy="11" r="2.5" fill={color} />
              <Circle cx="12" cy="11" r="1" fill="#FFFFFF" />
            </>
          ) : (
            <>
              <Path
                d="M3 6.5l6-3 6 3 6-3v14l-6 3-6-3-6 3V6.5z"
                stroke={color}
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <Path d="M9 3.5v14M15 6.5v14" stroke={color} strokeWidth="1.8" />
            </>
          )}
        </Svg>
      );

    // 7. DRIVER: Route / Navigation Compass
    case 'nav':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
          {active ? (
            <>
              {/* North Needle */}
              <Path d="M12 5.5l3 6.5-3-1.5-3 1.5 3-6.5z" fill={color} />
              {/* South Needle */}
              <Path d="M12 18.5l-3-6.5 3 1.5 3-1.5-3 6.5z" fill={color} opacity="0.4" />
              <Circle cx="12" cy="12" r="1.5" fill="#FFFFFF" />
            </>
          ) : (
            <>
              <Path
                d="M12 6l2.5 6-2.5-1.2-2.5 1.2L12 6z"
                stroke={color}
                strokeWidth="1.5"
                fill="none"
              />
              <Path
                d="M12 18l-2.5-6 2.5 1.2 2.5-1.2L12 18z"
                stroke={color}
                strokeWidth="1.5"
                fill="none"
              />
              <Circle cx="12" cy="12" r="1" fill={color} />
            </>
          )}
        </Svg>
      );

    // 8. DRIVER: Check-in (Location Pin with Checkmark)
    case 'checkin':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {active ? (
            <>
              <Path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                fill={color}
              />
              {/* White Checkmark */}
              <Path
                d="M9.5 9.5l1.8 1.8 3.5-3.5"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            <>
              <Path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                stroke={color}
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <Path
                d="M9.5 9.5l1.8 1.8 3.5-3.5"
                stroke={color}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}
        </Svg>
      );

    // 9. DRIVER: Incident (Alert Shield / Warning)
    case 'incident':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {active ? (
            <>
              <Path
                d="M12 2.5L2.5 19.5a1.5 1.5 0 0 0 1.3 2.25h16.4a1.5 1.5 0 0 0 1.3-2.25L12 2.5z"
                fill={color}
              />
              <Path d="M12 8.5v5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
              <Circle cx="12" cy="16.5" r="1.2" fill="#FFFFFF" />
            </>
          ) : (
            <>
              <Path
                d="M12 3L3 19.5h18L12 3z"
                stroke={color}
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <Path d="M12 9v4.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
              <Circle cx="12" cy="16.5" r="1" fill={color} />
            </>
          )}
        </Svg>
      );

    // 10. DRIVER: e-POD (Proof of Delivery / Signed Document)
    case 'pod':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {active ? (
            <>
              {/* Document Base */}
              <Path
                d="M6 2.5A1.5 1.5 0 0 0 4.5 4v16A1.5 1.5 0 0 0 6 21.5h12a1.5 1.5 0 0 0 1.5-1.5V8.5L14 3H6z"
                fill={color}
              />
              {/* Corner Fold */}
              <Path d="M14 3v5.5h5.5" fill="#FFFFFF" opacity="0.3" />
              {/* Signature Checkmark */}
              <Path
                d="M8.5 14.5l2.2 2.2 4.8-4.8"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            <>
              <Path
                d="M6 2.5A1.5 1.5 0 0 0 4.5 4v16A1.5 1.5 0 0 0 6 21.5h12a1.5 1.5 0 0 0 1.5-1.5V8.5L14 3H6z"
                stroke={color}
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <Path d="M14 3v5.5h5.5" stroke={color} strokeWidth="1.8" />
              <Path
                d="M8.5 14.5l2.2 2.2 4.8-4.8"
                stroke={color}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}
        </Svg>
      );

    default:
      return null;
  }
};
