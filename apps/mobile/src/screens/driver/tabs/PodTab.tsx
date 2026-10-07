import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { driverStyles as styles } from '../driverStyles';
import { ActiveTripDetails } from '../types';
import { useLanguage } from '../../../context/LanguageContext';
import { formatCleanLocation } from './TripTab';
import { ShipperIcon, CheckIcon } from '../../../components/AppIcons';

interface PodTabProps {
  activeTrip: ActiveTripDetails | null;
  deliveredHistory?: any[];
  recipientName: string;
  setRecipientName: (val: string) => void;
  signedPOD: boolean;
  setSignedPOD: (val: boolean) => void;
  podSuccess: boolean;
  onSignPOD: () => void;
  actionLoading?: boolean;
}

export const PodTab: React.FC<PodTabProps> = ({
  activeTrip,
  deliveredHistory = [],
  recipientName,
  setRecipientName,
  signedPOD,
  setSignedPOD,
  podSuccess,
  onSignPOD,
  actionLoading = false,
}) => {
  const { t } = useLanguage();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);

  // Consolidate all orders (live active trip + all delivered historical consignments)
  const allOrders = useMemo(() => {
    const list: any[] = [];
    const seenIds = new Set<string>();

    if (activeTrip && (activeTrip.id || activeTrip.loadId)) {
      const key = activeTrip.id || activeTrip.loadId || '';
      list.push({ ...activeTrip, isLiveActive: true });
      seenIds.add(key);
    }

    if (deliveredHistory && Array.isArray(deliveredHistory)) {
      for (const item of deliveredHistory) {
        const key = item.id || item.loadId || item.shipmentId || '';
        if (key && !seenIds.has(key)) {
          seenIds.add(key);
          list.push(item);
        }
      }
    }

    return list;
  }, [activeTrip, deliveredHistory]);

  // Safe selected order boundary
  const safeIndex = selectedOrderIndex < allOrders.length ? selectedOrderIndex : 0;
  const currentOrder = allOrders[safeIndex] || activeTrip;

  // If no consignment exists anywhere in the database for this driver
  if (!currentOrder && allOrders.length === 0) {
    return (
      <View style={styles.sectionContainer}>
        <View style={[styles.emptyCard, { paddingVertical: 40 }]}>
          <Ionicons name="document-text-outline" size={44} color="#94A3B8" />
          <Text style={[styles.emptyTitle, { marginTop: 12 }]}>No e-POD Available</Text>
          <Text style={[styles.emptySub, { textAlign: 'center', maxWidth: 300 }]}>
            There are no active or completed consignments in the database. When a new shipment is assigned and arrives at its destination, electronic proof of delivery will be unlocked here.
          </Text>
        </View>
      </View>
    );
  }

  const isDelivered = currentOrder?.status?.toUpperCase() === 'DELIVERED' || (!currentOrder?.isLiveActive && currentOrder?.podDeliveredAt);
  const isComplete = (currentOrder?.isLiveActive ? (podSuccess || isDelivered) : true) || isDelivered;
  const isLiveSigning = currentOrder?.isLiveActive && !isComplete;

  // Clean location & title formatters
  const formatLocation = (loc?: string) => {
    if (!loc) return 'Djibouti Port';
    const l = loc.trim();
    if (l.toLowerCase() === 'dji' || l.toLowerCase().includes('djibouti')) {
      return 'Djibouti Port (PK12 Terminal)';
    }
    return formatCleanLocation(loc);
  };

  const formatTitle = (title?: string) => {
    if (!title) return 'Corridor Consignment';
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  const recipientDisplay = currentOrder?.podRecipientName || currentOrder?.recipientName || recipientName || 'Bereket';

  const orderTime = currentOrder?.podDeliveredAt || currentOrder?.deliveredAt;
  const deliveredTimeFormatted = orderTime
    ? new Date(orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const deliveredDateFormatted = orderTime
    ? new Date(orderTime).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
    : new Date().toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <View style={styles.sectionContainer}>
      {/* ── Section Title & Multi-Order Badge ── */}
      <View style={{ marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isComplete ? '#10B981' : '#0284C7' }} />
              <Text style={{ fontSize: 10, fontWeight: '800', color: isComplete ? '#059669' : '#0284C7', letterSpacing: 0.5 }}>
                {isComplete ? 'DELIVERY COMPLETED' : 'FINAL HANDOVER'}
              </Text>
            </View>
            <Text style={styles.sectionTitle} numberOfLines={1}>
              Proof of Delivery (e-POD)
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              backgroundColor: isComplete ? '#DCFCE7' : '#F0F9FF',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: isComplete ? '#86EFAC' : '#BAE6FD',
            }}
          >
            <Ionicons
              name={isComplete ? 'shield-checkmark' : 'time-outline'}
              size={12}
              color={isComplete ? '#15803D' : '#0369A1'}
            />
            <Text style={{ fontSize: 9.5, fontWeight: '900', color: isComplete ? '#15803D' : '#0369A1' }}>
              {allOrders.length > 1 ? `${allOrders.length} ORDERS` : isComplete ? 'VERIFIED' : 'PENDING'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Multi-Order Selector Chips (Only when multiple orders exist) ── */}
      {allOrders.length > 1 && (
        <View style={{ marginBottom: 10 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
          >
            {allOrders.map((ord, idx) => {
              const isSel = idx === safeIndex;
              const ordDelivered = ord.status?.toUpperCase() === 'DELIVERED' || ord.podDeliveredAt;
              return (
                <TouchableOpacity
                  key={ord.id || ord.loadId || idx}
                  onPress={() => setSelectedOrderIndex(idx)}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 20,
                    backgroundColor: isSel ? '#0F172A' : '#FFFFFF',
                    borderWidth: 1.5,
                    borderColor: isSel ? '#0284C7' : '#E2E8F0',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isSel ? 0.15 : 0.05,
                    shadowRadius: 3,
                    elevation: 1,
                  }}
                >
                  <Ionicons
                    name={ordDelivered ? 'checkmark-circle' : 'cube'}
                    size={13}
                    color={isSel ? (ordDelivered ? '#34D399' : '#38BDF8') : (ordDelivered ? '#10B981' : '#64748B')}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '800',
                      color: isSel ? '#FFFFFF' : '#334155',
                    }}
                  >
                    {`Order #${idx + 1}`}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10.5,
                      fontWeight: isSel ? '700' : '500',
                      color: isSel ? '#94A3B8' : '#64748B',
                      maxWidth: 80,
                    }}
                    numberOfLines={1}
                  >
                    {formatTitle(ord.title)}
                  </Text>
                  {isSel && (
                    <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#38BDF8' }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ── Compact Unified Executive Consignment & e-POD Card ── */}
      <View
        style={{
          backgroundColor: '#0F172A',
          borderRadius: 16,
          padding: 13,
          marginBottom: 12,
          gap: 9,
          borderWidth: 1,
          borderColor: '#1E293B',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        {/* Card Header: Title and Status Badge (No technical TF-SH prefixes) */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 8 }}>
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                backgroundColor: isComplete ? '#064E3B' : '#0369A1',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name={isComplete ? 'shield-checkmark' : 'cube'}
                size={16}
                color={isComplete ? '#34D399' : '#38BDF8'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#FFFFFF' }} numberOfLines={1}>
                {formatTitle(currentOrder.title)}
              </Text>
              <Text style={{ fontSize: 10.5, color: '#94A3B8' }} numberOfLines={1}>
                {currentOrder.cargo || 'Freight'} ({currentOrder.weight || '30 Tons'})
              </Text>
            </View>
          </View>

          {/* Clean Human-Friendly Status Badge (No technical developer words) */}
          <View
            style={{
              backgroundColor: isComplete ? 'rgba(16, 185, 129, 0.15)' : 'rgba(2, 132, 199, 0.15)',
              paddingHorizontal: 9,
              paddingVertical: 4,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: isComplete ? '#10B981' : '#0284C7',
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '900',
                color: isComplete ? '#34D399' : '#38BDF8',
                letterSpacing: 0.5,
              }}
            >
              {isComplete ? 'DELIVERED' : 'IN TRANSIT'}
            </Text>
          </View>
        </View>

        {/* Route Details: Fully visible Origin and Destination (NEVER truncated) */}
        <View
          style={{
            backgroundColor: '#1E293B',
            borderRadius: 10,
            paddingVertical: 9,
            paddingHorizontal: 11,
            gap: 6,
          }}
        >
          {/* Origin Stop */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#10B981' }} />
            <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '700' }}>Origin:</Text>
            <Text style={{ fontSize: 11.5, color: '#F1F5F9', fontWeight: '700', flex: 1 }}>
              {formatLocation(currentOrder.origin)}
            </Text>
          </View>

          {/* Dotted Route Connector */}
          <View style={{ paddingLeft: 3, marginVertical: -2 }}>
            <View style={{ width: 1, height: 6, backgroundColor: '#334155' }} />
          </View>

          {/* Destination Stop */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="location-sharp" size={11} color="#38BDF8" />
            <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '700' }}>Destination:</Text>
            <Text style={{ fontSize: 11.5, color: '#38BDF8', fontWeight: '700', flex: 1 }}>
              {formatCleanLocation(currentOrder.destination) || 'Kaliti Inland Container Terminal, Addis Ababa'}
            </Text>
          </View>
        </View>

        {/* Shipper & Delivery Status Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <ShipperIcon size={13} color="#94A3B8" />
            <Text style={{ fontSize: 10.5, color: '#94A3B8' }}>Shipper:</Text>
            <Text style={{ fontSize: 11, color: '#F1F5F9', fontWeight: '700' }} numberOfLines={1}>
              {currentOrder.shipperName || 'Client Consignor'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <CheckIcon size={13} color="#10B981" />
            <Text style={{ fontSize: 10.5, color: '#34D399', fontWeight: '700' }}>
              {isComplete ? 'Delivery Confirmed' : 'In Progress'}
            </Text>
          </View>
        </View>

        {/* ── Verified Delivery Summary Strip ── */}
        {isComplete && (
          <View
            style={{
              backgroundColor: '#132338',
              borderRadius: 12,
              padding: 9,
              borderWidth: 1,
              borderColor: '#1E3A5F',
              gap: 8,
            }}
          >
            {/* Inline Handover Meta: Consignee + Payment + Date */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 8.5, color: '#94A3B8', fontWeight: '700' }}>CONSIGNEE</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
                  <Ionicons name="person-circle" size={13} color="#38BDF8" />
                  <Text style={{ fontSize: 11, color: '#FFFFFF', fontWeight: '800' }} numberOfLines={1}>
                    {recipientDisplay}
                  </Text>
                </View>
              </View>
              <View style={{ width: 1, height: 20, backgroundColor: '#1E3A5F', marginHorizontal: 6 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 8.5, color: '#94A3B8', fontWeight: '700' }}>PAYMENT</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
                  <Ionicons name="checkmark-circle" size={12} color="#34D399" />
                  <Text style={{ fontSize: 10, color: '#34D399', fontWeight: '900' }}>
                    RELEASED
                  </Text>
                </View>
              </View>
              <View style={{ width: 1, height: 20, backgroundColor: '#1E3A5F', marginHorizontal: 6 }} />
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 8.5, color: '#94A3B8', fontWeight: '700' }}>DATE</Text>
                <Text style={{ fontSize: 10, color: '#CBD5E1', fontWeight: '600', marginTop: 1 }} numberOfLines={1}>
                  {deliveredDateFormatted}
                </Text>
              </View>
            </View>

            {/* View Official Certificate Receipt Action */}
            <TouchableOpacity
              onPress={() => setShowReceiptModal(true)}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                backgroundColor: '#059669',
                paddingVertical: 7,
                borderRadius: 8,
              }}
            >
              <Ionicons name="document-text-outline" size={13} color="#FFFFFF" />
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>
                View Official Certificate Receipt
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Active Order Sign-off Form (Only when current active trip is awaiting handover) ── */}
      {isLiveSigning && (
        <View style={[styles.card, { marginTop: 4 }]}>
          <View style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A' }}>
              Consignee Handover Verification
            </Text>
            <Text style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
              Enter receiving authority details and capture physical / digital signature.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Recipient / Consignee Full Legal Name *</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={[styles.input, { paddingLeft: 34 }]}
                placeholder="e.g. Almaz Bekele (Warehouse Manager)"
                placeholderTextColor="#94A3B8"
                value={recipientName}
                onChangeText={setRecipientName}
              />
              <Ionicons
                name="person-outline"
                size={16}
                color="#64748B"
                style={{ position: 'absolute', left: 10, top: 11 }}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Consignee Electronic Signature *</Text>
            <TouchableOpacity
              style={[
                styles.signatureBox,
                signedPOD && styles.signatureBoxSigned,
                { height: 65 },
              ]}
              onPress={() => setSignedPOD(!signedPOD)}
              activeOpacity={0.8}
            >
              {signedPOD ? (
                <View style={{ alignItems: 'center', gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="pencil" size={14} color="#059669" />
                    <Text style={{ fontSize: 16, fontFamily: 'cursive', color: '#059669', fontWeight: 'bold' }}>
                      {recipientName || 'Verified Consignee'}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 9, color: '#10B981', fontWeight: '700' }}>
                    Tap to re-capture signature or clear
                  </Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center', gap: 3 }}>
                  <Ionicons name="pencil-outline" size={18} color="#0284C7" />
                  <Text style={[styles.signatureText, { fontSize: 11 }]}>
                    Tap here to capture recipient electronic signature
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.podBtn,
              (!recipientName || !signedPOD || actionLoading) && styles.podBtnDisabled,
              { borderRadius: 12, paddingVertical: 12 },
            ]}
            onPress={onSignPOD}
            disabled={!recipientName || !signedPOD || actionLoading}
            activeOpacity={0.85}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                <Text style={styles.podBtnText}>
                  Submit e-POD & Release Escrow ➔
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ── Order Deliveries Archive (Compact list when multiple orders exist) ── */}
      {allOrders.length > 1 && (
        <View style={{ marginTop: 6, gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#475569' }}>
              All Deliveries Archive ({allOrders.length})
            </Text>
            <Text style={{ fontSize: 10, color: '#94A3B8' }}>
              Tap any order to view details
            </Text>
          </View>

          {allOrders.map((ord, idx) => {
            const isSel = idx === safeIndex;
            const ordDelivered = ord.status?.toUpperCase() === 'DELIVERED' || ord.podDeliveredAt;
            const ordDate = ord.podDeliveredAt || ord.deliveredAt;
            const formattedDate = ordDate
              ? new Date(ordDate).toLocaleDateString([], { month: 'short', day: 'numeric' })
              : 'Recent';

            return (
              <TouchableOpacity
                key={`archive-${ord.id || ord.loadId || idx}`}
                onPress={() => setSelectedOrderIndex(idx)}
                activeOpacity={0.75}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isSel ? '#F0F9FF' : '#FFFFFF',
                  borderRadius: 12,
                  paddingVertical: 9,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: isSel ? '#BAE6FD' : '#E2E8F0',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 8 }}>
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: ordDelivered ? '#DCFCE7' : '#E0F2FE',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons
                      name={ordDelivered ? 'checkmark' : 'time'}
                      size={13}
                      color={ordDelivered ? '#15803D' : '#0284C7'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#0F172A' }}>
                        {`Order #${idx + 1}`}
                      </Text>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#334155' }} numberOfLines={1}>
                        {formatTitle(ord.title)}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 9.5, color: '#64748B' }} numberOfLines={1}>
                      {formatLocation(ord.origin)} ➔ {ord.destination ? ord.destination.split(',')[0] : 'Kaliti'}
                    </Text>
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 2 }}>
                  <View
                    style={{
                      backgroundColor: ordDelivered ? '#DCFCE7' : '#F1F5F9',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 8.5,
                        fontWeight: '800',
                        color: ordDelivered ? '#15803D' : '#475569',
                      }}
                    >
                      {ordDelivered ? 'DELIVERED' : 'IN TRANSIT'}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 9, color: '#94A3B8' }}>{formattedDate}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* ── Official e-POD Delivery Receipt Modal ── */}
      <Modal
        visible={showReceiptModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReceiptModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              width: '100%',
              maxWidth: 380,
              padding: 18,
              gap: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 15,
              elevation: 10,
            }}
          >
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="document-text" size={20} color="#059669" />
                <Text style={{ fontSize: 15, fontWeight: '900', color: '#0F172A' }}>
                  e-POD Delivery Receipt
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowReceiptModal(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Seal & Certification */}
            <View
              style={{
                alignItems: 'center',
                paddingVertical: 9,
                backgroundColor: '#F0FDF4',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#BBF7D0',
                gap: 3,
              }}
            >
              <Ionicons name="shield-checkmark" size={32} color="#059669" />
              <Text style={{ fontSize: 12, fontWeight: '900', color: '#064E3B' }}>
                ETHIO-DJIBOUTI CORRIDOR NOTARIZED
              </Text>
              <Text style={{ fontSize: 10, color: '#047857', fontWeight: '700' }}>
                Official Handover Record • 2026
              </Text>
            </View>

            {/* Key Information */}
            <View style={{ gap: 7, paddingHorizontal: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, color: '#64748B' }}>Consignment:</Text>
                <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#0F172A' }}>
                  {formatTitle(currentOrder?.title)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, color: '#64748B' }}>Cargo & Weight:</Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#0F172A' }}>
                  {currentOrder?.cargo || 'Freight'} ({currentOrder?.weight || '30 Tons'})
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, color: '#64748B' }}>Consignee Signer:</Text>
                <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#059669' }}>
                  {recipientDisplay}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, color: '#64748B' }}>Shipper:</Text>
                <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#0F172A' }}>
                  {currentOrder?.shipperName || 'Client Consignor'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, color: '#64748B' }}>Disbursement:</Text>
                <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#166534' }}>
                  Settled from Smart Escrow
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, color: '#64748B' }}>Authoritative Timestamp:</Text>
                <Text style={{ fontSize: 10.5, color: '#0F172A', fontFamily: 'monospace' }}>
                  {deliveredDateFormatted} {deliveredTimeFormatted}
                </Text>
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setShowReceiptModal(false)}
              style={{
                backgroundColor: '#0F172A',
                borderRadius: 12,
                paddingVertical: 11,
                alignItems: 'center',
                marginTop: 2,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 12.5, fontWeight: '800' }}>
                Close Receipt
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
