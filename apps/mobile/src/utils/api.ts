import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Universal API Base URL Resolver
 * Works seamlessly across:
 * 1. Mobile Web in desktop/phone browser (http://${hostname}:5000)
 * 2. Mobile Expo Go on physical iOS & Android devices over Wi-Fi (extracts computer LAN IP)
 * 3. Android / iOS Emulators
 */
export const getApiBaseUrl = (): string => {
  // 1. Explicit environment variable if configured
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Web browser (matches current URL hostname dynamically)
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window?.location?.hostname) {
    const host = window.location.hostname;
    return `http://${host}:5000`;
  }

  // 3. Expo Go on Physical Phone or Simulator: Extract host machine LAN IP
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any)?.manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5000`;
    }
  }

  // 4. Android Emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  // 5. Default local fallback
  return 'http://localhost:5000';
};
