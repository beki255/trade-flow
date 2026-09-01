import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { driverStyles as styles } from '../driverStyles';
import { IncidentRecord } from '../types';

interface IncidentTabProps {
  incidentType: string;
  setIncidentType: (val: string) => void;
  incidentNotes: string;
  setIncidentNotes: (val: string) => void;
  incidentSent: boolean;
  incidentsList: IncidentRecord[];
  onSendIncident: () => void;
}

export const IncidentTab: React.FC<IncidentTabProps> = ({
  incidentType,
  setIncidentType,
  incidentNotes,
  setIncidentNotes,
  incidentSent,
  incidentsList,
  onSendIncident,
}) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Incident Reporting</Text>

      {incidentSent ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>
            ✓ Incident broadcasted to control center!
          </Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Incident Type:</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Road Closure, Checkpoint Delay, Fuel Outage"
            placeholderTextColor="#94A3B8"
            value={incidentType}
            onChangeText={setIncidentType}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Incident Details:</Text>
          <TextInput
            style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
            placeholder="Details, milepost marker, and current status..."
            placeholderTextColor="#94A3B8"
            value={incidentNotes}
            onChangeText={setIncidentNotes}
            multiline
          />
        </View>

        <TouchableOpacity style={styles.reportBtn} onPress={onSendIncident}>
          <Text style={styles.reportBtnText}>Broadcast Incident Alert</Text>
        </TouchableOpacity>
      </View>

      {/* Incident History List */}
      {incidentsList.length > 0 && (
        <View style={{ gap: 8, marginTop: 10 }}>
          <Text style={styles.sectionTitle}>Submitted Incident Reports</Text>
          {incidentsList.map((inc) => (
            <View key={inc.id} style={styles.historyCard}>
              <Text style={[styles.historyId, { color: '#EF4444' }]}>{inc.type}</Text>
              <Text style={styles.historyCoords}>{inc.notes || 'No extra notes'} ({inc.time})</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
