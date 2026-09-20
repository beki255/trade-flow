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
import { DEMO_ACCOUNTS } from '@tradeflow/shared';

export const LandingScreen: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('DRIVER');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>⚡</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>TradeFlow Mobile</Text>
            <Text style={styles.brandSubtitle}>Ethiopia Logistics & Freight Corridor</Text>
          </View>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroCard}>
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>CORRIDOR TELEMATICS ACTIVE</Text>
          </View>
          <Text style={styles.heroHeading}>
            Digitize Your Freight.{'\n'}
            <Text style={styles.heroHighlight}>Real-Time Tracking.</Text>
          </Text>
          <Text style={styles.heroDescription}>
            Djibouti Port ➔ Modjo Dry Port ➔ Addis Ababa. Offline-ready GPS navigation, waypoint check-ins & digital proof-of-delivery.
          </Text>
        </View>

        {/* Live Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Speed</Text>
            <Text style={styles.metricValue}>68 km/h</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Next Waypoint</Text>
            <Text style={styles.metricValue}>Modjo Dry Port</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>ETA</Text>
            <Text style={[styles.metricValue, { color: '#10B981' }]}>1h 45m</Text>
          </View>
        </View>

        {/* Dedicated Mobile Role Switcher (Transporter & Driver) */}
        <Text style={styles.sectionTitle}>Select Mobile Portal</Text>

        {/* Driver Option */}
        <TouchableOpacity
          style={[
            styles.roleCard,
            selectedRole === 'DRIVER' && styles.roleCardActive,
          ]}
          onPress={() => setSelectedRole('DRIVER')}
        >
          <View style={styles.roleHeader}>
            <Text style={styles.roleIcon}>🚚</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.roleName}>Driver Portal</Text>
              <Text style={styles.roleAmharic}>Offline-First Mobile Dispatch</Text>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>Active Trip</Text>
            </View>
          </View>
          <Text style={styles.roleDesc}>
            Turn-by-turn corridor navigation, GPS waypoint check-ins, geotagged incident reports & digital signature POD.
          </Text>
          <View style={styles.userRow}>
            <Text style={styles.userEmail}>{DEMO_ACCOUNTS.DRIVER.email}</Text>
            <Text style={styles.userStatus}>● Ready</Text>
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
            <Text style={styles.roleIcon}>🚛</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.roleName}>Transporter Portal</Text>
              <Text style={styles.roleAmharic}>Fleet & Bidding Manager</Text>
            </View>
            <View style={[styles.roleBadge, { backgroundColor: '#10B98120' }]}>
              <Text style={[styles.roleBadgeText, { color: '#10B981' }]}>Load Board</Text>
            </View>
          </View>
          <Text style={styles.roleDesc}>
            Browse corridor loads, submit competitive bids, monitor fleet positions, and review fuel consumption analytics.
          </Text>
          <View style={styles.userRow}>
            <Text style={styles.userEmail}>{DEMO_ACCOUNTS.TRANSPORTER.email}</Text>
            <Text style={styles.userStatus}>● 3 Trucks</Text>
          </View>
        </TouchableOpacity>

        {/* Launch Button */}
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>
            Enter {selectedRole === 'DRIVER' ? 'Driver Trip Mode' : 'Transporter Load Board'} ➔
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
