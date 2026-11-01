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
import { useTheme } from '../../../context/ThemeContext';
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
  const { t, language } = useLanguage();
  const { colors, isDark } = useTheme();

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
        <View style={[modalStyles.card, { backgroundColor: colors.card }]}>
          {/* Top Bar Header */}
          <View style={[modalStyles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
            <View style={modalStyles.headerTitleRow}>
              <View style={[modalStyles.shieldIconBox, !isCleared && { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2' }]}>
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
              style={[modalStyles.closeBtn, { backgroundColor: colors.surface }]}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.body} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            {/* Certificate Title Badge */}
            <View style={[
              modalStyles.certPill,
              isCleared
                ? (isDark ? { backgroundColor: '#064E3B', borderColor: '#059669' } : { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' })
                : (isDark ? { backgroundColor: '#450A0A', borderColor: '#991B1B' } : { backgroundColor: '#FEF2F2', borderColor: '#FECACA' })
            ]}>
              <Text style={[
                modalStyles.certPillText,
                isCleared
                  ? (isDark ? { color: '#6EE7B7' } : { color: '#065F46' })
                  : { color: '#EF4444' }
              ]}>
                {isCleared
                  ? (language === 'AM' ? 'የአረንጓዴ መስመር ዲጂታል ማለፊያ' : language === 'OM' ? 'Eeyyama Sarara Magariisa' : 'SINGLE-WINDOW GREEN LINE TRANSIT PASS')
                  : (language === 'AM' ? 'የጉምሩክ አረንጓዴ ፈቃድ አልተሰጠም (ቀይ መስመር)' : language === 'OM' ? 'Eeyyama Gumruukaa Hin Heyyamamne (Sarara Diimaa)' : 'CUSTOMS PASS NOT ISSUED (RED LINE HOLD)')}
              </Text>
            </View>

            <View style={modalStyles.certRefBox}>
              <Text style={[modalStyles.certRefLabel, { color: colors.textMuted }]}>OFFICIAL STATUS / REF:</Text>
              <Text style={[modalStyles.certRefValue, isCleared ? { color: colors.success } : { color: colors.danger }]}>
                {isCleared ? certNo : `HOLD - ${customsStatus} (${docsCount}/4 Docs)`}
              </Text>
            </View>

            {/* If Cleared: Official QR Code Display */}
            {isCleared ? (
              <>
                <View style={modalStyles.qrWrapper}>
                  <View style={[modalStyles.qrBorder, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.border }]}>
                    <View style={modalStyles.qrMatrixBox}>
                      <Ionicons name="qr-code" size={170} color="#0F172A" />
                      <View style={modalStyles.qrBadgeOverlay}>
                        <Ionicons name="checkmark-circle" size={26} color="#059669" />
                      </View>
                    </View>
                    <Text style={[modalStyles.qrInstruction, { color: colors.textMuted }]}>
                      {language === 'AM'
                        ? 'በገላፊ፣ ሞጆ ወይም አዋሽ ኬላዎች ሲደርሱ ይህንን QR Code ለመኮንኑ ያሳዩ'
                        : language === 'OM'
                        ? 'Koodii QR kana kellaawwan Galaafii, Mojo ykn Awaashitti agarsiisaa'
                        : 'Present this QR pass to customs checkpoint officers at Galafi, Modjo & Awash terminals'}
                    </Text>
                  </View>
                </View>

                {/* Cryptographic Seal Verification */}
                <View style={[modalStyles.sealCard, isDark && { backgroundColor: '#064E3B', borderColor: '#059669' }]}>
                  <View style={modalStyles.sealRow}>
                    <Ionicons name="finger-print" size={18} color="#10B981" />
                    <Text style={[modalStyles.sealTitle, isDark && { color: '#6EE7B7' }]}>CRYPTOGRAPHIC DIGITAL SEAL</Text>
                  </View>
                  <Text style={[modalStyles.sealValue, isDark && { color: '#A7F3D0' }]}>{seal}</Text>
                  <Text style={[modalStyles.sealStation, isDark && { color: '#D1FAE5' }]}>
                    <Text style={{ fontWeight: '700' }}>Station:</Text> {station}
                  </Text>
                </View>
              </>
            ) : (
              /* If Not Cleared: Warning & Inspection Notice */
              <View
                style={{
                  backgroundColor: isDark ? '#450A0A' : '#FEF2F2',
                  borderWidth: 1.5,
                  borderColor: isDark ? '#991B1B' : '#F87171',
                  borderRadius: 16,
                  padding: 16,
                  marginVertical: 12,
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <Ionicons name="warning" size={44} color="#EF4444" />
                <Text style={{ fontSize: 14, fontWeight: '900', color: isDark ? '#FCA5A5' : '#991B1B', textAlign: 'center' }}>
                  {language === 'AM' ? 'የጉምሩክ ዲጂታል ፈቃድ አልተሰጠም' : language === 'OM' ? 'Eeyyamni Gumruukaa Hin Kennamne' : 'GREEN LINE TRANSIT PASS NOT GRANTED'}
                </Text>
                <Text style={{ fontSize: 11.5, color: isDark ? '#FECACA' : '#7F1D1D', textAlign: 'center', lineHeight: 17 }}>
                  {language === 'AM'
                    ? (customsStatus === 'NOT_SUBMITTED'
                        ? 'አስፈላጊዎቹ 4 የጉምሩክ ሰነዶች (ዲክላራሲዮን፣ የመጫኛ ዝርዝር፣ የንግድ መጠየቂያ እና ቦሎ) በአጓጓዡ ወይም በላኪው አልተጫኑም። ስለዚህ ፈቃድ አልተሰጠም።'
                        : 'ጭነቱ በጉምሩክ ባለስልጣናት አካላዊ ፍተሻ (Physical Inspection / Red Line) ላይ ስለሚገኝ የአረንጓዴ መስመር ፈቃድ አልተሰጠም። እባክዎ ወደ ጉምሩክ ኬላ ሄደው ያስፈትሹ።')
                    : language === 'OM'
                    ? (customsStatus === 'NOT_SUBMITTED'
                        ? 'Sanadoonni barbaachisoo 4 (Dekilaraasiyoonii, Sanada Fe\'umsaa, Invooyisii fi Bolo) hin galfamne. Kanaaf eeyyamni hin kennamne.'
                        : 'Fe\'umsi sakatta\'iinsa qaamaa (Red Line) irratti waan jiruuf eeyyamni sarara magariisaa hin kennamne. Maaloo buufata gumruukaatti sakatta\'iinsa gaggeessaa.')
                    : (customsStatus === 'NOT_SUBMITTED'
                        ? 'Required clearance documents (Declaration, Packing List, Invoice, Roadworthiness) have NOT been submitted by the shipper/carrier. A green pass cannot be issued.'
                        : 'Cargo requires mandatory physical customs inspection (Red Line hold). Driver must complete manual clearance at Galafi or Modjo customs before departure.')}
                </Text>
                <View
                  style={{
                    backgroundColor: isDark ? '#2D0606' : '#FEE2E2',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: isDark ? '#7F1D1D' : '#FCA5A5',
                    marginTop: 4,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: isDark ? '#F87171' : '#B91C1C' }}>
                    {language === 'AM'
                      ? `የሰነዶች ሁኔታ፡ ${docsCount}/4 ሰነዶች ተረጋግጠዋል`
                      : language === 'OM'
                      ? `Haala Sanadaa: Sanadoota ${docsCount}/4 mirkanaa'an`
                      : `Documents Status: ${docsCount}/4 Verified`}
                  </Text>
                </View>
              </View>
            )}

            {/* Consignment Verification Table */}
            <View style={[modalStyles.detailsCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.border }]}>
              <Text style={[modalStyles.detailsHeading, { color: colors.textMuted }]}>CONSIGNMENT MANIFEST DETAILS</Text>

              <View style={[modalStyles.detailRow, { borderBottomColor: colors.border }]}>
                <Text style={[modalStyles.detailLabel, { color: colors.textMuted }]}>Cargo Commodity:</Text>
                <Text style={[modalStyles.detailVal, { color: colors.text }]}>{cargoTitle}</Text>
              </View>

              <View style={[modalStyles.detailRow, { borderBottomColor: colors.border }]}>
                <Text style={[modalStyles.detailLabel, { color: colors.textMuted }]}>Net Weight / Volume:</Text>
                <Text style={[modalStyles.detailVal, { color: colors.text }]}>{weight}</Text>
              </View>

              <View style={[modalStyles.detailRow, { borderBottomColor: colors.border }]}>
                <Text style={[modalStyles.detailLabel, { color: colors.textMuted }]}>Assigned Vehicle:</Text>
                <Text style={[modalStyles.detailVal, { color: colors.accent, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>
                  {plate}
                </Text>
              </View>

              <View style={[modalStyles.detailRow, { borderBottomColor: colors.border }]}>
                <Text style={[modalStyles.detailLabel, { color: colors.textMuted }]}>Authorized Driver:</Text>
                <Text style={[modalStyles.detailVal, { color: colors.text }]}>{driverName}</Text>
              </View>

              <View style={modalStyles.detailRow}>
                <Text style={[modalStyles.detailLabel, { color: colors.textMuted }]}>Registered Consignor:</Text>
                <Text style={[modalStyles.detailVal, { color: colors.text }]}>{shipperName}</Text>
              </View>
            </View>

            {/* Official Footer Verification Note */}
            <View style={modalStyles.footerNoteBox}>
              <Ionicons name="lock-closed" size={13} color="#94A3B8" />
              <Text style={[modalStyles.footerNoteText, { color: colors.textMuted }]}>
                Verified via National Single-Window Electronic Customs Clearance System (Ethio-Djibouti Trade Corridor).
              </Text>
            </View>
          </ScrollView>

          {/* Modal Action Footer */}
          <View style={[modalStyles.actionFooter, { backgroundColor: colors.headerBg, borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[modalStyles.dismissBtn, { backgroundColor: colors.surfaceHover, borderColor: colors.border }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={[modalStyles.dismissBtnText, { color: colors.text }]}>
                {language === 'AM' ? 'ዝጋ' : language === 'OM' ? 'Cufi' : 'Dismiss Pass'}
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
    borderBottomWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  certPill: {
    alignSelf: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  certPillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  certRefBox: {
    alignItems: 'center',
    marginBottom: 14,
  },
  certRefLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  certRefValue: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  qrWrapper: {
    alignItems: 'center',
    marginVertical: 4,
  },
  qrBorder: {
    borderWidth: 2,
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
    color: '#059669',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  sealStation: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  detailsCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    gap: 8,
  },
  detailsHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  detailVal: {
    fontSize: 11.5,
    fontWeight: '800',
    textAlign: 'right',
  },
  footerNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    marginTop: 12,
  },
  footerNoteText: {
    fontSize: 10,
    lineHeight: 14,
    flex: 1,
  },
  actionFooter: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  dismissBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dismissBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
