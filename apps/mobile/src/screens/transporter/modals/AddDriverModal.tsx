import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { transporterStyles as styles } from '../transporterStyles';
import { TruckItem } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AddDriverModalProps {
  visible: boolean;
  onClose: () => void;
  driverFullName: string;
  setDriverFullName: (val: string) => void;
  driverPhone: string;
  setDriverPhone: (val: string) => void;
  driverLicense: string;
  setDriverLicense: (val: string) => void;
  driverCategory: string;
  setDriverCategory: (val: string) => void;
  driverExperience: string;
  setDriverExperience: (val: string) => void;
  driverAssignedPlate: string;
  setDriverAssignedPlate: (val: string) => void;
  availableTrucksForDriver: TruckItem[];
  showTruckDropdown: boolean;
  setShowTruckDropdown: (val: boolean) => void;
  onSubmit: () => void;
}

export const AddDriverModal: React.FC<AddDriverModalProps> = ({
  visible,
  onClose,
  driverFullName,
  setDriverFullName,
  driverPhone,
  setDriverPhone,
  driverLicense,
  setDriverLicense,
  driverCategory,
  setDriverCategory,
  driverExperience,
  setDriverExperience,
  driverAssignedPlate,
  setDriverAssignedPlate,
  availableTrucksForDriver,
  showTruckDropdown,
  setShowTruckDropdown,
  onSubmit,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={[styles.profileModalCard, { maxHeight: '90%' }]}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>Register Authorized Driver</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 12 }}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Driver Full Legal Name:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter driver's full name"
                placeholderTextColor="#94A3B8"
                value={driverFullName}
                onChangeText={setDriverFullName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Phone Number (Ethiopian / Djibouti):</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. +251 91 123 4567"
                placeholderTextColor="#94A3B8"
                value={driverPhone}
                onChangeText={setDriverPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Commercial Driving License No:</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. ETH-DL-984218"
                placeholderTextColor="#94A3B8"
                value={driverLicense}
                onChangeText={setDriverLicense}
              />
            </View>

            <Text style={styles.fieldLabel}>License Grade Category</Text>
            <View style={styles.typeSelectorRow}>
              {['Grade 5 Heavy', 'Grade 4 Medium', 'Special Cross-Border', 'Grade 3 Commercial'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.typeChip, driverCategory === cat && styles.typeChipActive]}
                  onPress={() => setDriverCategory(cat)}
                >
                  <Text style={[styles.typeChipText, driverCategory === cat && styles.typeChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Corridor Driving Experience (Years):</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 8"
                placeholderTextColor="#94A3B8"
                value={driverExperience}
                onChangeText={setDriverExperience}
                keyboardType="numeric"
              />
            </View>

            {/* Assigned Vehicle Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Assign Fleet Truck (Optional):</Text>
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => setShowTruckDropdown(!showTruckDropdown)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name="truck-outline" size={14} color="#0284C7" />
                  <Text style={styles.dropdownBtnText}>
                    {driverAssignedPlate || 'Unassigned (Select Truck)'}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#64748B' }}>{showTruckDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showTruckDropdown && (
                <View style={styles.dropdownMenu}>
                  <TouchableOpacity
                    style={[styles.dropdownItem, !driverAssignedPlate && styles.dropdownItemActive]}
                    onPress={() => {
                      setDriverAssignedPlate('');
                      setShowTruckDropdown(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, !driverAssignedPlate && styles.dropdownItemTextActive]}>
                      -- Leave Unassigned --
                    </Text>
                  </TouchableOpacity>
                  {availableTrucksForDriver.map((trk) => (
                    <TouchableOpacity
                      key={trk.id}
                      style={[styles.dropdownItem, driverAssignedPlate === trk.plate && styles.dropdownItemActive]}
                      onPress={() => {
                        setDriverAssignedPlate(trk.plate);
                        setShowTruckDropdown(false);
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <MaterialCommunityIcons name="truck" size={13} color="#0284C7" />
                        <Text style={[styles.dropdownItemText, driverAssignedPlate === trk.plate && styles.dropdownItemTextActive]}>
                          {trk.plate} ({trk.type})
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.submitBidBtn} onPress={onSubmit}>
              <Text style={styles.submitBidBtnText}>Register Authorized Fleet Driver</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
