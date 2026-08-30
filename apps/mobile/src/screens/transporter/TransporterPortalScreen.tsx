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

interface TransporterPortalProps {
  onLogout: () => void;
}

export const TransporterPortalScreen: React.FC<TransporterPortalProps> = ({ onLogout }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'fleet' | 'loads' | 'bidding' | 'earnings'>('fleet');

  // Dynamic Fleet State (Starts empty or populated by real additions)
  const [fleetList, setFleetList] = useState<any[]>([]);
  const [showAddTruck, setShowAddTruck] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newDriver, setNewDriver] = useState('');

  // Dynamic Load Board State
  const [loadsList, setLoadsList] = useState<any[]>([]);

  // Bidding form state
  const [selectedLoadId, setSelectedLoadId] = useState<string>('');
  const [bidPrice, setBidPrice] = useState<string>('');
  const [transitHours, setTransitHours] = useState<string>('');
  const [bidNotes, setBidNotes] = useState<string>('');
  const [bidSuccess, setBidSuccess] = useState<string>('');
  const [submittedBids, setSubmittedBids] = useState<any[]>([]);

  const handleAddTruck = () => {
    if (!newPlate || !newModel) return;
    const newTruck = {
      id: `TRK-${Date.now().toString().slice(-4)}`,
      plate: newPlate,
      model: newModel,
      driver: newDriver || (language === 'AM' ? 'ያልተመደበ አሽከርካሪ' : 'Unassigned Driver'),
      status: 'AVAILABLE',
      location: language === 'AM' ? 'አዲስ አበባ ቃሊቲ' : 'Addis Ababa Kaliti',
      fuel: '100%',
    };
    setFleetList([...fleetList, newTruck]);
    setNewPlate('');
    setNewModel('');
    setNewDriver('');
    setShowAddTruck(false);
  };

  const handleSubmitBid = () => {
    if (!selectedLoadId || !bidPrice) return;
    const newBid = {
      id: `BID-${Date.now().toString().slice(-4)}`,
      loadId: selectedLoadId,
      price: `${Number(bidPrice).toLocaleString()} ETB`,
      hours: `${transitHours || '18'} Hours`,
      submittedAt: new Date().toLocaleTimeString(),
    };
    setSubmittedBids([...submittedBids, newBid]);
    setBidSuccess(language === 'AM' ? 'የጨረታ ዋጋው በተሳካ ሁኔታ ገብቷል!' : 'Bid submitted successfully!');
    setTimeout(() => setBidSuccess(''), 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Top Mobile Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.brandTitle}>{t('tradeflow')} {t('transporter')}</Text>
          <Text style={styles.companySub}>
            {fleetList.length} {language === 'AM' ? 'የተመዘገቡ ተሽከርካሪዎች' : 'Registered Trucks'}
          </Text>
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
        
        {/* 1. FLEET STATUS OVERVIEW */}
        {activeTab === 'fleet' && (
          <View style={styles.sectionContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.sectionTitle}>{t('fleetOverview')}</Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setShowAddTruck(!showAddTruck)}
              >
                <Text style={styles.addBtnText}>
                  {showAddTruck ? (language === 'AM' ? 'ሰርዝ' : 'Cancel') : (language === 'AM' ? '+ መኪና መዝግብ' : '+ Add Truck')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Add Truck Form */}
            {showAddTruck && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {language === 'AM' ? 'አዲስ የጭነት መኪና መመዝገቢያ' : 'Register New Fleet Vehicle'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={language === 'AM' ? 'የታርጋ ቁጥር (ለምሳሌ፡ ET-3-99410)' : 'Plate Number (e.g. ET-3-99410)'}
                  value={newPlate}
                  onChangeText={setNewPlate}
                />
                <TextInput
                  style={styles.input}
                  placeholder={language === 'AM' ? 'የመኪናው ሞዴል (ለምሳሌ፡ Iveco Stralis 480)' : 'Truck Model (e.g. Volvo FH16)'}
                  value={newModel}
                  onChangeText={setNewModel}
                />
                <TextInput
                  style={styles.input}
                  placeholder={language === 'AM' ? 'የተመደበው አሽከርካሪ ስም' : 'Assigned Driver Name'}
                  value={newDriver}
                  onChangeText={setNewDriver}
                />
                <TouchableOpacity style={styles.submitBidBtn} onPress={handleAddTruck}>
                  <Text style={styles.submitBidBtnText}>
                    {language === 'AM' ? 'ተሽከርካሪውን መዝግብ' : 'Save Vehicle to Fleet'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Fleet List / Empty State */}
            {fleetList.length === 0 && !showAddTruck ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🚛</Text>
                <Text style={styles.emptyTitle}>
                  {language === 'AM' ? 'እስካሁን የተመዘገበ ተሽከርካሪ የለም' : 'No fleet vehicles registered yet'}
                </Text>
                <Text style={styles.emptySub}>
                  {language === 'AM' ? 'የጭነት መኪናዎችን ለማስመዝገብ ከላይ ያለውን "+ መኪና መዝግብ" ይጫኑ' : 'Tap "+ Add Truck" above to register your transport fleet.'}
                </Text>
              </View>
            ) : (
              fleetList.map((truck) => (
                <View key={truck.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.truckPlate}>{truck.plate}</Text>
                      <Text style={styles.truckModel}>{truck.model}</Text>
                    </View>
                    <View style={[styles.statusBadge, styles.statusAvailable]}>
                      <Text style={styles.statusText}>{truck.status}</Text>
                    </View>
                  </View>
                  <View style={styles.cardDivider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('driver')}:</Text>
                    <Text style={styles.infoValue}>{truck.driver}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('currentPosition')}:</Text>
                    <Text style={[styles.infoValue, { color: '#0284C7' }]}>📍 {truck.location}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* 2. LOAD BOARD */}
        {activeTab === 'loads' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('loadBoardTitle')}</Text>
            <Text style={styles.sectionSubtitle}>{t('loadBoardSub')}</Text>

            {loadsList.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>
                  {language === 'AM' ? 'አዲስ የሚጫኑ እቃዎች በመጠበቅ ላይ...' : 'Waiting for new load postings...'}
                </Text>
                <Text style={styles.emptySub}>
                  {language === 'AM' ? 'አስመጪዎች እና ላኪዎች አዲስ ጭነት ሲመዘግቡ እዚህ ጋር ወዲያውኑ ይታያል።' : 'Shipper cargo postings along the corridor will appear here in real time.'}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* 3. QUICK BID SUBMISSION */}
        {activeTab === 'bidding' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('quickBidTitle')}</Text>

            {bidSuccess ? (
              <View style={styles.successBanner}>
                <Text style={styles.successBannerText}>✓ {bidSuccess}</Text>
              </View>
            ) : null}

            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('selectedLoadId')} *:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. LOAD-001"
                  value={selectedLoadId}
                  onChangeText={setSelectedLoadId}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('proposedRate')} *:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 140000"
                  value={bidPrice}
                  onChangeText={setBidPrice}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('transitHours')}:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 18"
                  value={transitHours}
                  onChangeText={setTransitHours}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('transporterNotes')}:</Text>
                <TextInput
                  style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                  placeholder={language === 'AM' ? 'የመኪና ዝግጁነት ማብራሪያ...' : 'Vehicle specifications & transit commitment...'}
                  value={bidNotes}
                  onChangeText={setBidNotes}
                  multiline
                />
              </View>

              <TouchableOpacity style={styles.submitBidBtn} onPress={handleSubmitBid}>
                <Text style={styles.submitBidBtnText}>{t('submitBid')}</Text>
              </TouchableOpacity>
            </View>

            {/* Submitted Bids List */}
            {submittedBids.length > 0 && (
              <View style={{ gap: 8, marginTop: 10 }}>
                <Text style={styles.sectionTitle}>
                  {language === 'AM' ? 'የገቡ የጨረታ ዋጋዎች' : 'Submitted Bids'}
                </Text>
                {submittedBids.map((b) => (
                  <View key={b.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.truckPlate}>{b.loadId}</Text>
                      <Text style={[styles.kpiValue, { fontSize: 14 }]}>{b.price}</Text>
                    </View>
                    <Text style={styles.infoLabel}>Transit: {b.hours} • Submitted at {b.submittedAt}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 4. EARNINGS & FUEL SUMMARY */}
        {activeTab === 'earnings' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('earningsTitle')}</Text>

            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>{t('totalPayouts')}</Text>
                <Text style={styles.kpiValue}>0 ETB</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>{t('completedTrips')}</Text>
                <Text style={[styles.kpiValue, { color: '#0284C7' }]}>0</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>⛽ {t('fuelEfficiency')}</Text>
              <Text style={styles.emptySub}>
                {language === 'AM' 
                  ? 'ተሽከርካሪዎች ጉዞ ሲጀምሩ የቀጥታ የነዳጅ ፍጆታ እና የቴሌብር ክፍያ ሪፖርቶች እዚህ ጋር ይመዘገባሉ።' 
                  : 'Live fuel consumption data and TeleBirr automated escrow payouts will record here as trips complete.'}
              </Text>
            </View>
          </View>
        )}

      </ScrollView>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('fleet')}
        >
          <Text style={[styles.navIcon, activeTab === 'fleet' && styles.navIconActive]}>🚛</Text>
          <Text style={[styles.navLabel, activeTab === 'fleet' && styles.navLabelActive]}>{t('fleetTab')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('loads')}
        >
          <Text style={[styles.navIcon, activeTab === 'loads' && styles.navIconActive]}>📦</Text>
          <Text style={[styles.navLabel, activeTab === 'loads' && styles.navLabelActive]}>{t('loadBoardTab')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('bidding')}
        >
          <Text style={[styles.navIcon, activeTab === 'bidding' && styles.navIconActive]}>⚡</Text>
          <Text style={[styles.navLabel, activeTab === 'bidding' && styles.navLabelActive]}>{t('quickBidTab')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('earnings')}
        >
          <Text style={[styles.navIcon, activeTab === 'earnings' && styles.navIconActive]}>💰</Text>
          <Text style={[styles.navLabel, activeTab === 'earnings' && styles.navLabelActive]}>{t('earningsTab')}</Text>
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
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  companySub: {
    fontSize: 11,
    color: '#94A3B8',
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
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  addBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  truckPlate: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  truckModel: {
    fontSize: 11,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusAvailable: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
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
    fontSize: 11,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
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
  submitBidBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBidBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  successBanner: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  successBannerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#047857',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10B981',
    marginTop: 4,
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
});
