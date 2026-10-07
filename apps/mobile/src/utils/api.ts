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
  // 1. Web browser: Always match the browser's hostname (localhost or LAN IP)
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      return `http://${window.location.hostname}:5000`;
    }
    return 'http://localhost:5000';
  }

  // 2. React Native SourceCode scriptURL (The EXACT IP that served the JS bundle to the physical phone)
  try {
    const scriptURL: string | undefined = (NativeModules as any)?.SourceCode?.scriptURL;
    if (scriptURL && typeof scriptURL === 'string') {
      const match = scriptURL.match(/https?:\/\/([^/:]+)/) || scriptURL.match(/exp:\/\/([^/:]+)/);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return `http://${match[1]}:5000`;
      }
    }
  } catch (e) {}

  // 3. Expo Constants hostUri / debuggerHost (Expo Go Wi-Fi IP auto-detection)
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

  // 4. Expo Linking URI (exp://192.168.x.x:8081)
  try {
    if (Constants.linkingUri && typeof Constants.linkingUri === 'string') {
      const linkMatch = Constants.linkingUri.match(/\/\/([^/:]+)/);
      if (linkMatch && linkMatch[1] && linkMatch[1] !== 'localhost' && linkMatch[1] !== '127.0.0.1') {
        return `http://${linkMatch[1]}:5000`;
      }
    }
  } catch (e) {}

  // 5. Explicit environment variable if configured
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 6. Android Emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  // 7. Active LAN IP fallback for this workstation
  return 'http://10.18.56.25:5000';
};

/**
 * Resilient API Fetch Helper with generous timeout and fallback support
 */
export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 6000
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

    // Fallback candidates to try if primary URL failed
    const candidateHosts: string[] = [];
    if (Platform.OS === 'web') {
      candidateHosts.push('http://localhost:5000');
    } else {
      candidateHosts.push('http://10.18.56.25:5000');
      candidateHosts.push('http://192.168.137.1:5000');
      if (Platform.OS === 'android') candidateHosts.push('http://10.0.2.2:5000');
    }

    for (const host of candidateHosts) {
      if (host === primaryBaseUrl) continue;
      try {
        const fallbackRes = await fetch(`${host}${cleanEndpoint}`, {
          ...options,
        });
        return fallbackRes;
      } catch (e) {
        // try next fallback
      }
    }

    throw err;
  }
};
