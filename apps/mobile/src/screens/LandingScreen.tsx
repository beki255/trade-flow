import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export const LandingScreen: React.FC = () => {
  const { language } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<string>('DRIVER');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="flash" size={22} color="#38BDF8" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.brandTitle}>TradeFlow Mobile</Text>
            <Text style={styles.brandSubtitle}>
              {language === 'AM'
                ? 'የኢትዮጵያ ሎጂስቲክስና የጭነት ኮሪደር'
                : language === 'OM'
                ? 'Koriidarii Geejjibaa fi Loojistiksii Itoophiyaa'
                : 'Ethiopia Logistics & Freight Corridor'}
            </Text>
          </View>
          <LanguageSwitcher dark={true} />
        </View>

        {/* Hero Banner */}
        <View style={styles.heroCard}>
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>
              {language === 'AM'
                ? 'የኮሪደር ቴሌማቲክስ ንቁ ነው'
                : language === 'OM'
                ? 'TEELIMAATIKSIIN KORIIDARII BANAMEERA'
                : 'CORRIDOR TELEMATICS ACTIVE'}
            </Text>
          </View>
          <Text style={styles.heroHeading}>
            {language === 'AM'
              ? 'ጭነትዎን ዲጂታላይዝ ያድርጉ።\n'
              : language === 'OM'
              ? 'Fe\'iisa Keessan Dijitaaleessi.\n'
              : 'Digitize Your Freight.\n'}
            <Text style={styles.heroHighlight}>
              {language === 'AM'
                ? 'የቀጥታ ስርጭት ክትትል።'
                : language === 'OM'
                ? 'Hordoffii Kallattii.'
                : 'Real-Time Tracking.'}
            </Text>
          </Text>
          <Text style={styles.heroDescription}>
            {language === 'AM'
              ? 'የጅቡቲ ወደብ ➔ ሞጆ ደረቅ ወደብ ➔ አዲስ አበባ። ከመስመር ውጭ የሚሰራ የጂፒኤስ ዳሰሳ፣ የፍተሻ ጣቢያ ፍተሻ እና ዲጂታል ርክክብ።'
              : language === 'OM'
              ? 'Buufata Jibuutii ➔ Buufata Gogaa Moojoo ➔ Finfinnee. Tooftaa GPS toora irraa ala, sakatta\'iinsa bakkaa fi mirkaneessa fe\'iisa dijitaalaa.'
              : 'Djibouti Port ➔ Modjo Dry Port ➔ Addis Ababa. Offline-ready GPS navigation, waypoint check-ins & digital proof-of-delivery.'}
          </Text>
        </View>

        {/* Live Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>
              {language === 'AM' ? 'ፍጥነት' : language === 'OM' ? 'Saffisa' : 'Speed'}
            </Text>
            <Text style={styles.metricValue}>68 km/h</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>
              {language === 'AM' ? 'ቀጣይ ጣቢያ' : language === 'OM' ? 'Buufata Itti Aanu' : 'Next Waypoint'}
            </Text>
            <Text style={styles.metricValue}>
              {language === 'AM' ? 'ሞጆ ደረቅ ወደብ' : language === 'OM' ? 'Buufata Moojoo' : 'Modjo Dry Port'}
            </Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>
              {language === 'AM' ? 'የሚደርስበት ሰዓት' : language === 'OM' ? 'Yeroo Gahuu' : 'ETA'}
            </Text>
            <Text style={[styles.metricValue, { color: '#10B981' }]}>1h 45m</Text>
          </View>
        </View>

        {/* Dedicated Mobile Role Switcher (Transporter & Driver) */}
        <Text style={styles.sectionTitle}>
          {language === 'AM' ? 'የሞባይል ፖርታል ይምረጡ' : language === 'OM' ? 'Poortaalii Moobaayilaa Filadhaa' : 'Select Mobile Portal'}
        </Text>

        {/* Driver Option */}
        <TouchableOpacity
          style={[
            styles.roleCard,
            selectedRole === 'DRIVER' && styles.roleCardActive,
          ]}
          onPress={() => setSelectedRole('DRIVER')}
        >
          <View style={styles.roleHeader}>
            <Ionicons name="navigate-outline" size={26} color="#38BDF8" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.roleName}>
                {language === 'AM' ? 'የአሽከርካሪ ፖርታል' : language === 'OM' ? 'Poortaalii Konkolaachisaa' : 'Driver Portal'}
              </Text>
              <Text style={styles.roleAmharic}>
                {language === 'AM' ? 'ከመስመር ውጭ የሚሰራ የጉዞ መከታተያ' : language === 'OM' ? 'Ergama Moobaayilaa Toora-Ala' : 'Offline-First Mobile Dispatch'}
              </Text>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {language === 'AM' ? 'ንቁ ጉዞ' : language === 'OM' ? 'Imala Hojiirra Jiru' : 'Active Trip'}
              </Text>
            </View>
          </View>
          <Text style={styles.roleDesc}>
            {language === 'AM'
              ? 'የደረጃ በደረጃ የኮሪደር አቅጣጫ፣ የጂፒኤስ ኬላ ቼክ-ኢን፣ በፎቶ የተደገፈ የአደጋ ሪፖርት እና የዲጂታል ፊርማ ርክክብ።'
              : language === 'OM'
              ? 'Qajeelfama daandii koriidarii, sakatta\'iinsa waypointer GPS, gabaasa balaa suuraa qabu & mallattoo dijitaalaa POD.'
              : 'Turn-by-turn corridor navigation, GPS waypoint check-ins, geotagged incident reports & digital signature POD.'}
          </Text>
          <View style={styles.userRow}>
            <Text style={styles.userEmail}>
              {language === 'AM' ? 'የአሽከርካሪ ሁነታ' : language === 'OM' ? 'Haala Konkolaachisaa' : 'Driver Mode'}
            </Text>
            <Text style={styles.userStatus}>
              {language === 'AM' ? '● ዝግጁ' : language === 'OM' ? '● Qophii' : '● Ready'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Transporter Option */}
        <TouchableOpacity
          style={[
            styles.roleCard,
            selectedRole === 'TRANSPORTER' && styles.roleCardActive,
          ]}
          onPress={() => setSelectedRole('TRANSPORTER')}
        >
          <View style={styles.roleHeader}>
            <Ionicons name="bus-outline" size={26} color="#10B981" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.roleName}>
                {language === 'AM' ? 'የትራንስፖርተር ፖርታል' : language === 'OM' ? 'Poortaalii Geejjobaa' : 'Transporter Portal'}
              </Text>
              <Text style={styles.roleAmharic}>
                {language === 'AM' ? 'የተሽከርካሪ እና ጨረታ አስተዳዳሪ' : language === 'OM' ? 'Bulchiinsa Konkolaataa & Caalbaasii' : 'Fleet & Bidding Manager'}
              </Text>
            </View>
            <View style={[styles.roleBadge, { backgroundColor: '#10B98120' }]}>
              <Text style={[styles.roleBadgeText, { color: '#10B981' }]}>
                {language === 'AM' ? 'የጭነት ሰሌዳ' : language === 'OM' ? 'Gabatee Fe\'iisaa' : 'Load Board'}
              </Text>
            </View>
          </View>
          <Text style={styles.roleDesc}>
            {language === 'AM'
              ? 'የኮሪደር ጭነቶችን ያስሱ፣ ተወዳዳሪ ዋጋ ያቅርቡ፣ የተሽከርካሪዎችን ሁኔታ ይከታተሉ እና የነዳጅ ፍጆታ ትንታኔን ይገምግሙ።'
              : language === 'OM'
              ? 'Fe\'iisa koriidarii sakatta\'aa, gatii dorgomaa dhiyeessaa, bakka konkolaataa hordofaa, fi xiinxala boba\'aa gamaaggamaa.'
              : 'Browse corridor loads, submit competitive bids, monitor fleet positions, and review fuel consumption analytics.'}
          </Text>
          <View style={styles.userRow}>
            <Text style={styles.userEmail}>
              {language === 'AM' ? 'የትራንስፖርተር ሁነታ' : language === 'OM' ? 'Haala Geejjobaa' : 'Transporter Mode'}
            </Text>
            <Text style={styles.userStatus}>
              {language === 'AM' ? '● ዝግጁ' : language === 'OM' ? '● Qophii' : '● Fleet Ready'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Launch Button */}
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>
            {selectedRole === 'DRIVER'
              ? (language === 'AM' ? 'ወደ አሽከርካሪ ጉዞ ሁነታ ግባ ➔' : language === 'OM' ? 'Gara Haala Imala Konkolaachisaatti Gali ➔' : 'Enter Driver Trip Mode ➔')
              : (language === 'AM' ? 'ወደ ጭነት ሰሌዳ ግባ ➔' : language === 'OM' ? 'Gara Gabatee Fe\'iisaatti Gali ➔' : 'Enter Transporter Load Board ➔')}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#38BDF850',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoIcon: {
    fontSize: 22,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98115',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#10B98130',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  heroHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 30,
    marginBottom: 8,
  },
  heroHighlight: {
    color: '#38BDF8',
  },
  heroDescription: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  roleCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 12,
  },
  roleCardActive: {
    borderColor: '#38BDF8',
    backgroundColor: '#131D31',
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleIcon: {
    fontSize: 24,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  roleAmharic: {
    fontSize: 11,
    color: '#94A3B8',
  },
  roleBadge: {
    backgroundColor: '#38BDF820',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
  },
  roleDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
    marginBottom: 10,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  userEmail: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  userStatus: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 30,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 8px rgba(37, 99, 235, 0.3)',
      } as any,
      default: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
      },
    }),
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
