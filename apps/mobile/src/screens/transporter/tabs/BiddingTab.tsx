import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { transporterStyles as styles } from '../transporterStyles';
import { LoadItem, BidItem } from '../types';

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
  setBiddingSubTab?: (val: 'create' | 'history') => void;
  onSubmitBid: () => void;
  onOpenDispatchModal: (bid: BidItem) => void;
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
  onDeleteBid,
  onNavigateToLoads,
}) => {
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

  return (
    <View style={styles.sectionContainer}>
      {/* Success Notification Banner */}
      {bidSuccess ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✓ {bidSuccess}</Text>
        </View>
      ) : null}

      {/* VIEW A: QUOTE SUBMISSION FORM (Rendered when a load is selected from Loads Board) */}
      {selectedLoadObj ? (
        <View style={{ gap: 10 }}>
          {/* Back to My Quotes Button */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              alignSelf: 'flex-start',
              paddingVertical: 7,
              paddingHorizontal: 12,
              backgroundColor: '#E2E8F0',
              borderRadius: 10,
            }}
            onPress={() => setSelectedLoadId('')}
          >
            <Ionicons name="arrow-back" size={16} color="#0F172A" />
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#0F172A' }}>
              ← Back to My Quotes & Bids
            </Text>
          </TouchableOpacity>

          <View style={{ marginBottom: 4 }}>
            <Text style={styles.sectionTitle}>Submit Freight Rate Quote</Text>
            <Text style={styles.sectionSubtitle}>
              Propose custom pricing & transit timelines for this consignment
            </Text>
          </View>

          {/* Selected Load Preview Card */}
          <View style={styles.loadPreviewBox}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.loadPreviewTitle}>{selectedLoadObj.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: '#E0F2FE' }]}>
                <Text style={[styles.statusText, { color: '#0369A1' }]}>{selectedLoadObj.cargoType || 'Consignment'}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginVertical: 4 }}>
              <Ionicons name="location-outline" size={13} color="#0284C7" />
              <Text style={styles.loadPreviewRoute}>{selectedLoadObj.route}</Text>
            </View>
            {selectedLoadObj.shipperName ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <Ionicons name="business" size={13} color="#0284C7" />
                <Text style={{ fontSize: 11.5, color: '#334155', fontWeight: '700' }}>
                  Shipper: {selectedLoadObj.shipperName}
                </Text>
                {selectedLoadObj.shipperPhone ? (
                  <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600' }}>
                    • {selectedLoadObj.shipperPhone}
                  </Text>
                ) : null}
                {selectedLoadObj.shipperVerified && (
                  <Ionicons name="shield-checkmark" size={12} color="#16A34A" />
                )}
              </View>
            ) : null}
            <View style={styles.loadPreviewFooter}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MaterialCommunityIcons name="scale" size={13} color="#64748B" />
                <Text style={styles.loadPreviewWeight}>Weight: {selectedLoadObj.weight}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MaterialCommunityIcons name="cash-multiple" size={13} color="#64748B" />
                <Text style={styles.loadPreviewBudget}>
                  {selectedLoadObj.budget ? `Target: ${selectedLoadObj.budget}` : 'Open for Quotes'}
                </Text>
              </View>
            </View>

            {existingBidForSelectedLoad && (
              <View
                style={{
                  backgroundColor: '#FEF3C7',
                  borderWidth: 1,
                  borderColor: '#FCD34D',
                  borderRadius: 10,
                  padding: 10,
                  marginTop: 8,
                  gap: 2,
                }}
              >
                <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#92400E' }}>
                  ✓ Quote Already Placed: {existingBidForSelectedLoad.price} ({existingBidForSelectedLoad.status})
                </Text>
                <Text style={{ fontSize: 10.5, color: '#B45309' }}>
                  You have already submitted an active bid for this load. Shipper will review your offer.
                </Text>
              </View>
            )}
          </View>

          {/* The Input Fields Form */}
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Proposed Rate (ETB) *</Text>
              <TextInput
                style={[
                  styles.input,
                  existingBidForSelectedLoad && { backgroundColor: '#F1F5F9', color: '#64748B' },
                ]}
                placeholder="e.g. 175000"
                placeholderTextColor="#94A3B8"
                value={bidPrice}
                onChangeText={setBidPrice}
                keyboardType="numeric"
                editable={!existingBidForSelectedLoad}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Estimated Corridor Transit Time (Hours):</Text>
              <Text style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>
                ⏱️ Trip Duration: How many driving hours the truck takes to deliver the cargo.
              </Text>
              <TextInput
                style={[
                  styles.input,
                  existingBidForSelectedLoad && { backgroundColor: '#F1F5F9', color: '#64748B' },
                ]}
                placeholder="e.g. 18"
                placeholderTextColor="#94A3B8"
                value={transitHours}
                onChangeText={setTransitHours}
                keyboardType="numeric"
                editable={!existingBidForSelectedLoad}
              />
            </View>

            {/* Validity Period */}
            <View style={{ marginTop: 2, marginBottom: 8 }}>
              <Text style={styles.fieldLabel}>Quote Validity Period</Text>
              <Text style={{ fontSize: 11, color: '#64748B', marginBottom: 6 }}>
                ⏳ Offer Expiry: How long this price stays valid for the shipper before expiring.
              </Text>
              <View style={styles.typeSelectorRow}>
                {[24, 48, 72].map((hrs) => (
                  <TouchableOpacity
                    key={hrs}
                    style={[
                      styles.typeChip,
                      bidValidityHours === hrs && styles.typeChipActive,
                      existingBidForSelectedLoad && { opacity: 0.6 },
                    ]}
                    onPress={() => !existingBidForSelectedLoad && setBidValidityHours(hrs)}
                    disabled={!!existingBidForSelectedLoad}
                  >
                    <Text style={[styles.typeChipText, bidValidityHours === hrs && styles.typeChipTextActive]}>
                      {hrs} Hours
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Transporter Operational Notes:</Text>
              <TextInput
                style={[
                  styles.input,
                  { height: 60, textAlignVertical: 'top' },
                  existingBidForSelectedLoad && { backgroundColor: '#F1F5F9', color: '#64748B' },
                ]}
                placeholder="e.g. GPS live telematics enabled. Double-driver crew for express dispatch."
                placeholderTextColor="#94A3B8"
                value={bidNotes}
                onChangeText={setBidNotes}
                multiline
                editable={!existingBidForSelectedLoad}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitBidBtn,
                existingBidForSelectedLoad
                  ? { backgroundColor: '#64748B' }
                  : (!selectedLoadId || !bidPrice) && { opacity: 0.5 },
              ]}
              onPress={onSubmitBid}
              disabled={!selectedLoadId || !bidPrice || !!existingBidForSelectedLoad}
            >
              <Text style={styles.submitBidBtnText}>
                {existingBidForSelectedLoad
                  ? `✓ Bid Already Placed (${existingBidForSelectedLoad.status})`
                  : 'Submit Competitive Freight Quote'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                alignItems: 'center',
                paddingVertical: 10,
                marginTop: 4,
              }}
              onPress={() => setSelectedLoadId('')}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B' }}>
                Cancel & Return to My Quotes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* VIEW B: DEDICATED "MY QUOTES & BIDS" DASHBOARD (Default view) */
        <View style={{ gap: 12 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.sectionTitle}>My Quotes & Bids</Text>
              <Text style={styles.sectionSubtitle}>
                Track your active freight offers, shipper acceptances, and vehicle assignments
              </Text>
            </View>
            {onNavigateToLoads && (
              <TouchableOpacity
                onPress={onNavigateToLoads}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: '#0284C7',
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 10,
                  marginTop: 2,
                }}
              >
                <Ionicons name="add-circle-outline" size={14} color="#FFFFFF" />
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>Find Loads</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Stats Summary Strip */}
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              onPress={() => setStatusFilter('ALL')}
              style={{
                flex: 1,
                backgroundColor: statusFilter === 'ALL' ? '#0F172A' : '#F8FAFC',
                borderWidth: 1,
                borderColor: statusFilter === 'ALL' ? '#0F172A' : '#E2E8F0',
                borderRadius: 10,
                paddingVertical: 8,
                paddingHorizontal: 6,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '900', color: statusFilter === 'ALL' ? '#FFFFFF' : '#0F172A' }}>
                {submittedBids.length}
              </Text>
              <Text style={{ fontSize: 9.5, fontWeight: '700', color: statusFilter === 'ALL' ? '#94A3B8' : '#64748B' }}>
                Total Quotes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setStatusFilter('PENDING')}
              style={{
                flex: 1,
                backgroundColor: statusFilter === 'PENDING' ? '#FEF3C7' : '#F8FAFC',
                borderWidth: 1,
                borderColor: statusFilter === 'PENDING' ? '#F59E0B' : '#E2E8F0',
                borderRadius: 10,
                paddingVertical: 8,
                paddingHorizontal: 6,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#D97706' }}>
                {pendingBids.length}
              </Text>
              <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#B45309' }}>
                Pending
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setStatusFilter('ACCEPTED')}
              style={{
                flex: 1,
                backgroundColor: statusFilter === 'ACCEPTED' ? '#DCFCE7' : '#F8FAFC',
                borderWidth: 1,
                borderColor: statusFilter === 'ACCEPTED' ? '#22C55E' : '#E2E8F0',
                borderRadius: 10,
                paddingVertical: 8,
                paddingHorizontal: 6,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#16A34A' }}>
                {acceptedBids.length}
              </Text>
              <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#15803D' }}>
                Won / Accepted
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setStatusFilter('REJECTED')}
              style={{
                flex: 1,
                backgroundColor: statusFilter === 'REJECTED' ? '#FEE2E2' : '#F8FAFC',
                borderWidth: 1,
                borderColor: statusFilter === 'REJECTED' ? '#EF4444' : '#E2E8F0',
                borderRadius: 10,
                paddingVertical: 8,
                paddingHorizontal: 6,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#DC2626' }}>
                {rejectedBids.length}
              </Text>
              <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#B91C1C' }}>
                Declined
              </Text>
            </TouchableOpacity>
          </View>

          {/* Filter Chips Bar */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 2 }}>
            {(
              [
                { key: 'ALL', label: `All Quotes (${submittedBids.length})`, icon: 'list-outline' },
                { key: 'PENDING', label: `Pending (${pendingBids.length})`, icon: 'time-outline' },
                { key: 'ACCEPTED', label: `Won / Accepted (${acceptedBids.length})`, icon: 'checkmark-circle-outline' },
                { key: 'REJECTED', label: `Declined (${rejectedBids.length})`, icon: 'close-circle-outline' },
              ] as const
            ).map((chip) => {
              const active = statusFilter === chip.key;
              return (
                <TouchableOpacity
                  key={chip.key}
                  onPress={() => setStatusFilter(chip.key)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                    backgroundColor: active ? '#0284C7' : '#FFFFFF',
                    borderWidth: 1,
                    borderColor: active ? '#0284C7' : '#E2E8F0',
                  }}
                >
                  <Ionicons
                    name={chip.icon as any}
                    size={13}
                    color={active ? '#FFFFFF' : '#64748B'}
                  />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: active ? '#FFFFFF' : '#475569' }}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Bids List */}
          {filteredBids.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="pricetag-outline" size={44} color="#94A3B8" />
              <Text style={styles.emptyTitle}>
                {statusFilter === 'ALL'
                  ? 'No Quotes Submitted Yet'
                  : `No ${statusFilter.toLowerCase()} quotes found`}
              </Text>
              <Text style={styles.emptySub}>
                {statusFilter === 'ALL'
                  ? 'Browse active corridor consignments on the Load Board to place competitive quotes and win freight jobs.'
                  : `You currently have no quotes with "${statusFilter.toLowerCase()}" status.`}
              </Text>
              {onNavigateToLoads && (
                <TouchableOpacity
                  style={[
                    styles.submitBidBtn,
                    {
                      marginTop: 12,
                      paddingHorizontal: 20,
                      alignSelf: 'center',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    },
                  ]}
                  onPress={onNavigateToLoads}
                >
                  <MaterialCommunityIcons name="package-variant" size={15} color="#FFFFFF" />
                  <Text style={styles.submitBidBtnText}>Browse Available Loads</Text>
                  <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredBids.map((b) => {
              const isAccepted = b.status === 'ACCEPTED';
              const isRejected = b.status === 'REJECTED';
              return (
                <View
                  key={b.id}
                  style={[
                    styles.card,
                    isAccepted && { borderColor: '#86EFAC', backgroundColor: '#F0FDF4' },
                    isRejected && { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
                  ]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.truckPlate} numberOfLines={1}>
                        {b.loadTitle || b.loadId}
                      </Text>
                      <Text style={styles.infoLabel}>
                        {b.shipperName ? `Shipper: ${b.shipperName}${b.shipperPhone ? ` • ${b.shipperPhone}` : ''}` : 'Corridor Shipment'}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                      <Text style={[styles.kpiValue, { fontSize: 16, color: isAccepted ? '#16A34A' : '#0284C7' }]}>
                        {b.price}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          isAccepted
                            ? { backgroundColor: '#DCFCE7' }
                            : isRejected
                            ? { backgroundColor: '#FEE2E2' }
                            : styles.statusAvailable,
                          { marginTop: 4 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            isAccepted
                              ? { color: '#166534' }
                              : isRejected
                              ? { color: '#991B1B' }
                              : {},
                          ]}
                        >
                          {b.dispatchedTruck && b.dispatchedDriver
                            ? 'DISPATCHED & LOCKED'
                            : isAccepted
                            ? 'BID ACCEPTED'
                            : isRejected
                            ? 'REJECTED'
                            : 'PENDING REVIEW'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  {/* Shipper Acceptance Action Box */}
                  {isAccepted && (
                    <View style={{ backgroundColor: '#DCFCE7', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#86EFAC', gap: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="trophy-outline" size={16} color="#166534" />
                        <Text style={{ fontSize: 12, color: '#166534', fontWeight: '800' }}>
                          Congratulations! Shipper accepted your quote!
                        </Text>
                      </View>
                      <Text style={{ fontSize: 11, color: '#166534' }}>
                        {b.dispatchedTruck && b.dispatchedDriver
                          ? 'Quote accepted & locked. Fleet dispatched for corridor transit (No duplicate assignments allowed).'
                          : 'Quote accepted! Assign your fleet vehicle and licensed driver to dispatch.'}
                      </Text>

                      {b.dispatchedTruck && b.dispatchedDriver ? (
                        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 8, padding: 10, marginTop: 4, borderWidth: 1, borderColor: '#BBF7D0', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Ionicons name="lock-closed" size={16} color="#166534" />
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                              <MaterialCommunityIcons name="truck" size={14} color="#166534" />
                              <Text style={{ fontSize: 11.5, color: '#166534', fontWeight: '800' }}>
                                Assigned Fleet: {b.dispatchedTruck} • Driver: {b.dispatchedDriver}
                              </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                              <Ionicons name="checkmark-circle" size={11} color="#15803D" />
                              <Text style={{ fontSize: 10, color: '#15803D', fontWeight: '600' }}>
                                Consignment Dispatched • Live GPS Active • Locked
                              </Text>
                            </View>
                          </View>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.submitBidBtn,
                            {
                              backgroundColor: '#16A34A',
                              marginTop: 4,
                              paddingVertical: 10,
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: 6,
                            },
                          ]}
                          onPress={() => onOpenDispatchModal(b)}
                        >
                          <Text style={styles.submitBidBtnText}>Assign Vehicle & Driver to Dispatch</Text>
                          <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* Route & Cargo */}
                  <View style={{ marginVertical: 2 }}>
                    <Text style={styles.infoLabel}>Corridor Route:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Ionicons name="location-outline" size={13} color="#0284C7" />
                      <Text style={[styles.infoValue, { color: '#0F172A', fontWeight: '800', lineHeight: 18 }]}>
                        {b.route}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.infoRow, { marginTop: 4 }]}>
                    <Text style={styles.infoLabel}>Transit & Validity:</Text>
                    <Text style={styles.infoValue}>{b.hours} • Submitted {b.submittedAt}</Text>
                  </View>

                  {b.notes ? (
                    <View style={{ marginTop: 4, backgroundColor: '#F8FAFC', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' }}>
                      <Text style={styles.infoLabel}>Quote Notes:</Text>
                      <Text style={[styles.infoValue, { marginTop: 2, fontStyle: 'italic', color: '#334155' }]}>
                        "{b.notes}"
                      </Text>
                    </View>
                  ) : null}

                  {/* Delete / Withdraw Button (Non-accepted quotes) */}
                  {b.status !== 'ACCEPTED' && onDeleteBid && (
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 9,
                        paddingHorizontal: 12,
                        borderRadius: 10,
                        backgroundColor: '#FEF2F2',
                        borderWidth: 1,
                        borderColor: '#FECACA',
                        marginTop: 10,
                        gap: 6,
                      }}
                      onPress={() => onDeleteBid(b)}
                    >
                      <Ionicons name="trash-outline" size={14} color="#DC2626" />
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#DC2626' }}>
                        {b.status === 'PENDING' ? 'Withdraw / Delete Quotation' : 'Remove Record'}
                      </Text>
                    </TouchableOpacity>
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
