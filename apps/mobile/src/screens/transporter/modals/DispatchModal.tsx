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
                  {fleetList.map((trk) => (
                    <TouchableOpacity
                      key={trk.id}
                      style={[styles.typeChip, dispatchTruck === trk.plate && styles.typeChipActive]}
                      onPress={() => setDispatchTruck(trk.plate)}
                    >
                      <MaterialCommunityIcons
                        name="truck"
                        size={14}
                        color={dispatchTruck === trk.plate ? '#0284C7' : '#64748B'}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.typeChipText, dispatchTruck === trk.plate && styles.typeChipTextActive]}>
                        {trk.plate} ({trk.type})
                      </Text>
                    </TouchableOpacity>
                  ))}
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
                  {driversList.map((drv) => (
                    <TouchableOpacity
                      key={drv.id}
                      style={[styles.typeChip, dispatchDriver === drv.fullName && styles.typeChipActive]}
                      onPress={() => setDispatchDriver(drv.fullName)}
                    >
                      <Ionicons
                        name="person-outline"
                        size={13}
                        color={dispatchDriver === drv.fullName ? '#0284C7' : '#64748B'}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.typeChipText, dispatchDriver === drv.fullName && styles.typeChipTextActive]}>
                        {drv.fullName} ({drv.phone})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Confirm Dispatch Button */}
            <TouchableOpacity
              style={[
                styles.submitBidBtn,
                { backgroundColor: '#16A34A', marginTop: 10 },
                (!dispatchTruck || !dispatchDriver) && { opacity: 0.5 },
              ]}
              onPress={onConfirmDispatch}
              disabled={!dispatchTruck || !dispatchDriver}
            >
              <Text style={styles.submitBidBtnText}>Confirm Fleet Dispatch & Start GPS</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
