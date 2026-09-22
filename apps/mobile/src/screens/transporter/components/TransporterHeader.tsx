import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { transporterStyles as styles } from '../transporterStyles';
import { UserProfile } from '../types';

interface TransporterHeaderProps {
  user?: UserProfile;
  carrierStatus: 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  onOpenProfile: () => void;
  onLogout: () => void;
}

export const TransporterHeader: React.FC<TransporterHeaderProps> = ({
  user,
  carrierStatus,
  onOpenProfile,
  onLogout,
}) => {
  return (
    <View style={styles.topHeader}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={styles.brandTitle}>TradeFlow Carrier</Text>
        <Text style={styles.companySub} numberOfLines={1}>
          {user?.companyName || 'Mulugeta Cross-Border Freight'}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity
          style={styles.profileHeaderContainer}
          onPress={onOpenProfile}
        >
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
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerLogoutBtn} onPress={onLogout}>
          <Text style={styles.headerLogoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
