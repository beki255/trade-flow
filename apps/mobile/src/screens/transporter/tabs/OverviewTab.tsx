import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { transporterStyles as styles } from '../transporterStyles';
import { TruckItem, DriverItem, LoadItem, BidItem } from '../types';

interface OverviewTabProps {
  fleetList: TruckItem[];
  driversList: DriverItem[];
  loadsList: LoadItem[];
  submittedBids: BidItem[];
  setActiveTab: (tab: any) => void;
  openAddTruckModal: () => void;
  openAddDriverModal: () => void;
  setFleetSubTab?: (tab: 'vehicles' | 'drivers') => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  fleetList,
  driversList,
  loadsList,
  submittedBids,
  setActiveTab,
  openAddTruckModal,
  openAddDriverModal,
  setFleetSubTab,
}) => {
  const availableFleetCount = fleetList.filter((f) => f.status === 'AVAILABLE').length;
  const inTransitCount = fleetList.filter((f) => f.status === 'IN_TRANSIT').length;
  const pendingDriversCount = driversList.filter(
    (d) => d.status === 'PENDING' || d.verificationStatus === 'PENDING'
  ).length;

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Dashboard Overview</Text>

      {/* KPI Stats Grid */}
      <View style={styles.kpiGrid}>
        <TouchableOpacity
          style={styles.kpiCard}
          onPress={() => {
            setFleetSubTab?.('vehicles');
            setActiveTab('fleet');
          }}
        >
          <Text style={styles.kpiLabel}>Active Trucks</Text>
          <Text style={styles.kpiValue}>{fleetList.length}</Text>
          <Text style={{ fontSize: 10, color: '#166534', fontWeight: '700' }}>
            {availableFleetCount} Available
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.kpiCard}
          onPress={() => {
            setFleetSubTab?.('drivers');
            setActiveTab('fleet');
          }}
        >
          <Text style={styles.kpiLabel}>Assigned Drivers</Text>
          <Text style={[styles.kpiValue, { color: '#0284C7' }]}>{driversList.length}</Text>
          <Text
            style={{
              fontSize: 10,
              color: pendingDriversCount > 0 ? '#B45309' : '#0369A1',
              fontWeight: '700',
            }}
            numberOfLines={1}
          >
            {pendingDriversCount > 0 ? `⏳ ${pendingDriversCount} Pending` : 'Authorized Staff'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.kpiGrid}>
        <TouchableOpacity style={styles.kpiCard} onPress={() => setActiveTab('loads')}>
          <Text style={styles.kpiLabel}>Corridor Loads</Text>
          <Text style={[styles.kpiValue, { color: '#D97706' }]}>{loadsList.length}</Text>
          <Text style={{ fontSize: 10, color: '#B45309', fontWeight: '700' }}>
            Open for Quotes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.kpiCard} onPress={() => setActiveTab('bidding')}>
          <Text style={styles.kpiLabel}>My Bids</Text>
          <Text style={[styles.kpiValue, { color: '#7C3AED' }]}>{submittedBids.length}</Text>
          <Text style={{ fontSize: 10, color: '#6D28D9', fontWeight: '700' }}>
            {submittedBids.filter((b) => b.status === 'ACCEPTED').length} Won & Dispatched
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Action Shortcuts */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Carrier Actions</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <TouchableOpacity
            style={[styles.addBtn, { flex: 1, paddingVertical: 10, alignItems: 'center' }]}
            onPress={openAddTruckModal}
          >
            <Text style={styles.addBtnText}>+ Add Truck</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addBtn, { flex: 1, backgroundColor: '#0284C7', paddingVertical: 10, alignItems: 'center' }]}
            onPress={openAddDriverModal}
          >
            <Text style={styles.addBtnText}>+ Add Driver</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Fleet Live Status Summary */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.cardTitle}>Active Fleet Status</Text>
          <TouchableOpacity onPress={() => setActiveTab('fleet')}>
            <Text style={{ fontSize: 11, color: '#0284C7', fontWeight: '700' }}>View All Fleet ➔</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cardDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Available in Addis / Modjo:</Text>
          <Text style={[styles.infoValue, { color: '#166534' }]}>{availableFleetCount} Trucks</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>En-Route on Corridor:</Text>
          <Text style={[styles.infoValue, { color: '#0284C7' }]}>{inTransitCount} Trucks</Text>
        </View>
      </View>
    </View>
  );
};
