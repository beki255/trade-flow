import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
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
  driverPhoto,
  setDriverPhoto,
  driverLicenseDoc,
  setDriverLicenseDoc,
  licenseDocName,
  setLicenseDocName,
  driverTemporaryPassword,
  setDriverTemporaryPassword,
  onGenerateNewPassword,
  onSubmit,
}) => {
  const { language } = useLanguage();
  // Real Native & Web Device Photo Picker for Driver Face/ID
  const pickDriverPhoto = async () => {
    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
          const file = e.target?.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              setDriverPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      } else {
        const res = await DocumentPicker.getDocumentAsync({
          type: ['image/*'],
          copyToCacheDirectory: true,
        });
        if (!res.canceled && res.assets && res.assets.length > 0) {
          const asset = res.assets[0];
          const dataUrl = await uriToDataUrl(asset.uri);
          setDriverPhoto(dataUrl);
        }
      }
    } catch (err) {
      console.warn('Driver photo picker error:', err);
    }
  };

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
            const resp = await fetch(asset.uri);
            const blob = await resp.blob();
            const reader = new FileReader();
            reader.onload = () => {
              setDriverLicenseDoc(reader.result as string);
            };
            reader.readAsDataURL(blob);
          } catch {
            setDriverLicenseDoc(asset.uri);
          }
        }
      }
    } catch (err) {
      console.warn('License document picker error:', err);
    }
  };

  const handleSetSampleData = () => {
    setDriverPhoto('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80');
    setDriverLicenseDoc('Attached: Commercial_Driver_License_Grade5.jpg');
    setLicenseDocName('Commercial_Driver_License_Grade5.jpg');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={[styles.profileModalCard, { maxHeight: '92%' }]}>
          <View style={styles.modalHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="person-add" size={18} color="#0284C7" />
              <Text style={styles.modalTitle}>Register Authorized Driver</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 12 }}>
            {/* 1. Driver Photo Upload Section */}
            <View style={styles.photoUploadContainer}>
              <TouchableOpacity
                style={styles.driverPhotoFrame}
                onPress={pickDriverPhoto}
                activeOpacity={0.8}
              >
                {isValidImageUri(driverPhoto) ? (
                  <Image source={{ uri: driverPhoto }} style={styles.driverPhotoPreview} />
                ) : (
                  <View style={styles.driverPhotoPlaceholder}>
                    <Ionicons name="camera" size={24} color="#0284C7" />
                    <Text style={styles.driverPhotoPlaceholderText}>Add Photo</Text>
                  </View>
                )}
                <View style={styles.photoBadgeEdit}>
                  <Ionicons name="camera-outline" size={11} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.photoTitle}>Driver Portrait / Face Photo</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  {driverPhoto && <Ionicons name="checkmark-circle" size={13} color="#059669" />}
                  <Text style={[styles.photoSubtitle, driverPhoto && { color: '#059669', fontWeight: '700' }]}>
                    {driverPhoto ? 'Photo attached for FTA & Checkpoint ID' : 'Required for Galafi / Djibouti Checkpoint ID and Platform Verification'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                  <TouchableOpacity style={styles.pickPhotoBtn} onPress={pickDriverPhoto}>
                    <Ionicons name="image-outline" size={13} color="#0284C7" />
                    <Text style={styles.pickPhotoBtnText}>{driverPhoto ? 'Change Photo' : 'Upload Photo'}</Text>
                  </TouchableOpacity>
                  {!driverPhoto && (
                    <TouchableOpacity style={styles.presetPhotoBtn} onPress={handleSetSampleData}>
                      <Text style={styles.presetPhotoBtnText}>Sample Photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* 2. Driver Full Legal Name */}
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

            {/* 3. Mobile Phone Number */}
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

            {/* 4. One-Time Temporary Password for Driver */}
            <View style={styles.inputGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.inputLabel}>
                  {language === 'AM'
                    ? 'ጊዜያዊ የይለፍ ቃል:'
                    : language === 'OM'
                    ? 'Jecha Darbii Yeroo:'
                    : 'One-Time Temporary Password:'}
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
                placeholder="e.g. TF-7482"
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
                placeholder="e.g. ETH-DL-984218"
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

            {/* 6. License Grade Category */}
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

            {/* 7. Corridor Driving Experience */}
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
            <TouchableOpacity style={styles.submitBidBtn} onPress={onSubmit}>
              <Text style={styles.submitBidBtnText}>Register Authorized Fleet Driver</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
