import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTransporterStyles } from '../transporterStyles';
import { UserProfile, BidItem } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../context/LanguageContext';
import { apiFetch } from '../../../utils/api';

interface EarningsTabProps {
  user?: UserProfile;
  submittedBids?: BidItem[];
}

export const EarningsTab: React.FC<EarningsTabProps> = ({ user, submittedBids = [] }) => {
  const styles = useTransporterStyles();
  const { t, language } = useLanguage();
  const [payments, setPayments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Fetch payments ledger from backend
      const targetUrl = user?.id
        ? `/api/payments/ledger?transporterId=${user.id}`
        : '/api/payments/ledger';
      const payRes = await apiFetch(targetUrl);
      if (payRes.ok) {
        const payData = await payRes.json();
        const serverPayments = payData.payments || [];
        if (serverPayments.length > 0) {
          setPayments(serverPayments);
        } else {
          // If query by transporterId was empty, fetch general ledger and match locally
          const allRes = await apiFetch('/api/payments/ledger');
          if (allRes.ok) {
            const allData = await allRes.json();
            const allPayments = allData.payments || [];
            const matched = allPayments.filter(
              (p: any) =>
                p.transporterId === user?.id ||
                p.transporter?.id === user?.id ||
                (user?.phone && p.transporter?.phone === user.phone) ||
                (user?.companyName && p.transporter?.companyName === user.companyName)
            );
            setPayments(matched.length > 0 ? matched : allPayments);
          }
        }
      } else {
        const allRes = await apiFetch('/api/payments/ledger');
        if (allRes.ok) {
          const allData = await allRes.json();
          setPayments(allData.payments || []);
        }
      }
    } catch (e) {
      console.warn('Error fetching earnings ledger in EarningsTab:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }

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
  }, [user?.id, user?.phone, user?.companyName]);

  useEffect(() => {
    fetchData();
    // Poll every 8 seconds to automatically catch settlements when driver completes e-POD
    const interval = setInterval(() => {
      fetchData();
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchData]);

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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {refreshing && <ActivityIndicator size="small" color="#0284C7" />}
            <TouchableOpacity
              onPress={() => fetchData(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: '#F0F9FF',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: '#BAE6FD',
              }}
            >
              <Ionicons name="refresh" size={11} color="#0284C7" />
              <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#0284C7' }}>
                {language === 'AM' ? 'አድስ' : language === 'OM' ? 'Haaresi' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {payments.length === 0 ? (
          <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 14, alignItems: 'center' }}>
            {loading ? (
              <ActivityIndicator size="small" color="#0284C7" style={{ marginVertical: 8 }} />
            ) : (
              <>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B' }}>
                  {t('noPaymentsYet')}
                </Text>
                <Text style={{ fontSize: 9.5, color: '#94A3B8', marginTop: 2, textAlign: 'center' }}>
                  {t('noPaymentsYetSub')}
                </Text>
              </>
            )}
          </View>
        ) : (
          payments.map((pay) => {
            const isSettled = pay.status === 'SETTLED';
            const netAmount = Number(pay.netTransporterPayoutEtb || pay.carrierPayoutEtb || pay.netPayoutEtb) || 0;
            const grossAmount = Number(pay.grossAmountEtb || pay.amountEtb) || 0;
            const commission = Number(pay.platformCommissionEtb) || Math.round(grossAmount * 0.05);
            const prefix = pay.paymentMethod === 'CBE_BIRR' ? 'CBE-TF-' : 'TB-TF-';
            const txNo = pay.telebirrTransactionNo || pay.telebirrTxId || `${prefix}${pay.id.slice(0, 6)}`;
            const cargoTitle = pay.shipment?.load?.title || pay.shipment?.load?.cargoType || (language === 'AM' ? 'የኮሪደር ጭነት' : 'Corridor Freight');
            const destLocation = pay.shipment?.load?.destName || (language === 'AM' ? 'አዲስ አበባ' : 'Addis Ababa');
            const originLocation = pay.shipment?.load?.originName || (language === 'AM' ? 'ጅቡቲ' : 'Djibouti');
            const settledDate = pay.settledAt || pay.paidAt || pay.createdAt;

            return (
              <View
                key={pay.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: 11,
                  marginBottom: 8,
                  borderWidth: 1.5,
                  borderColor: isSettled ? '#86EFAC' : '#E2E8F0',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons
                      name={pay.paymentMethod === 'CBE_BIRR' ? 'business' : 'phone-portrait'}
                      size={13}
                      color="#0284C7"
                    />
                    <Text style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: '800', color: '#0F172A' }}>
                      {txNo}
                    </Text>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                      backgroundColor: isSettled ? '#DCFCE7' : '#FEF3C7',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      {isSettled ? (
                        <Ionicons name="checkmark-circle" size={11} color="#166534" />
                      ) : (
                        <Ionicons name="lock-closed" size={10} color="#92400E" />
                      )}
                      <Text
                        style={{
                          fontSize: 8.5,
                          fontWeight: '900',
                          color: isSettled ? '#166534' : '#92400E',
                        }}
                      >
                        {isSettled
                          ? (language === 'AM' ? 'ተጠናቋል' : language === 'OM' ? 'MIRKANAA\'E' : 'SETTLED')
                          : (language === 'AM' ? 'በኤስክሮው ተይዟል' : language === 'OM' ? 'ESCROW KEESSA' : 'IN ESCROW')}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Cargo & Route details */}
                <View style={{ marginTop: 6, paddingVertical: 4, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#1E293B' }} numberOfLines={1}>
                    {language === 'AM' ? 'ጭነት:' : language === 'OM' ? 'Fe\'isa:' : 'Cargo:'} {cargoTitle}
                  </Text>
                  <Text style={{ fontSize: 9.5, color: '#64748B' }} numberOfLines={1}>
                    {originLocation.split(',')[0]} → {destLocation.split(',')[0]}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                  <View>
                    <Text style={{ fontSize: 9.5, color: '#64748B' }}>
                      {language === 'AM' ? 'ጠቅላላ:' : language === 'OM' ? 'Waliigala:' : 'Gross:'} {grossAmount.toLocaleString()} ETB ({language === 'AM' ? '5% የአገልግሎት ክፍያ' : language === 'OM' ? 'Kaffaltii 5%' : '5% fee'})
                    </Text>
                    {settledDate && (
                      <Text style={{ fontSize: 9, color: '#94A3B8', marginTop: 1 }}>
                        {isSettled
                          ? (language === 'AM' ? 'የተከፈለበት: ' : language === 'OM' ? 'Kan Kaffalame: ' : 'Settled: ')
                          : (language === 'AM' ? 'የተቀመጠበት: ' : language === 'OM' ? 'Kan Qabame: ' : 'Deposited: ')}
                        {formatDate(settledDate)}
                      </Text>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 8.5, color: '#64748B', fontWeight: '600' }}>
                      {language === 'AM' ? 'የአጓጓዥ የተጣራ' : language === 'OM' ? 'Qulqulluu Geejjibaa' : 'Transporter Net'}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '900', color: isSettled ? '#059669' : '#0284C7' }}>
                      {netAmount.toLocaleString()} ETB
                    </Text>
                  </View>
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
            <Text style={styles.emptySub}>
              {language === 'AM' ? 'ከላኪዎች የተሰጠ የሁለትዮሽ ግምገማ ውጤት' : language === 'OM' ? 'Bu\'aa qorannoo ergitootaa' : 'Bidirectional shipper reviews score'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: hasRatings ? '#D97706' : '#94A3B8' }}>{ratingAvg}</Text>
              <Ionicons name="star" size={16} color={hasRatings ? '#F59E0B' : '#CBD5E1'} />
            </View>
            <Text style={{ fontSize: 10, color: '#64748B' }}>
              {hasRatings
                ? (language === 'AM' ? `${reviews.length} የተረጋገጡ ግምገማዎች` : language === 'OM' ? `Qorannoowwan ${reviews.length} mirkanaa\'an` : `${reviews.length} verified reviews`)
                : (language === 'AM' ? 'አዲስ አጓጓዥ (ደረጃ ያልተሰጠው)' : language === 'OM' ? 'Geejjibaa Haaraa' : 'New Carrier (Unrated)')}
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
                "{rev.comment || rev.reviewText || (language === 'AM' ? 'በሰዓቱ ደርሷል።' : 'Delivered on time.')}"
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Text style={{ fontSize: 9.5, color: '#64748B' }}>
                  — {rev.fromUser?.companyName || rev.fromUser?.fullName || (language === 'AM' ? 'የተረጋገጠ ላኪ' : language === 'OM' ? 'Ergaa Mirkanaa\'e' : 'Verified Shipper')} •
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
