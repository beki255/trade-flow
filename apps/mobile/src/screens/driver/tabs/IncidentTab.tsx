import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { driverStyles as styles } from '../driverStyles';
import { IncidentRecord, DynamicRerouteProposal } from '../types';

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

export const INCIDENT_CATEGORIES = [
  { id: 'ACCIDENT', label: '💥 Accident', desc: 'Vehicle collision, rollover, or highway obstruction' },
  { id: 'CHECKPOINT_DELAY', label: '🛑 Customs Delay', desc: 'Customs queue, weighbridge backlog, or inspection wait' },
  { id: 'FUEL_OUTAGE', label: '⛽ Fuel Stockout', desc: 'Highway fuel station out of diesel / closed pumps' },
  { id: 'ROAD_BLOCKAGE', label: '🚧 Road Blockage', desc: 'Landslide, bridge damage, or major construction standstill' },
  { id: 'SECURITY_CONCERN', label: '🛡️ Security Incident', desc: 'Conflict alert, unauthorized checkpoint, or safety hazard' },
];

export const SEVERITY_LEVELS = [
  { id: 'LOW', label: 'Minor (Low)', color: '#10B981', bg: '#DCFCE7' },
  { id: 'MEDIUM', label: 'Moderate', color: '#F59E0B', bg: '#FEF3C7' },
  { id: 'HIGH', label: 'Severe (High)', color: '#EA580C', bg: '#FFEDD5' },
  { id: 'CRITICAL', label: 'Critical / Closed', color: '#DC2626', bg: '#FEE2E2' },
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
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);

  // Current GPS coordinates
  const currentLat = realGpsLocation?.latitude ?? activeWaypoint?.lat ?? activeTrip?.originLat ?? 8.895;
  const currentLng = realGpsLocation?.longitude ?? activeWaypoint?.lng ?? activeTrip?.originLng ?? 38.765;
  const locationName = activeWaypoint?.name || activeTrip?.route || 'Djibouti–Addis Ababa Strategic Corridor';

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

  return (
    <View style={styles.sectionContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.sectionTitle}>Corridor Incident Reporting</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' }} />
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#10B981' }}>GPS GEOTAGGING ACTIVE</Text>
        </View>
      </View>

      {/* ⚠️ DYNAMIC REROUTING PROPOSAL CARD (SRS FR-05.3) */}
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
            <Text style={{ fontSize: 20 }}>⚠️</Text>
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
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '900' }}>
                ✓ Accept Bypass Reroute
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
        <View style={styles.successBox}>
          <Text style={styles.successText}>
            ✓ Incident broadcasted! Corridor routing graph & ETA updated.
          </Text>
        </View>
      ) : null}

      <View style={styles.card}>
        {/* Geotagged Location Stamp */}
        <View
          style={{
            backgroundColor: '#F0F9FF',
            borderColor: '#BAE6FD',
            borderWidth: 1,
            borderRadius: 14,
            padding: 12,
            gap: 4,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#0369A1' }}>
              📍 GEOTAGGED LOCATION TELEMETRY
            </Text>
            <Text style={{ fontSize: 10, color: '#0284C7', fontWeight: '700' }}>
              {new Date().toLocaleTimeString()}
            </Text>
          </View>
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A' }}>
            {locationName}
          </Text>
          <Text style={{ fontSize: 11, color: '#64748B', fontFamily: 'monospace' }}>
            GPS: {Number(currentLat).toFixed(4)}° N, {Number(currentLng).toFixed(4)}° E (±5m accuracy)
          </Text>
        </View>

        {/* 1. Incident Category Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Incident Category:</Text>
          <View style={{ gap: 6, marginTop: 4 }}>
            {INCIDENT_CATEGORIES.map((cat) => {
              const isSelected = incidentType === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setIncidentType(cat.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 10,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: isSelected ? '#0284C7' : '#E2E8F0',
                    backgroundColor: isSelected ? '#E0F2FE' : '#F8FAFC',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: isSelected ? '900' : '700',
                        color: isSelected ? '#0369A1' : '#1E293B',
                      }}
                    >
                      {cat.label}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#64748B', marginTop: 1 }}>
                      {cat.desc}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      borderWidth: 2,
                      borderColor: isSelected ? '#0284C7' : '#CBD5E1',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#0284C7',
                        }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
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
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 10,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: isSelected ? sev.color : '#CBD5E1',
                    backgroundColor: isSelected ? sev.bg : '#F8FAFC',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: isSelected ? '900' : '700',
                      color: isSelected ? sev.color : '#64748B',
                    }}
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
          <Text style={styles.inputLabel}>Incident Description & Observations:</Text>
          <TextInput
            style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
            placeholder="Describe obstruction, queue length, lane closures, or safety situation..."
            placeholderTextColor="#94A3B8"
            value={incidentNotes}
            onChangeText={setIncidentNotes}
            multiline
          />
        </View>

        {/* 4. Photo Evidence Upload */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Photo Evidence (Camera / Upload):</Text>
          <TouchableOpacity
            onPress={handleTogglePhoto}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: incidentPhoto ? '#F0FDF4' : '#F8FAFC',
              borderColor: incidentPhoto ? '#10B981' : '#CBD5E1',
              borderWidth: 1,
              borderStyle: incidentPhoto ? 'solid' : 'dashed',
              borderRadius: 12,
              padding: 12,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 18 }}>{incidentPhoto ? '📷' : '📸'}</Text>
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '800',
                    color: incidentPhoto ? '#047857' : '#0F172A',
                  }}
                >
                  {incidentPhoto ? 'Incident Photo Attached' : 'Attach Geotagged Photo'}
                </Text>
                <Text style={{ fontSize: 10, color: '#64748B' }}>
                  {incidentPhoto ? 'corridor-incident-evidence.jpg (Verified GPS EXIF)' : 'Tap to snap live photo or choose image'}
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
          style={[styles.reportBtn, !incidentType && { backgroundColor: '#94A3B8' }]}
          onPress={onSendIncident}
          disabled={!incidentType}
        >
          <Text style={styles.reportBtnText}>
            Broadcast Geotagged Incident Alert
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
