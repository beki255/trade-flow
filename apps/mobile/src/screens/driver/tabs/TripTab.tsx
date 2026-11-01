import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { ActiveTripDetails } from '../types';
import { DriverRealCorridorMap } from '../../../components/DriverRealCorridorMap';
import { calculateCorridorRoadDistanceKm } from '../../../shared';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme, ThemeColors } from '../../../context/ThemeContext';
import {
  TruckIcon,
  PlayIcon,
  PauseIcon,
  CheckIcon,
  RouteArrowIcon,
  SpeedometerIcon,
  ClockIcon,
  RouteIcon,
  ShipperIcon,
  NavigationIcon,
} from '../../../components/AppIcons';

interface TripTabProps {
  activeTrip: ActiveTripDetails | null;
  onStartTrip?: () => void;
  onToggleDriving?: (isDriving: boolean) => void;
  onMarkDelivered?: () => void;
  onNavigateToPod?: () => void;
  onRefresh?: () => void;
  actionLoading?: boolean;
  gpsStatus?: string;
  realGpsLocation?: any;
  onEnableGps?: () => void;
  onMapInteractionChange?: (interacting: boolean) => void;
}

const capitalizeWords = (str: string) =>
  str.replace(/\b\w/g, (char) => char.toUpperCase());

export const formatCleanLocation = (raw?: string): string => {
  if (!raw || typeof raw !== 'string') return 'Corridor Hub';
  const unquoted = raw.replace(/[`'"]/g, (m) => m === '`' ? '' : m).trim();
  const parts = unquoted.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return capitalizeWords(unquoted.trim());

  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const part of parts) {
    // Strip parenthetical text: "North Shewa (Amhara Region)" -> "North Shewa"
    const base = part.replace(/\s*\(.*?\)\s*/g, '').trim();
    if (!base) continue;

    const normalized = base.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalized === 'ethiopia' || normalized === 'djibouti' || normalized === 'somalia') continue;

    // Check if this city or root name was already included (e.g. "debre berhan" vs "debre birhan")
    const firstWord = base.toLowerCase().split(/\s+/)[0];
    const isDuplicate = Array.from(seen).some((s) => {
      if (s === normalized) return true;
      if (firstWord.length >= 4 && s.startsWith(firstWord)) return true;
      if (normalized.includes(s) || s.includes(normalized)) return true;
      return false;
    });

    if (isDuplicate) continue;

    seen.add(normalized);
    cleaned.push(capitalizeWords(base));
  }

  if (cleaned.length === 0) {
    return capitalizeWords(parts[0].replace(/\s*\(.*?\)\s*/g, '').trim());
  }

  // If the first part is already a complete terminal/facility name, keep it concise
  if (cleaned[0].length >= 22) {
    return cleaned[0];
  }

  if (cleaned.length >= 2) {
    if (`${cleaned[0]}, ${cleaned[1]}`.length <= 26) {
      return `${cleaned[0]}, ${cleaned[1]}`;
    }
  }

  return cleaned[0];
};

export const TripTab: React.FC<TripTabProps> = ({
  activeTrip,
  onStartTrip,
  onToggleDriving,
  onMarkDelivered,
  onNavigateToPod,
  onRefresh,
  actionLoading,
  gpsStatus,
  realGpsLocation,
  onEnableGps,
  onMapInteractionChange,
}) => {
  const { t, language } = useLanguage();
  const { colors, isDark } = useTheme();
  const tabStyles = useMemo(() => getTripStyles(colors, isDark), [colors, isDark]);
  const isInTransit = activeTrip?.status?.toUpperCase() === 'IN_TRANSIT';
  const isDelivered = activeTrip?.status?.toUpperCase() === 'DELIVERED';
  const isDispatched = !!activeTrip && !isInTransit && !isDelivered;
  const isDriving = isInTransit && (activeTrip?.isDriving !== undefined ? activeTrip.isDriving : (activeTrip?.speedKmh ?? 0) > 0);
  const isMoving = isDriving;
  const totalKm =
    activeTrip?.totalDistanceKm ||
    (activeTrip
      ? calculateCorridorRoadDistanceKm(
          activeTrip.origin,
          activeTrip.destination,
          activeTrip.originLat,
          activeTrip.originLng,
          activeTrip.destLat,
          activeTrip.destLng
        )
      : 0);

  const cleanOrigin = formatCleanLocation(activeTrip?.origin);
  const cleanDestination = formatCleanLocation(activeTrip?.destination);
  const cleanLoadId = activeTrip?.loadId && activeTrip.loadId !== activeTrip.title
    ? activeTrip.loadId
    : (activeTrip?.id ? `LD-${activeTrip.id.slice(-4).toUpperCase()}` : 'LD-ACTIVE');

  // Empty state when no trip is active or trip is delivered
  if (!activeTrip || isDelivered) {
    return (
      <View style={tabStyles.container}>
        <View style={tabStyles.emptyCard}>
          <View
            style={[
              tabStyles.emptyIconBadge,
              isDelivered && { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
            ]}
          >
            {isDelivered ? (
              <CheckIcon size={32} color="#059669" />
            ) : (
              <TruckIcon size={32} color="#64748B" />
            )}
          </View>
          <Text style={tabStyles.emptyTitle}>
            {isDelivered ? t('tripDelivered') || 'Consignment Delivered' : t('noActiveTrip') || 'No Active Trip'}
          </Text>
          <Text style={tabStyles.emptySub}>
            {isDelivered
              ? t('tripDeliveredDesc') || 'Trip has reached destination. Proof of delivery is available.'
              : t('noActiveTripDesc') || 'When a shipment is dispatched to your vehicle, mission details will appear here.'}
          </Text>

          {isDelivered ? (
            onNavigateToPod && (
              <TouchableOpacity
                onPress={onNavigateToPod}
                activeOpacity={0.85}
                style={tabStyles.emptyActionBtn}
              >
                <Text style={tabStyles.emptyActionBtnText}>
                  {t('viewPodReceipt') || 'View e-POD Receipt'}
                </Text>
              </TouchableOpacity>
            )
          ) : (
            onRefresh && (
              <TouchableOpacity
                onPress={onRefresh}
                activeOpacity={0.85}
                style={[tabStyles.emptyActionBtn, { backgroundColor: '#0284C7', borderColor: '#38BDF8' }]}
              >
                <Text style={tabStyles.emptyActionBtnText}>
                  {t('checkActiveTrip') || 'Check for Assigned Trip'}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={tabStyles.container}>
      {/* 1. Ultra-Clean Telemetry Status Pill */}
      <View
        style={[
          tabStyles.statusPill,
          isInTransit
            ? isMoving
              ? tabStyles.statusPillDriving
              : tabStyles.statusPillStationary
            : tabStyles.statusPillReady,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 }}>
          <View
            style={[
              tabStyles.statusDot,
              isInTransit
                ? isMoving
                  ? tabStyles.statusDotDriving
                  : tabStyles.statusDotStationary
                : tabStyles.statusDotReady,
            ]}
          />
          <Text
            style={[
              tabStyles.statusPillText,
              isInTransit
                ? isMoving
                  ? { color: isDark ? '#6EE7B7' : '#065F46' }
                  : { color: isDark ? '#FDE68A' : '#92400E' }
                : { color: isDark ? '#38BDF8' : '#0369A1' },
            ]}
            numberOfLines={1}
          >
            {isInTransit
              ? isMoving
                ? (language === 'AM' ? `ቀጥታ ጂፒኤስ: በመጓዝ ላይ (${activeTrip?.speedKmh || 58} ኪ.ሜ/ሰ)` : language === 'OM' ? `GPS Hojirra: Oofaa jira (${activeTrip?.speedKmh || 58} km/h)` : `GPS Live: Driving (${activeTrip?.speedKmh || 58} km/h)`)
                : (language === 'AM' ? `ቀጥታ ጂፒኤስ: በእረፍት ላይ (0 ኪ.ሜ/ሰ)` : language === 'OM' ? `GPS Hojirra: Boqonnaarra (0 km/h)` : `GPS Live: Resting (0 km/h)`)
              : (language === 'AM' ? 'ለመነሳት ዝግጁ' : language === 'OM' ? 'Ka’uuf Qophii' : 'Ready for Departure')}
          </Text>
        </View>
        <Text style={tabStyles.statusPillDistance}>
          {totalKm} {language === 'AM' ? 'ኪ.ሜ' : 'km'}
        </Text>
      </View>

      {/* 2. Streamlined Executive Mission Card */}
      <View style={tabStyles.missionCard}>
        {/* Header: Title, Load ID Tag, Status Badge */}
        <View style={tabStyles.headerRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={tabStyles.titleText} numberOfLines={1}>
                {activeTrip.title || (language === 'AM' ? 'የኮሪደር ጭነት' : 'Corridor Freight')}
              </Text>
              <View style={tabStyles.idBadge}>
                <Text style={tabStyles.idBadgeText}>{cleanLoadId}</Text>
              </View>
            </View>
            <Text style={tabStyles.subText} numberOfLines={1}>
              {activeTrip.cargo || (language === 'AM' ? 'አጠቃላይ ጭነት' : 'General Cargo')}{activeTrip.weight ? ` • ${activeTrip.weight}` : ''}
            </Text>
          </View>

          <View
            style={[
              tabStyles.statusBadge,
              isInTransit ? tabStyles.statusBadgeInTransit : tabStyles.statusBadgeReady,
            ]}
          >
            <Text
              style={[
                tabStyles.statusBadgeText,
                isInTransit
                  ? { color: isDark ? '#6EE7B7' : '#047857' }
                  : { color: isDark ? '#FDE68A' : '#B45309' },
              ]}
            >
              {isInTransit
                ? (language === 'AM' ? 'በጉዞ ላይ' : language === 'OM' ? 'ADEEMSARRA' : 'IN TRANSIT')
                : (language === 'AM' ? 'ዝግጁ' : language === 'OM' ? 'QOPHII' : 'READY')}
            </Text>
          </View>
        </View>

        {/* Clean Direct Route Corridor (Origin ➔ Distance ➔ Destination) */}
        <View style={tabStyles.routeBox}>
          {/* Origin */}
          <View style={tabStyles.routeColLeft}>
            <Text style={tabStyles.routeRole}>
              {language === 'AM' ? 'መነሻ' : language === 'OM' ? 'KA\'UMSA' : 'ORIGIN'}
            </Text>
            <Text style={tabStyles.routeCity} numberOfLines={2}>
              {cleanOrigin}
            </Text>
          </View>

          {/* Direction Arrow & Distance */}
          <View style={tabStyles.routeColCenter}>
            <Text style={tabStyles.routeDistanceText}>{totalKm} {language === 'AM' ? 'ኪ.ሜ' : 'km'}</Text>
            <RouteArrowIcon size={20} color="#0284C7" />
          </View>

          {/* Destination */}
          <View style={tabStyles.routeColRight}>
            <Text style={[tabStyles.routeRole, { textAlign: 'right' }]}>
              {language === 'AM' ? 'መድረሻ' : language === 'OM' ? 'GAHUMSA' : 'DESTINATION'}
            </Text>
            <Text style={[tabStyles.routeCity, { textAlign: 'right' }]} numberOfLines={2}>
              {cleanDestination}
            </Text>
          </View>
        </View>

        {/* Specs Chips: Truck plate and Shipper name */}
        <View style={tabStyles.specsRow}>
          {activeTrip.assignedTruckPlate ? (
            <View style={tabStyles.specPill}>
              <TruckIcon size={13} color="#0284C7" />
              <Text style={tabStyles.specPillText}>{activeTrip.assignedTruckPlate}</Text>
            </View>
          ) : null}
          {activeTrip.shipperName ? (
            <View style={tabStyles.specPill}>
              <ShipperIcon size={12} color={isDark ? '#94A3B8' : '#475569'} />
              <Text style={tabStyles.specPillText} numberOfLines={1}>
                {language === 'AM' ? 'ላኪ:' : language === 'OM' ? 'Ergaa:' : 'Shipper:'} {activeTrip.shipperName}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Simple & Clear Action Controls */}
        {isDispatched ? (
          <TouchableOpacity
            onPress={onStartTrip}
            disabled={actionLoading}
            activeOpacity={0.85}
            style={tabStyles.startTripBtn}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <PlayIcon size={14} color="#FFFFFF" />
                <Text style={tabStyles.startTripBtnText}>{t('startTrip') || (language === 'AM' ? 'ጉዞ ጀምር' : 'Start Trip')}</Text>
              </>
            )}
          </TouchableOpacity>
        ) : isInTransit ? (
          <View style={tabStyles.actionRow}>
            {/* Contextual Toggle: Pause (Rest) vs Resume Drive */}
            <TouchableOpacity
              onPress={() => onToggleDriving?.(!isDriving)}
              disabled={actionLoading}
              activeOpacity={0.85}
              style={[
                tabStyles.toggleBtn,
                isDriving ? tabStyles.pauseBtn : tabStyles.resumeBtn,
              ]}
            >
              {isDriving ? (
                <>
                  <PauseIcon size={13} color="#92400E" />
                  <Text style={tabStyles.pauseBtnText}>
                    {language === 'AM' ? 'እረፍት ውሰድ' : language === 'OM' ? 'Boqonnaa Fudhadhu' : 'Take a Rest'}
                  </Text>
                </>
              ) : (
                <>
                  <PlayIcon size={13} color="#047857" />
                  <Text style={tabStyles.resumeBtnText}>
                    {language === 'AM' ? 'ጉዞ ቀጥል' : language === 'OM' ? 'Oofuu Itti Fufi' : 'Resume Drive'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Mark as Delivered */}
            <TouchableOpacity
              onPress={onMarkDelivered}
              disabled={actionLoading}
              activeOpacity={0.85}
              style={tabStyles.deliveredBtn}
            >
              <CheckIcon size={14} color="#FFFFFF" />
              <Text style={tabStyles.deliveredBtnText}>
                {language === 'AM' ? 'ደርሷል ብለህ መዝግብ' : language === 'OM' ? 'Ga’eera Jechuun Galmeessi' : 'Mark Delivered'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* 3. Streamlined 3-Metric KPI Grid (Pure SVG Icons, NO EMOJIS) */}
      <View style={tabStyles.kpiGrid}>
        {/* Speed */}
        <View style={tabStyles.kpiCard}>
          <View style={tabStyles.kpiHeaderRow}>
            <SpeedometerIcon size={13} color="#0284C7" />
            <Text style={tabStyles.kpiLabel}>
              {language === 'AM' ? 'ፍጥነት' : language === 'OM' ? 'Saffisa' : 'Speed'}
            </Text>
          </View>
          <Text style={tabStyles.kpiValue}>
            {isInTransit ? (isDriving ? `${activeTrip?.speedKmh || 58} km/h` : '0 km/h') : '0 km/h'}
          </Text>
          <Text style={tabStyles.kpiSub}>
            {isInTransit
              ? (isDriving
                  ? (language === 'AM' ? 'በእንቅስቃሴ ላይ' : language === 'OM' ? 'Socho’aa jira' : 'Moving')
                  : (language === 'AM' ? 'በእረፍት ላይ' : language === 'OM' ? 'Boqonnaarra' : 'Resting'))
              : (language === 'AM' ? 'በመነሻ ላይ' : language === 'OM' ? 'Iddoo Ka’umsaa' : 'At Origin')}
          </Text>
        </View>

        {/* Dynamic ETA */}
        <View style={tabStyles.kpiCard}>
          <View style={tabStyles.kpiHeaderRow}>
            <ClockIcon size={13} color="#059669" />
            <Text style={tabStyles.kpiLabel}>
              {language === 'AM' ? 'የሚደርስበት ሰዓት' : language === 'OM' ? 'Yeroo Gahumsaa' : 'Dynamic ETA'}
            </Text>
          </View>
          <Text style={[tabStyles.kpiValue, { color: '#0284C7' }]}>
            {isInTransit ? activeTrip?.estimatedEta || '--' : (language === 'AM' ? 'ዝግጁ' : 'Ready')}
          </Text>
          <Text style={[tabStyles.kpiSub, { color: '#059669' }]}>
            {isInTransit
              ? activeTrip?.etaConfidenceText || (language === 'AM' ? 'ቀጥታ' : 'Live')
              : (language === 'AM' ? 'መነሻ' : language === 'OM' ? 'Ka’umsa' : 'Departure')}
          </Text>
        </View>

        {/* Road Distance */}
        <View style={tabStyles.kpiCard}>
          <View style={tabStyles.kpiHeaderRow}>
            <RouteIcon size={13} color="#7C3AED" />
            <Text style={tabStyles.kpiLabel}>
              {language === 'AM' ? 'ርቀት' : language === 'OM' ? 'Fageenya' : 'Distance'}
            </Text>
          </View>
          <Text style={tabStyles.kpiValue}>{totalKm} {language === 'AM' ? 'ኪ.ሜ' : 'km'}</Text>
          <Text style={tabStyles.kpiSub}>
            {isInTransit
              ? (language === 'AM' ? `${activeTrip?.remainingKm ?? totalKm} ኪ.ሜ ቀርቷል` : language === 'OM' ? `km ${activeTrip?.remainingKm ?? totalKm} hafeera` : `${activeTrip?.remainingKm ?? totalKm} km left`)
              : (language === 'AM' ? 'አጠቃላይ መንገድ' : language === 'OM' ? 'Waliigala daandii' : 'Total road')}
          </Text>
        </View>
      </View>

      {/* 4. Live Corridor Navigation Map */}
      <View style={tabStyles.mapCard}>
        <View style={tabStyles.mapHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <NavigationIcon size={14} color="#0284C7" />
            <Text style={tabStyles.mapTitle}>
              {language === 'AM' ? 'የቀጥታ ኮሪደር አሰሳ' : language === 'OM' ? 'Kallattii Koriidarii Qabatamaa' : 'Live Corridor Navigation'}
            </Text>
          </View>
          <View style={tabStyles.mapBadge}>
            <View style={tabStyles.mapDot} />
            <Text style={tabStyles.mapBadgeText}>
              {gpsStatus === 'GRANTED'
                ? (language === 'AM' ? 'ንቁ ጂፒኤስ' : language === 'OM' ? 'GPS Hojiirra' : 'GPS Active')
                : (language === 'AM' ? 'የኮሪደር መስመር' : language === 'OM' ? 'Daandii Koriidarii' : 'Corridor Route')}
            </Text>
          </View>
        </View>

        <DriverRealCorridorMap
          activeTrip={activeTrip}
          onStartTrip={onStartTrip}
          actionLoading={actionLoading}
          driverGpsLocation={realGpsLocation}
          gpsStatus={gpsStatus}
          onEnableGps={onEnableGps}
          onMapInteractionChange={onMapInteractionChange}
        />
      </View>
    </View>
  );
};

const getTripStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    gap: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  statusPillReady: {
    backgroundColor: isDark ? '#0C4A6E' : '#F0F9FF',
    borderColor: isDark ? '#0284C7' : '#BAE6FD',
  },
  statusPillDriving: {
    backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
    borderColor: isDark ? '#059669' : '#A7F3D0',
  },
  statusPillStationary: {
    backgroundColor: isDark ? '#451A03' : '#FEF3C7',
    borderColor: isDark ? '#B45309' : '#FDE68A',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotReady: {
    backgroundColor: '#0284C7',
  },
  statusDotDriving: {
    backgroundColor: '#10B981',
  },
  statusDotStationary: {
    backgroundColor: '#F59E0B',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusPillDistance: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.textMuted,
  },
  missionCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: isDark ? '#000000' : '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
  },
  subText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  idBadge: {
    backgroundColor: isDark ? '#0C4A6E' : '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  idBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: isDark ? '#38BDF8' : '#0284C7',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeReady: {
    backgroundColor: isDark ? '#451A03' : '#FEF3C7',
    borderColor: isDark ? '#B45309' : '#FDE68A',
  },
  statusBadgeInTransit: {
    backgroundColor: isDark ? '#064E3B' : '#D1FAE5',
    borderColor: isDark ? '#059669' : '#A7F3D0',
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
  },
  routeBox: {
    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeColLeft: {
    flex: 1,
  },
  routeColCenter: {
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 2,
  },
  routeColRight: {
    flex: 1,
  },
  routeRole: {
    fontSize: 8.5,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  routeCity: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  routeDistanceText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: isDark ? '#38BDF8' : '#0284C7',
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  specPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: isDark ? '#E2E8F0' : '#334155',
  },
  startTripBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 2,
  },
  startTripBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  toggleBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  pauseBtn: {
    backgroundColor: isDark ? '#451A03' : '#FEF3C7',
    borderColor: isDark ? '#B45309' : '#FDE68A',
  },
  pauseBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: isDark ? '#FDE68A' : '#92400E',
  },
  resumeBtn: {
    backgroundColor: isDark ? '#064E3B' : '#DCFCE7',
    borderColor: isDark ? '#059669' : '#BBF7D0',
  },
  resumeBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: isDark ? '#6EE7B7' : '#047857',
  },
  deliveredBtn: {
    flex: 1.2,
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deliveredBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  kpiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kpiLabel: {
    fontSize: 9.5,
    color: colors.textMuted,
    fontWeight: '700',
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
  },
  kpiSub: {
    fontSize: 9.5,
    color: colors.textMuted,
    fontWeight: '600',
  },
  mapCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mapTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.text,
  },
  mapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
    borderWidth: 1,
    borderColor: isDark ? '#059669' : '#A7F3D0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mapDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  mapBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: isDark ? '#6EE7B7' : '#047857',
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 10,
  },
  emptyIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  emptySub: {
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    fontSize: 12,
    color: colors.textMuted,
    maxWidth: 280,
  },
  emptyActionBtn: {
    marginTop: 16,
    backgroundColor: '#064E3B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  emptyActionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
