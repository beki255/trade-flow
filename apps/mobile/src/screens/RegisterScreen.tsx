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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { apiFetch } from '../utils/api';

interface RegisterScreenProps {
  onBack: () => void;
  onNavigateLogin: () => void;
  onRegisterSuccess: (role: string, user: any) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onBack,
  onNavigateLogin,
  onRegisterSuccess,
}) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 Fields
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Step 2 Fields
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Validate Step 1 -> Step 2
  const handleContinueToStep2 = () => {
    if (!ownerName.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter your mobile phone number.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  // Submit Registration
  const handleRegister = async () => {
    if (!password) {
      setErrorMsg('Please create a password for your account.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const cleanPhone = phone.trim();
    const cleanEmail =
      email && email.trim()
        ? email.trim().toLowerCase()
        : `${cleanPhone.replace(/[^0-9]/g, '') || 'transporter'}@tradeflow.et`;

    const finalCompanyName = companyName.trim() || `${ownerName.trim()} Transport`;

    const userData = {
      fullName: ownerName.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      role: 'TRANSPORTER',
      companyName: finalCompanyName,
      password: password.trim(),
    };

    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.user) {
        onRegisterSuccess('TRANSPORTER', data.user);
      } else {
        setErrorMsg(data.error || 'Registration failed. Please check your data and retry.');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg('Cannot connect to TradeFlow API server. Please check your connection.');
    }
  };

  const handleHeaderBack = () => {
    if (step === 2) {
      setErrorMsg('');
      setStep(1);
    } else {
      onBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F9FD" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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
          <Text style={[styles.brandTitle, { flex: 1 }]}>TradeFlow</Text>
          <LanguageSwitcher variant="light" />
        </View>

        {/* Polished Card */}
        <View style={styles.card}>
          {/* Integrated Modern 2-Segment Stepper */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepperBars}>
              <View style={[styles.stepBar, styles.stepBarActive]} />
              <View
                style={[
                  styles.stepBar,
                  step === 2 ? styles.stepBarActive : styles.stepBarInactive,
                ]}
              />
            </View>
            <View style={styles.stepMetaRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>
                  {step === 1 ? t('step1Of2') || 'Step 1 of 2' : t('step2Of2') || 'Step 2 of 2'}
                </Text>
              </View>
              <Text style={styles.stepMetaTitle}>
                {step === 1
                  ? t('basicInfo') || 'Basic Info'
                  : t('securityAndFleet') || 'Password & Fleet'}
              </Text>
            </View>
          </View>

          {/* Heading */}
          <View style={styles.headingBox}>
            <Text style={styles.screenHeading}>
              {step === 1
                ? t('carrierSignUp') || 'Carrier Sign Up'
                : t('securityAndFleet') || 'Set Password & Fleet'}
            </Text>
            <Text style={styles.screenSubtitle}>
              {step === 1
                ? t('carrierSignUpSub') || 'Enter your name and mobile number to begin.'
                : t('setPasswordSub') || 'Set a secure password for your carrier account.'}
            </Text>
          </View>

          {/* Error Message */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* STEP 1: Basic Identity & Phone */}
          {step === 1 ? (
            <View style={{ gap: 15 }}>
              {/* Owner Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'name' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={focusedField === 'name' ? '#0284C7' : '#64748B'}
                    style={{ marginLeft: 14, marginRight: 8 }}
                  />
                  <TextInput
                    style={styles.cleanInput}
                    value={ownerName}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(val) => {
                      setOwnerName(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="e.g. Sara Haile"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Mobile Phone Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'phone' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="call-outline"
                    size={18}
                    color={focusedField === 'phone' ? '#0284C7' : '#64748B'}
                    style={{ marginLeft: 14, marginRight: 8 }}
                  />
                  <TextInput
                    style={styles.cleanInput}
                    value={phone}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(val) => {
                      setPhone(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="+251 91 123 4567"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Email Address (Optional) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address (Optional)</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'email' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={focusedField === 'email' ? '#0284C7' : '#64748B'}
                    style={{ marginLeft: 14, marginRight: 8 }}
                  />
                  <TextInput
                    style={styles.cleanInput}
                    value={email}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={setEmail}
                    placeholder="sara@tradeflow.et"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="done"
                    onSubmitEditing={handleContinueToStep2}
                  />
                </View>
              </View>

              {/* Continue to Step 2 Button */}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleContinueToStep2}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>{t('continue') || 'Continue ➔'}</Text>
              </TouchableOpacity>

              {/* Switch to Login */}
              <View style={styles.promptRow}>
                <Text style={styles.promptText}>
                  {t('alreadyHaveAccount') || 'Already have an account?'}{' '}
                </Text>
                <TouchableOpacity
                  onPress={onNavigateLogin}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.promptLink}>{t('loginButton') || 'Log In'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* STEP 2: Password & Company Name */
            <View style={{ gap: 15 }}>
              {/* Summary Chip of Step 1 */}
              <View style={styles.summaryBadge}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Ionicons name="checkmark-circle" size={18} color="#0284C7" />
                  <Text style={styles.summaryBadgeText} numberOfLines={1}>
                    {ownerName} • {phone}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setErrorMsg('');
                    setStep(1);
                  }}
                  style={styles.editBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editBtnText}>{t('changeAccount') || 'Edit'}</Text>
                </TouchableOpacity>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Create Password *</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'password' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={focusedField === 'password' ? '#0284C7' : '#64748B'}
                    style={{ marginLeft: 14, marginRight: 8 }}
                  />
                  <TextInput
                    style={styles.cleanInput}
                    value={password}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(val) => {
                      setPassword(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    secureTextEntry={!showPassword}
                    placeholder="Minimum 6 characters"
                    placeholderTextColor="#94A3B8"
                    returnKeyType="next"
                    autoFocus={true}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color={showPassword ? '#0284C7' : '#64748B'}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Transport Company Name (Optional) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Company Name (Optional)</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'company' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="business-outline"
                    size={18}
                    color={focusedField === 'company' ? '#0284C7' : '#64748B'}
                    style={{ marginLeft: 14, marginRight: 8 }}
                  />
                  <TextInput
                    style={styles.cleanInput}
                    value={companyName}
                    onFocus={() => setFocusedField('company')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={setCompanyName}
                    placeholder="e.g. Red Sea Freight (or leave empty)"
                    placeholderTextColor="#94A3B8"
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                  />
                </View>
              </View>

              {/* Submit Registration Button */}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    {t('completeRegistration') || 'Complete Registration ➔'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Back to Step 1 */}
              <TouchableOpacity
                onPress={() => {
                  setErrorMsg('');
                  setStep(1);
                }}
                style={styles.backStepBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={14} color="#64748B" />
                <Text style={styles.backStepText}>{t('backToStep1') || 'Back to Step 1'}</Text>
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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
    zIndex: 100,
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
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.06), 0 4px 6px -2px rgba(15, 23, 42, 0.02)',
      } as any,
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
      },
    }),
  },
  stepperContainer: {
    marginBottom: 16,
    gap: 8,
  },
  stepperBars: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
  },
  stepBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  stepBarActive: {
    backgroundColor: '#0284C7',
  },
  stepBarInactive: {
    backgroundColor: '#E2E8F0',
  },
  stepMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepBadge: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  stepBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0284C7',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepMetaTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  headingBox: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 18,
  },
  screenHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    lineHeight: 16,
  },
  inputGroup: {
    gap: 7,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 50,
  },
  inputWrapperFocused: {
    borderColor: '#0284C7',
    backgroundColor: '#FFFFFF',
  },
  cleanInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 16,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
      } as any,
      default: {
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 4,
      },
    }),
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  promptText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  promptLink: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0284C7',
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  summaryBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369A1',
  },
  editBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  backStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginTop: 2,
  },
  backStepText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
});
