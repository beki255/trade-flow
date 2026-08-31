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
  Text as SvgText,
} from 'react-native-svg';

export const CorridorRouteMapIllustration: React.FC = () => {
  return (
    <View style={styles.container}>
      <Svg
        viewBox="0 0 320 230"
        width="100%"
        height="100%"
        style={{ maxWidth: 320, maxHeight: 230 }}
      >
        <Defs>
          <LinearGradient id="mapBlueRouteGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#3B82F6" />
            <Stop offset="50%" stopColor="#2563EB" />
            <Stop offset="100%" stopColor="#1D4ED8" />
          </LinearGradient>
          <LinearGradient id="mapLakeWaterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#93C5FD" />
            <Stop offset="100%" stopColor="#60A5FA" />
          </LinearGradient>
        </Defs>

        {/* 1. LAKE ABBE NATURAL WATER BODY */}
        <Path
          d="M 6 130 Q 18 120, 38 122 Q 54 125, 58 140 Q 64 165, 52 188 Q 42 205, 24 208 Q 8 200, 4 175 Q 2 150, 6 130 Z"
          fill="url(#mapLakeWaterGrad)"
          opacity={0.9}
        />
        <Circle cx="58" cy="180" r="2.5" fill="#60A5FA" />
        <Circle cx="54" cy="195" r="2" fill="#60A5FA" />

        <SvgText
          x="8"
          y="172"
          fontSize="11"
          fontWeight="700"
          fill="#1E293B"
        >
          Lake Abbe
        </SvgText>

        {/* 2. DJIBOUTI FLAG */}
        <G x={32} y={58}>
          <Line x1="0" y1="0" x2="0" y2="70" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" />
          <Circle cx="0" cy="0" r="2" fill="#94A3B8" />

          <G y={3}>
            <Rect x="0" y="0" width="42" height="13.5" fill="#60A5FA" rx="1" />
            <Rect x="0" y="13.5" width="42" height="13.5" fill="#22C55E" rx="1" />
            <Polygon points="0,0 0,27 18,13.5" fill="#FFFFFF" />
            <Polygon
              points="6,13.5 7.5,9.5 11.5,9.5 8.2,12 9.5,16 6,13.5 2.5,16 3.8,12 0.5,9.5 4.5,9.5"
              fill="#EF4444"
              scale={0.8}
            />
          </G>
        </G>

        {/* 3. GREY WINDING ALTERNATE ROUTE */}
        <Path
          d="M 52 145 C 55 125, 75 110, 95 110 C 115 110, 125 130, 150 130 C 180 130, 200 115, 235 115 C 255 115, 270 95, 280 82"
          fill="none"
          stroke="#D1DCE5"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 4. PRIMARY BLUE CORRIDOR HIGHWAY */}
        <Path
          d="M 54 196 C 75 198, 100 196, 125 182 C 155 165, 175 145, 205 120 C 235 95, 260 85, 280 80"
          fill="none"
          stroke="url(#mapBlueRouteGrad)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <Path
          d="M 56 195 C 76 197, 100 195, 125 181 C 155 164, 175 144, 205 119 C 235 94, 260 84, 279 79"
          fill="none"
          stroke="#60A5FA"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity={0.6}
        />

        {/* 5. MOJO LOCATION PIN */}
        <G x={280} y={52}>
          <Path
            d="M 0 -15 C -8.5 -15, -15 -8.5, -15 0 C -15 7.5, -4 17, 0 22 C 4 17, 15 7.5, 15 0 C 15 -8.5, 8.5 -15, 0 -15 Z"
            fill="#4B7FA8"
          />
          <Circle cx="0" cy="-1.5" r="5.5" fill="#FFFFFF" />
        </G>

        {/* 6. ETHIOPIAN FLAG */}
        <G x={280} y={92}>
          <Line x1="0" y1="0" x2="0" y2="65" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" />
          <Circle cx="0" cy="0" r="2" fill="#94A3B8" />

          <G y={3}>
            <Rect x="0" y="0" width="42" height="9" fill="#16A34A" rx="1" />
            <Rect x="0" y="9" width="42" height="9" fill="#EAB308" />
            <Rect x="0" y="18" width="42" height="9" fill="#DC2626" rx="1" />
            <Circle cx="17.5" cy="13.5" r="4.5" fill="#2563EB" />
            <Circle cx="17.5" cy="13.5" r="1.8" fill="#FACC15" />
          </G>
        </G>

        {/* 7. RED CHECKPOINT BLIP ON HIGHWAY */}
        <Circle
          cx="178"
          cy="144"
          r="4.5"
          fill="#EF4444"
        />

        {/* 8. WHITE TEXT LABELS */}
        <SvgText
          x="192"
          y="148"
          fontSize="11"
          fontWeight="700"
          fill="#475569"
        >
          Galafi
        </SvgText>

        <SvgText
          x="264"
          y="42"
          fontSize="12"
          fontWeight="700"
          fill="#1E293B"
        >
          Mojo
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 320,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
