import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { transporterStyles as styles } from '../transporterStyles';
import { TruckItem, DriverItem, BidItem } from '../types';

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
  const isAlreadyDispatched = Boolean(selectedBid?.dispatchedTruck && selectedBid?.dispatchedDriver);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={[styles.profileModalCard, { maxHeight: '85%' }]}>
          <View style={styles.modalHeaderRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.modalTitle}>Assign Fleet & Dispatch</Text>
              <Text style={{ fontSize: 11, color: '#64748B' }}>
                {selectedBid?.loadId} • {selectedBid?.loadTitle}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingVertical: 12 }}>
            {/* Route Summary */}
            <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 4 }}>
              <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Corridor Route</Text>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#0F172A', lineHeight: 18 }}>{selectedBid?.route}</Text>
              <Text style={{ fontSize: 11, color: '#0284C7', fontWeight: '700', marginTop: 2 }}>
                Accepted Rate: {selectedBid?.price} • Transit: {selectedBid?.hours}
              </Text>
            </View>

            {/* Already Dispatched Warning */}
            {isAlreadyDispatched && (
              <View style={{ backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#FECACA', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="lock-closed" size={18} color="#DC2626" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#DC2626' }}>
                    Consignment Already Dispatched
                  </Text>
                  <Text style={{ fontSize: 10.5, color: '#B91C1C', marginTop: 2 }}>
                    This load is already assigned to {selectedBid?.dispatchedTruck} • {selectedBid?.dispatchedDriver}. 1 load cannot be dispatched multiple times.
                  </Text>
                </View>
              </View>
            )}

            {/* Step 1: Select Fleet Vehicle */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#1E293B' }}>
                1. Select Available Fleet Vehicle *
              </Text>
              {fleetList.length === 0 ? (
                <Text style={{ fontSize: 11, color: '#EF4444', fontStyle: 'italic' }}>
                  No fleet vehicles registered. Please add a truck in the Fleet tab.
                </Text>
              ) : (
                <View style={styles.typeSelectorRow}>
                  {fleetList.map((trk) => {
                    const isBusy = trk.status === 'IN_TRANSIT';
                    return (
                      <TouchableOpacity
                        key={trk.id}
                        disabled={isBusy || isAlreadyDispatched}
                        style={[
                          styles.typeChip,
                          dispatchTruck === trk.plate && styles.typeChipActive,
                          isBusy && { opacity: 0.45, backgroundColor: '#F1F5F9' },
                        ]}
                        onPress={() => !isBusy && setDispatchTruck(trk.plate)}
                      >
                        <MaterialCommunityIcons
                          name="truck"
                          size={14}
                          color={dispatchTruck === trk.plate ? '#0284C7' : isBusy ? '#94A3B8' : '#64748B'}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={[
                            styles.typeChipText,
                            dispatchTruck === trk.plate && styles.typeChipTextActive,
                            isBusy && { color: '#94A3B8' },
                          ]}
                        >
                          {trk.plate} ({trk.type}) {isBusy ? '• In Transit' : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Step 2: Select Available Driver */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#1E293B' }}>
                2. Select Assigned Driver *
              </Text>
              {driversList.length === 0 ? (
                <Text style={{ fontSize: 11, color: '#EF4444', fontStyle: 'italic' }}>
                  No drivers registered. Please register a driver in the Fleet tab.
                </Text>
              ) : (
                <View style={styles.typeSelectorRow}>
                  {driversList.map((drv) => {
                    const isBusy = drv.status === 'IN_TRANSIT' || drv.status === 'ON_TRIP';
                    const isPending = drv.status === 'PENDING' || drv.verificationStatus === 'PENDING';
                    const isDisabled = isBusy || isAlreadyDispatched || isPending;

                    return (
                      <TouchableOpacity
                        key={drv.id}
                        disabled={isDisabled}
                        style={[
                          styles.typeChip,
                          dispatchDriver === drv.fullName && styles.typeChipActive,
                          isPending && { backgroundColor: '#FEF3C7', borderColor: '#FCD34D', opacity: 0.8 },
                          isBusy && { opacity: 0.45, backgroundColor: '#F1F5F9' },
                        ]}
                        onPress={() => !isDisabled && setDispatchDriver(drv.fullName)}
                      >
                        <Ionicons
                          name={isPending ? "time-outline" : "person-outline"}
                          size={13}
                          color={
                            dispatchDriver === drv.fullName
                              ? '#0284C7'
                              : isPending
                              ? '#B45309'
                              : isBusy
                              ? '#94A3B8'
                              : '#64748B'
                          }
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={[
                            styles.typeChipText,
                            dispatchDriver === drv.fullName && styles.typeChipTextActive,
                            isPending && { color: '#92400E', fontWeight: '700' },
                            isBusy && { color: '#94A3B8' },
                          ]}
                        >
                          {drv.fullName} ({drv.phone}) {isPending ? '• ⏳ Pending Admin Approval' : isBusy ? '• On Trip' : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Confirm Dispatch Button */}
            <TouchableOpacity
              style={[
                styles.submitBidBtn,
                { backgroundColor: '#16A34A', marginTop: 10 },
                (!dispatchTruck || !dispatchDriver || isAlreadyDispatched) && { opacity: 0.5 },
              ]}
              onPress={onConfirmDispatch}
              disabled={!dispatchTruck || !dispatchDriver || isAlreadyDispatched}
            >
              <Text style={styles.submitBidBtnText}>
                {isAlreadyDispatched ? 'Consignment Already Dispatched' : 'Confirm Fleet Dispatch & Start GPS'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
