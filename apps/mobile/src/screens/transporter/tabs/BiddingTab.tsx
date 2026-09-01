import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  biddingSubTab: 'create' | 'history';
  setBiddingSubTab: (val: 'create' | 'history') => void;
  onSubmitBid: () => void;
  onOpenDispatchModal: (bid: BidItem) => void;
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
  biddingSubTab,
  setBiddingSubTab,
  onSubmitBid,
  onOpenDispatchModal,
}) => {
  const selectedLoadObj = loadsList.find((l) => l.id === selectedLoadId);
  const existingBidForSelectedLoad = submittedBids.find(
    (b) =>
      (b.loadId === selectedLoadId ||
        b.rawId === selectedLoadId ||
        (selectedLoadObj?.title && b.loadTitle === selectedLoadObj.title)) &&
      b.status !== 'REJECTED'
  );

  return (
    <View style={styles.sectionContainer}>
      {/* Sub-tab Switcher */}
      <View style={styles.fleetSubTabRow}>
        <TouchableOpacity
          style={[styles.fleetSubTab, biddingSubTab === 'create' && styles.fleetSubTabActive]}
          onPress={() => setBiddingSubTab('create')}
        >
          <Text style={[styles.fleetSubTabText, biddingSubTab === 'create' && styles.fleetSubTabTextActive]}>
            📝 Place Freight Quote
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fleetSubTab, biddingSubTab === 'history' && styles.fleetSubTabActive]}
          onPress={() => setBiddingSubTab('history')}
        >
          <Text style={[styles.fleetSubTabText, biddingSubTab === 'history' && styles.fleetSubTabTextActive]}>
            📬 My Quotes & Bids ({submittedBids.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Success Notification Banner */}
      {bidSuccess ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✓ {bidSuccess}</Text>
        </View>
      ) : null}

      {/* SUB-TAB 1: PLACE FREIGHT QUOTE */}
      {biddingSubTab === 'create' && (
        <>
          <View>
            <Text style={styles.sectionTitle}>Submit Freight Rate Quote</Text>
            <Text style={styles.sectionSubtitle}>
              Propose custom pricing & transit timelines on active corridor loads
            </Text>
          </View>

          {loadsList.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="pricetag-outline" size={40} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Active Corridor Loads Available</Text>
              <Text style={styles.emptySub}>
                Freight consignments posted by verified shippers will appear here for bidding.
              </Text>
            </View>
          ) : (
            <View style={styles.card}>
              {/* Target Load Selector */}
              <Text style={styles.fieldLabel}>Select Target Corridor Load *</Text>
              <View style={styles.typeSelectorRow}>
                {loadsList.map((load) => {
                  const isBidPlaced = submittedBids.some(
                    (b) =>
                      (b.loadId === load.id || b.rawId === load.id || b.loadTitle === load.title) &&
                      b.status !== 'REJECTED'
                  );
                  return (
                    <TouchableOpacity
                      key={load.id}
                      style={[
                        styles.typeChip,
                        selectedLoadId === load.id && styles.typeChipActive,
                        isBidPlaced && { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
                      ]}
                      onPress={() => {
                        setSelectedLoadId(load.id);
                        if (!bidPrice && load.budget) {
                          setBidPrice(load.budget.replace(/[^0-9]/g, ''));
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.typeChipText,
                          selectedLoadId === load.id && styles.typeChipTextActive,
                          isBidPlaced && { color: '#059669', fontWeight: '800' },
                        ]}
                      >
                        {load.id} ({load.cargoType}) {isBidPlaced ? '✓ Active Bid' : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Selected Load Preview */}
              {selectedLoadObj && (
                <View style={styles.loadPreviewBox}>
                  <Text style={styles.loadPreviewTitle}>{selectedLoadObj.title}</Text>
                  <Text style={styles.loadPreviewRoute}>{selectedLoadObj.route}</Text>
                  <View style={styles.loadPreviewFooter}>
                    <Text style={styles.loadPreviewWeight}>Weight: {selectedLoadObj.weight}</Text>
                    <Text style={styles.loadPreviewBudget}>
                      {selectedLoadObj.budget ? `Target: ${selectedLoadObj.budget}` : 'RFQ: Open for Quotes'}
                    </Text>
                  </View>

                  {/* Active Bid Notice if already placed */}
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
              )}

              {/* Price & Transit Hours */}
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
              <Text style={styles.fieldLabel}>Quote Validity Period</Text>
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
            </View>
          )}
        </>
      )}

      {/* SUB-TAB 2: SUBMITTED BIDS & NOTIFICATIONS (SRS 4.2.4) */}
      {biddingSubTab === 'history' && (
        <View style={{ gap: 10 }}>
          {submittedBids.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={40} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Quotes Submitted Yet</Text>
              <Text style={styles.emptySub}>
                Switch to the "Place Freight Quote" tab to submit your custom pricing on active corridor consignments.
              </Text>
            </View>
          ) : (
            submittedBids.map((b) => {
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
                      <Text style={styles.infoLabel}>Ref: {b.loadId}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                      <Text style={[styles.kpiValue, { fontSize: 15, color: '#0284C7' }]}>
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
                          {isAccepted
                            ? 'BID ACCEPTED'
                            : isRejected
                            ? 'REJECTED'
                            : 'PENDING REVIEW'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  {isAccepted && (
                    <View style={{ backgroundColor: '#DCFCE7', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#86EFAC', gap: 6 }}>
                      <Text style={{ fontSize: 12, color: '#166534', fontWeight: '800' }}>
                        🎉 Congratulations! Shipper accepted your quote!
                      </Text>
                      <Text style={{ fontSize: 11, color: '#166534' }}>
                        TeleBirr Escrow is funded. Assign your fleet vehicle and licensed driver to dispatch.
                      </Text>

                      {b.dispatchedTruck ? (
                        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 8, padding: 8, marginTop: 4, borderWidth: 1, borderColor: '#BBF7D0' }}>
                          <Text style={{ fontSize: 11, color: '#166534', fontWeight: '700' }}>
                            🚚 Assigned Fleet: {b.dispatchedTruck} • Driver: {b.dispatchedDriver} (Dispatched)
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[styles.submitBidBtn, { backgroundColor: '#16A34A', marginTop: 4, paddingVertical: 10 }]}
                          onPress={() => onOpenDispatchModal(b)}
                        >
                          <Text style={styles.submitBidBtnText}>Assign Vehicle & Driver to Dispatch</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  <View style={{ marginVertical: 2 }}>
                    <Text style={styles.infoLabel}>Corridor Route:</Text>
                    <Text style={[styles.infoValue, { color: '#0F172A', fontWeight: '800', marginTop: 2, lineHeight: 18 }]}>
                      {b.route}
                    </Text>
                  </View>

                  <View style={[styles.infoRow, { marginTop: 4 }]}>
                    <Text style={styles.infoLabel}>Transit & Validity:</Text>
                    <Text style={styles.infoValue}>{b.hours} • Submitted {b.submittedAt}</Text>
                  </View>

                  {b.notes ? (
                    <View style={{ marginTop: 4 }}>
                      <Text style={styles.infoLabel}>Quote Notes:</Text>
                      <Text style={[styles.infoValue, { marginTop: 2, fontStyle: 'italic' }]}>
                        "{b.notes}"
                      </Text>
                    </View>
                  ) : null}

                </View>
              );
            })
          )}
        </View>
      )}
    </View>
  );
};
