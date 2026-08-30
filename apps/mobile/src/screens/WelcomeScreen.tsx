import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { CorridorIsometricIllustration } from '../components/CorridorIsometricIllustration';
import { CorridorRouteMapIllustration } from '../components/CorridorRouteMapIllustration';

interface WelcomeScreenProps {
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
  onFastDemoLogin?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNavigateLogin,
  onNavigateRegister,
  onFastDemoLogin,
}) => {
  // First dot [● ○ ○] is default
  const [activeDot, setActiveDot] = useState(0);
  const { language, toggleLanguage } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F9FD" />

      {/* Main Container */}
      <View style={styles.content}>
        
        {/* Top Header: Clean Non-Overlapping Layout with lowered TradeFlow Title */}
        <View style={styles.header}>
          {/* Left spacer for perfect horizontal centering */}
          <View style={styles.headerSpacer} />

          {/* Centered Brand Title: "TradeFlow" */}
          <Text style={styles.brandTitle}>TradeFlow</Text>
          
          {/* Right Language Switcher with distinct background pill */}
          <TouchableOpacity
            style={styles.langBtn}
            onPress={toggleLanguage}
            activeOpacity={0.8}
          >
            <Text style={styles.langBtnText}>
              🌐 {language === 'AM' ? 'EN' : 'አማርኛ'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Center Illustration Area */}
        <View style={styles.illustrationCard}>
          
          {/* ========================================================
              SLIDE 0 (DOT 1 [● ○ ○]): 1:1 3D ISOMETRIC VECTOR ILLUSTRATION
             ======================================================== */}
          {activeDot === 0 && (
            <CorridorIsometricIllustration />
          )}

          {/* ========================================================
              SLIDE 1 (DOT 2 [○ ● ○]): 1:1 2D CORRIDOR ROUTE MAP VECTOR ILLUSTRATION
             ======================================================== */}
          {activeDot === 1 && (
            <CorridorRouteMapIllustration />
          )}

          {/* ========================================================
              SLIDE 2 (DOT 3 [○ ○ ●]): Cross-Border Cargo & Journey Straight Highway
             ======================================================== */}
          {activeDot === 2 && (
            <View style={styles.mapCanvas}>
              {/* Soft Cloud Backdrop */}
              <View style={[styles.s2CloudBackdrop, { top: 12, left: 25, width: 250, height: 120 }]} />

              {/* Djibouti Flag (Left) */}
              <View style={[styles.s2FlagBox, { left: 16 }]}>
                <View style={styles.flagPoleLine} />
                <View style={styles.djiboutiBanner}>
                  <View style={styles.djiboutiBlueBand} />
                  <View style={styles.djiboutiGreenBand} />
                  <View style={styles.djiboutiTriangleShape} />
                  <View style={styles.djiboutiRedStar} />
                </View>
              </View>

              {/* Ethiopian Flag (Right) */}
              <View style={[styles.s2FlagBox, { right: 16 }]}>
                <View style={styles.flagPoleLine} />
                <View style={styles.ethiopiaBanner}>
                  <View style={styles.ethiopiaGreenBand} />
                  <View style={styles.ethiopiaYellowBand} />
                  <View style={styles.ethiopiaRedBand} />
                  <View style={styles.ethiopiaEmblemDisk} />
                </View>
              </View>

              {/* Horizontal Asphalt Highway */}
              <View style={styles.s2RoadTrack}>
                <View style={styles.s2RoadDashedDivider} />
              </View>

              {/* Forward Semi-Truck */}
              <View style={styles.s2TruckAssembly}>
                <View style={styles.s2TrailerBox}>
                  <View style={styles.s2SpeedLinesBox}>
                    <View style={styles.s2SpeedLine} />
                    <View style={styles.s2SpeedLine} />
                    <View style={styles.s2SpeedLine} />
                  </View>
                </View>
                <View style={styles.s2CabinBox}>
                  <View style={styles.s2Windshield} />
                  <View style={styles.s2SideWindow} />
                </View>

                {/* Wheels */}
                <View style={[styles.s2Wheel, { left: 16 }]} />
                <View style={[styles.s2Wheel, { left: 38 }]} />
                <View style={[styles.s2Wheel, { left: 110 }]} />
                <View style={[styles.s2Wheel, { left: 130 }]} />
                <View style={[styles.s2Wheel, { right: 14 }]} />
              </View>
            </View>
          )}

        </View>

        {/* Dynamic Titles & Descriptions */}
        <View style={styles.textContainer}>
          {activeDot === 2 ? (
            <View style={styles.slide2TitleBox}>
              <Text style={styles.slide2MainTitle}>የድንበር ተሻጋሪ ጭነት እና ጉዞ</Text>
              <Text style={styles.slide2SubTitle}>Cross-Border Cargo & Journey</Text>
            </View>
          ) : null}

          <Text style={styles.amharicDescription}>
            በኢትዮጵያ-ጅቡቲ መስመር ላይ ጉዞዎን በቀላሉ ይከታተሉ፤ ያለ ኢንተርኔት ፍተሻዎችን ይመዝግቡ፤ የዲጂታል ክፍያዎን በፍጥነት ይቀበሉ
          </Text>
          <Text style={styles.englishDescription}>
            Track your journey on the Ethiopia-Djibouti route, record check-ins offline, and receive digital payments instantly.
          </Text>
        </View>

        {/* 3 Pagination Carousel Dots [● ○ ○] */}
        <View style={styles.paginationContainer}>
          <TouchableOpacity onPress={() => setActiveDot(0)} activeOpacity={0.7}>
            <View style={[styles.paginationDot, activeDot === 0 ? styles.dotActive : styles.dotInactive]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveDot(1)} activeOpacity={0.7}>
            <View style={[styles.paginationDot, activeDot === 1 ? styles.dotActive : styles.dotInactive]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveDot(2)} activeOpacity={0.7}>
            <View style={[styles.paginationDot, activeDot === 2 ? styles.dotActive : styles.dotInactive]} />
          </TouchableOpacity>
        </View>

        {/* Bottom Action Buttons (Exact match to screenshot) */}
        <View style={styles.buttonsWrapper}>
          
          {/* Primary Solid Blue Button: ይግቡ / Login */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={onNavigateLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>ይግቡ / Login</Text>
          </TouchableOpacity>

          {/* Secondary Outlined Button: አዲስ አካውንት ይክፈቱ / Create Account */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={onNavigateRegister}
            activeOpacity={0.85}
          >
            <Text style={styles.registerButtonText}>አዲስ አካውንት ይክፈቱ / Create Account</Text>
          </TouchableOpacity>

          {/* Fast Demo One-Click Fill */}
          <TouchableOpacity
            style={styles.fastDemoWrapper}
            onPress={onFastDemoLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.fastDemoLabel}>⚡ Fast Demo Driver</Text>
          </TouchableOpacity>

        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9FD',
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 18,
    paddingBottom: 4,
    width: '100%',
  },
  headerSpacer: {
    width: 65,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  langBtn: {
    backgroundColor: '#E2EAF2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  illustrationCard: {
    width: '100%',
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 4,
  },
  mapCanvas: {
    width: '100%',
    maxWidth: 320,
    height: 240,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // SLIDE 2 (DOT 3): HORIZONTAL TRUCK & HIGHWAY
  s2CloudBackdrop: {
    position: 'absolute',
    backgroundColor: '#E6EFF7',
    borderRadius: 60,
    opacity: 0.75,
  },
  s2FlagBox: {
    position: 'absolute',
    top: 30,
    flexDirection: 'row',
  },
  flagPoleLine: {
    width: 2,
    height: 42,
    backgroundColor: '#475569',
  },
  djiboutiBanner: {
    width: 36,
    height: 23,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#94A3B8',
  },
  djiboutiBlueBand: {
    width: '100%',
    height: 11.5,
    backgroundColor: '#60A5FA',
  },
  djiboutiGreenBand: {
    width: '100%',
    height: 11.5,
    backgroundColor: '#22C55E',
  },
  djiboutiTriangleShape: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    borderTopWidth: 11.5,
    borderBottomWidth: 11.5,
    borderLeftWidth: 15,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFFFFF',
  },
  djiboutiRedStar: {
    position: 'absolute',
    left: 3,
    top: 9,
    width: 5,
    height: 5,
    backgroundColor: '#EF4444',
    borderRadius: 2.5,
  },
  ethiopiaBanner: {
    width: 36,
    height: 22,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 0.5,
    borderColor: '#94A3B8',
  },
  ethiopiaGreenBand: {
    width: '100%',
    height: 7,
    backgroundColor: '#16A34A',
  },
  ethiopiaYellowBand: {
    width: '100%',
    height: 7,
    backgroundColor: '#EAB308',
  },
  ethiopiaRedBand: {
    width: '100%',
    height: 8,
    backgroundColor: '#DC2626',
  },
  ethiopiaEmblemDisk: {
    position: 'absolute',
    left: 14,
    top: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  s2RoadTrack: {
    position: 'absolute',
    bottom: 35,
    width: '100%',
    maxWidth: 290,
    height: 34,
    backgroundColor: '#CBD5E1',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  s2RoadDashedDivider: {
    width: '88%',
    height: 3,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  s2TruckAssembly: {
    position: 'absolute',
    bottom: 46,
    flexDirection: 'row',
    alignItems: 'flex-end',
    zIndex: 10,
  },
  s2TrailerBox: {
    width: 155,
    height: 54,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: '#94A3B8',
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  s2SpeedLinesBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  s2SpeedLine: {
    width: 22,
    height: 28,
    backgroundColor: '#60A5FA',
    borderRadius: 4,
    transform: [{ skewX: '-25deg' }],
  },
  s2CabinBox: {
    width: 40,
    height: 44,
    backgroundColor: '#64748B',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 3,
    borderWidth: 2,
    borderColor: '#475569',
    marginLeft: -2,
    padding: 4,
    justifyContent: 'space-between',
  },
  s2Windshield: {
    width: 16,
    height: 14,
    backgroundColor: '#93C5FD',
    borderRadius: 3,
    alignSelf: 'flex-end',
  },
  s2SideWindow: {
    width: 8,
    height: 8,
    backgroundColor: '#93C5FD',
    borderRadius: 2,
  },
  s2Wheel: {
    position: 'absolute',
    bottom: -7,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#1E293B',
    borderWidth: 2.5,
    borderColor: '#64748B',
  },

  // Dynamic Typography Section
  textContainer: {
    paddingHorizontal: 6,
    alignItems: 'center',
    marginVertical: 4,
  },
  slide2TitleBox: {
    alignItems: 'center',
    marginBottom: 6,
  },
  slide2MainTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  slide2SubTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  amharicDescription: {
    fontSize: 11.5,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 17,
    fontWeight: '500',
    marginBottom: 4,
  },
  englishDescription: {
    fontSize: 10.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 15,
  },

  // Carousel Pagination Dots
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#5A8EB9',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#94A3B8',
  },

  // Bottom Action Buttons
  buttonsWrapper: {
    width: '100%',
    gap: 10,
    paddingBottom: 8,
  },
  loginButton: {
    backgroundColor: '#6B9AC4',
    borderRadius: 25,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#6B9AC4',
  },
  registerButtonText: {
    color: '#2C5777',
    fontSize: 13.5,
    fontWeight: '700',
  },
  fastDemoWrapper: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  fastDemoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
});
