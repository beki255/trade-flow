import React, { useRef, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { UserProfile } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { apiFetch } from '../../../utils/api';
import { validatePassword, validatePasswordMatch } from '../../../utils/validation';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user?: UserProfile;
  carrierStatus: 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  language: 'en' | 'am';
  toggleLanguage: () => void;
  onLogout: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 360);

export const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  user,
  carrierStatus,
  language,
  toggleLanguage,
  onLogout,
}) => {
  const { language: ctxLang, t } = useLanguage();
  const { theme, setTheme, isDark, colors } = useTheme();
  const activeLang = ((language || ctxLang || 'EN') as string).toUpperCase();

  // Password Change States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // Left-to-right drawer slide and backdrop fade animation
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const useNative = Platform.OS !== 'web';

  const handleUpdatePassword = async () => {
    setPasswordSuccessMsg('');
    setPasswordErrorMsg('');

    if (!oldPassword || !oldPassword.trim()) {
      const err = activeLang === 'AM' ? 'እባክዎ የአሁኑን የይለፍ ቃል ያስገቡ።' : 'Please enter your current password.';
      setPasswordErrorMsg(err);
      Alert.alert(activeLang === 'AM' ? 'ስህተት' : 'Validation Error', err);
      return;
    }

    const passRes = validatePassword(newPassword, activeLang as any);
    if (!passRes.isValid) {
      const err = passRes.error || (activeLang === 'AM' ? 'አዲሱ የይለፍ ቃል ቢያንስ 8 ፊደላት/ቁጥሮች መሆን አለበት (ፊደልና ቁጥር ያካተተ)።' : 'Password must be at least 8 characters long and contain at least one letter and one number.');
      setPasswordErrorMsg(err);
      Alert.alert(activeLang === 'AM' ? 'ስህተት' : 'Validation Error', err);
      return;
    }

    const matchRes = validatePasswordMatch(newPassword, confirmPassword, activeLang as any);
    if (!matchRes.isValid) {
      const err = matchRes.error || (activeLang === 'AM' ? 'የተረጋገጠው የይለፍ ቃል ከአዲሱ ጋር አይዛመድም።' : 'New password and confirmation do not match.');
      setPasswordErrorMsg(err);
      Alert.alert(activeLang === 'AM' ? 'ስህተት' : 'Validation Error', err);
      return;
    }

    setLoadingPassword(true);
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          phone: user?.phone,
          email: user?.email,
          oldPassword: oldPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const succ = activeLang === 'AM' ? 'የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል!' : 'Your password has been updated successfully!';
        setPasswordSuccessMsg(succ);
        Alert.alert(
          activeLang === 'AM' ? 'የይለፍ ቃል ተቀይሯል' : 'Password Updated',
          activeLang === 'AM'
            ? 'አዲሱ ቋሚ የይለፍ ቃልዎ ተቀምጧል። እባክዎ ለሚቀጥሉት መግቢያዎች ይጠቀሙበት።'
            : 'Your new permanent password has been saved. Please use it for all future logins.',
          [{ text: 'OK' }]
        );
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccessMsg(''), 4500);
      } else {
        let msg = data.error || 'Failed to update password.';
        if (activeLang === 'AM') {
          if (msg.includes('Current password does not match') || msg.includes('temporary password does not match')) {
            msg = 'ያስገቡት የአሁን የይለፍ ቃል ትክክል አይደለም።';
          } else if (msg.includes('at least 8 characters')) {
            msg = 'አዲሱ የይለፍ ቃል ቢያንስ 8 ፊደላት/ቁጥሮች መሆን አለበት (ፊደልና ቁጥር ያካተተ)።';
          }
        }
        setPasswordErrorMsg(msg);
        Alert.alert(activeLang === 'AM' ? 'ማሻሻል አልተሳካም' : 'Update Failed', msg);
      }
    } catch (err: any) {
      const msg = activeLang === 'AM' ? 'ሰርቨሩን ማግኘት አልተቻለም። እባክዎ ግንኙነትዎን ያረጋግጡ።' : 'Cannot connect to server. Please check your connection.';
      setPasswordErrorMsg(msg);
      Alert.alert(activeLang === 'AM' ? 'የግንኙነት ስህተት' : 'Connection Error', msg);
    } finally {
      setLoadingPassword(false);
    }
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: useNative,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: useNative,
        }),
      ]).start();
    } else {
      slideAnim.setValue(-DRAWER_WIDTH);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 220,
        useNativeDriver: useNative,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: useNative,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={drawerStyles.container}>
        {/* Semi-transparent Backdrop (Tapping closes the drawer) */}
        <Pressable style={drawerStyles.backdrop} onPress={handleClose}>
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 23, 42, 0.75)', opacity: fadeAnim }]} />
        </Pressable>

        {/* Left-to-Right Animated Drawer Panel */}
        <Animated.View
          style={[
            drawerStyles.drawerPanel,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          {/* Drawer Top Header */}
          <View style={drawerStyles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={drawerStyles.logoBadge}>
                <Ionicons name="swap-horizontal" size={16} color="#38BDF8" />
              </View>
              <View>
                <Text style={drawerStyles.brandName}>TradeFlow</Text>
                <Text style={drawerStyles.drawerSubTitle}>Transporter Settings</Text>
              </View>
            </View>

            <TouchableOpacity style={drawerStyles.closeBtn} onPress={handleClose} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Settings Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={drawerStyles.scrollContent}
          >
            {/* 1. Transporter Organization Summary Card */}
            <View style={drawerStyles.profileSummaryCard}>
              <View style={drawerStyles.avatarCircle}>
                <Text style={drawerStyles.avatarLetter}>
                  {user?.companyName ? user.companyName.charAt(0).toUpperCase() : 'T'}
                </Text>
                <View
                  style={[
                    drawerStyles.statusDot,
                    carrierStatus === 'VERIFIED'
                      ? { backgroundColor: '#10B981' }
                      : carrierStatus === 'PENDING'
                      ? { backgroundColor: '#F59E0B' }
                      : { backgroundColor: '#EF4444' },
                  ]}
                />
              </View>

              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={drawerStyles.companyName} numberOfLines={1}>
                  {user?.companyName || 'Mulugeta Cross-Border Freight'}
                </Text>
                <Text style={drawerStyles.ownerName} numberOfLines={1}>
                  {user?.fullName || 'Mulugeta Assefa'}
                </Text>
                <Text style={drawerStyles.emailText} numberOfLines={1}>
                  {user?.email || 'transporter@tradeflow.et'}
                </Text>
                <View style={drawerStyles.badgeRow}>
                  <View
                    style={[
                      drawerStyles.statusBadge,
                      carrierStatus === 'VERIFIED'
                        ? { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)' }
                        : carrierStatus === 'PENDING'
                        ? { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)' }
                        : { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' },
                    ]}
                  >
                    <Ionicons
                      name={carrierStatus === 'VERIFIED' ? 'checkmark-circle' : 'time-outline'}
                      size={11}
                      color={carrierStatus === 'VERIFIED' ? '#34D399' : carrierStatus === 'PENDING' ? '#FBBF24' : '#F87171'}
                    />
                    <Text
                      style={[
                        drawerStyles.statusBadgeText,
                        { color: carrierStatus === 'VERIFIED' ? '#34D399' : carrierStatus === 'PENDING' ? '#FBBF24' : '#F87171' },
                      ]}
                    >
                      {carrierStatus}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                    <Ionicons name="star" size={10} color="#F59E0B" />
                    <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#FBBF24' }}>
                      {user?.ratingAvg && user.ratingAvg > 0 ? user.ratingAvg.toFixed(1) : '5.0'} ({user?.totalRatingsCount || 0})
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 2. Compliance & Legal Identity */}
            <View style={drawerStyles.sectionCard}>
              <Text style={drawerStyles.sectionTitle}>COMPLIANCE & LEGAL IDENTITY</Text>

              {user?.verificationNotes ? (
                <View style={drawerStyles.adminNoteBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Ionicons name="document-text-outline" size={13} color="#38BDF8" />
                    <Text style={drawerStyles.adminNoteTitle}>Admin Compliance Note</Text>
                  </View>
                  <Text style={drawerStyles.adminNoteValue}>{user.verificationNotes}</Text>
                </View>
              ) : null}

              <View style={drawerStyles.infoRow}>
                <Text style={drawerStyles.infoLabel}>Contact Phone:</Text>
                <Text style={drawerStyles.infoValue}>{user?.phone || '+251 91 123 4567'}</Text>
              </View>

              <View style={drawerStyles.infoRow}>
                <Text style={drawerStyles.infoLabel}>TIN (Tax ID):</Text>
                <Text style={[drawerStyles.infoValue, { fontFamily: 'monospace' }]}>
                  {user?.tin || '0049281729'}
                </Text>
              </View>

              <View style={drawerStyles.infoRow}>
                <Text style={drawerStyles.infoLabel}>Trade License:</Text>
                <Text style={[drawerStyles.infoValue, { fontFamily: 'monospace' }]}>
                  {user?.tradeLicenseNo || 'ET-MOTI-2024-8841'}
                </Text>
              </View>

              <View style={drawerStyles.infoRow}>
                <Text style={drawerStyles.infoLabel}>GIT Cargo Insurance:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                  <Text style={[drawerStyles.infoValue, { color: '#10B981' }]}>Active & Verified</Text>
                </View>
              </View>

              <View style={drawerStyles.infoRow}>
                <Text style={drawerStyles.infoLabel}>FTA Roadworthiness:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                  <Text style={[drawerStyles.infoValue, { color: '#10B981' }]}>Certified</Text>
                </View>
              </View>
            </View>

            {/* 3. Change Account Password (SECURE CREDENTIAL MANAGEMENT) */}
            <View style={drawerStyles.sectionCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={drawerStyles.sectionTitle}>
                  {activeLang === 'AM' ? 'የይለፍ ቃል ቀይር' : activeLang === 'OM' ? 'Jijjiirraa Jecha Icciitii' : 'CHANGE ACCOUNT PASSWORD'}
                </Text>
                <Ionicons name="lock-closed" size={13} color="#38BDF8" />
              </View>

              {/* Requirement Hint */}
              <View style={drawerStyles.securityHintBox}>
                <Ionicons name="shield-checkmark-outline" size={13} color="#38BDF8" style={{ marginTop: 1 }} />
                <Text style={drawerStyles.securityHintText}>
                  {activeLang === 'AM'
                    ? 'አዲሱ የይለፍ ቃል ቢያንስ 8 ፊደላት/ቁጥሮች መሆን አለበት (ቢያንስ አንድ ፊደል እና አንድ ቁጥር)።'
                    : 'Password must be at least 8 characters long and contain both letters and numbers.'}
                </Text>
              </View>

              {passwordSuccessMsg ? (
                <View style={drawerStyles.alertBannerSuccess}>
                  <Ionicons name="checkmark-circle" size={15} color="#10B981" />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#34D399', flex: 1 }}>
                    {passwordSuccessMsg}
                  </Text>
                </View>
              ) : null}

              {passwordErrorMsg ? (
                <View style={drawerStyles.alertBannerError}>
                  <Ionicons name="alert-circle" size={15} color="#EF4444" />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#F87171', flex: 1 }}>
                    {passwordErrorMsg}
                  </Text>
                </View>
              ) : null}

              {/* Current Password Input */}
              <View style={drawerStyles.inputGroup}>
                <Text style={drawerStyles.inputLabel}>
                  {activeLang === 'AM' ? 'የአሁን የይለፍ ቃል *' : 'Current Password *'}
                </Text>
                <View style={drawerStyles.passwordBox}>
                  <Ionicons name="lock-closed-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                  <TextInput
                    style={drawerStyles.input}
                    placeholder={activeLang === 'AM' ? 'የአሁኑን የይለፍ ቃል ያስገቡ' : 'Enter current password'}
                    placeholderTextColor="#64748B"
                    secureTextEntry={!showOldPassword}
                    value={oldPassword}
                    onChangeText={(txt) => {
                      setOldPassword(txt);
                      if (passwordErrorMsg) setPasswordErrorMsg('');
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowOldPassword(!showOldPassword)}
                    style={drawerStyles.eyeBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showOldPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={15}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password Input */}
              <View style={drawerStyles.inputGroup}>
                <Text style={drawerStyles.inputLabel}>
                  {activeLang === 'AM' ? 'አዲስ ቋሚ የይለፍ ቃል *' : 'New Password *'}
                </Text>
                <View style={drawerStyles.passwordBox}>
                  <Ionicons name="key-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                  <TextInput
                    style={drawerStyles.input}
                    placeholder={activeLang === 'AM' ? 'ቢያንስ 8 ፊደልና ቁጥር' : 'Min. 8 chars (letter + number)'}
                    placeholderTextColor="#64748B"
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={(txt) => {
                      setNewPassword(txt);
                      if (passwordErrorMsg) setPasswordErrorMsg('');
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={drawerStyles.eyeBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={15}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={drawerStyles.inputGroup}>
                <Text style={drawerStyles.inputLabel}>
                  {activeLang === 'AM' ? 'አዲሱን የይለፍ ቃል አረጋግጥ *' : 'Confirm New Password *'}
                </Text>
                <View style={drawerStyles.passwordBox}>
                  <Ionicons name="shield-checkmark-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                  <TextInput
                    style={drawerStyles.input}
                    placeholder={activeLang === 'AM' ? 'አዲሱን የይለፍ ቃል ድጋሚ ያስገቡ' : 'Repeat new password'}
                    placeholderTextColor="#64748B"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={(txt) => {
                      setConfirmPassword(txt);
                      if (passwordErrorMsg) setPasswordErrorMsg('');
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={drawerStyles.eyeBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={15}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[
                  drawerStyles.saveBtn,
                  (loadingPassword || !oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) && { opacity: 0.6 },
                ]}
                onPress={handleUpdatePassword}
                disabled={loadingPassword || !oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
                activeOpacity={0.85}
              >
                {loadingPassword ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="lock-closed-outline" size={14} color="#FFFFFF" />
                    <Text style={drawerStyles.saveBtnText}>
                      {activeLang === 'AM' ? 'የይለፍ ቃል አድስ' : 'Update Password'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* 4. Appearance & Theme Mode (INSIDE Profile Settings) */}
            <View style={drawerStyles.sectionCard}>
              <Text style={drawerStyles.sectionTitle}>
                {activeLang === 'AM' ? 'የገጽታ ቀለም' : activeLang === 'OM' ? 'Bifa Fuulaa' : 'APPEARANCE & THEME'}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TouchableOpacity
                  style={[
                    drawerStyles.themeBtn,
                    !isDark && drawerStyles.themeBtnActiveLight,
                  ]}
                  onPress={() => setTheme('light')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="sunny" size={15} color={!isDark ? '#0284C7' : '#94A3B8'} />
                  <Text style={[drawerStyles.themeBtnText, !isDark && drawerStyles.themeBtnTextActiveLight]}>
                    {activeLang === 'AM' ? 'ብርሃን' : activeLang === 'OM' ? 'Ifaa' : 'Light'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    drawerStyles.themeBtn,
                    isDark && drawerStyles.themeBtnActiveDark,
                  ]}
                  onPress={() => setTheme('dark')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="moon" size={15} color={isDark ? '#38BDF8' : '#94A3B8'} />
                  <Text style={[drawerStyles.themeBtnText, isDark && drawerStyles.themeBtnTextActiveDark]}>
                    {activeLang === 'AM' ? 'ጨለማ' : activeLang === 'OM' ? 'Dukkana' : 'Dark'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 4. Session & Sign Out */}
            <View style={drawerStyles.sectionCard}>
              <Text style={drawerStyles.sectionTitle}>ACCOUNT ACTIONS</Text>

              <TouchableOpacity
                style={drawerStyles.logoutBtn}
                onPress={() => {
                  handleClose();
                  onLogout();
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="log-out-outline" size={16} color="#F87171" />
                <Text style={drawerStyles.logoutBtnText}>{t('logout')}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', paddingVertical: 10 }}>
              <Text style={{ fontSize: 10, color: '#475569' }}>
                TradeFlow Mobile • Carrier Edition v2.4
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const drawerStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  drawerPanel: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#0F172A',
    borderRightWidth: 1,
    borderRightColor: '#1E293B',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 16,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  logoBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  brandName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  drawerSubTitle: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 14,
    gap: 12,
  },
  profileSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0284C7',
    position: 'relative',
  },
  avatarLetter: {
    fontSize: 20,
    fontWeight: '900',
    color: '#38BDF8',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  companyName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ownerName: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  emailText: {
    fontSize: 10,
    color: '#64748B',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  adminNoteBox: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#0284C7',
    gap: 3,
  },
  adminNoteTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#38BDF8',
  },
  adminNoteValue: {
    fontSize: 10.5,
    color: '#E2E8F0',
    lineHeight: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#27354A',
  },
  infoLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 11,
    color: '#F1F5F9',
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 2,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F87171',
  },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  themeBtnActiveLight: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  themeBtnActiveDark: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38BDF8',
  },
  themeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  themeBtnTextActiveLight: {
    color: '#0284C7',
    fontWeight: '800',
  },
  themeBtnTextActiveDark: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  inputGroup: {
    gap: 4,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  passwordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 38,
    fontSize: 11.5,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 6,
  },
  saveBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  securityHintBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  securityHintText: {
    fontSize: 10,
    color: '#94A3B8',
    flex: 1,
    lineHeight: 14,
  },
  alertBannerSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertBannerError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
