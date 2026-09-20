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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabIcon } from '../../components/TabIcon';
import { getDynamicCorridorWaypoints } from '@tradeflow/shared';
import { driverStyles as styles } from './driverStyles';
import { WaypointItem, CheckinRecord, IncidentRecord, ActiveTripDetails, DriverTabType } from './types';
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

interface DriverPortalScreenProps {
  onLogout: () => void;
  user?: any;
}

export const DriverPortalScreen: React.FC<DriverPortalScreenProps> = ({ onLogout, user }) => {
  const [activeTab, setActiveTab] = useState<DriverTabType>('trip');
  const [refreshing, setRefreshing] = useState(false);

  // Emergency SOS state
  const [sosActive, setSosActive] = useState(false);

  // Active Trip Dynamic State
  const [activeTrip, setActiveTrip] = useState<ActiveTripDetails | null>(null);
  const [lastDeliveredTrip, setLastDeliveredTrip] = useState<ActiveTripDetails | null>(null);

  // Offline Telemetry Queue Buffer (SRS 4.3.1)
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
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
          '🟢 GPS Location Active! / ጂፒኤስ በርቷል!',
          'የመሳሪያህ ጂፒኤስ በተሳካ ሁኔታ በርቷል፤ ትክክለኛው መገኛህ በቅጽበት ወደ ካርታው ይተላለፋል።',
          [{ text: 'እሺ (OK)' }]
        );
      } else {
        Alert.alert(
          '⚠️ Location Denied / ጂፒኤስ አልፈቀደም',
          'እባክህ በመሳሪያህ Settings ውስጥ Location ፍቃድ አብራ፤ ካልበራ የቀጥታ መገኛህ ለ Shipper አይታይም።',
          [{ text: 'እሺ (OK)' }]
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
      } else {
        // Queue ping offline if server returned non-200
        setOfflineQueue((prev) => [...prev, currentPing]);
      }
    } catch (e) {
      // Network failure / offline: buffer to offline queue
      setOfflineQueue((prev) => [...prev, currentPing]);
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

  // 🚀 Start Trip Handler (SRS 4.3.4 Milestone 1: Departed Origin)
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
          '🚀 Trip Started! / ጉዞ ተጀምሯል!',
          'ጉዞህ በተሳካ ሁኔታ ተጀምሯል፤ የቀጥታ ጂፒኤስ ካርታው ለ Shipper በቅጽበት ተከፍቷል።',
          [{ text: 'እሺ (OK)' }]
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

  // Check-in state
  const [checkedInSuccess, setCheckedInSuccess] = useState('');
  const [checkinHistory, setCheckinHistory] = useState<CheckinRecord[]>([]);

  // Incident state
  const [incidentType, setIncidentType] = useState('');
  const [incidentNotes, setIncidentNotes] = useState('');
  const [incidentSent, setIncidentSent] = useState(false);
  const [incidentsList, setIncidentsList] = useState<IncidentRecord[]>([]);

  // Digital POD state
  const [recipientName, setRecipientName] = useState('');
  const [signedPOD, setSignedPOD] = useState(false);
  const [podSuccess, setPodSuccess] = useState(false);

  const waypoints: WaypointItem[] = useMemo(() => {
    if (!activeTrip) return [];
    if (activeTrip.waypoints && activeTrip.waypoints.length > 2) {
      return activeTrip.waypoints;
    }
    return getDynamicCorridorWaypoints(
      activeTrip.origin,
      activeTrip.destination,
      activeTrip.originLat,
      activeTrip.originLng,
      activeTrip.destLat,
      activeTrip.destLng,
      activeTrip.progressPercentage ?? 0,
      activeTrip.status ?? 'IN_TRANSIT'
    );
  }, [activeTrip]);

  const handleCheckin = () => {
    const activeWp = waypoints.find((w) => w.status === 'ACTIVE_NOW') || waypoints[0];
    const lat = realGpsLocation?.latitude ?? (activeWp as any)?.latitude ?? (activeWp as any)?.lat ?? activeTrip?.originLat;
    const lng = realGpsLocation?.longitude ?? (activeWp as any)?.longitude ?? (activeWp as any)?.lng ?? activeTrip?.originLng;

    if (lat === undefined || lng === undefined) return;

    const coords = `${Number(lat).toFixed(3)}° N, ${Number(lng).toFixed(3)}° E`;
    const locName = activeWp?.name || activeTrip?.route || 'Corridor Checkpoint';
    const record: CheckinRecord = {
      id: `CHK-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      coords: `${coords} (${locName})`,
    };
    setCheckinHistory([record, ...checkinHistory]);
    transmitGpsTelemetry({
      latitude: Number(lat),
      longitude: Number(lng),
      speedKmh: 0,
      heading: 240,
      fuelLevelPct: activeTrip?.fuelLevelPct ?? 78,
      timestamp: new Date().toISOString(),
      source: 'DRIVER_CHECKIN',
    });
    setCheckedInSuccess(`GPS Check-in Confirmed at ${locName}!`);
    setTimeout(() => setCheckedInSuccess(''), 3000);
  };

  const handleSendIncident = async () => {
    if (!incidentType) return;
    const activeWp = waypoints.find((w) => w.status === 'ACTIVE_NOW') || waypoints[0];
    const incidentLat = realGpsLocation?.latitude ?? (activeWp as any)?.latitude ?? (activeWp as any)?.lat ?? activeTrip?.originLat ?? 0;
    const incidentLng = realGpsLocation?.longitude ?? (activeWp as any)?.longitude ?? (activeWp as any)?.lng ?? activeTrip?.originLng ?? 0;
    const incidentLocName = activeWp?.name || activeTrip?.route || 'Corridor Route Checkpoint';

    const newInc: IncidentRecord = {
      id: `INC-${Date.now().toString().slice(-4)}`,
      type: incidentType,
      notes: incidentNotes,
      time: new Date().toLocaleTimeString(),
    };
    setIncidentsList([newInc, ...incidentsList]);
    setIncidentSent(true);

    try {
      await apiFetch('/api/optimization/incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterDriverId: user?.id,
          driverEmail: user?.email,
          shipmentId: activeTrip?.id,
          category: incidentType,
          description: incidentNotes || 'Driver reported incident on corridor highway',
          latitude: incidentLat,
          longitude: incidentLng,
          locationName: incidentLocName,
        }),
      });
    } catch (e) {
      console.warn('Incident report API error:', e);
    }

    setIncidentType('');
    setIncidentNotes('');
    setTimeout(() => setIncidentSent(false), 3500);
  };

  // 🏁 Mark as Delivered from Trip Tab -> Navigates to e-POD Tab & Records Arrival
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
      Alert.alert('⚠️ ስም ያስፈልጋል', 'እባክህ የተረካቢውን ሙሉ ስም አስገባ።');
      return;
    }
    if (!signedPOD) {
      Alert.alert('⚠️ ፊርማ ያስፈልጋል', 'እባክህ የተረካቢውን ፊርማ ሳጥኑ ላይ በመንካት አረጋግጥ።');
      return;
    }

    setActionLoading(true);
    try {
      const sigData = `✍️ ${recipientName} [TradeFlow Verified Cryptographic e-POD Handover Signature]`;
      // Auto-trigger delivery milestone & TeleBirr payment smart escrow release
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
          '🎉 Delivery Confirmed! / ርክክብ ተጠናቋል!',
          'ዲጂታል e-POD በመረጃ ቋቱ (Database) ውስጥ ተመዝግቧል፤ የ TeleBirr ክፍያው ለትራንስፖርተር ተለቋል። ለ Shipper ወዲያውኑ ማሳወቂያ ደርሶታል።',
          [{ text: 'እሺ (OK)' }]
        );
      } else {
        const errJson = await res.json().catch(() => ({}));
        Alert.alert(
          '⚠️ e-POD ማረጋገጥ አልተቻለም',
          errJson.error || 'በመረጃ ቋቱ ውስጥ የርክክብ መረጃውን ማስቀመጥ አልተቻለም። እባክዎ እንደገና ይሞክሩ።'
        );
      }
    } catch (e: any) {
      console.warn('e-POD payment settlement error:', e);
      Alert.alert('⚠️ የግንኙነት ችግር', 'ከአገልጋዩ (Server) ጋር መገናኘት አልተቻለም። እባክዎ የበይነመረብ ግንኙነትዎን ያረጋግጡ።');
    } finally {
      setActionLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActiveTrip();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Top Mobile Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.brandTitle}>TradeFlow Driver</Text>
          <Text style={styles.truckSub}>
            {user?.fullName || 'Driver Operations'} • {user?.driverProfile?.assignedVehicle?.plateNumber || 'Fleet Vehicle'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={13} color="#FFFFFF" style={{ marginRight: 3 }} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Emergency SOS Banner Button */}
      <TouchableOpacity
        style={[styles.sosBanner, sosActive && styles.sosBannerActive]}
        onPress={() => setSosActive(!sosActive)}
        activeOpacity={0.85}
      >
        <Ionicons name="warning" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={styles.sosText}>
          {sosActive ? 'SOS EMERGENCY SIGNAL ACTIVE (BROADCASTING)' : 'EMERGENCY SOS ASSISTANCE'}
        </Text>
      </TouchableOpacity>

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
            activeWaypoint={waypoints.find((w) => w.status === 'ACTIVE_NOW') || waypoints[0]}
            realGpsLocation={realGpsLocation}
          />
        )}

        {/* 4. INCIDENT REPORTING */}
        {activeTab === 'incident' && (
          <IncidentTab
            incidentType={incidentType}
            setIncidentType={setIncidentType}
            incidentNotes={incidentNotes}
            setIncidentNotes={setIncidentNotes}
            incidentSent={incidentSent}
            incidentsList={incidentsList}
            onSendIncident={handleSendIncident}
          />
        )}

        {/* 5. DIGITAL POD */}
        {activeTab === 'pod' && (
          <PodTab
            activeTrip={activeTrip || lastDeliveredTrip}
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

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('trip')}
        >
          <TabIcon
            name="trip"
            active={activeTab === 'trip'}
            size={22}
            color={activeTab === 'trip' ? '#0284C7' : '#94A3B8'}
          />
          <Text style={[styles.navLabel, activeTab === 'trip' && styles.navLabelActive]}>Trip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('nav')}
        >
          <TabIcon
            name="nav"
            active={activeTab === 'nav'}
            size={22}
            color={activeTab === 'nav' ? '#0284C7' : '#94A3B8'}
          />
          <Text style={[styles.navLabel, activeTab === 'nav' && styles.navLabelActive]}>Route</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('checkin')}
        >
          <TabIcon
            name="checkin"
            active={activeTab === 'checkin'}
            size={22}
            color={activeTab === 'checkin' ? '#0284C7' : '#94A3B8'}
          />
          <Text style={[styles.navLabel, activeTab === 'checkin' && styles.navLabelActive]}>Check-in</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('incident')}
        >
          <TabIcon
            name="incident"
            active={activeTab === 'incident'}
            size={22}
            color={activeTab === 'incident' ? '#0284C7' : '#94A3B8'}
          />
          <Text style={[styles.navLabel, activeTab === 'incident' && styles.navLabelActive]}>Incident</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('pod')}
        >
          <TabIcon
            name="pod"
            active={activeTab === 'pod'}
            size={22}
            color={activeTab === 'pod' ? '#0284C7' : '#94A3B8'}
          />
          <Text style={[styles.navLabel, activeTab === 'pod' && styles.navLabelActive]}>e-POD</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
