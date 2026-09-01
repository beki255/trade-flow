import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { transporterStyles as styles } from '../transporterStyles';
import { LoadItem, BidItem } from '../types';

interface LoadsTabProps {
  loadsList: LoadItem[];
  filteredLoads: LoadItem[];
  directMatchRequests: BidItem[];
  loadSearchQuery: string;
  setLoadSearchQuery: (val: string) => void;
  onSelectLoadForQuote: (load: LoadItem) => void;
  onRespondDirectOffer: (bidId: string, action: 'ACCEPT' | 'REJECT') => void;
}

export const LoadsTab: React.FC<LoadsTabProps> = ({
  loadsList,
  filteredLoads,
  directMatchRequests,
  loadSearchQuery,
  setLoadSearchQuery,
  onSelectLoadForQuote,
  onRespondDirectOffer,
}) => {
  return (
    <View style={styles.sectionContainer}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.sectionTitle}>Corridor Load Board</Text>
          <Text style={styles.sectionSubtitle}>Browse available freight consignments along trade corridors</Text>
        </View>
        <View style={[styles.statusBadge, styles.statusAvailable, { flexShrink: 0 }]}>
          <Text style={styles.statusText}>{filteredLoads.length} / {loadsList.length} Active</Text>
        </View>
      </View>

      {/* Direct AI Instant Match Requests Section (Option A from Shipper) */}
      {directMatchRequests.length > 0 && (
        <View style={{ gap: 8, marginVertical: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="flash" size={16} color="#0284C7" />
            <Text style={{ fontSize: 12.5, fontWeight: '900', color: '#0F172A', textTransform: 'uppercase' }}>
              Direct AI Instant Match Requests (Option A)
            </Text>
          </View>

          {directMatchRequests.map((req) => (
            <View
              key={req.id}
              style={[styles.card, { borderColor: '#38BDF8', backgroundColor: '#F0F9FF' }]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={[styles.truckPlate, { color: '#0369A1' }]}>Direct Spot Offer</Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
                      <Text style={[styles.statusText, { color: '#B45309' }]}>ACTION REQUIRED</Text>
                    </View>
                  </View>
                  <Text style={styles.infoLabel}>Ref: {req.loadId}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                  <Text style={[styles.kpiValue, { fontSize: 16, color: '#0284C7' }]}>
                    {req.price}
                  </Text>
                  <Text style={{ fontSize: 9.5, color: '#64748B', fontWeight: '700' }}>Fixed Spot Rate</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={{ marginVertical: 2 }}>
                <Text style={styles.infoLabel}>Consignment:</Text>
                <Text style={[styles.infoValue, { fontWeight: '800', marginTop: 1 }]}>{req.loadTitle}</Text>
              </View>

              <View style={{ marginVertical: 3 }}>
                <Text style={styles.infoLabel}>Corridor Route:</Text>
                <Text style={[styles.infoValue, { color: '#0F172A', fontWeight: '800', marginTop: 2, lineHeight: 18 }]}>
                  {req.route}
                </Text>
              </View>

              <View style={[styles.infoRow, { marginTop: 2 }]}>
                <Text style={styles.infoLabel}>Payload Weight:</Text>
                <Text style={[styles.infoValue, { color: '#0284C7', fontWeight: '800' }]}>{req.weight}</Text>
              </View>

              <View style={{ backgroundColor: '#E0F2FE', borderRadius: 10, padding: 8, marginVertical: 4 }}>
                <Text style={{ fontSize: 11, color: '#0369A1', fontWeight: '700' }}>
                  💡 Shipper selected your fleet via AI Instant Match. TeleBirr escrow is funded. Accept to lock trip.
                </Text>
              </View>

              {/* Direct Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <TouchableOpacity
                  style={[styles.submitBidBtn, { flex: 1, backgroundColor: '#16A34A' }]}
                  onPress={() => onRespondDirectOffer(req.rawId || req.id, 'ACCEPT')}
                >
                  <Text style={styles.submitBidBtnText}>Accept Match & Dispatch</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBidBtn, { width: 90, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' }]}
                  onPress={() => onRespondDirectOffer(req.rawId || req.id, 'REJECT')}
                >
                  <Text style={[styles.submitBidBtnText, { color: '#64748B' }]}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Interactive Search Bar Only (Responsive & Clean) */}
      <View style={[styles.searchBarContainer, { marginVertical: 4 }]}>
        <Ionicons name="search-outline" size={18} color="#64748B" style={{ marginLeft: 4 }} />
        <TextInput
          style={styles.searchBarInput}
          placeholder="Search by origin, destination, cargo, ID..."
          placeholderTextColor="#94A3B8"
          value={loadSearchQuery}
          onChangeText={setLoadSearchQuery}
        />
        {loadSearchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setLoadSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Load Board Cards List */}
      {filteredLoads.map((item, idx) => (
        <View key={item.id || idx} style={styles.card}>

          {/* Header Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.truckPlate} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.infoLabel}>Ref: {item.id} • {item.cargoType}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
              {item.budget ? (
                <>
                  <Text style={[styles.kpiValue, { fontSize: 15, color: '#0284C7' }]}>
                    {item.budget}
                  </Text>
                  <Text style={{ fontSize: 9.5, color: '#64748B', fontWeight: '700' }}>Target Budget</Text>
                </>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD', borderWidth: 1 }]}>
                  <Text style={[styles.statusText, { color: '#0284C7', fontWeight: '800' }]}>RFQ • Open for Bids</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Corridor Route - Clean vertical block so long route texts wrap without overlapping */}
          <View style={{ marginVertical: 3 }}>
            <Text style={styles.infoLabel}>Corridor Route:</Text>
            <Text style={[styles.infoValue, { color: '#0F172A', fontWeight: '800', marginTop: 2, lineHeight: 18 }]}>
              {item.route}
            </Text>
          </View>

          {/* Cargo Specifications */}
          <View style={[styles.infoRow, { marginTop: 4 }]}>
            <Text style={styles.infoLabel}>Payload Weight:</Text>
            <Text style={[styles.infoValue, { color: '#0284C7', fontWeight: '800' }]}>{item.weight}</Text>
          </View>

          {/* Handling Tags */}
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
            <View style={styles.complianceBadge}>
              <Text style={styles.complianceText}>40ft High-Cube</Text>
            </View>
            <View style={styles.complianceBadge}>
              <Text style={styles.complianceText}>GIT Insured</Text>
            </View>
            <View style={[styles.complianceBadge, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
              <Text style={[styles.complianceText, { color: '#065F46' }]}>TeleBirr Escrow Ready</Text>
            </View>
          </View>

          {/* Bid Action Button */}
          <TouchableOpacity
            style={[styles.submitBidBtn, { marginTop: 12 }]}
            onPress={() => onSelectLoadForQuote(item)}
          >
            <Text style={styles.submitBidBtnText}>
              Place Competitive Quote ({item.id})
            </Text>
          </TouchableOpacity>

        </View>
      ))}

      {filteredLoads.length === 0 && (
        <View style={styles.emptyCard}>
          <MaterialCommunityIcons name="package-variant-closed" size={40} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No matching loads found</Text>
          <Text style={styles.emptySub}>
            Try clearing your search query to view all active corridor consignments.
          </Text>
          <TouchableOpacity
            style={[styles.typeChip, { alignSelf: 'center', marginTop: 8 }]}
            onPress={() => setLoadSearchQuery('')}
          >
            <Text style={styles.typeChipText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
