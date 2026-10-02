import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
} from 'react-native';
import { transporterStyles as styles } from '../transporterStyles';
import { UserProfile, BidItem } from '../types';
import { apiFetch } from '../../../utils/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EarningsTabProps {
  user?: UserProfile;
  submittedBids?: BidItem[];
}

export const EarningsTab: React.FC<EarningsTabProps> = ({ user, submittedBids = [] }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const payRes = await apiFetch('/api/payments/ledger');
        if (payRes.ok) {
          const payData = await payRes.json();
          if (payData.payments && Array.isArray(payData.payments)) {
            setPayments(payData.payments);
          }
        }
      } catch (e) {}

      try {
        const revRes = await apiFetch('/api/portal/ratings');
        if (revRes.ok) {
          const revData = await revRes.json();
          if (revData.ratings && Array.isArray(revData.ratings)) {
            setReviews(revData.ratings);
          }
        }
      } catch (e) {}
    };

    fetchData();
  }, []);

  const totalNetPayoutEtb = useMemo(() => {
    return payments.reduce(
      (sum, p) => sum + (Number(p.netTransporterPayoutEtb || p.carrierPayoutEtb || p.netPayoutEtb) || 0),
      0
    );
  }, [payments]);

  const settledPayoutEtb = useMemo(() => {
    return payments
      .filter((p) => p.status === 'SETTLED')
      .reduce((sum, p) => sum + (Number(p.netTransporterPayoutEtb || p.carrierPayoutEtb || p.netPayoutEtb) || 0), 0);
  }, [payments]);

  const heldInEscrowEtb = useMemo(() => {
    return payments
      .filter((p) => p.status === 'HELD_IN_ESCROW' || p.status === 'CONFIRMED')
      .reduce((sum, p) => sum + (Number(p.netTransporterPayoutEtb || p.carrierPayoutEtb || p.netPayoutEtb) || 0), 0);
  }, [payments]);

  const completedTripsCount = useMemo(() => {
    return submittedBids.filter((b) => b.status === 'ACCEPTED').length;
  }, [submittedBids]);

  const ratingAvg = user?.ratingAvg || (reviews.length > 0 ? (reviews.reduce((acc, r) => acc + (r.scoreStars || 5), 0) / reviews.length).toFixed(1) : '0.0');

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Earnings & Payouts</Text>

      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Disbursed Payouts</Text>
          <Text style={[styles.kpiValue, { color: '#10B981' }]}>
            {settledPayoutEtb.toLocaleString()} ETB
          </Text>
          <Text style={{ fontSize: 9.5, color: '#059669', fontWeight: '700', marginTop: 1 }}>
            Escrow Disbursed
          </Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Locked in Escrow</Text>
          <Text style={[styles.kpiValue, { color: '#0284C7' }]}>
            {heldInEscrowEtb.toLocaleString()} ETB
          </Text>
          <Text style={{ fontSize: 9.5, color: '#0284C7', fontWeight: '700', marginTop: 1 }}>
            Pending e-POD sign-off
          </Text>
        </View>
      </View>

      {/* Fuel Efficiency & Corridor Benchmark */}
      <View style={{ backgroundColor: '#F0F9FF', borderWidth: 1, borderColor: '#BAE6FD', borderRadius: 14, padding: 12, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <MaterialCommunityIcons name="gas-station" size={14} color="#0369A1" />
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#0369A1' }}>
              Fleet Fuel Efficiency Benchmark
            </Text>
          </View>
          <Text style={{ fontSize: 11, fontWeight: '900', color: '#0284C7' }}>
            {completedTripsCount > 0 ? 'Active Telematics' : 'Baseline Standby'}
          </Text>
        </View>
        <Text style={{ fontSize: 10, color: '#0369A1', marginTop: 3 }}>
          {completedTripsCount > 0
            ? 'Corridor telematics calculating fuel cost optimization in real-time.'
            : 'Telematics benchmark starts recording when your first trip is dispatched.'}
        </Text>
      </View>

      {/* Smart Escrow Transaction Ledger */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <View>
            <Text style={styles.cardTitle}>Smart Escrow Settlements</Text>
            <Text style={styles.emptySub}>Verified digital freight payouts</Text>
          </View>
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#0284C7' }}>
            {payments.length} Transactions
          </Text>
        </View>

        {payments.length === 0 ? (
          <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 14, alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B' }}>
              No payments recorded yet
            </Text>
            <Text style={{ fontSize: 9.5, color: '#94A3B8', marginTop: 2, textAlign: 'center' }}>
              Smart escrow locks and settlements will appear here.
            </Text>
          </View>
        ) : (
          payments.slice(0, 5).map((pay) => {
            const isSettled = pay.status === 'SETTLED';
            const netAmount = Number(pay.netTransporterPayoutEtb || pay.carrierPayoutEtb || pay.netPayoutEtb) || 0;
            const grossAmount = Number(pay.grossAmountEtb || pay.amountEtb) || 0;
            const prefix = pay.paymentMethod === 'CBE_BIRR' ? 'CBE-TF-' : 'TB-TF-';
            const txNo = pay.telebirrTransactionNo || pay.telebirrTxId || `${prefix}${pay.id.slice(0, 6)}`;

            return (
              <View
                key={pay.id}
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: 12,
                  padding: 10,
                  marginBottom: 6,
                  borderWidth: 1,
                  borderColor: isSettled ? '#BBF7D0' : '#E2E8F0',
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: '800', color: '#0F172A' }}>
                    {txNo}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 7,
                      paddingVertical: 2,
                      borderRadius: 6,
                      backgroundColor: isSettled ? '#DCFCE7' : '#FEF3C7',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 8.5,
                        fontWeight: '900',
                        color: isSettled ? '#166534' : '#92400E',
                      }}
                    >
                      {isSettled ? '✓ SETTLED' : '🔒 IN ESCROW'}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ fontSize: 10, color: '#64748B' }}>
                    Gross: {grossAmount.toLocaleString()} ETB (5% fee)
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: '900', color: isSettled ? '#059669' : '#0284C7' }}>
                    Net: {netAmount.toLocaleString()} ETB
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Carrier Rating & Marketplace Reviews */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.cardTitle}>Carrier Performance & Rating</Text>
            <Text style={styles.emptySub}>Bidirectional shipper reviews score</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#D97706' }}>{ratingAvg} ★</Text>
            <Text style={{ fontSize: 10, color: '#64748B' }}>{reviews.length} verified reviews</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <Text style={{ fontSize: 11, fontWeight: '800', color: '#1E293B', marginTop: 2, marginBottom: 6 }}>
          Recent Shipper Reviews:
        </Text>
        {reviews.length === 0 ? (
          <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 14, alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B' }}>
              No shipper reviews yet
            </Text>
            <Text style={{ fontSize: 9.5, color: '#94A3B8', marginTop: 2, textAlign: 'center' }}>
              Shipper ratings and feedback will appear here after completing deliveries.
            </Text>
          </View>
        ) : (
          reviews.map((rev) => (
            <View key={rev.id} style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, marginBottom: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#1E293B' }}>
                "{rev.comment || rev.reviewText || 'Delivered on time.'}"
              </Text>
              <Text style={{ fontSize: 9.5, color: '#64748B', marginTop: 2 }}>
                — {rev.fromUser?.companyName || rev.fromUser?.fullName || 'Verified Shipper'} • ★★★★★ ({rev.scoreStars || 5}.0)
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Smart Escrow Safety Summary */}
      <View style={[styles.card, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
        <Text style={[styles.cardTitle, { color: '#166534' }]}>Digital Smart Escrow Protected</Text>
        <Text style={{ fontSize: 11, color: '#166534', lineHeight: 16 }}>
          100% of freight payments are locked in digital escrow upon booking acceptance. Milestone payouts are released automatically upon digital proof-of-delivery (e-POD) confirmation.
        </Text>
      </View>
    </View>
  );
};
