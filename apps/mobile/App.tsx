import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { TransporterPortalScreen } from './src/screens/transporter/TransporterPortalScreen';
import { DriverPortalScreen } from './src/screens/driver/DriverPortalScreen';
import { useFonts } from 'expo-font';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LanguageProvider } from './src/context/LanguageContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { getApiBaseUrl } from './src/utils/api';

function MainApp() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'login' | 'register' | 'active_home'>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      const savedUser = window.localStorage.getItem('tradeflow_mobile_user');
      const savedScreen = window.localStorage.getItem('tradeflow_mobile_screen');
      if (savedUser && savedScreen === 'active_home') {
        return 'active_home';
      }
    }
    return 'welcome';
  });

  const [currentRole, setCurrentRole] = useState<'DRIVER' | 'TRANSPORTER'>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      const savedRole = window.localStorage.getItem('tradeflow_mobile_role');
      if (savedRole === 'DRIVER' || savedRole === 'TRANSPORTER') {
        return savedRole;
      }
    }
    return 'DRIVER';
  });

  const [currentUser, setCurrentUser] = useState<any>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        const savedUser = window.localStorage.getItem('tradeflow_mobile_user');
        if (savedUser) {
          return JSON.parse(savedUser);
        }
      } catch (e) {
        console.warn('Error reading saved user:', e);
      }
    }
    return null;
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={styles.loadingText}>Loading TradeFlow...</Text>
      </View>
    );
  }

  const handleLoginSuccess = (role: string, user?: any) => {
    const normRole = (role ? role.toUpperCase() : 'DRIVER') as 'DRIVER' | 'TRANSPORTER';
    setCurrentRole(normRole);
    if (user) setCurrentUser(user);
    setCurrentScreen('active_home');

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        if (user) {
          window.localStorage.setItem('tradeflow_mobile_user', JSON.stringify(user));
        }
        window.localStorage.setItem('tradeflow_mobile_role', normRole);
        window.localStorage.setItem('tradeflow_mobile_screen', 'active_home');
      } catch (e) {
        console.warn('Could not save session to localStorage:', e);
      }
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('tradeflow_mobile_user');
        window.localStorage.removeItem('tradeflow_mobile_role');
        window.localStorage.removeItem('tradeflow_mobile_screen');
        window.localStorage.removeItem('tradeflow_transporter_tab');
        window.localStorage.removeItem('tradeflow_driver_tab');
      } catch (e) {
        console.warn('Could not clear session from localStorage:', e);
      }
    }
    setCurrentUser(null);
    setCurrentScreen('welcome');
  };

  // 1. Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <WelcomeScreen
        onNavigateLogin={() => setCurrentScreen('login')}
        onNavigateRegister={() => setCurrentScreen('register')}
      />
    );
  }

  // 2. Login Screen
  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onBack={() => setCurrentScreen('welcome')}
        onNavigateRegister={() => setCurrentScreen('register')}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // 3. Register Screen
  if (currentScreen === 'register') {
    return (
      <RegisterScreen
        onBack={() => setCurrentScreen('welcome')}
        onNavigateLogin={() => setCurrentScreen('login')}
        onRegisterSuccess={handleLoginSuccess}
      />
    );
  }

  // 4. Role-Specific Mobile Portals
  if (currentRole === 'TRANSPORTER') {
    return <TransporterPortalScreen onLogout={handleLogout} user={currentUser} />;
  }

  return <DriverPortalScreen onLogout={handleLogout} user={currentUser} />;
}

function ThemedAppContainer({ isDesktopWeb }: { isDesktopWeb: boolean }) {
  const { colors, isDark } = useTheme();

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const dynamicStyleId = 'tradeflow-mobile-theme-overrides';
      let styleTag = document.getElementById(dynamicStyleId) as HTMLStyleElement;
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = dynamicStyleId;
        document.head.appendChild(styleTag);
      }
      if (isDark) {
        styleTag.innerHTML = `
          /* Mobile Dark Mode web surface overrides */
          div[style*="background-color: rgb(244, 249, 253)"],
          div[style*="background-color: #F4F9FD"],
          div[style*="background-color: #f4f9fd"] {
            background-color: #090E17 !important;
          }
          div[style*="background-color: rgb(255, 255, 255)"]:not([style*="color: rgb(255, 255, 255)"]),
          div[style*="background-color: #FFFFFF"],
          div[style*="background-color: #ffffff"] {
            background-color: #0F172A !important;
            border-color: #1E293B !important;
          }
          div[style*="background-color: rgb(248, 250, 252)"],
          div[style*="background-color: #F8FAFC"],
          div[style*="background-color: rgb(241, 245, 249)"],
          div[style*="background-color: #F1F5F9"] {
            background-color: #1E293B !important;
            border-color: #334155 !important;
          }
          div[style*="border-color: rgb(226, 234, 242)"],
          div[style*="border-color: #E2EAF2"],
          div[style*="border-color: #e2eaf2"],
          div[style*="border-color: #E2E8F0"] {
            border-color: #1E293B !important;
          }
          div[style*="color: rgb(15, 23, 42)"],
          div[style*="color: #0F172A"] {
            color: #F8FAFC !important;
          }
          div[style*="color: rgb(51, 65, 85)"],
          div[style*="color: #334155"] {
            color: #E2E8F0 !important;
          }
        `;
      } else {
        styleTag.innerHTML = '';
      }
    }
  }, [isDark]);

  return (
    <View style={[styles.outerRoot, !isDesktopWeb && { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.appContainer,
          { backgroundColor: colors.background },
          isDesktopWeb ? styles.desktopDeviceFrame : styles.mobileFullViewport,
          isDesktopWeb && isDark && { borderColor: '#334155' },
        ]}
      >
        <MainApp />
      </View>
    </View>
  );
}

export default function App() {
  const { width } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === 'web' && width > 480;

  useEffect(() => {
    // Inject global responsive styles for web devtools
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'tradeflow-mobile-viewport-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          html, body, #root {
            height: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: #090E17;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            -webkit-font-smoothing: antialiased;
          }
          * {
            box-sizing: border-box;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <ThemedAppContainer isDesktopWeb={isDesktopWeb} />
      </LanguageProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  outerRoot: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#090E17',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    backgroundColor: '#F4F9FD',
    overflow: 'hidden',
  },
  mobileFullViewport: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  desktopDeviceFrame: {
    width: 412,
    height: 870,
    maxHeight: '96%',
    borderRadius: 36,
    borderWidth: 6,
    borderColor: '#1E293B',
    elevation: 12,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F4F9FD',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
});
