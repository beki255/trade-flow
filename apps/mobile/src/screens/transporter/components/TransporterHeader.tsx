import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { transporterStyles as styles } from '../transporterStyles';
import { UserProfile } from '../types';
import { LanguageSwitcher } from '../../../components/LanguageSwitcher';
import { useLanguage } from '../../../context/LanguageContext';

interface TransporterHeaderProps {
  user?: UserProfile;
  carrierStatus: 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  onOpenProfile: () => void;
  onLogout?: () => void;
}

export const TransporterHeader: React.FC<TransporterHeaderProps> = ({
  user,
  carrierStatus,
  onOpenProfile,
  onLogout,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.topHeader}>
      {/* Top-Left: Profile Avatar & Carrier Info (Tap to slide open drawer from left to right) */}
      <TouchableOpacity
        style={{ flex: 1, marginRight: 8 }}
        onPress={onOpenProfile}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {/* Circular Carrier Avatar with Live Verification Dot */}
          <View style={styles.profileAvatarBox}>
            <Text style={styles.profileAvatarLetter}>
              {user?.companyName ? user.companyName.charAt(0).toUpperCase() : 'T'}
            </Text>
            <View
              style={[
                styles.avatarStatusDot,
                carrierStatus === 'VERIFIED'
                  ? { backgroundColor: '#22C55E' }
                  : carrierStatus === 'PENDING'
                  ? { backgroundColor: '#F59E0B' }
                  : { backgroundColor: '#EF4444' },
              ]}
            />
          </View>

          {/* Carrier Company & Tap Indicator */}
          <View style={{ flex: 1, minWidth: 0, paddingRight: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.brandTitle} numberOfLines={1} ellipsizeMode="tail">
                {user?.companyName || t('carrierTitle')}
              </Text>
              <Ionicons name="chevron-forward" size={13} color="#94A3B8" />
            </View>
            <Text style={styles.companySub} numberOfLines={1}>
              {user?.fullName || 'Carrier Fleet'} • {carrierStatus}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Top-Right: Language Switcher placed where logout was */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <LanguageSwitcher dark={true} />
      </View>
    </View>
  );
};
