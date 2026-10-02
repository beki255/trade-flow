import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

/**
 * Universal & Bulletproof API Base URL Resolver
 * Automatically detects the current computer LAN IP in real-time, even when Wi-Fi changes daily:
 * 1. Explicit environment variable (EXPO_PUBLIC_API_URL)
 * 2. NativeModules.SourceCode.scriptURL (Exact IP from which the JS bundle was downloaded on physical phone)
 * 3. Expo Constants (hostUri, debuggerHost, linkingUri)
 * 4. Web browser fallback (http://localhost:5000)
 * 5. Android Emulator (10.0.2.2)
 * 6. Localhost fallback (127.0.0.1:5000)
 */
export const getApiBaseUrl = (): string => {

  // 2. Explicit environment variable if configured
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 3. Web browser: Always use localhost:5000 directly if no custom IP
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }

  // 4. React Native SourceCode scriptURL (Most accurate on physical phone / Expo Go)
  try {
    const scriptURL: string | undefined = (NativeModules as any)?.SourceCode?.scriptURL;
    if (scriptURL && typeof scriptURL === 'string') {
      const match = scriptURL.match(/https?:\/\/([^/:]+)/) || scriptURL.match(/exp:\/\/([^/:]+)/);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return `http://${match[1]}:5000`;
      }
    }
  } catch (e) {}

  // 5. Expo Constants hostUri / debuggerHost (Expo Go Wi-Fi IP auto-detection)
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ||
      (Constants as any)?.manifest2?.extra?.expoClient?.hostUri ||
      (Constants as any)?.manifest?.debuggerHost ||
      (Constants as any)?.manifest?.hostUri;

    if (hostUri && typeof hostUri === 'string') {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return `http://${ip}:5000`;
      }
    }
  } catch (e) {}

  // 6. Expo Linking URI (exp://192.168.x.x:8081)
  try {
    if (Constants.linkingUri && typeof Constants.linkingUri === 'string') {
      const linkMatch = Constants.linkingUri.match(/\/\/([^/:]+)/);
      if (linkMatch && linkMatch[1] && linkMatch[1] !== 'localhost' && linkMatch[1] !== '127.0.0.1') {
        return `http://${linkMatch[1]}:5000`;
      }
    }
  } catch (e) {}

  // 7. Android Emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  // 8. Default local fallback
  return 'http://localhost:5000';
};

/**
 * Resilient API Fetch Helper with generous timeout and fallback support
 */
export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 12000
): Promise<Response> => {
  const primaryBaseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${primaryBaseUrl}${cleanEndpoint}`, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err: any) {
    clearTimeout(timeoutId);

    // Fallback strategy 1: If on Web or if primary URL failed, retry with localhost
    if (Platform.OS === 'web' && primaryBaseUrl !== 'http://localhost:5000') {
      try {
        const fallbackRes = await fetch(`http://localhost:5000${cleanEndpoint}`, {
          ...options,
        });
        return fallbackRes;
      } catch (fallbackErr) {}
    }

    // Fallback strategy 2: If on Android physical phone / Expo Go, try computer's active LAN / Hotspot IP
    if (Platform.OS === 'android') {
      try {
        const fallbackHost = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.137.1:5000';
        const lanRes = await fetch(`${fallbackHost}${cleanEndpoint}`, {
          ...options,
        });
        return lanRes;
      } catch (lanErr) {}
    }

    throw err;
  }
};
