import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoadItem, BidItem } from '../types';
import { useLanguage } from '../../../context/LanguageContext';

interface BiddingTabProps {
  loadsList: LoadItem[];
  selectedLoadId: string;
  setSelectedLoadId: (val: string) => void;
  bidPrice: string;
  setBidPrice: (val: string) => void;
  transitHours: string;
  setTransitHours: (val: string) => void;
  bidNotes: string;
  setBidNotes: (val: string) => void;
  bidValidityHours: number;
  setBidValidityHours: (val: number) => void;
  bidSuccess: string;
  submittedBids: BidItem[];
  biddingSubTab?: 'create' | 'history';
  onSubmitBid: () => void;
  onOpenDispatchModal: (bid: BidItem) => void;
  onOpenRatingModal?: (bid: BidItem) => void;
  onDeleteBid?: (bid: BidItem) => void;
  onNavigateToLoads?: () => void;
}

export const BiddingTab: React.FC<BiddingTabProps> = ({
  loadsList,
  selectedLoadId,
  setSelectedLoadId,
  bidPrice,
  setBidPrice,
  transitHours,
  setTransitHours,
  bidNotes,
  setBidNotes,
  bidValidityHours,
  setBidValidityHours,
  bidSuccess,
  submittedBids,
  onSubmitBid,
  onOpenDispatchModal,
  onOpenRatingModal,
  onDeleteBid,
  onNavigateToLoads,
}) => {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');

  const selectedLoadObj = loadsList.find((l) => l.id === selectedLoadId);
  const existingBidForSelectedLoad = submittedBids.find(
    (b) =>
      (b.loadId === selectedLoadId ||
        b.rawId === selectedLoadId ||
        (selectedLoadObj?.title && b.loadTitle === selectedLoadObj.title)) &&
      b.status !== 'REJECTED'
  );

  const pendingBids = submittedBids.filter((b) => b.status === 'PENDING');
  const acceptedBids = submittedBids.filter((b) => b.status === 'ACCEPTED');
  const rejectedBids = submittedBids.filter((b) => b.status === 'REJECTED');

  const filteredBids = submittedBids.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  const formatTransitTime = (hoursStr?: string) => {
    if (!hoursStr) return '18h transit';
    const num = hoursStr.match(/\d+/);
    return num ? `${num[0]}h transit` : '18h transit';
  };

  const formatSubmittedTime = (timeStr?: string) => {
    if (!timeStr) return '';
    return timeStr.replace(/:(\d{2}):(\d{2})(\s+[AP]M)/i, ':$1$3').replace(/:\d{2}(\s+[AP]M)/i, '$1');
  };

  return (
    <View style={styles.container}>
      {/* Success Notification Banner */}
      {bidSuccess ? (
        <View style={styles.successBox}>
          <Ionicons name="checkmark-circle" size={16} color="#15803D" />
          <Text style={styles.successText}>{bidSuccess}</Text>
        </View>
      ) : null}

      {/* VIEW A: QUOTE SUBMISSION FORM (When a load is selected) */}
      {selectedLoadObj ? (
        <View style={styles.formContainer}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setSelectedLoadId('')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={16} color="#0F172A" />
            <Text style={styles.backBtnText}>Back to My Quotes</Text>
          </TouchableOpacity>

          <View style={{ marginBottom: 4 }}>
            <Text style={styles.pageTitle}>Submit Freight Quote</Text>
            <Text style={styles.pageSubtitle}>
              Propose rate & transit timeline for this corridor load
            </Text>
          </View>

          {/* Selected Load Summary Card */}
          <View style={styles.loadSummaryCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.loadTitle}>{selectedLoadObj.title}</Text>
              <View style={styles.cargoBadge}>
                <Text style={styles.cargoBadgeText}>{selectedLoadObj.cargoType || 'Consignment'}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 }}>
              <Ionicons name="location-outline" size={14} color="#0284C7" style={{ marginTop: 2 }} />
              <Text style={styles.routeText}>{selectedLoadObj.route}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>Weight: {selectedLoadObj.weight}</Text>
              <Text style={styles.metaText}>Budget: {selectedLoadObj.budget}</Text>
            </View>
          </View>

          {/* Input Fields */}
          <View style={styles.inputCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('bidPriceLabel') || 'Your Bid Price (ETB) *'}</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. 1,000,000 ETB"
                placeholderTextColor="#94A3B8"
                value={bidPrice}
                onChangeText={setBidPrice}
                keyboardType="numeric"
                editable={!existingBidForSelectedLoad}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('transitHoursLabel') || 'Estimated Transit Time (Hours) *'}</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. 18 Hours"
                placeholderTextColor="#94A3B8"
                value={transitHours}
                onChangeText={setTransitHours}
                keyboardType="numeric"
                editable={!existingBidForSelectedLoad}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('bidNotesLabel') || 'Notes / Assigned Fleet'}</Text>
              <TextInput
                style={[styles.inputField, { height: 70, textAlignVertical: 'top', paddingTop: 8 }]}
                placeholder="Specify truck plate, driver availability, or special terms..."
                placeholderTextColor="#94A3B8"
                value={bidNotes}
                onChangeText={setBidNotes}
                multiline
                editable={!existingBidForSelectedLoad}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.primaryActionBtn,
                existingBidForSelectedLoad
                  ? { backgroundColor: '#64748B' }
                  : (!selectedLoadId || !bidPrice) && { opacity: 0.6 },
              ]}
              onPress={onSubmitBid}
              disabled={!selectedLoadId || !bidPrice || !!existingBidForSelectedLoad}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionBtnText}>
                {existingBidForSelectedLoad
                  ? `✓ Bid Placed (${existingBidForSelectedLoad.status})`
                  : t('sendBidButton') || 'Submit Quote ➔'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelLink}
              onPress={() => setSelectedLoadId('')}
            >
              <Text style={styles.cancelLinkText}>Cancel & Return</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* VIEW B: DEDICATED CLEAN "MY QUOTES & BIDS" DASHBOARD */
        <View style={{ gap: 12 }}>
          {/* Header Row: Title & Find Loads */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.pageTitle}>{t('myQuotesTitle') || 'My Quotes & Bids'}</Text>
              <Text style={styles.pageSubtitle}>
                {submittedBids.length} total quotation{submittedBids.length === 1 ? '' : 's'} placed
              </Text>
            </View>

            {onNavigateToLoads && (
              <TouchableOpacity
                onPress={onNavigateToLoads}
                style={styles.findLoadsBtn}
                activeOpacity={0.85}
              >
                <Ionicons name="search" size={13} color="#FFFFFF" />
                <Text style={styles.findLoadsBtnText}>Find Loads</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Single Sleek Filter Segment Row (Robinhood/Linear Style) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -16, marginBottom: 2 }}
            contentContainerStyle={styles.filterBar}
          >
            {(
              [
                { key: 'ALL', label: `All (${submittedBids.length})` },
                { key: 'PENDING', label: `Pending (${pendingBids.length})` },
                { key: 'ACCEPTED', label: `Won (${acceptedBids.length})` },
                { key: 'REJECTED', label: `Declined (${rejectedBids.length})` },
              ] as const
            ).map((item) => {
              const active = statusFilter === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => setStatusFilter(item.key)}
                  style={[
                    styles.filterChip,
                    active && styles.filterChipActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Quotes Cards List */}
          {filteredBids.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="pricetag-outline" size={38} color="#94A3B8" />
              <Text style={styles.emptyTitle}>
                {statusFilter === 'ALL'
                  ? 'No Quotes Submitted Yet'
                  : `No ${statusFilter.toLowerCase()} quotes`}
              </Text>
              <Text style={styles.emptySubtitle}>
                Browse corridor freight on the Load Board to place quotes.
              </Text>
              {onNavigateToLoads && (
                <TouchableOpacity
                  style={styles.browseBtn}
                  onPress={onNavigateToLoads}
                  activeOpacity={0.85}
                >
                  <Text style={styles.browseBtnText}>Browse Load Board ➔</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredBids.map((b) => {
              const isAccepted = b.status === 'ACCEPTED';
              const isRejected = b.status === 'REJECTED';
              const isDispatched = !!(b.dispatchedTruck && b.dispatchedDriver);

              return (
                <View
                  key={b.id}
                  style={[
                    styles.quoteCard,
                    isAccepted && styles.quoteCardAccepted,
                    isRejected && styles.quoteCardRejected,
                  ]}
                >
                  {/* Top Card Row: Title & Price */}
                  <View style={styles.quoteCardTop}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={styles.quoteTitle} numberOfLines={1}>
                        {b.loadTitle || b.loadId}
                      </Text>
                      <Text style={styles.shipperSubText} numberOfLines={1}>
                        Shipper: {b.shipperName || 'Verified Shipper'}
                        {b.shipperPhone ? ` • ${b.shipperPhone}` : ''}
                      </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.quotePrice}>
                        {b.price}
                      </Text>
                      {/* Compact status badge with dot */}
                      <View
                        style={[
                          styles.miniBadge,
                          isDispatched
                            ? styles.miniBadgeDispatched
                            : isAccepted
                            ? styles.miniBadgeWon
                            : isRejected
                            ? styles.miniBadgeRejected
                            : styles.miniBadgePending,
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            {
                              backgroundColor: isDispatched
                                ? '#059669'
                                : isAccepted
                                ? '#16A34A'
                                : isRejected
                                ? '#DC2626'
                                : '#D97706',
                            },
                          ]}
                        />
                        <Text
                          style={[
                            styles.miniBadgeText,
                            isDispatched
                              ? { color: '#047857' }
                              : isAccepted
                              ? { color: '#15803D' }
                              : isRejected
                              ? { color: '#DC2626' }
                              : { color: '#B45309' },
                          ]}
                        >
                          {isDispatched
                            ? 'Dispatched'
                            : isAccepted
                            ? 'Won'
                            : isRejected
                            ? 'Declined'
                            : 'Pending'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Route Row */}
                  <View style={styles.routeRow}>
                    <Ionicons name="location-sharp" size={13} color="#0284C7" style={{ marginTop: 2 }} />
                    <Text style={styles.routeValueText}>
                      {b.route}
                    </Text>
                  </View>

                  {/* Transit & Timing */}
                  <View style={styles.metaDetailsRow}>
                    <Ionicons name="time-outline" size={12} color="#94A3B8" />
                    <Text style={styles.metaDetailsText}>
                      {formatTransitTime(b.hours)} • Submitted {formatSubmittedTime(b.submittedAt)}
                    </Text>
                  </View>

                  {/* ACTION OR DISPATCH STATUS BOX */}
                  {b.loadStatus === 'DELIVERED' ? (
                    /* DELIVERED: Completed e-POD and Rate Shipper CTA */
                    <View style={[styles.dispatchFooter, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                      <View style={styles.fleetInfoRow}>
                        <View style={[styles.truckIconBadge, { backgroundColor: '#DCFCE7' }]}>
                          <Ionicons name="checkmark-done" size={14} color="#16A34A" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.fleetPlateText, { color: '#166534' }]} numberOfLines={1}>
                            Delivered • Handed Over via e-POD
                          </Text>
                          <Text style={[styles.fleetStatusSubText, { color: '#15803D' }]}>
                            {b.dispatchedTruck ? `Fleet: ${b.dispatchedTruck} • ` : ''}Escrow Payout Settled
                          </Text>
                        </View>
                        {onOpenRatingModal && (
                          b.hasRatedShipper && b.hasRatedDriver ? (
                            <TouchableOpacity
                              style={[
                                styles.dispatchActionBtn,
                                { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', borderWidth: 1, paddingVertical: 6, paddingHorizontal: 10 },
                              ]}
                              onPress={() => onOpenRatingModal(b)}
                              activeOpacity={0.85}
                            >
                              <Ionicons name="checkmark-circle" size={12} color="#059669" />
                              <Text style={[styles.dispatchActionBtnText, { fontSize: 11, color: '#047857', fontWeight: '700' }]}>
                                Rated ★ {b.shipperRatingScore || '5.0'}
                              </Text>
                            </TouchableOpacity>
                          ) : b.hasRatedShipper && !b.hasRatedDriver ? (
                            <TouchableOpacity
                              style={[
                                styles.dispatchActionBtn,
                                { backgroundColor: '#0284C7', paddingVertical: 6, paddingHorizontal: 10 },
                              ]}
                              onPress={() => onOpenRatingModal(b)}
                              activeOpacity={0.85}
                            >
                              <Ionicons name="star" size={12} color="#FFFFFF" />
                              <Text style={[styles.dispatchActionBtnText, { fontSize: 11 }]}>
                                Rate Driver ★
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              style={[
                                styles.dispatchActionBtn,
                                { backgroundColor: '#D97706', paddingVertical: 6, paddingHorizontal: 10 },
                              ]}
                              onPress={() => onOpenRatingModal(b)}
                              activeOpacity={0.85}
                            >
                              <Ionicons name="star" size={12} color="#FFFFFF" />
                              <Text style={[styles.dispatchActionBtnText, { fontSize: 11 }]}>
                                Rate Delivery ★
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                      </View>
                    </View>
                  ) : isDispatched ? (
                    /* Dispatched: Clean Single-Level Fleet Row */
                    <View style={styles.dispatchFooter}>
                      <View style={styles.fleetInfoRow}>
                        <View style={styles.truckIconBadge}>
                          <Ionicons name="car" size={14} color="#059669" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.fleetPlateText} numberOfLines={1}>
                            Fleet: {b.dispatchedTruck} • {b.dispatchedDriver}
                          </Text>
                          <Text style={styles.fleetStatusSubText}>
                            Consignment Dispatched • Live GPS Active • Escrow Locked
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : isAccepted ? (
                    !b.isEscrowLocked ? (
                      <View style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A', borderWidth: 1, borderRadius: 12, padding: 10, gap: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Ionicons name="lock-closed" size={13} color="#D97706" />
                          <Text style={{ fontSize: 12, fontWeight: '800', color: '#92400E' }}>
                            Won • Awaiting Shipper Escrow Deposit
                          </Text>
                        </View>
                        <Text style={{ fontSize: 11, color: '#B45309' }}>
                          Fleet assignment is locked until the shipper deposits funds into TradeFlow Escrow. You will be notified once funded!
                        </Text>
                      </View>
                    ) : (
                      /* Won & Escrow Secured: Prominent Clean CTA Button */
                      <TouchableOpacity
                        style={styles.dispatchActionBtn}
                        onPress={() => onOpenDispatchModal(b)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="paper-plane" size={13} color="#FFFFFF" />
                        <Text style={styles.dispatchActionBtnText}>
                          Assign Truck & Driver to Dispatch ➔
                        </Text>
                      </TouchableOpacity>
                    )
                  ) : (
                    /* Pending or Declined: Note + Withdraw Button */
                    <View style={styles.cardFooterActions}>
                      {b.notes ? (
                        <Text style={styles.notesText} numberOfLines={1}>
                          Note: "{b.notes}"
                        </Text>
                      ) : (
                        <View />
                      )}
                      {onDeleteBid && (
                        <TouchableOpacity
                          style={styles.withdrawBtn}
                          onPress={() => onDeleteBid(b)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="trash-outline" size={12} color="#DC2626" />
                          <Text style={styles.withdrawBtnText}>
                            {b.status === 'PENDING' ? 'Withdraw Quote' : 'Remove'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  findLoadsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    ...Platform.select({
      web: { boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)' } as any,
      default: { elevation: 2 },
    }),
  },
  findLoadsBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
      } as any,
      default: { elevation: 1 },
    }),
  },
  quoteCardAccepted: {
    borderLeftWidth: 3.5,
    borderLeftColor: '#10B981',
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  quoteCardRejected: {
    borderLeftWidth: 3.5,
    borderLeftColor: '#EF4444',
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  quoteCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  quoteTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    textTransform: 'capitalize',
  },
  shipperSubText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  quotePrice: {
    fontSize: 15.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  miniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 12,
    marginTop: 3,
  },
  miniBadgeDispatched: {
    backgroundColor: '#ECFDF5',
  },
  miniBadgeWon: {
    backgroundColor: '#DCFCE7',
  },
  miniBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  miniBadgeRejected: {
    backgroundColor: '#F1F5F9',
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    paddingTop: 1,
  },
  routeValueText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    flexWrap: 'wrap',
    lineHeight: 18,
  },
  metaDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaDetailsText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  dispatchFooter: {
    marginTop: 2,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  fleetInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  truckIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fleetPlateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  fleetStatusSubText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
    marginTop: 1,
  },
  dispatchActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingVertical: 9,
    marginTop: 4,
    ...Platform.select({
      web: { boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)' } as any,
      default: { elevation: 2 },
    }),
  },
  dispatchActionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardFooterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  notesText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#64748B',
    flex: 1,
    marginRight: 8,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  withdrawBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  browseBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    marginTop: 6,
  },
  browseBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  successText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  formContainer: {
    gap: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  loadSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  loadTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  cargoBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cargoBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0369A1',
    textTransform: 'uppercase',
  },
  routeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    flexWrap: 'wrap',
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  inputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  primaryActionBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  cancelLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
});
