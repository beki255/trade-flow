import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TabIcon } from '../../../components/TabIcon';
import { driverStyles as styles } from '../driverStyles';
import { DriverTabType } from '../types';

interface DriverBottomNavBarProps {
  activeTab: DriverTabType;
  onSelectTab: (tab: DriverTabType) => void;
}

export const DriverBottomNavBar: React.FC<DriverBottomNavBarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <View style={styles.bottomNavContainer}>
      <TouchableOpacity
        style={styles.navTab}
        onPress={() => onSelectTab('trip')}
      >
        <TabIcon
          name="trip"
          active={activeTab === 'trip'}
          size={22}
          color={activeTab === 'trip' ? '#0284C7' : '#94A3B8'}
        />
        <Text style={[styles.navLabel, activeTab === 'trip' && styles.navLabelActive]}>Trip</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navTab}
        onPress={() => onSelectTab('nav')}
      >
        <TabIcon
          name="nav"
          active={activeTab === 'nav'}
          size={22}
          color={activeTab === 'nav' ? '#0284C7' : '#94A3B8'}
        />
        <Text style={[styles.navLabel, activeTab === 'nav' && styles.navLabelActive]}>Route</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navTab}
        onPress={() => onSelectTab('checkin')}
      >
        <TabIcon
          name="checkin"
          active={activeTab === 'checkin'}
          size={22}
          color={activeTab === 'checkin' ? '#0284C7' : '#94A3B8'}
        />
        <Text style={[styles.navLabel, activeTab === 'checkin' && styles.navLabelActive]}>Check-in</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navTab}
        onPress={() => onSelectTab('incident')}
      >
        <TabIcon
          name="incident"
          active={activeTab === 'incident'}
          size={22}
          color={activeTab === 'incident' ? '#0284C7' : '#94A3B8'}
        />
        <Text style={[styles.navLabel, activeTab === 'incident' && styles.navLabelActive]}>Incident</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navTab}
        onPress={() => onSelectTab('pod')}
      >
        <TabIcon
          name="pod"
          active={activeTab === 'pod'}
          size={22}
          color={activeTab === 'pod' ? '#0284C7' : '#94A3B8'}
        />
        <Text style={[styles.navLabel, activeTab === 'pod' && styles.navLabelActive]}>e-POD</Text>
      </TouchableOpacity>
    </View>
  );
};
