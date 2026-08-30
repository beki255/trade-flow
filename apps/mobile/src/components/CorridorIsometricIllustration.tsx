import React from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';

export const CorridorIsometricIllustration: React.FC = () => {
  // Web SVG Renderer
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <svg
          viewBox="0 0 340 280"
          style={{ width: '100%', height: '100%', maxWidth: 340, maxHeight: 280 }}
        >
          <defs>
            <filter id="truck3dShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="3" dy="8" stdDeviation="5" floodColor="#0F172A" floodOpacity="0.22" />
            </filter>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="#0284C7" floodOpacity="0.16" />
            </filter>
            <filter id="flagWaveShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="2" stdDeviation="2.5" floodColor="#1E293B" floodOpacity="0.2" />
            </filter>

            <linearGradient id="roadRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="25%" stopColor="#CBD5E1" />
              <stop offset="70%" stopColor="#BAC7D5" />
              <stop offset="100%" stopColor="#A6B6C6" />
            </linearGradient>

            <linearGradient id="trailerTopLighting" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#EEF2F6" />
            </linearGradient>

            <linearGradient id="trailerSideLighting" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EBF2F7" />
              <stop offset="60%" stopColor="#DDE7F0" />
              <stop offset="100%" stopColor="#CAD8E5" />
            </linearGradient>

            <linearGradient id="cabBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="50%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BAE6FD" />
              <stop offset="50%" stopColor="#7DD3FC" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>

            <linearGradient id="lakeAbbeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93C5FD" />
              <stop offset="100%" stopColor="#67B0EA" />
            </linearGradient>
          </defs>

          {/* 1. BACKGROUND GREY CONTOURS */}
          <path
            d="M 68 88 C 98 62, 128 65, 154 94 C 180 122, 215 78, 252 86 C 274 90, 288 66, 298 62"
            fill="none"
            stroke="#D8E2EC"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 252 86 C 270 82, 284 76, 298 62"
            fill="none"
            stroke="#D8E2EC"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 66 186 C 96 182, 126 192, 162 178"
            fill="none"
            stroke="#D8E2EC"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* 2. LAKE ABBE WATER BODY & PIN */}
          <g filter="url(#softGlow)">
            <path
              d="M 12 142 Q 18 128, 38 128 Q 58 126, 68 140 Q 82 158, 74 184 Q 65 206, 44 210 Q 22 202, 14 176 Q 8 156, 12 142 Z"
              fill="url(#lakeAbbeGrad)"
            />
            <circle cx="70" cy="164" r="2.2" fill="#60A5FA" />
            <circle cx="75" cy="180" r="1.8" fill="#60A5FA" />
          </g>

          <g transform="translate(46, 115)" filter="url(#softGlow)">
            <path
              d="M 0 -14 C -8 -14, -14 -8, -14 0 C -14 7, -3.5 16, 0 20 C 3.5 16, 14 7, 14 0 C 14 -8, 8 -14, 0 -14 Z"
              fill="#4B7FA8"
            />
            <circle cx="0" cy="-1.5" r="5" fill="#FFFFFF" />
          </g>

          <text
            x="18"
            y="162"
            fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
            fontSize="11"
            fontWeight="700"
            fill="#1E293B"
          >
            Lake Abbe
          </text>

          {/* 3. CURVED 3D ISOMETRIC ASPHALT HIGHWAY */}
          <path
            d="M 48 76 C 78 104, 118 144, 168 178 C 218 212, 272 242, 324 260 L 324 266 C 272 248, 218 218, 168 184 C 118 150, 78 110, 48 82 Z"
            fill="#7E8E9E"
          />
          <path
            d="M 48 76 C 92 106, 142 144, 192 176 C 242 208, 288 238, 324 260 L 268 278 C 218 252, 168 220, 118 188 C 68 154, 28 120, 10 94 Z"
            fill="url(#roadRibbonGrad)"
            stroke="#8E9EA9"
            strokeWidth="0.8"
          />
          <path
            d="M 28 85 C 72 114, 120 148, 168 180 C 214 212, 258 244, 298 268"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeDasharray="10 8"
            strokeLinecap="round"
          />

          {/* 4. DJIBOUTI FLAG */}
          <g transform="translate(56, 26)" filter="url(#flagWaveShadow)">
            <line x1="0" y1="0" x2="0" y2="52" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="0" cy="0" r="2.2" fill="#94A3B8" />

            <g transform="translate(0, 3)">
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

          {/* 5. 3D ISOMETRIC TRUCK */}
          <g filter="url(#truck3dShadow)" transform="translate(104, 76)">
            <polygon
              points="18,0 136,46 118,57 0,11"
              fill="url(#trailerTopLighting)"
              stroke="#CBD5E1"
              strokeWidth="1.2"
            />
            <polygon
              points="0,11 118,57 118,118 0,72"
              fill="url(#trailerSideLighting)"
              stroke="#94A3B8"
              strokeWidth="1.5"
            />
            <polygon
              points="136,46 118,57 118,118 136,107"
              fill="#CBD5E1"
              stroke="#94A3B8"
              strokeWidth="1.2"
            />

            {/* Blue Speed Stripes */}
            <g transform="translate(22, 28) skewY(21) scale(0.95)">
              <polygon points="0,4 10,-14 17,-14 7,4" fill="#3B82F6" />
              <polygon points="15,4 25,-14 32,-14 22,4" fill="#3B82F6" />
              <polygon points="30,4 40,-14 47,-14 37,4" fill="#3B82F6" />
              <rect x="0" y="6" width="56" height="4" rx="2" fill="#3B82F6" />
            </g>

            {/* Chassis & Rear Wheels */}
            <rect x="12" y="68" width="98" height="6.5" fill="#1E293B" transform="skewY(21)" />
            <g transform="translate(20, 84)">
              <ellipse cx="0" cy="0" rx="8" ry="10.5" fill="#0F172A" stroke="#475569" strokeWidth="2.5" />
              <ellipse cx="0" cy="0" rx="4" ry="5.5" fill="#94A3B8" />
              <circle cx="0" cy="0" r="1.5" fill="#1E293B" />
            </g>
            <g transform="translate(39, 92)">
              <ellipse cx="0" cy="0" rx="8" ry="10.5" fill="#0F172A" stroke="#475569" strokeWidth="2.5" />
              <ellipse cx="0" cy="0" rx="4" ry="5.5" fill="#94A3B8" />
              <circle cx="0" cy="0" r="1.5" fill="#1E293B" />
            </g>

            {/* Cabin */}
            <g transform="translate(98, 48)">
              <polygon points="20,8 52,21 43,28 11,15" fill="#94A3B8" stroke="#475569" strokeWidth="1.2" />
              <polygon points="11,15 43,28 43,76 11,63" fill="url(#cabBodyGrad)" stroke="#334155" strokeWidth="1.5" />
              <polygon points="43,28 60,20 60,68 43,76" fill="#475569" stroke="#334155" strokeWidth="1.5" />

              <polygon points="41,30 54,23 54,46 41,53" fill="url(#glassReflection)" opacity="0.95" stroke="#38BDF8" strokeWidth="1" />
              <polygon points="15,19 37,28 37,42 15,33" fill="url(#glassReflection)" opacity="0.9" stroke="#38BDF8" strokeWidth="0.8" />

              <line x1="45" y1="54" x2="56" y2="49" stroke="#0F172A" strokeWidth="2.2" />
              <line x1="45" y1="58" x2="56" y2="53" stroke="#0F172A" strokeWidth="2.2" />
              <line x1="45" y1="62" x2="56" y2="57" stroke="#0F172A" strokeWidth="2.2" />
              <polygon points="56,60 59,59 59,64 56,65" fill="#FBBF24" />

              <g transform="translate(28, 70)">
                <ellipse cx="0" cy="0" rx="8.5" ry="11" fill="#0F172A" stroke="#475569" strokeWidth="2.5" />
                <ellipse cx="0" cy="0" rx="4" ry="5.5" fill="#94A3B8" />
              </g>
              <g transform="translate(53, 80)">
                <ellipse cx="0" cy="0" rx="8.5" ry="11" fill="#0F172A" stroke="#475569" strokeWidth="2.5" />
                <ellipse cx="0" cy="0" rx="4" ry="5.5" fill="#94A3B8" />
              </g>
            </g>
          </g>

          {/* 6. ETHIOPIAN FLAG */}
          <g transform="translate(244, 96)" filter="url(#flagWaveShadow)">
            <line x1="0" y1="0" x2="0" y2="50" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="0" cy="0" r="2.2" fill="#94A3B8" />

            <g transform="translate(0, 3)">
              <rect x="0" y="0" width="44" height="8.5" fill="#16A34A" rx="1" />
              <rect x="0" y="8.5" width="44" height="8.5" fill="#EAB308" />
              <rect x="0" y="17" width="44" height="8.5" fill="#DC2626" rx="1" />
              <circle cx="18" cy="12.7" r="4.6" fill="#2563EB" />
              <circle cx="18" cy="12.7" r="1.8" fill="#FACC15" />
            </g>
          </g>

          {/* 7. MOJO PIN */}
          <g transform="translate(294, 38)" filter="url(#softGlow)">
            <path
              d="M 0 -15 C -8.5 -15, -15 -8.5, -15 0 C -15 7.5, -4 17, 0 22 C 4 17, 15 7.5, 15 0 C 15 -8.5, 8.5 -15, 0 -15 Z"
              fill="#4B7FA8"
            />
            <circle cx="0" cy="-1.5" r="5.5" fill="#FFFFFF" />
          </g>
          <text
            x="278"
            y="78"
            fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
            fontSize="13.5"
            fontWeight="700"
            fill="#1E293B"
          >
            Mojo
          </text>

          {/* 8. RED CHECKPOINT DOT */}
          <circle
            cx="196"
            cy="225"
            r="4.8"
            fill="#EF4444"
            filter="drop-shadow(0px 2px 5px rgba(239,68,68,0.5))"
          />
        </svg>
      </View>
    );
  }

  // =========================================================================
  // NATIVE ANDROID / IOS RENDERER (Pure React Native Views & Transforms)
  // =========================================================================
  return (
    <View style={styles.nativeContainer}>
      
      {/* Background Grey Contour Lines */}
      <View style={[styles.nativeContour, { top: 38, left: 60, width: 90, transform: [{ rotate: '-25deg' }] }]} />
      <View style={[styles.nativeContour, { top: 58, left: 140, width: 95, transform: [{ rotate: '28deg' }] }]} />
      <View style={[styles.nativeContour, { top: 130, left: 40, width: 130, transform: [{ rotate: '-12deg' }] }]} />

      {/* Lake Abbe Water Body */}
      <View style={styles.nativeLakeBody}>
        <Text style={styles.nativeLakeText}>Lake Abbe</Text>
      </View>

      {/* Lake Abbe Location Pin */}
      <View style={styles.nativeLakePin}>
        <View style={styles.nativePinCircle}>
          <View style={styles.nativePinDot} />
        </View>
        <View style={styles.nativePinTriangle} />
      </View>

      {/* Djibouti Flag at Top Left */}
      <View style={styles.nativeDjiboutiFlag}>
        <View style={styles.nativeFlagPole} />
        <View style={styles.nativeDjiboutiCloth}>
          <View style={styles.nativeDjiboutiBlue} />
          <View style={styles.nativeDjiboutiGreen} />
          <View style={styles.nativeDjiboutiTriangle} />
          <View style={styles.nativeDjiboutiStar} />
        </View>
      </View>

      {/* 3D Isometric Curved Highway Ribbon */}
      <View style={styles.nativeHighwayRibbon}>
        <View style={styles.nativeHighwayDashed} />
      </View>

      {/* 3D Semi-Truck */}
      <View style={styles.nativeTruckAssembly}>
        {/* Trailer */}
        <View style={styles.nativeTrailer}>
          <View style={styles.nativeDecalRow}>
            <View style={styles.nativeSpeedSlash} />
            <View style={styles.nativeSpeedSlash} />
            <View style={styles.nativeSpeedSlash} />
            <View style={styles.nativeSpeedUnderline} />
          </View>
        </View>

        {/* Cab */}
        <View style={styles.nativeCab}>
          <View style={styles.nativeWindshield} />
          <View style={styles.nativeSideWindow} />
        </View>

        {/* Wheels */}
        <View style={[styles.nativeWheel, { left: 10, bottom: -6 }]} />
        <View style={[styles.nativeWheel, { left: 28, bottom: -6 }]} />
        <View style={[styles.nativeWheel, { right: 28, bottom: -6 }]} />
        <View style={[styles.nativeWheel, { right: 10, bottom: -6 }]} />
      </View>

      {/* Ethiopian Flag near Cab */}
      <View style={styles.nativeEthFlag}>
        <View style={styles.nativeFlagPole} />
        <View style={styles.nativeEthCloth}>
          <View style={styles.nativeEthGreen} />
          <View style={styles.nativeEthYellow} />
          <View style={styles.nativeEthRed} />
          <View style={styles.nativeEthEmblem} />
        </View>
      </View>

      {/* Mojo Pin at Top Right */}
      <View style={styles.nativeMojoPin}>
        <View style={styles.nativePinCircle}>
          <View style={styles.nativePinDot} />
        </View>
        <View style={styles.nativePinTriangle} />
        <Text style={styles.nativeMojoText}>Mojo</Text>
      </View>

      {/* Red Checkpoint Dot */}
      <View style={styles.nativeRedDot} />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 340,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeContainer: {
    width: 320,
    height: 250,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeContour: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#D8E2EC',
    borderRadius: 1.5,
  },
  nativeLakeBody: {
    position: 'absolute',
    left: 8,
    bottom: 30,
    width: 78,
    height: 52,
    backgroundColor: '#93C5FD',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nativeLakeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
  },
  nativeLakePin: {
    position: 'absolute',
    left: 34,
    top: 102,
    alignItems: 'center',
  },
  nativePinCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
  nativeDjiboutiFlag: {
    position: 'absolute',
    left: 36,
    top: 30,
    flexDirection: 'row',
  },
  nativeFlagPole: {
    width: 2.5,
    height: 44,
    backgroundColor: '#475569',
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
  nativeHighwayRibbon: {
    position: 'absolute',
    left: 18,
    top: 48,
    width: 275,
    height: 60,
    backgroundColor: '#CBD5E1',
    transform: [{ rotate: '25deg' }, { skewX: '-20deg' }],
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nativeHighwayDashed: {
    width: '100%',
    height: 3,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  nativeTruckAssembly: {
    position: 'absolute',
    left: 115,
    top: 80,
    flexDirection: 'row',
    alignItems: 'flex-end',
    transform: [{ rotate: '25deg' }, { scale: 0.95 }],
    zIndex: 10,
  },
  nativeTrailer: {
    width: 100,
    height: 48,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: '#94A3B8',
    borderRadius: 3,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  nativeDecalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nativeSpeedSlash: {
    width: 4,
    height: 22,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    transform: [{ skewX: '-20deg' }],
  },
  nativeSpeedUnderline: {
    width: 40,
    height: 4,
    backgroundColor: '#3B82F6',
    marginLeft: 6,
    borderRadius: 2,
  },
  nativeCab: {
    width: 32,
    height: 36,
    backgroundColor: '#64748B',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 2,
    borderWidth: 2,
    borderColor: '#475569',
    marginLeft: -1,
    padding: 3,
  },
  nativeWindshield: {
    width: 14,
    height: 12,
    backgroundColor: '#93C5FD',
    borderRadius: 2,
    alignSelf: 'flex-end',
  },
  nativeSideWindow: {
    width: 8,
    height: 8,
    backgroundColor: '#93C5FD',
    borderRadius: 1,
    marginTop: 2,
  },
  nativeWheel: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#64748B',
  },
  nativeEthFlag: {
    position: 'absolute',
    right: 36,
    top: 80,
    flexDirection: 'row',
  },
  nativeEthCloth: {
    width: 38,
    height: 23,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 0.5,
    borderColor: '#94A3B8',
  },
  nativeEthGreen: {
    width: '100%',
    height: 7.5,
    backgroundColor: '#16A34A',
  },
  nativeEthYellow: {
    width: '100%',
    height: 7.5,
    backgroundColor: '#EAB308',
  },
  nativeEthRed: {
    width: '100%',
    height: 8,
    backgroundColor: '#DC2626',
  },
  nativeEthEmblem: {
    position: 'absolute',
    left: 15,
    top: 7.5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  nativeMojoPin: {
    position: 'absolute',
    right: 26,
    top: 32,
    alignItems: 'center',
  },
  nativeMojoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  nativeRedDot: {
    position: 'absolute',
    left: 175,
    bottom: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
});
