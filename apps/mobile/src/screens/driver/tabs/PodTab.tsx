import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { driverStyles as styles } from '../driverStyles';

interface PodTabProps {
  recipientName: string;
  setRecipientName: (val: string) => void;
  signedPOD: boolean;
  podSuccess: boolean;
  onSignPOD: () => void;
}

export const PodTab: React.FC<PodTabProps> = ({
  recipientName,
  setRecipientName,
  signedPOD,
  podSuccess,
  onSignPOD,
}) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Digital Proof of Delivery (e-POD)</Text>

      {podSuccess ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>
            ✓ Delivery confirmed! Digital POD stored on ledger.
          </Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Recipient Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Recipient Full Name"
            placeholderTextColor="#94A3B8"
            value={recipientName}
            onChangeText={setRecipientName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Recipient Electronic Signature:</Text>
          <TouchableOpacity
            style={[styles.signatureBox, signedPOD && styles.signatureBoxSigned]}
            onPress={onSignPOD}
          >
            <Text style={styles.signatureText}>
              {signedPOD
                ? '✓ [Verified Electronic Signature Signed]'
                : 'Tap here to capture signature'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.podBtn, (!recipientName || !signedPOD) && styles.podBtnDisabled]}
          onPress={onSignPOD}
          disabled={!recipientName || !signedPOD}
        >
          <Text style={styles.podBtnText}>Complete Electronic POD</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
