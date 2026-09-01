import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { transporterStyles as styles } from '../transporterStyles';
import { TruckItem, DriverItem } from '../types';

interface FleetTabProps {
  fleetList: TruckItem[];
  driversList: DriverItem[];
  openAddTruckModal: () => void;
  openAddDriverModal: () => void;
}

export const FleetTab: React.FC<FleetTabProps> = ({
  fleetList,
  driversList,
  openAddTruckModal,
  openAddDriverModal,
}) => {
  const [fleetSubTab, setFleetSubTab] = useState<'vehicles' | 'drivers'>('vehicles');
  const [expandedTruckIds, setExpandedTruckIds] = useState<Record<string, boolean>>({});
  const [expandedDriverIds, setExpandedDriverIds] = useState<Record<string, boolean>>({});

  const toggleTruckExpand = (id: string) => {
    setExpandedTruckIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleDriverExpand = (id: string) => {
    setExpandedDriverIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View style={styles.sectionContainer}>
      {/* Sub-tab Navigation */}
      <View style={styles.fleetSubTabRow}>
        <TouchableOpacity
          style={[styles.fleetSubTab, fleetSubTab === 'vehicles' && styles.fleetSubTabActive]}
          onPress={() => setFleetSubTab('vehicles')}
        >
          <Text style={[styles.fleetSubTabText, fleetSubTab === 'vehicles' && styles.fleetSubTabTextActive]}>
            🚛 Fleet Vehicles ({fleetList.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fleetSubTab, fleetSubTab === 'drivers' && styles.fleetSubTabActive]}
          onPress={() => setFleetSubTab('drivers')}
        >
          <Text style={[styles.fleetSubTabText, fleetSubTab === 'drivers' && styles.fleetSubTabTextActive]}>
            👤 Authorized Drivers ({driversList.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* SUB-TAB 1: FLEET VEHICLES */}
      {fleetSubTab === 'vehicles' && (
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>Fleet Vehicles</Text>
            <TouchableOpacity style={styles.addBtn} onPress={openAddTruckModal}>
              <Text style={styles.addBtnText}>+ Add Truck</Text>
            </TouchableOpacity>
          </View>

          {fleetList.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="truck-trailer" size={40} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Fleet Vehicles Registered</Text>
              <Text style={styles.emptySub}>
                Add your heavy freight vehicles to receive match requests along the Djibouti corridor.
              </Text>
            </View>
          ) : (
            fleetList.map((trk) => {
              const isExpanded = !!expandedTruckIds[trk.id];
              return (
                <TouchableOpacity
                  key={trk.id}
                  activeOpacity={0.85}
                  onPress={() => toggleTruckExpand(trk.id)}
                  style={[styles.card, isExpanded && styles.cardExpanded]}
                >
                  <View style={styles.cardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <View style={styles.vehicleIconBox}>
                        <MaterialCommunityIcons name="truck" size={20} color="#0284C7" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.truckPlate}>{trk.plate}</Text>
                        <Text style={styles.truckModel}>{trk.type} • {trk.capacity}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View
                        style={[
                          styles.statusBadge,
                          trk.status === 'AVAILABLE'
                            ? styles.statusAvailable
                            : { backgroundColor: '#E0F2FE' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            trk.status === 'AVAILABLE' ? {} : { color: '#0369A1' },
                          ]}
                        >
                          {trk.status}
                        </Text>
                      </View>
                      <View style={styles.chevronCircle}>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={14}
                          color="#0284C7"
                        />
                      </View>
                    </View>
                  </View>

                  {!isExpanded && (
                    <View style={styles.collapsedPreviewRow}>
                      <Text style={styles.collapsedPreviewText} numberOfLines={1}>
                        Driver: {trk.driver || 'Unassigned'} • GPS: {trk.gpsEnabled ? 'Online' : 'Disabled'}
                      </Text>
                      <Text style={styles.tapDetailsHint}>Details ▾</Text>
                    </View>
                  )}

                  {isExpanded && (
                    <View style={{ gap: 8, marginTop: 4 }}>
                      <View style={styles.cardDivider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Assigned Driver:</Text>
                        <Text style={styles.infoValue}>{trk.driver || 'Unassigned'}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Telematics / GPS:</Text>
                        <Text style={[styles.infoValue, { color: trk.gpsEnabled ? '#059669' : '#DC2626' }]}>
                          {trk.gpsEnabled ? '🟢 Live Telematics Streaming' : '🔴 Inactive'}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>GIT Cargo Insurance:</Text>
                        <Text style={[styles.infoValue, { color: '#059669' }]}>
                          {trk.insuranceStatus}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      )}

      {/* SUB-TAB 2: AUTHORIZED DRIVERS */}
      {fleetSubTab === 'drivers' && (
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>Authorized Fleet Drivers</Text>
            <TouchableOpacity style={styles.addBtn} onPress={openAddDriverModal}>
              <Text style={styles.addBtnText}>+ Add Driver</Text>
            </TouchableOpacity>
          </View>

          {driversList.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="person-outline" size={40} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Drivers Registered Yet</Text>
              <Text style={styles.emptySub}>
                Add your verified heavy freight drivers to assign them to dispatches.
              </Text>
            </View>
          ) : (
            driversList.map((drv) => {
              const isExpanded = !!expandedDriverIds[drv.id];
              return (
                <TouchableOpacity
                  key={drv.id}
                  activeOpacity={0.85}
                  onPress={() => toggleDriverExpand(drv.id)}
                  style={[styles.card, isExpanded && styles.cardExpanded]}
                >
                  <View style={styles.cardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <View style={styles.driverAvatarBox}>
                        <Ionicons name="person" size={20} color="#0284C7" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.truckPlate}>{drv.fullName}</Text>
                        <Text style={styles.truckModel}>{drv.licenseCategory} • {drv.phone}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View
                        style={[
                          styles.statusBadge,
                          drv.status === 'ACTIVE'
                            ? styles.statusAvailable
                            : { backgroundColor: '#E0F2FE' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            drv.status === 'ACTIVE' ? {} : { color: '#0369A1' },
                          ]}
                        >
                          {drv.status}
                        </Text>
                      </View>
                      <View style={styles.chevronCircle}>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={14}
                          color="#0284C7"
                        />
                      </View>
                    </View>
                  </View>

                  {!isExpanded && (
                    <View style={styles.collapsedPreviewRow}>
                      <Text style={styles.collapsedPreviewText} numberOfLines={1}>
                        License: {drv.licenseNumber} • Truck: {drv.assignedTruckPlate || 'Unassigned'}
                      </Text>
                      <Text style={styles.tapDetailsHint}>Details ▾</Text>
                    </View>
                  )}

                  {isExpanded && (
                    <View style={{ gap: 8, marginTop: 4 }}>
                      <View style={styles.cardDivider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Driving License Number:</Text>
                        <Text style={styles.infoValue}>{drv.licenseNumber}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Corridor Experience:</Text>
                        <Text style={styles.infoValue}>{drv.experienceYears} Years</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Assigned Truck:</Text>
                        <Text style={[styles.infoValue, { color: '#0284C7' }]}>
                          {drv.assignedTruckPlate || 'Unassigned'}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      )}
    </View>
  );
};
