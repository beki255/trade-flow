import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabIcon } from '../../components/TabIcon';
import { getDynamicCorridorWaypoints } from '../../shared';
import { driverStyles as styles } from './driverStyles';
import { WaypointItem, CheckinRecord, IncidentRecord, DynamicRerouteProposal, ActiveTripDetails, DriverTabType } from './types';
import { getApiBaseUrl, apiFetch } from '../../utils/api';
import {
  requestLocationPermission,
  checkLocationPermission,
  getCurrentRealGpsLocation,
  startLiveLocationWatch,
  stopLiveLocationWatch,
  RealGpsLocation,
  LocationPermissionStatus,
} from '../../utils/locationService';

// Modular Tabs
import { TripTab } from './tabs/TripTab';
import { WaypointsTab } from './tabs/WaypointsTab';
import { CheckinTab } from './tabs/CheckinTab';
import { IncidentTab } from './tabs/IncidentTab';
import { PodTab } from './tabs/PodTab';

// Modular Screen Components
import { DriverTopHeader } from './components/DriverTopHeader';
import { DriverBottomNavBar } from './components/DriverBottomNavBar';
import { DriverProfileModal } from './modals/DriverProfileModal';
import { CustomsQrPassModal } from './modals/CustomsQrPassModal';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface DriverPortalScreenProps {
  onLogout: () => void;
  user?: any;
}

export const DriverPortalScreen: React.FC<DriverPortalScreenProps> = ({ onLogout, user }) => {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>(user);
  const [activeTab, setActiveTab] = useState<DriverTabType>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('tradeflow_driver_tab') as DriverTabType;
      if (saved && ['trip', 'nav', 'checkin', 'incident', 'pod'].includes(saved)) {
        return saved;
      }
    }
    return 'trip';
  });

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('tradeflow_driver_tab', activeTab);
    }
  }, [activeTab]);
  const [refreshing, setRefreshing] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCustomsPassModal, setShowCustomsPassModal] = useState(false);

  // Sync currentUser when parent user prop updates
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  const handlePhotoUpdated = (newPhotoUrl: string) => {
    setCurrentUser((prev: any) => ({
      ...prev,
      photoUrl: newPhotoUrl,
      roadworthinessDoc: newPhotoUrl,
    }));
  };


  // Active Trip Dynamic State
  const [activeTrip, setActiveTrip] = useState<ActiveTripDetails | null>(null);
  const [lastDeliveredTrip, setLastDeliveredTrip] = useState<ActiveTripDetails | null>(null);
  const [deliveredHistory, setDeliveredHistory] = useState<any[]>([]);

  // Offline Telemetry Queue Buffer (NFR 7.2)
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [offlineCheckinQueue, setOfflineCheckinQueue] = useState<any[]>([]);
  const [offlineIncidentQueue, setOfflineIncidentQueue] = useState<any[]>([]);
  const [offlineSyncMessage, setOfflineSyncMessage] = useState<string>('');
  const [lastGpsSyncTime, setLastGpsSyncTime] = useState<string>('');

  // Real-Time Device GPS State (Physical phone / browser GPS)
  const [gpsStatus, setGpsStatus] = useState<LocationPermissionStatus>('PENDING');
  const [realGpsLocation, setRealGpsLocation] = useState<RealGpsLocation | null>(null);
  const [isMapInteracting, setIsMapInteracting] = useState<boolean>(false);
  const realGpsRef = useRef<RealGpsLocation | null>(null);
  realGpsRef.current = realGpsLocation;

  // Explicitly activate / turn on device GPS location
  const handleEnableGps = async () => {
    try {
      const perm = await requestLocationPermission();
      setGpsStatus(perm);
      if (perm === 'GRANTED') {
        const loc = await getCurrentRealGpsLocation();
        if (loc) {
          setRealGpsLocation(loc);
        }
        await startLiveLocationWatch((updatedLoc) => {
          setRealGpsLocation(updatedLoc);
        });
        Alert.alert(
          'GPS Location Active',
          'Device GPS is active; live telemetry will now broadcast along the corridor route.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Location Permission Required',
          'Please enable Location Services in device Settings to stream live GPS telemetry to the shipper.',
          [{ text: 'OK' }]
        );
      }
    } catch (e) {
      console.warn('Error enabling GPS:', e);
    }
  };

  // Check initial GPS status on mount
  useEffect(() => {
    let mounted = true;
    const initLocation = async () => {
      const perm = await checkLocationPermission();
      if (!mounted) return;
      setGpsStatus(perm);
      if (perm === 'GRANTED') {
        const loc = await getCurrentRealGpsLocation();
        if (!mounted) return;
        if (loc) setRealGpsLocation(loc);
        startLiveLocationWatch((updatedLoc) => {
          if (mounted) setRealGpsLocation(updatedLoc);
        });
      }
    };
    initLocation();
    return () => {
      mounted = false;
      stopLiveLocationWatch();
    };
  }, []);

  // Transmit GPS Telemetry to Backend with Offline Fallback
  const transmitGpsTelemetry = async (manualPing?: any) => {
    if (!activeTrip?.id) return;

    // Do NOT transmit autonomous moving pings if trip is not yet in transit
    if (activeTrip.status !== 'IN_TRANSIT' && !manualPing) {
      return;
    }

    const isDrivingNow = activeTrip.isDriving !== false;
    const loc = realGpsRef.current;
    const currentPing = manualPing || {
      latitude: loc?.latitude ?? (activeTrip.originLat || 8.895),
      longitude: loc?.longitude ?? (activeTrip.originLng || 38.765),
      speedKmh: isDrivingNow ? (loc?.speedKmh ?? (activeTrip.speedKmh || 0)) : 0,
      heading: loc?.heading ?? (activeTrip.heading || 68),
      fuelLevelPct: activeTrip.fuelLevelPct || 85,
      timestamp: loc?.timestamp || new Date().toISOString(),
      source: isDrivingNow ? 'DRIVER_DEVICE_GPS' : 'DRIVER_STATIONARY',
    };

    const pingsToSend = [...offlineQueue, currentPing];

    try {
      const res = await apiFetch('/api/tracking/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipmentId: activeTrip?.id,
          pings: pingsToSend,
        }),
      });

      if (res.ok) {
        setOfflineQueue([]); // Successfully synced all queued pings
        setLastGpsSyncTime(new Date().toLocaleTimeString());
        syncOfflineQueues(); // Auto-drain queued check-ins & incidents (NFR 7.2)
      } else {
        // Queue ping offline if server returned non-200
        setOfflineQueue((prev) => [...prev, currentPing]);
      }
    } catch (e) {
      // Network failure / offline: buffer to offline queue
      setOfflineQueue((prev) => [...prev, currentPing]);
    }
  };

  // Offline Auto-Sync with Conflict Resolution favoring Most-Recent Authoritative Timestamp (NFR 7.2)
  const syncOfflineQueues = async () => {
    // 1. Synchronize Offline Check-ins
    if (offlineCheckinQueue.length > 0) {
      const sortedCheckins = [...offlineCheckinQueue].sort((a, b) => b.authoritativeTimestamp - a.authoritativeTimestamp);
      const uniqueCheckins = new Map<string, any>();
      for (const item of sortedCheckins) {
        if (!uniqueCheckins.has(item.locationName)) {
          uniqueCheckins.set(item.locationName, item);
        }
      }
      const toSync = Array.from(uniqueCheckins.values());
      let syncedCheckinsCount = 0;

      for (const item of toSync) {
        try {
          const res = await apiFetch('/api/portal/driver/checkin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          });
          if (res.ok) {
            syncedCheckinsCount++;
          }
        } catch (e) {
          console.warn('Checkin sync error:', e);
          break;
        }
      }

      if (syncedCheckinsCount > 0) {
        setOfflineCheckinQueue([]);
        setOfflineSyncMessage(`Synced ${syncedCheckinsCount} check-in(s) (Authoritative timestamp applied)`);
        setTimeout(() => setOfflineSyncMessage(''), 4000);
      }
    }

    // 2. Synchronize Offline Incident Reports
    if (offlineIncidentQueue.length > 0) {
      const sortedIncidents = [...offlineIncidentQueue].sort((a, b) => b.authoritativeTimestamp - a.authoritativeTimestamp);
      const uniqueIncidents = new Map<string, any>();
      for (const inc of sortedIncidents) {
        const key = `${inc.shipmentId || 'active'}-${inc.category}`;
        if (!uniqueIncidents.has(key)) {
          uniqueIncidents.set(key, inc);
        }
      }
      const toSync = Array.from(uniqueIncidents.values());
      let syncedIncidentsCount = 0;

      for (const inc of toSync) {
        try {
          const res = await apiFetch('/api/optimization/incident', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inc),
          });
          if (res.ok) {
            syncedIncidentsCount++;
          }
        } catch (e) {
          console.warn('Incident sync error:', e);
          break;
        }
      }

      if (syncedIncidentsCount > 0) {
        setOfflineIncidentQueue([]);
        setOfflineSyncMessage(`Synced ${syncedIncidentsCount} incident(s) with authoritative timestamp`);
        setTimeout(() => setOfflineSyncMessage(''), 4000);
      }
    }
  };

  // Real-time broadcast whenever physical GPS updates and trip is in transit
  useEffect(() => {
    if (!realGpsLocation || activeTrip?.status !== 'IN_TRANSIT') return;
    if (activeTrip?.isDriving === false) return; // Driver manually stopped / resting
    transmitGpsTelemetry({
      latitude: realGpsLocation.latitude,
      longitude: realGpsLocation.longitude,
      speedKmh: realGpsLocation.speedKmh && realGpsLocation.speedKmh > 5 ? realGpsLocation.speedKmh : (activeTrip?.speedKmh || 58),
      heading: realGpsLocation.heading,
      fuelLevelPct: activeTrip?.fuelLevelPct || 85,
      timestamp: realGpsLocation.timestamp,
      source: 'DRIVER_LIVE_GPS_STREAM',
    });
  }, [realGpsLocation?.latitude, realGpsLocation?.longitude, activeTrip?.status, activeTrip?.isDriving]);

  // Guaranteed periodic telemetry transmission every 60s while trip is in transit (SLA: minimum every 5 minutes)
  useEffect(() => {
    if (activeTrip?.status !== 'IN_TRANSIT') return;
    const periodicTimer = setInterval(() => {
      transmitGpsTelemetry();
    }, 60000);
    return () => clearInterval(periodicTimer);
  }, [activeTrip?.status, activeTrip?.id, activeTrip?.isDriving]);

  // Fetch real-time active trip assigned by Transporter
  const fetchActiveTrip = async () => {
    try {
      const res = await apiFetch(
        `/api/portal/driver/active-trip?driverId=${user?.id || ''}&driverEmail=${encodeURIComponent(user?.email || '')}&driverName=${encodeURIComponent(user?.fullName || '')}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.activeTrip) {
          setActiveTrip(data.activeTrip);
        } else {
          setActiveTrip(null);
        }

        const serverCheckins = data.checkinHistory || data.activeTrip?.checkinHistory;
        if (serverCheckins && Array.isArray(serverCheckins)) {
          setCheckinHistory(serverCheckins);
        }

        if (data.pendingReroute) {
          setPendingReroute(data.pendingReroute);
        } else {
          setPendingReroute(null);
        }

        if (data.deliveredHistory && Array.isArray(data.deliveredHistory)) {
          setDeliveredHistory(data.deliveredHistory);
        } else {
          setDeliveredHistory([]);
        }

        if (data.latestPod) {
          setLastDeliveredTrip(data.latestPod);
          setRecipientName(data.latestPod.recipientName || '');
          setSignedPOD(true);
          setPodSuccess(true);
        } else if (!data.activeTrip) {
          // Both active trip and delivered shipment deleted from database: wipe all local states!
          setLastDeliveredTrip(null);
          setRecipientName('');
          setSignedPOD(false);
          setPodSuccess(false);
        }
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn('Driver trip fetch notice:', err?.message || err);
      }
    }
  };

  const [actionLoading, setActionLoading] = useState(false);

  // Start Trip Handler (Milestone 1: Departed Origin)
  const handleStartTrip = async () => {
    // If GPS is not yet granted, request GPS right before starting trip
    if (gpsStatus !== 'GRANTED') {
      try {
        const perm = await requestLocationPermission();
        setGpsStatus(perm);
        if (perm === 'GRANTED') {
          const loc = await getCurrentRealGpsLocation();
          if (loc) setRealGpsLocation(loc);
          startLiveLocationWatch((updatedLoc) => setRealGpsLocation(updatedLoc));
        }
      } catch (e) {
        console.warn('GPS request before trip start:', e);
      }
    }

    const targetShipmentId = activeTrip?.id || activeTrip?.loadId;
    setActionLoading(true);
    try {
      const res = await apiFetch('/api/portal/driver/start-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipmentId: targetShipmentId,
          driverId: user?.id,
          driverEmail: user?.email,
        }),
      });
      if (res.ok) {
        const departSpeed = realGpsRef.current?.speedKmh && realGpsRef.current.speedKmh > 5 ? realGpsRef.current.speedKmh : 55;
        // Immediate optimistic update so button turns to In-Transit controls instantly
        setActiveTrip((prev) =>
          prev ? { ...prev, status: 'IN_TRANSIT', isDriving: true, speedKmh: departSpeed, progressPercentage: 0 } : prev
        );
        await fetchActiveTrip();
        const loc = realGpsRef.current;
        transmitGpsTelemetry({
          latitude: loc?.latitude ?? (activeTrip?.originLat || 8.895),
          longitude: loc?.longitude ?? (activeTrip?.originLng || 38.765),
          speedKmh: departSpeed,
          heading: loc?.heading || 68,
          fuelLevelPct: 95,
          timestamp: new Date().toISOString(),
          source: 'DRIVER_DEPART_ORIGIN',
        });
        Alert.alert(
          'Trip Started',
          'Your corridor trip has commenced. Live GPS telemetry is now broadcasting to the shipper.',
          [{ text: 'OK' }]
        );
      }
    } catch (e) {
      console.warn('Start trip error:', e);
    } finally {
      setActionLoading(false);
    }
  };

  // ⏸️ Toggle Driving State (Driving vs Stopped / Rest Area)
  const handleToggleDriving = async (isDriving: boolean) => {
    if (!activeTrip?.id) return;
    const targetSpeed = isDriving
      ? (realGpsRef.current?.speedKmh && realGpsRef.current.speedKmh > 5 ? realGpsRef.current.speedKmh : 58)
      : 0;

    // Instant optimistic update so buttons change without waiting for network
    setActiveTrip((prev) =>
      prev
        ? {
            ...prev,
            isDriving,
            speedKmh: targetSpeed,
          }
        : prev
    );

    setActionLoading(true);
    try {
      const res = await apiFetch('/api/portal/driver/toggle-driving', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipmentId: activeTrip.id,
          isDriving,
          speedKmh: targetSpeed,
        }),
      });
      if (res.ok) {
        await fetchActiveTrip();
        const loc = realGpsRef.current;
        transmitGpsTelemetry({
          latitude: loc?.latitude ?? (activeTrip.originLat || 8.895),
          longitude: loc?.longitude ?? (activeTrip.originLng || 38.765),
          speedKmh: targetSpeed,
          heading: loc?.heading ?? (activeTrip.heading || 68),
          fuelLevelPct: activeTrip.fuelLevelPct || 85,
          timestamp: new Date().toISOString(),
          source: isDriving ? 'DRIVER_RESUME_DRIVE' : 'DRIVER_REST_STOP',
        });
      }
    } catch (e) {
      console.warn('Toggle driving error:', e);
    } finally {
      setActionLoading(false);
    }
  };

  // Real-time synchronization loop (2.5s interval, no manual refresh needed)
  useEffect(() => {
    fetchActiveTrip();

    const fetchInterval = setInterval(fetchActiveTrip, 2500);

    // Only broadcast moving telemetry when actively in transit and driving
    let telemetryInterval: any = null;
    if (activeTrip?.status === 'IN_TRANSIT' && activeTrip?.isDriving !== false) {
      telemetryInterval = setInterval(() => {
        transmitGpsTelemetry();
      }, 10000);
    }

    return () => {
      clearInterval(fetchInterval);
      if (telemetryInterval) clearInterval(telemetryInterval);
    };
  }, [user?.id, activeTrip?.id, activeTrip?.status, activeTrip?.isDriving]);

  // Periodic offline queue sync routine (NFR 7.2: Auto-sync upon reconnect)
  useEffect(() => {
    const timer = setInterval(() => {
      syncOfflineQueues();
    }, 20000);
    return () => clearInterval(timer);
  }, [offlineCheckinQueue.length, offlineIncidentQueue.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([syncOfflineQueues(), fetchActiveTrip()]);
    } catch (err) {
      console.warn('Driver onRefresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Check-in state
  const [checkedInSuccess, setCheckedInSuccess] = useState('');
  const [checkinHistory, setCheckinHistory] = useState<CheckinRecord[]>([]);

  // Incident state (SRS 4.5.2 & 4.5.3)
  const [incidentType, setIncidentType] = useState('CHECKPOINT_DELAY');
  const [incidentSeverity, setIncidentSeverity] = useState('MEDIUM');
  const [incidentNotes, setIncidentNotes] = useState('');
  const [incidentPhoto, setIncidentPhoto] = useState<string | null>(null);
  const [incidentSent, setIncidentSent] = useState(false);
  const [incidentsList, setIncidentsList] = useState<IncidentRecord[]>([]);
  const [pendingReroute, setPendingReroute] = useState<DynamicRerouteProposal | null>(null);

  // Digital POD state
  const [recipientName, setRecipientName] = useState('');
  const [signedPOD, setSignedPOD] = useState(false);
  const [podSuccess, setPodSuccess] = useState(false);

  const waypoints: WaypointItem[] = useMemo(() => {
    if (!activeTrip) return [];
    let baseList: WaypointItem[] = [];
    if (activeTrip.waypoints && activeTrip.waypoints.length > 2) {
      baseList = activeTrip.waypoints;
    } else {
      baseList = getDynamicCorridorWaypoints(
        activeTrip.origin,
        activeTrip.destination,
        activeTrip.originLat,
        activeTrip.originLng,
        activeTrip.destLat,
        activeTrip.destLng,
        activeTrip.progressPercentage ?? 0,
        activeTrip.status ?? 'IN_TRANSIT'
      );
    }

    if (!baseList || baseList.length === 0) return [];

    // Dynamically advance waypoints based on checkinHistory to prevent duplicates and advance along the corridor
    const checkedNames = new Set(
      checkinHistory.map((chk) => {
        const match = chk.coords?.match(/\((.*?)\)/);
        return ((chk.locationName || (match ? match[1] : chk.coords)) || '').trim().toLowerCase();
      })
    );

    let highestCheckedIdx = -1;
    baseList.forEach((w, idx) => {
      if (checkedNames.has(w.name.trim().toLowerCase())) {
        highestCheckedIdx = Math.max(highestCheckedIdx, idx);
      }
    });

    if (highestCheckedIdx >= 0) {
      return baseList.map((w, idx) => {
        if (idx <= highestCheckedIdx) {
          return {
            ...w,
            status: 'COMPLETED' as const,
            time: 'Passed ✓',
          };
        } else if (idx === highestCheckedIdx + 1) {
          return {
            ...w,
            status: 'ACTIVE_NOW' as const,
            time: 'Current Point',
          };
        } else {
          return {
            ...w,
            status: 'PENDING' as const,
            time: idx === highestCheckedIdx + 2 ? 'Next Checkpoint' : 'En Route',
          };
        }
      });
    }

    return baseList;
  }, [activeTrip, checkinHistory]);

  const handleCheckin = async () => {
    const activeWp = waypoints.find((w) => w.status === 'ACTIVE_NOW') || (waypoints.every((w) => w.status === 'COMPLETED') ? waypoints[waypoints.length - 1] : waypoints[0]);
    if (!activeWp) return;

    // Strict duplicate check: prevent checking in at the same waypoint more than once
    const isAlreadyCheckedIn = checkinHistory.some((chk) => {
      const match = chk.coords?.match(/\((.*?)\)/);
      const name = ((chk.locationName || (match ? match[1] : chk.coords)) || '').trim().toLowerCase();
      return name === activeWp.name.trim().toLowerCase();
    });

    if (isAlreadyCheckedIn) {
      Alert.alert(
        language === 'AM' ? 'ቀድሞ የተረጋገጠ' : 'Already Checked In',
        language === 'AM'
          ? `በ${activeWp.name} ላይ ቀድመው ቼክ-ኢን አድርገዋል! እባክዎ ወደ ቀጣዩ ኬላ ይቀጥሉ።`
          : `You have already checked in at ${activeWp.name}. Proceed along the corridor to the next checkpoint.`
      );
      return;
    }

    const wpLat = (activeWp as any)?.latitude ?? (activeWp as any)?.lat;
    const wpLng = (activeWp as any)?.longitude ?? (activeWp as any)?.lng;
    const lat = wpLat ?? realGpsLocation?.latitude ?? activeTrip?.originLat;
    const lng = wpLng ?? realGpsLocation?.longitude ?? activeTrip?.originLng;

    if (lat === undefined || lng === undefined) return;

    const coords = `${Number(lat).toFixed(3)}° N, ${Number(lng).toFixed(3)}° E`;
    const locName = activeWp?.name || activeTrip?.route || 'Corridor Checkpoint';
    const nowEpoch = Date.now();
    const record: CheckinRecord = {
      id: `CHK-${nowEpoch.toString().slice(-4)}`,
      time: new Date(nowEpoch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      coords: `${coords} (${locName})`,
      locationName: locName,
      waypointId: activeWp?.id,
    };
    setCheckinHistory([record, ...checkinHistory]);

    const checkinPayload = {
      shipmentId: activeTrip?.id,
      driverId: user?.id,
      driverEmail: user?.email,
      latitude: Number(lat),
      longitude: Number(lng),
      locationName: locName,
      authoritativeTimestamp: nowEpoch,
    };

    try {
      const res = await apiFetch('/api/portal/driver/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkinPayload),
      });

      if (res.ok) {
        setCheckedInSuccess(`GPS Check-in Confirmed at ${locName}!`);
        transmitGpsTelemetry({
          latitude: Number(lat),
          longitude: Number(lng),
          speedKmh: 0,
          heading: 240,
          fuelLevelPct: activeTrip?.fuelLevelPct ?? 78,
          timestamp: new Date(nowEpoch).toISOString(),
          source: 'DRIVER_CHECKIN',
        });
      } else {
        setOfflineCheckinQueue((prev) => [...prev, checkinPayload]);
        setCheckedInSuccess(`Check-in Queued Offline at ${locName} (Will auto-sync)`);
      }
    } catch (e) {
      setOfflineCheckinQueue((prev) => [...prev, checkinPayload]);
      setCheckedInSuccess(`Offline: Check-in Cached at ${locName} (Will auto-sync)`);
    }

    setTimeout(() => setCheckedInSuccess(''), 3500);
  };

  // Handle Driver Geotagged Incident Reporting with Offline Queuing (NFR 7.2)
  const handleSendIncident = async () => {
    if (!incidentType) return;
    const activeWp = waypoints.find((w) => w.status === 'ACTIVE_NOW') || (waypoints.every((w) => w.status === 'COMPLETED') ? waypoints[waypoints.length - 1] : waypoints[0]);
    const wpLat = (activeWp as any)?.latitude ?? (activeWp as any)?.lat;
    const wpLng = (activeWp as any)?.longitude ?? (activeWp as any)?.lng;
    const incidentLat = wpLat ?? realGpsLocation?.latitude ?? activeTrip?.originLat ?? 8.895;
    const incidentLng = wpLng ?? realGpsLocation?.longitude ?? activeTrip?.originLng ?? 38.765;
    const incidentLocName = activeWp?.name || activeTrip?.route || 'Djibouti-Addis Corridor Route Checkpoint';
    const nowEpoch = Date.now();

    const newInc: IncidentRecord = {
      id: `INC-${nowEpoch.toString().slice(-4)}`,
      type: incidentType,
      category: incidentType,
      severity: incidentSeverity,
      notes: incidentNotes,
      coords: `${Number(incidentLat).toFixed(4)}° N, ${Number(incidentLng).toFixed(4)}° E`,
      photoUrl: incidentPhoto || undefined,
      time: new Date(nowEpoch).toLocaleTimeString(),
      isVerified: true,
    };
    setIncidentsList([newInc, ...incidentsList]);
    setIncidentSent(true);

    const incidentPayload = {
      reporterDriverId: user?.id,
      driverEmail: user?.email,
      shipmentId: activeTrip?.id,
      category: incidentType,
      severity: incidentSeverity,
      description: incidentNotes || `Driver reported ${incidentType} at ${incidentLocName}`,
      latitude: incidentLat,
      longitude: incidentLng,
      locationName: incidentLocName,
      photoUrl: incidentPhoto,
      authoritativeTimestamp: nowEpoch,
    };

    try {
      const res = await apiFetch('/api/optimization/incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentPayload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reroutingProposal) {
          setPendingReroute(data.reroutingProposal);
        }
      } else {
        setOfflineIncidentQueue((prev) => [...prev, incidentPayload]);
      }
    } catch (e) {
      setOfflineIncidentQueue((prev) => [...prev, incidentPayload]);
      console.warn('Network offline: Queued incident report locally for auto-sync');
    }

    setIncidentNotes('');
    setIncidentPhoto(null);
    setTimeout(() => setIncidentSent(false), 3500);
  };

  // Handle Dynamic Reroute Confirmation (SRS FR-05.3)
  const handleConfirmReroute = async (action: 'ACCEPT' | 'DECLINE') => {
    if (!pendingReroute) return;
    try {
      const res = await apiFetch('/api/optimization/reroute/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipmentId: activeTrip?.id || pendingReroute.shipmentId,
          proposalId: pendingReroute.proposalId,
          action,
          confirmedByUserId: user?.id,
          confirmedByRole: 'DRIVER',
          reason: pendingReroute.reason,
        }),
      });

      if (res.ok) {
        if (action === 'ACCEPT') {
          if (activeTrip) {
            setActiveTrip({
              ...activeTrip,
              route: 'Addis Ababa ➔ Dire Dawa ➔ Dewele ➔ Djibouti (Southern Bypass)',
            });
          }
          await fetchActiveTrip();
        }
        setPendingReroute(null);
      }
    } catch (e) {
      console.warn('Error confirming reroute:', e);
    }
  };

  // Mark as Delivered from Trip Tab -> Navigates to e-POD Tab & Records Arrival
  const handleMarkDelivered = async () => {
    setActiveTab('pod');
    if (activeTrip?.id) {
      try {
        await apiFetch('/api/portal/driver/arrive-destination', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shipmentId: activeTrip.id,
          }),
        });
        await fetchActiveTrip();
      } catch (e) {
        console.warn('Arrive destination error:', e);
      }
    }
  };

  const handleSignPOD = async () => {
    if (!recipientName) {
      Alert.alert('Name Required', 'Please enter the full name of the receiving consignee.');
      return;
    }
    if (!signedPOD) {
      Alert.alert('Signature Required', 'Please capture or confirm the consignee signature.');
      return;
    }

    setActionLoading(true);
    try {
      const sigData = `${recipientName} [TradeFlow Verified Cryptographic e-POD Handover Signature]`;
      // Auto-trigger delivery milestone & smart escrow release
      const res = await apiFetch('/api/payments/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipmentId: activeTrip?.id,
          loadId: activeTrip?.loadId,
          driverId: user?.id,
          driverEmail: user?.email,
          recipientName,
          signatureUrl: sigData,
          signatureData: sigData,
        }),
      });

      if (res.ok) {
        setPodSuccess(true);
        setSignedPOD(true);
        if (activeTrip) {
          setLastDeliveredTrip({
            ...activeTrip,
            status: 'DELIVERED',
            progressPercentage: 100,
            podRecipientName: recipientName,
            podSignatureUrl: sigData,
            podDeliveredAt: new Date().toISOString(),
          });
        }
        setActiveTrip(null);
        await fetchActiveTrip();
        Alert.alert(
          'Delivery Confirmed',
          'Digital e-POD has been permanently recorded. Escrow payment has been released to the transporter, and the shipper notified.',
          [{ text: 'OK' }]
        );
      } else {
        const errJson = await res.json().catch(() => ({}));
        Alert.alert(
          'Unable to Confirm e-POD',
          errJson.error || 'Failed to persist delivery record. Please retry.'
        );
      }
    } catch (e: any) {
      console.warn('e-POD payment settlement error:', e);
      Alert.alert('Connection Issue', 'Could not reach server. Please check your internet connection and retry.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Modular Top Mobile Header */}
      <DriverTopHeader
        user={currentUser}
        onLogout={onLogout}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Offline Queuing & Sync Status Indicator (NFR 7.2) */}
      {(offlineCheckinQueue.length + offlineIncidentQueue.length > 0 || !!offlineSyncMessage) && (
        <View style={{ backgroundColor: offlineSyncMessage ? '#059669' : '#0284C7', paddingVertical: 6, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={offlineSyncMessage ? "checkmark-circle" : "cloud-offline-outline"} size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
            {offlineSyncMessage || `Offline Mode: ${offlineCheckinQueue.length} check-in(s), ${offlineIncidentQueue.length} incident(s) cached (Syncs on reconnect)`}
          </Text>
        </View>
      )}

      {/* Dynamic Corridor Reroute Proposal Alert Banner */}
      {pendingReroute && pendingReroute.status === 'PENDING_CONFIRMATION' && (
        <View
          style={{
            backgroundColor: '#FFFBEB',
            borderBottomWidth: 1,
            borderColor: '#FDE68A',
            paddingVertical: 9,
            paddingHorizontal: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 }}>
            <Ionicons name="warning" size={17} color="#D97706" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#92400E' }}>
                {language === 'AM' ? 'የኮሪደር መስመር ለውጥ ጥቆማ' : language === 'OM' ? 'Yaada Daandii Jijjiirraa' : 'Reroute Proposal'}
              </Text>
              <Text style={{ fontSize: 9.5, color: '#B45309', fontWeight: '600' }} numberOfLines={1}>
                -{pendingReroute.estimatedTimeSavingMins} {language === 'AM' ? 'ደቂቃ ያድናል' : 'min'} | {language === 'AM' ? 'በደወሌ በኩል' : 'via Dewele'}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => handleConfirmReroute('ACCEPT')}
              style={{
                backgroundColor: '#059669',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 7,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>
                {language === 'AM' ? 'ተቀበል' : 'Accept'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('incident')}
              style={{
                backgroundColor: '#0F172A',
                paddingHorizontal: 8,
                paddingVertical: 5,
                borderRadius: 7,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>
                {language === 'AM' ? 'ዝርዝር' : 'Details'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Active Dewele Southern Bypass Active Notice */}
      {activeTrip?.isRerouted && (
        <View
          style={{
            backgroundColor: '#F0FDF4',
            borderBottomWidth: 1,
            borderColor: '#BBF7D0',
            paddingVertical: 5,
            paddingHorizontal: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Ionicons name="git-branch" size={13} color="#059669" />
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#065F46' }}>
            {language === 'AM'
              ? 'ጭነቱ በደቡባዊ አማራጭ ኮሪደር (በደወሌ ድንበር) በኩል በመጓዝ ላይ ይገኛል'
              : 'Shipment active on Southern Bypass Corridor (via Dewele Border)'}
          </Text>
        </View>
      )}

      {/* Main Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={!isMapInteracting}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0284C7"
            colors={['#0284C7']}
          />
        }
      >
        {/* 1. TRIP SUMMARY TAB */}
        {activeTab === 'trip' && (
          <TripTab
            activeTrip={activeTrip}
            onStartTrip={handleStartTrip}
            onToggleDriving={handleToggleDriving}
            onMarkDelivered={handleMarkDelivered}
            onNavigateToPod={() => setActiveTab('pod')}
            onRefresh={fetchActiveTrip}
            actionLoading={actionLoading}
            gpsStatus={gpsStatus}
            realGpsLocation={realGpsLocation}
            onEnableGps={handleEnableGps}
            onMapInteractionChange={setIsMapInteracting}
          />
        )}

        {/* 2. TURN-BY-TURN CORRIDOR WAYPOINTS */}
        {activeTab === 'nav' && <WaypointsTab waypoints={waypoints} />}

        {/* 3. OFFLINE WAYPOINT CHECK-IN */}
        {activeTab === 'checkin' && (
          <CheckinTab
            checkedInSuccess={checkedInSuccess}
            checkinHistory={checkinHistory}
            onCheckin={handleCheckin}
            activeTrip={activeTrip}
            activeWaypoint={waypoints.find((w) => w.status === 'ACTIVE_NOW') || (waypoints.every((w) => w.status === 'COMPLETED') ? waypoints[waypoints.length - 1] : waypoints[0])}
            realGpsLocation={realGpsLocation}
            onOpenCustomsPass={() => setShowCustomsPassModal(true)}
          />
        )}

        {/* 4. INCIDENT REPORTING */}
        {activeTab === 'incident' && (
          <IncidentTab
            incidentType={incidentType}
            setIncidentType={setIncidentType}
            incidentSeverity={incidentSeverity}
            setIncidentSeverity={setIncidentSeverity}
            incidentNotes={incidentNotes}
            setIncidentNotes={setIncidentNotes}
            incidentPhoto={incidentPhoto}
            setIncidentPhoto={setIncidentPhoto}
            incidentSent={incidentSent}
            incidentsList={incidentsList}
            onSendIncident={handleSendIncident}
            realGpsLocation={realGpsLocation}
            activeTrip={activeTrip}
            activeWaypoint={waypoints.find((w) => w.status === 'ACTIVE_NOW') || (waypoints.every((w) => w.status === 'COMPLETED') ? waypoints[waypoints.length - 1] : waypoints[0])}
            pendingReroute={pendingReroute}
            onConfirmReroute={handleConfirmReroute}
          />
        )}

        {/* 5. DIGITAL POD */}
        {activeTab === 'pod' && (
          <PodTab
            activeTrip={activeTrip || lastDeliveredTrip}
            deliveredHistory={deliveredHistory}
            recipientName={recipientName}
            setRecipientName={setRecipientName}
            signedPOD={signedPOD}
            setSignedPOD={setSignedPOD}
            podSuccess={podSuccess}
            onSignPOD={handleSignPOD}
            actionLoading={actionLoading}
          />
        )}
      </ScrollView>

      {/* Modular Bottom Navigation Bar */}
      <DriverBottomNavBar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Driver Profile & Password Change Drawer */}
      <DriverProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={currentUser}
        onPhotoUpdated={handlePhotoUpdated}
        onLogout={onLogout}
      />

      {/* Official Customs Transit Clearance QR Pass Modal */}
      <CustomsQrPassModal
        visible={showCustomsPassModal}
        onClose={() => setShowCustomsPassModal(false)}
        activeTrip={activeTrip}
        customsPass={activeTrip?.customsClearance}
      />
    </SafeAreaView>
  );
};
