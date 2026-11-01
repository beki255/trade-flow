import React from 'react';
import {
  View,
  Text,
} from 'react-native';
import { useDriverStyles } from '../driverStyles';
import { WaypointItem } from '../types';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';

interface WaypointsTabProps {
  waypoints: WaypointItem[];
}

export const WaypointsTab: React.FC<WaypointsTabProps> = ({ waypoints }) => {
  const styles = useDriverStyles();
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();

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
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2, lineHeight: 15 }}>
                      {wp.description}
                    </Text>
                  )}

                  {/* Infrastructure Feature Badges (Fuel, Toll, Weighbridge, Customs) */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 5 }}>
                    {isToll && (
                      <View style={{ backgroundColor: isDark ? '#0C4A6E' : '#E0F2FE', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: isDark ? '#0284C7' : '#BAE6FD', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 9.5, fontWeight: '800', color: isDark ? '#38BDF8' : '#0369A1' }}>⚡ FastPass Toll (150 ETB)</Text>
                      </View>
                    )}
                    {isFuel && (
                      <View style={{ backgroundColor: isDark ? '#064E3B' : '#DCFCE7', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: isDark ? '#059669' : '#86EFAC', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 9.5, fontWeight: '800', color: isDark ? '#6EE7B7' : '#166534' }}>⛽ Diesel In Stock (61.2 ETB/L)</Text>
                      </View>
                    )}
                    {isWeigh && (
                      <View style={{ backgroundColor: isDark ? '#451A03' : '#FEF3C7', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: isDark ? '#B45309' : '#FDE68A', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 9.5, fontWeight: '800', color: isDark ? '#FDE68A' : '#92400E' }}>⚖️ Weighbridge (Max 40T)</Text>
                      </View>
                    )}
                    {isCustoms && (
                      <View style={{ backgroundColor: isDark ? '#3B0764' : '#EDE9FE', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: isDark ? '#7E22CE' : '#DDD6FE', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 9.5, fontWeight: '800', color: isDark ? '#C084FC' : '#5B21B6' }}>🛡️ Customs Single-Window</Text>
                      </View>
                    )}
                    {isDepot && !isToll && !isCustoms && (
                      <View style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 9.5, fontWeight: '800', color: isDark ? '#94A3B8' : '#334155' }}>🏛️ Cargo Inland Terminal</Text>
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
