import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
} from 'react-native';
import { transporterStyles as styles } from '../transporterStyles';
import { UserProfile, BidItem } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../context/LanguageContext';

interface EarningsTabProps {
  user?: UserProfile;
  submittedBids?: BidItem[];
}

export const EarningsTab: React.FC<EarningsTabProps> = ({ user, submittedBids = [] }) => {
  const { t } = useLanguage();
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
        const ratingUrl = user?.id ? `/api/portal/ratings?userId=${user.id}` : '/api/portal/ratings';
        const revRes = await apiFetch(ratingUrl);
        if (revRes.ok) {
          const revData = await revRes.json();
          if (revData.ratings && Array.isArray(revData.ratings)) {
            setReviews(revData.ratings);
          }
        }
      } catch (e) {}
    };

    fetchData();
  }, [user?.id]);

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

  const hasRatings = (Boolean(user?.totalRatingsCount && user.totalRatingsCount > 0)) || reviews.length > 0;
  const ratingAvg = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.scoreStars || 0), 0) / reviews.length).toFixed(1)
    : (user?.totalRatingsCount && user.totalRatingsCount > 0 && user?.ratingAvg ? user.ratingAvg.toFixed(1) : '0.0');

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{t('earningsPayouts')}</Text>

      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>{t('disbursedPayouts')}</Text>
          <Text style={[styles.kpiValue, { color: '#10B981' }]}>
            {settledPayoutEtb.toLocaleString()} ETB
          </Text>
          <Text style={{ fontSize: 9.5, color: '#059669', fontWeight: '700', marginTop: 1 }}>
            {t('escrowDisbursedSub')}
          </Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>{t('lockedEscrow')}</Text>
          <Text style={[styles.kpiValue, { color: '#0284C7' }]}>
            {heldInEscrowEtb.toLocaleString()} ETB
          </Text>
          <Text style={{ fontSize: 9.5, color: '#0284C7', fontWeight: '700', marginTop: 1 }}>
            {t('pendingPodSub')}
          </Text>
        </View>
      </View>

      {/* Smart Escrow Transaction Ledger */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <View>
            <Text style={styles.cardTitle}>{t('smartEscrowSettlements')}</Text>
            <Text style={styles.emptySub}>{t('verifiedPayoutsSub')}</Text>
          </View>
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#0284C7' }}>
            {payments.length} Transactions
          </Text>
        </View>

        {payments.length === 0 ? (
          <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 14, alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B' }}>
              {t('noPaymentsYet')}
            </Text>
            <Text style={{ fontSize: 9.5, color: '#94A3B8', marginTop: 2, textAlign: 'center' }}>
              {t('noPaymentsYetSub')}
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      {isSettled ? (
                        <Ionicons name="checkmark-circle" size={10} color="#166534" />
                      ) : (
                        <Ionicons name="lock-closed" size={9} color="#92400E" />
                      )}
                      <Text
                        style={{
                          fontSize: 8.5,
                          fontWeight: '900',
                          color: isSettled ? '#166534' : '#92400E',
                        }}
                      >
                        {isSettled ? 'SETTLED' : 'IN ESCROW'}
                      </Text>
                    </View>
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
            <Text style={styles.cardTitle}>{t('carrierRatingTitle')}</Text>
            <Text style={styles.emptySub}>Bidirectional shipper reviews score</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: hasRatings ? '#D97706' : '#94A3B8' }}>{ratingAvg}</Text>
              <Ionicons name="star" size={16} color={hasRatings ? '#F59E0B' : '#CBD5E1'} />
            </View>
            <Text style={{ fontSize: 10, color: '#64748B' }}>
              {hasRatings ? `${reviews.length} verified reviews` : 'New Carrier (Unrated)'}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <Text style={{ fontSize: 11, fontWeight: '800', color: '#1E293B', marginTop: 2, marginBottom: 6 }}>
          {t('recentReviews')}
        </Text>
        {reviews.length === 0 ? (
          <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 14, alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B' }}>
              {t('noReviewsYet')}
            </Text>
            <Text style={{ fontSize: 9.5, color: '#94A3B8', marginTop: 2, textAlign: 'center' }}>
              {t('noReviewsYetSub')}
            </Text>
          </View>
        ) : (
          reviews.map((rev) => (
            <View key={rev.id} style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, marginBottom: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#1E293B' }}>
                "{rev.comment || rev.reviewText || 'Delivered on time.'}"
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Text style={{ fontSize: 9.5, color: '#64748B' }}>
                  — {rev.fromUser?.companyName || rev.fromUser?.fullName || 'Verified Shipper'} •
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons key={s} name="star" size={10} color="#F59E0B" />
                  ))}
                </View>
                <Text style={{ fontSize: 9.5, color: '#64748B' }}>({rev.scoreStars || 5}.0)</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Smart Escrow Safety Summary */}
      <View style={[styles.card, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
        <Text style={[styles.cardTitle, { color: '#166534' }]}>{t('escrowProtectedBoxTitle')}</Text>
        <Text style={{ fontSize: 11, color: '#166534', lineHeight: 16 }}>
          {t('escrowProtectedBoxDesc')}
        </Text>
      </View>
    </View>
  );
};
