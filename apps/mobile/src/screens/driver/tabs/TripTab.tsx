import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { driverStyles as styles } from '../driverStyles';
import { ActiveTripDetails } from '../types';
import { DriverRealCorridorMap } from '../../../components/DriverRealCorridorMap';
import { calculateCorridorRoadDistanceKm } from '@tradeflow/shared';

interface TripTabProps {
  activeTrip: ActiveTripDetails | null;
  onStartTrip?: () => void;
  onToggleDriving?: (isDriving: boolean) => void;
  onMarkDelivered?: () => void;
  onNavigateToPod?: () => void;
  actionLoading?: boolean;
  gpsStatus?: string;
  realGpsLocation?: any;
  onEnableGps?: () => void;
  onMapInteractionChange?: (interacting: boolean) => void;
}

export const TripTab: React.FC<TripTabProps> = ({
  activeTrip,
  onStartTrip,
  onToggleDriving,
  onMarkDelivered,
  onNavigateToPod,
  actionLoading,
  gpsStatus,
  realGpsLocation,
  onEnableGps,
  onMapInteractionChange,
}) => {
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

  // When there is no active ongoing trip (or trip is delivered), DO NOT show map, start trip, or telemetry
  if (!activeTrip || isDelivered) {
    return (
      <View style={styles.sectionContainer}>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            paddingVertical: 36,
            paddingHorizontal: 20,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#E2E8F0',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
            marginTop: 10,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: isDelivered ? '#ECFDF5' : '#F1F5F9',
              borderWidth: 2,
              borderColor: isDelivered ? '#A7F3D0' : '#E2E8F0',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            {isDelivered ? (
              <Ionicons name="checkmark-done-circle" size={44} color="#059669" />
            ) : (
              <MaterialCommunityIcons name="truck-outline" size={38} color="#64748B" />
            )}
          </View>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A', textAlign: 'center' }}>
            {isDelivered ? 'Trip Delivered' : 'No Active Trip'}
          </Text>
          <Text style={{ textAlign: 'center', marginTop: 8, lineHeight: 20, fontSize: 12.5, color: '#64748B', maxWidth: 300 }}>
            {isDelivered
              ? 'The consignment has safely reached its destination and electronic delivery (e-POD) is confirmed. Escrow payment has been released to the transporter.'
              : 'No active corridor trip is currently assigned to this vehicle. Once your fleet transporter assigns a load, trip details will appear here.'}
          </Text>

          {onNavigateToPod && (
            <TouchableOpacity
              onPress={onNavigateToPod}
              activeOpacity={0.85}
              style={{
                marginTop: 22,
                backgroundColor: isDelivered ? '#064E3B' : '#0F172A',
                paddingVertical: 12,
                paddingHorizontal: 22,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                borderWidth: 1,
                borderColor: isDelivered ? '#10B981' : '#334155',
              }}
            >
              <Ionicons name="receipt-outline" size={16} color={isDelivered ? '#34D399' : '#38BDF8'} />
              <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#FFFFFF' }}>
                {isDelivered ? 'View Digital e-POD Receipt' : 'Digital e-POD Tab'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      {/* Telemetry Status Bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: isInTransit ? (isMoving ? '#ECFDF5' : '#FEF3C7') : '#F0F9FF',
          borderWidth: 1,
          borderColor: isInTransit ? (isMoving ? '#A7F3D0' : '#FDE68A') : '#BAE6FD',
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 8,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: isInTransit ? (isMoving ? '#10B981' : '#F59E0B') : '#0284C7',
            }}
          />
          <Text
            style={{
              fontSize: 11,
              fontWeight: '800',
              color: isInTransit ? (isMoving ? '#065F46' : '#92400E') : '#0369A1',
            }}
          >
            {isInTransit
              ? (isMoving ? `GPS Live: Driving (${activeTrip?.speedKmh || 0} km/h)` : 'GPS Live: Stationary / Rest Stop (0 km/h)')
              : (isDispatched ? 'Trip Dispatched • Ready at Origin' : 'Standby Mode')}
          </Text>
        </View>
        <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748B' }}>
          {totalKm} km Corridor Road
        </Text>
      </View>

      {/* TRIP LIFECYCLE ACTION CONTROL BANNER - PROMINENT START TRIP */}
      {activeTrip && isDispatched && (
        <View
          style={{
            backgroundColor: '#0F172A',
            borderRadius: 18,
            padding: 16,
            borderWidth: 2,
            borderColor: '#10B981',
            gap: 12,
            marginBottom: 14,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="flag" size={18} color="#10B981" />
              <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFFFFF' }}>
                Consignment Ready for Departure
              </Text>
            </View>
            <View style={{ backgroundColor: '#065F46', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#10B981' }}>
              <Text style={{ fontSize: 9, fontWeight: '900', color: '#A7F3D0' }}>AWAITING DEPARTURE</Text>
            </View>
          </View>
          <Text style={{ fontSize: 11.5, color: '#94A3B8', lineHeight: 17 }}>
            Assigned load corridor from <Text style={{ color: '#F1F5F9', fontWeight: 'bold' }}>{activeTrip.origin}</Text> to <Text style={{ color: '#F1F5F9', fontWeight: 'bold' }}>{activeTrip.destination}</Text> ({totalKm} km). Press the button below to commence the trip and broadcast live GPS telemetry to the shipper.
          </Text>
          <TouchableOpacity
            onPress={onStartTrip}
            disabled={actionLoading}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#10B981',
              borderRadius: 14,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              borderWidth: 1,
              borderColor: '#34D399',
            }}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="play" size={18} color="#FFFFFF" />
                <Text style={{ fontSize: 14, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.3 }}>
                  🚀 Start Trip
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ACTIVE IN-TRANSIT REALTIME TRIP CONTROLS */}
      {activeTrip && isInTransit && (
        <View
          style={{
            backgroundColor: '#0F172A',
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: '#334155',
            gap: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: isDriving ? '#10B981' : '#F59E0B',
                }}
              />
              <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFFFFF' }}>
                {isDriving ? 'Vehicle In Motion (Driving)' : 'Vehicle Stopped / Rest Area'}
              </Text>
            </View>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#38BDF8' }}>
              {activeTrip.progressPercentage ?? 0}% done
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            {/* ⏸️ STOP / REST BUTTON */}
            <TouchableOpacity
              onPress={() => onToggleDriving?.(false)}
              disabled={actionLoading || !isDriving}
              activeOpacity={0.85}
              style={{
                flex: 1,
                backgroundColor: !isDriving ? '#334155' : '#D97706',
                opacity: !isDriving ? 0.5 : 1,
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 6,
              }}
            >
              {actionLoading && isDriving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="pause" size={14} color="#FFFFFF" />
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>
                    Stop / Rest
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* ▶️ RESUME DRIVE BUTTON */}
            <TouchableOpacity
              onPress={() => onToggleDriving?.(true)}
              disabled={actionLoading || isDriving}
              activeOpacity={0.85}
              style={{
                flex: 1,
                backgroundColor: isDriving ? '#334155' : '#10B981',
                opacity: isDriving ? 0.5 : 1,
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 6,
              }}
            >
              {actionLoading && !isDriving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="play" size={14} color="#FFFFFF" />
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>
                    Resume Drive
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* 🏁 MARK AS DELIVERED / ARRIVED AT DESTINATION BUTTON */}
          <TouchableOpacity
            onPress={onMarkDelivered}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#059669',
              borderRadius: 12,
              paddingVertical: 13,
              paddingHorizontal: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderWidth: 1.5,
              borderColor: '#34D399',
              marginTop: 6,
            }}
          >
            <Ionicons name="checkmark-done-circle" size={19} color="#FFFFFF" />
            <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.3 }}>
              🏁 Arrived at Destination • Mark as Delivered
            </Text>
          </TouchableOpacity>
        </View>
      )}


      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Speed & Heading</Text>
          <Text style={styles.kpiValue}>
            {isInTransit ? (isDriving ? `${activeTrip?.speedKmh || 58} km/h` : '0 km/h') : '0 km/h'}
          </Text>
          <Text style={{ fontSize: 9.5, color: '#64748B', fontWeight: '700', marginTop: 1 }}>
            {isInTransit ? (isDriving ? `${activeTrip?.heading || 240}° Moving` : 'Stationary / Resting') : 'At Origin'}
          </Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Dynamic ETA</Text>
          <Text style={[styles.kpiValue, { color: '#0284C7' }]}>
            {isInTransit ? (activeTrip?.estimatedEta || '--') : 'Awaiting Start'}
          </Text>
          <Text style={{ fontSize: 9.5, color: activeTrip ? '#059669' : '#64748B', fontWeight: '800', marginTop: 1 }}>
            {isInTransit ? (activeTrip?.etaConfidenceText || 'Live ETA') : 'Ready to Depart'}
          </Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Road & Remaining</Text>
          <Text style={styles.kpiValue}>{totalKm} km</Text>
          <Text style={{ fontSize: 9.5, color: '#64748B', fontWeight: '700', marginTop: 1 }}>
            {isInTransit ? `${activeTrip?.remainingKm ?? totalKm} km left` : '0 km traveled'}
          </Text>
        </View>
      </View>

      {/* Active Assignment Card */}
      {activeTrip ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.cardTitle}>{activeTrip.title}</Text>
              {activeTrip.loadId ? (
                <Text style={{ fontSize: 11, color: '#0284C7', fontWeight: '700', marginTop: 2 }}>
                  {activeTrip.loadId}
                </Text>
              ) : null}
            </View>
            <View
              style={[
                styles.statusBadge,
                isInTransit
                  ? { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }
                  : { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isInTransit ? { color: '#065F46' } : { color: '#92400E' },
                ]}
              >
                {activeTrip.status || 'DISPATCHED'}
              </Text>
            </View>
          </View>

          <View style={styles.routeBox}>
            <Text style={styles.routeCity}>{activeTrip.origin}</Text>
            <Text style={styles.routeArrow}>➔</Text>
            <Text style={styles.routeCity}>{activeTrip.destination}</Text>
          </View>

          <View style={styles.cardDivider} />

          {activeTrip.assignedTruckPlate ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Assigned Truck:</Text>
              <Text style={[styles.infoValue, { fontWeight: '800', color: '#0284C7' }]}>
                🚛 {activeTrip.assignedTruckPlate}
              </Text>
            </View>
          ) : null}

          {activeTrip.shipperName ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Shipper Client:</Text>
              <Text style={styles.infoValue}>{activeTrip.shipperName}</Text>
            </View>
          ) : null}

          {activeTrip.transporterName ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fleet Transporter:</Text>
              <Text style={styles.infoValue}>{activeTrip.transporterName}</Text>
            </View>
          ) : null}

          {activeTrip.cargo ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cargo Commodity:</Text>
              <Text style={styles.infoValue}>{activeTrip.cargo}</Text>
            </View>
          ) : null}

          {activeTrip.weight ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gross Weight:</Text>
              <Text style={styles.infoValue}>{activeTrip.weight} • {totalKm} km road route</Text>
            </View>
          ) : null}

          {/* Real OpenStreetMap Live Corridor Map */}
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
      ) : (
        <View style={styles.emptyCard}>
          <MaterialCommunityIcons name="truck-delivery-outline" size={40} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No Active Trip Assigned</Text>
          <Text style={styles.emptySub}>
            When your fleet manager assigns a corridor route, it will display here with live telemetry.
          </Text>
        </View>
      )}
    </View>
  );
};
