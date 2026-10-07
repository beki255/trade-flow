import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Image,
  Platform,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from '../../../utils/api';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { isValidImageUri, uriToDataUrl } from '../../../utils/imageUtils';

interface DriverProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user?: any;
  onPhotoUpdated?: (newPhotoUrl: string) => void;
  onLogout?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 360);

export const DriverProfileModal: React.FC<DriverProfileModalProps> = ({
  visible,
  onClose,
  user,
  onPhotoUpdated,
  onLogout,
}) => {
  const { language, t } = useLanguage();
  const { theme, setTheme, isDark, colors } = useTheme();
  const [profilePhoto, setProfilePhoto] = useState<string>(
    user?.photoUrl || user?.roadworthinessDoc || user?.insuranceDoc || ''
  );
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [driverRatings, setDriverRatings] = useState<any[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [ratingsAvg, setRatingsAvg] = useState<number>(user?.ratingAvg ?? 5.0);
  const [ratingsCount, setRatingsCount] = useState<number>(user?.totalRatingsCount ?? 0);

  useEffect(() => {
    if (visible && user?.id) {
      const fetchRatings = async () => {
        try {
          setLoadingRatings(true);
          const res = await apiFetch(`/api/portal/ratings?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.ratings) {
              setDriverRatings(data.ratings);
              if (data.ratings.length > 0) {
                const avg = data.ratings.reduce((acc: number, r: any) => acc + (r.scoreStars || 0), 0) / data.ratings.length;
                setRatingsAvg(parseFloat(avg.toFixed(1)));
                setRatingsCount(data.ratings.length);
              }
            }
          }
        } catch (e) {
          console.warn('Driver ratings fetch error:', e);
        } finally {
          setLoadingRatings(false);
        }
      };
      fetchRatings();
    }
  }, [visible, user?.id]);

  // Left-to-right drawer slide and backdrop fade animation
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const useNative = Platform.OS !== 'web';

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

  // Sync photo with user prop
  useEffect(() => {
    if (user?.photoUrl || user?.roadworthinessDoc || user?.insuranceDoc) {
      setProfilePhoto(user.photoUrl || user.roadworthinessDoc || user.insuranceDoc);
    }
  }, [user]);

  // Upload photo to backend database
  const savePhotoToBackend = async (dataUrl: string) => {
    setPhotoUploading(true);
    try {
      const res = await apiFetch('/api/auth/update-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          phone: user?.phone,
          email: user?.email,
          photoUrl: dataUrl,
        }),
      });
      if (res.ok) {
        setProfilePhoto(dataUrl);
        onPhotoUpdated?.(dataUrl);
        Alert.alert('Photo Updated', 'Your profile photo has been updated successfully!');
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert('Upload Failed', err.error || 'Could not save photo.');
      }
    } catch (e) {
      console.warn('Photo upload error:', e);
      setProfilePhoto(dataUrl);
      onPhotoUpdated?.(dataUrl);
    } finally {
      setPhotoUploading(false);
    }
  };

  // Driver Photo Picker (Web & Native Expo)
  const pickDriverPhoto = async () => {
    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
          const file = e.target?.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              savePhotoToBackend(reader.result as string);
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      } else {
        const DocumentPicker = require('expo-document-picker');
        const res = await DocumentPicker.getDocumentAsync({
          type: ['image/*'],
          copyToCacheDirectory: true,
        });
        if (!res.canceled && res.assets && res.assets[0]?.uri) {
          const dataUrl = await uriToDataUrl(res.assets[0].uri);
          savePhotoToBackend(dataUrl);
        }
      }
    } catch (e) {
      console.warn('Photo picker error:', e);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.trim().length < 4) {
      Alert.alert('Validation Error', 'New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New password and confirmation do not match.');
      return;
    }

    setLoading(true);
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
        Alert.alert(
          'Password Updated',
          'Your new permanent password has been saved. Please use it for all subsequent logins.',
          [{ text: 'OK', onPress: handleClose }]
        );
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Password Update Failed', data.error || 'Failed to update password. Please check your credentials.');
      }
    } catch (err: any) {
      console.warn('Password update error:', err);
      Alert.alert('Connection Error', 'Could not reach server. Please check connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={drawerStyles.container}>
        {/* Semi-transparent Dimming Backdrop (Tapping closes the drawer) */}
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
                <Text style={drawerStyles.drawerSubTitle}>Driver Settings</Text>
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
            {/* 1. Driver Profile Photo Card */}
            <View style={drawerStyles.profileSummaryCard}>
              <TouchableOpacity
                style={drawerStyles.photoCircle}
                onPress={pickDriverPhoto}
                activeOpacity={0.8}
                disabled={photoUploading}
              >
                {isValidImageUri(profilePhoto) ? (
                  <Image source={{ uri: profilePhoto }} style={drawerStyles.photoImg} resizeMode="cover" />
                ) : (
                  <Ionicons name="person" size={28} color="#0284C7" />
                )}
                <View style={drawerStyles.photoEditBadge}>
                  {photoUploading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="camera" size={11} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>

              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={drawerStyles.userName} numberOfLines={1}>
                  {user?.fullName || 'Bereket Sahlemariam'}
                </Text>
                <Text style={drawerStyles.userPhone} numberOfLines={1}>
                  {user?.phone || '+251 91 123 4567'}
                </Text>
                <View style={drawerStyles.roleBadgeRow}>
                  <View style={drawerStyles.roleBadge}>
                    <Text style={drawerStyles.roleBadgeText}>DRIVER</Text>
                  </View>
                  <View style={drawerStyles.activeBadge}>
                    <Ionicons name="shield-checkmark" size={10} color="#10B981" />
                    <Text style={drawerStyles.activeBadgeText}>ACTIVE</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                    <Ionicons name="star" size={10} color="#F59E0B" />
                    <Text style={{ fontSize: 9, fontWeight: '800', color: '#FBBF24' }}>
                      {ratingsAvg.toFixed(1)} ({ratingsCount})
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Change Photo Action Button */}
            <TouchableOpacity
              style={drawerStyles.photoChangeBtn}
              onPress={pickDriverPhoto}
              activeOpacity={0.8}
            >
              <Ionicons name="image-outline" size={14} color="#38BDF8" />
              <Text style={drawerStyles.photoChangeBtnText}>Change Profile Photo / Doc</Text>
            </TouchableOpacity>

            {/* 2. Driver Credentials & Fleet Assignment */}
            <View style={drawerStyles.sectionCard}>
              <Text style={drawerStyles.sectionTitle}>CREW & FLEET CREDENTIALS</Text>

              <View style={drawerStyles.infoRow}>
                <Text style={drawerStyles.infoLabel}>License Category:</Text>
                <Text style={drawerStyles.infoValue}>
                  {user?.driverProfile?.licenseClass || 'Grade 5 Heavy'}
                </Text>
              </View>

              <View style={drawerStyles.infoRow}>
                <Text style={drawerStyles.infoLabel}>Assigned Truck:</Text>
                <Text style={[drawerStyles.infoValue, { color: '#38BDF8', fontFamily: 'monospace' }]}>
                  {user?.driverProfile?.assignedVehicle?.plateNumber || 'Fleet Unit'}
                </Text>
              </View>

              <View style={drawerStyles.infoRow}>
                <Text style={drawerStyles.infoLabel}>Email Account:</Text>
                <Text style={drawerStyles.infoValue} numberOfLines={1}>
                  {user?.email || 'driver@tradeflow.et'}
                </Text>
              </View>

              <View style={drawerStyles.infoRow}>
                <Text style={drawerStyles.infoLabel}>National Corridor:</Text>
                <Text style={[drawerStyles.infoValue, { color: '#10B981' }]}>
                  Ethio-Djibouti Corridor
                </Text>
              </View>
            </View>

            {/* 2.5 Driver Corridor Reputation & Received Reviews (Immutable Ledger) */}
            <View style={drawerStyles.sectionCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={drawerStyles.sectionTitle}>CORRIDOR REPUTATION & REVIEWS</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="lock-closed" size={11} color="#10B981" />
                  <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#10B981' }}>SEALED AUDIT LEDGER</Text>
                </View>
              </View>

              {/* Score Highlight Box */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#0F172A', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#334155', marginTop: 8 }}>
                <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#78350F', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F59E0B' }}>
                  <Ionicons name="star" size={24} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                    <Text style={{ fontSize: 20, fontWeight: '900', color: '#FFFFFF' }}>{ratingsAvg.toFixed(1)}</Text>
                    <Text style={{ fontSize: 12, color: '#94A3B8' }}>/ 5.0</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#CBD5E1', marginTop: 1 }}>
                    {ratingsCount > 0 ? `${ratingsCount} Verified Corridor Delivery Ratings` : 'Initial Corridor Reputation Score'}
                  </Text>
                </View>
              </View>

              {/* Reviews Feed */}
              {loadingRatings ? (
                <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#38BDF8" />
                </View>
              ) : driverRatings.length === 0 ? (
                <View style={{ paddingVertical: 12, paddingHorizontal: 10, alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center' }}>
                    No post-trip reviews recorded yet. Ratings will be permanently registered here upon verified consignments.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 8, marginTop: 8 }}>
                  {driverRatings.slice(0, 5).map((rev: any) => (
                    <View
                      key={rev.id}
                      style={{
                        backgroundColor: '#0F172A',
                        padding: 10,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: '#1E293B',
                        gap: 4,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#F1F5F9' }}>
                          {rev.fromUser?.companyName || rev.fromUser?.fullName || 'Verified Corridor Partner'}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                          <Ionicons name="star" size={11} color="#F59E0B" />
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#FBBF24' }}>
                            {rev.scoreStars}.0
                          </Text>
                        </View>
                      </View>
                      {Boolean(rev.reviewText) && (
                        <Text style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic' }}>
                          "{rev.reviewText}"
                        </Text>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#1E293B' }}>
                        <Text style={{ fontSize: 9.5, color: '#64748B' }}>
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recorded'}
                        </Text>
                        <Text style={{ fontSize: 9.5, color: '#10B981', fontWeight: '700' }}>
                          🔒 Verified & Immutable
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Tamper-Proof Notice */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: 8, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: '#1E293B' }}>
                <Ionicons name="information-circle-outline" size={13} color="#94A3B8" />
                <Text style={{ fontSize: 10, color: '#94A3B8', flex: 1 }}>
                  Ratings are permanently preserved in the TradeFlow ledger and cannot be edited.
                </Text>
              </View>
            </View>

            {/* 3. Password Reset & Security */}
            <View style={drawerStyles.sectionCard}>
              <Text style={drawerStyles.sectionTitle}>CHANGE ACCOUNT PASSWORD</Text>

              <View style={drawerStyles.inputGroup}>
                <Text style={drawerStyles.inputLabel}>Current Password *</Text>
                <View style={drawerStyles.passwordBox}>
                  <TextInput
                    style={drawerStyles.input}
                    placeholder="Enter current password"
                    placeholderTextColor="#64748B"
                    secureTextEntry={!showOldPassword}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowOldPassword(!showOldPassword)}
                    style={drawerStyles.eyeBtn}
                  >
                    <Ionicons
                      name={showOldPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={16}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={drawerStyles.inputGroup}>
                <Text style={drawerStyles.inputLabel}>New Password *</Text>
                <View style={drawerStyles.passwordBox}>
                  <TextInput
                    style={drawerStyles.input}
                    placeholder="Min. 4 characters"
                    placeholderTextColor="#64748B"
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={drawerStyles.eyeBtn}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={16}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={drawerStyles.inputGroup}>
                <Text style={drawerStyles.inputLabel}>Confirm New Password *</Text>
                <TextInput
                  style={[drawerStyles.input, { paddingHorizontal: 10 }]}
                  placeholder="Repeat new password"
                  placeholderTextColor="#64748B"
                  secureTextEntry={true}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              <TouchableOpacity
                style={[drawerStyles.saveBtn, loading && { opacity: 0.7 }]}
                onPress={handleUpdatePassword}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="lock-closed-outline" size={14} color="#FFFFFF" />
                    <Text style={drawerStyles.saveBtnText}>Update Password</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* 4. Appearance & Theme Mode (INSIDE Profile Settings) */}
            <View style={drawerStyles.sectionCard}>
              <Text style={drawerStyles.sectionTitle}>
                {language === 'AM' ? 'የገጽታ ቀለም' : language === 'OM' ? 'Bifa Fuulaa' : 'APPEARANCE & THEME'}
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
                    {language === 'AM' ? 'ብርሃን' : language === 'OM' ? 'Ifaa' : 'Light'}
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
                    {language === 'AM' ? 'ጨለማ' : language === 'OM' ? 'Dukkana' : 'Dark'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 5. Session & Sign Out */}
            {onLogout && (
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
            )}

            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <Text style={{ fontSize: 10, color: '#475569' }}>
                TradeFlow Mobile • Driver Edition v2.4
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
  photoCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0284C7',
    position: 'relative',
  },
  photoImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  userName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userPhone: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  roleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  roleBadge: {
    backgroundColor: '#0369A1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34D399',
  },
  photoChangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  photoChangeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
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
  inputGroup: {
    gap: 3,
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: '#FFFFFF',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  eyeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  saveBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  saveBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
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
    marginTop: 4,
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
});
