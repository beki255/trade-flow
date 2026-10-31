import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { lightColors } from '../context/ThemeContext';
import { apiFetch } from '../utils/api';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { validateEthiopianPhone, validateEmail } from '../utils/validation';
import { ForgotPasswordModal } from './modals/ForgotPasswordModal';

interface LoginScreenProps {
  onBack: () => void;
  onNavigateRegister: () => void;
  onLoginSuccess: (role: string, user: any) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onBack,
  onNavigateRegister,
  onLoginSuccess,
}) => {
  const { t } = useLanguage();
  const isDark = false;
  const colors = lightColors;
  const [identifier, setIdentifier] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem('tradeflow_mobile_remembered_identifier') || '';
      } catch (e) {
        return '';
      }
    }
    return '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem('tradeflow_mobile_remember_me');
        return saved !== null ? saved === 'true' : true;
      } catch (e) {
        return true;
      }
    }
    return true;
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'identifier' | 'password' | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const passwordInputRef = useRef<TextInput>(null);

  // Submit Login
  const handleSubmit = async () => {
    const trimmed = identifier.trim();
    if (!trimmed) {
      setErrorMsg(t('requiredFields') || 'Please enter your phone number or email.');
      return;
    }
    if (!password) {
      setErrorMsg(t('requiredFields') || 'Please enter your password.');
      return;
    }

    // Validate whether identifier is email or Ethiopian phone number
    let finalIdentifier = trimmed;
    if (trimmed.includes('@')) {
      const emailRes = validateEmail(trimmed);
      if (!emailRes.isValid) {
        setErrorMsg(emailRes.error || 'Please enter a valid email address.');
        return;
      }
      finalIdentifier = emailRes.normalized || trimmed;
    } else {
      const phoneRes = validateEthiopianPhone(trimmed);
      if (!phoneRes.isValid) {
        setErrorMsg(phoneRes.error || 'Only Ethiopian phone numbers (+251 9... / 09... or +251 7... / 07...) are accepted.');
        return;
      }
      finalIdentifier = phoneRes.normalized || trimmed;
      setIdentifier(finalIdentifier);
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: finalIdentifier, password }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.user) {
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            if (rememberMe) {
              window.localStorage.setItem('tradeflow_mobile_remembered_identifier', finalIdentifier);
              window.localStorage.setItem('tradeflow_mobile_remember_me', 'true');
            } else {
              window.localStorage.removeItem('tradeflow_mobile_remembered_identifier');
              window.localStorage.setItem('tradeflow_mobile_remember_me', 'false');
            }
          } catch (e) {}
        }
        onLoginSuccess(data.user.role, data.user);
        return;
      }

      setErrorMsg(data.error || 'Invalid credentials. Please verify and try again.');
    } catch (err) {
      setLoading(false);
      setErrorMsg('Cannot connect to backend server. Please verify your connection.');
    }
  };

  const handleHeaderBack = () => {
    onBack();
  };

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
          <LanguageSwitcher dark={false} />
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
                {t('loginButton') || 'Login'}
              </Text>
              <View style={styles.accentLine} />
            </View>
            <Text style={[styles.roleSubTag, { color: colors.textMuted }]}>
              {t('driverAndTransporter') || 'Driver & Transporter'}
            </Text>
          </View>

          {/* Error Message Box */}
          {errorMsg ? (
            <View style={[styles.errorBox, isDark && { backgroundColor: '#450A0A', borderColor: '#991B1B' }]}>
              <Ionicons name="alert-circle" size={16} color={isDark ? '#FCA5A5' : '#DC2626'} style={{ marginRight: 6 }} />
              <Text style={[styles.errorText, isDark && { color: '#FCA5A5' }]}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={{ gap: 14 }}>
            {/* Phone or Email Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t('phoneOrEmail')}</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDark
                      ? (focusedInput === 'identifier' ? '#0B1220' : colors.inputBg)
                      : (focusedInput === 'identifier' ? '#FFFFFF' : colors.inputBg),
                    borderColor: focusedInput === 'identifier' ? '#0284C7' : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={18}
                  color={focusedInput === 'identifier' ? '#0284C7' : colors.textMuted}
                  style={{ marginLeft: 14, marginRight: 8 }}
                />
                <TextInput
                  style={[styles.cleanInput, { color: colors.text }]}
                  value={identifier}
                  onFocus={() => setFocusedInput('identifier')}
                  onBlur={() => setFocusedInput(null)}
                  onChangeText={(val) => {
                    setIdentifier(val);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder={t('emailOrPhoneNumber') || 'Email or phone number'}
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                />
                {identifier.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setIdentifier('')}
                    style={{ padding: 10 }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close-circle" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t('password')}</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDark
                      ? (focusedInput === 'password' ? '#0B1220' : colors.inputBg)
                      : (focusedInput === 'password' ? '#FFFFFF' : colors.inputBg),
                    borderColor: focusedInput === 'password' ? '#0284C7' : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={focusedInput === 'password' ? '#0284C7' : colors.textMuted}
                  style={{ marginLeft: 14, marginRight: 8 }}
                />
                <TextInput
                  ref={passwordInputRef}
                  style={[styles.cleanInput, { color: colors.text }]}
                  value={password}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMsg) setErrorMsg('');
                  }}
                  secureTextEntry={!showPassword}
                  placeholder={t('password') || 'Password'}
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
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
                    color={showPassword ? '#0284C7' : colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.rememberRow}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                </View>
                <Text style={styles.rememberText}>{t('rememberMe')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowForgotModal(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
              </TouchableOpacity>
            </View>

            {/* Log In Button */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>{t('loginButton') || 'Log In ➔'}</Text>
              )}
            </TouchableOpacity>

            {/* Switch to Register as Transporter */}
            <View style={styles.promptRow}>
              <Text style={[styles.promptText, { color: colors.textMuted }]}>{t('noAccount')} </Text>
              <TouchableOpacity onPress={onNavigateRegister} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.promptLink}>{t('signUpAsTransporter') || 'Sign Up as Transporter'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        visible={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultIdentifier={identifier}
        onResetSuccess={() => {
          setErrorMsg('');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
    paddingBottom: 40,
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 20,
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#DC2626',
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
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  rememberText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
  },
  forgotText: {
    fontSize: 11.5,
    color: '#0284C7',
    fontWeight: '800',
  },
});
