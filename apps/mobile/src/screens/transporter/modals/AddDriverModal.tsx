import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { transporterStyles as styles } from '../transporterStyles';
import { TruckItem } from '../types';
import { isValidImageUri, uriToDataUrl } from '../../../utils/imageUtils';
import { useLanguage } from '../../../context/LanguageContext';

interface AddDriverModalProps {
  visible: boolean;
  onClose: () => void;
  driverFullName: string;
  setDriverFullName: (val: string) => void;
  driverPhone: string;
  setDriverPhone: (val: string) => void;
  driverEmail: string;
  setDriverEmail: (val: string) => void;
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
  driverPhoto: string;
  setDriverPhoto: (val: string) => void;
  driverLicenseDoc: string;
  setDriverLicenseDoc: (val: string) => void;
  licenseDocName: string;
  setLicenseDocName: (val: string) => void;
  driverTemporaryPassword: string;
  setDriverTemporaryPassword: (val: string) => void;
  onGenerateNewPassword: () => void;
  isEditing?: boolean;
  onSubmit: () => void;
}

export const AddDriverModal: React.FC<AddDriverModalProps> = ({
  visible,
  onClose,
  driverFullName,
  setDriverFullName,
  driverPhone,
  setDriverPhone,
  driverEmail,
  setDriverEmail,
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
  driverPhoto,
  setDriverPhoto,
  driverLicenseDoc,
  setDriverLicenseDoc,
  licenseDocName,
  setLicenseDocName,
  driverTemporaryPassword,
  setDriverTemporaryPassword,
  onGenerateNewPassword,
  isEditing = false,
  onSubmit,
}) => {
  const { language } = useLanguage();
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Real Native & Web Device License Document / Card Picker
  const pickLicenseDoc = async () => {
    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/pdf,image/*';
        input.onchange = (e: any) => {
          const file = e.target?.files?.[0];
          if (file) {
            setLicenseDocName(file.name);
            const reader = new FileReader();
            reader.onload = () => {
              setDriverLicenseDoc(reader.result as string);
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
          setLicenseDocName(asset.name);
          try {
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhr.onload = () => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  if (typeof reader.result === 'string') resolve(reader.result);
                  else resolve(asset.uri);
                };
                reader.onerror = reject;
                reader.readAsDataURL(xhr.response);
              };
              xhr.onerror = () => {
                fetch(asset.uri)
                  .then((r) => r.blob())
                  .then((blob) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                  })
                  .catch(() => resolve(asset.uri));
              };
              xhr.responseType = 'blob';
              xhr.open('GET', asset.uri, true);
              xhr.send(null);
            });
            setDriverLicenseDoc(dataUrl);
          } catch {
            setDriverLicenseDoc(asset.uri);
          }
        }
      }
    } catch (err) {
      console.warn('License document picker error:', err);
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
            <Ionicons name={isEditing ? "person" : "person-add"} size={18} color="#0284C7" />
            <Text style={styles.modalPageTitle}>
              {isEditing ? 'Edit Driver Profile' : 'Register Authorized Driver'}
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

            {/* 1. Driver Full Legal Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Driver Full Legal Name:</Text>
              <TextInput
                style={styles.input}
                placeholder="Driver Full Legal Name"
                placeholderTextColor="#94A3B8"
                value={driverFullName}
                onChangeText={setDriverFullName}
              />
            </View>

            {/* 2. Mobile Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Phone Number (Ethiopian / Djibouti):</Text>
              <TextInput
                style={styles.input}
                placeholder="Mobile Phone Number"
                placeholderTextColor="#94A3B8"
                value={driverPhone}
                onChangeText={setDriverPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* 3. Driver Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Driver Email Address (Account Login):</Text>
              <TextInput
                style={styles.input}
                placeholder="Driver Email Address"
                placeholderTextColor="#94A3B8"
                value={driverEmail}
                onChangeText={setDriverEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* 3. One-Time Temporary Password for Driver */}
            <View style={styles.inputGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.inputLabel}>
                  {isEditing
                    ? (language === 'AM' ? 'የይለፍ ቃል አድስ (አማራጭ):' : 'Reset Password (Optional):')
                    : (language === 'AM'
                      ? 'ጊዜያዊ የይለፍ ቃል:'
                      : language === 'OM'
                      ? 'Jecha Darbii Yeroo:'
                      : 'One-Time Temporary Password:')}
                </Text>
                <TouchableOpacity
                  onPress={onGenerateNewPassword}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 2, paddingHorizontal: 6, backgroundColor: '#E0F2FE', borderRadius: 6 }}
                >
                  <Ionicons name="refresh" size={12} color="#0284C7" />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#0284C7' }}>Generate New</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, { fontWeight: '800', color: '#0284C7', letterSpacing: 1.5, fontSize: 13.5 }]}
                placeholder="Temporary Password"
                placeholderTextColor="#94A3B8"
                value={driverTemporaryPassword}
                onChangeText={setDriverTemporaryPassword}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                <Ionicons name="key-outline" size={13} color="#64748B" />
                <Text style={{ fontSize: 10, color: '#64748B', flex: 1 }}>
                  Share this code with the driver for their first login. The driver will change it in their Profile.
                </Text>
              </View>
            </View>

            {/* 4. Commercial Driving License No */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Commercial Driving License No:</Text>
              <TextInput
                style={styles.input}
                placeholder="Commercial Driving License Number"
                placeholderTextColor="#94A3B8"
                value={driverLicense}
                onChangeText={setDriverLicense}
              />
            </View>

            {/* 5. Mandatory Physical License Photo / Scan Card */}
            <View style={styles.docUploadSection}>
              <Text style={styles.docSectionTitle}>MANDATORY FTA CREDENTIALS & PHYSICAL LICENSE</Text>
              
              <TouchableOpacity
                style={[styles.docUploadBox, driverLicenseDoc && styles.docUploadBoxActive]}
                onPress={pickLicenseDoc}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={driverLicenseDoc ? "checkmark-circle" : "card-outline"}
                  size={24}
                  color={driverLicenseDoc ? "#10B981" : "#0284C7"}
                  style={{ marginRight: 6 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docUploadLabel}>Commercial Driver's License Card (Physical Photo)</Text>
                  <Text style={styles.docUploadStatus}>
                    {driverLicenseDoc
                      ? (licenseDocName || 'Attached: Commercial_Driver_License_Card.jpg')
                      : 'Tap to upload physical license card photo / PDF'}
                  </Text>
                </View>
                {driverLicenseDoc ? (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation?.();
                      setDriverLicenseDoc('');
                      setLicenseDocName('');
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

            {/* 6. License Grade Category Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>License Grade Category:</Text>
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="ribbon-outline" size={15} color="#0284C7" />
                  <Text style={styles.dropdownBtnText}>
                    {driverCategory || 'Select License Grade'}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#64748B' }}>{showCategoryDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showCategoryDropdown && (
                <View style={styles.dropdownMenu}>
                  {['Grade 5 Heavy', 'Grade 4 Medium', 'Special Cross-Border', 'Grade 3 Commercial'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.dropdownItem, driverCategory === cat && styles.dropdownItemActive]}
                      onPress={() => {
                        setDriverCategory(cat);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons
                          name={driverCategory === cat ? 'radio-button-on' : 'radio-button-off'}
                          size={14}
                          color={driverCategory === cat ? '#0284C7' : '#94A3B8'}
                        />
                        <Text style={[styles.dropdownItemText, driverCategory === cat && styles.dropdownItemTextActive]}>
                          {cat}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* 7. Corridor Driving Experience */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Corridor Driving Experience (Years):</Text>
              <TextInput
                style={styles.input}
                placeholder="Driving Experience (Years)"
                placeholderTextColor="#94A3B8"
                value={driverExperience}
                onChangeText={setDriverExperience}
                keyboardType="numeric"
              />
            </View>

            {/* 8. Assigned Vehicle Dropdown */}
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

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitBidBtn} onPress={onSubmit} activeOpacity={0.85}>
              <Text style={styles.submitBidBtnText}>
                {isEditing ? 'Save Driver Changes' : 'Register Authorized Fleet Driver'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
