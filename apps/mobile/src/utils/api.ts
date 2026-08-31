import { Platform, NativeModules } from 'react-native';

/**
 * Dynamically and reliably resolves the TradeFlow Backend API URL:
 * 1. process.env.EXPO_PUBLIC_API_URL
 * 2. NativeModules.SourceCode.scriptURL (React Native's native Metro bundle host IP on physical mobile/emulator)
 * 3. window.location.hostname (Web browser)
 * 4. 10.0.2.2:5000 (Android Emulator fallback)
 * 5. localhost:5000 (Default)
 */
export const getApiBaseUrl = (): string => {
  // 1. Explicit env override
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. React Native NativeModules bundle scriptURL (Extracts the real host machine LAN IP on Expo Go / Phone)
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL && typeof scriptURL === 'string') {
      const match = scriptURL.match(/^https?:\/\/([^:\/]+)/);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return `http://${match[1]}:5000`;
      }
    }
  } catch (e) {
    // ignore
  }

  // 3. Web browser environment
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:5000`;
  }

  // 4. Android Emulator loopback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  // 5. Default fallback
  return 'http://localhost:5000';
};
