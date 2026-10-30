import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { lightColors } from '../../context/ThemeContext';
import { apiFetch } from '../../utils/api';
import { validatePassword, validatePasswordMatch } from '../../utils/validation';

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  defaultIdentifier?: string;
  onResetSuccess?: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  visible,
  onClose,
  defaultIdentifier = '',
  onResetSuccess,
}) => {
  const { t, language } = useLanguage();
  const isDark = false;
  const colors = lightColors;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState(defaultIdentifier);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [token, setToken] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleRequestCode = async () => {
    setErrorMsg('');
    setSuccessNotice('');

    if (!identifier.trim()) {
      setErrorMsg(
        language === 'AM'
          ? 'እባክዎ የተመዘገበውን ኢሜይል ወይም የኢትዮጵያ ስልክ ቁጥር ያስገቡ።'
          : language === 'OM'
          ? 'Moo qoodama galmaa\'ee ykn lakkoofsa bilbila Itoophiyaa galchaa.'
          : 'Please enter your registered email address or Ethiopian phone number.'
      );
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErrorMsg(
          data.error ||
            (language === 'AM'
              ? 'የማረጋገጫ ኮድ መላክ አልተሳካም።'
              : language === 'OM'
              ? 'Koodii mirkaneessaa erguun hin danda\'amne.'
              : 'Failed to dispatch verification code.')
        );
        return;
      }

      setMaskedEmail(data.maskedEmail || identifier);
      setToken(data.token || '');
      setStep(2);
      setSuccessNotice(
        data.message ||
          (language === 'AM'
            ? 'የማረጋገጫ ኮድ ወደ ኢሜይልዎ ተልኳል።'
            : language === 'OM'
            ? 'Koodiin mirkaneessaa gara imeelii keessaniitti ergameera.'
            : 'Verification code dispatched to your email.')
      );

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

    } catch (err) {
      setLoading(false);
      setErrorMsg(
        language === 'AM'
          ? 'ከ TradeFlow ሰርቨር ጋር መገናኘት አልተቻለም። እባክዎ ኢንተርኔትዎን ያረጋግጡ።'
          : language === 'OM'
          ? 'Sarvara TradeFlow waliin walqunnamuu hin dandeenye. Walqunnamtii tooraa keessan mirkaneessaa.'
          : 'Cannot connect to TradeFlow API server. Please check your connection.'
      );
    }
  };

  const handleResetPassword = async () => {
    setErrorMsg('');

    if (!code.trim() || code.trim().length !== 6) {
      setErrorMsg(
        language === 'AM'
          ? 'እባክዎ ወደ ኢሜይልዎ የተላከውን ባለ 6-አሃዝ የማረጋገጫ ኮድ ያስገቡ።'
          : language === 'OM'
          ? 'Moo koodii mirkaneessaa dijitii 6 gara imeelii keessaniitti ergame galchaa.'
          : 'Please enter the 6-digit verification code sent to your email.'
      );
      return;
    }

    const passRes = validatePassword(newPassword);
    if (!passRes.isValid) {
      setErrorMsg(
        passRes.error ||
          (language === 'AM'
            ? 'የይለፍ ቃል ቢያንስ 8 ፊደላት፣ ፊደል እና ቁጥር መያዝ አለበት።'
            : language === 'OM'
            ? 'Jechi icchitii yoo xiqqaate arfiilee 8 fi qubee fi lakkoofsa qabaachuu qaba.'
            : 'Password must be at least 8 characters with a letter and a number.')
      );
      return;
    }

    const matchRes = validatePasswordMatch(newPassword, confirmPassword);
    if (!matchRes.isValid) {
      setErrorMsg(
        matchRes.error ||
          (language === 'AM'
            ? 'የይለፍ ቃሎቹ አይመሳሰሉም።'
            : language === 'OM'
            ? 'Jechoonni icchitii wal hin simne.'
            : 'Passwords do not match.')
      );
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          code: code.trim(),
          token,
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErrorMsg(
          data.error ||
            (language === 'AM'
              ? 'የይለፍ ቃል ዳግም ማስጀመር አልተሳካም። እባክዎ ኮድዎን ያረጋግጡ።'
              : language === 'OM'
              ? 'Jecha icchitii haaromsuun hin danda\'amne. Koodii keessan mirkaneessaa.'
              : 'Failed to reset password. Please check your code.')
        );
        return;
      }

      setStep(3);
      if (onResetSuccess) {
        onResetSuccess();
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(
        language === 'AM'
          ? 'የይለፍ ቃል ሲቀየር የኔትወርክ ስህተት አጋጥሟል።'
          : language === 'OM'
          ? 'Dogoggora tooraa yeroo jecha icchitii jijjiiruu.'
          : 'Connection error during password reset.'
      );
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0 || loading) return;
    handleRequestCode();
  };

  const handleClose = () => {
    setStep(1);
    setErrorMsg('');
    setSuccessNotice('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Header Close Button */}
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color={colors.text} />
          </TouchableOpacity>

          {/* STEP 1: Enter Identifier */}
          {step === 1 && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              <View style={styles.topIconBox}>
                <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1E293B' : '#E0F2FE' }]}>
                  <Ionicons name="key-outline" size={24} color="#0284C7" />
                </View>
                <Text style={[styles.title, { color: colors.text }]}>
                  {language === 'AM' ? 'የይለፍ ቃል ዳግም ማስጀመር' : language === 'OM' ? 'Jecha Icchitii Haaromsuu' : 'Reset Password'}
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  {language === 'AM'
                    ? 'ባለ 6-አሃዝ የማረጋገጫ ኮድ ለመቀበል ኢሜይልዎን ወይም ስልክ ቁጥርዎን ያስገቡ።'
                    : language === 'OM'
                    ? 'Koodii mirkaneessaa dijitii 6 argachuuf imeelii ykn bilbila keessan galchaa.'
                    : 'Enter your email or phone to receive a 6-digit verification code.'}
                </Text>
              </View>

              {errorMsg ? (
                <View style={[styles.errorBox, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2' }]}>
                  <Ionicons name="alert-circle" size={16} color="#EF4444" />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {language === 'AM' ? 'የኢሜይል አድራሻ ወይም ስልክ ቁጥር' : language === 'OM' ? 'Teessoo Imeelii ykn Bilbilaa' : 'Email Address or Phone Number'}
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                  ]}
                >
                  <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder={t('emailOrPhoneNumber') || (language === 'AM' ? 'ኢሜይል ወይም ስልክ ቁጥር' : language === 'OM' ? 'Imeelii ykn bilbila' : 'Email or phone number')}
                    placeholderTextColor={colors.textMuted}
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                onPress={handleRequestCode}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    {language === 'AM' ? 'የማረጋገጫ ኮድ ላክ ➔' : language === 'OM' ? 'Koodii Mirkaneessaa Ergi ➔' : 'Send Reset Code ➔'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* STEP 2: Enter Code & New Password */}
          {step === 2 && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              <View style={styles.topIconBox}>
                <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1E293B' : '#E0F2FE' }]}>
                  <Ionicons name="shield-checkmark-outline" size={24} color="#0284C7" />
                </View>
                <Text style={[styles.title, { color: colors.text }]}>
                  {language === 'AM' ? 'የማረጋገጫ ኮዱን ያስገቡ' : language === 'OM' ? 'Koodii Mirkaneessaa Galchaa' : 'Enter Verification Code'}
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  {language === 'AM' ? 'የተላከው ወደ፦ ' : language === 'OM' ? 'Kan ergame gara: ' : 'Dispatched to '}
                  <Text style={{ fontWeight: '800', color: colors.text }}>{maskedEmail}</Text>
                </Text>
              </View>

              {successNotice ? (
                <View style={[styles.successBox, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }]}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.successText}>{successNotice}</Text>
                </View>
              ) : null}

              {errorMsg ? (
                <View style={[styles.errorBox, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2' }]}>
                  <Ionicons name="alert-circle" size={16} color="#EF4444" />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              {/* 6-Digit Code */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {language === 'AM' ? 'ባለ 6-አሃዝ ኮድ' : language === 'OM' ? 'Koodii Dijitii 6' : '6-Digit Code'}
                </Text>
                <TextInput
                  style={[
                    styles.otpInput,
                    { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.border, color: colors.text },
                  ]}
                  placeholder="123456"
                  placeholderTextColor={colors.textMuted}
                  value={code}
                  onChangeText={(val) => setCode(val.replace(/[^0-9]/g, ''))}
                  maxLength={6}
                  keyboardType="number-pad"
                  textAlign="center"
                />
              </View>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {t('newPassword') || (language === 'AM' ? 'አዲስ የይለፍ ቃል' : language === 'OM' ? 'Jecha Icchitii Haaraa' : 'New Password')}
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                  ]}
                >
                  <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder={t('newPassword') || (language === 'AM' ? 'አዲስ የይለፍ ቃል' : language === 'OM' ? 'Jecha Icchitii Haaraa' : 'New Password')}
                    placeholderTextColor={colors.textMuted}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {t('confirmPassword') || (language === 'AM' ? 'አዲሱን የይለፍ ቃል ያረጋግጡ' : language === 'OM' ? 'Jecha Icchitii Haaraa Mirkaneessaa' : 'Confirm New Password')}
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                  ]}
                >
                  <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder={t('confirmPassword') || (language === 'AM' ? 'የይለፍ ቃል ማረጋገጫ' : language === 'OM' ? 'Jecha Icchitii Mirkaneessi' : 'Confirm Password')}
                    placeholderTextColor={colors.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
                    <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 10 }]}
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    {language === 'AM' ? 'አዲሱን የይለፍ ቃል መዝግብ ➔' : language === 'OM' ? 'Jecha Icchitii Haaraa Kaa\'i ➔' : 'Set New Password ➔'}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendRow}>
                <TouchableOpacity onPress={() => setStep(1)}>
                  <Text style={[styles.linkText, { color: colors.textMuted }]}>
                    {language === 'AM' ? '← ኢሜይል ቀይር' : language === 'OM' ? '← Imeelii Jijjiiri' : '← Change Email'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0 || loading}>
                  <Text style={[styles.linkText, { color: colors.primary, fontWeight: '700' }]}>
                    {resendCooldown > 0
                      ? (language === 'AM' ? `እንደገና ላክ (${resendCooldown}ሰ)` : language === 'OM' ? `Irra deebi'ii (${resendCooldown}s)` : `Resend (${resendCooldown}s)`)
                      : (language === 'AM' ? 'ኮድ በድጋሚ ላክ' : language === 'OM' ? 'Koodii Irra Deebi\'i Ergi' : 'Resend Code')}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {/* STEP 3: Success Screen */}
          {step === 3 && (
            <View style={styles.successContainer}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-circle" size={44} color="#10B981" />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {language === 'AM' ? 'የይለፍ ቃል መቀየር ተጠናቋል!' : language === 'OM' ? 'Jecha Icchitii Jijjiiruun Xumurameera!' : 'Password Reset Complete!'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {language === 'AM'
                  ? 'የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል። አሁን ወደ TradeFlow መለያዎ መግባት ይችላሉ።'
                  : language === 'OM'
                  ? 'Jechi icchitii keessan milkaa\'inaan jijjiirameera. Amma gara herrega TradeFlow keessanitti galuu dandeessu.'
                  : 'Your password has been securely updated in the database. You can now log into your TradeFlow account.'}
              </Text>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: '#10B981', marginTop: 18 }]}
                onPress={handleClose}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>
                  {language === 'AM' ? 'ወደ መግቢያ ይቀጥሉ ➔' : language === 'OM' ? 'Gara Seensaatti Furi ➔' : 'Proceed to Login ➔'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    borderWidth: 1,
    padding: 22,
    position: 'relative',
    ...Platform.select({
      web: { boxShadow: '0 20px 40px rgba(0,0,0,0.3)' } as any,
      default: { elevation: 12 },
    }),
  },
  scrollBody: {
    paddingVertical: 4,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  topIconBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    flex: 1,
    fontWeight: '600',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  successText: {
    fontSize: 12,
    color: '#10B981',
    flex: 1,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    height: '100%',
  },
  otpInput: {
    borderWidth: 1,
    borderRadius: 14,
    height: 48,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 8,
  },
  eyeBtn: {
    padding: 4,
  },
  primaryBtn: {
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingHorizontal: 4,
  },
  linkText: {
    fontSize: 12,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
});
