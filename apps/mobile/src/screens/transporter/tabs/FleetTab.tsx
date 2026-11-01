import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransporterStyles } from '../transporterStyles';
import { TruckItem, DriverItem } from '../types';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { isValidImageUri } from '../../../utils/imageUtils';

interface FleetTabProps {
  fleetList: TruckItem[];
  driversList: DriverItem[];
  openAddTruckModal: () => void;
  openAddDriverModal: () => void;
  fleetSubTab?: 'vehicles' | 'drivers';
  setFleetSubTab?: (tab: 'vehicles' | 'drivers') => void;
  onEditTruck?: (truck: TruckItem) => void;
  onDeleteTruck?: (truckId: string) => void;
  onEditDriver?: (driver: DriverItem) => void;
  onDeleteDriver?: (driverId: string) => void;
}

export const FleetTab: React.FC<FleetTabProps> = ({
  fleetList,
  driversList,
  openAddTruckModal,
  openAddDriverModal,
  fleetSubTab,
  setFleetSubTab,
  onEditTruck,
  onDeleteTruck,
  onEditDriver,
  onDeleteDriver,
}) => {
  const styles = useTransporterStyles();
  const { t, language } = useLanguage();
  const { colors, isDark } = useTheme();
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
            {language === 'AM' ? 'ተሽከርካሪዎች' : language === 'OM' ? 'Konkolaattota' : 'Vehicles'} ({fleetList.length})
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
            {language === 'AM' ? 'አሽከርካሪዎች' : language === 'OM' ? 'Konkolaachistoota' : 'Drivers'} ({driversList.length})
          </Text>
          {pendingDriversCount > 0 && (
            <View
              style={{
                backgroundColor: isDark ? '#451A03' : '#FEF3C7',
                paddingHorizontal: 5,
                paddingVertical: 2,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: isDark ? '#B45309' : '#FCD34D',
                flexShrink: 0,
              }}
            >
              <Text style={{ fontSize: 9, fontWeight: '800', color: isDark ? '#FDE68A' : '#B45309' }}>
                {pendingDriversCount} {language === 'AM' ? 'በመጠባበቅ ላይ' : language === 'OM' ? 'Eeggachaa Jira' : 'Pending'}
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
              <Text style={styles.emptyTitle}>
                {language === 'AM' ? 'የተመዘገበ ተሽከርካሪ የለም' : language === 'OM' ? 'Konkolaataan Galmaa’e Hin Jiru' : 'No Fleet Vehicles Registered'}
              </Text>
              <Text style={styles.emptySub}>
                {language === 'AM'
                  ? 'በጅቡቲ ኮሪደር ላይ የማጓጓዣ ጥያቄዎችን ለመቀበል የከባድ ጭነት ተሽከርካሪዎችን ያስመዝግቡ።'
                  : language === 'OM'
                  ? 'Koriidarii Jibutii irratti gaaffii fe’iinsaa argachuuf konkolaattota galmeessaa.'
                  : 'Add your heavy freight vehicles to receive match requests along the Djibouti corridor.'}
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
                            : { backgroundColor: isDark ? '#0C4A6E' : '#E0F2FE' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            trk.status === 'AVAILABLE' ? {} : { color: isDark ? '#38BDF8' : '#0369A1' },
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
                          {trk.driver || (language === 'AM' ? 'ያልተመደበ' : language === 'OM' ? 'Hin Ramadamne' : 'Unassigned')} • {language === 'AM' ? 'ነዳጅ' : language === 'OM' ? 'Boba’aa' : 'Fuel'}: {trk.fuelType || 'DIESEL'} •
                        </Text>
                        <Ionicons
                          name={trk.gpsEnabled ? "radio-button-on" : "radio-button-off"}
                          size={9}
                          color={trk.gpsEnabled ? "#10B981" : "#94A3B8"}
                        />
                        <Text style={[styles.collapsedPreviewText, { color: trk.gpsEnabled ? '#059669' : '#64748B' }]}>
                          {trk.gpsEnabled
                            ? (language === 'AM' ? 'መስመር ላይ' : language === 'OM' ? 'Tamsaasa Irra' : 'Online')
                            : (language === 'AM' ? 'ጠፍቷል' : language === 'OM' ? 'Dhaame' : 'Off')}
                        </Text>
                      </View>
                      <Text style={styles.tapDetailsHint}>
                        {language === 'AM' ? 'ዝርዝር ▾' : language === 'OM' ? 'Bal’ina ▾' : 'Details ▾'}
                      </Text>
                    </View>
                  )}

                  {isExpanded && (
                    <View style={{ gap: 8, marginTop: 4 }}>
                      <View style={styles.cardDivider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                          {language === 'AM' ? 'የሞተር / ነዳጅ ዓይነት:' : language === 'OM' ? 'Gosa Boba’aa / Motooraa:' : 'Engine / Fuel Type:'}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <MaterialCommunityIcons name="gas-station" size={14} color="#0284C7" />
                          <Text style={[styles.infoValue, { color: '#0284C7', fontWeight: '700' }]}>
                            {trk.fuelType || 'DIESEL'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                          {language === 'AM' ? 'የተመደበ አሽከርካሪ:' : language === 'OM' ? 'Konkolaachisaa Ramadame:' : 'Assigned Driver:'}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="person-outline" size={14} color="#64748B" />
                          <Text style={styles.infoValue}>
                            {trk.driver || (language === 'AM' ? 'ያልተመደበ' : language === 'OM' ? 'Hin Ramadamne' : 'Unassigned')}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                          {language === 'AM' ? 'ቴሌማቲክስ / ጂፒኤስ:' : language === 'OM' ? 'Telematiiksii / GPS:' : 'Telematics / GPS:'}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                          <Ionicons
                            name={trk.gpsEnabled ? "radio-button-on" : "radio-button-off"}
                            size={12}
                            color={trk.gpsEnabled ? '#059669' : '#DC2626'}
                          />
                          <Text style={[styles.infoValue, { color: trk.gpsEnabled ? '#059669' : '#DC2626' }]}>
                            {trk.gpsEnabled
                              ? (language === 'AM' ? 'የቀጥታ ቴሌማቲክስ ስርጭት' : language === 'OM' ? 'Tamsaasa Telematiiksii Kallattii' : 'Live Telematics Streaming')
                              : (language === 'AM' ? 'ቦዝኗል' : language === 'OM' ? 'Hojiirra Hin Jirre' : 'Inactive')}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                          {language === 'AM' ? 'የዕቃ ማጓጓዣ ኢንሹራንስ:' : language === 'OM' ? 'Inshuraansii Meeshaa GIT:' : 'GIT Cargo Insurance:'}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="shield-checkmark-outline" size={14} color="#059669" />
                          <Text style={[styles.infoValue, { color: '#059669' }]}>
                            {trk.insuranceStatus}
                          </Text>
                        </View>
                      </View>

                      {/* Fleet Vehicle Actions: Edit & Delete */}
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: isDark ? '#334155' : '#F1F5F9' }}>
                        {onEditTruck && (
                          <TouchableOpacity
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              paddingVertical: 9,
                              backgroundColor: isDark ? '#0C4A6E' : '#F0F9FF',
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: isDark ? '#0284C7' : '#BAE6FD',
                            }}
                            onPress={() => onEditTruck(trk)}
                            activeOpacity={0.75}
                          >
                            <Ionicons name="create-outline" size={16} color={isDark ? '#38BDF8' : '#0284C7'} />
                            <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#38BDF8' : '#0284C7' }}>
                              {language === 'AM' ? 'ተሽከርካሪ አርትዕ' : language === 'OM' ? 'Konkolaataa Gulaali' : 'Edit Vehicle'}
                            </Text>
                          </TouchableOpacity>
                        )}
                        {onDeleteTruck && (
                          <TouchableOpacity
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              paddingVertical: 9,
                              backgroundColor: isDark ? '#450A0A' : '#FEF2F2',
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: isDark ? '#991B1B' : '#FECACA',
                            }}
                            onPress={() => {
                              Alert.alert(
                                language === 'AM' ? 'ተሽከርካሪ ሰርዝ' : language === 'OM' ? 'Konkolaataa Haqi' : 'Delete Vehicle',
                                language === 'AM'
                                  ? `እርግጠኛ ነዎት ተሽከርካሪ ${trk.plateNumber} መሰረዝ ይፈልጋሉ? ይህ እርምጃ ሊመለስ አይችልም።`
                                  : language === 'OM'
                                  ? `Konkolaataa ${trk.plateNumber} haquu barbaaduun keessan mirkanaa’aadhaa? Gochi kun deebifamuu hin danda’u.`
                                  : `Are you sure you want to delete vehicle ${trk.plateNumber}? This action cannot be undone.`,
                                [
                                  { text: language === 'AM' ? 'ሰርዝ' : language === 'OM' ? 'Haqi' : 'Cancel', style: 'cancel' },
                                  {
                                    text: language === 'AM' ? 'አጥፋ' : language === 'OM' ? 'Balleessi' : 'Delete',
                                    style: 'destructive',
                                    onPress: () => onDeleteTruck(trk.id),
                                  },
                                ]
                              );
                            }}
                            activeOpacity={0.75}
                          >
                            <Ionicons name="trash-outline" size={16} color="#DC2626" />
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#DC2626' }}>
                              {language === 'AM' ? 'ሰርዝ' : language === 'OM' ? 'Haqi' : 'Delete'}
                            </Text>
                          </TouchableOpacity>
                        )}
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
              <Text style={styles.emptyTitle}>
                {language === 'AM' ? 'እስካሁን የተመዘገበ አሽከርካሪ የለም' : language === 'OM' ? 'Konkolaachisaan Galmaa’e Hin Jiru' : 'No Drivers Registered Yet'}
              </Text>
              <Text style={styles.emptySub}>
                {language === 'AM'
                  ? 'ለጉዞ ምደባ የተረጋገጡ የከባድ ጭነት አሽከርካሪዎችዎን ይመዝግቡ።'
                  : language === 'OM'
                  ? 'Ramaddii fe’iinsaatiif konkolaachistoota mirkanaa’an galmeessaa.'
                  : 'Add your verified heavy freight drivers to assign them to dispatches.'}
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
                            ? { backgroundColor: isDark ? '#451A03' : '#FEF3C7', borderWidth: 1, borderColor: isDark ? '#B45309' : '#FCD34D', paddingHorizontal: 7, paddingVertical: 3 }
                            : drv.status === 'ACTIVE'
                            ? styles.statusAvailable
                            : { backgroundColor: isDark ? '#0C4A6E' : '#E0F2FE' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            isPending
                              ? { color: isDark ? '#FDE68A' : '#92400E', fontWeight: '800', fontSize: 10.5 }
                              : drv.status === 'ACTIVE'
                              ? {}
                              : { color: isDark ? '#38BDF8' : '#0369A1' },
                          ]}
                        >
                          {isPending
                            ? (language === 'AM' ? 'በመጠባበቅ ላይ' : language === 'OM' ? 'Eeggachaa Jira' : 'Pending')
                            : drv.status === 'ACTIVE'
                            ? (language === 'AM' ? 'ንቁ' : language === 'OM' ? 'Hojiirra' : 'Active')
                            : drv.status}
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
                            {language === 'AM' ? 'ፈቃድ:' : language === 'OM' ? 'Hayyama:' : 'Lic:'} {drv.licenseNumber} •
                          </Text>
                          <MaterialCommunityIcons name="truck-outline" size={12} color="#0284C7" />
                          <Text style={[styles.collapsedPreviewText, { color: drv.assignedTruckPlate ? '#0284C7' : '#64748B' }]}>
                            {drv.assignedTruckPlate || (language === 'AM' ? 'ያልተመደበ' : language === 'OM' ? 'Hin Ramadamne' : 'Unassigned')}
                          </Text>
                        </View>
                        <Text style={styles.tapDetailsHint}>
                          {language === 'AM' ? 'ዝርዝር ▾' : language === 'OM' ? 'Bal’ina ▾' : 'Details ▾'}
                        </Text>
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
                            {language === 'AM'
                              ? 'የአስተዳዳሪ ማረጋገጫ በመጠባበቅ ላይ (እስከሚረጋገጥ ሊመደብ አይችልም)'
                              : language === 'OM'
                              ? 'Mirkaneessi Bulchaa Eeggamaa Jira (Hanga mirkanaa’utti hin ramadamu)'
                              : 'Pending Admin Verification (Cannot be dispatched yet)'}
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
                            paddingHorizontal: 10,
                            paddingVertical: 7,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#FCD34D',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <Ionicons name="shield-outline" size={15} color="#B45309" />
                          <Text style={{ fontSize: 12, fontWeight: '800', color: '#92400E' }}>
                            {language === 'AM' ? 'የአስተዳዳሪ ማረጋገጫ በመጠባበቅ ላይ' : language === 'OM' ? 'Mirkaneessa Bulchaa Eeggachaa Jira' : 'Awaiting Admin Verification'}
                          </Text>
                        </View>
                      )}
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                          {language === 'AM' ? 'የመንጃ ፈቃድ ቁጥር:' : language === 'OM' ? 'Lakkoofsa Hayyama Konkolaachisummaa:' : 'Driving License Number:'}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="card-outline" size={14} color="#64748B" />
                          <Text style={styles.infoValue}>{drv.licenseNumber}</Text>
                        </View>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                          {language === 'AM' ? 'የኮሪደር ልምድ:' : language === 'OM' ? 'Muuxannoo Koriidarii:' : 'Corridor Experience:'}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="ribbon-outline" size={14} color="#64748B" />
                          <Text style={styles.infoValue}>
                            {drv.experienceYears} {language === 'AM' ? 'ዓመታት' : language === 'OM' ? 'Waggaa' : 'Years'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                          {language === 'AM' ? 'የተመደበ ተሽከርካሪ:' : language === 'OM' ? 'Konkolaataa Ramadame:' : 'Assigned Truck:'}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <MaterialCommunityIcons name="truck" size={14} color="#0284C7" />
                          <Text style={[styles.infoValue, { color: '#0284C7', fontWeight: '700' }]}>
                            {drv.assignedTruckPlate || (language === 'AM' ? 'ያልተመደበ' : language === 'OM' ? 'Hin Ramadamne' : 'Unassigned')}
                          </Text>
                        </View>
                      </View>
                      {drv.photoUrl ? (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>
                            {language === 'AM' ? 'የአሽከርካሪ ፎቶ / ባዮሜትሪክ:' : language === 'OM' ? 'Suuraa / Waraqaa Eenyummaa:' : 'Driver Biometric / Photo ID:'}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                            <Text style={[styles.infoValue, { color: '#047857', fontWeight: '700' }]}>
                              {language === 'AM' ? 'ተያይዟል (የተረጋገጠ)' : language === 'OM' ? 'Qabsiifameera (Mirkanaa’e)' : 'Attached (Verified EXIF)'}
                            </Text>
                          </View>
                        </View>
                      ) : null}
                      {drv.licenseDocUrl ? (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>
                            {language === 'AM' ? 'የመንጃ ፈቃድ ቅጅ:' : language === 'OM' ? 'Waraqaa Hayyamaa Scan Ta’e:' : 'Physical License Scan:'}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="document-attach-outline" size={14} color="#0284C7" />
                            <Text style={[styles.infoValue, { color: '#0284C7', fontWeight: '700' }]}>
                              {language === 'AM' ? 'ተጭኗል / ይገኛል' : language === 'OM' ? 'Fe’ameera / Jira' : 'Uploaded & Available'}
                            </Text>
                          </View>
                        </View>
                      ) : null}

                      {/* Driver Actions: Edit & Delete */}
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: isDark ? '#334155' : '#F1F5F9' }}>
                        {onEditDriver && (
                          <TouchableOpacity
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              paddingVertical: 9,
                              backgroundColor: isDark ? '#0C4A6E' : '#F0F9FF',
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: isDark ? '#0284C7' : '#BAE6FD',
                            }}
                            onPress={() => onEditDriver(drv)}
                            activeOpacity={0.75}
                          >
                            <Ionicons name="create-outline" size={16} color={isDark ? '#38BDF8' : '#0284C7'} />
                            <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#38BDF8' : '#0284C7' }}>
                              {language === 'AM' ? 'አሽከርካሪ አርትዕ' : language === 'OM' ? 'Konkolaachisaa Gulaali' : 'Edit Driver'}
                            </Text>
                          </TouchableOpacity>
                        )}
                        {onDeleteDriver && (
                          <TouchableOpacity
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              paddingVertical: 9,
                              backgroundColor: isDark ? '#450A0A' : '#FEF2F2',
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: isDark ? '#991B1B' : '#FECACA',
                            }}
                            onPress={() => {
                              Alert.alert(
                                language === 'AM' ? 'አሽከርካሪ ሰርዝ' : language === 'OM' ? 'Konkolaachisaa Haqi' : 'Delete Driver',
                                language === 'AM'
                                  ? `እርግጠኛ ነዎት አሽከርካሪ ${drv.fullName} መሰረዝ ይፈልጋሉ? ይህ እርምጃ የተመደበውን ተሽከርካሪ የሚያላቅቅ ሲሆን የአሽከርካሪ መዳረሻንም ይሰርዛል።`
                                  : language === 'OM'
                                  ? `Konkolaachisaa ${drv.fullName} haquu barbaaduun keessan mirkanaa’aadhaa? Kun ramaddii konkolaataa ni kaasa, akkaawuntii isaaniis ni dorka.`
                                  : `Are you sure you want to delete driver ${drv.fullName}? This will unassign any linked vehicle and remove their driver access.`,
                                [
                                  { text: language === 'AM' ? 'ሰርዝ' : language === 'OM' ? 'Haqi' : 'Cancel', style: 'cancel' },
                                  {
                                    text: language === 'AM' ? 'አጥፋ' : language === 'OM' ? 'Balleessi' : 'Delete',
                                    style: 'destructive',
                                    onPress: () => onDeleteDriver(drv.id),
                                  },
                                ]
                              );
                            }}
                            activeOpacity={0.75}
                          >
                            <Ionicons name="trash-outline" size={16} color="#DC2626" />
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#DC2626' }}>
                              {language === 'AM' ? 'ሰርዝ' : language === 'OM' ? 'Haqi' : 'Delete'}
                            </Text>
                          </TouchableOpacity>
                        )}
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
