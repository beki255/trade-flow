import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TabIcon } from '../../../components/TabIcon';
import { driverStyles as styles } from '../driverStyles';
import { DriverTabType } from '../types';
import { useLanguage } from '../../../context/LanguageContext';

interface DriverBottomNavBarProps {
  activeTab: DriverTabType;
  onSelectTab: (tab: DriverTabType) => void;
}

export const DriverBottomNavBar: React.FC<DriverBottomNavBarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.bottomNavContainer}>
      <TouchableOpacity
        style={styles.navTab}
        onPress={() => onSelectTab('trip')}
        activeOpacity={0.7}
      >
        <TabIcon
          name="trip"
          active={activeTab === 'trip'}
          size={21}
          color={activeTab === 'trip' ? '#0284C7' : '#94A3B8'}
        />
        <Text
          style={[styles.navLabel, activeTab === 'trip' && styles.navLabelActive]}
          numberOfLines={1}
        >
          {t('activeTripTab')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navTab}
        onPress={() => onSelectTab('nav')}
        activeOpacity={0.7}
      >
        <TabIcon
          name="nav"
          active={activeTab === 'nav'}
          size={21}
          color={activeTab === 'nav' ? '#0284C7' : '#94A3B8'}
        />
        <Text
          style={[styles.navLabel, activeTab === 'nav' && styles.navLabelActive]}
          numberOfLines={1}
        >
          {t('offlineNavTab')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navTab}
        onPress={() => onSelectTab('checkin')}
        activeOpacity={0.7}
      >
        <TabIcon
          name="checkin"
          active={activeTab === 'checkin'}
          size={21}
          color={activeTab === 'checkin' ? '#0284C7' : '#94A3B8'}
        />
        <Text
          style={[styles.navLabel, activeTab === 'checkin' && styles.navLabelActive]}
          numberOfLines={1}
        >
          {t('checkinTab')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navTab}
        onPress={() => onSelectTab('incident')}
        activeOpacity={0.7}
      >
        <TabIcon
          name="incident"
          active={activeTab === 'incident'}
          size={21}
          color={activeTab === 'incident' ? '#0284C7' : '#94A3B8'}
        />
        <Text
          style={[styles.navLabel, activeTab === 'incident' && styles.navLabelActive]}
          numberOfLines={1}
        >
          {t('incidentTab')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navTab}
        onPress={() => onSelectTab('pod')}
        activeOpacity={0.7}
      >
        <TabIcon
          name="pod"
          active={activeTab === 'pod'}
          size={21}
          color={activeTab === 'pod' ? '#0284C7' : '#94A3B8'}
        />
        <Text
          style={[styles.navLabel, activeTab === 'pod' && styles.navLabelActive]}
          numberOfLines={1}
        >
          {t('podTab')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
