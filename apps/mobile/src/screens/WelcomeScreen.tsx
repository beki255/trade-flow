import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { CorridorIsometricIllustration } from '../components/CorridorIsometricIllustration';
import { CorridorRouteMapIllustration } from '../components/CorridorRouteMapIllustration';
import { CorridorHighwayIllustration } from '../components/CorridorHighwayIllustration';

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
  const [activeDot, setActiveDot] = useState(0);
  const { toggleLanguage } = useLanguage();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  // Responsive slide width for identical rendering on both native mobile and web device frame
  const slideWidth = Math.min(width, 412);

  const slideData = [
    {
      title: 'AI-Powered Logistics',
      desc: 'Intelligent freight matching and real-time corridor telematics connecting Djibouti Port to Addis Ababa.',
    },
    {
      title: 'Interactive Corridor Map',
      desc: 'Live tracking across Lake Abbe, Galafi border customs, and Modjo Dry Port checkpoints.',
    },
    {
      title: 'Cross-Border Cargo & Journey',
      desc: 'Track your freight journey along the Ethiopia–Djibouti corridor, record check-ins offline, and receive digital payments instantly.',
    },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / slideWidth);
    if (pageIndex !== activeDot && pageIndex >= 0 && pageIndex < 3) {
      setActiveDot(pageIndex);
    }
  };

  const handleDotPress = (index: number) => {
    setActiveDot(index);
    scrollRef.current?.scrollTo({ x: index * slideWidth, animated: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F9FD" />

      {/* Main Container */}
      <View style={styles.content}>
        
        {/* Top Header: TradeFlow Branding & Language Indicator */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.brandTitle}>TradeFlow</Text>
          <TouchableOpacity
            style={styles.langBtn}
            onPress={toggleLanguage}
            activeOpacity={0.8}
          >
            <Text style={styles.langBtnText}>🌐 English</Text>
          </TouchableOpacity>
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
            <View style={[styles.slideCard, { width: slideWidth }]}>
              <CorridorIsometricIllustration />
            </View>

            {/* SLIDE 1 [○ ● ○]: Full Bleed 2D Corridor Route Map Illustration */}
            <View style={[styles.slideCard, { width: slideWidth }]}>
              <CorridorRouteMapIllustration />
            </View>

            {/* SLIDE 2 [○ ○ ●]: Full Bleed Cross-Border Highway Illustration */}
            <View style={[styles.slideCard, { width: slideWidth }]}>
              <CorridorHighwayIllustration />
            </View>
          </ScrollView>
        </View>

        {/* Dynamic Titles & Descriptions synced with Carousel Swipe */}
        <View style={styles.textContainer}>
          <Text style={styles.slideTitle}>
            {slideData[activeDot].title}
          </Text>
          <Text style={styles.slideDescription}>
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
                  activeDot === idx ? styles.dotActive : styles.dotInactive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Action Buttons */}
        <View style={styles.buttonsWrapper}>
          
          {/* Primary Solid Blue Button: Login */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={onNavigateLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          {/* Secondary Outlined Button: Create Account */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={onNavigateRegister}
            activeOpacity={0.85}
          >
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>

          {/* Fast Demo One-Click Fill */}
          <TouchableOpacity
            style={styles.fastDemoWrapper}
            onPress={onFastDemoLogin}
            activeOpacity={0.7}
          >
            <Ionicons name="flash-outline" size={13} color="#0284C7" style={{ marginRight: 4 }} />
            <Text style={styles.fastDemoLabel}>Fast Demo Driver</Text>
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
    justifyContent: 'space-between',
    paddingVertical: 12,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingBottom: 4,
    paddingHorizontal: 22,
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
  carouselContainer: {
    width: '100%',
    height: 280,
    marginTop: 4,
    overflow: 'hidden',
  },
  scrollTrack: {
    alignItems: 'center',
  },
  slideCard: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Dynamic Titles & Descriptions
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    minHeight: 78,
    justifyContent: 'center',
    width: '100%',
  },
  slideTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
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
    marginVertical: 4,
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

  // Action Buttons
  buttonsWrapper: {
    width: '100%',
    paddingHorizontal: 22,
    gap: 10,
    paddingBottom: 4,
  },
  loginButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#0284C7',
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#0284C7',
    fontSize: 15,
    fontWeight: '800',
  },
  fastDemoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  fastDemoLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
});
