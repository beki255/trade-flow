import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { CorridorIsometricIllustration } from '../components/CorridorIsometricIllustration';
import { CorridorRouteMapIllustration } from '../components/CorridorRouteMapIllustration';
import { CorridorHighwayIllustration } from '../components/CorridorHighwayIllustration';

interface WelcomeScreenProps {
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNavigateLogin,
  onNavigateRegister,
}) => {
  const [activeDot, setActiveDot] = useState(0);
  const { t, language } = useLanguage();
  const { colors, isDark } = useTheme();
  const { width, height } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  // Responsive slide width & height for identical rendering on both native mobile and web device frame
  const slideWidth = Math.min(width, 412);
  const slideHeight = Math.min(275, Math.max(220, Math.round(height * 0.35)));

  const slideData = [
    {
      title: t('welcomeSlide1Title'),
      desc: t('welcomeSlide1Desc'),
    },
    {
      title: t('welcomeSlide2Title'),
      desc: t('welcomeSlide2Desc'),
    },
    {
      title: t('welcomeSlide3Title'),
      desc: t('welcomeSlide3Desc'),
    },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / slideWidth);
    if (pageIndex !== activeDot && pageIndex >= 0 && pageIndex <= 2) {
      setActiveDot(pageIndex);
    }
  };

  const handleDotPress = (index: number) => {
    setActiveDot(index);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        x: index * slideWidth,
        animated: true,
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Main Container */}
      <View style={styles.content}>
        
        {/* Top Header: TradeFlow Branding & Language Indicator */}
        <View style={styles.header}>
          <View style={styles.headerLeftSpacer} />

          <View style={styles.brandTitleContainer}>
            <Image source={require('../assets/tradeflow-logo.png')} style={styles.brandLogo} resizeMode="contain" />
          </View>

          {/* Only Language Switcher on Welcome Page (No Theme Toggle) */}
          <View style={styles.headerRight}>
            <LanguageSwitcher dark={isDark} />
          </View>
        </View>

        {/* Center Illustration Area: Full Edge-to-Edge Cross-Platform Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={slideWidth}
            snapToAlignment="center"
            contentContainerStyle={styles.scrollTrack}
          >
            {/* SLIDE 0 [● ○ ○]: Full Bleed Reference Image Illustration */}
            <View style={[styles.slideCard, { width: slideWidth, height: slideHeight }]}>
              <CorridorIsometricIllustration />
            </View>

            {/* SLIDE 1 [○ ● ○]: Full Bleed 2D Corridor Route Map Illustration */}
            <View style={[styles.slideCard, { width: slideWidth, height: slideHeight }]}>
              <CorridorRouteMapIllustration />
            </View>

            {/* SLIDE 2 [○ ○ ●]: Full Bleed Cross-Border Highway Illustration */}
            <View style={[styles.slideCard, { width: slideWidth, height: slideHeight }]}>
              <CorridorHighwayIllustration />
            </View>
          </ScrollView>
        </View>

        {/* Dynamic Titles & Descriptions synced with Carousel Swipe */}
        <View style={styles.textContainer}>
          <Text style={[styles.slideTitle, { color: colors.text }]}>
            {slideData[activeDot].title}
          </Text>
          <Text style={[styles.slideDescription, { color: colors.textMuted }]}>
            {slideData[activeDot].desc}
          </Text>
        </View>

        {/* 3 Pagination Carousel Dots [● ○ ○] */}
        <View style={styles.paginationContainer}>
          {[0, 1, 2].map((idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleDotPress(idx)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View
                style={[
                  styles.paginationDot,
                  activeDot === idx
                    ? styles.dotActive
                    : [styles.dotInactive, { backgroundColor: isDark ? '#334155' : '#CBD5E1' }],
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Action Area (Telebirr Style) - Elevated & Clean */}
        <View style={styles.buttonsWrapper}>
          
          {/* Primary Solid Blue Button: Login */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={onNavigateLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>{t('loginButton')}</Text>
          </TouchableOpacity>

          {/* Sub Row: Don't have an account? Create New Account */}
          <View style={styles.registerRow}>
            <Text style={[styles.registerPrompt, { color: colors.textMuted }]}>
              {language === 'AM' ? 'አካውንት የለዎትም?' : language === 'OM' ? 'Herrega hin qabdan?' : "Don't have an account?"}{' '}
            </Text>
            <TouchableOpacity onPress={onNavigateRegister} activeOpacity={0.7}>
              <Text style={styles.registerLink}>
                {language === 'AM' ? 'አካውንት ይክፈቱ' : language === 'OM' ? 'Herrega Haaraa Bani' : 'Create New Account'}
              </Text>
            </TouchableOpacity>
          </View>
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
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 6 : 8,
    paddingBottom: Platform.OS === 'android' ? 36 : 20,
    width: '100%',
  },

  // Header Bar
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 12) + 8 : 12,
    minHeight: 52,
  },
  headerLeftSpacer: {
    width: 60,
  },
  brandTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: {
    width: 135,
    height: 38,
  },
  headerRight: {
    width: 60,
    alignItems: 'flex-end',
  },

  // Carousel Area
  carouselContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  scrollTrack: {
    alignItems: 'center',
  },
  slideCard: {
    height: 290,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },

  // Dynamic Titles & Descriptions
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    minHeight: 62,
    justifyContent: 'center',
    width: '100%',
  },
  slideTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: -0.2,
  },
  slideDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },

  // 3 Pagination Dots
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 2,
  },
  paginationDot: {
    height: 7,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#0284C7',
  },
  dotInactive: {
    width: 7,
    backgroundColor: '#CBD5E1',
  },

  // Action Buttons (Elevated & 100% Android System Bar Clearance)
  buttonsWrapper: {
    width: '100%',
    paddingHorizontal: 24,
    gap: 14,
    paddingBottom: Platform.OS === 'android' ? 36 : 24,
    marginTop: 8,
  },
  loginButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
      } as any,
      default: {
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  registerPrompt: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  registerLink: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#7CB342', // Telebirr brand green
  },
});
