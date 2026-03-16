import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, BigButton } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme';

const DEFAULT_MEDICINES = [
  { id: '1', name: 'Hjertemedicin', time: '08:00', taken: false },
  { id: '2', name: 'Blodtryks-pille', time: '12:00', taken: false },
  { id: '3', name: 'Vitaminer', time: '18:00', taken: false },
];

export default function MedicineScreen() {
  const [medicines, setMedicines] = useState(DEFAULT_MEDICINES);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTime, setNewTime] = useState('');

  const toggleTaken = (id) => {
    setMedicines((prev) =>
      prev.map((med) =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  const addMedicine = () => {
    if (!newName.trim() || !newTime.trim()) {
      Alert.alert('Mangler oplysninger', 'Udfyld venligst både navn og tidspunkt.');
      return;
    }
    const newMed = {
      id: Date.now().toString(),
      name: newName.trim(),
      time: newTime.trim(),
      taken: false,
    };
    setMedicines((prev) => [...prev, newMed]);
    setNewName('');
    setNewTime('');
    setModalVisible(false);
  };

  const deleteMedicine = (id) => {
    Alert.alert(
      'Slet medicin',
      'Er du sikker på, at du vil fjerne denne medicin?',
      [
        { text: 'Annullér', style: 'cancel' },
        {
          text: 'Slet',
          style: 'destructive',
          onPress: () => setMedicines((prev) => prev.filter((m) => m.id !== id)),
        },
      ]
    );
  };

  const takenCount = medicines.filter((m) => m.taken).length;

  return (
    <ScreenWrapper title="Medicin">
      {/* Statusoversigt */}
      <View style={styles.statusCard}>
        <Ionicons name="checkmark-circle" size={36} color={colors.primary} />
        <Text style={[typography.h3, styles.statusText]}>
          {takenCount} af {medicines.length} taget i dag
        </Text>
      </View>

      {/* Medicinliste */}
      {medicines.map((med) => (
        <TouchableOpacity
          key={med.id}
          style={[styles.medicineCard, med.taken && styles.medicineTaken]}
          onPress={() => toggleTaken(med.id)}
          onLongPress={() => deleteMedicine(med.id)}
          activeOpacity={0.7}
          accessibilityLabel={`${med.name} kl. ${med.time}, ${med.taken ? 'taget' : 'ikke taget'}`}
          accessibilityRole="button"
        >
          <View style={styles.medicineIcon}>
            <Ionicons
              name={med.taken ? 'checkmark-circle' : 'ellipse-outline'}
              size={40}
              color={med.taken ? colors.primary : colors.textSecondary}
            />
          </View>
          <View style={styles.medicineInfo}>
            <Text
              style={[
                typography.h3,
                med.taken && styles.takenText,
              ]}
            >
              {med.name}
            </Text>
            <Text style={typography.bodySmall}>Kl. {med.time}</Text>
          </View>
          {med.taken && (
            <View style={styles.takenBadge}>
              <Text style={styles.takenBadgeText}>Jeg har taget den</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}

      <View style={styles.addButtonContainer}>
        <BigButton
          title="Tilføj medicin"
          icon="add-circle-outline"
          variant="secondary"
          onPress={() => setModalVisible(true)}
        />
      </View>

      <Text style={[typography.caption, styles.hint]}>
        Tryk for at markere som taget. Hold inde for at slette.
      </Text>

      {/* Tilføj-modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={typography.h2}>Tilføj medicin</Text>

            <Text style={[typography.body, styles.label]}>Navn</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="F.eks. Hjertemedicin"
              placeholderTextColor={colors.textSecondary}
              accessibilityLabel="Medicinnavn"
            />

            <Text style={[typography.body, styles.label]}>Tidspunkt</Text>
            <TextInput
              style={styles.input}
              value={newTime}
              onChangeText={setNewTime}
              placeholder="F.eks. 08:00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numbers-and-punctuation"
              accessibilityLabel="Tidspunkt"
            />

            <View style={styles.modalButtons}>
              <BigButton
                title="Annullér"
                variant="secondary"
                onPress={() => {
                  setNewName('');
                  setNewTime('');
                  setModalVisible(false);
                }}
                style={styles.modalButton}
              />
              <BigButton
                title="Tilføj"
                onPress={addMedicine}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statusText: {
    marginLeft: spacing.sm,
    color: colors.primary,
  },
  medicineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  medicineTaken: {
    backgroundColor: colors.primaryLight,
    opacity: 0.85,
  },
  medicineIcon: {
    marginRight: spacing.md,
  },
  medicineInfo: {
    flex: 1,
  },
  takenText: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  takenBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  takenBadgeText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonContainer: {
    marginTop: spacing.lg,
  },
  hint: {
    textAlign: 'center',
    marginTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  label: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 22,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
  },
});
