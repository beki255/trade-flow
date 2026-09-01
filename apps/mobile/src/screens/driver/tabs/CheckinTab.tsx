import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { driverStyles as styles } from '../driverStyles';
import { CheckinRecord } from '../types';

interface CheckinTabProps {
  checkedInSuccess: string;
  checkinHistory: CheckinRecord[];
  onCheckin: () => void;
}

export const CheckinTab: React.FC<CheckinTabProps> = ({
  checkedInSuccess,
  checkinHistory,
  onCheckin,
}) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Offline GPS Waypoint Check-in</Text>

      {checkedInSuccess ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✓ {checkedInSuccess}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.infoLabel}>GPS Status:</Text>
        <Text style={styles.coordsText}>11.758° N, 41.834° E (Awash Arba)</Text>

        <TouchableOpacity style={styles.checkinBtn} onPress={onCheckin}>
          <Text style={styles.checkinBtnText}>Confirm GPS Check-In</Text>
        </TouchableOpacity>
      </View>

      {/* Checkin History */}
      {checkinHistory.length > 0 && (
        <View style={{ gap: 8, marginTop: 10 }}>
          <Text style={styles.sectionTitle}>Confirmed Check-ins</Text>
          {checkinHistory.map((chk) => (
            <View key={chk.id} style={styles.historyCard}>
              <Text style={styles.historyId}>{chk.id} • {chk.time}</Text>
              <Text style={styles.historyCoords}>{chk.coords}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
