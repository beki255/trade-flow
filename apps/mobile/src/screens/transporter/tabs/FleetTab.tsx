import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { transporterStyles as styles } from '../transporterStyles';
import { TruckItem, DriverItem } from '../types';
import { useLanguage } from '../../../context/LanguageContext';
import { isValidImageUri } from '../../../utils/imageUtils';

interface FleetTabProps {
  fleetList: TruckItem[];
  driversList: DriverItem[];
  openAddTruckModal: () => void;
  openAddDriverModal: () => void;
  fleetSubTab?: 'vehicles' | 'drivers';
  setFleetSubTab?: (tab: 'vehicles' | 'drivers') => void;
}

export const FleetTab: React.FC<FleetTabProps> = ({
  fleetList,
  driversList,
  openAddTruckModal,
  openAddDriverModal,
  fleetSubTab,
  setFleetSubTab,
}) => {
  const { t } = useLanguage();
  const [internalSubTab, setInternalSubTab] = useState<'vehicles' | 'drivers'>('vehicles');
  const activeSubTab = fleetSubTab !== undefined ? fleetSubTab : internalSubTab;
  const changeSubTab = (tab: 'vehicles' | 'drivers') => {
    if (setFleetSubTab) {
      setFleetSubTab(tab);
    } else {
      setInternalSubTab(tab);
    }
  };

  const [expandedTruckIds, setExpandedTruckIds] = useState<Record<string, boolean>>({});
  const [expandedDriverIds, setExpandedDriverIds] = useState<Record<string, boolean>>({});

  const pendingDriversCount = driversList.filter(
    (d) => d.status === 'PENDING' || d.verificationStatus === 'PENDING'
  ).length;

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
            activeSubTab === 'vehicles' && styles.fleetSubTabActive,
          ]}
          onPress={() => changeSubTab('vehicles')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="truck-outline"
            size={16}
            color={activeSubTab === 'vehicles' ? '#0284C7' : '#64748B'}
          />
          <Text
            style={[styles.fleetSubTabText, activeSubTab === 'vehicles' && styles.fleetSubTabTextActive]}
            numberOfLines={1}
          >
            Vehicles ({fleetList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.fleetSubTab,
            activeSubTab === 'drivers' && styles.fleetSubTabActive,
          ]}
          onPress={() => changeSubTab('drivers')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="people-outline"
            size={16}
            color={activeSubTab === 'drivers' ? '#0284C7' : '#64748B'}
          />
          <Text
            style={[styles.fleetSubTabText, activeSubTab === 'drivers' && styles.fleetSubTabTextActive]}
            numberOfLines={1}
          >
            Drivers ({driversList.length})
          </Text>
          {pendingDriversCount > 0 && (
            <View
              style={{
                backgroundColor: '#FEF3C7',
                paddingHorizontal: 5,
                paddingVertical: 2,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: '#FCD34D',
                flexShrink: 0,
              }}
            >
              <Text style={{ fontSize: 9, fontWeight: '800', color: '#B45309' }}>
                {pendingDriversCount} Pending
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* SUB-TAB 1: FLEET VEHICLES */}
      {activeSubTab === 'vehicles' && (
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>{t('fleetOverview')}</Text>
            <TouchableOpacity style={styles.addBtn} onPress={openAddTruckModal}>
              <Text style={styles.addBtnText}>+ {t('addTruck')}</Text>
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 6 }}>
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

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 }}>
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
      {activeSubTab === 'drivers' && (
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>{t('driverRole')}</Text>
            <TouchableOpacity style={styles.addBtn} onPress={openAddDriverModal}>
              <Text style={styles.addBtnText}>+ {t('addDriver')}</Text>
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
              const isPending = drv.status === 'PENDING' || drv.verificationStatus === 'PENDING';

              return (
                <TouchableOpacity
                  key={drv.id}
                  activeOpacity={0.85}
                  onPress={() => toggleDriverExpand(drv.id)}
                  style={[styles.card, isExpanded && styles.cardExpanded]}
                >
                  <View style={styles.cardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 6 }}>
                      <View style={styles.driverAvatarBox}>
                        {isValidImageUri(drv.photoUrl) ? (
                          <Image source={{ uri: drv.photoUrl }} style={styles.driverAvatarImg} />
                        ) : (
                          <Ionicons name="person" size={20} color={isPending ? "#D97706" : "#0284C7"} />
                        )}
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

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <View
                        style={[
                          styles.statusBadge,
                          isPending
                            ? { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FCD34D', paddingHorizontal: 7, paddingVertical: 3 }
                            : drv.status === 'ACTIVE'
                            ? styles.statusAvailable
                            : { backgroundColor: '#E0F2FE' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            isPending
                              ? { color: '#92400E', fontWeight: '800', fontSize: 10.5 }
                              : drv.status === 'ACTIVE'
                              ? {}
                              : { color: '#0369A1' },
                          ]}
                        >
                          {isPending ? 'Pending' : drv.status}
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
                    <View style={{ marginTop: 6, gap: 5 }}>
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
                      {isPending && (
                        <View
                          style={{
                            backgroundColor: '#FFFBEB',
                            borderWidth: 1,
                            borderColor: '#FDE68A',
                            paddingHorizontal: 8,
                            paddingVertical: 5,
                            borderRadius: 6,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <Ionicons name="time-outline" size={13} color="#D97706" />
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#B45309', flex: 1 }}>
                            Pending Admin Verification (Cannot be dispatched yet)
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {isExpanded && (
                    <View style={{ gap: 8, marginTop: 4 }}>
                      <View style={styles.cardDivider} />
                      {isPending && (
                        <View
                          style={{
                            backgroundColor: '#FEF3C7',
                            padding: 10,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#FCD34D',
                            gap: 4,
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="shield-outline" size={15} color="#B45309" />
                            <Text style={{ fontSize: 12, fontWeight: '800', color: '#92400E' }}>
                              Awaiting Platform Admin Verification
                            </Text>
                          </View>
                          <Text style={{ fontSize: 11, color: '#78350F', lineHeight: 16 }}>
                            Driver credentials (Commercial Heavy Freight License & FTA status) are currently in the Platform Administrator Queue. Once approved, this driver can be dispatched on Djibouti corridor loads.
                          </Text>
                        </View>
                      )}
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
                      {drv.photoUrl ? (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Driver Biometric / Photo ID:</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                            <Text style={[styles.infoValue, { color: '#047857', fontWeight: '700' }]}>
                              Attached (Verified EXIF)
                            </Text>
                          </View>
                        </View>
                      ) : null}
                      {drv.licenseDocUrl ? (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Physical License Scan:</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="document-attach-outline" size={14} color="#0284C7" />
                            <Text style={[styles.infoValue, { color: '#0284C7', fontWeight: '700' }]}>
                              Uploaded & Available
                            </Text>
                          </View>
                        </View>
                      ) : null}
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
