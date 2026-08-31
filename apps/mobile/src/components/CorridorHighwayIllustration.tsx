import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  G,
  Circle,
  Line,
  Rect,
  Polygon,
} from 'react-native-svg';

export const CorridorHighwayIllustration: React.FC = () => {
  return (
    <View style={styles.container}>
      <Svg
        viewBox="0 0 320 230"
        width="100%"
        height="100%"
        style={{ maxWidth: 320, maxHeight: 230 }}
      >
        <Defs>
          <LinearGradient id="hwyTrailerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#3B82F6" />
            <Stop offset="100%" stopColor="#1D4ED8" />
          </LinearGradient>
          <LinearGradient id="hwyCloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F1F5F9" />
            <Stop offset="100%" stopColor="#E2E8F0" />
          </LinearGradient>
        </Defs>

        {/* Soft Background Cloud Shape */}
        <Path
          d="M 40 40 Q 80 15, 140 25 Q 200 10, 260 30 Q 300 50, 280 90 Q 260 120, 180 115 Q 100 125, 50 90 Q 20 65, 40 40 Z"
          fill="url(#hwyCloudGrad)"
          opacity={0.6}
        />

        {/* Left: Djibouti Flag on Pole */}
        <G x={24} y={35}>
          <Line x1="0" y1="0" x2="0" y2="60" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
          <Circle cx="0" cy="0" r="2" fill="#94A3B8" />

          <G y={2}>
            <Rect x="0" y="0" width="38" height="12" fill="#60A5FA" rx="1" />
            <Rect x="0" y="12" width="38" height="12" fill="#22C55E" rx="1" />
            <Polygon points="0,0 0,24 16,12" fill="#FFFFFF" />
            <Polygon
              points="5.5,12 6.5,9 9.5,9 7,11 8,14 5.5,12 3,14 4,11 1.5,9 4.5,9"
              fill="#EF4444"
              scale={0.75}
            />
          </G>
        </G>

        {/* Right: Ethiopian Flag on Pole */}
        <G x={280} y={35}>
          <Line x1="0" y1="0" x2="0" y2="60" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
          <Circle cx="0" cy="0" r="2" fill="#94A3B8" />

          <G x={-38} y={2}>
            <Rect x="0" y="0" width="38" height="8" fill="#16A34A" rx="1" />
            <Rect x="0" y="8" width="38" height="8" fill="#EAB308" />
            <Rect x="0" y="16" width="38" height="8" fill="#DC2626" rx="1" />
            <Circle cx="16" cy="12" r="4.2" fill="#2563EB" />
            <Circle cx="16" cy="12" r="1.6" fill="#FACC15" />
          </G>
        </G>

        {/* Horizontal Asphalt Highway Track */}
        <Rect x="10" y="155" width="300" height="28" fill="#334155" rx="6" />
        <Line
          x1="18"
          y1="169"
          x2="302"
          y2="169"
          stroke="#FACC15"
          strokeWidth="2.2"
          strokeDasharray="10,12"
        />

        {/* Semi-Truck Assembly */}
        <G x={45} y={98}>
          {/* Shadow under truck */}
          <Rect x="10" y="74" width="220" height="8" fill="#0F172A" opacity={0.3} rx="4" />

          {/* 40ft Container Trailer */}
          <Rect
            x="0"
            y="8"
            width="155"
            height="66"
            fill="url(#hwyTrailerGrad)"
            stroke="#1D4ED8"
            strokeWidth="1.5"
            rx="6"
          />

          {/* Speed / Decal Lines */}
          <G x={16} y={24}>
            <Rect x="0" y="0" width="40" height="3" fill="#93C5FD" opacity={0.6} rx="1.5" />
            <Rect x="0" y="8" width="55" height="3" fill="#FFFFFF" opacity={0.8} rx="1.5" />
            <Rect x="0" y="16" width="32" height="3" fill="#93C5FD" opacity={0.6} rx="1.5" />
          </G>

          {/* Truck Front Cabin */}
          <G x={158} y={22}>
            <Path
              d="M 0 0 L 38 0 Q 56 0, 58 18 L 60 52 L 0 52 Z"
              fill="#F8FAFC"
              stroke="#94A3B8"
              strokeWidth="1.5"
            />
            {/* Front Windshield */}
            <Path
              d="M 28 6 L 46 6 Q 52 6, 54 16 L 54 24 L 28 24 Z"
              fill="#38BDF8"
              opacity={0.85}
            />
            {/* Side Door Window */}
            <Rect x="8" y="6" width="16" height="18" fill="#93C5FD" rx="2" />
            {/* Headlight */}
            <Rect x="54" y="40" width="5" height="6" fill="#FBBF24" rx="1.5" />
          </G>

          {/* Wheels */}
          <G y={72}>
            {/* Trailer Rear Wheels */}
            <Circle cx="24" cy="0" r="10" fill="#0F172A" stroke="#64748B" strokeWidth="2.5" />
            <Circle cx="24" cy="0" r="4.5" fill="#CBD5E1" />

            <Circle cx="48" cy="0" r="10" fill="#0F172A" stroke="#64748B" strokeWidth="2.5" />
            <Circle cx="48" cy="0" r="4.5" fill="#CBD5E1" />

            {/* Trailer Front / Cabin Drive Wheels */}
            <Circle cx="126" cy="0" r="10" fill="#0F172A" stroke="#64748B" strokeWidth="2.5" />
            <Circle cx="126" cy="0" r="4.5" fill="#CBD5E1" />

            <Circle cx="148" cy="0" r="10" fill="#0F172A" stroke="#64748B" strokeWidth="2.5" />
            <Circle cx="148" cy="0" r="4.5" fill="#CBD5E1" />

            {/* Steer Wheel */}
            <Circle cx="204" cy="0" r="10" fill="#0F172A" stroke="#64748B" strokeWidth="2.5" />
            <Circle cx="204" cy="0" r="4.5" fill="#CBD5E1" />
          </G>
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 320,
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
