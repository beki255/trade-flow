import React from 'react';
import {
  View,
  Text,
} from 'react-native';
import { driverStyles as styles } from '../driverStyles';
import { WaypointItem } from '../types';

interface WaypointsTabProps {
  waypoints: WaypointItem[];
}

export const WaypointsTab: React.FC<WaypointsTabProps> = ({ waypoints }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Corridor Waypoints & Checkpoints</Text>
      
      {waypoints.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Active Route Assigned</Text>
          <Text style={styles.emptySub}>
            Corridor waypoints and checkpoint clearance milestones will display here when a shipment is dispatched.
          </Text>
        </View>
      ) : (
        <View style={styles.timeline}>
          {waypoints.map((wp, idx) => (
            <View key={wp.id} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.dot,
                    wp.status === 'COMPLETED' && styles.dotCompleted,
                    wp.status === 'ACTIVE_NOW' && styles.dotActive,
                  ]}
                />
                {idx < waypoints.length - 1 && <View style={styles.line} />}
              </View>

              <View style={styles.timelineRight}>
                <View style={styles.wpHeader}>
                  <Text style={styles.wpName}>{wp.name}</Text>
                  <Text
                    style={[
                      styles.wpStatus,
                      wp.status === 'COMPLETED' && styles.statusCompletedText,
                      wp.status === 'ACTIVE_NOW' && styles.statusActiveText,
                    ]}
                  >
                    {wp.status === 'COMPLETED'
                      ? 'PASSED ✓'
                      : wp.status === 'ACTIVE_NOW'
                      ? 'CURRENT'
                      : 'UPCOMING'}
                  </Text>
                </View>
                <Text style={styles.wpTime}>Status: {wp.time}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
