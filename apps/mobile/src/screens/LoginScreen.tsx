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
  Linking,
  Platform,
} from 'react-native';
import { DEMO_ACCOUNTS } from '@tradeflow/shared';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { getApiBaseUrl } from '../utils/api';

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
  const { language, toggleLanguage, t } = useLanguage();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAutoFillDriver = () => {
    setIdentifier(DEMO_ACCOUNTS.DRIVER.email);
    setPassword(DEMO_ACCOUNTS.DRIVER.password);
    setErrorMsg('');
    setNotice('Driver demo credentials filled!');
    setTimeout(() => setNotice(''), 2000);
  };

  const handleAutoFillTransporter = () => {
    setIdentifier(DEMO_ACCOUNTS.TRANSPORTER.email);
    setPassword(DEMO_ACCOUNTS.TRANSPORTER.password);
    setErrorMsg('');
    setNotice('Transporter demo credentials filled!');
    setTimeout(() => setNotice(''), 2000);
  };

  const handleSubmit = async () => {
    if (!identifier || !password) {
      setErrorMsg('Please fill all required fields');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const trimmedId = identifier.toLowerCase().trim();

    // Check standard demo accounts
    let matchedDemo: any = null;
    if (trimmedId === DEMO_ACCOUNTS.DRIVER.email.toLowerCase() && password === DEMO_ACCOUNTS.DRIVER.password) {
      matchedDemo = { role: 'DRIVER', user: DEMO_ACCOUNTS.DRIVER };
    } else if (trimmedId === DEMO_ACCOUNTS.TRANSPORTER.email.toLowerCase() && password === DEMO_ACCOUNTS.TRANSPORTER.password) {
      matchedDemo = { role: 'TRANSPORTER', user: DEMO_ACCOUNTS.TRANSPORTER };
    }

    try {
      // Direct PostgreSQL database login via API
      const apiUrl = getApiBaseUrl();
      const res = await fetch(`${apiUrl}/api/auth/login`, {
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

      if (matchedDemo) {
        onLoginSuccess(matchedDemo.role, matchedDemo.user);
        return;
      }

      setErrorMsg(data.error || 'User not found. Please check your credentials or register.');
    } catch (err) {
      setLoading(false);
      if (matchedDemo) {
        onLoginSuccess(matchedDemo.role, matchedDemo.user);
        return;
      }
      setErrorMsg('Cannot connect to backend API server. Please ensure the server is running or register.');
    }
  };

  const handleGoogleLogin = async () => {
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '134488171607-3numfgilpa83d4p2d87gb9s7cjlgml4i.apps.googleusercontent.com';
    const redirectUri = (typeof window !== 'undefined' && window?.location?.origin) ? window.location.origin : 'http://localhost:8081';
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
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.brandTitle}>TradeFlow</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          
          <Text style={styles.screenHeading}>{t('mobileLogin')}</Text>
          <Text style={styles.screenSubtitle}>{t('mobileLoginSub')}</Text>

          {/* Notifications */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {notice ? (
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          {/* Input 1: Email / Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('phoneOrEmail')}</Text>
            <TextInput
              style={styles.textInput}
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="+2519... or user@tradeflow.et"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
            />
          </View>

          {/* Input 2: Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('password')}</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.textInput, { flex: 1, borderWidth: 0 }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember me & Forgot Password */}
          <View style={styles.rememberRow}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>{t('rememberMe')}</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
            </TouchableOpacity>
          </View>

          {/* Primary Login Button */}
          <TouchableOpacity
            style={styles.primaryLoginBtn}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryLoginBtnText}>
              {loading ? 'Authenticating...' : 'Log In'}
            </Text>
          </TouchableOpacity>

          {/* Fast Demo One-Click Fill Buttons */}
          <View style={styles.demoBar}>
            <Text style={styles.demoTitle}>
              Quick 1-Click Demo Accounts:
            </Text>
            <View style={styles.demoBtnRow}>
              <TouchableOpacity
                style={styles.demoChip}
                onPress={handleAutoFillDriver}
                activeOpacity={0.8}
              >
                <Ionicons name="person-outline" size={13} color="#0284C7" style={{ marginRight: 4 }} />
                <Text style={styles.demoChipText}>Driver Demo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.demoChip}
                onPress={handleAutoFillTransporter}
                activeOpacity={0.8}
              >
                <Ionicons name="business-outline" size={13} color="#0284C7" style={{ marginRight: 4 }} />
                <Text style={styles.demoChipText}>Transporter Demo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Authentication Button */}
          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin} activeOpacity={0.85}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleBtnText}>{t('continueWithGoogle')}</Text>
          </TouchableOpacity>

          {/* Bottom Switch to Register */}
          <View style={styles.registerPrompt}>
            <Text style={styles.promptText}>{t('noAccount')} </Text>
            <TouchableOpacity onPress={onNavigateRegister}>
              <Text style={styles.promptLink}>{t('register')}</Text>
            </TouchableOpacity>
          </View>

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
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E2EAF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  langBtn: {
    backgroundColor: '#E2EAF2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E6EFF7',
  },
  screenHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 16,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  noticeBox: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  noticeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingRight: 10,
  },
  eyeBtn: {
    padding: 6,
  },
  eyeText: {
    fontSize: 16,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#6B9AC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#6B9AC4',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
  },
  primaryLoginBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryLoginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  demoBar: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 8,
  },
  demoBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  demoChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 10,
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingVertical: 12,
    gap: 8,
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  promptText: {
    fontSize: 12,
    color: '#64748B',
  },
  promptLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
});
