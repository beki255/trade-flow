import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LoadItem, BidItem } from '../types';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';

const cleanStr = (str?: string) => (str ? String(str).replace(/^`+|`+$/g, '').trim() : '');

interface LoadsTabProps {
  loadsList: LoadItem[];
  filteredLoads: LoadItem[];
  directMatchRequests: BidItem[];
  submittedBids?: BidItem[];
  loadSearchQuery: string;
  setLoadSearchQuery: (val: string) => void;
  selectedRouteFilter?: string;
  setSelectedRouteFilter?: (val: string) => void;
  selectedCargoFilter?: string;
  setSelectedCargoFilter?: (val: string) => void;
  selectedTonnageFilter?: string;
  setSelectedTonnageFilter?: (val: string) => void;
  onSelectLoadForQuote: (load: LoadItem) => void;
  onRespondDirectOffer: (bidId: string, action: 'ACCEPT' | 'REJECT') => void;
  onDeleteBid?: (bid: BidItem) => void;
  onViewBidInMyBids?: (bid: BidItem) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const LoadsTab: React.FC<LoadsTabProps> = ({

  loadsList,
  filteredLoads,
  directMatchRequests,
  submittedBids = [],
  loadSearchQuery,
  setLoadSearchQuery,
  onSelectLoadForQuote,
  onRespondDirectOffer,
  onDeleteBid,
  onViewBidInMyBids,
  onRefresh,
  isRefreshing,
}) => {
  const { colors, isDark } = useTheme();
  const { t, language } = useLanguage();
  const [expandedLoadId, setExpandedLoadId] = useState<string | null>(null);
  const [corridorFilter, setCorridorFilter] = useState<'ALL' | 'DJI_TO_ADDIS' | 'ADDIS_TO_DJI' | 'HEAVY'>('ALL');

  // Helpers to accurately determine corridor direction
  const isDjiOrigin = (item: LoadItem) => {
    const o = (item.origin || '').toLowerCase();
    const routeO = (item.route || '').split(/[➔→\->]+/)[0]?.toLowerCase() || '';
    return (
      o.includes('djibouti') ||
      o.includes('doraleh') ||
      o.includes('dji') ||
      routeO.includes('djibouti') ||
      routeO.includes('doraleh') ||
      routeO.includes('dji')
    );
  };

  const isDjiDest = (item: LoadItem) => {
    const d = (item.destination || '').toLowerCase();
    const routeD = (item.route || '').split(/[➔→\->]+/)[1]?.toLowerCase() || '';
    return (
      d.includes('djibouti') ||
      d.includes('doraleh') ||
      d.includes('dji') ||
      routeD.includes('djibouti') ||
      routeD.includes('doraleh') ||
      routeD.includes('dji')
    );
  };

  // Accurate Counts for each segment
  const djiToAddisCount = filteredLoads.filter((l) => isDjiOrigin(l) && !isDjiDest(l)).length;
  const addisToDjiCount = filteredLoads.filter((l) => isDjiDest(l) && !isDjiOrigin(l)).length;
  const heavyCount = filteredLoads.filter((l) => {
    const w = l.weightTons || parseFloat(l.weight || '0');
    return w >= 40 || (l.weight || '').toLowerCase().includes('100');
  }).length;

  // Filter loads by quick corridor segment accurately
  const displayedLoads = filteredLoads.filter((item) => {
    if (corridorFilter === 'ALL') return true;
    if (corridorFilter === 'DJI_TO_ADDIS') {
      return isDjiOrigin(item) && !isDjiDest(item);
    }
    if (corridorFilter === 'ADDIS_TO_DJI') {
      return isDjiDest(item) && !isDjiOrigin(item);
    }
    if (corridorFilter === 'HEAVY') {
      const w = item.weightTons || parseFloat(item.weight || '0');
      return w >= 40 || (item.weight || '').toLowerCase().includes('100');
    }
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header Row: Title & Active Count */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.pageTitle}>{t('loadBoardTitle') || (language === 'AM' ? 'የኮሪደር ጭነቶች ቦርድ' : language === 'OM' ? 'Gabatee Fe’iinsaa Koriidarii' : 'Corridor Load Board')}</Text>
          <Text style={styles.pageSubtitle}>
            {language === 'AM'
              ? `${displayedLoads.length} የሚገኙ የኮሪደር ጭነቶች`
              : language === 'OM'
              ? `Fe’iinsa koriidarii ${displayedLoads.length} qophaa’an`
              : `${displayedLoads.length} available consignment${displayedLoads.length === 1 ? '' : 's'} on corridor`}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {onRefresh && (
            <TouchableOpacity
              onPress={onRefresh}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#F0F9FF',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#BAE6FD',
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="reload"
                size={16}
                color={isRefreshing ? '#94A3B8' : '#0284C7'}
              />
            </TouchableOpacity>
          )}

          <View style={styles.activePill}>
            <View style={styles.activeDot} />
            <Text style={styles.activePillText}>
              {displayedLoads.length} {language === 'AM' ? 'ንቁ' : language === 'OM' ? 'Hojiirra' : 'Active'}
            </Text>
          </View>
        </View>
      </View>

      {/* Direct AI Instant Match Requests (Compact Alert Banner) */}
      {directMatchRequests.length > 0 && (
        <View style={{ gap: 8, marginVertical: 4 }}>
          {directMatchRequests.map((req) => (
            <View key={req.id} style={styles.aiMatchCard}>
              <View style={styles.aiMatchTopRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                  <Ionicons name="flash" size={15} color="#D97706" />
                  <Text style={styles.aiMatchTitle} numberOfLines={1}>
                    {language === 'AM' ? 'የ AI ማዛመጃ:' : language === 'OM' ? 'Walsimsiisa AI:' : 'AI Match:'} {req.loadTitle}
                  </Text>
                </View>
                <Text style={styles.aiMatchPrice}>{req.price}</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 5 }}>
                <Ionicons name="location-outline" size={13} color="#0284C7" style={{ marginTop: 2 }} />
                <Text style={styles.aiMatchRoute}>
                  {req.route} • {req.weight || (language === 'AM' ? 'ሙሉ ጭነት' : language === 'OM' ? 'Fe’iisa Guutuu' : 'Full Load')}
                </Text>
              </View>

              <View style={styles.aiMatchActionsRow}>
                <TouchableOpacity
                  style={styles.aiAcceptBtn}
                  onPress={() => onRespondDirectOffer(req.rawId || req.id, 'ACCEPT')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.aiAcceptBtnText}>
                    {language === 'AM' ? 'ተቀበል እና አሰማራ ➔' : language === 'OM' ? 'Fudhadhu & Ergi ➔' : 'Accept & Dispatch ➔'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.aiDeclineBtn}
                  onPress={() => onRespondDirectOffer(req.rawId || req.id, 'REJECT')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.aiDeclineBtnText}>
                    {language === 'AM' ? 'አትቀበል' : language === 'OM' ? 'Didi' : 'Decline'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Sleek Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder={language === 'AM' ? 'በጭነት፣ መስመር ወይም ክብደት ፈልግ...' : language === 'OM' ? 'Gosa meeshaa, daandii ykn ulfaatinan barbaadi...' : 'Search by cargo, route, or weight...'}
          placeholderTextColor="#94A3B8"
          value={loadSearchQuery}
          onChangeText={setLoadSearchQuery}
          returnKeyType="search"
        />
        {loadSearchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setLoadSearchQuery('')} style={{ padding: 4 }}>
            <Ionicons name="close-circle" size={16} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Corridor Filter Pills (Scalable for 10-100 loads) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterPillsRow}
      >
        {(
          [
            {
              key: 'ALL',
              label: `${language === 'AM' ? 'ሁሉም ጭነቶች' : language === 'OM' ? 'Fe’iinsa Hunda' : 'All Loads'} (${filteredLoads.length})`,
            },
            {
              key: 'DJI_TO_ADDIS',
              label: `${language === 'AM' ? 'ጅቡቲ ➔ አዲስ አበባ' : 'Djibouti ➔ Addis'} (${djiToAddisCount})`,
            },
            {
              key: 'ADDIS_TO_DJI',
              label: `${language === 'AM' ? 'አዲስ አበባ ➔ ጅቡቲ' : 'Addis ➔ Djibouti'} (${addisToDjiCount})`,
            },
            {
              key: 'HEAVY',
              label: `${language === 'AM' ? 'ከባድ (>40t)' : language === 'OM' ? 'Cimaa (>40t)' : 'Heavy (>40t)'} (${heavyCount})`,
            },
          ] as const
        ).map((f) => {
          const active = corridorFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setCorridorFilter(f.key)}
              style={[styles.filterPill, active && styles.filterPillActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* High-Density, Scalable Loads List */}
      {displayedLoads.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="cube-outline" size={38} color="#94A3B8" />
          <Text style={styles.emptyTitle}>
            {language === 'AM' ? 'ምንም የተገኘ ጭነት የለም' : language === 'OM' ? 'Fe’iinsi Hin Argamne' : 'No Consignments Found'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {loadSearchQuery
              ? (language === 'AM' ? `ከ "${loadSearchQuery}" ጋር የሚዛመድ ጭነት የለም። ፍለጋውን ያጽዱ።` : language === 'OM' ? `"${loadSearchQuery}" wajjin kan walsimu hin argamne.` : `No corridor freight matching "${loadSearchQuery}". Try clearing search.`)
              : corridorFilter !== 'ALL'
              ? (language === 'AM' ? 'በተመረጠው የኮሪደር መስመር ላይ አሁን የሚገኝ ጭነት የለም።' : language === 'OM' ? 'Koriidarii filatame irratti fe’iinsi hin jiru.' : 'No active freight along this corridor segment currently.')
              : (language === 'AM' ? 'በኮሪደሩ ላይ የሚለጠፉ አዳዲስ ጭነቶች እዚህ በቀጥታ ይታያሉ።' : language === 'OM' ? 'Fe’iinsi haaraan koriidarii irratti yeroo qabatamaatti asitti mul’ata.' : 'New freight postings along the corridor will display here in real-time.')}
          </Text>
          {loadSearchQuery ? (
            <TouchableOpacity onPress={() => setLoadSearchQuery('')} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>
                {language === 'AM' ? 'የፍለጋ ማጣሪያን አጽዳ' : language === 'OM' ? 'Barbaacha Haqi' : 'Clear Search Filters'}
              </Text>
            </TouchableOpacity>
          ) : corridorFilter !== 'ALL' ? (
            <TouchableOpacity onPress={() => setCorridorFilter('ALL')} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>
                {language === 'AM' ? 'ሁሉንም ጭነቶች አሳይ' : language === 'OM' ? 'Fe’iinsa Hunda Agarsiisi' : 'Show All Loads'}
              </Text>
            </TouchableOpacity>
          ) : (
            onRefresh && (
              <TouchableOpacity
                onPress={onRefresh}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: '#0284C7',
                  paddingHorizontal: 16,
                  paddingVertical: 9,
                  borderRadius: 12,
                  marginTop: 6,
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="reload" size={16} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>
                  {language === 'AM' ? 'ጭነቶችን አድስ' : language === 'OM' ? 'Fe’iinsa Haaresi' : 'Refresh Loads'}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      ) : (
        displayedLoads.map((item, idx) => {
          const isExpanded = expandedLoadId === (item.id || String(idx));
          const existingBid = submittedBids.find(
            (b) =>
              (b.loadId === item.id ||
               (b.rawLoadId && item.rawId && b.rawLoadId === item.rawId) ||
               b.rawId === item.id ||
               (item.title && b.loadTitle === item.title)) &&
              b.status !== 'REJECTED'
          );

          const isAccepted = existingBid?.status === 'ACCEPTED';
          const isBidDispatched = Boolean(existingBid?.dispatchedTruck && existingBid?.dispatchedDriver);
          const isLoadBooked =
            item.isDispatched ||
            ((item.status === 'IN_TRANSIT' || item.status === 'COMPLETED') && !!item.dispatchedTruck);

          return (
            <View key={item.id || idx} style={styles.loadCard}>
              {/* Card Header: Cargo, Weight & Budget */}
              <View style={styles.loadCardHeader}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.cargoTitle} numberOfLines={2}>
                    {cleanStr(item.title)}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    <View style={styles.weightBadge}>
                      <Text style={styles.weightBadgeText}>
                        {cleanStr(item.weight) || (language === 'AM' ? 'ሙሉ ጭነት' : language === 'OM' ? 'Fe\'isa Guutuu' : 'Full Load')}
                      </Text>
                    </View>
                    <Text style={styles.cargoTypeSub} numberOfLines={1}>
                      {cleanStr(item.cargoType) || (language === 'AM' ? 'አጠቃላይ ጭነት' : language === 'OM' ? 'Fe\'isa Waliigalaa' : 'General Freight')}
                    </Text>
                  </View>
                </View>

                {/* Price / Budget */}
                <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                  <Text style={styles.budgetText}>
                    {item.budget || (existingBid ? existingBid.price : (language === 'AM' ? 'ክፍት ጨረታ' : language === 'OM' ? 'Caalbaasii Banaa' : 'Open for Bids'))}
                  </Text>
                  <Text style={styles.budgetLabel}>
                    {item.budget
                      ? (language === 'AM' ? 'የታለመ በጀት' : language === 'OM' ? 'Baajata Karoorfame' : 'Target Budget')
                      : existingBid
                      ? (language === 'AM' ? 'የእርስዎ ዋጋ' : language === 'OM' ? 'Gatii Keessan' : 'Your Bid')
                      : (language === 'AM' ? 'የጨረታ ሁኔታ' : language === 'OM' ? 'Haala Caalbaasii' : 'Bid Status')}
                  </Text>
                </View>
              </View>

              {/* Key Tags & Details Toggle Row */}
              <View style={styles.tagsRow}>
                <View style={styles.miniTag}>
                  <Text style={styles.miniTagText}>
                    {item.shipperName || (language === 'AM' ? 'የተረጋገጠ ላኪ' : language === 'OM' ? 'Ergaa Qulqullaa\'e' : 'Direct Shipper')}
                  </Text>
                </View>
                <View style={styles.miniTag}>
                  <Text style={styles.miniTagText}>40ft High-Cube</Text>
                </View>
                <View style={[styles.miniTag, styles.escrowTag]}>
                  <Ionicons name="shield-checkmark" size={10} color="#059669" />
                  <Text style={styles.escrowTagText}>
                    {language === 'AM' ? 'የተረጋገጠ ክፍያ' : language === 'OM' ? 'Kaffaltii Qophaa\'e' : 'Escrow Ready'}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setExpandedLoadId(isExpanded ? null : (item.id || String(idx)))}
                  style={styles.expandToggle}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.expandToggleText}>
                    {isExpanded
                      ? (language === 'AM' ? 'አሳንስ' : language === 'OM' ? 'Gabaabsi' : 'Less')
                      : (language === 'AM' ? 'ዝርዝር' : language === 'OM' ? 'Bal\'ina' : 'Details')}
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={11}
                    color="#0284C7"
                  />
                </TouchableOpacity>
              </View>

              {/* Collapsible Details Drawer (Origin, Destination & Info - ONLY shown when Details is clicked) */}
              {isExpanded && (() => {
                const originAddr = cleanStr(
                  item.origin && item.origin.trim().length > 0
                    ? item.origin
                    : item.route?.split(/[➔→\->]+/)[0]?.trim() || 'Addis Ababa Kaliti Hub'
                );

                const destAddr = cleanStr(
                  item.destination && item.destination.trim().length > 0
                    ? item.destination
                    : item.route?.split(/[➔→\->]+/)[1]?.trim() || 'Djibouti Doraleh Port'
                );

                return (
                  <View style={styles.expandedDetailsBox}>
                    {/* Full Waypoint Route Display - Never Truncated */}
                    <View style={styles.waypointRouteCard}>
                      {/* Origin */}
                      <View style={styles.waypointRow}>
                        <View style={styles.waypointIndicator}>
                          <View style={styles.originMarkerDot} />
                          <View style={styles.waypointConnectingLine} />
                        </View>
                        <View style={styles.waypointContent}>
                          <Text style={styles.waypointTypeLabel}>
                            {language === 'AM' ? 'መነሻ ቦታ (ORIGIN)' : language === 'OM' ? 'Ka\'umsa (Origin)' : 'ORIGIN / PICKUP'}
                          </Text>
                          <Text style={styles.waypointAddressText}>
                            {originAddr}
                          </Text>
                        </View>
                      </View>

                      {/* Destination */}
                      <View style={styles.waypointRow}>
                        <View style={styles.waypointIndicator}>
                          <View style={styles.destMarkerDot} />
                        </View>
                        <View style={styles.waypointContent}>
                          <Text style={styles.waypointTypeLabel}>
                            {language === 'AM' ? 'መድረሻ ቦታ (DESTINATION)' : language === 'OM' ? 'Gahumsa (Destination)' : 'DELIVERY DESTINATION'}
                          </Text>
                          <Text style={styles.waypointAddressText}>
                            {destAddr}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Shipper & Guarantee Row */}
                    <View style={styles.secondaryDetailsRow}>
                      <View style={styles.secondaryDetailItem}>
                        <Ionicons name="business" size={12} color="#0284C7" />
                        <Text style={styles.secondaryDetailText} numberOfLines={1}>
                          {item.shipperName || (language === 'AM' ? 'ቀጥተኛ ላኪ' : language === 'OM' ? 'Ergaa Kallattii' : 'Direct Shipper')}{item.shipperPhone ? ` • ${item.shipperPhone}` : ''}
                        </Text>
                      </View>
                      <View style={styles.secondaryDetailItem}>
                        <Ionicons name="shield-checkmark" size={12} color="#059669" />
                        <Text style={styles.secondaryDetailText} numberOfLines={1}>
                          {language === 'AM' ? 'የተሟላ የዕቃ ዋስትና' : language === 'OM' ? 'Wabiin GIT Mirkanaa\'e' : 'GIT Insured'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })()}

              {/* Action / Status Footer (Single clean row, no nested boxes!) */}
              <View style={styles.cardFooter}>
                {existingBid ? (
                  isBidDispatched ? (
                    /* Dispatched: Clean compact green indicator */
                    <View style={styles.statusPillDispatched}>
                      <Ionicons name="checkmark-circle" size={14} color="#15803D" />
                      <Text style={styles.statusPillDispatchedText} numberOfLines={1}>
                        {language === 'AM' ? 'ተልኳል:' : language === 'OM' ? 'Ergameera:' : 'Dispatched:'} {existingBid.dispatchedTruck} • {existingBid.dispatchedDriver}
                      </Text>
                    </View>
                  ) : isAccepted ? (
                    !existingBid?.isEscrowLocked ? (
                      <View style={[styles.statusPillPending, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                        <Ionicons name="lock-closed" size={13} color="#D97706" />
                        <Text style={[styles.statusPillPendingText, { color: '#92400E' }]}>
                          {language === 'AM' ? 'አሸንፈዋል • የላኪው የኤስክሮው ተቀማጭ በመጠባበቅ ላይ' : language === 'OM' ? 'Injifattaniittu • Qabsiisa kaffaltii eegaa jira' : 'Won • Awaiting Shipper Escrow Deposit'}
                        </Text>
                      </View>
                    ) : (
                      /* Won & Escrow Secured: Clean CTA button to dispatch */
                      <TouchableOpacity
                        style={styles.assignFleetBtn}
                        onPress={() =>
                          onViewBidInMyBids ? onViewBidInMyBids(existingBid) : onSelectLoadForQuote(item)
                        }
                        activeOpacity={0.85}
                      >
                        <Ionicons name="trophy" size={13} color="#FFFFFF" />
                        <Text style={styles.assignFleetBtnText}>
                          {language === 'AM' ? 'አሸንፈዋል! መኪና እና አሽከርካሪ ይመድቡ ➔' : language === 'OM' ? 'Injifattaniittu! Konkolaataa fi Ofeessaa Ramadaa ➔' : 'Won! Assign Truck & Driver ➔'}
                        </Text>
                      </TouchableOpacity>
                    )
                  ) : (
                    /* Pending Bid */
                    <View style={styles.statusPillPending}>
                      <Ionicons name="time" size={13} color="#B45309" />
                      <Text style={styles.statusPillPendingText}>
                        {language === 'AM' ? 'የቀረበ ዋጋ:' : language === 'OM' ? 'Gatiin Dhiyaate:' : 'Quote Placed:'} {existingBid.price} ({language === 'AM' ? 'በሂደት ላይ' : language === 'OM' ? 'Adeemsarra' : 'Pending'})
                      </Text>
                      {onDeleteBid && (
                        <TouchableOpacity
                          onPress={() => onDeleteBid(existingBid)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text style={styles.withdrawLink}>
                            {language === 'AM' ? 'ሰርዝ' : language === 'OM' ? 'Haqi' : 'Withdraw'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )
                ) : isLoadBooked ? (
                  <View style={styles.statusPillLocked}>
                    <Ionicons name="lock-closed" size={12} color="#64748B" />
                    <Text style={styles.statusPillLockedText}>
                      {language === 'AM' ? 'ለመኪና ተመድቧል' : language === 'OM' ? 'Konkolaataaf Ramadameera' : 'Assigned to Fleet'}
                    </Text>
                  </View>
                ) : (
                  /* Available to Quote: Sleek Primary Button */
                  <TouchableOpacity
                    style={styles.quoteBtn}
                    onPress={() => onSelectLoadForQuote(item)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.quoteBtnText}>
                      {language === 'AM' ? 'የጭነት ዋጋ አቅርብ ➔' : language === 'OM' ? 'Gatii Fe\'isaa Dhiyeessi ➔' : 'Quote Freight Rate ➔'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
  },
  aiMatchCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 6,
  },
  aiMatchTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiMatchTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  aiMatchPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#B45309',
  },
  aiMatchRoute: {
    fontSize: 11.5,
    color: '#78350F',
    fontWeight: '600',
    flex: 1,
    flexWrap: 'wrap',
    lineHeight: 16,
  },
  aiMatchActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  aiAcceptBtn: {
    flex: 1,
    backgroundColor: '#16A34A',
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
  },
  aiAcceptBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  aiDeclineBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  aiDeclineBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
    ...Platform.select({
      web: { boxShadow: '0 1px 3px rgba(0,0,0,0.03)' } as any,
      default: { elevation: 1 },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#0F172A',
    paddingVertical: 6,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  loadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    ...Platform.select({
      web: { boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)' } as any,
      default: { elevation: 1 },
    }),
  },
  loadCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cargoTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  weightBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  weightBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0369A1',
  },
  cargoTypeSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  budgetText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0284C7',
  },
  budgetLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  routeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  miniTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  miniTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  escrowTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
  },
  escrowTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 'auto',
  },
  expandToggleText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  expandedDetailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginTop: 4,
  },
  waypointRouteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  waypointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  waypointIndicator: {
    alignItems: 'center',
    width: 14,
    paddingTop: 3,
  },
  originMarkerDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#059669',
  },
  waypointConnectingLine: {
    width: 2,
    height: 20,
    backgroundColor: '#CBD5E1',
    marginVertical: 2,
    borderRadius: 1,
  },
  destMarkerDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#DC2626',
  },
  waypointContent: {
    flex: 1,
  },
  waypointTypeLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  waypointAddressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 17,
    flexWrap: 'wrap',
  },
  secondaryDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 2,
  },
  secondaryDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  secondaryDetailText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  cardFooter: {
    marginTop: 2,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  quoteBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 12,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)' } as any,
      default: { elevation: 2 },
    }),
  },
  quoteBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statusPillDispatched: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  statusPillDispatchedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    flex: 1,
  },
  assignFleetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingVertical: 9,
    borderRadius: 12,
  },
  assignFleetBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statusPillPending: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  statusPillPendingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  withdrawLink: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#DC2626',
  },
  statusPillLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingVertical: 7,
    borderRadius: 10,
  },
  statusPillLockedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginTop: 4,
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
});
