import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDriverStyles } from '../driverStyles';
import { CheckinRecord, ActiveTripDetails } from '../types';
import { useLanguage } from '../../../context/LanguageContext';
import { formatCleanLocation } from './TripTab';

interface CheckinTabProps {
  checkedInSuccess: string;
  checkinHistory: CheckinRecord[];
  onCheckin: () => void;
  activeTrip?: ActiveTripDetails | null;
  activeWaypoint?: any;
  realGpsLocation?: any;
  onOpenCustomsPass?: () => void;
}

export const CheckinTab: React.FC<CheckinTabProps> = ({
  checkedInSuccess,
  checkinHistory,
  onCheckin,
  activeTrip,
  activeWaypoint,
  realGpsLocation,
  onOpenCustomsPass,
}) => {
  const styles = useDriverStyles();
  const { t, language } = useLanguage();
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

  const cleanOrigin = formatCleanLocation(activeTrip?.origin);
  const cleanDest = formatCleanLocation(activeTrip?.destination);
  const checkpointName =
    activeWaypoint?.name ||
    (activeTrip ? (activeTrip.route || `${cleanOrigin} ➔ ${cleanDest}`) : null);

  const coordsDisplay =
    currentLat !== undefined && currentLng !== undefined
      ? `${Number(currentLat).toFixed(4)}° N, ${Number(currentLng).toFixed(4)}° E`
      : null;

  // Check if driver has ALREADY checked in at this active checkpoint
  const isAlreadyCheckedIn = checkinHistory.some((chk) => {
    const match = chk.coords?.match(/\((.*?)\)/);
    const checkedName = ((chk.locationName || (match ? match[1] : chk.coords)) || '').trim().toLowerCase();
    return checkedName && checkpointName && checkedName === checkpointName.trim().toLowerCase();
  });

  // Calculate Haversine distance between live GPS and this checkpoint (Proximity Detection)
  const wpLat = activeWaypoint?.latitude ?? activeWaypoint?.lat;
  const wpLng = activeWaypoint?.longitude ?? activeWaypoint?.lng;
  let distKm: number | null = null;
  if (realGpsLocation?.latitude && realGpsLocation?.longitude && wpLat && wpLng) {
    const R = 6371;
    const dLat = (wpLat - realGpsLocation.latitude) * (Math.PI / 180);
    const dLon = (wpLng - realGpsLocation.longitude) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(realGpsLocation.latitude * (Math.PI / 180)) * Math.cos(wpLat * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distKm = Math.round(R * c);
  }

  // Helper to format waypoint badge nicely
  const getWaypointBadgeLabel = (type?: string) => {
    if (!type) return language === 'AM' ? 'የኮሪደር ኬላ' : 'CORRIDOR CHECKPOINT';
    const upper = type.toUpperCase();
    if (upper === 'PARKING') return language === 'AM' ? 'የማረፊያ ጣቢያ' : 'TRANSIT STOP';
    if (upper === 'CUSTOMS') return language === 'AM' ? 'የጉምሩክ ፍተሻ' : 'CUSTOMS POST';
    if (upper === 'WEIGHBRIDGE') return language === 'AM' ? 'የክብደት መለኪያ' : 'WEIGHBRIDGE';
    return upper;
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>
        {language === 'AM' ? 'የኬላ መድረሻ ማረጋገጫ' : language === 'OM' ? 'Bakka Gahumsaa Mirkaneessi' : 'Confirm Location Check-In'}
      </Text>

      {/* Success Notification Banner */}
      {checkedInSuccess ? (
        <View
          style={[
            styles.successBox,
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingVertical: 10,
              paddingHorizontal: 14,
              backgroundColor: '#DCFCE7',
              borderColor: '#86EFAC',
              borderRadius: 12,
              marginBottom: 4,
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={18} color="#15803D" />
          <Text style={[styles.successText, { flex: 1, color: '#15803D', fontSize: 12.5 }]}>
            {checkedInSuccess}
          </Text>
        </View>
      ) : null}

      {/* Customs Transit Clearance Badge for Checkpoint Verification */}
      {activeTrip?.customsClearance && (
        activeTrip.customsClearance.isCleared ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F0FDF4',
              borderWidth: 1,
              borderColor: '#86EFAC',
              borderRadius: 14,
              paddingVertical: 10,
              paddingHorizontal: 12,
              marginBottom: 6,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <Ionicons name="shield-checkmark" size={18} color="#059669" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#065F46' }}>
                  {language === 'AM' ? 'የጉምሩክ አረንጓዴ ፈቃድ ማረጋገጫ' : 'CUSTOMS GREEN LINE VERIFIED'}
                </Text>
                <Text style={{ fontSize: 9.5, color: '#047857', fontWeight: '600' }} numberOfLines={1}>
                  Ref: {activeTrip.customsClearance.certificateNo || 'ECC-AUTHORIZED'}
                </Text>
              </View>
            </View>
            {onOpenCustomsPass && (
              <TouchableOpacity
                onPress={onOpenCustomsPass}
                style={{
                  backgroundColor: '#059669',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="qr-code" size={13} color="#FFFFFF" />
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFFFFF' }}>
                  {language === 'AM' ? 'QR አሳይ' : 'QR Pass'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: activeTrip.customsClearance.status === 'NOT_SUBMITTED' ? '#FEF2F2' : '#FFFBEB',
              borderWidth: 1,
              borderColor: activeTrip.customsClearance.status === 'NOT_SUBMITTED' ? '#FECACA' : '#FDE68A',
              borderRadius: 14,
              paddingVertical: 10,
              paddingHorizontal: 12,
              marginBottom: 6,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <Ionicons
                name={activeTrip.customsClearance.status === 'NOT_SUBMITTED' ? 'alert-circle' : 'time'}
                size={18}
                color={activeTrip.customsClearance.status === 'NOT_SUBMITTED' ? '#DC2626' : '#D97706'}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '800',
                    color: activeTrip.customsClearance.status === 'NOT_SUBMITTED' ? '#991B1B' : '#92400E',
                  }}
                >
                  {activeTrip.customsClearance.status === 'NOT_SUBMITTED'
                    ? (language === 'AM' ? 'የጉምሩክ ሰነድ አልገባም (ቀይ መስመር)' : 'CUSTOMS DOSSIER MISSING (RED LINE)')
                    : (language === 'AM' ? 'በጉምሩክ ምርመራ ላይ ያለ' : 'CUSTOMS UNDER REVIEW')}
                </Text>
                <Text
                  style={{
                    fontSize: 9.5,
                    color: activeTrip.customsClearance.status === 'NOT_SUBMITTED' ? '#B91C1C' : '#B45309',
                    fontWeight: '600',
                  }}
                  numberOfLines={1}
                >
                  {activeTrip.customsClearance.status === 'NOT_SUBMITTED'
                    ? (language === 'AM' ? 'ላኪው ሰነድ ሳያቀርብ አረንጓዴ ፈቃድ አይሰጥም' : 'Shipper documents missing. Green line not issued.')
                    : (language === 'AM' ? 'በጉምሩክ ኦፊሰር እየተጣራ ነው' : 'Pending official customs approval.')}
                </Text>
              </View>
            </View>
            {onOpenCustomsPass && (
              <TouchableOpacity
                onPress={onOpenCustomsPass}
                style={{
                  backgroundColor: activeTrip.customsClearance.status === 'NOT_SUBMITTED' ? '#DC2626' : '#D97706',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="information-circle" size={13} color="#FFFFFF" />
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFFFFF' }}>
                  {language === 'AM' ? 'ሁኔታ እይ' : 'Details'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )
      )}

      {/* Active Checkpoint Card */}
      {hasTrip ? (
        <View
          style={[
            styles.card,
            {
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: isAlreadyCheckedIn ? '#86EFAC' : '#E2E8F0',
              backgroundColor: isAlreadyCheckedIn ? '#F0FDF4' : '#FFFFFF',
              shadowColor: '#0F172A',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
              gap: 14,
            },
          ]}
        >
          {/* Header Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: isAlreadyCheckedIn ? '#DCFCE7' : '#E0F2FE',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name={isAlreadyCheckedIn ? 'checkmark-circle' : 'location'}
                  size={18}
                  color={isAlreadyCheckedIn ? '#166534' : '#0284C7'}
                />
              </View>
              <View>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                  {isAlreadyCheckedIn
                    ? (language === 'AM' ? 'የተረጋገጠ ኬላ' : 'Verified Checkpoint')
                    : (language === 'AM' ? 'የአሁኑ የፍተሻ ጣቢያ' : language === 'OM' ? 'Buufata Yeroo Ammaa' : 'Current Checkpoint')}
                </Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: isAlreadyCheckedIn ? '#DCFCE7' : '#EFF6FF',
                paddingHorizontal: 9,
                paddingVertical: 3,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: isAlreadyCheckedIn ? '#86EFAC' : '#BFDBFE',
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '800',
                  color: isAlreadyCheckedIn ? '#166534' : '#1D4ED8',
                  letterSpacing: 0.3,
                }}
              >
                {isAlreadyCheckedIn
                  ? (language === 'AM' ? 'ተረጋግጧል ✓' : 'CLEARED ✓')
                  : getWaypointBadgeLabel(activeWaypoint?.type)}
              </Text>
            </View>
          </View>

          {/* Location Info Box */}
          <View
            style={{
              backgroundColor: isAlreadyCheckedIn ? '#FFFFFF' : '#F8FAFC',
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isAlreadyCheckedIn ? '#BBF7D0' : '#E2E8F0',
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 14.5, fontWeight: '800', color: '#0F172A', lineHeight: 20 }}>
              {checkpointName}
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              {coordsDisplay ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: isAlreadyCheckedIn ? '#F0FDF4' : '#FFFFFF',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                  }}
                >
                  <Ionicons name="navigate-outline" size={12} color="#0284C7" />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#334155', fontFamily: 'monospace' }}>
                    {coordsDisplay}
                  </Text>
                </View>
              ) : null}

              {/* Proximity / Geofence Detection Pill */}
              {distKm !== null && !isNaN(distKm) ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: distKm <= 15 ? '#DCFCE7' : '#EFF6FF',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: distKm <= 15 ? '#86EFAC' : '#BFDBFE',
                  }}
                >
                  <Ionicons
                    name={distKm <= 15 ? 'radio-button-on' : 'compass-outline'}
                    size={12}
                    color={distKm <= 15 ? '#15803D' : '#1D4ED8'}
                  />
                  <Text
                    style={{
                      fontSize: 10.5,
                      fontWeight: '800',
                      color: distKm <= 15 ? '#15803D' : '#1D4ED8',
                    }}
                  >
                    {distKm <= 15
                      ? (language === 'AM' ? 'ኬላው ክልል ደርሰዋል' : 'At Checkpoint Zone')
                      : (language === 'AM' ? `ከኬላው ~${distKm} ኪ.ሜ ርቀት` : `~${distKm} km to checkpoint`)}
                  </Text>
                </View>
              ) : null}

              {/* Live GPS status */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: '#ECFDF5',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: '#A7F3D0',
                }}
              >
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
                <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#047857' }}>
                  {realGpsLocation
                    ? (language === 'AM' ? 'የስልክ ጂፒኤስ (ቀጥታ)' : language === 'OM' ? 'GPS Bilbilaa' : 'Live Phone GPS')
                    : (language === 'AM' ? 'የኮሪደር ጂፒኤስ' : language === 'OM' ? 'GPS Koriidarii' : 'Corridor GPS')}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Button: Disabled if already checked in to PREVENT DUPLICATES */}
          {isAlreadyCheckedIn ? (
            <View
              style={{
                backgroundColor: '#DCFCE7',
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                borderWidth: 1,
                borderColor: '#86EFAC',
              }}
            >
              <Ionicons name="checkmark-circle" size={20} color="#15803D" />
              <Text style={{ color: '#15803D', fontSize: 14, fontWeight: '800', letterSpacing: 0.3 }}>
                {language === 'AM'
                  ? 'በዚህ ኬላ ላይ ቀድመው አረጋግጠዋል ✓'
                  : language === 'OM'
                  ? 'Duraan Mirkanaa’eera ✓'
                  : 'Already Checked In at this Checkpoint ✓'}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={{
                backgroundColor: '#0284C7',
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                shadowColor: '#0284C7',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 3,
              }}
              onPress={onCheckin}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done-circle" size={20} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.3 }}>
                {language === 'AM'
                  ? 'መድረሴን አረጋግጥ'
                  : language === 'OM'
                  ? 'Gahumsa Mirkaneessi'
                  : 'Confirm Waypoint Check-In'}
              </Text>
            </TouchableOpacity>
          )}

          <Text style={{ fontSize: 10.5, color: isAlreadyCheckedIn ? '#15803D' : '#94A3B8', textAlign: 'center', lineHeight: 14 }}>
            {isAlreadyCheckedIn
              ? (language === 'AM'
                  ? 'የመድረሻ ማረጋገጫ ተጠናቋል፤ ወደ ቀጣዩ የኮሪደር ኬላ ይቀጥሉ'
                  : 'Arrival successfully recorded. Proceed along corridor to next checkpoint.')
              : (language === 'AM'
                  ? 'የደረሱበትን ሰዓት እና ጂፒኤስ መረጃ ለላኪው እና ለጉምሩክ በቅጽበት ያስተላልፋል'
                  : language === 'OM'
                  ? 'Yeroo fi GPS gara ergaafi gumruukaatti ni dabarsa'
                  : 'Broadcasts arrival timestamp & GPS telemetry directly to shipper & customs.')}
          </Text>
        </View>
      ) : (
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 24, gap: 8 }]}>
          <Ionicons name="location-outline" size={36} color="#94A3B8" />
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#334155' }}>
            {language === 'AM' ? 'ምንም የተመደበ ንቁ ጉዞ የለም' : language === 'OM' ? 'Imalli Hojiirra Jiru Hin Ramadamne' : 'No Active Trip Assigned'}
          </Text>
          <Text style={{ fontSize: 11, color: '#64748B', textAlign: 'center', maxWidth: 280, lineHeight: 16 }}>
            {language === 'AM'
              ? 'የጭነት ጉዞ ለተሽከርካሪዎ ሲመደብ፣ የኮሪደሩ መቆጣጠሪያ ኬላዎች እና የቴሌማቲክስ መረጃዎች እዚህ ይታያሉ።'
              : language === 'OM'
              ? 'Imalli fe’iinsaa konkolaataa keessaniif yeroo ramadamu buufanni sakatta\'iinsaa asitti mul\'ata.'
              : 'When a consignment trip is assigned to your vehicle, corridor checkpoints and telemetry locations will appear here.'}
          </Text>
        </View>
      )}

      {/* Checkin History */}
      {checkinHistory.length > 0 && (
        <View style={{ gap: 10, marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="time" size={15} color="#0284C7" />
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A' }}>
                {language === 'AM'
                  ? 'የተረጋገጡ መድረሻዎች'
                  : language === 'OM'
                  ? 'Gahumsa Mirkanaa\'e'
                  : 'Confirmed Check-ins'}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: '#E2E8F0',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 10,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#334155' }}>
                {checkinHistory.length}
              </Text>
            </View>
          </View>

          {checkinHistory.map((chk) => {
            // Parse coords & location if combined
            const parsed = chk.coords.match(/^(.*?)\s*\((.*?)\)$/);
            const coordsOnly = parsed ? parsed[1] : chk.coords;
            const locationOnly = (chk as any).locationName || (parsed ? parsed[2] : checkpointName || 'Corridor Checkpoint');

            return (
              <View
                key={chk.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  shadowColor: '#0F172A',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  elevation: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                {/* Verified Circle Icon */}
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#DCFCE7',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="checkmark-sharp" size={18} color="#166534" />
                </View>

                {/* Details */}
                <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <Text
                      style={{ flex: 1, fontSize: 13, fontWeight: '800', color: '#0F172A' }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {locationOnly}
                    </Text>
                    <View
                      style={{
                        backgroundColor: '#DCFCE7',
                        paddingHorizontal: 7,
                        paddingVertical: 2.5,
                        borderRadius: 6,
                        flexShrink: 0,
                      }}
                    >
                      <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#166534' }}>
                        {language === 'AM' ? 'ተረጋግጧል' : 'VERIFIED'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View
                      style={{
                        backgroundColor: '#F1F5F9',
                        paddingHorizontal: 6,
                        paddingVertical: 1,
                        borderRadius: 4,
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#475569', fontFamily: 'monospace' }}>
                        {chk.id}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: '#64748B' }}>
                      {chk.time}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
                    <Ionicons name="navigate-outline" size={11} color="#94A3B8" />
                    <Text style={{ fontSize: 10.5, color: '#64748B', fontFamily: 'monospace' }} numberOfLines={1}>
                      {coordsOnly}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};
