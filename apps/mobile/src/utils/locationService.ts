import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface RealGpsLocation {
  latitude: number;
  longitude: number;
  speedKmh: number;
  heading: number;
  accuracy: number;
  timestamp: string;
}

export type LocationPermissionStatus = 'GRANTED' | 'DENIED' | 'PENDING' | 'UNAVAILABLE';

let locationSubscription: Location.LocationSubscription | null = null;
let webWatchId: number | null = null;

/**
 * Check current GPS location permission without actively triggering the prompt dialog
 */
export const checkLocationPermission = async (): Promise<LocationPermissionStatus> => {
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      if ((navigator as any).permissions && (navigator as any).permissions.query) {
        try {
          const result = await (navigator as any).permissions.query({ name: 'geolocation' });
          if (result.state === 'granted') return 'GRANTED';
          if (result.state === 'denied') return 'DENIED';
          return 'PENDING';
        } catch {
          // Fall through
        }
      }
      return typeof navigator.geolocation !== 'undefined' ? 'PENDING' : 'UNAVAILABLE';
    }

    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === 'granted') return 'GRANTED';
    if (status === 'denied') return 'DENIED';
    return 'PENDING';
  } catch (error) {
    console.warn('Check location permission error:', error);
    return 'PENDING';
  }
};

/**
 * Request real GPS foreground location permission from device / browser
 */
export const requestLocationPermission = async (): Promise<LocationPermissionStatus> => {
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve('GRANTED'),
          () => resolve('DENIED'),
          { timeout: 8000, enableHighAccuracy: true }
        );
      });
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      return 'GRANTED';
    }
    return 'DENIED';
  } catch (error) {
    console.warn('Location permission request error:', error);
    return 'UNAVAILABLE';
  }
};

/**
 * Get the driver's current real-time GPS coordinates
 */
export const getCurrentRealGpsLocation = async (): Promise<RealGpsLocation | null> => {
  try {
    // 1. Browser Web fallback if on web
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const speedKmh = typeof pos.coords.speed === 'number' && pos.coords.speed > 0
              ? Math.round(pos.coords.speed * 3.6 * 10) / 10
              : 0;
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              speedKmh,
              heading: pos.coords.heading || 0,
              accuracy: pos.coords.accuracy || 10,
              timestamp: new Date(pos.timestamp).toISOString(),
            });
          },
          (err) => {
            console.warn('Web geolocation error:', err);
            resolve(null);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
        );
      });
    }

    // 2. Native Expo Location (Android & iOS)
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const speedRaw = position.coords.speed;
    const speedKmh = typeof speedRaw === 'number' && speedRaw > 0
      ? Math.round(speedRaw * 3.6 * 10) / 10
      : 0;

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      speedKmh,
      heading: position.coords.heading || 0,
      accuracy: position.coords.accuracy || 10,
      timestamp: new Date(position.timestamp).toISOString(),
    };
  } catch (error) {
    console.warn('Error fetching current GPS location:', error);
    return null;
  }
};

/**
 * Start continuous live GPS position watcher
 */
export const startLiveLocationWatch = async (
  onUpdate: (loc: RealGpsLocation) => void
): Promise<boolean> => {
  try {
    stopLiveLocationWatch();

    // 1. Web browser watcher
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      webWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          const speedKmh = typeof pos.coords.speed === 'number' && pos.coords.speed > 0
            ? Math.round(pos.coords.speed * 3.6 * 10) / 10
            : 0;
          onUpdate({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            speedKmh,
            heading: pos.coords.heading || 0,
            accuracy: pos.coords.accuracy || 10,
            timestamp: new Date(pos.timestamp).toISOString(),
          });
        },
        (err) => console.warn('Web watch position error:', err),
        { enableHighAccuracy: true, maximumAge: 2500 }
      );
      return true;
    }

    // 2. Native Expo Location watcher
    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 2500,
        distanceInterval: 5, // report update every 5 meters
      },
      (position) => {
        const speedRaw = position.coords.speed;
        const speedKmh = typeof speedRaw === 'number' && speedRaw > 0
          ? Math.round(speedRaw * 3.6 * 10) / 10
          : 0;

        onUpdate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speedKmh,
          heading: position.coords.heading || 0,
          accuracy: position.coords.accuracy || 10,
          timestamp: new Date(position.timestamp).toISOString(),
        });
      }
    );

    return true;
  } catch (error) {
    console.warn('Error starting live location watcher:', error);
    return false;
  }
};

/**
 * Stop live location watcher
 */
export const stopLiveLocationWatch = () => {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }
  if (webWatchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
    navigator.geolocation.clearWatch(webWatchId);
    webWatchId = null;
  }
};
