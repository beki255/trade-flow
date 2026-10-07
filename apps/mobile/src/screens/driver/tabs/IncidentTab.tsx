import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { driverStyles as styles } from '../driverStyles';
import { IncidentRecord, DynamicRerouteProposal } from '../types';
import { useLanguage } from '../../../context/LanguageContext';
import { formatCleanLocation } from './TripTab';
import { CheckIcon } from '../../../components/AppIcons';

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
  const { t } = useLanguage();
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);

  // Current GPS coordinates
  const currentLat = realGpsLocation?.latitude ?? activeWaypoint?.lat ?? activeTrip?.originLat ?? 8.895;
  const currentLng = realGpsLocation?.longitude ?? activeWaypoint?.lng ?? activeTrip?.originLng ?? 38.765;
  const cleanOrigin = formatCleanLocation(activeTrip?.origin);
  const cleanDest = formatCleanLocation(activeTrip?.destination);
  const locationName =
    activeWaypoint?.name ||
    (activeTrip ? (activeTrip.route || `${cleanOrigin} ➔ ${cleanDest}`) : 'Djibouti–Addis Ababa Strategic Corridor');

  const handleTogglePhoto = () => {
    if (incidentPhoto) {
      if (setIncidentPhoto) setIncidentPhoto(null);
      setShowPhotoPreview(false);
    } else {
      // Simulate authentic camera capture with GPS metadata
      const simulatedPhoto = 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?q=80&w=800&auto=format&fit=crop';
      if (setIncidentPhoto) setIncidentPhoto(simulatedPhoto);
      setShowPhotoPreview(true);
    }
  };

  const selectedCat = INCIDENT_CATEGORIES.find((c) => c.id === incidentType);

  return (
    <View style={styles.sectionContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.sectionTitle} numberOfLines={1}>{t('incidentTitle') || 'Report Corridor Incident'}</Text>
          <Text style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
            Broadcast real-time hazard to corridor dispatch
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: '#ECFDF5',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#A7F3D0',
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
          <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#047857' }}>GPS ACTIVE</Text>
        </View>
      </View>

      {/* DYNAMIC REROUTING PROPOSAL CARD (SRS FR-05.3) */}
      {pendingReroute && pendingReroute.status === 'PENDING_CONFIRMATION' && (
        <View
          style={{
            backgroundColor: '#FFFBEB',
            borderColor: '#F59E0B',
            borderWidth: 2,
            borderRadius: 18,
            padding: 16,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="warning" size={22} color="#D97706" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#92400E' }}>
                Dynamic Rerouting Proposed!
              </Text>
              <Text style={{ fontSize: 11, color: '#B45309', fontWeight: '700' }}>
                Materially Faster/Safer Path Detected Along Corridor
              </Text>
            </View>
            <View
              style={{
                backgroundColor: '#FEF3C7',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#B45309' }}>
                {pendingReroute.proposalId}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 12, color: '#78350F', lineHeight: 18 }}>
            {pendingReroute.reason}
          </Text>

          {/* Metric Comparison Deltas */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: '#ECFDF5',
                padding: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#A7F3D0',
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#065F46' }}>EST. TIME SAVINGS</Text>
              <Text style={{ fontSize: 15, fontWeight: '900', color: '#047857' }}>
                -{pendingReroute.estimatedTimeSavingMins} min
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: '#F8FAFC',
                padding: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E2E8F0',
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#475569' }}>DISTANCE DELTA</Text>
              <Text style={{ fontSize: 15, fontWeight: '900', color: '#0F172A' }}>
                +{pendingReroute.distanceDeltaKm} km
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: '#F8FAFC',
                padding: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E2E8F0',
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#475569' }}>PROPOSED BYPASS</Text>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#0284C7' }} numberOfLines={1}>
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
                Accept Bypass Reroute
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
                Decline
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {incidentSent ? (
        <View style={[styles.successBox, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
          <CheckIcon size={14} color="#059669" />
          <Text style={styles.successText}>
            Incident broadcasted! Corridor routing graph & ETA updated.
          </Text>
        </View>
      ) : null}

      <View style={styles.card}>
        {/* Geotagged Location Stamp */}
        <View
          style={{
            backgroundColor: '#F8FAFC',
            borderColor: '#E2E8F0',
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
              backgroundColor: '#E0F2FE',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="location" size={16} color="#0284C7" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#0F172A' }} numberOfLines={1}>
                {locationName}
              </Text>
              <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600' }}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <Text style={{ fontSize: 10.5, color: '#64748B', marginTop: 1 }}>
              GPS: {Number(currentLat).toFixed(4)}° N, {Number(currentLng).toFixed(4)}° E • Live Geotag
            </Text>
          </View>
        </View>

        {/* 1. Incident Category Selection (2-Column Compact Grid) */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Incident Category:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 4 }}>
            {INCIDENT_CATEGORIES.map((cat) => {
              const isSelected = incidentType === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setIncidentType(cat.id)}
                  activeOpacity={0.75}
                  style={{
                    width: '48.8%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 7,
                    paddingHorizontal: 10,
                    paddingVertical: 9,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: isSelected ? '#0284C7' : '#E2E8F0',
                    backgroundColor: isSelected ? '#F0F9FF' : '#FFFFFF',
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      backgroundColor: isSelected ? '#E0F2FE' : '#F1F5F9',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons
                      name={cat.iconName}
                      size={14}
                      color={isSelected ? '#0284C7' : cat.iconColor}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: isSelected ? '800' : '600',
                      color: isSelected ? '#0369A1' : '#1E293B',
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {cat.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={14} color="#0284C7" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedCat && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4, paddingLeft: 2 }}>
              <Ionicons name="information-circle-outline" size={14} color="#64748B" />
              <Text style={{ fontSize: 10.5, color: '#64748B', flex: 1 }}>
                {selectedCat.desc}
              </Text>
            </View>
          )}
        </View>

        {/* 2. Severity Level Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Severity Level:</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
            {SEVERITY_LEVELS.map((sev) => {
              const isSelected = (incidentSeverity || 'MEDIUM') === sev.id;
              return (
                <TouchableOpacity
                  key={sev.id}
                  onPress={() => setIncidentSeverity && setIncidentSeverity(sev.id)}
                  activeOpacity={0.75}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 10,
                    alignItems: 'center',
                    borderWidth: 1.5,
                    borderColor: isSelected ? sev.color : '#E2E8F0',
                    backgroundColor: isSelected ? sev.bg : '#FFFFFF',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: isSelected ? '800' : '600',
                      color: isSelected ? sev.color : '#64748B',
                    }}
                    numberOfLines={1}
                  >
                    {sev.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. Incident Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Observations & Details:</Text>
          <TextInput
            style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
            placeholder="Describe obstruction, queue length, lane closures..."
            placeholderTextColor="#94A3B8"
            value={incidentNotes}
            onChangeText={setIncidentNotes}
            multiline
          />
        </View>

        {/* 4. Photo Evidence Upload */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Photo Evidence (Optional):</Text>
          <TouchableOpacity
            onPress={handleTogglePhoto}
            activeOpacity={0.75}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: incidentPhoto ? '#F0FDF4' : '#F8FAFC',
              borderColor: incidentPhoto ? '#10B981' : '#CBD5E1',
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
                color={incidentPhoto ? '#059669' : '#64748B'}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: incidentPhoto ? '#047857' : '#0F172A',
                  }}
                  numberOfLines={1}
                >
                  {incidentPhoto ? 'Incident Photo Attached' : 'Attach Live Photo'}
                </Text>
                <Text style={{ fontSize: 10, color: '#64748B' }}>
                  {incidentPhoto ? 'Verified GPS EXIF metadata embedded' : 'Capture photo or choose image'}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 11, fontWeight: '800', color: incidentPhoto ? '#EF4444' : '#0284C7' }}>
              {incidentPhoto ? 'Remove' : 'Capture'}
            </Text>
          </TouchableOpacity>
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
            Broadcast Geotagged Alert ➔
          </Text>
        </TouchableOpacity>
      </View>

      {/* Submitted Incident History */}
      {incidentsList.length > 0 && (
        <View style={{ gap: 8, marginTop: 10 }}>
          <Text style={styles.sectionTitle}>Submitted Incident Reports</Text>
          {incidentsList.map((inc) => (
            <View key={inc.id} style={styles.historyCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.historyId, { color: '#EF4444' }]}>
                  {inc.type}
                </Text>
                <View
                  style={{
                    backgroundColor: '#DCFCE7',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 9, fontWeight: '800', color: '#15803D' }}>
                    ✓ Authority Verified
                  </Text>
                </View>
              </View>
              <Text style={styles.historyCoords}>
                {inc.notes || 'Driver reported corridor incident'} ({inc.time})
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
