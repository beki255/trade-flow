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
          {waypoints.map((wp, idx) => {
            const isToll = wp.name.includes('Toll') || (wp as any).isTollGate;
            const isFuel = wp.name.includes('Fuel') || (wp as any).isFuelStation;
            const isWeigh = wp.name.includes('Weigh') || (wp as any).isWeighbridge;
            const isCustoms = wp.name.includes('Customs');
            const isDepot = wp.name.includes('Depot') || wp.name.includes('Dry Port') || wp.name.includes('Terminal');

            return (
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

                  {Boolean(wp.description) && (
                    <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2, lineHeight: 15 }}>
                      {wp.description}
                    </Text>
                  )}

                  {/* Infrastructure Feature Badges (Fuel, Toll, Weighbridge, Customs) */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 5 }}>
                    {isToll && (
                      <View style={{ backgroundColor: '#E0F2FE', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#BAE6FD', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#0369A1' }}>⚡ FastPass Toll (150 ETB)</Text>
                      </View>
                    )}
                    {isFuel && (
                      <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#86EFAC', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#166534' }}>⛽ Diesel In Stock (61.2 ETB/L)</Text>
                      </View>
                    )}
                    {isWeigh && (
                      <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#FDE68A', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#92400E' }}>⚖️ Weighbridge (Max 40T)</Text>
                      </View>
                    )}
                    {isCustoms && (
                      <View style={{ backgroundColor: '#EDE9FE', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#DDD6FE', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#5B21B6' }}>🛡️ Customs Single-Window</Text>
                      </View>
                    )}
                    {isDepot && !isToll && !isCustoms && (
                      <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#334155' }}>🏛️ Cargo Inland Terminal</Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.wpTime, { marginTop: 4 }]}>{t('statusLabel')}: {wp.time}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};
