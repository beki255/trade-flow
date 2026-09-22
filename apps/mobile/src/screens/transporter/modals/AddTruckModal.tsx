import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { transporterStyles as styles } from '../transporterStyles';
import { DriverItem } from '../types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface AddTruckModalProps {
  visible: boolean;
  onClose: () => void;
  truckPlate: string;
  setTruckPlate: (val: string) => void;
  truckType: string;
  setTruckType: (val: string) => void;
  truckFuelType: string;
  setTruckFuelType: (val: string) => void;
  truckCapacity: string;
  setTruckCapacity: (val: string) => void;
  truckDriver: string;
  setTruckDriver: (val: string) => void;
  insuranceDoc: boolean;
  setInsuranceDoc: (val: boolean) => void;
  roadworthinessDoc: boolean;
  setRoadworthinessDoc: (val: boolean) => void;
  driversList: DriverItem[];
  showDriverDropdown: boolean;
  setShowDriverDropdown: (val: boolean) => void;
  onSubmit: () => void;
}

export const AddTruckModal: React.FC<AddTruckModalProps> = ({
  visible,
  onClose,
  truckPlate,
  setTruckPlate,
  truckType,
  setTruckType,
  truckFuelType,
  setTruckFuelType,
  truckCapacity,
  setTruckCapacity,
  truckDriver,
  setTruckDriver,
  insuranceDoc,
  setInsuranceDoc,
  roadworthinessDoc,
  setRoadworthinessDoc,
  driversList,
  showDriverDropdown,
  setShowDriverDropdown,
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
            <Text style={styles.modalTitle}>Register Fleet Vehicle</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 12 }}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>License Plate Number (Ethiopia / Djibouti):</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 3-ET-A88421 or DJ-5542"
                placeholderTextColor="#94A3B8"
                value={truckPlate}
                onChangeText={setTruckPlate}
              />
            </View>

            <Text style={styles.fieldLabel}>Vehicle Body Type</Text>
            <View style={styles.typeSelectorRow}>
              {['Flatbed', 'Container Box', 'Bulk Tanker', 'Lowbed Heavy', 'Refrigerated'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeChip, truckType === type && styles.typeChipActive]}
                  onPress={() => setTruckType(type)}
                >
                  <Text style={[styles.typeChipText, truckType === type && styles.typeChipTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Fuel Type Selector */}
            <Text style={styles.fieldLabel}>Engine & Fuel Type</Text>
            <View style={styles.typeSelectorRow}>
              {[
                { key: 'Diesel', label: 'Diesel', icon: 'gas-station' },
                { key: 'Petrol', label: 'Petrol', icon: 'car' },
                { key: 'Electric', label: 'Electric', icon: 'lightning-bolt' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.typeChip,
                    { flexDirection: 'row', alignItems: 'center', gap: 4 },
                    truckFuelType === item.key && styles.typeChipActive,
                  ]}
                  onPress={() => setTruckFuelType(item.key)}
                >
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={13}
                    color={truckFuelType === item.key ? '#FFFFFF' : '#0284C7'}
                  />
                  <Text style={[styles.typeChipText, truckFuelType === item.key && styles.typeChipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payload Weight Capacity (Tons):</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 32.5"
                placeholderTextColor="#94A3B8"
                value={truckCapacity}
                onChangeText={setTruckCapacity}
                keyboardType="numeric"
              />
            </View>

            {/* Optional Assigned Driver Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Assigned Driver (Optional):</Text>
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => setShowDriverDropdown(!showDriverDropdown)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {truckDriver ? (
                    <Ionicons name="person" size={14} color="#0284C7" />
                  ) : (
                    <Ionicons name="person-outline" size={14} color="#64748B" />
                  )}
                  <Text style={styles.dropdownBtnText}>
                    {truckDriver || 'Unassigned (Select Driver)'}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#64748B' }}>{showDriverDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showDriverDropdown && (
                <View style={styles.dropdownMenu}>
                  <TouchableOpacity
                    style={[styles.dropdownItem, !truckDriver && styles.dropdownItemActive]}
                    onPress={() => {
                      setTruckDriver('');
                      setShowDriverDropdown(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, !truckDriver && styles.dropdownItemTextActive]}>
                      -- Leave Unassigned --
                    </Text>
                  </TouchableOpacity>
                  {driversList.map((drv) => {
                    const isAlreadyAssigned =
                      drv.assignedTruckPlate &&
                      drv.assignedTruckPlate !== '' &&
                      drv.assignedTruckPlate !== 'Unassigned';
                    return (
                      <TouchableOpacity
                        key={drv.id}
                        style={[
                          styles.dropdownItem,
                          truckDriver === drv.fullName && styles.dropdownItemActive,
                          isAlreadyAssigned && { opacity: 0.5, backgroundColor: '#F8FAFC' },
                        ]}
                        onPress={() => {
                          if (isAlreadyAssigned) {
                            Alert.alert(
                              'Driver Already Assigned',
                              `${drv.fullName} is already assigned to truck ${drv.assignedTruckPlate}. A driver cannot operate multiple trucks simultaneously.`
                            );
                            return;
                          }
                          setTruckDriver(drv.fullName);
                          setShowDriverDropdown(false);
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Ionicons name="person" size={13} color="#0284C7" />
                          <Text
                            style={[
                              styles.dropdownItemText,
                              truckDriver === drv.fullName && styles.dropdownItemTextActive,
                              isAlreadyAssigned && { color: '#94A3B8' },
                            ]}
                          >
                            {drv.fullName} {isAlreadyAssigned ? `(Assigned: ${drv.assignedTruckPlate})` : `(${drv.phone})`}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Mandatory Compliance Documents Upload */}
            <View style={styles.docUploadSection}>
              <Text style={styles.docSectionTitle}>MANDATORY FLEET COMPLIANCE</Text>
              
              <TouchableOpacity
                style={[styles.docUploadBox, insuranceDoc && styles.docUploadBoxActive]}
                onPress={() => {
                  setInsuranceDoc(!insuranceDoc);
                  Alert.alert('Document Attached', 'Goods-in-Transit (GIT) Cargo Insurance Certificate uploaded.');
                }}
              >
                <Ionicons
                  name={insuranceDoc ? "checkmark-circle" : "document-text-outline"}
                  size={24}
                  color={insuranceDoc ? "#10B981" : "#0284C7"}
                  style={{ marginRight: 6 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docUploadLabel}>Goods-in-Transit (GIT) Cargo Insurance</Text>
                  <Text style={styles.docUploadStatus}>
                    {insuranceDoc ? 'Attached: Ethiopian Insurance Corp Policy #GIT-8842' : 'Tap to upload policy PDF/Image'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.docUploadBox, roadworthinessDoc && styles.docUploadBoxActive]}
                onPress={() => {
                  setRoadworthinessDoc(!roadworthinessDoc);
                  Alert.alert('Document Attached', 'FTA Annual Roadworthiness Certificate uploaded.');
                }}
              >
                <Ionicons
                  name={roadworthinessDoc ? "checkmark-circle" : "document-text-outline"}
                  size={24}
                  color={roadworthinessDoc ? "#10B981" : "#0284C7"}
                  style={{ marginRight: 6 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docUploadLabel}>FTA Annual Roadworthiness Certificate</Text>
                  <Text style={styles.docUploadStatus}>
                    {roadworthinessDoc ? 'Attached: Federal Transport Authority Insp #FTA-2026-99' : 'Tap to upload certificate PDF/Image'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitBidBtn} onPress={onSubmit}>
              <Text style={styles.submitBidBtnText}>Save Vehicle & Submit Documents</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
