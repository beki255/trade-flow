import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { driverStyles as styles } from '../driverStyles';
import { LanguageSwitcher } from '../../../components/LanguageSwitcher';
import { useLanguage } from '../../../context/LanguageContext';
import { isValidImageUri } from '../../../utils/imageUtils';
import { WarningIcon } from '../../../components/AppIcons';

interface DriverTopHeaderProps {
  user?: any;
  onLogout?: () => void;
  sosActive: boolean;
  onToggleSos: () => void;
  onOpenProfile: () => void;
}

export const DriverTopHeader: React.FC<DriverTopHeaderProps> = ({
  user,
  onLogout,
  sosActive,
  onToggleSos,
  onOpenProfile,
}) => {
  const { t } = useLanguage();
  const photoUrl = user?.photoUrl || user?.roadworthinessDoc || user?.insuranceDoc;

  return (
    <>
      {/* Top Mobile Header */}
      <View style={styles.topHeader}>
        {/* Tapping driver info/avatar opens Profile Modal */}
        <TouchableOpacity
          style={{ flex: 1, marginRight: 8 }}
          onPress={onOpenProfile}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {/* Circular Profile Photo / Avatar */}
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#0284C7',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#38BDF8',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {isValidImageUri(photoUrl) ? (
                <Image
                  source={{ uri: photoUrl }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person" size={20} color="#FFFFFF" />
              )}
              {/* Subtle edit camera badge */}
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="camera" size={8} color="#FFFFFF" />
              </View>
            </View>

            <View style={{ flex: 1, minWidth: 0, paddingRight: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Text style={styles.brandTitle} numberOfLines={1} ellipsizeMode="tail">
                  {user?.fullName || t('driverTitle')}
                </Text>
                <Ionicons name="chevron-forward" size={12} color="#94A3B8" />
              </View>
              <Text style={styles.truckSub} numberOfLines={1}>
                {user?.driverProfile?.licenseClass || 'Grade 5 Heavy'} • {user?.driverProfile?.assignedVehicle?.plateNumber || 'Fleet Vehicle'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Right side: Language Switcher placed at far right */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <LanguageSwitcher dark={true} />
        </View>
      </View>

      {/* Emergency SOS Banner Button */}
      <TouchableOpacity
        style={[styles.sosBanner, sosActive && styles.sosBannerActive]}
        onPress={onToggleSos}
        activeOpacity={0.85}
      >
        <WarningIcon
          size={14}
          color={sosActive ? '#FFFFFF' : '#EF4444'}
        />
        <Text style={[styles.sosText, sosActive && styles.sosTextActive, { marginLeft: 6 }]}>
          {sosActive ? t('sosActive') : t('sosEmergency')}
        </Text>
      </TouchableOpacity>
    </>
  );
};
