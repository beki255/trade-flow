import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { apiFetch } from '../../../utils/api';

interface DriverProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user?: any;
  onPhotoUpdated?: (newPhotoUrl: string) => void;
}

export const DriverProfileModal: React.FC<DriverProfileModalProps> = ({
  visible,
  onClose,
  user,
  onPhotoUpdated,
}) => {
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

  // Sync photo with user prop
  React.useEffect(() => {
    if (user?.photoUrl || user?.roadworthinessDoc || user?.insuranceDoc) {
      setProfilePhoto(user.photoUrl || user.roadworthinessDoc || user.insuranceDoc);
    }
  }, [user]);

  // Upload photo to database
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
        Alert.alert('✅ Photo Updated', 'Your profile photo has been updated successfully!');
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert('⚠️ Upload Failed', err.error || 'Could not save photo.');
      }
    } catch (e) {
      console.warn('Photo upload error:', e);
      // Fallback: update locally
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
        const res = await DocumentPicker.getDocumentAsync({
          type: ['image/*'],
          copyToCacheDirectory: true,
        });
        if (!res.canceled && res.assets && res.assets.length > 0) {
          const asset = res.assets[0];
          try {
            const resp = await fetch(asset.uri);
            const blob = await resp.blob();
            const reader = new FileReader();
            reader.onload = () => {
              savePhotoToBackend(reader.result as string);
            };
            reader.readAsDataURL(blob);
          } catch {
            savePhotoToBackend(asset.uri);
          }
        }
      }
    } catch (err) {
      console.warn('Photo picker error:', err);
    }
  };

  const handleSetSamplePhoto = () => {
    const sample = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80';
    savePhotoToBackend(sample);
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
          '✅ Password Updated!',
          'Your new permanent password has been saved. Please use it for all subsequent logins.',
          [{ text: 'OK', onPress: onClose }]
        );
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('⚠️ Password Update Failed', data.error || 'Failed to update password. Please check your credentials.');
      }
    } catch (err: any) {
      console.warn('Password update error:', err);
      Alert.alert('⚠️ Connection Error', 'Could not reach server. Please check connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.backdrop}>
        <View style={modalStyles.modalCard}>
          {/* Header */}
          <View style={modalStyles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="person-circle" size={20} color="#0284C7" />
              <Text style={modalStyles.title}>Driver Profile & Settings</Text>
            </View>
            <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
              <Text style={modalStyles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingVertical: 10 }}>
            {/* 1. Driver Profile Photo Section */}
            <View style={modalStyles.photoContainer}>
              <TouchableOpacity
                style={modalStyles.photoCircle}
                onPress={pickDriverPhoto}
                activeOpacity={0.8}
                disabled={photoUploading}
              >
                {photoUploading ? (
                  <ActivityIndicator size="small" color="#0284C7" />
                ) : profilePhoto ? (
                  <Image source={{ uri: profilePhoto }} style={modalStyles.photoImg} />
                ) : (
                  <Ionicons name="person" size={36} color="#94A3B8" />
                )}
                <View style={modalStyles.photoEditBadge}>
                  <Ionicons name="camera" size={12} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <View style={{ flex: 1, gap: 3 }}>
                <Text style={modalStyles.photoTitle}>Profile Photo (የፊት ፎቶ)</Text>
                <Text style={modalStyles.photoSubtitle}>
                  {profilePhoto ? '✅ Verified Photo attached' : 'Tap to upload or snap your official corridor ID photo'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                  <TouchableOpacity style={modalStyles.uploadBtn} onPress={pickDriverPhoto}>
                    <Ionicons name="cloud-upload-outline" size={12} color="#0284C7" />
                    <Text style={modalStyles.uploadBtnText}>{profilePhoto ? 'Change Photo' : 'Upload Photo'}</Text>
                  </TouchableOpacity>
                  {!profilePhoto && (
                    <TouchableOpacity style={modalStyles.sampleBtn} onPress={handleSetSamplePhoto}>
                      <Text style={modalStyles.sampleBtnText}>Sample</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* 2. Driver Identity Summary */}
            <View style={modalStyles.profileCard}>
              <View style={modalStyles.infoRow}>
                <Text style={modalStyles.infoLabel}>Driver Full Legal Name:</Text>
                <Text style={modalStyles.infoValue}>{user?.fullName || 'Authorized Driver'}</Text>
              </View>
              <View style={modalStyles.infoRow}>
                <Text style={modalStyles.infoLabel}>Registered Mobile Phone:</Text>
                <Text style={modalStyles.infoValue}>{user?.phone || 'N/A'}</Text>
              </View>
              <View style={modalStyles.infoRow}>
                <Text style={modalStyles.infoLabel}>License No & Class:</Text>
                <Text style={modalStyles.infoValue}>
                  {user?.driverProfile?.driverLicenseNo || 'DL-2026-FT'} ({user?.driverProfile?.licenseClass || 'Grade 5 Heavy'})
                </Text>
              </View>
              <View style={modalStyles.infoRow}>
                <Text style={modalStyles.infoLabel}>Employer Transporter:</Text>
                <Text style={[modalStyles.infoValue, { color: '#0284C7' }]}>
                  {user?.companyName || 'TradeFlow Fleet Network'}
                </Text>
              </View>
            </View>

            {/* 3. Change / Update Password Section */}
            <View style={modalStyles.securitySection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Ionicons name="key" size={15} color="#0284C7" />
                <Text style={modalStyles.sectionTitle}>CHANGE / UPDATE PASSWORD</Text>
              </View>
              
              <View style={modalStyles.noticeBox}>
                <Ionicons name="information-circle-outline" size={15} color="#0369A1" style={{ marginRight: 4 }} />
                <Text style={modalStyles.noticeText}>
                  If your transporter gave you a one-time temporary password (e.g. TF-XXXX), enter it below and set your private permanent password.
                </Text>
              </View>

              {/* Current / One-Time Password */}
              <View style={modalStyles.inputGroup}>
                <Text style={modalStyles.inputLabel}>Current / One-Time Temporary Password:</Text>
                <View style={modalStyles.passwordInputContainer}>
                  <TextInput
                    style={modalStyles.passwordInput}
                    placeholder="Enter current or temporary code"
                    placeholderTextColor="#94A3B8"
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    secureTextEntry={!showOldPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowOldPassword(!showOldPassword)}
                    style={modalStyles.eyeBtn}
                  >
                    <Ionicons
                      name={showOldPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={modalStyles.inputGroup}>
                <Text style={modalStyles.inputLabel}>New Permanent Password:</Text>
                <View style={modalStyles.passwordInputContainer}>
                  <TextInput
                    style={modalStyles.passwordInput}
                    placeholder="Create secure permanent password"
                    placeholderTextColor="#94A3B8"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={modalStyles.eyeBtn}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm New Password */}
              <View style={modalStyles.inputGroup}>
                <Text style={modalStyles.inputLabel}>Confirm New Password:</Text>
                <TextInput
                  style={modalStyles.input}
                  placeholder="Re-type new permanent password"
                  placeholderTextColor="#94A3B8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={true}
                  autoCapitalize="none"
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[modalStyles.saveBtn, loading && { opacity: 0.7 }]}
                onPress={handleUpdatePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-done" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={modalStyles.saveBtnText}>Update Permanent Password</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    width: '100%',
    maxWidth: 420,
    maxHeight: '92%',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },
  photoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  photoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0284C7',
    position: 'relative',
    overflow: 'visible',
  },
  photoImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  photoSubtitle: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  uploadBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  sampleBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  sampleBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  profileCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  securitySection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  noticeBox: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noticeText: {
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 16,
    flex: 1,
    fontWeight: '500',
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  eyeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  saveBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
