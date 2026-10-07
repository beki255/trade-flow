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
import { apiFetch } from '../utils/api';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

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
  const [step, setStep] = useState<'IDENTIFIER' | 'PASSWORD'>('IDENTIFIER');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const passwordInputRef = useRef<TextInput>(null);

  // Step 1 -> Step 2
  const handleContinue = () => {
    const trimmed = identifier.trim();
    if (!trimmed) {
      setErrorMsg(t('requiredFields') || 'Please enter your phone number or email.');
      return;
    }
    setErrorMsg('');
    setStep('PASSWORD');
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 150);
  };

  // Step 2 -> Submit Login
  const handleSubmit = async () => {
    if (!password) {
      setErrorMsg(t('requiredFields') || 'Please enter your password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.user) {
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
    if (step === 'PASSWORD') {
      setErrorMsg('');
      setStep('IDENTIFIER');
    } else {
      onBack();
    }
  };

  const handleGoogleLogin = async () => {
    const clientId =
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
      '134488171607-3numfgilpa83d4p2d87gb9s7cjlgml4i.apps.googleusercontent.com';
    const redirectUri =
      typeof window !== 'undefined' && window?.location?.origin
        ? window.location.origin
        : 'http://localhost:8081';
    const scope = encodeURIComponent('openid email profile');
    const state = encodeURIComponent(JSON.stringify({ mode: 'login', role: 'DRIVER' }));
    const nonce = Math.random().toString(36).substring(2);

    const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token%20id_token&scope=${scope}&prompt=select_account&state=${state}&nonce=${nonce}`;

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window?.location) {
      window.location.href = googleOAuthUrl;
    } else {
      try {
        await Linking.openURL(googleOAuthUrl);
      } catch (e) {
        console.warn('Could not open Google OAuth URL:', e);
      }
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
          <Text style={styles.brandTitle}>TradeFlow</Text>
          <LanguageSwitcher />
        </View>

        {/* Polished Card */}
        <View style={styles.card}>
          {/* Card Top Icon & Title */}
          <View style={styles.headerBox}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={step === 'IDENTIFIER' ? 'person-circle-outline' : 'key-outline'}
                size={26}
                color="#0284C7"
              />
            </View>
            <Text style={styles.screenHeading}>
              {step === 'IDENTIFIER' ? t('mobileLogin') : t('enterPassword')}
            </Text>
            <Text style={styles.screenSubtitle}>
              {step === 'IDENTIFIER'
                ? t('enterPhoneOrEmail') || t('mobileLoginSub')
                : t('enterPasswordSub') || t('setPasswordSub')}
            </Text>
          </View>

          {/* Error Message Box */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* STEP 1: Phone or Email */}
          {step === 'IDENTIFIER' ? (
            <View style={{ gap: 16 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('phoneOrEmail')}</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    isFocused && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="phone-portrait-outline"
                    size={18}
                    color={isFocused ? '#0284C7' : '#64748B'}
                    style={{ marginLeft: 14, marginRight: 8 }}
                  />
                  <TextInput
                    style={styles.cleanInput}
                    value={identifier}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChangeText={(val) => {
                      setIdentifier(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="+251 9... or user@tradeflow.et"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                    onSubmitEditing={handleContinue}
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

              {/* Continue Button */}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleContinue}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>{t('continue') || 'Continue ➔'}</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('or')}</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Button */}
              <TouchableOpacity
                style={styles.googleBtn}
                onPress={handleGoogleLogin}
                activeOpacity={0.85}
              >
                <Ionicons name="logo-google" size={17} color="#EA4335" />
                <Text style={styles.googleBtnText}>{t('continueWithGoogle')}</Text>
              </TouchableOpacity>

              {/* Switch to Register */}
              <View style={styles.promptRow}>
                <Text style={styles.promptText}>{t('noAccount')} </Text>
                <TouchableOpacity onPress={onNavigateRegister} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.promptLink}>{t('register')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* STEP 2: Password */
            <View style={{ gap: 16 }}>
              {/* Account summary pill */}
              <View style={styles.accountBadge}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Ionicons name="checkmark-circle" size={18} color="#0284C7" />
                  <Text style={styles.accountBadgeText} numberOfLines={1}>
                    {identifier}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setErrorMsg('');
                    setStep('IDENTIFIER');
                  }}
                  style={styles.changeBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.changeBtnText}>{t('changeAccount') || 'Edit'}</Text>
                </TouchableOpacity>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('password')}</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    isFocused && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={isFocused ? '#0284C7' : '#64748B'}
                    style={{ marginLeft: 14, marginRight: 8 }}
                  />
                  <TextInput
                    ref={passwordInputRef}
                    style={styles.cleanInput}
                    value={password}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChangeText={(val) => {
                      setPassword(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    secureTextEntry={!showPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
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
                      color={showPassword ? '#0284C7' : '#64748B'}
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

                <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
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

              {/* Back to Step 1 Button */}
              <TouchableOpacity
                onPress={() => {
                  setErrorMsg('');
                  setStep('IDENTIFIER');
                }}
                style={styles.switchAccountBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={14} color="#64748B" />
                <Text style={styles.switchAccountText}>
                  {t('useAnotherAccount') || 'Use a different account'}
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
    paddingHorizontal: 20,
    paddingBottom: 35,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    zIndex: 100,
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
  headerBox: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  screenHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  screenSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
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
    transitionProperty: 'border-color',
    transitionDuration: '150ms',
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 48,
    gap: 9,
    ...Platform.select({
      web: { boxShadow: '0 1px 2px rgba(0,0,0,0.03)' } as any,
      default: { elevation: 1 },
    }),
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
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
  accountBadge: {
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
  accountBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369A1',
  },
  changeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  changeBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
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
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  forgotText: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '800',
  },
  switchAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginTop: 2,
  },
  switchAccountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
});
