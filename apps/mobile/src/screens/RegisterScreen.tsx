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

  // Streamlined Initial Registration (Phone, Email, Password, Name)
  const [ownerName, setOwnerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!ownerName.trim() || !phone.trim() || !password) {
      setErrorMsg('Please enter your full name, phone number, and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const cleanPhone = phone.trim();
    const cleanEmail = email && email.trim()
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
      setErrorMsg('Cannot connect to TradeFlow API server. Please check your connection and retry.');
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
          
          <Text style={styles.screenHeading}>Transporter Sign Up</Text>
          <Text style={styles.screenSubtitle}>
            Create your carrier account in seconds. You will complete your business credentials on the next step.
          </Text>

          {/* Error Message */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* 1. Full Legal Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Managing Owner / Director Full Name *</Text>
            <TextInput
              style={styles.textInput}
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="e.g. Sara Haile"
              placeholderTextColor="#94A3B8"
              autoCapitalize="words"
            />
          </View>

          {/* 2. Company / Business Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Transport Company Name (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="e.g. Red Sea Freight Logistics (or leave empty)"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* 3. Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Phone Number *</Text>
            <TextInput
              style={styles.textInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="+251 91 123 4567"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>

          {/* 4. Email Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="transporter@tradeflow.et"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* 5. Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Create Password *</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.textInput, { flex: 1, borderWidth: 0, backgroundColor: 'transparent' }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Minimum 6 characters"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={showPassword ? '#0284C7' : '#64748B'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.primaryRegisterBtn}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primaryRegisterBtnText}>Create Account ➔</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Bottom Switch to Login */}
          <View style={styles.loginPrompt}>
            <Text style={styles.promptText}>Already have an account? </Text>
            <TouchableOpacity onPress={onNavigateLogin}>
              <Text style={styles.promptLink}>Log In</Text>
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
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backArrow: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '700',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 10px rgba(15, 23, 42, 0.04)',
      } as any,
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
      },
    }),
    gap: 14,
  },
  screenHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  screenSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginTop: -4,
    marginBottom: 4,
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
    paddingVertical: 11,
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
    paddingRight: 6,
  },
  eyeBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryRegisterBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 14,
    paddingVertical: 14,
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
  primaryRegisterBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  promptText: {
    fontSize: 12,
    color: '#64748B',
  },
  promptLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
});
