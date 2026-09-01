import React from 'react';
import {
  View,
  Text,
} from 'react-native';
import { transporterStyles as styles } from '../transporterStyles';

export const EarningsTab: React.FC = () => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Earnings & Payouts</Text>

      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Total Payouts</Text>
          <Text style={styles.kpiValue}>0 ETB</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Completed Trips</Text>
          <Text style={[styles.kpiValue, { color: '#0284C7' }]}>0</Text>
        </View>
      </View>

      {/* Carrier Rating & Marketplace Reviews */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.cardTitle}>Carrier Performance & Rating</Text>
            <Text style={styles.emptySub}>Bidirectional shipper reviews score</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#D97706' }}>4.9 ★</Text>
            <Text style={{ fontSize: 10, color: '#64748B' }}>42 verified trips</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <Text style={{ fontSize: 11, fontWeight: '800', color: '#1E293B', marginTop: 2 }}>
          Recent Shipper Reviews:
        </Text>
        <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: '#64748B' }}>
            No trip reviews recorded yet. Ratings will appear after delivery completions.
          </Text>
        </View>
      </View>

      {/* TeleBirr Escrow Safety Summary */}
      <View style={[styles.card, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
        <Text style={[styles.cardTitle, { color: '#166534' }]}>TeleBirr Smart Escrow Protected</Text>
        <Text style={{ fontSize: 11, color: '#166534', lineHeight: 16 }}>
          100% of freight payments are locked in digital escrow upon booking acceptance. Milestone payouts are released automatically upon digital proof-of-delivery (e-POD) confirmation.
        </Text>
      </View>
    </View>
  );
};
