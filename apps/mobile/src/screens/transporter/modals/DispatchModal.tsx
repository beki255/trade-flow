import React, { useRef, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TruckItem, DriverItem, BidItem } from '../types';
import { useTheme, ThemeColors } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

interface DispatchModalProps {
  visible: boolean;
  onClose: () => void;
  selectedBid: BidItem | null;
  fleetList: TruckItem[];
  driversList: DriverItem[];
  dispatchTruck: string;
  setDispatchTruck: (val: string) => void;
  dispatchDriver: string;
  setDispatchDriver: (val: string) => void;
  onConfirmDispatch: () => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  visible,
  onClose,
  selectedBid,
  fleetList,
  driversList,
  dispatchTruck,
  setDispatchTruck,
  dispatchDriver,
  setDispatchDriver,
  onConfirmDispatch,
}) => {
  const isWeb = Platform.OS === 'web';
  const { colors, isDark } = useTheme();
  const { t, language } = useLanguage();
  const modalStyles = useMemo(() => getDispatchModalStyles(colors, isDark), [colors, isDark]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: !isWeb,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 45,
          useNativeDriver: !isWeb,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.92);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: !isWeb,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 160,
        useNativeDriver: !isWeb,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const isAlreadyDispatched = Boolean(selectedBid?.dispatchedTruck && selectedBid?.dispatchedDriver);
  const isEscrowSecured = selectedBid?.isEscrowLocked !== false;

  // Extract consignment weight in Tons (e.g. "32.0 Tons" -> 32)
  const cargoWeightTons = parseFloat(
    (selectedBid?.weight || '').replace(/[^0-9.]/g, '')
  ) || 0;

  // Find selected truck capacity and verify capacity match
  const selectedTruckObj = fleetList.find((t) => t.plate === dispatchTruck);
  const selectedTruckCap = parseFloat((selectedTruckObj?.capacity || '').replace(/[^0-9.]/g, '')) || 0;
  const isSelectedTruckUnderCapacity = cargoWeightTons > 0 && selectedTruckCap > 0 && selectedTruckCap < cargoWeightTons;

  const canDispatch = Boolean(
    dispatchTruck &&
    dispatchDriver &&
    !isAlreadyDispatched &&
    isEscrowSecured &&
    !isSelectedTruckUnderCapacity
  );

  // Eligible trucks matching cargo weight and not busy
  const eligibleTrucksCount = fleetList.filter((t) => {
    if (t.status === 'IN_TRANSIT') return false;
    const truckCap = parseFloat((t.capacity || '').replace(/[^0-9.]/g, '')) || 0;
    return cargoWeightTons === 0 || truckCap >= cargoWeightTons;
  }).length;

  const availableDriversCount = driversList.filter(
    (d) =>
      d.status !== 'IN_TRANSIT' &&
      d.status !== 'ON_TRIP' &&
      d.status !== 'PENDING' &&
      d.verificationStatus !== 'PENDING'
  ).length;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={modalStyles.overlayContainer}>
        {/* Semi-transparent Dimmed Backdrop (Tap outside to close) */}
        <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose}>
          <Animated.View style={[modalStyles.backdropDimmer, { opacity: fadeAnim }]} />
        </Pressable>

        {/* Centered Floating Dialog Card with Fade & Scale Animation */}
        <Animated.View
          style={[
            modalStyles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Top Modal Header */}
          <View style={modalStyles.headerRow}>
            <View style={modalStyles.headerIconBadge}>
              <MaterialCommunityIcons name="truck-fast" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
              <Text style={modalStyles.headerTitle} numberOfLines={1}>
                Assign Fleet & Dispatch
              </Text>
              <Text style={modalStyles.headerSubTitle} numberOfLines={1}>
                {selectedBid?.loadId ? `${selectedBid.loadId} • ` : ''}
                {selectedBid?.loadTitle || 'Consignment Assignment'}
              </Text>
            </View>
            <TouchableOpacity
              style={modalStyles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={modalStyles.scrollBody}
          >
            {/* Corridor Route & Financial Snapshot Card */}
            <View style={modalStyles.routeCard}>
              <View style={modalStyles.routeHeaderRow}>
                <Ionicons name="navigate-circle" size={16} color="#0284C7" />
                <Text style={modalStyles.routeHeaderTag}>CORRIDOR JOURNEY</Text>
              </View>
              <Text style={modalStyles.routeMainText}>
                {selectedBid?.route || 'Djibouti Port ➔ Modjo Dry Port'}
              </Text>
              <View style={modalStyles.routeMetaRow}>
                {cargoWeightTons > 0 && (
                  <View style={[modalStyles.routeMetaPill, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                    <MaterialCommunityIcons name="weight" size={13} color="#15803D" />
                    <Text style={[modalStyles.routeMetaPillText, { color: '#15803D', fontWeight: '800' }]}>
                      Weight: {selectedBid?.weight || `${cargoWeightTons} Tons`}
                    </Text>
                  </View>
                )}
                <View style={modalStyles.routeMetaPill}>
                  <Ionicons name="cash-outline" size={13} color="#0369A1" />
                  <Text style={modalStyles.routeMetaPillText}>
                    Rate: {selectedBid?.price || 'Negotiated'}
                  </Text>
                </View>
                {selectedBid?.hours ? (
                  <View style={modalStyles.routeMetaPill}>
                    <Ionicons name="time-outline" size={13} color="#0369A1" />
                    <Text style={modalStyles.routeMetaPillText}>
                      Transit: {selectedBid.hours}
                    </Text>
                  </View>
                ) : null}
                {isEscrowSecured ? (
                  <View style={[modalStyles.routeMetaPill, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                    <Ionicons name="shield-checkmark" size={13} color="#059669" />
                    <Text style={[modalStyles.routeMetaPillText, { color: '#047857' }]}>
                      Escrow Secured
                    </Text>
                  </View>
                ) : (
                  <View style={[
                    modalStyles.routeMetaPill,
                    {
                      backgroundColor: isDark ? '#451A03' : '#FFFBEB',
                      borderColor: isDark ? '#B45309' : '#FDE68A',
                    },
                  ]}>
                    <Ionicons name="lock-closed" size={13} color={isDark ? '#FBBF24' : '#D97706'} />
                    <Text style={[modalStyles.routeMetaPillText, { color: isDark ? '#FDE68A' : '#92400E' }]}>
                      Awaiting Escrow
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Escrow Not Secured Warning */}
            {!isEscrowSecured && (
              <View style={[
                modalStyles.lockedBanner,
                {
                  backgroundColor: isDark ? '#451A03' : '#FFFBEB',
                  borderColor: isDark ? '#B45309' : '#FDE68A',
                },
              ]}>
                <Ionicons name="lock-closed" size={20} color={isDark ? '#FBBF24' : '#D97706'} />
                <View style={{ flex: 1 }}>
                  <Text style={[modalStyles.lockedBannerTitle, { color: isDark ? '#FDE68A' : '#92400E' }]}>
                    Digital Escrow Not Funded Yet
                  </Text>
                  <Text style={[modalStyles.lockedBannerSub, { color: isDark ? '#FCD34D' : '#B45309' }]}>
                    For your financial security, fleet assignment is blocked until the shipper deposits funds into TradeFlow Escrow. Once funded, you can assign your vehicle and driver immediately.
                  </Text>
                </View>
              </View>
            )}

            {/* Already Dispatched Warning */}
            {isAlreadyDispatched && (
              <View style={modalStyles.lockedBanner}>
                <Ionicons name="lock-closed" size={20} color="#DC2626" />
                <View style={{ flex: 1 }}>
                  <Text style={modalStyles.lockedBannerTitle}>
                    Consignment Already Dispatched
                  </Text>
                  <Text style={modalStyles.lockedBannerSub}>
                    This consignment is assigned to {selectedBid?.dispatchedTruck} • {selectedBid?.dispatchedDriver}. A load cannot be dispatched multiple times.
                  </Text>
                </View>
              </View>
            )}

            {/* STEP 1: Select Fleet Vehicle */}
            <View style={modalStyles.sectionContainer}>
              <View style={modalStyles.sectionHeaderRow}>
                <View style={modalStyles.stepNumberBadge}>
                  <Text style={modalStyles.stepNumberText}>1</Text>
                </View>
                <Text style={modalStyles.sectionTitle}>Select Fleet Vehicle</Text>
                <Text style={modalStyles.sectionCountText}>
                  ({eligibleTrucksCount} capacity-matched)
                </Text>
              </View>

              {fleetList.length === 0 ? (
                <View style={modalStyles.emptyBox}>
                  <MaterialCommunityIcons name="truck-outline" size={26} color="#94A3B8" />
                  <Text style={modalStyles.emptyText}>
                    No fleet vehicles registered in your account.
                  </Text>
                  <Text style={modalStyles.emptySubText}>
                    Please register a truck in your Fleet tab before dispatching.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 8 }}>
                  {fleetList.map((trk) => {
                    const isBusy = trk.status === 'IN_TRANSIT';
                    const isSelected = dispatchTruck === trk.plate;
                    const truckCap = parseFloat((trk.capacity || '').replace(/[^0-9.]/g, '')) || 0;
                    const isUnderCapacity = cargoWeightTons > 0 && truckCap > 0 && truckCap < cargoWeightTons;
                    const isDisabled = isBusy || isAlreadyDispatched || isUnderCapacity;

                    return (
                      <TouchableOpacity
                        key={trk.id}
                        disabled={isDisabled}
                        activeOpacity={0.7}
                        style={[
                          modalStyles.selectionCard,
                          isSelected && modalStyles.selectionCardActive,
                          isDisabled && modalStyles.selectionCardDisabled,
                          isUnderCapacity && {
                            borderColor: isDark ? '#991B1B' : '#FCA5A5',
                            backgroundColor: isDark ? '#450A0A' : '#FFF5F5',
                          },
                        ]}
                        onPress={() => !isDisabled && setDispatchTruck(trk.plate)}
                      >
                        {/* Truck Icon */}
                        <View
                          style={[
                            modalStyles.itemIconBox,
                            isSelected && modalStyles.itemIconBoxActive,
                            isBusy && { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                            isUnderCapacity && { backgroundColor: isDark ? '#450A0A' : '#FEE2E2' },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="truck"
                            size={20}
                            color={isSelected ? (isDark ? '#38BDF8' : '#0284C7') : isUnderCapacity ? (isDark ? '#F87171' : '#DC2626') : isBusy ? '#94A3B8' : (isDark ? '#94A3B8' : '#475569')}
                          />
                        </View>

                        {/* Truck Details */}
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text
                              style={[
                                modalStyles.itemTitle,
                                isSelected && { color: isDark ? '#38BDF8' : '#0369A1' },
                                isBusy && { color: '#94A3B8' },
                                isUnderCapacity && { color: isDark ? '#FCA5A5' : '#991B1B' },
                              ]}
                            >
                              {trk.plate}
                            </Text>
                            <View
                              style={[
                                modalStyles.itemTypeBadge,
                                isSelected && { backgroundColor: '#E0F2FE' },
                              ]}
                            >
                              <Text
                                style={[
                                  modalStyles.itemTypeBadgeText,
                                  isSelected && { color: '#0369A1' },
                                ]}
                              >
                                {trk.type || 'Standard'}
                              </Text>
                            </View>
                          </View>

                          {/* Capacity Matching Feedback */}
                          {isBusy ? (
                            <Text style={modalStyles.itemSub}>⛔ Currently in transit on another load</Text>
                          ) : isUnderCapacity ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                              <Ionicons name="alert-circle" size={13} color="#DC2626" />
                              <Text style={{ fontSize: 11, fontWeight: '800', color: '#DC2626' }}>
                                Under Capacity ({truckCap}T Max &lt; {cargoWeightTons}T Cargo)
                              </Text>
                            </View>
                          ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                              <Ionicons name="checkmark-circle" size={13} color="#059669" />
                              <Text style={{ fontSize: 11, fontWeight: '700', color: '#059669' }}>
                                Matched Capacity ({trk.capacity || `${truckCap} Tons`})
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Selection Radio Circle */}
                        <View
                          style={[
                            modalStyles.radioCircle,
                            isSelected && modalStyles.radioCircleActive,
                          ]}
                        >
                          {isSelected && (
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* STEP 2: Select Assigned Driver */}
            <View style={modalStyles.sectionContainer}>
              <View style={modalStyles.sectionHeaderRow}>
                <View style={modalStyles.stepNumberBadge}>
                  <Text style={modalStyles.stepNumberText}>2</Text>
                </View>
                <Text style={modalStyles.sectionTitle}>Select Assigned Driver</Text>
                <Text style={modalStyles.sectionCountText}>
                  ({availableDriversCount} available)
                </Text>
              </View>

              {driversList.length === 0 ? (
                <View style={modalStyles.emptyBox}>
                  <Ionicons name="person-outline" size={26} color="#94A3B8" />
                  <Text style={modalStyles.emptyText}>
                    No drivers registered in your fleet.
                  </Text>
                  <Text style={modalStyles.emptySubText}>
                    Please register a driver in the Fleet tab before dispatching.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 8 }}>
                  {driversList.map((drv) => {
                    const isBusy = drv.status === 'IN_TRANSIT' || drv.status === 'ON_TRIP';
                    const isPending =
                      drv.status === 'PENDING' || drv.verificationStatus === 'PENDING';
                    const isSelected = dispatchDriver === drv.fullName;
                    const isDisabled = isBusy || isAlreadyDispatched || isPending;

                    return (
                      <TouchableOpacity
                        key={drv.id}
                        disabled={isDisabled}
                        activeOpacity={0.7}
                        style={[
                          modalStyles.selectionCard,
                          isSelected && modalStyles.selectionCardActive,
                          isDisabled && modalStyles.selectionCardDisabled,
                          isPending && {
                            borderColor: isDark ? '#B45309' : '#FDE68A',
                            backgroundColor: isDark ? '#451A03' : '#FFFDF5',
                          },
                        ]}
                        onPress={() => !isDisabled && setDispatchDriver(drv.fullName)}
                      >
                        {/* Driver Avatar */}
                        <View
                          style={[
                            modalStyles.itemIconBox,
                            isSelected && modalStyles.itemIconBoxActive,
                            isPending && { backgroundColor: isDark ? '#78350F' : '#FEF3C7' },
                            isBusy && { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                          ]}
                        >
                          <Ionicons
                            name={isPending ? 'time-outline' : 'person'}
                            size={18}
                            color={
                              isSelected
                                ? (isDark ? '#38BDF8' : '#0284C7')
                                : isPending
                                ? (isDark ? '#FDE68A' : '#B45309')
                                : isBusy
                                ? '#94A3B8'
                                : (isDark ? '#94A3B8' : '#475569')
                            }
                          />
                        </View>

                        {/* Driver Details */}
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text
                              style={[
                                modalStyles.itemTitle,
                                isSelected && { color: isDark ? '#38BDF8' : '#0369A1' },
                                isBusy && { color: '#94A3B8' },
                              ]}
                            >
                              {drv.fullName}
                            </Text>
                            {isPending && (
                              <View style={modalStyles.pendingBadge}>
                                <Text style={modalStyles.pendingBadgeText}>
                                  ⏳ Pending Approval
                                </Text>
                              </View>
                            )}
                            {isBusy && (
                              <View style={modalStyles.busyBadge}>
                                <Text style={modalStyles.busyBadgeText}>On Trip</Text>
                              </View>
                            )}
                            {!isBusy && !isPending && (
                              <View style={modalStyles.verifiedBadge}>
                                <Text style={modalStyles.verifiedBadgeText}>Verified ✓</Text>
                              </View>
                            )}
                          </View>
                          <Text style={modalStyles.itemSub}>
                            {drv.phone ? `Phone: ${drv.phone}` : 'Driver account ready'}
                          </Text>
                        </View>

                        {/* Selection Radio Circle */}
                        <View
                          style={[
                            modalStyles.radioCircle,
                            isSelected && modalStyles.radioCircleActive,
                          ]}
                        >
                          {isSelected && (
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Selected Summary Pill */}
            {dispatchTruck && dispatchDriver ? (
              <View style={modalStyles.readyPillContainer}>
                <Ionicons name="checkmark-done-circle" size={18} color="#16A34A" />
                <View style={{ flex: 1 }}>
                  <Text style={modalStyles.readyPillTitle}>
                    Ready: {dispatchTruck} • {dispatchDriver}
                  </Text>
                  <Text style={modalStyles.readyPillSub}>
                    GPS streaming & digital waypoint corridor tracking will start immediately.
                  </Text>
                </View>
              </View>
            ) : null}
          </ScrollView>

          {/* Modal Footer CTA */}
          <View style={modalStyles.footerContainer}>
            <TouchableOpacity
              style={[
                modalStyles.submitButton,
                canDispatch ? modalStyles.submitButtonActive : modalStyles.submitButtonDisabled,
              ]}
              onPress={onConfirmDispatch}
              disabled={!canDispatch}
              activeOpacity={0.85}
            >
              <Ionicons
                name={canDispatch ? 'paper-plane' : 'lock-closed'}
                size={17}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={modalStyles.submitButtonText}>
                {isAlreadyDispatched
                  ? 'Consignment Already Dispatched'
                  : canDispatch
                  ? 'Confirm Fleet Dispatch & Start GPS'
                  : 'Select Truck & Driver to Dispatch'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={modalStyles.cancelButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={modalStyles.cancelButtonText}>Cancel & Go Back</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export const getDispatchModalStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  backdropDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 24,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  headerIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.2,
  },
  headerSubTitle: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  routeCard: {
    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  routeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  routeHeaderTag: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  routeMainText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 18,
  },
  routeMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  routeMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: isDark ? '#0C4A6E' : '#F0F9FF',
    borderWidth: 1,
    borderColor: isDark ? '#0284C7' : '#BAE6FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  routeMetaPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: isDark ? '#38BDF8' : '#0369A1',
  },
  lockedBanner: {
    backgroundColor: isDark ? '#450A0A' : '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: isDark ? '#991B1B' : '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lockedBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: isDark ? '#F87171' : '#DC2626',
  },
  lockedBannerSub: {
    fontSize: 11,
    color: isDark ? '#FCA5A5' : '#B91C1C',
    marginTop: 2,
    lineHeight: 15,
  },
  sectionContainer: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  sectionCountText: {
    fontSize: 11.5,
    color: colors.textMuted,
    fontWeight: '600',
  },
  selectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  selectionCardActive: {
    borderColor: '#0284C7',
    backgroundColor: isDark ? '#0C4A6E' : '#F0F9FF',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  selectionCardDisabled: {
    opacity: 0.5,
    backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
    borderColor: colors.border,
  },
  itemIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconBoxActive: {
    backgroundColor: isDark ? '#0369A1' : '#E0F2FE',
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.text,
  },
  itemSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemTypeBadge: {
    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: isDark ? '#94A3B8' : '#475569',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: isDark ? '#475569' : '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  radioCircleActive: {
    borderColor: '#0284C7',
    backgroundColor: '#0284C7',
  },
  emptyBox: {
    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  emptySubText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  pendingBadge: {
    backgroundColor: isDark ? '#451A03' : '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pendingBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: isDark ? '#FDE68A' : '#B45309',
  },
  busyBadge: {
    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  busyBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.textMuted,
  },
  verifiedBadge: {
    backgroundColor: isDark ? '#064E3B' : '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: isDark ? '#6EE7B7' : '#15803D',
  },
  readyPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#064E3B' : '#F0FDF4',
    borderWidth: 1,
    borderColor: isDark ? '#059669' : '#BBF7D0',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  readyPillTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: isDark ? '#A7F3D0' : '#15803D',
  },
  readyPillSub: {
    fontSize: 11,
    color: isDark ? '#6EE7B7' : '#166534',
    marginTop: 1,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    gap: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonActive: {
    backgroundColor: '#0284C7',
  },
  submitButtonDisabled: {
    backgroundColor: isDark ? '#334155' : '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
});
