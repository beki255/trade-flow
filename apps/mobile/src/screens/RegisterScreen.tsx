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
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';

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
  const { language, toggleLanguage, t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<'DRIVER' | 'TRANSPORTER'>('DRIVER');

  // Form states
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [licenseClass, setLicenseClass] = useState('Heavy Freight (Level 5)');
  const [tin, setTin] = useState('');
  const [fleetSize, setFleetSize] = useState('3');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !phone || !password) {
      setErrorMsg(t('fillRequired'));
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const userData = {
      fullName,
      phone,
      email: email || `${phone.replace(/[^0-9]/g, '')}@tradeflow.et`,
      role: selectedRole,
      companyName: selectedRole === 'TRANSPORTER' ? (companyName || fullName) : undefined,
      tin: selectedRole === 'TRANSPORTER' ? tin : undefined,
      tradeLicenseNo: selectedRole === 'DRIVER' ? licenseNo : undefined,
      password,
    };

    try {
      // Attempt registration to API backend
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      setLoading(false);
      onRegisterSuccess(selectedRole, data.user || userData);
    } catch (err) {
      // Fallback
      setLoading(false);
      onRegisterSuccess(selectedRole, userData);
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
          <Text style={styles.brandTitle}>{t('tradeflow')}</Text>
          
          <TouchableOpacity style={styles.langBtn} onPress={toggleLanguage}>
            <Text style={styles.langBtnText}>{language === 'AM' ? '🌐 English' : '🌐 አማርኛ'}</Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          
          <Text style={styles.screenHeading}>{t('registrationTitle')}</Text>
          <Text style={styles.screenSubtitle}>{t('registrationSub')}</Text>

          {/* Role Selector Tabs */}
          <View style={styles.roleToggleContainer}>
            <TouchableOpacity
              style={[styles.roleTab, selectedRole === 'DRIVER' && styles.roleTabActive]}
              onPress={() => setSelectedRole('DRIVER')}
              activeOpacity={0.8}
            >
              <Text style={[styles.roleTabText, selectedRole === 'DRIVER' && styles.roleTabTextActive]}>
                🚚 {t('driver')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleTab, selectedRole === 'TRANSPORTER' && styles.roleTabActive]}
              onPress={() => setSelectedRole('TRANSPORTER')}
              activeOpacity={0.8}
            >
              <Text style={[styles.roleTabText, selectedRole === 'TRANSPORTER' && styles.roleTabTextActive]}>
                🚛 {t('transporter')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* DRIVER SPECIFIC FIELDS */}
          {selectedRole === 'DRIVER' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('driverFullName')} *</Text>
                <TextInput
                  style={styles.textInput}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={language === 'AM' ? 'ለምሳሌ፡ ከበደ ወርቁ' : 'e.g. Kebede Worku'}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('phoneNumber')} *</Text>
                <TextInput
                  style={styles.textInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+2519..."
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('driverLicenseNo')}</Text>
                <TextInput
                  style={styles.textInput}
                  value={licenseNo}
                  onChangeText={setLicenseNo}
                  placeholder="DL-ETH-992144"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </>
          ) : (
            /* TRANSPORTER SPECIFIC FIELDS */
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('companyName')} *</Text>
                <TextInput
                  style={styles.textInput}
                  value={companyName}
                  onChangeText={setCompanyName}
                  placeholder={language === 'AM' ? 'ለምሳሌ፡ ሙሉጌታ የጭነት ትራንስፖርት ኃ/የተ/የግ/ማ' : 'e.g. Mulugeta Freight Transport PLC'}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('ownerName')} *</Text>
                <TextInput
                  style={styles.textInput}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={language === 'AM' ? 'ለምሳሌ፡ ሙሉጌታ አሰፋ' : 'e.g. Mulugeta Assefa'}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.rowTwoInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>{t('tin')} *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={tin}
                    onChangeText={setTin}
                    placeholder="0098473621"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>{t('fleetSize')}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={fleetSize}
                    onChangeText={setFleetSize}
                    placeholder="3"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('phoneNumber')} *</Text>
                <TextInput
                  style={styles.textInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+2519..."
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                />
              </View>
            </>
          )}

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('createPassword')} *</Text>
            <TextInput
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.registerBtnText}>
              {loading
                ? (language === 'AM' ? 'በዳታቤዝ በመመዝገብ ላይ...' : 'Saving to Database...')
                : t('completeRegistration')}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-up */}
          <TouchableOpacity style={styles.googleBtn} onPress={() => onRegisterSuccess(selectedRole, { fullName: 'Google User' })} activeOpacity={0.85}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleBtnText}>{t('signUpWithGoogle')}</Text>
          </TouchableOpacity>

          {/* Bottom Switch to Login */}
          <View style={styles.loginPrompt}>
            <Text style={styles.promptText}>{t('alreadyAccount')} </Text>
            <TouchableOpacity onPress={onNavigateLogin}>
              <Text style={styles.promptLink}>{t('login')}</Text>
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
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleTabActive: {
    backgroundColor: '#111C2D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  roleTabTextActive: {
    color: '#FFFFFF',
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
  inputGroup: {
    marginBottom: 12,
  },
  rowTwoInputs: {
    flexDirection: 'row',
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
  registerBtn: {
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
    marginTop: 4,
  },
  registerBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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
  loginPrompt: {
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
