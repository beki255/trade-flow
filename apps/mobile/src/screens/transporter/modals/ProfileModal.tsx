import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { transporterStyles as styles } from '../transporterStyles';
import { UserProfile } from '../types';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user?: UserProfile;
  carrierStatus: 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  language: 'en' | 'am';
  toggleLanguage: () => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  user,
  carrierStatus,
  language,
  toggleLanguage,
  onLogout,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.profileModalCard}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>Transporter Account Profile</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingVertical: 14 }}>
            {/* Header Card */}
            <View style={styles.profileCardSummary}>
              <View style={styles.profileModalAvatar}>
                <Text style={styles.profileModalAvatarText}>
                  {user?.companyName ? user.companyName.charAt(0).toUpperCase() : 'T'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profileCompanyName}>
                  {user?.companyName || 'Mulugeta Cross-Border Freight'}
                </Text>
                <Text style={styles.profileOwnerName}>
                  {user?.fullName || 'Mulugeta Assefa'} • {user?.email || 'transporter@tradeflow.et'}
                </Text>
                <View
                  style={[
                    styles.profileBadge,
                    carrierStatus === 'VERIFIED'
                      ? styles.chipVerified
                      : carrierStatus === 'PENDING'
                        ? styles.chipPending
                        : styles.chipSuspended,
                  ]}
                >
                  <Text
                    style={[
                      styles.profileBadgeText,
                      carrierStatus === 'VERIFIED'
                        ? { color: '#059669' }
                        : carrierStatus === 'PENDING'
                          ? { color: '#D97706' }
                          : { color: '#DC2626' },
                    ]}
                  >
                    Status: {carrierStatus}
                  </Text>
                </View>
              </View>
            </View>

            {/* Compliance Credentials */}
            <View style={styles.settingsGroup}>
              <Text style={styles.settingsGroupTitle}>Compliance & Legal Identity</Text>

              <View style={styles.settingItem}>
                <Text style={styles.settingItemLabel}>Primary Contact Phone</Text>
                <Text style={styles.settingItemValue}>{user?.phone || '+251 91 123 4567'}</Text>
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingItemLabel}>Tax Identification Number (TIN)</Text>
                <Text style={styles.settingItemValue}>{user?.tin || '0049281729'}</Text>
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingItemLabel}>Commercial Trade License</Text>
                <Text style={styles.settingItemValue}>{user?.tradeLicenseNo || 'ET-MOTI-2024-8841'}</Text>
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingItemLabel}>GIT Cargo Insurance</Text>
                <Text style={[styles.settingItemValue, { color: '#059669', fontWeight: '700' }]}>
                  Active & Verified
                </Text>
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingItemLabel}>FTA Roadworthiness</Text>
                <Text style={[styles.settingItemValue, { color: '#059669', fontWeight: '700' }]}>
                  Certified
                </Text>
              </View>
            </View>

            {/* Preferences & Actions */}
            <View style={styles.settingsGroup}>
              <Text style={styles.settingsGroupTitle}>Preferences & Session</Text>

              <View style={styles.actionBtnRow}>
                <Text style={styles.actionBtnLabel}>Language</Text>
                <Text style={styles.actionBtnValue}>English</Text>
              </View>

              <TouchableOpacity
                style={[styles.actionBtnRow, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}
                onPress={() => {
                  onClose();
                  onLogout();
                }}
              >
                <Text style={[styles.actionBtnLabel, { color: '#DC2626', fontWeight: '700' }]}>
                  Logout
                </Text>
                <Text style={[styles.actionBtnValue, { color: '#DC2626' }]}>Exit</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
