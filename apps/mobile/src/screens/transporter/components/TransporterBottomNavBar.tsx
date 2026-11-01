import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TabIcon } from '../../../components/TabIcon';
import { useTransporterStyles } from '../transporterStyles';
import { TransporterTabType, BidItem } from '../types';
import { useLanguage } from '../../../context/LanguageContext';

interface TransporterBottomNavBarProps {
  activeTab: TransporterTabType;
  onSelectTab: (tab: TransporterTabType) => void;
  submittedBids: BidItem[];
  language?: string;
  onSelectBidsTab: () => void;
}

export const TransporterBottomNavBar: React.FC<TransporterBottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  submittedBids,
  onSelectBidsTab,
}) => {
  const styles = useTransporterStyles();
  const { t } = useLanguage();

  return (
    <View style={styles.bottomNavContainer}>
      <TouchableOpacity
        style={styles.navTab}
        onPress={() => onSelectTab('overview')}
      >
        <TabIcon
          name="overview"
          active={activeTab === 'overview'}
          size={22}
          color={activeTab === 'overview' ? '#0284C7' : '#94A3B8'}
        />
        <Text style={[styles.navLabel, activeTab === 'overview' && styles.navLabelActive]}>
          {t('overviewTab') || 'Overview'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navTab}
        onPress={() => onSelectTab('fleet')}
      >
        <TabIcon
          name="fleet"
          active={activeTab === 'fleet'}
          size={22}
          color={activeTab === 'fleet' ? '#0284C7' : '#94A3B8'}
        />
        <Text style={[styles.navLabel, activeTab === 'fleet' && styles.navLabelActive]}>
          {t('fleetTab')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navTab}
        onPress={() => onSelectTab('loads')}
      >
        <TabIcon
          name="loads"
          active={activeTab === 'loads'}
          size={22}
          color={activeTab === 'loads' ? '#0284C7' : '#94A3B8'}
        />
        <Text style={[styles.navLabel, activeTab === 'loads' && styles.navLabelActive]}>
          {t('loadBoardTab')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navTab}
        onPress={onSelectBidsTab}
      >
        <View style={{ position: 'relative' }}>
          <TabIcon
            name="bidding"
            active={activeTab === 'bidding'}
            size={22}
            color={activeTab === 'bidding' ? '#0284C7' : '#94A3B8'}
          />
          {submittedBids.length > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -8,
                backgroundColor: '#0284C7',
                borderRadius: 10,
                minWidth: 16,
                height: 16,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 3,
              }}
            >
              <Text style={{ fontSize: 9, color: '#FFFFFF', fontWeight: '800' }}>
                {submittedBids.length}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.navLabel, activeTab === 'bidding' && styles.navLabelActive]}>
          {t('myBidsTab')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navTab}
        onPress={() => onSelectTab('earnings')}
      >
        <TabIcon
          name="earnings"
          active={activeTab === 'earnings'}
          size={22}
          color={activeTab === 'earnings' ? '#0284C7' : '#94A3B8'}
        />
        <Text style={[styles.navLabel, activeTab === 'earnings' && styles.navLabelActive]}>
          {t('earningsTab')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
