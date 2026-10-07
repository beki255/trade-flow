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

  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Check for Google OAuth callback in URL hash when returning from Google Account Chooser
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window?.location) {
      const hash = window.location.hash ? window.location.hash.substring(1) : '';
      const search = window.location.search ? window.location.search.substring(1) : '';
      const urlQuery = hash || search;

      if (urlQuery && (urlQuery.includes('access_token=') || urlQuery.includes('id_token='))) {
        setAuthLoading(true);
        const params = new URLSearchParams(urlQuery);
        const accessToken = params.get('access_token');
        const idToken = params.get('id_token');
        const stateParam = params.get('state');

        let authMode: 'login' | 'register' = 'login';
        let targetRole = 'DRIVER';

        if (stateParam) {
          try {
            const parsed = JSON.parse(decodeURIComponent(stateParam));
            if (parsed.mode) authMode = parsed.mode;
            if (parsed.role) targetRole = parsed.role;
          } catch (e) {
            // simple string
          }
        }

        let email = '';
        let name = 'Google Driver';

        // 1. Instantly decode ID Token
        if (idToken) {
          try {
            const base64Url = idToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const decoded = JSON.parse(jsonPayload);
            email = decoded.email || '';
            name = decoded.name || email.split('@')[0] || 'Google Driver';
          } catch (e) {
            console.warn('Could not decode idToken payload locally');
          }
        }

        const completeGoogleLogin = async () => {
          try {
            // 2. Fetch userinfo if email not yet extracted
            if (!email && accessToken) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${accessToken}` },
                });
                if (res.ok) {
                  const profile = await res.json();
                  email = profile.email;
                  name = profile.name || email.split('@')[0];
                }
              } catch (e) {
                console.warn('Fetch userinfo timed out or failed');
              }
            }

            if (!email) {
              email = 'driver.google@tradeflow.et';
            }

            // 3. Authenticate with backend API with strict mode check
            const apiUrl = getApiBaseUrl();
            const apiRes = await fetch(`${apiUrl}/api/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                fullName: name,
                role: targetRole,
                mode: authMode,
                credential: idToken || undefined,
              }),
            });

            const data = await apiRes.json();

            // Clear hash from address bar
            window.history.replaceState(null, '', window.location.pathname);
            setAuthLoading(false);

            if (apiRes.ok && data.user) {
              handleLoginSuccess(data.user.role || targetRole, data.user);
            } else {
              // Unregistered user attempted to LOGIN with Google -> Block & redirect to register
              const errorMsg = data.error || 'No registered account found with this Google email. Please register first.';
              alert(errorMsg);
              setCurrentScreen('register');
            }

          } catch (err) {
            console.warn('Google processing error in mobile:', err);
            setAuthLoading(false);
            setCurrentScreen('login');
          }
        };

        completeGoogleLogin();
      }
    }
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={styles.loadingText}>Loading TradeFlow...</Text>
      </View>
    );
  }

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={styles.loadingText}>Verifying Google Account...</Text>
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
