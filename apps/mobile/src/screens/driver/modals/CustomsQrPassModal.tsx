import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../context/LanguageContext';
import { ActiveTripDetails, DriverCustomsPass } from '../types';

interface CustomsQrPassModalProps {
  visible: boolean;
  onClose: () => void;
  activeTrip: ActiveTripDetails | null;
  customsPass?: DriverCustomsPass | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const CustomsQrPassModal: React.FC<CustomsQrPassModalProps> = ({
  visible,
  onClose,
  activeTrip,
  customsPass,
}) => {
  const { language } = useLanguage();

  const isCleared = Boolean(customsPass?.isCleared);
  const certNo = customsPass?.certificateNo || (isCleared ? 'ECC-CLR-2026-ACTIVE' : 'ECC-HOLD-PENDING');
  const seal = customsPass?.digitalSeal || (isCleared ? 'ECC-VERIFIED-SEAL' : 'SEAL-NOT-ISSUED');
  const station = customsPass?.clearingStation || 'Galafi Border Checkpoint (Main Corridor)';
  const cargoTitle = activeTrip?.title || activeTrip?.cargo || 'Freight Consignment';
  const weight = activeTrip?.weight || '30 Tons';
  const plate = activeTrip?.assignedTruckPlate || 'Vehicle';
  const driverName = activeTrip?.driverName || 'Driver';
  const shipperName = activeTrip?.shipperName || 'Shipper Consignor';
  const docsCount = customsPass?.documentsCount || 0;
  const customsStatus = customsPass?.status || 'NOT_SUBMITTED';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.card}>
          {/* Top Bar Header */}
          <View style={modalStyles.header}>
            <View style={modalStyles.headerTitleRow}>
              <View style={[modalStyles.shieldIconBox, !isCleared && { backgroundColor: '#FEE2E2' }]}>
                <Ionicons
                  name={isCleared ? 'shield-checkmark' : 'alert-circle'}
                  size={20}
                  color={isCleared ? '#10B981' : '#EF4444'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.govHeader}>
                  FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA
                </Text>
                <Text style={modalStyles.eccHeader}>
                  ETHIOPIAN CUSTOMS COMMISSION
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={modalStyles.closeBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.body} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            {/* Certificate Title Badge */}
            <View style={[modalStyles.certPill, !isCleared && { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
              <Text style={[modalStyles.certPillText, !isCleared && { color: '#DC2626' }]}>
                {isCleared
                  ? (language === 'AM' ? 'የአረንጓዴ መስመር ዲጂታል ማለፊያ' : 'SINGLE-WINDOW GREEN LINE TRANSIT PASS')
                  : (language === 'AM' ? 'የጉምሩክ አረንጓዴ ፈቃድ አልተሰጠም (ቀይ መስመር)' : 'CUSTOMS PASS NOT ISSUED (RED LINE HOLD)')}
              </Text>
            </View>

            <View style={modalStyles.certRefBox}>
              <Text style={modalStyles.certRefLabel}>OFFICIAL STATUS / REF:</Text>
              <Text style={[modalStyles.certRefValue, !isCleared && { color: '#DC2626' }]}>
                {isCleared ? certNo : `HOLD - ${customsStatus} (${docsCount}/4 Docs)`}
              </Text>
            </View>

            {/* If Cleared: Official QR Code Display */}
            {isCleared ? (
              <>
                <View style={modalStyles.qrWrapper}>
                  <View style={modalStyles.qrBorder}>
                    <View style={modalStyles.qrMatrixBox}>
                      <Ionicons name="qr-code" size={170} color="#0F172A" />
                      <View style={modalStyles.qrBadgeOverlay}>
                        <Ionicons name="checkmark-circle" size={26} color="#059669" />
                      </View>
                    </View>
                    <Text style={modalStyles.qrInstruction}>
                      {language === 'AM'
                        ? 'በገላፊ፣ ሞጆ ወይም አዋሽ ኬላዎች ሲደርሱ ይህንን QR Code ለመኮንኑ ያሳዩ'
                        : 'Present this QR pass to customs checkpoint officers at Galafi, Modjo & Awash terminals'}
                    </Text>
                  </View>
                </View>

                {/* Cryptographic Seal Verification */}
                <View style={modalStyles.sealCard}>
                  <View style={modalStyles.sealRow}>
                    <Ionicons name="finger-print" size={18} color="#059669" />
                    <Text style={modalStyles.sealTitle}>CRYPTOGRAPHIC DIGITAL SEAL</Text>
                  </View>
                  <Text style={modalStyles.sealValue}>{seal}</Text>
                  <Text style={modalStyles.sealStation}>
                    <Text style={{ fontWeight: '700' }}>Station:</Text> {station}
                  </Text>
                </View>
              </>
            ) : (
              /* If Not Cleared: Warning & Inspection Notice (NO Fake QR Code!) */
              <View
                style={{
                  backgroundColor: '#FEF2F2',
                  borderWidth: 1.5,
                  borderColor: '#F87171',
                  borderRadius: 16,
                  padding: 16,
                  marginVertical: 12,
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <Ionicons name="warning" size={44} color="#DC2626" />
                <Text style={{ fontSize: 14, fontWeight: '900', color: '#991B1B', textAlign: 'center' }}>
                  {language === 'AM' ? 'የጉምሩክ ዲጂታል ፈቃድ አልተሰጠም' : 'GREEN LINE TRANSIT PASS NOT GRANTED'}
                </Text>
                <Text style={{ fontSize: 11.5, color: '#7F1D1D', textAlign: 'center', lineHeight: 17 }}>
                  {language === 'AM'
                    ? (customsStatus === 'NOT_SUBMITTED'
                        ? 'የጭነቱ ላኪ (Shipper) አስፈላጊ የጉምሩክ ሰነዶችን (Commercial Invoice, Packing List, B/L, Certificate of Origin) ገና አላስገባም። የጉምሩክ ባለስልጣን ሳያረጋግጥ አረንጓዴ ማለፊያ አይሰጥም።'
                        : 'ሰነዶቹ በኢትዮጵያ ጉምሩክ ኮሚሽን (ECC) ምርመራ ላይ ናቸው። ፍቃዱ በጉምሩክ ኦፊሰር እስኪጸድቅ ድረስ በኬላዎች ላይ መደበኛ ፍተሻ (Physical Inspection) ይደረጋል።')
                    : (customsStatus === 'NOT_SUBMITTED'
                        ? 'The Shipper has not uploaded the mandatory 4 customs documents. Single-window green line pass cannot be issued without Customs Authority verification.'
                        : 'Customs documents are currently under official review by the Ethiopian Customs Commission. Physical inspection lane applies at checkpoints.')}
                </Text>
                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#FECACA',
                    marginTop: 4,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#B91C1C' }}>
                    {language === 'AM' ? 'የቀረቡ ሰነዶች:' : 'Submitted Documents:'} {docsCount} / 4
                  </Text>
                </View>
              </View>
            )}

            {/* Consignment & Carrier Specs Grid */}
            <View style={modalStyles.specsGrid}>
              <View style={modalStyles.specItem}>
                <Text style={modalStyles.specLabel}>{language === 'AM' ? 'ጭነት / እቃ' : 'CARGO CONSIGNMENT'}</Text>
                <Text style={modalStyles.specVal} numberOfLines={1}>{cargoTitle}</Text>
                <Text style={modalStyles.specSub}>{weight}</Text>
              </View>

              <View style={modalStyles.specItem}>
                <Text style={modalStyles.specLabel}>{language === 'AM' ? 'አጓጓዥ መኪና ታርጋ' : 'TRUCK & CARRIER'}</Text>
                <Text style={modalStyles.specVal}>{plate}</Text>
                <Text style={modalStyles.specSub}>{driverName}</Text>
              </View>

              <View style={modalStyles.specItem}>
                <Text style={modalStyles.specLabel}>{language === 'AM' ? 'የጭነቱ ባለቤት (ላኪ)' : 'CONSIGNOR (SHIPPER)'}</Text>
                <Text style={modalStyles.specVal} numberOfLines={1}>{shipperName}</Text>
                <Text style={modalStyles.specSub}>Authorized Client</Text>
              </View>

              <View style={modalStyles.specItem}>
                <Text style={modalStyles.specLabel}>{language === 'AM' ? 'የኮሪደር ፈቃድ' : 'TRANSIT PROTOCOL'}</Text>
                <Text style={[modalStyles.specVal, { color: isCleared ? '#047857' : '#DC2626' }]}>
                  {isCleared ? 'GREEN LINE' : 'RED LINE / HOLD'}
                </Text>
                <Text style={modalStyles.specSub}>
                  {isCleared ? 'Zero Delay Transit' : 'Inspection Required'}
                </Text>
              </View>
            </View>

            {/* Legal Authority Clause */}
            <View style={[modalStyles.clauseBox, !isCleared && { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
              <Text style={[modalStyles.clauseText, !isCleared && { color: '#64748B' }]}>
                {isCleared
                  ? (language === 'AM'
                      ? 'በኢትዮጵያ ጉምሩክ አዋጅ ቁጥር 859/2014 መሰረት ይህ ጭነት በኮሪደሩ ኬላዎች ሁሉ ያለ ምንም መዘግየት እንዲተላለፍ ተፈቅዷል።'
                      : 'In accordance with Ethiopian Customs Proclamation No. 859/2014 & ASYCUDA single window, this consignment is authorized for unrestricted fast-track transit.')
                  : (language === 'AM'
                      ? 'በጉምሩክ አዋጅ መሰረት ያለ አረንጓዴ ፈቃድ የጉምሩክ ኬላዎችን ማለፍ የተከለከለ ነው። ላኪው ሰነዶችን ሲያቀርብና የጉምሩክ ኦፊሰሩ ሲያጸድቅ አረንጓዴ ፈቃዱ በቅጽበት ይከፈታል።'
                      : 'Passing corridor checkpoints without official digital customs clearance is strictly prohibited. The Green Line pass activates immediately upon Customs Officer verification.')}
              </Text>
            </View>
          </ScrollView>

          {/* Bottom Action Footer */}
          <View style={modalStyles.footer}>
            <TouchableOpacity
              onPress={onClose}
              style={[modalStyles.closeFooterBtn, !isCleared && { backgroundColor: '#334155' }]}
              activeOpacity={0.8}
            >
              <Text style={modalStyles.closeFooterBtnText}>
                {language === 'AM' ? '✕ ተመለስ (ዝጋ)' : '✕ Close Pass'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: Math.min(SCREEN_WIDTH - 32, 420),
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  shieldIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  govHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  eccHeader: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  certPill: {
    alignSelf: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  certPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  certRefBox: {
    alignItems: 'center',
    marginBottom: 14,
  },
  certRefLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  certRefValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#047857',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  qrWrapper: {
    alignItems: 'center',
    marginVertical: 4,
  },
  qrBorder: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  qrMatrixBox: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrBadgeOverlay: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 2,
  },
  qrInstruction: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 15,
  },
  sealCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
  },
  sealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sealTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  sealValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#047857',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  sealStation: {
    fontSize: 10,
    color: '#334155',
    marginTop: 2,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  specItem: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
  },
  specLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  specVal: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  specSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  clauseBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
  },
  clauseText: {
    fontSize: 9.5,
    color: '#475569',
    lineHeight: 14,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  closeFooterBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeFooterBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

