import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { apiFetch } from '../../../utils/api';

interface CompleteProfileGateProps {
  user: any;
  carrierStatus: 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  onProfileCompleted: (updatedUser: any) => void;
  onLogout: () => void;
}

export const CompleteProfileGate: React.FC<CompleteProfileGateProps> = ({
  user,
  carrierStatus,
  onProfileCompleted,
  onLogout,
}) => {
  // Check if documents and compliance info were already submitted
  const hasExistingDocs = Boolean(
    user?.tin && (user?.insuranceDoc || user?.roadworthinessDoc || user?.tradeLicenseDoc)
  );

  const [complianceStep, setComplianceStep] = useState<1 | 2>(1);

  // Step 1: Enterprise Details
  const [companyName, setCompanyName] = useState(user?.companyName || user?.fullName || '');
  const [tin, setTin] = useState(user?.tin || '');
  const [tradeLicenseNo, setTradeLicenseNo] = useState(user?.tradeLicenseNo || '');

  // Step 2: Compliance Documents
  const [insuranceDocName, setInsuranceDocName] = useState('');
  const [insuranceDocData, setInsuranceDocData] = useState('');
  const [roadworthinessDocName, setRoadworthinessDocName] = useState('');
  const [roadworthinessDocData, setRoadworthinessDocData] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Real Native & Web Device Document Picker
  const pickDocument = async (
    onSuccess: (name: string, dataUrl: string) => void
  ) => {
    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/pdf,image/*';
        input.onchange = (e: any) => {
          const file = e.target?.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              onSuccess(file.name, reader.result as string);
            };
            reader.readAsDataURL(file);
            setErrorMsg('');
          }
        };
        input.click();
      } else {
        const res = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'image/*'],
          copyToCacheDirectory: true,
        });
        if (!res.canceled && res.assets && res.assets.length > 0) {
          const asset = res.assets[0];
          try {
            const resp = await fetch(asset.uri);
            const blob = await resp.blob();
            const reader = new FileReader();
            reader.onload = () => {
              onSuccess(asset.name, reader.result as string);
            };
            reader.readAsDataURL(blob);
          } catch {
            onSuccess(asset.name, asset.uri);
          }
          setErrorMsg('');
        }
      }
    } catch (err) {
      console.warn('Document picker error:', err);
    }
  };

  // Validate Step 1 -> Move to Step 2 (Documents)
  const handleNextToDocs = () => {
    if (!companyName.trim()) {
      setErrorMsg('Please enter your official Transport Company Name.');
      return;
    }
    if (!tin.trim() || tin.trim().length < 8) {
      setErrorMsg('Please enter a valid 10-digit Tax Identification Number (TIN).');
      return;
    }
    if (!tradeLicenseNo.trim()) {
      setErrorMsg('Please enter your Commercial Trade License / Registration Number.');
      return;
    }
    setErrorMsg('');
    setComplianceStep(2);
  };

  // Submit Final Profile (Step 2 -> Admin Verification)
  const handleSubmitProfile = async () => {
    if (!companyName.trim() || !tin.trim() || !tradeLicenseNo.trim()) {
      setComplianceStep(1);
      setErrorMsg('Please fill in your company credentials before submitting.');
      return;
    }
    if (!insuranceDocName && !user?.insuranceDoc) {
      setErrorMsg('Please attach your Goods-in-Transit (GIT) Insurance policy.');
      return;
    }
    if (!roadworthinessDocName && !user?.roadworthinessDoc) {
      setErrorMsg('Please attach your FTA Fleet Roadworthiness Certificate.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        userId: user?.id,
        email: user?.email,
        phone: user?.phone,
        companyName: companyName.trim(),
        tin: tin.trim(),
        tradeLicenseNo: tradeLicenseNo.trim(),
        insuranceDoc: insuranceDocData
          ? JSON.stringify({ name: insuranceDocName, data: insuranceDocData })
          : insuranceDocName || user?.insuranceDoc,
        roadworthinessDoc: roadworthinessDocData
          ? JSON.stringify({ name: roadworthinessDocName, data: roadworthinessDocData })
          : roadworthinessDocName || user?.roadworthinessDoc,
      };

      const res = await apiFetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok && data.user) {
        onProfileCompleted(data.user);
        Alert.alert(
          'Profile Submitted',
          'Your compliance credentials have been submitted for review. Your account will automatically unlock once approved by TradeFlow Administration.'
        );
      } else {
        setErrorMsg(data.error || 'Failed to submit profile. Please verify your details.');
      }
    } catch (e: any) {
      setSubmitting(false);
      setErrorMsg('Could not connect to server. Please check your internet connection.');
    }
  };

  const getInputWrapperStyle = (fieldName: string) => [
    styles.inputWrapper,
    {
      borderColor: focusedField === fieldName ? '#0284C7' : '#CBD5E1',
      backgroundColor: focusedField === fieldName ? '#FFFFFF' : '#F8FAFC',
    },
  ];

  const getIconColor = (fieldName: string) =>
    focusedField === fieldName ? '#0284C7' : '#64748B';

  const handleHeaderBack = () => {
    if (complianceStep === 2) {
      setErrorMsg('');
      setComplianceStep(1);
    } else {
      onLogout();
    }
  };

  // VIEW 1: Documents Submitted, Waiting for Admin Verification ("admin verfi siyadergwe endigeba")
  if (hasExistingDocs && carrierStatus === 'PENDING') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F9FD" />
        
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={onLogout}
            style={styles.backButton}
            activeOpacity={0.7}
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>

          {/* Absolute Mathematically Centered Title */}
          <View style={styles.brandTitleContainer} pointerEvents="none">
            <Text style={styles.brandTitle}>TradeFlow</Text>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={14} color="#EF4444" style={{ marginRight: 4 }} />
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            {/* Verification Status Header */}
            <View style={styles.statusHeaderBox}>
              <View style={styles.statusIconRingOuter}>
                <View style={styles.statusIconRingInner}>
                  <Ionicons name="time" size={32} color="#D97706" />
                </View>
              </View>
              <Text style={styles.headingCentered}>Verification Under Review</Text>
            </View>

            {/* Submitted Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardHeader}>
                <Ionicons name="document-text-outline" size={15} color="#0284C7" />
                <Text style={styles.summaryTitle}>SUBMITTED COMPLIANCE PROFILE</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Transport Company</Text>
                <Text style={styles.summaryValue}>{user?.companyName || companyName || 'Carrier Fleet'}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Managing Director</Text>
                <Text style={styles.summaryValue}>{user?.fullName || 'N/A'}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Business Phone</Text>
                <Text style={styles.summaryValue}>{user?.phone || 'N/A'}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax ID (TIN)</Text>
                <Text style={[styles.summaryValue, styles.monoText]}>
                  {user?.tin || tin || 'Submitted'}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Trade License No</Text>
                <Text style={styles.summaryValue}>{user?.tradeLicenseNo || tradeLicenseNo || 'Submitted'}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>GIT Cargo Insurance</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={13} color="#059669" />
                  <Text style={styles.verifiedBadgeText}>Attached & Submitted</Text>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>FTA Roadworthiness</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={13} color="#059669" />
                  <Text style={styles.verifiedBadgeText}>Certified & Submitted</Text>
                </View>
              </View>
            </View>

            {/* Notice Footer */}
            <View style={styles.instructionNotice}>
              <Ionicons name="information-circle" size={16} color="#0284C7" style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={styles.instructionText}>
                Administrators verify TIN and insurance credentials within minutes. You do not need to refresh this screen.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // VIEW 2: Incomplete Profile -> Step-by-Step Guided Flow (Next/Continue)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F9FD" />

      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={handleHeaderBack}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>

        {/* Absolute Mathematically Centered Title */}
        <View style={styles.brandTitleContainer} pointerEvents="none">
          <Text style={styles.brandTitle}>TradeFlow</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={14} color="#EF4444" style={{ marginRight: 4 }} />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* Stepper Progress Bar */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepperBars}>
              <View style={[styles.stepBar, styles.stepBarActive]} />
              <View style={[styles.stepBar, complianceStep === 2 ? styles.stepBarActive : null]} />
            </View>
            <View style={styles.stepInfoRow}>
              <Text style={styles.stepLabel}>STEP {complianceStep} OF 2</Text>
              <Text style={styles.stepTitle}>
                {complianceStep === 1 ? 'Enterprise & Tax Details' : 'Mandatory Documents'}
              </Text>
            </View>
          </View>

          {/* Title Area */}
          <View style={styles.titleSection}>
            <View style={styles.mainTitleRow}>
              <Text style={styles.mainTitleText}>
                {complianceStep === 1 ? 'Carrier Information' : 'Upload Certificates'}
              </Text>
              <View style={styles.accentLine} />
            </View>
          </View>

          {/* Error Message */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* SUB-STEP 1: Business Details (Company Name, TIN, Trade License) */}
          {complianceStep === 1 ? (
            <View style={{ gap: 14 }}>
              {/* 1. Legal Company Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Official Transport Company Name *</Text>
                <View style={getInputWrapperStyle('companyName')}>
                  <Ionicons
                    name="business-outline"
                    size={18}
                    color={getIconColor('companyName')}
                    style={{ marginLeft: 14, marginRight: 8 }}
                  />
                  <TextInput
                    style={styles.cleanInput}
                    value={companyName}
                    onFocus={() => setFocusedField('companyName')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(val) => {
                      setCompanyName(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Transport Company Name"
                    placeholderTextColor="#94A3B8"
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* 2. Tax Identification Number (TIN) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tax Identification Number (TIN) *</Text>
                <View style={getInputWrapperStyle('tin')}>
                  <Ionicons
                    name="card-outline"
                    size={18}
                    color={getIconColor('tin')}
                    style={{ marginLeft: 14, marginRight: 8 }}
                  />
                  <TextInput
                    style={styles.cleanInput}
                    value={tin}
                    onFocus={() => setFocusedField('tin')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(val) => {
                      setTin(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="10-digit Ethiopian TIN"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    maxLength={10}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* 3. Trade License Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Commercial Trade License / Registration No *</Text>
                <View style={getInputWrapperStyle('tradeLicenseNo')}>
                  <Ionicons
                    name="ribbon-outline"
                    size={18}
                    color={getIconColor('tradeLicenseNo')}
                    style={{ marginLeft: 14, marginRight: 8 }}
                  />
                  <TextInput
                    style={styles.cleanInput}
                    value={tradeLicenseNo}
                    onFocus={() => setFocusedField('tradeLicenseNo')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(val) => {
                      setTradeLicenseNo(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Trade License / Registration Number"
                    placeholderTextColor="#94A3B8"
                    returnKeyType="done"
                    onSubmitEditing={handleNextToDocs}
                  />
                </View>
              </View>

              {/* Continue to Step 2 Button */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleNextToDocs}
                activeOpacity={0.85}
              >
                <Text style={styles.submitBtnText}>Continue to Documents ➔</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* SUB-STEP 2: Compliance Documents Upload */
            <View style={{ gap: 14 }}>
              <View style={styles.docsSectionContainer}>
                <View style={styles.docsSectionHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docsSectionHeader}>Required Certificates</Text>
                    <Text style={styles.docsSectionSub}>
                      Attach official scans or clear photos for regulatory administrative approval.
                    </Text>
                  </View>
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredBadgeText}>MANDATORY</Text>
                  </View>
                </View>

                {/* Document 1: GIT Insurance */}
                <TouchableOpacity
                  style={[styles.uploadCard, insuranceDocName ? styles.uploadCardDone : null]}
                  onPress={() => pickDocument((name, data) => {
                    setInsuranceDocName(name);
                    setInsuranceDocData(data);
                  })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.docIconCircle, insuranceDocName ? styles.docIconCircleDone : null]}>
                    <Ionicons
                      name={insuranceDocName ? 'checkmark' : 'document-text-outline'}
                      size={20}
                      color={insuranceDocName ? '#059669' : '#0284C7'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.uploadCardTitle}>Goods-in-Transit (GIT) Insurance *</Text>
                    <Text style={[styles.uploadCardStatus, insuranceDocName && styles.uploadCardStatusDone]} numberOfLines={1}>
                      {insuranceDocName ? insuranceDocName : 'PDF or clear photo • Tap to upload'}
                    </Text>
                  </View>
                  <View style={[styles.uploadBtnBadge, insuranceDocName && styles.uploadBtnBadgeDone]}>
                    <Text style={[styles.uploadBtnBadgeText, insuranceDocName && styles.uploadBtnBadgeTextDone]}>
                      {insuranceDocName ? 'Replace' : 'Upload'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Document 2: FTA Roadworthiness */}
                <TouchableOpacity
                  style={[styles.uploadCard, roadworthinessDocName ? styles.uploadCardDone : null]}
                  onPress={() => pickDocument((name, data) => {
                    setRoadworthinessDocName(name);
                    setRoadworthinessDocData(data);
                  })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.docIconCircle, roadworthinessDocName ? styles.docIconCircleDone : null]}>
                    <Ionicons
                      name={roadworthinessDocName ? 'checkmark' : 'shield-outline'}
                      size={20}
                      color={roadworthinessDocName ? '#059669' : '#0284C7'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.uploadCardTitle}>FTA Roadworthiness Certificate *</Text>
                    <Text style={[styles.uploadCardStatus, roadworthinessDocName && styles.uploadCardStatusDone]} numberOfLines={1}>
                      {roadworthinessDocName ? roadworthinessDocName : 'Certificate PDF or photo • Tap to upload'}
                    </Text>
                  </View>
                  <View style={[styles.uploadBtnBadge, roadworthinessDocName && styles.uploadBtnBadgeDone]}>
                    <Text style={[styles.uploadBtnBadgeText, roadworthinessDocName && styles.uploadBtnBadgeTextDone]}>
                      {roadworthinessDocName ? 'Replace' : 'Upload'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Submit Final Profile Button */}
              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                onPress={handleSubmitProfile}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.submitBtnText}>Submit Profile for Verification ➔</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Back to Step 1 Button */}
              <TouchableOpacity
                style={styles.backStepBtn}
                onPress={() => {
                  setErrorMsg('');
                  setComplianceStep(1);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={14} color="#64748B" />
                <Text style={styles.backStepText}>Back to Enterprise Details</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9FD',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? Math.max((StatusBar.currentHeight || 0) + 16, 48) : 16,
    paddingBottom: 14,
    position: 'relative',
    zIndex: 100,
  },
  brandTitleContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  brandTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: { boxShadow: '0 1px 3px rgba(0,0,0,0.04)' } as any,
      default: { elevation: 1 },
    }),
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
    ...Platform.select({
      web: { boxShadow: '0 1px 3px rgba(0,0,0,0.04)' } as any,
      default: { elevation: 1 },
    }),
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  formContainer: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  stepperContainer: {
    marginTop: 6,
    marginBottom: 20,
    gap: 8,
  },
  stepperBars: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
  },
  stepBar: {
    flex: 1,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  stepBarActive: {
    backgroundColor: '#0284C7',
  },
  stepInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  mainTitleRow: {
    alignItems: 'center',
  },
  mainTitleText: {
    fontSize: 23,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  accentLine: {
    width: 40,
    height: 3,
    backgroundColor: '#0284C7',
    borderRadius: 2,
    marginTop: 4,
  },
  formSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 11.5,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
  },
  inputGroup: {
    gap: 5,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: 0.1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    height: 48,
  },
  cleanInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: 10,
    paddingRight: 14,
  },
  docsSectionContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginTop: 2,
    ...Platform.select({
      web: { boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)' } as any,
      default: { elevation: 1 },
    }),
  },
  docsSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  docsSectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  docsSectionSub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    marginTop: 2,
  },
  requiredBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  requiredBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 11,
    gap: 10,
  },
  uploadCardDone: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  docIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docIconCircleDone: {
    backgroundColor: '#D1FAE5',
  },
  uploadCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  uploadCardStatus: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  uploadCardStatusDone: {
    color: '#047857',
    fontWeight: '600',
  },
  uploadBtnBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
  },
  uploadBtnBadgeDone: {
    backgroundColor: '#D1FAE5',
  },
  uploadBtnBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  uploadBtnBadgeTextDone: {
    color: '#059669',
  },
  submitBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(2, 132, 199, 0.28)' } as any,
      default: {
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  backStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 2,
  },
  backStepText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
  },
  // VIEW 1 Styles
  statusHeaderBox: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  statusIconRingOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FDE68A',
    marginBottom: 4,
  },
  statusIconRingInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FDF6B2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingCentered: {
    fontSize: 21,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginBottom: 14,
    ...Platform.select({
      web: { boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)' } as any,
      default: { elevation: 1 },
    }),
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  summaryLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    maxWidth: '55%',
    textAlign: 'right',
  },
  monoText: {
    color: '#0284C7',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  instructionNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 12,
  },
  instructionText: {
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 16,
    flex: 1,
    fontWeight: '500',
  },
});
