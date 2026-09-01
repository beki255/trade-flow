import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { driverStyles as styles } from './driverStyles';
import { WaypointItem, CheckinRecord, IncidentRecord, ActiveTripDetails, DriverTabType } from './types';
import { getApiBaseUrl, apiFetch } from '../../utils/api';

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
      }
    } catch (err) {
      console.warn('Driver trip fetch error:', err);
    }
  };

  useEffect(() => {
    fetchActiveTrip();
    const interval = setInterval(fetchActiveTrip, 5000);
    return () => clearInterval(interval);
  }, [user]);

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

  const waypoints: WaypointItem[] = activeTrip
    ? [
        { id: 'WP-1', name: `${activeTrip.origin || 'Origin'} (Dispatch Terminal)`, status: 'COMPLETED', time: activeTrip.dispatchedAt || 'Dispatched' },
        { id: 'WP-2', name: 'Modjo Dry Port Toll Gate', status: 'COMPLETED', time: 'In Transit' },
        { id: 'WP-3', name: 'Awash Arba Safe Parking & Scale', status: 'ACTIVE_NOW', time: 'Current Point' },
        { id: 'WP-4', name: 'Semera Corridor Checkpoint', status: 'PENDING', time: 'En Route' },
        { id: 'WP-5', name: 'Galafi Border Customs (Ethiopia-Djibouti)', status: 'PENDING', time: 'Upcoming' },
        { id: 'WP-6', name: `${activeTrip.destination || 'Destination'} (Delivery Terminal)`, status: 'PENDING', time: 'Destination' },
      ]
    : [];

  const handleCheckin = () => {
    const record: CheckinRecord = {
      id: `CHK-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString(),
      coords: '11.758° N, 41.834° E',
    };
    setCheckinHistory([record, ...checkinHistory]);
    setCheckedInSuccess('GPS Check-in Confirmed!');
    setTimeout(() => setCheckedInSuccess(''), 3000);
  };

  const handleSendIncident = () => {
    if (!incidentType) return;
    const newInc: IncidentRecord = {
      id: `INC-${Date.now().toString().slice(-4)}`,
      type: incidentType,
      notes: incidentNotes,
      time: new Date().toLocaleTimeString(),
    };
    setIncidentsList([newInc, ...incidentsList]);
    setIncidentSent(true);
    setIncidentType('');
    setIncidentNotes('');
    setTimeout(() => setIncidentSent(false), 3500);
  };

  const handleSignPOD = () => {
    if (!recipientName) return;
    setSignedPOD(true);
    setPodSuccess(true);
    setTimeout(() => setPodSuccess(false), 4000);
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
        {activeTab === 'trip' && <TripTab activeTrip={activeTrip} />}

        {/* 2. TURN-BY-TURN CORRIDOR WAYPOINTS */}
        {activeTab === 'nav' && <WaypointsTab waypoints={waypoints} />}

        {/* 3. OFFLINE WAYPOINT CHECK-IN */}
        {activeTab === 'checkin' && (
          <CheckinTab
            checkedInSuccess={checkedInSuccess}
            checkinHistory={checkinHistory}
            onCheckin={handleCheckin}
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
            recipientName={recipientName}
            setRecipientName={setRecipientName}
            signedPOD={signedPOD}
            podSuccess={podSuccess}
            onSignPOD={handleSignPOD}
          />
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('trip')}
        >
          <Ionicons
            name={activeTab === 'trip' ? 'map' : 'map-outline'}
            size={22}
            color={activeTab === 'trip' ? '#0284C7' : '#94A3B8'}
          />
          <Text style={[styles.navLabel, activeTab === 'trip' && styles.navLabelActive]}>Trip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('nav')}
        >
          <Ionicons
            name={activeTab === 'nav' ? 'compass' : 'compass-outline'}
            size={22}
            color={activeTab === 'nav' ? '#0284C7' : '#94A3B8'}
          />
          <Text style={[styles.navLabel, activeTab === 'nav' && styles.navLabelActive]}>Route</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('checkin')}
        >
          <Ionicons
            name={activeTab === 'checkin' ? 'location' : 'location-outline'}
            size={22}
            color={activeTab === 'checkin' ? '#0284C7' : '#94A3B8'}
          />
          <Text style={[styles.navLabel, activeTab === 'checkin' && styles.navLabelActive]}>Check-in</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('incident')}
        >
          <Ionicons
            name={activeTab === 'incident' ? 'alert-circle' : 'alert-circle-outline'}
            size={22}
            color={activeTab === 'incident' ? '#0284C7' : '#94A3B8'}
          />
          <Text style={[styles.navLabel, activeTab === 'incident' && styles.navLabelActive]}>Incident</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('pod')}
        >
          <Ionicons
            name={activeTab === 'pod' ? 'document-text' : 'document-text-outline'}
            size={22}
            color={activeTab === 'pod' ? '#0284C7' : '#94A3B8'}
          />
          <Text style={[styles.navLabel, activeTab === 'pod' && styles.navLabelActive]}>e-POD</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
