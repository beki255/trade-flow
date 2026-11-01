import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDriverStyles } from '../driverStyles';
import { IncidentRecord, DynamicRerouteProposal } from '../types';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { formatCleanLocation } from './TripTab';
import { CheckIcon } from '../../../components/AppIcons';
import { uriToDataUrl } from '../../../utils/imageUtils';

interface IncidentTabProps {
  incidentType: string;
  setIncidentType: (val: string) => void;
  incidentSeverity?: string;
  setIncidentSeverity?: (val: string) => void;
  incidentNotes: string;
  setIncidentNotes: (val: string) => void;
  incidentPhoto?: string | null;
  setIncidentPhoto?: (val: string | null) => void;
  incidentSent: boolean;
  incidentsList: IncidentRecord[];
  onSendIncident: () => void;
  realGpsLocation?: { latitude: number; longitude: number; speedKmh?: number } | null;
  activeTrip?: any;
  activeWaypoint?: any;
  pendingReroute?: DynamicRerouteProposal | null;
  onConfirmReroute?: (action: 'ACCEPT' | 'DECLINE') => void;
}

export const INCIDENT_CATEGORIES: {
  id: string;
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  desc: string;
  iconColor: string;
}[] = [
  { id: 'ACCIDENT', iconName: 'car-sport-outline', label: 'Accident', desc: 'Vehicle collision, rollover, or highway obstruction', iconColor: '#EF4444' },
  { id: 'CHECKPOINT_DELAY', iconName: 'time-outline', label: 'Customs Delay', desc: 'Customs queue, weighbridge backlog, or inspection wait', iconColor: '#F59E0B' },
  { id: 'FUEL_OUTAGE', iconName: 'speedometer-outline', label: 'Fuel Outage', desc: 'Highway fuel station out of diesel / closed pumps', iconColor: '#6366F1' },
  { id: 'ROAD_BLOCKAGE', iconName: 'warning-outline', label: 'Road Block', desc: 'Landslide, bridge damage, or major construction standstill', iconColor: '#EA580C' },
  { id: 'SECURITY_CONCERN', iconName: 'shield-outline', label: 'Security Alert', desc: 'Conflict alert, unauthorized checkpoint, or safety hazard', iconColor: '#DC2626' },
];

export const SEVERITY_LEVELS = [
  { id: 'LOW', label: 'Minor', color: '#10B981', bg: '#DCFCE7' },
  { id: 'MEDIUM', label: 'Moderate', color: '#F59E0B', bg: '#FEF3C7' },
  { id: 'HIGH', label: 'Severe', color: '#EA580C', bg: '#FFEDD5' },
  { id: 'CRITICAL', label: 'Critical', color: '#DC2626', bg: '#FEE2E2' },
];

export const IncidentTab: React.FC<IncidentTabProps> = ({
  incidentType,
  setIncidentType,
  incidentSeverity = 'MEDIUM',
  setIncidentSeverity,
  incidentNotes,
  setIncidentNotes,
  incidentPhoto,
  setIncidentPhoto,
  incidentSent,
  incidentsList,
  onSendIncident,
  realGpsLocation,
  activeTrip,
  activeWaypoint,
  pendingReroute,
  onConfirmReroute,
}) => {
  const styles = useDriverStyles();
  const { t, language } = useLanguage();
  const { colors, isDark } = useTheme();
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSeverityDropdownOpen, setIsSeverityDropdownOpen] = useState(false);

  const getCategoryLabel = (id: string) => {
    if (language === 'AM') {
      switch(id) {
        case 'ACCIDENT': return 'አደጋ';
        case 'CHECKPOINT_DELAY': return 'የጉምሩክ መዘግየት';
        case 'FUEL_OUTAGE': return 'የነዳጅ እጥረት';
        case 'ROAD_BLOCKAGE': return 'የመንገድ መዘጋት';
        case 'SECURITY_CONCERN': return 'የደህንነት ስጋት';
        default: return 'አደጋ';
      }
    }
    if (language === 'OM') {
      switch(id) {
        case 'ACCIDENT': return 'Balaa';
        case 'CHECKPOINT_DELAY': return 'Turtii Gumruukaa';
        case 'FUEL_OUTAGE': return 'Hanqina Boba’aa';
        case 'ROAD_BLOCKAGE': return 'Cufama Daandii';
        case 'SECURITY_CONCERN': return 'Akeekkachiisa Nageenyaa';
        default: return 'Balaa';
      }
    }
    switch(id) {
      case 'ACCIDENT': return 'Accident';
      case 'CHECKPOINT_DELAY': return 'Customs Delay';
      case 'FUEL_OUTAGE': return 'Fuel Outage';
      case 'ROAD_BLOCKAGE': return 'Road Block';
      case 'SECURITY_CONCERN': return 'Security Alert';
      default: return 'Incident';
    }
  };

  const getCategoryDesc = (id: string) => {
    if (language === 'AM') {
      switch(id) {
        case 'ACCIDENT': return 'የተሽከርካሪ ግጭት፣ መገልበጥ ወይም የመንገድ መዘጋት';
        case 'CHECKPOINT_DELAY': return 'ረጅም የጉምሩክ ሰልፍ ወይም የፍተሻ መዘግየት';
        case 'FUEL_OUTAGE': return 'የነዳጅ ማደያ ናፍጣ ያለቀበት ወይም የተዘጋ';
        case 'ROAD_BLOCKAGE': return 'የመሬት መንሸራተት፣ የድልድይ ብልሽት ወይም የግንባታ መዘጋጋት';
        case 'SECURITY_CONCERN': return 'የጸጥታ ስጋት፣ ያልተፈቀደ ኬላ ወይም የደህንነት ችግር';
        default: return '';
      }
    }
    if (language === 'OM') {
      switch(id) {
        case 'ACCIDENT': return 'Walitti bu\'iinsa konkolaataa ykn cufama daandii';
        case 'CHECKPOINT_DELAY': return 'Tarree dheeraa gumruukaa ykn sakatta\'iinsa';
        case 'FUEL_OUTAGE': return 'Boba\'aan buufata dhumachuu ykn cufamuu';
        case 'ROAD_BLOCKAGE': return 'Sigiga lafaa, miidhama riqichaa ykn ijaarsa';
        case 'SECURITY_CONCERN': return 'Sodaa nageenyaa, buufata seeraan alaa';
        default: return '';
      }
    }
    switch(id) {
      case 'ACCIDENT': return 'Vehicle collision, rollover, or highway obstruction';
      case 'CHECKPOINT_DELAY': return 'Customs queue, weighbridge backlog, or inspection wait';
      case 'FUEL_OUTAGE': return 'Highway fuel station out of diesel / closed pumps';
      case 'ROAD_BLOCKAGE': return 'Landslide, bridge damage, or major construction standstill';
      case 'SECURITY_CONCERN': return 'Conflict alert, unauthorized checkpoint, or safety hazard';
      default: return '';
    }
  };

  const getSeverityLabel = (id: string) => {
    if (language === 'AM') {
      switch(id) {
        case 'LOW': return 'ዝቅተኛ';
        case 'MEDIUM': return 'መካከለኛ';
        case 'HIGH': return 'ከፍተኛ';
        case 'CRITICAL': return 'አስቸኳይ/ወሳኝ';
        default: return 'መካከለኛ';
      }
    }
    if (language === 'OM') {
      switch(id) {
        case 'LOW': return 'Giddu-galeessa Gadi';
        case 'MEDIUM': return 'Giddu-galeessa';
        case 'HIGH': return 'Olaanaa';
        case 'CRITICAL': return 'Murteessaa';
        default: return 'Giddu-galeessa';
      }
    }
    switch(id) {
      case 'LOW': return 'Minor';
      case 'MEDIUM': return 'Moderate';
      case 'HIGH': return 'Severe';
      case 'CRITICAL': return 'Critical';
      default: return 'Moderate';
    }
  };

  // Current GPS coordinates
  const currentLat = realGpsLocation?.latitude ?? activeWaypoint?.lat ?? activeTrip?.originLat ?? 8.895;
  const currentLng = realGpsLocation?.longitude ?? activeWaypoint?.lng ?? activeTrip?.originLng ?? 38.765;
  const cleanOrigin = formatCleanLocation(activeTrip?.origin);
  const cleanDest = formatCleanLocation(activeTrip?.destination);
  const locationName =
    activeWaypoint?.name ||
    (activeTrip ? (activeTrip.route || `${cleanOrigin} ➔ ${cleanDest}`) : (language === 'AM' ? 'የጅቡቲ–አዲስ አበባ ስትራቴጂክ ኮሪደር' : 'Djibouti–Addis Ababa Strategic Corridor'));

  const handleTogglePhoto = async () => {
    if (incidentPhoto) {
      if (setIncidentPhoto) setIncidentPhoto(null);
      setShowPhotoPreview(false);
      return;
    }

    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
          const file = e.target?.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              const dataUrl = reader.result as string;
              if (setIncidentPhoto) setIncidentPhoto(dataUrl);
              setShowPhotoPreview(true);
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      } else {
        const DocumentPicker = require('expo-document-picker');
        const res = await DocumentPicker.getDocumentAsync({
          type: ['image/*'],
          copyToCacheDirectory: true,
        });
        if (!res.canceled && res.assets && res.assets[0]?.uri) {
          const dataUrl = await uriToDataUrl(res.assets[0].uri);
          if (setIncidentPhoto) setIncidentPhoto(dataUrl);
          setShowPhotoPreview(true);
        }
      }
    } catch (err) {
      console.warn('Incident photo capture error:', err);
    }
  };

  const selectedCat = INCIDENT_CATEGORIES.find((c) => c.id === incidentType) || INCIDENT_CATEGORIES[0];
  const selectedSev = SEVERITY_LEVELS.find((s) => s.id === (incidentSeverity || 'MEDIUM')) || SEVERITY_LEVELS[1];

  const isDelivered = activeTrip?.status?.toUpperCase() === 'DELIVERED';
  const hasTrip = !!activeTrip && !isDelivered;

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle} numberOfLines={1}>{t('incidentTitle') || (language === 'AM' ? 'የኮሪደር አደጋ ሪፖርት ማቅረቢያ' : 'Report Corridor Incident')}</Text>

      {hasTrip ? (
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                {language === 'AM'
                  ? 'የመንገዱን አደጋ በቀጥታ ለኮሪደር መቆጣጠሪያ ያሰራጩ'
                  : language === 'OM'
                  ? 'Balaa qabatamaa yeroo sanaa beeksisaa'
                  : 'Broadcast real-time hazard to corridor dispatch'}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? '#059669' : '#A7F3D0',
              }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
              <Text style={{ fontSize: 9.5, fontWeight: '800', color: isDark ? '#6EE7B7' : '#047857' }}>
                {language === 'AM' ? 'ንቁ ጂፒኤስ' : language === 'OM' ? 'GPS Hojiirra' : 'GPS ACTIVE'}
              </Text>
            </View>
          </View>

      {/* DYNAMIC REROUTING PROPOSAL CARD (SRS FR-05.3) */}
      {pendingReroute && pendingReroute.status === 'PENDING_CONFIRMATION' && (
        <View
          style={{
            backgroundColor: isDark ? '#451A03' : '#FFFBEB',
            borderColor: '#F59E0B',
            borderWidth: 2,
            borderRadius: 18,
            padding: 16,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="warning" size={22} color="#F59E0B" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '900', color: isDark ? '#FDE68A' : '#92400E' }}>
                {language === 'AM' ? 'ተለዋዋጭ አማራጭ መስመር ቀርቧል!' : language === 'OM' ? 'Daandiin Filannoo Dhiyaateera!' : 'Dynamic Rerouting Proposed!'}
              </Text>
              <Text style={{ fontSize: 11, color: isDark ? '#FCD34D' : '#B45309', fontWeight: '700' }}>
                {language === 'AM' ? 'ፈጣን እና አስተማማኝ አማራጭ መስመር ተገኝቷል' : language === 'OM' ? 'Daandii saffisaa fi nagaa qabu argameera' : 'Materially Faster/Safer Path Detected Along Corridor'}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: isDark ? '#78350F' : '#FEF3C7',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '800', color: isDark ? '#FDE68A' : '#B45309' }}>
                {pendingReroute.proposalId}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 12, color: isDark ? '#FCD34D' : '#78350F', lineHeight: 18 }}>
            {pendingReroute.reason}
          </Text>

          {/* Metric Comparison Deltas */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
                padding: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? '#059669' : '#A7F3D0',
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: isDark ? '#A7F3D0' : '#065F46' }}>
                {language === 'AM' ? 'የሚድን ግምታዊ ጊዜ' : language === 'OM' ? 'Yeroo Qusatamu' : 'EST. TIME SAVINGS'}
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '900', color: isDark ? '#6EE7B7' : '#047857' }}>
                -{pendingReroute.estimatedTimeSavingMins} {language === 'AM' ? 'ደቂቃ' : 'min'}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                padding: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textMuted }}>
                {language === 'AM' ? 'የኪ.ሜ ልዩነት' : language === 'OM' ? 'Garaagarummaa Fageenyaa' : 'DISTANCE DELTA'}
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '900', color: colors.text }}>
                +{pendingReroute.distanceDeltaKm} {language === 'AM' ? 'ኪ.ሜ' : 'km'}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                padding: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textMuted }}>
                {language === 'AM' ? 'የቀረበ ማለፊያ' : language === 'OM' ? 'Daandii Qaxxaamuraa' : 'PROPOSED BYPASS'}
              </Text>
              <Text style={{ fontSize: 12, fontWeight: '800', color: isDark ? '#38BDF8' : '#0284C7' }} numberOfLines={1}>
                Dewele Bypass
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            <TouchableOpacity
              onPress={() => onConfirmReroute && onConfirmReroute('ACCEPT')}
              style={{
                flex: 2,
                backgroundColor: '#059669',
                borderRadius: 14,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <CheckIcon size={14} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '900' }}>
                {language === 'AM' ? 'አማራጭ መስመሩን ተቀበል' : language === 'OM' ? 'Daandii Filannoo Fudhadhu' : 'Accept Bypass Reroute'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirmReroute && onConfirmReroute('DECLINE')}
              style={{
                flex: 1,
                backgroundColor: '#F1F5F9',
                borderRadius: 14,
                paddingVertical: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#CBD5E1',
              }}
            >
              <Text style={{ color: '#475569', fontSize: 13, fontWeight: '800' }}>
                {language === 'AM' ? 'አትቀበል' : language === 'OM' ? 'Didi' : 'Decline'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {incidentSent ? (
        <View style={[styles.successBox, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
          <CheckIcon size={14} color="#059669" />
          <Text style={styles.successText}>
            {language === 'AM'
              ? 'ሪፖርቱ ተላልፏል! የኮሪደር ካርታ እና የሚደርስበት ሰዓት ተሻሽሏል።'
              : language === 'OM'
              ? 'Gabaasni ergameera! Daandiin fi yeroon haaromfameera.'
              : 'Incident broadcasted! Corridor routing graph & ETA updated.'}
          </Text>
        </View>
      ) : null}

      <View style={styles.card}>
        {/* Geotagged Location Stamp */}
        <View
          style={{
            backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 12,
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: isDark ? '#0C4A6E' : '#E0F2FE',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="location" size={16} color={isDark ? '#38BDF8' : '#0284C7'} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 12.5, fontWeight: '800', color: colors.text, flex: 1 }} numberOfLines={1}>
                {locationName}
              </Text>
              <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '600' }}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <Text style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 1 }}>
              GPS: {Number(currentLat).toFixed(4)}° N, {Number(currentLng).toFixed(4)}° E • {language === 'AM' ? 'የቀጥታ ጂፒኤስ' : 'Live Geotag'}
            </Text>
          </View>
        </View>

        {/* 1. Incident Category Selection (Clean Dropdown) */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {language === 'AM' ? 'የአደጋው ዓይነት:' : language === 'OM' ? 'Gosa Balaa:' : 'Incident Category:'}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
              if (isSeverityDropdownOpen) setIsSeverityDropdownOpen(false);
            }}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderWidth: 1.5,
              borderColor: isCategoryDropdownOpen ? '#0284C7' : (isDark ? '#334155' : '#E2E8F0'),
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginTop: 4,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name={selectedCat.iconName}
                  size={15}
                  color={selectedCat.iconColor}
                />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, flex: 1 }} numberOfLines={1}>
                {getCategoryLabel(selectedCat.id)}
              </Text>
            </View>
            <Ionicons
              name={isCategoryDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          {/* Category Dropdown Menu */}
          {isCategoryDropdownOpen && (
            <View
              style={{
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderWidth: 1,
                borderColor: isDark ? '#334155' : '#CBD5E1',
                borderRadius: 12,
                marginTop: 4,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              {INCIDENT_CATEGORIES.map((cat, idx) => {
                const isSelected = incidentType === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => {
                      setIncidentType(cat.id);
                      setIsCategoryDropdownOpen(false);
                    }}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      backgroundColor: isSelected
                        ? (isDark ? '#0F172A' : '#F0F9FF')
                        : (isDark ? '#1E293B' : '#FFFFFF'),
                      borderBottomWidth: idx < INCIDENT_CATEGORIES.length - 1 ? 1 : 0,
                      borderBottomColor: isDark ? '#334155' : '#F1F5F9',
                    }}
                  >
                    <View
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 7,
                        backgroundColor: isSelected
                          ? (isDark ? '#0C4A6E' : '#E0F2FE')
                          : (isDark ? '#0F172A' : '#F8FAFC'),
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons
                        name={cat.iconName}
                        size={15}
                        color={isSelected ? (isDark ? '#38BDF8' : '#0284C7') : cat.iconColor}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 12.5,
                          fontWeight: isSelected ? '800' : '600',
                          color: isSelected
                            ? (isDark ? '#38BDF8' : '#0369A1')
                            : colors.text,
                        }}
                      >
                        {getCategoryLabel(cat.id)}
                      </Text>
                      <Text style={{ fontSize: 10.5, color: '#64748B', marginTop: 1 }} numberOfLines={1}>
                        {getCategoryDesc(cat.id)}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={16} color="#0284C7" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {!isCategoryDropdownOpen && selectedCat && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4, paddingLeft: 2 }}>
              <Ionicons name="information-circle-outline" size={14} color="#64748B" />
              <Text style={{ fontSize: 10.5, color: '#64748B', flex: 1 }}>
                {getCategoryDesc(selectedCat.id)}
              </Text>
            </View>
          )}
        </View>

        {/* 2. Severity Level Selection (Clean Dropdown) */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {language === 'AM' ? 'የክብደት ደረጃ:' : language === 'OM' ? 'Sadarkaa Ciminnaa:' : 'Severity Level:'}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setIsSeverityDropdownOpen(!isSeverityDropdownOpen);
              if (isCategoryDropdownOpen) setIsCategoryDropdownOpen(false);
            }}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderWidth: 1.5,
              borderColor: isSeverityDropdownOpen ? '#0284C7' : (isDark ? '#334155' : '#E2E8F0'),
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginTop: 4,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  backgroundColor: isDark ? '#332200' : selectedSev.bg,
                  borderWidth: 1,
                  borderColor: selectedSev.color,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: selectedSev.color }}>
                  {getSeverityLabel(selectedSev.id)}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '500' }}>
                {language === 'AM' ? 'የቅድሚያ ደረጃ' : language === 'OM' ? 'Sadarkaa Dursa' : 'Priority rating'}
              </Text>
            </View>
            <Ionicons
              name={isSeverityDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          {/* Severity Dropdown Menu */}
          {isSeverityDropdownOpen && (
            <View
              style={{
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderWidth: 1,
                borderColor: isDark ? '#334155' : '#CBD5E1',
                borderRadius: 12,
                marginTop: 4,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              {SEVERITY_LEVELS.map((sev, idx) => {
                const isSelected = (incidentSeverity || 'MEDIUM') === sev.id;
                return (
                  <TouchableOpacity
                    key={sev.id}
                    onPress={() => {
                      if (setIncidentSeverity) setIncidentSeverity(sev.id);
                      setIsSeverityDropdownOpen(false);
                    }}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      backgroundColor: isSelected
                        ? (isDark ? '#0F172A' : '#F8FAFC')
                        : (isDark ? '#1E293B' : '#FFFFFF'),
                      borderBottomWidth: idx < SEVERITY_LEVELS.length - 1 ? 1 : 0,
                      borderBottomColor: isDark ? '#334155' : '#F1F5F9',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: sev.color,
                        }}
                      />
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 3,
                          borderRadius: 8,
                          backgroundColor: isDark ? '#332200' : sev.bg,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '800', color: sev.color }}>
                          {getSeverityLabel(sev.id)}
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={16} color={sev.color} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* 3. Incident Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {language === 'AM' ? 'ተጨማሪ ማብራሪያ እና ዝርዝር:' : language === 'OM' ? 'Bal\'ina fi Ibsa:' : 'Observations & Details:'}
          </Text>
          <TextInput
            style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
            placeholder={language === 'AM' ? 'የመንገዱን ሁኔታ፣ የሰልፍ ርዝመት ወይም የተዘጉ መስመሮችን ይግለጹ...' : language === 'OM' ? 'Haala daandii, dheerina tarree ykn cufama ibsaa...' : 'Describe obstruction, queue length, lane closures...'}
            placeholderTextColor={colors.textMuted}
            value={incidentNotes}
            onChangeText={setIncidentNotes}
            multiline
          />
        </View>

        {/* 4. Photo Evidence Upload */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {language === 'AM' ? 'የፎቶ ማስረጃ (አማራጭ):' : language === 'OM' ? 'Ragaa Suuraa (Filannoo):' : 'Photo Evidence (Optional):'}
          </Text>
          <TouchableOpacity
            onPress={handleTogglePhoto}
            activeOpacity={0.75}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: incidentPhoto
                ? (isDark ? '#064E3B' : '#F0FDF4')
                : (isDark ? '#1E293B' : '#F8FAFC'),
              borderColor: incidentPhoto ? '#10B981' : (isDark ? '#334155' : '#CBD5E1'),
              borderWidth: 1,
              borderStyle: incidentPhoto ? 'solid' : 'dashed',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 9,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <Ionicons
                name={incidentPhoto ? 'checkmark-circle' : 'camera-outline'}
                size={18}
                color={incidentPhoto ? '#059669' : colors.textMuted}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: incidentPhoto ? (isDark ? '#6EE7B7' : '#047857') : colors.text,
                  }}
                  numberOfLines={1}
                >
                  {incidentPhoto
                    ? (language === 'AM' ? 'የአደጋው ፎቶ ተያይዟል' : language === 'OM' ? 'Suuraan Balaa Qabateera' : 'Incident Photo Attached')
                    : (language === 'AM' ? 'ቀጥታ ፎቶ ያያይዙ' : language === 'OM' ? 'Suuraa Qabsiisaa' : 'Attach Live Photo')}
                </Text>
                <Text style={{ fontSize: 10, color: colors.textMuted }}>
                  {incidentPhoto
                    ? (language === 'AM' ? 'የተረጋገጠ የጂፒኤስ መረጃ ተካቷል' : 'Verified GPS EXIF metadata embedded')
                    : (language === 'AM' ? 'ፎቶ አንሳ ወይም ከማዕከለ-ስዕላት ምረጥ' : 'Capture photo or choose image')}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 11, fontWeight: '800', color: incidentPhoto ? '#EF4444' : '#0284C7' }}>
              {incidentPhoto
                ? (language === 'AM' ? 'አስወግድ' : language === 'OM' ? 'Haqi' : 'Remove')
                : (language === 'AM' ? 'አንሳ' : language === 'OM' ? 'Kasaa' : 'Capture')}
            </Text>
          </TouchableOpacity>

          {/* Photo Preview Thumbnail */}
          {incidentPhoto && (
            <View
              style={{
                marginTop: 8,
                borderRadius: 12,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#86EFAC',
                backgroundColor: '#F0FDF4',
                padding: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Image
                source={{ uri: incidentPhoto }}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 8,
                  backgroundColor: '#E2E8F0',
                }}
                resizeMode="cover"
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#166534' }}>
                  {language === 'AM' ? 'የተያያዘ ፎቶ' : language === 'OM' ? 'Suuraa Qabate' : 'Attached Evidence Photo'}
                </Text>
                <Text style={{ fontSize: 10, color: '#15803D', marginTop: 2 }}>
                  {language === 'AM' ? '✓ የቀጥታ ጂፒኤስ ማረጋገጫ ተያይዟል' : '✓ Live GPS verification attached'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (setIncidentPhoto) setIncidentPhoto(null);
                  setShowPhotoPreview(false);
                }}
                style={{
                  padding: 6,
                  borderRadius: 20,
                  backgroundColor: '#FEE2E2',
                }}
              >
                <Ionicons name="close" size={16} color="#DC2626" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Broadcast Button */}
        <TouchableOpacity
          style={[
            styles.reportBtn,
            !incidentType && { backgroundColor: '#94A3B8', opacity: 0.7 },
            { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, borderRadius: 12, paddingVertical: 11 },
          ]}
          onPress={onSendIncident}
          disabled={!incidentType}
          activeOpacity={0.85}
        >
          <Ionicons name="megaphone" size={15} color="#FFFFFF" />
          <Text style={styles.reportBtnText}>
            {language === 'AM' ? 'የአደጋ ማስጠንቀቂያ አስተላልፍ ➔' : language === 'OM' ? 'Akeekkachiisa Ergi ➔' : 'Broadcast Geotagged Alert ➔'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : (
      <View style={[styles.card, { alignItems: 'center', paddingVertical: 24, gap: 8 }]}>
        <Ionicons name="warning-outline" size={36} color="#94A3B8" />
        <Text style={{ fontSize: 13, fontWeight: '800', color: '#334155' }}>
          {language === 'AM' ? 'ምንም የተመደበ ንቁ ጉዞ የለም' : language === 'OM' ? 'Imalli Hojiirra Jiru Hin Ramadamne' : 'No Active Trip Assigned'}
        </Text>
        <Text style={{ fontSize: 11, color: '#64748B', textAlign: 'center', maxWidth: 280, lineHeight: 16 }}>
          {language === 'AM'
            ? 'የአደጋ ሪፖርት ማቅረብ የሚቻለው ንቁ የጭነት ጉዞ ሲኖር ብቻ ነው። የጉዞ ትዕዛዝ ሲደርስዎት እዚህ ሪፖርት ማድረግ ይችላሉ።'
            : language === 'OM'
            ? 'Gabaasni balaa dhiyaachuu kan danda\'u imalli hojiirra jiru yoo jiraate qofaadha. Imalli yoo dhiyaatu asirratti gabaasuu dandeessu.'
            : 'Corridor hazard and incident reporting is tied to an active consignment trip. When a freight mission is assigned to your vehicle, reporting tools will appear here.'}
        </Text>
      </View>
    )}

      {/* Submitted Incident History */}
      {incidentsList.length > 0 && (
        <View style={{ gap: 8, marginTop: 10 }}>
          <Text style={styles.sectionTitle}>
            {language === 'AM' ? 'ቀደም ሲል የቀረቡ የአደጋ ሪፖርቶች' : language === 'OM' ? 'Gabaasaalee Balaa Dhiyaatan' : 'Submitted Incident Reports'}
          </Text>
          {incidentsList.map((inc) => (
            <View key={inc.id} style={styles.historyCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.historyId, { color: '#EF4444' }]}>
                  {getCategoryLabel(inc.type)}
                </Text>
                <View
                  style={{
                    backgroundColor: isDark ? '#064E3B' : '#DCFCE7',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 9, fontWeight: '800', color: isDark ? '#6EE7B7' : '#15803D' }}>
                    {language === 'AM' ? '✓ በባለሥልጣን የተረጋገጠ' : language === 'OM' ? '✓ Mirkanaa\'e' : '✓ Authority Verified'}
                  </Text>
                </View>
              </View>
              <Text style={styles.historyCoords}>
                {inc.notes || (language === 'AM' ? 'በአሽከርካሪ የቀረበ የአደጋ ሪፖርት' : 'Driver reported corridor incident')} ({inc.time})
              </Text>
              {inc.coords && (
                <Text style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'monospace' }}>
                  GPS: {inc.coords}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
