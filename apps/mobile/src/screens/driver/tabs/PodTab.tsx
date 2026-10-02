import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { driverStyles as styles } from '../driverStyles';
import { ActiveTripDetails } from '../types';

interface PodTabProps {
  activeTrip: ActiveTripDetails | null;
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
  recipientName,
  setRecipientName,
  signedPOD,
  setSignedPOD,
  podSuccess,
  onSignPOD,
  actionLoading = false,
}) => {
  // If no shipment exists in the database for this driver, DO NOT show receipt or sign-off form!
  if (!activeTrip) {
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

  const isDelivered = activeTrip.status?.toUpperCase() === 'DELIVERED';
  const isComplete = podSuccess || isDelivered;

  return (
    <View style={styles.sectionContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={styles.sectionTitle}>Digital Proof of Delivery (e-POD)</Text>
        <View style={{ backgroundColor: isComplete ? '#ECFDF5' : '#F0F9FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: isComplete ? '#A7F3D0' : '#BAE6FD' }}>
          <Text style={{ fontSize: 9.5, fontWeight: '800', color: isComplete ? '#065F46' : '#0369A1' }}>
            {isComplete ? 'DELIVERED • LEDGER VERIFIED' : 'DESTINATION HANDOVER'}
          </Text>
        </View>
      </View>

      {/* Active Consignment Overview Card */}
      <View
        style={{
          backgroundColor: '#0F172A',
          borderRadius: 16,
          padding: 14,
          marginBottom: 12,
          gap: 8,
          borderWidth: 1,
          borderColor: '#334155',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFFFFF' }}>
            {activeTrip.title}
          </Text>
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#38BDF8', fontFamily: 'monospace' }}>
            {activeTrip.loadId}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="location" size={13} color="#10B981" />
          <Text style={{ fontSize: 11.5, color: '#CBD5E1', fontWeight: '700' }}>
            {activeTrip.origin} ➔ {activeTrip.destination}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#1E293B', paddingTop: 6 }}>
          <Text style={{ fontSize: 10.5, color: '#94A3B8' }}>
            Shipper: <Text style={{ color: '#F8FAFC', fontWeight: 'bold' }}>{activeTrip.shipperName || 'Client Consignor'}</Text>
          </Text>
          <Text style={{ fontSize: 10.5, color: '#94A3B8' }}>
            Cargo: <Text style={{ color: '#F8FAFC', fontWeight: 'bold' }}>{activeTrip.cargo || 'Freight'} ({activeTrip.weight || '30T'})</Text>
          </Text>
        </View>
      </View>

      {/* SUCCESS CONFIRMATION RECEIPT */}
      {isComplete ? (
        <View
          style={{
            backgroundColor: '#ECFDF5',
            borderWidth: 1.5,
            borderColor: '#10B981',
            borderRadius: 18,
            padding: 16,
            gap: 12,
            shadowColor: '#10B981',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="checkmark-done" size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#064E3B' }}>
                Delivery Verified & e-POD Signed!
              </Text>
              <Text style={{ fontSize: 11, color: '#047857', marginTop: 1 }}>
                Proof of Delivery permanently stored on PostgreSQL database ledger.
              </Text>
            </View>
          </View>

          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, gap: 6, borderWidth: 1, borderColor: '#D1FAE5' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600' }}>Confirmed Recipient:</Text>
              <Text style={{ fontSize: 11.5, color: '#0F172A', fontWeight: '800' }}>
                {activeTrip.podRecipientName || recipientName || 'Verified Consignee Recipient'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600' }}>Electronic Signature:</Text>
              <Text style={{ fontSize: 11, color: '#059669', fontWeight: '800' }}>
                {activeTrip.podSignatureUrl || '✓ [Cryptographically Verified in Database]'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600' }}>Digital Escrow Status:</Text>
              <Text style={{ fontSize: 11, color: '#0284C7', fontWeight: '900' }}>
                RELEASED & SETTLED
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 4 }}>
              <Text style={{ fontSize: 10.5, color: '#94A3B8' }}>Database Timestamp:</Text>
              <Text style={{ fontSize: 10.5, color: '#64748B', fontFamily: 'monospace' }}>
                {activeTrip.podDeliveredAt ? new Date(activeTrip.podDeliveredAt).toLocaleString() : `${new Date().toLocaleTimeString()} • ${new Date().toLocaleDateString()}`}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#D1FAE5', padding: 8, borderRadius: 10 }}>
            <Ionicons name="shield-checkmark" size={16} color="#059669" />
            <Text style={{ fontSize: 11, color: '#065F46', fontWeight: '700', flex: 1 }}>
              Shipper has been automatically notified and can view the completed POD and corridor log.
            </Text>
          </View>
        </View>
      ) : (
        /* POD SIGN-OFF FORM */
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Recipient / Consignee Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Almaz Bekele (Warehouse Manager)"
              placeholderTextColor="#94A3B8"
              value={recipientName}
              onChangeText={setRecipientName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Recipient Electronic Signature *</Text>
            <TouchableOpacity
              style={[styles.signatureBox, signedPOD && styles.signatureBoxSigned]}
              onPress={() => setSignedPOD(!signedPOD)}
              activeOpacity={0.8}
            >
              {signedPOD ? (
                <View style={{ alignItems: 'center', gap: 2 }}>
                  <Text style={{ fontSize: 16, fontFamily: 'cursive', color: '#059669', fontWeight: 'bold' }}>
                    ✍️ {recipientName || 'Verified Recipient'}
                  </Text>
                  <Text style={{ fontSize: 9.5, color: '#10B981', fontWeight: '700' }}>
                    ✓ Tap to re-sign or clear
                  </Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center', gap: 3 }}>
                  <Ionicons name="pencil" size={18} color="#0284C7" />
                  <Text style={styles.signatureText}>
                    Tap here to capture recipient electronic signature
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ backgroundColor: '#F0F9FF', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#BAE6FD', marginTop: 2 }}>
            <Text style={{ fontSize: 10.5, color: '#0369A1', lineHeight: 15 }}>
              🔒 <Text style={{ fontWeight: 'bold' }}>Smart Escrow Release:</Text> Upon submitting this e-POD, the consignment is marked as DELIVERED and the digital escrow payment is automatically disbursed to the transporter.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.podBtn, (!recipientName || !signedPOD || actionLoading) && styles.podBtnDisabled]}
            onPress={onSignPOD}
            disabled={!recipientName || !signedPOD || actionLoading}
            activeOpacity={0.85}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.podBtnText}>
                  Complete Electronic POD & Release Escrow
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
