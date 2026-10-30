import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
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
  isEditing?: boolean;
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
  isEditing = false,
  onSubmit,
}) => {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showFuelTypeDropdown, setShowFuelTypeDropdown] = useState(false);
  const [insuranceDocName, setInsuranceDocName] = useState('');
  const [insuranceDocUrl, setInsuranceDocUrl] = useState('');
  const [roadworthinessDocName, setRoadworthinessDocName] = useState('');
  const [roadworthinessDocUrl, setRoadworthinessDocUrl] = useState('');

  // Real Native & Web Device Document Picker for GIT Insurance
  const pickInsuranceDoc = async () => {
    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/pdf,image/*';
        input.onchange = (e: any) => {
          const file = e.target?.files?.[0];
          if (file) {
            setInsuranceDocName(file.name);
            setInsuranceDoc(true);
            const reader = new FileReader();
            reader.onload = () => {
              setInsuranceDocUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      } else {
        const res = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'image/*'],
          copyToCacheDirectory: true,
        });
        if (!res.canceled && res.assets && res.assets.length > 0) {
          const asset = res.assets[0];
          setInsuranceDocName(asset.name);
          setInsuranceDoc(true);
          try {
            const resp = await fetch(asset.uri);
            const blob = await resp.blob();
            const reader = new FileReader();
            reader.onload = () => {
              setInsuranceDocUrl(reader.result as string);
            };
            reader.readAsDataURL(blob);
          } catch {
            setInsuranceDocUrl(asset.uri);
          }
        }
      }
    } catch (err) {
      console.warn('Insurance document picker error:', err);
    }
  };

  // Real Native & Web Device Document Picker for Roadworthiness Certificate
  const pickRoadworthinessDoc = async () => {
    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/pdf,image/*';
        input.onchange = (e: any) => {
          const file = e.target?.files?.[0];
          if (file) {
            setRoadworthinessDocName(file.name);
            setRoadworthinessDoc(true);
            const reader = new FileReader();
            reader.onload = () => {
              setRoadworthinessDocUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      } else {
        const res = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'image/*'],
          copyToCacheDirectory: true,
        });
        if (!res.canceled && res.assets && res.assets.length > 0) {
          const asset = res.assets[0];
          setRoadworthinessDocName(asset.name);
          setRoadworthinessDoc(true);
          try {
            const resp = await fetch(asset.uri);
            const blob = await resp.blob();
            const reader = new FileReader();
            reader.onload = () => {
              setRoadworthinessDocUrl(reader.result as string);
            };
            reader.readAsDataURL(blob);
          } catch {
            setRoadworthinessDocUrl(asset.uri);
          }
        }
      }
    } catch (err) {
      console.warn('Roadworthiness document picker error:', err);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.fullScreenModal}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Dedicated Full Screen Page Header */}
        <View style={styles.modalPageHeader}>
          <TouchableOpacity
            style={styles.modalPageBackBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.modalPageTitleRow}>
            <MaterialCommunityIcons name="truck-outline" size={20} color="#0284C7" />
            <Text style={styles.modalPageTitle}>
              {isEditing ? 'Edit Fleet Vehicle' : 'Register Fleet Vehicle'}
            </Text>
          </View>

          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View style={styles.modalFormCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>License Plate Number (Ethiopia / Djibouti):</Text>
              <TextInput
                style={styles.input}
                placeholder="License Plate Number"
                placeholderTextColor="#94A3B8"
                value={truckPlate}
                onChangeText={setTruckPlate}
              />
            </View>

            {/* Vehicle Body Type Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Vehicle Body Type:</Text>
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => {
                  setShowFuelTypeDropdown(false);
                  setShowDriverDropdown(false);
                  setShowTypeDropdown(!showTypeDropdown);
                }}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name="truck-outline" size={15} color="#0284C7" />
                  <Text style={styles.dropdownBtnText}>
                    {truckType || 'Select Vehicle Body Type'}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#64748B' }}>{showTypeDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showTypeDropdown && (
                <View style={styles.dropdownMenu}>
                  {['Flatbed', 'Container Box', 'Bulk Tanker', 'Lowbed Heavy', 'Refrigerated'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.dropdownItem, truckType === type && styles.dropdownItemActive]}
                      onPress={() => {
                        setTruckType(type);
                        setShowTypeDropdown(false);
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons
                          name={truckType === type ? 'radio-button-on' : 'radio-button-off'}
                          size={14}
                          color={truckType === type ? '#0284C7' : '#94A3B8'}
                        />
                        <Text style={[styles.dropdownItemText, truckType === type && styles.dropdownItemTextActive]}>
                          {type}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Engine & Fuel Type Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Engine & Fuel Type:</Text>
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => {
                  setShowTypeDropdown(false);
                  setShowDriverDropdown(false);
                  setShowFuelTypeDropdown(!showFuelTypeDropdown);
                }}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons
                    name={
                      truckFuelType === 'Electric'
                        ? 'lightning-bolt'
                        : truckFuelType === 'Petrol'
                        ? 'car'
                        : 'gas-station'
                    }
                    size={15}
                    color="#0284C7"
                  />
                  <Text style={styles.dropdownBtnText}>
                    {truckFuelType || 'Select Engine & Fuel Type'}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#64748B' }}>{showFuelTypeDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showFuelTypeDropdown && (
                <View style={styles.dropdownMenu}>
                  {[
                    { key: 'Diesel', label: 'Diesel', icon: 'gas-station' },
                    { key: 'Petrol', label: 'Petrol', icon: 'car' },
                    { key: 'Electric', label: 'Electric', icon: 'lightning-bolt' },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.key}
                      style={[styles.dropdownItem, truckFuelType === item.key && styles.dropdownItemActive]}
                      onPress={() => {
                        setTruckFuelType(item.key);
                        setShowFuelTypeDropdown(false);
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons
                          name={truckFuelType === item.key ? 'radio-button-on' : 'radio-button-off'}
                          size={14}
                          color={truckFuelType === item.key ? '#0284C7' : '#94A3B8'}
                        />
                        <MaterialCommunityIcons
                          name={item.icon as any}
                          size={14}
                          color={truckFuelType === item.key ? '#0284C7' : '#64748B'}
                        />
                        <Text style={[styles.dropdownItemText, truckFuelType === item.key && styles.dropdownItemTextActive]}>
                          {item.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payload Weight Capacity (Tons):</Text>
              <TextInput
                style={styles.input}
                placeholder="Payload Capacity in Tons"
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
                onPress={() => {
                  setShowTypeDropdown(false);
                  setShowFuelTypeDropdown(false);
                  setShowDriverDropdown(!showDriverDropdown);
                }}
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
                style={[styles.docUploadBox, Boolean(insuranceDocName) && styles.docUploadBoxActive]}
                onPress={pickInsuranceDoc}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={insuranceDocName ? "checkmark-circle" : "document-text-outline"}
                  size={24}
                  color={insuranceDocName ? "#10B981" : "#0284C7"}
                  style={{ marginRight: 6 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docUploadLabel}>Goods-in-Transit (GIT) Cargo Insurance</Text>
                  <Text style={[styles.docUploadStatus, Boolean(insuranceDocName) && { color: '#059669', fontWeight: '700' }]}>
                    {insuranceDocName ? `Attached: ${insuranceDocName}` : 'Tap to upload policy PDF/Image'}
                  </Text>
                </View>
                {Boolean(insuranceDocName) ? (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation?.();
                      setInsuranceDoc(false);
                      setInsuranceDocName('');
                      setInsuranceDocUrl('');
                    }}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                ) : (
                  <Ionicons name="cloud-upload-outline" size={18} color="#0284C7" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.docUploadBox, Boolean(roadworthinessDocName) && styles.docUploadBoxActive]}
                onPress={pickRoadworthinessDoc}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={roadworthinessDocName ? "checkmark-circle" : "document-text-outline"}
                  size={24}
                  color={roadworthinessDocName ? "#10B981" : "#0284C7"}
                  style={{ marginRight: 6 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docUploadLabel}>FTA Annual Roadworthiness Certificate</Text>
                  <Text style={[styles.docUploadStatus, Boolean(roadworthinessDocName) && { color: '#059669', fontWeight: '700' }]}>
                    {roadworthinessDocName ? `Attached: ${roadworthinessDocName}` : 'Tap to upload certificate PDF/Image'}
                  </Text>
                </View>
                {Boolean(roadworthinessDocName) ? (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation?.();
                      setRoadworthinessDoc(false);
                      setRoadworthinessDocName('');
                      setRoadworthinessDocUrl('');
                    }}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                ) : (
                  <Ionicons name="cloud-upload-outline" size={18} color="#0284C7" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitBidBtn} onPress={onSubmit} activeOpacity={0.85}>
              <Text style={styles.submitBidBtnText}>
                {isEditing ? 'Save Vehicle Changes' : 'Save Vehicle & Submit Documents'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
