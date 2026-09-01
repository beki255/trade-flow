import React from 'react';
import {
  View,
  Text,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { driverStyles as styles } from '../driverStyles';
import { ActiveTripDetails } from '../types';

interface TripTabProps {
  activeTrip: ActiveTripDetails | null;
}

export const TripTab: React.FC<TripTabProps> = ({ activeTrip }) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Speed</Text>
          <Text style={styles.kpiValue}>64 km/h</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Estimated ETA</Text>
          <Text style={[styles.kpiValue, { color: '#0284C7' }]}>11h 20m</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Remaining</Text>
          <Text style={styles.kpiValue}>482 km</Text>
        </View>
      </View>

      {/* Active Assignment Card */}
      {activeTrip ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.cardTitle}>{activeTrip.title}</Text>
              {activeTrip.loadId ? (
                <Text style={{ fontSize: 11, color: '#0284C7', fontWeight: '700', marginTop: 2 }}>
                  {activeTrip.loadId}
                </Text>
              ) : null}
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{activeTrip.status || 'IN TRANSIT'}</Text>
            </View>
          </View>

          <View style={styles.routeBox}>
            <Text style={styles.routeCity}>{activeTrip.origin}</Text>
            <Text style={styles.routeArrow}>➔</Text>
            <Text style={styles.routeCity}>{activeTrip.destination}</Text>
          </View>

          <View style={styles.cardDivider} />

          {activeTrip.assignedTruckPlate ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Assigned Truck:</Text>
              <Text style={[styles.infoValue, { fontWeight: '800', color: '#0284C7' }]}>
                🚛 {activeTrip.assignedTruckPlate}
              </Text>
            </View>
          ) : null}

          {activeTrip.shipperName ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Shipper Client:</Text>
              <Text style={styles.infoValue}>{activeTrip.shipperName}</Text>
            </View>
          ) : null}

          {activeTrip.transporterName ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fleet Transporter:</Text>
              <Text style={styles.infoValue}>{activeTrip.transporterName}</Text>
            </View>
          ) : null}

          {activeTrip.cargo ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cargo Commodity:</Text>
              <Text style={styles.infoValue}>{activeTrip.cargo}</Text>
            </View>
          ) : null}

          {activeTrip.container ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cargo Type:</Text>
              <Text style={styles.infoValue}>{activeTrip.container}</Text>
            </View>
          ) : null}

          {activeTrip.weight ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gross Weight:</Text>
              <Text style={styles.infoValue}>{activeTrip.weight}</Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <MaterialCommunityIcons name="truck-delivery-outline" size={40} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No Active Trip Assigned</Text>
          <Text style={styles.emptySub}>
            When your fleet manager assigns a corridor route, it will display here with live telemetry.
          </Text>
        </View>
      )}
    </View>
  );
};
