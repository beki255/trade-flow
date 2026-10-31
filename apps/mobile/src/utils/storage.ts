import { Platform } from 'react-native';

// Fallback in-memory map
const memoryStore = new Map<string, string>();

let nativeAsyncStorage: any = null;
try {
  nativeAsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  console.warn('[storage] Native AsyncStorage module could not be required:', e);
}

/**
 * Universal Persistent Storage Utility for TradeFlow Mobile
 * Works seamlessly on Android, iOS, Web, with robust fallback.
 */
export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      if (nativeAsyncStorage && typeof nativeAsyncStorage.getItem === 'function') {
        return await nativeAsyncStorage.getItem(key);
      }
      return memoryStore.get(key) || null;
    } catch (e) {
      console.warn(`[storage] getItem error for ${key}:`, e);
      return memoryStore.get(key) || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      if (nativeAsyncStorage && typeof nativeAsyncStorage.setItem === 'function') {
        await nativeAsyncStorage.setItem(key, value);
      } else {
        memoryStore.set(key, value);
      }
    } catch (e) {
      console.warn(`[storage] setItem error for ${key}:`, e);
      memoryStore.set(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      if (nativeAsyncStorage && typeof nativeAsyncStorage.removeItem === 'function') {
        await nativeAsyncStorage.removeItem(key);
      } else {
        memoryStore.delete(key);
      }
    } catch (e) {
      console.warn(`[storage] removeItem error for ${key}:`, e);
      memoryStore.delete(key);
    }
  },

  async multiRemove(keys: string[]): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        keys.forEach((k) => window.localStorage.removeItem(k));
      }
      if (nativeAsyncStorage && typeof nativeAsyncStorage.multiRemove === 'function') {
        await nativeAsyncStorage.multiRemove(keys);
      } else {
        keys.forEach((k) => memoryStore.delete(k));
      }
    } catch (e) {
      console.warn(`[storage] multiRemove error:`, e);
      keys.forEach((k) => memoryStore.delete(k));
    }
  },
};
