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
import { useTheme } from '../context/ThemeContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeToggle } from '../components/ThemeToggle';
import { apiFetch } from '../utils/api';
import {
  validateEthiopianPhone,
  validatePassword,
  validatePasswordMatch,
  validateEmail,
  validateEthiopianTin,
  validateEthiopianTradeLicense,
} from '../utils/validation';

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
  const { t, language } = useLanguage();
  const { colors, isDark } = useTheme();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 Fields
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Step 2 Fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tin, setTin] = useState('');
  const [tradeLicenseNo, setTradeLicenseNo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 3 OTP Fields
  const [otpCode, setOtpCode] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const startCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Validate Step 1 -> Step 2
  const handleContinueToStep2 = () => {
    if (!ownerName.trim()) {
      setErrorMsg(
        language === 'AM'
          ? 'እባክዎ ሙሉ ህጋዊ ስምዎን ያስገቡ።'
          : language === 'OM'
          ? 'Moo maqaa seera qabeessa keessan guutuu galchaa.'
          : 'Please enter your full legal name.'
      );
      return;
    }
    const phoneRes = validateEthiopianPhone(phone);
    if (!phoneRes.isValid) {
      setErrorMsg(
        phoneRes.error ||
          (language === 'AM'
            ? 'ትክክለኛ የኢትዮጵያ ስልክ ቁጥር (+251 9... / 09... ወይም +251 7... / 07...) ያስገቡ።'
            : language === 'OM'
            ? 'Lakkoofsa bilbila Itoophiyaa sirrii (+251 9... ykn +251 7...) qofa galchaa.'
            : 'Only Ethiopian phone numbers (+251 9... / 09... or +251 7... / 07...) are accepted.')
      );
      return;
    }
    const emailRes = validateEmail(email);
    if (!emailRes.isValid) {
      setErrorMsg(
        emailRes.error ||
          (language === 'AM'
            ? 'የማረጋገጫ ኮድ ለመቀበል ትክክለኛ የኢሜይል አድራሻ ያስገቡ።'
            : language === 'OM'
            ? 'Koodii mirkaneessaa argachuuf teessoo imeelii sirrii galchaa.'
            : 'Please enter a valid email address to receive your confirmation code.')
      );
      return;
    }
    setPhone(phoneRes.normalized || phone.trim());
    setEmail(emailRes.normalized || email.trim());
    setErrorMsg('');
    setStep(2);
  };

  // Validate Step 2 -> Step 3 (Send Registration OTP)
  const handleSendOtp = async () => {
    const passRes = validatePassword(password);
    if (!passRes.isValid) {
      setErrorMsg(
        passRes.error ||
          (language === 'AM'
            ? 'የይለፍ ቃል ቢያንስ 8 ፊደላት፣ ፊደል እና ቁጥር መያዝ አለበት።'
            : language === 'OM'
            ? 'Jechi icchitii yoo xiqqaate arfiilee 8 fi qubee fi lakkoofsa qabaachuu qaba.'
            : 'Password must be at least 8 characters long and contain at least one letter and one number.')
      );
      return;
    }

    const matchRes = validatePasswordMatch(password, confirmPassword);
    if (!matchRes.isValid) {
      setErrorMsg(
        matchRes.error ||
          (language === 'AM'
            ? 'የይለፍ ቃሎቹ አይመሳሰሉም። እባክዎ ማረጋገጫውን ያረጋግጡ።'
            : language === 'OM'
            ? 'Jechoonni icchitii wal hin simne. Jecha mirkaneessaa ilaalaa.'
            : 'Passwords do not match. Please verify confirmation password.')
      );
      return;
    }

    // Optional / Business TIN Validation
    if (tin.trim().length > 0) {
      const tinRes = validateEthiopianTin(tin, true, language as any);
      if (!tinRes.isValid) {
        setErrorMsg(tinRes.error || 'Invalid 10-digit Ethiopian TIN number.');
        return;
      }
    }

    // Optional / Business Trade License Validation
    if (tradeLicenseNo.trim().length > 0) {
      const licRes = validateEthiopianTradeLicense(tradeLicenseNo, true, false, language as any);
      if (!licRes.isValid) {
        setErrorMsg(licRes.error || 'Invalid Trade License Number.');
        return;
      }
    }

    setLoading(true);
    setErrorMsg('');

    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();
    const finalCompanyName = companyName.trim() || `${ownerName.trim()} Transport`;

    const userData = {
      fullName: ownerName.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      role: 'TRANSPORTER',
      companyName: finalCompanyName,
      password: password.trim(),
      tin: tin.trim() || undefined,
      tradeLicenseNo: tradeLicenseNo.trim() || undefined,
    };

    try {
      const res = await apiFetch('/api/auth/register/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setMaskedEmail(data.maskedEmail || cleanEmail);
        if (data.previewOtp) {
          setPreviewOtp(data.previewOtp);
          setOtpCode(data.previewOtp);
        }
        setStep(3);
        startCooldown();
      } else {
        setErrorMsg(
          data.error ||
            (language === 'AM'
              ? 'የማረጋገጫ ኮድ መላክ አልተሳካም። እባክዎ መረጃዎን ይፈትሹ።'
              : language === 'OM'
              ? 'Koodii mirkaneessaa erguun hin danda\'amne. Odeeffannoo keessan ilaalaatii irra deebi\'aa yaalaa.'
              : 'Failed to dispatch verification code. Please check your data and retry.')
        );
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(
        language === 'AM'
          ? 'ከ TradeFlow ሰርቨር ጋር መገናኘት አልተቻለም። እባክዎ ኢንተርኔትዎን ያረጋግጡ።'
          : language === 'OM'
          ? 'Sarvara TradeFlow waliin walqunnamuu hin dandeenye. Walqunnamtii keessan mirkaneessaa.'
          : 'Cannot connect to TradeFlow API server. Please check your connection.'
      );
    }
  };

  // Verify OTP and Complete Registration
  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMsg(
        language === 'AM'
          ? 'እባክዎ ወደ ኢሜይልዎ የተላከውን ባለ 6-አሃዝ የማረጋገጫ ኮድ ያስገቡ።'
          : language === 'OM'
          ? 'Moo koodii mirkaneessaa dijitii 6 gara imeelii keessaniitti ergame galchaa.'
          : 'Please enter the 6-digit verification code sent to your email.'
      );
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await apiFetch('/api/auth/register/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: otpCode.trim(),
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.user) {
        onRegisterSuccess('TRANSPORTER', data.user);
      } else {
        setErrorMsg(
          data.error ||
            (language === 'AM'
              ? 'ትክክል ያልሆነ ወይም ጊዜው ያለፈበት የማረጋገጫ ኮድ። እባክዎ እንደገና ይሞክሩ።'
              : language === 'OM'
              ? 'Koodii mirkaneessaa sirrii hin taane ykn yeroon isaa darbe. Irra deebi\'aa yaalaa.'
              : 'Incorrect or expired verification code. Please try again.')
        );
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(
        language === 'AM'
          ? 'ከ TradeFlow ሰርቨር ጋር መገናኘት አልተቻለም።'
          : language === 'OM'
          ? 'Sarvara TradeFlow waliin walqunnamuu hin dandeenye.'
          : 'Cannot connect to TradeFlow API server. Please check your connection.'
      );
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setErrorMsg('');

    try {
      const res = await apiFetch('/api/auth/register/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      setResendLoading(false);

      if (res.ok) {
        if (data.previewOtp) {
          setPreviewOtp(data.previewOtp);
          setOtpCode(data.previewOtp);
        }
        startCooldown();
      } else {
        setErrorMsg(data.error || 'Failed to resend verification code.');
      }
    } catch (err: any) {
      setResendLoading(false);
      setErrorMsg('Failed to resend verification code. Please check connection.');
    }
  };

  const handleHeaderBack = () => {
    if (step === 3) {
      setErrorMsg('');
      setStep(2);
    } else if (step === 2) {
      setErrorMsg('');
      setStep(1);
    } else {
      onBack();
    }
  };

  const getInputWrapperStyle = (fieldName: string) => [
    styles.inputWrapper,
    {
      backgroundColor: isDark
        ? (focusedField === fieldName ? '#0B1220' : '#1E293B')
        : (focusedField === fieldName ? '#FFFFFF' : '#F8FAFC'),
      borderColor: focusedField === fieldName
        ? '#0284C7'
        : (isDark ? '#334155' : '#CBD5E1'),
    },
  ];

  const getIconColor = (fieldName: string) =>
    focusedField === fieldName ? '#0284C7' : (isDark ? '#94A3B8' : '#64748B');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={handleHeaderBack}
          style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.7}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        {/* Absolute Mathematically Centered Title */}
        <View style={styles.brandTitleContainer} pointerEvents="none">
          <Text style={[styles.brandTitle, { color: colors.text }]}>TradeFlow</Text>
        </View>

        <View style={styles.rightActions}>
          <LanguageSwitcher dark={isDark} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Sleek, Open Container (Telebirr style) */}
        <View style={styles.formContainer}>
          {/* Title Area inspired by Telebirr */}
          <View style={styles.titleSection}>
            <View style={styles.mainTitleRow}>
              <Text style={[styles.mainTitleText, { color: colors.text }]}>
                {t('register') || 'Register'}
              </Text>
              <View style={styles.accentLine} />
            </View>
            <Text style={[styles.roleSubTag, { color: colors.textMuted }]}>
              {t('transporterPortal') || 'Transporter Portal'}
            </Text>
          </View>

          {/* Driver notice note in step 1 */}
          {step === 1 && (
            <View style={[styles.driverNoticeBox, { backgroundColor: isDark ? '#0B1220' : '#F0F9FF', borderColor: isDark ? '#0284C7' : '#BAE6FD' }]}>
              <Ionicons name="information-circle" size={14} color="#0284C7" />
              <Text
                style={[styles.driverNoticeText, { color: isDark ? '#93C5FD' : '#0369A1' }]}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                {t('driversAddedByCompanyNote') || 'Drivers are registered by their Transporter.'}
              </Text>
            </View>
          )}

          {/* Integrated Modern 3-Segment Stepper */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepperBars}>
              <View style={[styles.stepBar, styles.stepBarActive]} />
              <View
                style={[
                  styles.stepBar,
                  step >= 2 ? styles.stepBarActive : { backgroundColor: isDark ? '#334155' : '#E2E8F0' },
                ]}
              />
              <View
                style={[
                  styles.stepBar,
                  step === 3 ? styles.stepBarActive : { backgroundColor: isDark ? '#334155' : '#E2E8F0' },
                ]}
              />
            </View>
            <View style={styles.stepMetaRow}>
              <Text style={[styles.stepMetaTitle, { color: colors.textMuted }]}>
                {step === 1
                  ? (language === 'AM'
                      ? 'ደረጃ 1 ከ 3፦ መሰረታዊ መረጃ'
                      : language === 'OM'
                      ? 'Sadarkaa 1ffaa: Odeeffannoo Bu\'uuraa'
                      : `Step 1 of 3: ${t('basicInfo') || 'Basic Info'}`)
                  : step === 2
                  ? (language === 'AM'
                      ? 'ደረጃ 2 ከ 3፦ የይለፍ ቃል እና ድርጅት'
                      : language === 'OM'
                      ? 'Sadarkaa 2ffaa: Jecha Icchitii & Dhaabbata'
                      : `Step 2 of 3: ${t('securityAndFleet') || 'Password & Fleet'}`)
                  : (language === 'AM'
                      ? 'ደረጃ 3 ከ 3፦ የኢሜይል ማረጋገጫ'
                      : language === 'OM'
                      ? 'Sadarkaa 3ffaa: Mirkaneessa Imeelii'
                      : 'Step 3 of 3: Email Verification')}
              </Text>
            </View>
          </View>

          {/* Error Message */}
          {errorMsg ? (
            <View style={[styles.errorBox, isDark && { backgroundColor: '#450A0A', borderColor: '#991B1B' }]}>
              <Ionicons name="alert-circle" size={16} color={isDark ? '#FCA5A5' : '#DC2626'} style={{ marginRight: 6 }} />
              <Text style={[styles.errorText, isDark && { color: '#FCA5A5' }]}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* STEP 1: Basic Identity & Phone */}
          {step === 1 ? (
            <View style={{ gap: 15 }}>
              {/* Owner Full Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {language === 'AM' ? 'ሙሉ ስም *' : language === 'OM' ? 'Maqaa Guutuu *' : 'Full Name *'}
                </Text>
                <View style={getInputWrapperStyle('name')}>
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={getIconColor('name')}
                    style={{ marginLeft: 14, marginRight: 8 }}
                  />
                  <TextInput
                    style={[styles.cleanInput, { color: colors.text }]}
                    value={ownerName}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(val) => {
                      setOwnerName(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder={t('fullName') || (language === 'AM' ? 'ሙሉ ስም' : language === 'OM' ? 'Maqaa Guutuu' : 'Full Name')}
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Mobile Phone Number */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {t('phoneNumber') || (language === 'AM' ? 'ስልክ ቁጥር' : language === 'OM' ? 'Lakkoofsa Bilbilaa' : 'Phone Number')} *
                </Text>
                <View style={getInputWrapperStyle('phone')}>
                  <Ionicons
                    name="call-outline"
                    size={18}
                    color={getIconColor('phone')}
                    style={{ marginLeft: 14, marginRight: 8 }}
                  />
                  <TextInput
                    style={[styles.cleanInput, { color: colors.text }]}
                    value={phone}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(val) => {
                      setPhone(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder={t('phoneNumber') || (language === 'AM' ? 'ስልክ ቁጥር' : language === 'OM' ? 'Lakkoofsa Bilbilaa' : 'Phone Number')}
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Email Address */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {t('emailAddress') || (language === 'AM' ? 'የኢሜይል አድራሻ' : language === 'OM' ? 'Teessoo Imeelii' : 'Email Address')} *
                </Text>
                <View style={getInputWrapperStyle('email')}>
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={getIconColor('email')}
                    style={{ marginLeft: 14, marginRight: 8 }}
                  />
                  <TextInput
                    style={[styles.cleanInput, { color: colors.text }]}
                    value={email}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={setEmail}
                    placeholder={t('emailAddress') || (language === 'AM' ? 'የኢሜይል አድራሻ' : language === 'OM' ? 'Teessoo Imeelii' : 'Email Address')}
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
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
                <Text style={styles.primaryBtnText}>
                  {language === 'AM' ? 'ቀጥል ➔' : language === 'OM' ? 'Itti Fufi ➔' : (t('continue') || 'Continue ➔')}
                </Text>
              </TouchableOpacity>

              {/* Switch to Login */}
              <View style={styles.promptRow}>
                <Text style={[styles.promptText, { color: colors.textMuted }]}>
                  {t('alreadyHaveAccount') || (language === 'AM' ? 'መለያ አለዎት?' : language === 'OM' ? 'Herrega qabduu?' : 'Already have an account?')}{' '}
                </Text>
                <TouchableOpacity
                  onPress={onNavigateLogin}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.promptLink}>{t('loginButton') || (language === 'AM' ? 'ይግቡ' : language === 'OM' ? 'Gali' : 'Log In')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : step === 2 ? (
            /* STEP 2: Password & Company Name */
            <View style={{ gap: 15 }}>
              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {language === 'AM' ? 'አዲስ የይለፍ ቃል ፍጠር *' : language === 'OM' ? 'Jecha Icchitii Uumi *' : 'Create Password *'}
                </Text>
                <View style={getInputWrapperStyle('password')}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={getIconColor('password')}
                    style={{ marginLeft: 14, marginRight: 8 }}
                  />
                  <TextInput
                    style={[styles.cleanInput, { color: colors.text }]}
                    value={password}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(val) => {
                      setPassword(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    secureTextEntry={!showPassword}
                    placeholder={t('password') || (language === 'AM' ? 'የይለፍ ቃል' : language === 'OM' ? 'Jecha Icchitii' : 'Password')}
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
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
                      color={showPassword ? '#0284C7' : (isDark ? '#94A3B8' : '#64748B')}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {t('confirmPassword') || (language === 'AM' ? 'የይለፍ ቃል ማረጋገጫ' : language === 'OM' ? 'Jecha Icchitii Mirkaneessi' : 'Confirm Password')} *
                </Text>
                <View style={getInputWrapperStyle('confirmPassword')}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={getIconColor('confirmPassword')}
                    style={{ marginLeft: 14, marginRight: 8 }}
                  />
                  <TextInput
                    style={[styles.cleanInput, { color: colors.text }]}
                    value={confirmPassword}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(val) => {
                      setConfirmPassword(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    secureTextEntry={!showConfirmPassword}
                    placeholder={t('confirmPassword') || (language === 'AM' ? 'የይለፍ ቃል ማረጋገጫ' : language === 'OM' ? 'Jecha Icchitii Mirkaneessi' : 'Confirm Password')}
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    returnKeyType="next"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color={showConfirmPassword ? '#0284C7' : (isDark ? '#94A3B8' : '#64748B')}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Transport Company Name (Optional) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {t('companyName') || (language === 'AM' ? 'የድርጅት ስም' : language === 'OM' ? 'Maqaa Dhaabbataa' : 'Company Name')} {language === 'AM' ? '(አማራጭ)' : language === 'OM' ? '(Filannoo)' : '(Optional)'}
                </Text>
                <View style={getInputWrapperStyle('company')}>
                  <Ionicons
                    name="business-outline"
                    size={18}
                    color={getIconColor('company')}
                    style={{ marginLeft: 14, marginRight: 8 }}
                  />
                  <TextInput
                    style={[styles.cleanInput, { color: colors.text }]}
                    value={companyName}
                    onFocus={() => setFocusedField('company')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={setCompanyName}
                    placeholder={t('companyName') || (language === 'AM' ? 'የድርጅት ስም' : language === 'OM' ? 'Maqaa Dhaabbataa' : 'Company Name')}
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* TIN (Tax ID) Number */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {language === 'AM' ? 'TIN (የግብር ከፋይ መለያ)' : language === 'OM' ? 'Lakkoofsa TIN (Gibiraa)' : 'TIN (Tax ID)'} {language === 'AM' ? '(አማራጭ)' : language === 'OM' ? '(Filannoo)' : '(Optional)'}
                </Text>
                <View style={getInputWrapperStyle('tin')}>
                  <Ionicons
                    name="card-outline"
                    size={18}
                    color={getIconColor('tin')}
                    style={{ marginLeft: 14, marginRight: 8 }}
                  />
                  <TextInput
                    style={[styles.cleanInput, { color: colors.text }]}
                    value={tin}
                    onFocus={() => setFocusedField('tin')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={setTin}
                    placeholder="0098473621"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    keyboardType="numeric"
                    maxLength={10}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Trade License / Registration No */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {language === 'AM' ? 'የንግድ ፈቃድ / ምዝገባ ቁጥር' : language === 'OM' ? 'Heyyama Daldalaa / Lakk. Galmee' : 'Trade License / Reg No'} {language === 'AM' ? '(አማራጭ)' : language === 'OM' ? '(Filannoo)' : '(Optional)'}
                </Text>
                <View style={getInputWrapperStyle('tradeLicense')}>
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color={getIconColor('tradeLicense')}
                    style={{ marginLeft: 14, marginRight: 8 }}
                  />
                  <TextInput
                    style={[styles.cleanInput, { color: colors.text }]}
                    value={tradeLicenseNo}
                    onFocus={() => setFocusedField('tradeLicense')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={setTradeLicenseNo}
                    placeholder="ETH-MOTI-2024-99"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    autoCapitalize="characters"
                    returnKeyType="done"
                    onSubmitEditing={handleSendOtp}
                  />
                </View>
              </View>

              {/* Submit to Send OTP Button */}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleSendOtp}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    {language === 'AM' ? 'ወደ ማረጋገጫ ይቀጥሉ ➔' : language === 'OM' ? 'Gara Mirkaneessaatti Furi ➔' : 'Continue to Verification ➔'}
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
                <Ionicons name="arrow-back" size={14} color={colors.textMuted} />
                <Text style={[styles.backStepText, { color: colors.textMuted }]}>
                  {language === 'AM' ? '← ወደ ደረጃ 1 ተመለስ' : language === 'OM' ? '← Gara Sadarkaa 1ffaa Deebi\'i' : (t('backToStep1') || 'Back to Step 1')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* STEP 3: Email OTP Verification */
            <View style={{ gap: 16 }}>
              {/* Summary Chip */}
              <View style={[styles.summaryBadge, { backgroundColor: isDark ? '#1E293B' : '#F0F9FF', borderColor: isDark ? '#334155' : '#BAE6FD' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Ionicons name="mail" size={18} color="#0284C7" />
                  <Text style={[styles.summaryBadgeText, { color: isDark ? '#38BDF8' : '#0369A1' }]} numberOfLines={1}>
                    {language === 'AM' ? 'ኮድ ወደ ' : language === 'OM' ? 'Koodiin gara ' : 'Code sent to '}
                    {maskedEmail || email}
                    {language === 'AM' ? ' ተልኳል' : language === 'OM' ? 'tti ergameera' : ''}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setErrorMsg('');
                    setStep(1);
                  }}
                  style={[styles.editBtn, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF', borderColor: isDark ? '#0284C7' : '#BAE6FD' }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.editBtnText, { color: isDark ? '#38BDF8' : '#0284C7' }]}>
                    {language === 'AM' ? 'ቀይር' : language === 'OM' ? 'Gulaali' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              </View>

              {previewOtp ? (
                <View style={[styles.errorBox, { backgroundColor: isDark ? '#082F49' : '#E0F2FE', borderColor: isDark ? '#0284C7' : '#BAE6FD', marginBottom: 12 }]}>
                  <Ionicons name="key-outline" size={16} color="#0284C7" style={{ marginRight: 6 }} />
                  <Text style={[styles.errorText, { color: isDark ? '#BAE6FD' : '#0369A1' }]}>
                    Verification Code: <Text style={{ fontWeight: '900', letterSpacing: 2 }}>{previewOtp}</Text>
                  </Text>
                </View>
              ) : null}

              {/* OTP Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { textAlign: 'center', color: colors.text }]}>
                  {language === 'AM' ? 'ባለ 6-አሃዝ የማረጋገጫ ኮድ' : language === 'OM' ? 'Koodii Mirkaneessaa Dijitii 6' : '6-Digit Verification Code'}
                </Text>
                <View style={[getInputWrapperStyle('otp'), { height: 56, justifyContent: 'center' }]}>
                  <TextInput
                    style={[
                      styles.cleanInput,
                      {
                        color: colors.text,
                        textAlign: 'center',
                        fontSize: 24,
                        fontWeight: '900',
                        letterSpacing: 8,
                        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                      },
                    ]}
                    value={otpCode}
                    onFocus={() => setFocusedField('otp')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(val) => {
                      setOtpCode(val.replace(/[^0-9]/g, ''));
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="••••••"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus={true}
                    returnKeyType="done"
                    onSubmitEditing={handleVerifyOtp}
                  />
                </View>
              </View>

              {/* Resend Cooldown */}
              <View style={{ alignItems: 'center', marginVertical: 4 }}>
                {resendCooldown > 0 ? (
                  <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '600' }}>
                    {language === 'AM'
                      ? `ኮድ እንደገና ላክ በ `
                      : language === 'OM'
                      ? `Koodii irra deebi'ii ergi `
                      : 'Resend code in '}
                    <Text style={{ color: colors.text, fontWeight: '800' }}>{resendCooldown}s</Text>
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={resendLoading}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                  >
                    <Ionicons name="refresh" size={14} color="#0284C7" />
                    <Text style={{ fontSize: 13, color: '#0284C7', fontWeight: '700' }}>
                      {resendLoading
                        ? (language === 'AM' ? 'በመላክ ላይ...' : language === 'OM' ? 'Ergaa jira...' : 'Sending...')
                        : (language === 'AM' ? 'የማረጋገጫ ኮድ በድጋሚ ላክ' : language === 'OM' ? 'Koodii Mirkaneessaa Irra Deebi\'i Ergi' : 'Resend Verification Code')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Submit button */}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleVerifyOtp}
                disabled={loading || otpCode.trim().length !== 6}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    {language === 'AM' ? 'አረጋግጥ እና ምዝገባን አጠናቅቅ ➔' : language === 'OM' ? 'Mirkaneessi & Galmee Xumuri ➔' : 'Verify & Complete Registration ➔'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Back to Step 2 */}
              <TouchableOpacity
                onPress={() => {
                  setErrorMsg('');
                  setStep(2);
                }}
                style={styles.backStepBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={14} color={colors.textMuted} />
                <Text style={[styles.backStepText, { color: colors.textMuted }]}>
                  {language === 'AM' ? '← ወደ ይለፍ ቃል ተመለስ' : language === 'OM' ? '← Gara Jecha Icchitiitti Deebi\'i' : 'Back to Password'}
                </Text>
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
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
    flexGrow: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? Math.max((StatusBar.currentHeight || 0) + 14, 48) : 12,
    paddingBottom: 12,
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
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  formContainer: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  roleSubTag: {
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 8,
  },
  mainTitleRow: {
    alignItems: 'center',
  },
  mainTitleText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  accentLine: {
    width: 40,
    height: 3,
    backgroundColor: '#0284C7',
    borderRadius: 2,
    marginTop: 4,
  },
  stepperContainer: {
    marginBottom: 14,
    gap: 6,
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
    justifyContent: 'center',
  },
  stepMetaTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  driverNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
    borderWidth: 1,
    marginBottom: 12,
  },
  driverNoticeText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
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
  inputWrapperFocused: {
    borderColor: '#0284C7',
    backgroundColor: '#FFFFFF',
  },
  cleanInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontSize: 13.5,
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
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
      } as any,
      default: {
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  promptText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  promptLink: {
    fontSize: 12,
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
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  summaryBadgeText: {
    fontSize: 12.5,
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
