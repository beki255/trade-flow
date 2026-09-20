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
          style={[
            styles.fleetSubTab,
            { flexDirection: 'row', justifyContent: 'center', gap: 6 },
            fleetSubTab === 'vehicles' && styles.fleetSubTabActive,
          ]}
          onPress={() => setFleetSubTab('vehicles')}
        >
          <MaterialCommunityIcons
            name="truck-outline"
            size={16}
            color={fleetSubTab === 'vehicles' ? '#0284C7' : '#64748B'}
          />
          <Text style={[styles.fleetSubTabText, fleetSubTab === 'vehicles' && styles.fleetSubTabTextActive]}>
            Fleet Vehicles ({fleetList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.fleetSubTab,
            { flexDirection: 'row', justifyContent: 'center', gap: 6 },
            fleetSubTab === 'drivers' && styles.fleetSubTabActive,
          ]}
          onPress={() => setFleetSubTab('drivers')}
        >
          <Ionicons
            name="people-outline"
            size={16}
            color={fleetSubTab === 'drivers' ? '#0284C7' : '#64748B'}
          />
          <Text style={[styles.fleetSubTabText, fleetSubTab === 'drivers' && styles.fleetSubTabTextActive]}>
            Authorized Drivers ({driversList.length})
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
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2, flexWrap: 'wrap' }}>
                          <Text style={styles.truckModel}>{trk.type} • {trk.capacity}</Text>
                          <Text style={styles.truckModel}>•</Text>
                          <MaterialCommunityIcons name="gas-station" size={11} color="#0284C7" />
                          <Text style={styles.truckModel}>{trk.fuelType || 'DIESEL'}</Text>
                        </View>
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
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
                        <Ionicons name="person-outline" size={12} color="#64748B" />
                        <Text style={styles.collapsedPreviewText} numberOfLines={1}>
                          {trk.driver || 'Unassigned'} • Fuel: {trk.fuelType || 'DIESEL'} •
                        </Text>
                        <Ionicons
                          name={trk.gpsEnabled ? "radio-button-on" : "radio-button-off"}
                          size={9}
                          color={trk.gpsEnabled ? "#10B981" : "#94A3B8"}
                        />
                        <Text style={[styles.collapsedPreviewText, { color: trk.gpsEnabled ? '#059669' : '#64748B' }]}>
                          {trk.gpsEnabled ? 'Online' : 'Off'}
                        </Text>
                      </View>
                      <Text style={styles.tapDetailsHint}>Details ▾</Text>
                    </View>
                  )}

                  {isExpanded && (
                    <View style={{ gap: 8, marginTop: 4 }}>
                      <View style={styles.cardDivider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Engine / Fuel Type:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <MaterialCommunityIcons name="gas-station" size={14} color="#0284C7" />
                          <Text style={[styles.infoValue, { color: '#0284C7', fontWeight: '700' }]}>
                            {trk.fuelType || 'DIESEL'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Assigned Driver:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="person-outline" size={14} color="#64748B" />
                          <Text style={styles.infoValue}>{trk.driver || 'Unassigned'}</Text>
                        </View>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Telematics / GPS:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                          <Ionicons
                            name={trk.gpsEnabled ? "radio-button-on" : "radio-button-off"}
                            size={12}
                            color={trk.gpsEnabled ? '#059669' : '#DC2626'}
                          />
                          <Text style={[styles.infoValue, { color: trk.gpsEnabled ? '#059669' : '#DC2626' }]}>
                            {trk.gpsEnabled ? 'Live Telematics Streaming' : 'Inactive'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>GIT Cargo Insurance:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="shield-checkmark-outline" size={14} color="#059669" />
                          <Text style={[styles.infoValue, { color: '#059669' }]}>
                            {trk.insuranceStatus}
                          </Text>
                        </View>
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
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2, flexWrap: 'wrap' }}>
                          <Text style={styles.truckModel}>{drv.licenseCategory}</Text>
                          <Text style={styles.truckModel}>•</Text>
                          <Ionicons name="call-outline" size={11} color="#64748B" />
                          <Text style={styles.truckModel}>{drv.phone}</Text>
                        </View>
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
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
                        <Ionicons name="card-outline" size={12} color="#64748B" />
                        <Text style={styles.collapsedPreviewText} numberOfLines={1}>
                          Lic: {drv.licenseNumber} •
                        </Text>
                        <MaterialCommunityIcons name="truck-outline" size={12} color="#0284C7" />
                        <Text style={[styles.collapsedPreviewText, { color: drv.assignedTruckPlate ? '#0284C7' : '#64748B' }]}>
                          {drv.assignedTruckPlate || 'Unassigned'}
                        </Text>
                      </View>
                      <Text style={styles.tapDetailsHint}>Details ▾</Text>
                    </View>
                  )}

                  {isExpanded && (
                    <View style={{ gap: 8, marginTop: 4 }}>
                      <View style={styles.cardDivider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Driving License Number:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="card-outline" size={14} color="#64748B" />
                          <Text style={styles.infoValue}>{drv.licenseNumber}</Text>
                        </View>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Corridor Experience:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="ribbon-outline" size={14} color="#64748B" />
                          <Text style={styles.infoValue}>{drv.experienceYears} Years</Text>
                        </View>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Assigned Truck:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <MaterialCommunityIcons name="truck" size={14} color="#0284C7" />
                          <Text style={[styles.infoValue, { color: '#0284C7', fontWeight: '700' }]}>
                            {drv.assignedTruckPlate || 'Unassigned'}
                          </Text>
                        </View>
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
