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
  onOpenNotifications?: () => void;
  unreadCount?: number;
  onLogout?: () => void;
}

export const TransporterHeader: React.FC<TransporterHeaderProps> = ({
  user,
  carrierStatus,
  onOpenProfile,
  onOpenNotifications,
  unreadCount = 0,
  onLogout,
}) => {
  const { t, language } = useLanguage();

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
            <Text
              style={styles.brandTitle}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.85}
            >
              {user?.companyName || t('carrierTitle')}
            </Text>
            <Text style={styles.companySub} numberOfLines={1}>
              {user?.fullName || (language === 'AM' ? 'የአጓጓዥ ድርጅት' : 'Carrier Fleet')} • {carrierStatus === 'VERIFIED' ? (language === 'AM' ? 'የተረጋገጠ' : language === 'OM' ? 'Mirkanaa\'e' : 'VERIFIED') : carrierStatus === 'PENDING' ? (language === 'AM' ? 'በመጠባበቅ ላይ' : language === 'OM' ? 'Eeggannoorra' : 'PENDING') : (language === 'AM' ? 'የታገደ' : language === 'OM' ? 'Dhoorkame' : 'SUSPENDED')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Top-Right: Notification Bell & Language Switcher */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {onOpenNotifications && (
          <TouchableOpacity
            onPress={onOpenNotifications}
            style={{
              position: 'relative',
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#1E293B',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#334155',
            }}
            activeOpacity={0.7}
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={16} color="#F8FAFC" />
            {unreadCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: -3,
                  right: -3,
                  minWidth: 15,
                  height: 15,
                  borderRadius: 7.5,
                  backgroundColor: '#EF4444',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 2,
                  borderWidth: 1.5,
                  borderColor: '#0F172A',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 8.5, fontWeight: '900' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        <LanguageSwitcher dark={true} />
      </View>
    </View>
  );
};
