import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { driverStyles as styles } from '../driverStyles';

interface DriverTopHeaderProps {
  user?: any;
  onLogout: () => void;
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
  const photoUrl = user?.photoUrl || user?.roadworthinessDoc || user?.insuranceDoc;

  return (
    <>
      {/* Top Mobile Header */}
      <View style={styles.topHeader}>
        {/* Tapping driver info/avatar opens Profile Modal */}
        <TouchableOpacity
          style={{ flex: 1, marginRight: 12 }}
          onPress={onOpenProfile}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {/* Circular Profile Photo / Avatar */}
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: '#0284C7',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#38BDF8',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {photoUrl ? (
                <Image
                  source={{ uri: photoUrl }}
                  style={{ width: 42, height: 42, borderRadius: 21 }}
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

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.brandTitle} numberOfLines={1}>
                  {user?.fullName || 'TradeFlow Driver'}
                </Text>
                <Ionicons name="chevron-forward" size={13} color="#94A3B8" />
              </View>
              <Text style={styles.truckSub} numberOfLines={1}>
                {user?.driverProfile?.licenseClass || 'Grade 5 Heavy'} • {user?.driverProfile?.assignedVehicle?.plateNumber || 'Fleet Vehicle'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Right side: ONLY Logout button (Profile button removed as requested) */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Emergency SOS Banner Button */}
      <TouchableOpacity
        style={[styles.sosBanner, sosActive && styles.sosBannerActive]}
        onPress={onToggleSos}
        activeOpacity={0.85}
      >
        <Ionicons name="warning" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={styles.sosText}>
          {sosActive ? 'SOS EMERGENCY SIGNAL ACTIVE (BROADCASTING)' : 'EMERGENCY SOS ASSISTANCE'}
        </Text>
      </TouchableOpacity>
    </>
  );
};
