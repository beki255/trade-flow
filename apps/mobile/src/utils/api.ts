import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const PRODUCTION_API_URL = 'https://tradeflow-api-7abs.onrender.com';

/**
 * Universal & Bulletproof API Base URL Resolver
 * Guarantees that Standalone Android APK builds ALWAYS communicate
 * with the live Render Cloud Backend (https://tradeflow-api-7abs.onrender.com).
 */
export const getApiBaseUrl = (): string => {
  // 1. Explicit environment variable
  if (process.env.EXPO_PUBLIC_API_URL && process.env.EXPO_PUBLIC_API_URL.startsWith('http')) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Extra configuration in app.json
  const extraApiUrl = Constants.expoConfig?.extra?.apiUrl;
  if (extraApiUrl && typeof extraApiUrl === 'string' && extraApiUrl.startsWith('http')) {
    return extraApiUrl;
  }

  // 3. For Web browser testing:
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000';
      }
    }
    return PRODUCTION_API_URL;
  }

  // 4. Default for Standalone Android APK & Physical Devices:
  return PRODUCTION_API_URL;
};

/**
 * Resilient API Fetch Helper with generous timeout (30s) to handle Render cold-starts gracefully
 */
export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 30000
): Promise<Response> => {
  const primaryBaseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const targetUrl = `${primaryBaseUrl}${cleanEndpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(targetUrl, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err: any) {
    clearTimeout(timeoutId);

    // If primary was not the production URL, try production URL as emergency fallback
    if (primaryBaseUrl !== PRODUCTION_API_URL) {
      try {
        const fallbackRes = await fetch(`${PRODUCTION_API_URL}${cleanEndpoint}`, {
          ...options,
        });
        return fallbackRes;
      } catch (e) {}
    }

    throw err;
  }
};
