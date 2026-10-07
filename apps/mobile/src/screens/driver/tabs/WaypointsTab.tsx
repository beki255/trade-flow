import React from 'react';
import {
  View,
  Text,
} from 'react-native';
import { driverStyles as styles } from '../driverStyles';
import { WaypointItem } from '../types';
import { useLanguage } from '../../../context/LanguageContext';

interface WaypointsTabProps {
  waypoints: WaypointItem[];
}

export const WaypointsTab: React.FC<WaypointsTabProps> = ({ waypoints }) => {
  const { t } = useLanguage();

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{t('corridorWaypoints')}</Text>
      
      {waypoints.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{t('noActiveRoute')}</Text>
          <Text style={styles.emptySub}>
            {t('noActiveRouteDesc')}
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
                      ? t('passedStatus')
                      : wp.status === 'ACTIVE_NOW'
                      ? t('currentStatus')
                      : t('upcomingStatus')}
                  </Text>
                </View>
                <Text style={styles.wpTime}>{t('statusLabel')}: {wp.time}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
