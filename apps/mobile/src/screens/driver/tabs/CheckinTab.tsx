import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { driverStyles as styles } from '../driverStyles';
import { CheckinRecord, ActiveTripDetails } from '../types';

interface CheckinTabProps {
  checkedInSuccess: string;
  checkinHistory: CheckinRecord[];
  onCheckin: () => void;
  activeTrip?: ActiveTripDetails | null;
  activeWaypoint?: any;
  realGpsLocation?: any;
}

export const CheckinTab: React.FC<CheckinTabProps> = ({
  checkedInSuccess,
  checkinHistory,
  onCheckin,
  activeTrip,
  activeWaypoint,
  realGpsLocation,
}) => {
  const hasTrip = !!activeTrip;

  // Resolve current coordinates dynamically from actual trip or live device GPS
  const currentLat =
    realGpsLocation?.latitude ??
    activeWaypoint?.latitude ??
    activeWaypoint?.lat ??
    activeTrip?.originLat;

  const currentLng =
    realGpsLocation?.longitude ??
    activeWaypoint?.longitude ??
    activeWaypoint?.lng ??
    activeTrip?.originLng;

  const checkpointName =
    activeWaypoint?.name ||
    (activeTrip ? (activeTrip.route || `${activeTrip.origin} ➔ ${activeTrip.destination}`) : null);

  const coordsDisplay =
    currentLat !== undefined && currentLng !== undefined
      ? `${Number(currentLat).toFixed(4)}° N, ${Number(currentLng).toFixed(4)}° E`
      : null;

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Corridor Waypoint GPS Check-in</Text>

      {checkedInSuccess ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✓ {checkedInSuccess}</Text>
        </View>
      ) : null}

      {hasTrip ? (
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.infoLabel}>Current Checkpoint:</Text>
            <View style={{ backgroundColor: '#E0F2FE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
              <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#0284C7' }}>
                {activeWaypoint?.type || 'CORRIDOR CHECKPOINT'}
              </Text>
            </View>
          </View>

          <View style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 4 }}>
            <Text style={{ fontSize: 13, fontWeight: '900', color: '#0F172A' }}>
              📍 {checkpointName}
            </Text>
            {coordsDisplay ? (
              <Text style={[styles.coordsText, { marginTop: 4, fontFamily: 'monospace' }]}>
                {coordsDisplay} {realGpsLocation ? '• (Phone GPS)' : '• (Corridor GPS)'}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.checkinBtn}
            onPress={onCheckin}
            activeOpacity={0.8}
          >
            <Text style={styles.checkinBtnText}>
              Confirm Check-In at {checkpointName || 'Checkpoint'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 24, gap: 8 }]}>
          <Ionicons name="location-outline" size={36} color="#94A3B8" />
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#334155' }}>
            No Active Trip Assigned
          </Text>
          <Text style={{ fontSize: 11, color: '#64748B', textAlign: 'center', maxWidth: 280, lineHeight: 16 }}>
            When a consignment trip is assigned to your vehicle, corridor checkpoints and telemetry locations will appear here.
          </Text>
        </View>
      )}

      {/* Checkin History */}
      {checkinHistory.length > 0 && (
        <View style={{ gap: 8, marginTop: 10 }}>
          <Text style={styles.sectionTitle}>Confirmed Check-ins ({checkinHistory.length})</Text>
          {checkinHistory.map((chk) => (
            <View key={chk.id} style={styles.historyCard}>
              <Text style={styles.historyId}>{chk.id} • {chk.time}</Text>
              <Text style={styles.historyCoords}>{chk.coords}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
