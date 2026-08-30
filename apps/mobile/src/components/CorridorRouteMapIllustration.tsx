import React from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';

export const CorridorRouteMapIllustration: React.FC = () => {
  // Web SVG Renderer
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <svg
          viewBox="0 0 320 230"
          style={{ width: '100%', height: '100%', maxWidth: 320, maxHeight: 230 }}
        >
          <defs>
            <filter id="routeShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="#1E293B" floodOpacity="0.12" />
            </filter>
            <linearGradient id="blueRouteGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="lakeWaterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93C5FD" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>
          </defs>

          {/* 1. LAKE ABBE NATURAL WATER BODY */}
          <path
            d="M 6 130 Q 18 120, 38 122 Q 54 125, 58 140 Q 64 165, 52 188 Q 42 205, 24 208 Q 8 200, 4 175 Q 2 150, 6 130 Z"
            fill="url(#lakeWaterGrad)"
            opacity="0.9"
          />
          <circle cx="58" cy="180" r="2.5" fill="#60A5FA" />
          <circle cx="54" cy="195" r="2" fill="#60A5FA" />

          <text
            x="8"
            y="172"
            fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
            fontSize="11"
            fontWeight="700"
            fill="#1E293B"
          >
            Lake Abbe
          </text>

          {/* 2. DJIBOUTI FLAG */}
          <g transform="translate(32, 58)">
            <line x1="0" y1="0" x2="0" y2="70" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="0" cy="0" r="2" fill="#94A3B8" />

            <g transform="translate(0, 3)" filter="url(#routeShadow)">
              <rect x="0" y="0" width="42" height="13.5" fill="#60A5FA" rx="1" />
              <rect x="0" y="13.5" width="42" height="13.5" fill="#22C55E" rx="1" />
              <polygon points="0,0 0,27 18,13.5" fill="#FFFFFF" />
              <polygon
                points="6,13.5 7.5,9.5 11.5,9.5 8.2,12 9.5,16 6,13.5 2.5,16 3.8,12 0.5,9.5 4.5,9.5"
                fill="#EF4444"
                transform="scale(0.8) translate(0, 1.5)"
              />
            </g>
          </g>

          {/* 3. GREY WINDING ALTERNATE ROUTE */}
          <path
            d="M 52 145 C 55 125, 75 110, 95 110 C 115 110, 125 130, 150 130 C 180 130, 200 115, 235 115 C 255 115, 270 95, 280 82"
            fill="none"
            stroke="#D1DCE5"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 4. PRIMARY BLUE CORRIDOR HIGHWAY */}
          <path
            d="M 54 196 C 75 198, 100 196, 125 182 C 155 165, 175 145, 205 120 C 235 95, 260 85, 280 80"
            fill="none"
            stroke="url(#blueRouteGrad)"
            strokeWidth="7"
            strokeLinecap="round"
            filter="url(#routeShadow)"
          />
          <path
            d="M 56 195 C 76 197, 100 195, 125 181 C 155 164, 175 144, 205 119 C 235 94, 260 84, 279 79"
            fill="none"
            stroke="#60A5FA"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* 5. MOJO LOCATION PIN */}
          <g transform="translate(280, 52)" filter="url(#routeShadow)">
            <path
              d="M 0 -15 C -8.5 -15, -15 -8.5, -15 0 C -15 7.5, -4 17, 0 22 C 4 17, 15 7.5, 15 0 C 15 -8.5, 8.5 -15, 0 -15 Z"
              fill="#4B7FA8"
            />
            <circle cx="0" cy="-1.5" r="5.5" fill="#FFFFFF" />
          </g>

          <text
            x="264"
            y="94"
            fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
            fontSize="13"
            fontWeight="700"
            fill="#1E293B"
          >
            Mojo
          </text>
        </svg>
      </View>
    );
  }

  // =========================================================================
  // NATIVE ANDROID / IOS RENDERER (Pure React Native Views)
  // =========================================================================
  return (
    <View style={styles.nativeContainer}>
      
      {/* Background Grey Alternate Curves */}
      <View style={[styles.nativeContour, { top: 38, left: 90, width: 85, transform: [{ rotate: '-25deg' }] }]} />
      <View style={[styles.nativeContour, { top: 58, left: 155, width: 85, transform: [{ rotate: '32deg' }] }]} />
      <View style={[styles.nativeContour, { top: 125, left: 45, width: 140, transform: [{ rotate: '-12deg' }] }]} />

      {/* Djibouti Flag */}
      <View style={styles.nativeDjiboutiFlag}>
        <View style={styles.nativeFlagPole} />
        <View style={styles.nativeDjiboutiCloth}>
          <View style={styles.nativeDjiboutiBlue} />
          <View style={styles.nativeDjiboutiGreen} />
          <View style={styles.nativeDjiboutiTriangle} />
          <View style={styles.nativeDjiboutiStar} />
        </View>
      </View>

      {/* Lake Abbe Water Area */}
      <View style={styles.nativeLakeBody}>
        <Text style={styles.nativeLakeText}>Lake Abbe</Text>
      </View>

      {/* Primary Blue Corridor Highway Curve */}
      <View style={styles.nativeBluePathWrapper}>
        <View style={[styles.nativeBluePathSegment, { bottom: 18, left: 35, width: 85, transform: [{ rotate: '-18deg' }] }]} />
        <View style={[styles.nativeBluePathSegment, { bottom: 38, left: 105, width: 80, transform: [{ rotate: '-48deg' }] }]} />
        <View style={[styles.nativeBluePathSegment, { top: 62, left: 155, width: 80, transform: [{ rotate: '24deg' }] }]} />
        <View style={[styles.nativeBluePathSegment, { top: 38, left: 215, width: 45, transform: [{ rotate: '-14deg' }] }]} />
      </View>

      {/* Mojo Destination Pin */}
      <View style={styles.nativeMojoSection}>
        <View style={styles.nativePinCircle}>
          <View style={styles.nativePinDot} />
        </View>
        <View style={styles.nativePinTriangle} />
        <Text style={styles.nativeMojoText}>Mojo</Text>
      </View>

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
  nativeContainer: {
    width: 320,
    height: 230,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeContour: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#D1DCE5',
    borderRadius: 2,
  },
  nativeDjiboutiFlag: {
    position: 'absolute',
    left: 20,
    top: 30,
    flexDirection: 'row',
  },
  nativeFlagPole: {
    width: 2.5,
    height: 46,
    backgroundColor: '#64748B',
  },
  nativeDjiboutiCloth: {
    width: 36,
    height: 23,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#94A3B8',
  },
  nativeDjiboutiBlue: {
    width: '100%',
    height: 11.5,
    backgroundColor: '#60A5FA',
  },
  nativeDjiboutiGreen: {
    width: '100%',
    height: 11.5,
    backgroundColor: '#22C55E',
  },
  nativeDjiboutiTriangle: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    borderTopWidth: 11.5,
    borderBottomWidth: 11.5,
    borderLeftWidth: 15,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFFFFF',
  },
  nativeDjiboutiStar: {
    position: 'absolute',
    left: 3,
    top: 9,
    width: 5,
    height: 5,
    backgroundColor: '#EF4444',
    borderRadius: 2.5,
  },
  nativeLakeBody: {
    position: 'absolute',
    left: 10,
    top: 80,
    width: 82,
    height: 54,
    backgroundColor: '#93C5FD',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nativeLakeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  nativeBluePathWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  nativeBluePathSegment: {
    position: 'absolute',
    height: 6.5,
    backgroundColor: '#2563EB',
    borderRadius: 3.5,
  },
  nativeMojoSection: {
    position: 'absolute',
    right: 28,
    top: 35,
    alignItems: 'center',
  },
  nativePinCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4B7FA8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativePinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  nativePinTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#4B7FA8',
    marginTop: -1,
  },
  nativeMojoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
});
