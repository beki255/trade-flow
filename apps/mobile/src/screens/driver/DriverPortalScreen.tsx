import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';

interface DriverPortalProps {
  onLogout: () => void;
}

export const DriverPortalScreen: React.FC<DriverPortalProps> = ({ onLogout }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'trip' | 'nav' | 'checkin' | 'incident' | 'pod'>('trip');

  // Emergency SOS state
  const [sosActive, setSosActive] = useState(false);

  // Active Trip Dynamic State (Can be null or active)
  const [activeTrip, setActiveTrip] = useState<any>({
    id: 'TF-TRIP-01',
    cargo: language === 'AM' ? 'የተመደበ ንግድ ጭነት' : 'Assigned Freight Cargo',
    origin: language === 'AM' ? 'አዲስ አበባ' : 'Addis Ababa',
    destination: language === 'AM' ? 'ጅቡቲ ወደብ' : 'Djibouti Port',
    speed: '0 km/h',
    status: 'IN_TRANSIT',
  });

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
    { id: 'WP-1', name: 'Addis Ababa (Kaliti Dispatch)', nameAm: 'አዲስ አበባ (ቃሊቲ መነሻ)', status: 'COMPLETED', time: '06:00 AM' },
    { id: 'WP-2', name: 'Modjo Dry Port Toll Gate', nameAm: 'የሞጆ ደረቅ ወደብ የክፍያ በር', status: 'COMPLETED', time: '07:45 AM' },
    { id: 'WP-3', name: 'Awash Arba Safe Parking & Fuel Stop', nameAm: 'አዋሽ አርባ ማረፊያ እና ነዳጅ ማደያ', status: 'ACTIVE_NOW', time: 'In Transit' },
    { id: 'WP-4', name: 'Semera Checkpoint & Scale', nameAm: 'ሰመራ የጭነት ሚዛን እና ኬላ', status: 'PENDING', time: 'Upcoming' },
    { id: 'WP-5', name: 'Galafi Border Customs (Ethiopia-Djibouti)', nameAm: 'ገላፊ የድንበር ጉምሩክ ኬላ', status: 'PENDING', time: 'Upcoming' },
    { id: 'WP-6', name: 'Djibouti Port Container Terminal', nameAm: 'የጅቡቲ ወደብ የኮንቴይነር ተርሚናል', status: 'PENDING', time: 'Destination' },
  ];

  const handleCheckin = () => {
    const record = {
      id: `CHK-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString(),
      coords: '11.758° N, 41.834° E',
    };
    setCheckinHistory([record, ...checkinHistory]);
    setCheckedInSuccess(language === 'AM' ? 'የጂፒኤስ መድረሻ ማረጋገጫ ተጠናቋል!' : 'GPS Check-in Confirmed!');
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
    setIncidentType('');
    setIncidentNotes('');
    setIncidentSent(true);
    setTimeout(() => setIncidentSent(false), 3000);
  };

  const handleSignPod = () => {
    if (!recipientName) return;
    setSignedPOD(true);
    setPodSuccess(true);
    setTimeout(() => setPodSuccess(false), 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      {/* Top Driver Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.driverName}>
            {language === 'AM' ? 'የአሽከርካሪ መተግበሪያ' : 'Driver Portal'}
          </Text>
          <Text style={styles.truckDetails}>🚚 TradeFlow Corridor Mobile Network</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.langBtn} onPress={toggleLanguage}>
            <Text style={styles.langBtnText}>{language === 'AM' ? '🌐 EN' : '🌐 አማ'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 1. ACTIVE TRIP DASHBOARD */}
        {activeTab === 'trip' && (
          <View style={styles.sectionContainer}>
            
            {/* SOS Emergency Button */}
            <TouchableOpacity
              style={[styles.sosButton, sosActive && styles.sosButtonActive]}
              onPress={() => setSosActive(!sosActive)}
              activeOpacity={0.85}
            >
              <Text style={styles.sosText}>
                {sosActive ? `🚨 ${t('sosBroadcasting')}` : `🚨 ${t('sosEmergency')}`}
              </Text>
            </TouchableOpacity>

            {/* Trip Overview Card */}
            {activeTrip ? (
              <View style={styles.darkCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.tripIdBadge}>{activeTrip.id}</Text>
                  <Text style={styles.speedIndicator}>⚡ {activeTrip.speed}</Text>
                </View>

                <Text style={styles.cargoHeading}>{activeTrip.cargo}</Text>

                <View style={styles.cardDividerDark} />

                <View style={styles.routeGrid}>
                  <View>
                    <Text style={styles.routeLabel}>{t('origin')}</Text>
                    <Text style={styles.routeValue}>{activeTrip.origin}</Text>
                  </View>
                  <Text style={styles.routeArrow}>➔</Text>
                  <View>
                    <Text style={styles.routeLabel}>{t('destination')}</Text>
                    <Text style={styles.routeValue}>{activeTrip.destination}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🚚</Text>
                <Text style={styles.emptyTitle}>
                  {language === 'AM' ? 'እስካሁን የተመደበ ንቁ ጉዞ የለም' : 'No Active Trip Assigned'}
                </Text>
                <Text style={styles.emptySub}>
                  {language === 'AM' ? 'አጓጓዥ ድርጅትዎ አዲስ ጉዞ ሲመድብልዎ እዚህ ጋር ማየት ይችላሉ።' : 'When your fleet manager assigns a corridor route, it will display here.'}
                </Text>
              </View>
            )}

          </View>
        )}

        {/* 2. OFFLINE-CAPABLE TURN-BY-TURN NAVIGATION */}
        {activeTab === 'nav' && (
          <View style={styles.sectionContainer}>
            <View style={styles.offlinePill}>
              <Text style={styles.offlinePillText}>💾 {t('offlineModeActive')}</Text>
            </View>

            <Text style={styles.sectionTitle}>{t('corridorWaypoints')}</Text>

            {waypoints.map((wp, idx) => (
              <View
                key={wp.id}
                style={[
                  styles.waypointCard,
                  wp.status === 'ACTIVE_NOW' && styles.waypointCardActive,
                ]}
              >
                <View style={styles.waypointIndexBox}>
                  <Text style={styles.waypointIndexText}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.waypointName}>
                    {language === 'AM' ? wp.nameAm : wp.name}
                  </Text>
                  <Text style={styles.waypointTime}>{wp.time}</Text>
                </View>
                <View
                  style={[
                    styles.wpBadge,
                    wp.status === 'COMPLETED'
                      ? styles.wpCompleted
                      : wp.status === 'ACTIVE_NOW'
                      ? styles.wpActive
                      : styles.wpPending,
                  ]}
                >
                  <Text style={styles.wpBadgeText}>
                    {wp.status === 'COMPLETED' 
                      ? (language === 'AM' ? 'ተጠናቋል ✓' : 'PASSED ✓')
                      : wp.status === 'ACTIVE_NOW' 
                      ? (language === 'AM' ? 'የአሁኑ ቦታ 📍' : 'CURRENT 📍')
                      : (language === 'AM' ? 'ቀጣይ' : 'UPCOMING')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 3. WAYPOINT CHECK-IN */}
        {activeTab === 'checkin' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('gpsCheckinTitle')}</Text>
            
            {checkedInSuccess ? (
              <View style={styles.successBanner}>
                <Text style={styles.successBannerText}>{checkedInSuccess}</Text>
              </View>
            ) : null}

            <View style={styles.card}>
              <Text style={styles.gpsCoordHeading}>📍 {t('autoGpsLocation')}:</Text>
              <Text style={styles.gpsAccuracy}>{t('gpsAccuracy')}: High (± 3m)</Text>

              <TouchableOpacity style={styles.primaryActionBtn} onPress={handleCheckin}>
                <Text style={styles.primaryActionBtnText}>{t('confirmCheckin')}</Text>
              </TouchableOpacity>
            </View>

            {checkinHistory.length > 0 && (
              <View style={{ gap: 6, marginTop: 8 }}>
                <Text style={styles.sectionTitle}>
                  {language === 'AM' ? 'የተረጋገጡ የቦታ ምዝገባዎች' : 'Confirmed Check-ins'}
                </Text>
                {checkinHistory.map((c) => (
                  <View key={c.id} style={styles.card}>
                    <Text style={styles.infoLabel}>{c.coords} • Recorded at {c.time}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 4. GEOTAGGED INCIDENT REPORTING */}
        {activeTab === 'incident' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('incidentTitle')}</Text>

            {incidentSent ? (
              <View style={styles.successBanner}>
                <Text style={styles.successBannerText}>
                  {language === 'AM' ? '✓ ሪፖርቱ ወደ ደህንነት ማዕከሉ ተልኳል!' : '✓ Incident broadcasted to control center!'}
                </Text>
              </View>
            ) : null}

            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('incidentCategory')} *:</Text>
                <TextInput
                  style={styles.input}
                  placeholder={language === 'AM' ? 'ለምሳሌ፡ የመንገድ መዘጋት ወይም የጎማ መሰበር' : 'e.g. Road Closure, Tire Puncture'}
                  value={incidentType}
                  onChangeText={setIncidentType}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('incidentDescription')}:</Text>
                <TextInput
                  style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
                  placeholder={language === 'AM' ? 'የቦታውና የሁኔታው ማብራሪያ...' : 'Details and milepost marker...'}
                  value={incidentNotes}
                  onChangeText={setIncidentNotes}
                  multiline
                />
              </View>

              <TouchableOpacity style={[styles.primaryActionBtn, { backgroundColor: '#DC2626' }]} onPress={handleSendIncident}>
                <Text style={styles.primaryActionBtnText}>{t('broadcastIncident')}</Text>
              </TouchableOpacity>
            </View>

            {incidentsList.length > 0 && (
              <View style={{ gap: 6, marginTop: 8 }}>
                <Text style={styles.sectionTitle}>
                  {language === 'AM' ? 'የተላኩ ሪፖርቶች' : 'Submitted Incident Reports'}
                </Text>
                {incidentsList.map((inc) => (
                  <View key={inc.id} style={styles.card}>
                    <Text style={[styles.waypointName, { color: '#DC2626' }]}>⚠️ {inc.type}</Text>
                    <Text style={styles.infoLabel}>{inc.notes}</Text>
                    <Text style={[styles.infoLabel, { fontSize: 10 }]}>Time: {inc.time}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 5. DIGITAL PROOF-OF-DELIVERY (POD) */}
        {activeTab === 'pod' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('podTitle')}</Text>
            
            {podSuccess ? (
              <View style={styles.successBanner}>
                <Text style={styles.successBannerText}>
                  {language === 'AM' 
                    ? '✓ ርክክቡ ተጠናቀቀ! የዲጂታል ፊርማ ተመዝግቧል።'
                    : '✓ POD Signed! Cargo Delivered & Signature Recorded.'}
                </Text>
              </View>
            ) : null}

            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('recipientName')} *:</Text>
                <TextInput
                  style={styles.input}
                  placeholder={language === 'AM' ? 'የተረካቢው ሙሉ ስም' : 'Recipient Full Name'}
                  value={recipientName}
                  onChangeText={setRecipientName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('electronicSignature')}:</Text>
                <TouchableOpacity
                  style={styles.signaturePad}
                  onPress={() => setSignedPOD(true)}
                >
                  <Text style={styles.signatureLine}>
                    {signedPOD 
                      ? (language === 'AM' ? '✍️ [ዲጂታል ፊርማ ተረጋግጧል ✓]' : '✍️ [Verified Electronic Signature Signed ✓]')
                      : (language === 'AM' ? 'እዚህ ጋር ይንኩና ፊርማ ያኑሩ' : 'Tap here to capture signature')}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.primaryActionBtn, { backgroundColor: '#10B981' }]} onPress={handleSignPod}>
                <Text style={styles.primaryActionBtnText}>{t('signAndComplete')}</Text>
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
          <Text style={[styles.navIcon, activeTab === 'trip' && styles.navIconActive]}>📍</Text>
          <Text style={[styles.navLabel, activeTab === 'trip' && styles.navLabelActive]}>{t('activeTripTab')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('nav')}
        >
          <Text style={[styles.navIcon, activeTab === 'nav' && styles.navIconActive]}>🧭</Text>
          <Text style={[styles.navLabel, activeTab === 'nav' && styles.navLabelActive]}>{t('offlineNavTab')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('checkin')}
        >
          <Text style={[styles.navIcon, activeTab === 'checkin' && styles.navIconActive]}>📌</Text>
          <Text style={[styles.navLabel, activeTab === 'checkin' && styles.navLabelActive]}>{t('checkinTab')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('incident')}
        >
          <Text style={[styles.navIcon, activeTab === 'incident' && styles.navIconActive]}>⚠️</Text>
          <Text style={[styles.navLabel, activeTab === 'incident' && styles.navLabelActive]}>{t('incidentTab')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('pod')}
        >
          <Text style={[styles.navIcon, activeTab === 'pod' && styles.navIconActive]}>✍️</Text>
          <Text style={[styles.navLabel, activeTab === 'pod' && styles.navLabelActive]}>{t('podTab')}</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  topHeader: {
    backgroundColor: '#0B1120',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  truckDetails: {
    fontSize: 11,
    color: '#38BDF8',
    marginTop: 2,
  },
  langBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  langBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#38BDF8',
  },
  logoutBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logoutText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F87171',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  sectionContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sosButton: {
    backgroundColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  sosButtonActive: {
    backgroundColor: '#991B1B',
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  darkCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripIdBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  speedIndicator: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10B981',
  },
  cargoHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  cardDividerDark: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 4,
  },
  routeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  routeValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  routeArrow: {
    fontSize: 16,
    color: '#38BDF8',
  },
  offlinePill: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  offlinePillText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0369A1',
  },
  waypointCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  waypointCardActive: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  waypointIndexBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waypointIndexText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  waypointName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  waypointTime: {
    fontSize: 10,
    color: '#64748B',
  },
  wpBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  wpCompleted: {
    backgroundColor: '#DCFCE7',
  },
  wpActive: {
    backgroundColor: '#E0F2FE',
  },
  wpPending: {
    backgroundColor: '#F1F5F9',
  },
  wpBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  gpsCoordHeading: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  gpsAccuracy: {
    fontSize: 10,
    color: '#10B981',
  },
  primaryActionBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
  },
  signaturePad: {
    height: 70,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureLine: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#0284C7',
    fontWeight: 'bold',
  },
  successBanner: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  successBannerText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#047857',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  navIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
    transform: [{ scale: 1.15 }],
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748B',
  },
});
