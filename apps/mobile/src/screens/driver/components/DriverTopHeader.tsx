import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { driverStyles as styles } from '../driverStyles';

interface DriverTopHeaderProps {
  user?: any;
  onLogout: () => void;
  sosActive: boolean;
  onToggleSos: () => void;
}

export const DriverTopHeader: React.FC<DriverTopHeaderProps> = ({
  user,
  onLogout,
  sosActive,
  onToggleSos,
}) => {
  return (
    <>
      {/* Top Mobile Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.brandTitle}>TradeFlow Driver</Text>
          <Text style={styles.truckSub}>
            {user?.fullName || 'Driver Operations'} • {user?.driverProfile?.assignedVehicle?.plateNumber || 'Fleet Vehicle'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={13} color="#FFFFFF" style={{ marginRight: 3 }} />
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
