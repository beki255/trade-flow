import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { TransporterPortalScreen } from './src/screens/transporter/TransporterPortalScreen';
import { DriverPortalScreen } from './src/screens/driver/DriverPortalScreen';
import { LanguageProvider } from './src/context/LanguageContext';

function MainApp() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'login' | 'register' | 'active_home'>('welcome');
  const [currentRole, setCurrentRole] = useState<'DRIVER' | 'TRANSPORTER'>('DRIVER');

  const handleLoginSuccess = (role: string) => {
    setCurrentRole(role as 'DRIVER' | 'TRANSPORTER');
    setCurrentScreen('active_home');
  };

  const handleFastDemoDriver = () => {
    setCurrentRole('DRIVER');
    setCurrentScreen('active_home');
  };

  // 1. Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <WelcomeScreen
        onNavigateLogin={() => setCurrentScreen('login')}
        onNavigateRegister={() => setCurrentScreen('register')}
        onFastDemoLogin={handleFastDemoDriver}
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
    return <TransporterPortalScreen onLogout={() => setCurrentScreen('welcome')} />;
  }

  return <DriverPortalScreen onLogout={() => setCurrentScreen('welcome')} />;
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
    <LanguageProvider>
      <View style={styles.outerRoot}>
        <View
          style={[
            styles.appContainer,
            isDesktopWeb ? styles.desktopDeviceFrame : styles.mobileFullViewport,
          ]}
        >
          <MainApp />
        </View>
      </View>
    </LanguageProvider>
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
  // Mobile / DevTools Device Mode (iPhone, Pixel, Galaxy): Exact 100% Fit
  mobileFullViewport: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  // Desktop Browser: Realistic Smartphone Shell
  desktopDeviceFrame: {
    width: 412,
    height: 870,
    maxHeight: '96%',
    borderRadius: 36,
    borderWidth: 6,
    borderColor: '#1E293B',
    elevation: 12,
  },
});
