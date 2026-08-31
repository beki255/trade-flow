import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';

interface DriverPortalScreenProps {
  onLogout: () => void;
}

export const DriverPortalScreen: React.FC<DriverPortalScreenProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'trip' | 'nav' | 'checkin' | 'incident' | 'pod'>('trip');

  // Emergency SOS state
  const [sosActive, setSosActive] = useState(false);

  // Active Trip Dynamic State (null by default until trip is assigned from database)
  const [activeTrip, setActiveTrip] = useState<any>(null);

  // Check-in state
  const [checkedInSuccess, setCheckedInSuccess] = useState('');
  const [checkinHistory, setCheckinHistory] = useState<any[]>([]);

  // Incident state
  const [incidentType, setIncidentType] = useState('');
  const [incidentNotes, setIncidentNotes] = useState('');
  const [incidentSent, setIncidentSent] = useState(false);
  const [incidentsList, setIncidentsList] = useState<any[]>([]);

  // Digital POD state
  const [recipientName, setRecipientName] = useState('');
  const [signedPOD, setSignedPOD] = useState(false);
  const [podSuccess, setPodSuccess] = useState(false);

  const waypoints = [
    { id: 'WP-1', name: 'Addis Ababa (Kaliti Dispatch)', status: 'COMPLETED', time: '06:00 AM' },
    { id: 'WP-2', name: 'Modjo Dry Port Toll Gate', status: 'COMPLETED', time: '07:45 AM' },
    { id: 'WP-3', name: 'Awash Arba Safe Parking & Fuel Stop', status: 'ACTIVE_NOW', time: 'In Transit' },
    { id: 'WP-4', name: 'Semera Checkpoint & Scale', status: 'PENDING', time: 'Upcoming' },
    { id: 'WP-5', name: 'Galafi Border Customs (Ethiopia-Djibouti)', status: 'PENDING', time: 'Upcoming' },
    { id: 'WP-6', name: 'Djibouti Port Container Terminal', status: 'PENDING', time: 'Destination' },
  ];

  const handleCheckin = () => {
    const record = {
      id: `CHK-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString(),
      coords: '11.758° N, 41.834° E',
    };
    setCheckinHistory([record, ...checkinHistory]);
    setCheckedInSuccess('GPS Check-in Confirmed!');
    setTimeout(() => setCheckedInSuccess(''), 3000);
  };

  const handleSendIncident = () => {
    if (!incidentType) return;
    const newInc = {
      id: `INC-${Date.now().toString().slice(-4)}`,
      type: incidentType,
      notes: incidentNotes,
      time: new Date().toLocaleTimeString(),
    };
    setIncidentsList([newInc, ...incidentsList]);
    setIncidentSent(true);
    setIncidentType('');
    setIncidentNotes('');
    setTimeout(() => setIncidentSent(false), 3500);
  };

  const handleSignPOD = () => {
    if (!recipientName) return;
    setSignedPOD(true);
    setPodSuccess(true);
    setTimeout(() => setPodSuccess(false), 4000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Top Mobile Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.brandTitle}>TradeFlow Driver</Text>
          <Text style={styles.truckSub}>Truck: ET-3-49102 • Volvo FH16</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Emergency SOS Banner Button */}
      <TouchableOpacity
        style={[styles.sosBanner, sosActive && styles.sosBannerActive]}
        onPress={() => setSosActive(!sosActive)}
        activeOpacity={0.85}
      >
        <Text style={styles.sosText}>
          {sosActive ? '🚨 SOS EMERGENCY SIGNAL ACTIVE (BROADCASTING)' : '🚨 EMERGENCY SOS ASSISTANCE'}
        </Text>
      </TouchableOpacity>

      {/* Main Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 1. TRIP SUMMARY & ROUTE STATUS */}
        {activeTab === 'trip' && (
          <View style={styles.sectionContainer}>
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Speed</Text>
                <Text style={styles.kpiValue}>64 km/h</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Estimated ETA</Text>
                <Text style={[styles.kpiValue, { color: '#0284C7' }]}>11h 20m</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Remaining</Text>
                <Text style={styles.kpiValue}>482 km</Text>
              </View>
            </View>

            {/* Active Assignment Card */}
            {activeTrip ? (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Active Freight Route</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>IN TRANSIT</Text>
                  </View>
                </View>

                <View style={styles.routeBox}>
                  <Text style={styles.routeCity}>📍 Addis Ababa (Kaliti)</Text>
                  <Text style={styles.routeArrow}>⬇️ 870 km Corridor Transit</Text>
                  <Text style={styles.routeCity}>🏁 Djibouti Port (Container Terminal)</Text>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Cargo:</Text>
                  <Text style={styles.infoValue}>{activeTrip.cargo}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Container:</Text>
                  <Text style={styles.infoValue}>40ft HC (MSCU-9948102)</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Weight:</Text>
                  <Text style={styles.infoValue}>28.5 Metric Tons</Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🚚</Text>
                <Text style={styles.emptyTitle}>
                  No Active Trip Assigned
                </Text>
                <Text style={styles.emptySub}>
                  When your fleet manager assigns a corridor route, it will display here.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 2. TURN-BY-TURN CORRIDOR WAYPOINTS */}
        {activeTab === 'nav' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Corridor Waypoints & Checkpoints</Text>
            
            <View style={styles.timeline}>
              {waypoints.map((wp, idx) => (
                <View key={wp.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.dot,
                        wp.status === 'COMPLETED' && styles.dotCompleted,
                        wp.status === 'ACTIVE_NOW' && styles.dotActive,
                      ]}
                    />
                    {idx < waypoints.length - 1 && <View style={styles.line} />}
                  </View>

                  <View style={styles.timelineRight}>
                    <View style={styles.wpHeader}>
                      <Text style={styles.wpName}>{wp.name}</Text>
                      <Text
                        style={[
                          styles.wpStatus,
                          wp.status === 'COMPLETED' && styles.statusCompletedText,
                          wp.status === 'ACTIVE_NOW' && styles.statusActiveText,
                        ]}
                      >
                        {wp.status === 'COMPLETED'
                          ? 'PASSED ✓'
                          : wp.status === 'ACTIVE_NOW'
                          ? 'CURRENT 📍'
                          : 'UPCOMING'}
                      </Text>
                    </View>
                    <Text style={styles.wpTime}>Status: {wp.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 3. OFFLINE WAYPOINT CHECK-IN */}
        {activeTab === 'checkin' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Offline GPS Waypoint Check-in</Text>
            
            {checkedInSuccess ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>✓ {checkedInSuccess}</Text>
              </View>
            ) : null}

            <View style={styles.card}>
              <Text style={styles.infoLabel}>GPS Status:</Text>
              <Text style={styles.coordsText}>📍 11.758° N, 41.834° E (Awash Arba)</Text>

              <TouchableOpacity style={styles.checkinBtn} onPress={handleCheckin}>
                <Text style={styles.checkinBtnText}>Confirm GPS Check-In</Text>
              </TouchableOpacity>
            </View>

            {/* Checkin History */}
            {checkinHistory.length > 0 && (
              <View style={{ gap: 8, marginTop: 10 }}>
                <Text style={styles.sectionTitle}>
                  Confirmed Check-ins
                </Text>
                {checkinHistory.map((chk) => (
                  <View key={chk.id} style={styles.historyCard}>
                    <Text style={styles.historyId}>{chk.id} • {chk.time}</Text>
                    <Text style={styles.historyCoords}>{chk.coords}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 4. INCIDENT REPORTING */}
        {activeTab === 'incident' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Incident Reporting</Text>

            {incidentSent ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>
                  ✓ Incident broadcasted to control center!
                </Text>
              </View>
            ) : null}

            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Incident Type:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Road Closure, Tire Puncture"
                  value={incidentType}
                  onChangeText={setIncidentType}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Incident Details:</Text>
                <TextInput
                  style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                  placeholder="Details and milepost marker..."
                  value={incidentNotes}
                  onChangeText={setIncidentNotes}
                  multiline
                />
              </View>

              <TouchableOpacity style={styles.reportBtn} onPress={handleSendIncident}>
                <Text style={styles.reportBtnText}>Broadcast Incident Alert</Text>
              </TouchableOpacity>
            </View>

            {/* Incident History List */}
            {incidentsList.length > 0 && (
              <View style={{ gap: 8, marginTop: 10 }}>
                <Text style={styles.sectionTitle}>
                  Submitted Incident Reports
                </Text>
                {incidentsList.map((inc) => (
                  <View key={inc.id} style={styles.historyCard}>
                    <Text style={[styles.historyId, { color: '#EF4444' }]}>⚠️ {inc.type}</Text>
                    <Text style={styles.historyCoords}>{inc.notes || 'No extra notes'} ({inc.time})</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 5. DIGITAL POD (PROOF OF DELIVERY) */}
        {activeTab === 'pod' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Digital Proof of Delivery (e-POD)</Text>

            {podSuccess ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>
                  ✓ Delivery confirmed! Digital POD stored on ledger.
                </Text>
              </View>
            ) : null}

            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Recipient Name:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Recipient Full Name"
                  value={recipientName}
                  onChangeText={setRecipientName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Recipient Electronic Signature:</Text>
                <TouchableOpacity
                  style={[styles.signatureBox, signedPOD && styles.signatureBoxSigned]}
                  onPress={handleSignPOD}
                >
                  <Text style={styles.signatureText}>
                    {signedPOD
                      ? '✍️ [Verified Electronic Signature Signed ✓]'
                      : 'Tap here to capture signature'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.podBtn, (!recipientName || !signedPOD) && styles.podBtnDisabled]}
                onPress={handleSignPOD}
                disabled={!recipientName || !signedPOD}
              >
                <Text style={styles.podBtnText}>Complete Electronic POD</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('trip')}
        >
          <Text style={[styles.navIcon, activeTab === 'trip' && styles.navIconActive]}>🗺️</Text>
          <Text style={[styles.navLabel, activeTab === 'trip' && styles.navLabelActive]}>Trip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('nav')}
        >
          <Text style={[styles.navIcon, activeTab === 'nav' && styles.navIconActive]}>🧭</Text>
          <Text style={[styles.navLabel, activeTab === 'nav' && styles.navLabelActive]}>Route</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('checkin')}
        >
          <Text style={[styles.navIcon, activeTab === 'checkin' && styles.navIconActive]}>📍</Text>
          <Text style={[styles.navLabel, activeTab === 'checkin' && styles.navLabelActive]}>Check-in</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('incident')}
        >
          <Text style={[styles.navIcon, activeTab === 'incident' && styles.navIconActive]}>⚠️</Text>
          <Text style={[styles.navLabel, activeTab === 'incident' && styles.navLabelActive]}>Incident</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('pod')}
        >
          <Text style={[styles.navIcon, activeTab === 'pod' && styles.navIconActive]}>✍️</Text>
          <Text style={[styles.navLabel, activeTab === 'pod' && styles.navLabelActive]}>e-POD</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9FD',
  },
  topHeader: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  truckSub: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '700',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    fontSize: 11,
    color: '#F87171',
    fontWeight: '700',
  },
  sosBanner: {
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosBannerActive: {
    backgroundColor: '#991B1B',
  },
  sosText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  sectionContainer: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2EAF2',
    gap: 4,
  },
  kpiLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2EAF2',
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
  routeBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  routeCity: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  routeArrow: {
    fontSize: 11,
    color: '#64748B',
    paddingLeft: 18,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2EAF2',
    borderStyle: 'dashed',
    gap: 8,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  timeline: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2EAF2',
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
    marginRight: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
    marginTop: 4,
  },
  dotCompleted: {
    backgroundColor: '#10B981',
  },
  dotActive: {
    backgroundColor: '#0284C7',
    borderWidth: 2,
    borderColor: '#BAE6FD',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 16,
  },
  wpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wpName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  wpStatus: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  statusCompletedText: {
    color: '#10B981',
  },
  statusActiveText: {
    color: '#0284C7',
  },
  wpTime: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  coordsText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 4,
  },
  checkinBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  checkinBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  successBox: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  successText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2EAF2',
    gap: 2,
  },
  historyId: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  historyCoords: {
    fontSize: 11,
    color: '#64748B',
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: '#0F172A',
  },
  reportBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  reportBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  signatureBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 14,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureBoxSigned: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
    borderStyle: 'solid',
  },
  signatureText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  podBtn: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  podBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  podBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2EAF2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 10,
    elevation: 8,
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flex: 1,
  },
  navIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  navLabelActive: {
    color: '#0284C7',
  },
});
