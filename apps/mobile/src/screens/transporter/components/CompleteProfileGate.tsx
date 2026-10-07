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

  const [companyName, setCompanyName] = useState(user?.companyName || user?.fullName || '');
  const [tin, setTin] = useState(user?.tin || '');
  const [tradeLicenseNo, setTradeLicenseNo] = useState(user?.tradeLicenseNo || '');

  // GIT Insurance Document
  const [insuranceDocName, setInsuranceDocName] = useState('');
  const [insuranceDocData, setInsuranceDocData] = useState('');

  // FTA Roadworthiness Document
  const [roadworthinessDocName, setRoadworthinessDocName] = useState('');
  const [roadworthinessDocData, setRoadworthinessDocData] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleSubmitProfile = async () => {
    if (!companyName.trim()) {
      setErrorMsg('Please enter your official Transport Company Name.');
      return;
    }
    if (!tin.trim() || tin.trim().length < 8) {
      setErrorMsg('Please enter a valid Tax Identification Number (TIN).');
      return;
    }
    if (!tradeLicenseNo.trim()) {
      setErrorMsg('Please enter your Commercial Trade License / Registration Number.');
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

  // VIEW 1: Documents Submitted, Waiting for Admin Verification ("admin verfi siyadergwe endigeba")
  if (hasExistingDocs && carrierStatus === 'PENDING') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F9FD" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Top Bar with Logout */}
          <View style={styles.topHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.brandIconBox}>
                <Ionicons name="cube" size={18} color="#0284C7" />
              </View>
              <Text style={styles.brandText}>TradeFlow Carrier</Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Ionicons name="log-out-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Verification Pending Card */}
          <View style={styles.card}>
            <View style={styles.pendingBadgeCircle}>
              <Text style={{ fontSize: 36 }}>⏳</Text>
            </View>

            <Text style={styles.headingCentered}>Verification Under Review</Text>
            <Text style={styles.subHeadingCentered}>
              Your compliance credentials have been submitted to TradeFlow Administration for regulatory review.
            </Text>

            {/* Live Reactive Channel Indicator */}
            <View style={styles.liveSyncBanner}>
              <View style={styles.greenPulseDot} />
              <Text style={styles.liveSyncText}>
                Live Sync Active: Automatically unlocks the instant an administrator approves your account.
              </Text>
            </View>

            {/* Submitted Summary */}
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>SUBMITTED COMPLIANCE PROFILE</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Transport Company:</Text>
                <Text style={styles.summaryValue}>{user?.companyName || companyName || 'Carrier Fleet'}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Managing Director:</Text>
                <Text style={styles.summaryValue}>{user?.fullName || 'N/A'}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Business Phone:</Text>
                <Text style={styles.summaryValue}>{user?.phone || 'N/A'}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax ID (TIN):</Text>
                <Text style={[styles.summaryValue, { color: '#0284C7', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>
                  {user?.tin || tin || 'Submitted'}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Trade License No:</Text>
                <Text style={styles.summaryValue}>{user?.tradeLicenseNo || tradeLicenseNo || 'Submitted'}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>GIT Cargo Insurance:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={[styles.summaryValue, { color: '#059669', fontWeight: '800' }]}>Attached & Submitted</Text>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>FTA Roadworthiness:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={[styles.summaryValue, { color: '#059669', fontWeight: '800' }]}>Certified & Submitted</Text>
                </View>
              </View>
            </View>

            {/* Notice Footer */}
            <View style={styles.instructionNotice}>
              <Ionicons name="information-circle-outline" size={16} color="#0369A1" style={{ marginRight: 6 }} />
              <Text style={styles.instructionText}>
                Administrators verify TIN and insurance credentials within minutes. You do not need to refresh this screen.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // VIEW 2: Incomplete Profile -> Fill Remaining Forms ("coplite profile yemile metolt")
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F9FD" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.brandIconBox}>
              <Ionicons name="shield-checkmark" size={18} color="#0284C7" />
            </View>
            <Text style={styles.brandText}>TradeFlow Onboarding</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={styles.stepPill}>
              <Text style={styles.stepPillText}>STEP 2 OF 2: COMPLIANCE</Text>
            </View>
            <Text style={styles.formTitle}>Complete Carrier Profile</Text>
            <Text style={styles.formSubtitle}>
              Welcome, <Text style={{ fontWeight: '800', color: '#0F172A' }}>{user?.fullName || 'Carrier'}</Text>! Complete your business details and upload verification documents to unlock the freight corridor board.
            </Text>
          </View>

          {/* Error Message */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* 1. Legal Company Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Official Transport Company Name *</Text>
            <TextInput
              style={styles.textInput}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="e.g. Red Sea Freight Logistics Plc"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* 2. Tax Identification Number (TIN) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tax Identification Number (TIN) *</Text>
            <TextInput
              style={styles.textInput}
              value={tin}
              onChangeText={setTin}
              placeholder="10-digit Ethiopian TIN (e.g. 0047281934)"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
            />
          </View>

          {/* 3. Trade License Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Commercial Trade License / Registration No *</Text>
            <TextInput
              style={styles.textInput}
              value={tradeLicenseNo}
              onChangeText={setTradeLicenseNo}
              placeholder="e.g. ETH-MOTI-2026-881"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* 4. Compliance Documents Section */}
          <View style={styles.docsContainer}>
            <Text style={styles.docsSectionHeader}>Mandatory Compliance Documents</Text>
            <Text style={styles.docsSectionSub}>
              Attach official scans or clear photos for regulatory administrative approval.
            </Text>

            {/* Document 1: GIT Insurance */}
            <TouchableOpacity
              style={[styles.uploadCard, insuranceDocName ? styles.uploadCardDone : null]}
              onPress={() => pickDocument((name, data) => {
                setInsuranceDocName(name);
                setInsuranceDocData(data);
              })}
              activeOpacity={0.8}
            >
              <Ionicons
                name={insuranceDocName ? 'checkmark-circle' : 'document-text-outline'}
                size={22}
                color={insuranceDocName ? '#059669' : '#64748B'}
                style={{ marginRight: 10 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadCardTitle}>Goods-in-Transit (GIT) Insurance *</Text>
                <Text style={styles.uploadCardStatus} numberOfLines={1}>
                  {insuranceDocName ? insuranceDocName : 'Tap to select Insurance PDF / Image'}
                </Text>
              </View>
              <View style={styles.uploadBtnBadge}>
                <Text style={styles.uploadBtnBadgeText}>{insuranceDocName ? 'Replace' : 'Upload'}</Text>
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
              <Ionicons
                name={roadworthinessDocName ? 'checkmark-circle' : 'shield-outline'}
                size={22}
                color={roadworthinessDocName ? '#059669' : '#64748B'}
                style={{ marginRight: 10 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadCardTitle}>FTA Roadworthiness Certificate *</Text>
                <Text style={styles.uploadCardStatus} numberOfLines={1}>
                  {roadworthinessDocName ? roadworthinessDocName : 'Tap to select Certificate PDF / Image'}
                </Text>
              </View>
              <View style={styles.uploadBtnBadge}>
                <Text style={styles.uploadBtnBadgeText}>{roadworthinessDocName ? 'Replace' : 'Upload'}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
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
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.submitBtnText}>Submit Profile for Verification ➔</Text>
              </>
            )}
          </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  brandIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
      } as any,
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
      },
    }),
  },
  stepHeader: {
    gap: 6,
  },
  stepPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stepPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  formTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
  },
  formSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 10,
  },
  errorText: {
    fontSize: 11.5,
    color: '#DC2626',
    fontWeight: '700',
    flex: 1,
  },
  inputGroup: {
    gap: 5,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  docsContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginVertical: 4,
  },
  docsSectionHeader: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  docsSectionSub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  uploadCardDone: {
    borderColor: '#10B981',
    borderStyle: 'solid',
    backgroundColor: '#F0FDF4',
  },
  uploadCardIcon: {
    fontSize: 20,
  },
  uploadCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  uploadCardStatus: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  uploadBtnBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  uploadBtnBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  submitBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 8px rgba(2, 132, 199, 0.25)',
      } as any,
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
  },
  pendingBadgeCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 6,
  },
  headingCentered: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  subHeadingCentered: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  liveSyncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  greenPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  liveSyncText: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '700',
    flex: 1,
    lineHeight: 15,
  },
  summaryBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  instructionNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 10,
  },
  instructionText: {
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 16,
    flex: 1,
    fontWeight: '500',
  },
});
