import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, BigButton, MedicineCard } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme';
import {
  getAllMedicines,
  getTodayLog,
  getMedicineStatus,
  markMedicineTaken,
  unmarkMedicineTaken,
  addMedicine,
  removeMedicine,
  seedMedicineData,
} from '../utils/medicineStorage';

export default function MedicineScreen() {
  const [medicines, setMedicines] = useState([]);
  const [todayLog, setTodayLog] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDosage, setNewDosage] = useState('');

  const loadData = useCallback(async () => {
    await seedMedicineData();
    const meds = await getAllMedicines();
    const log = await getTodayLog();
    setMedicines(meds);
    setTodayLog(log);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleTake = async (medicineId) => {
    await markMedicineTaken(medicineId);
    await loadData();
  };

  const handleUndo = async (medicineId) => {
    await unmarkMedicineTaken(medicineId);
    await loadData();
  };

  const handleDelete = (medicine) => {
    Alert.alert(
      'Fjern medicin',
      `Er du sikker på, at du vil fjerne "${medicine.name}"?`,
      [
        { text: 'Annullér', style: 'cancel' },
        {
          text: 'Fjern',
          style: 'destructive',
          onPress: async () => {
            await removeMedicine(medicine.id);
            await loadData();
          },
        },
      ]
    );
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newTime.trim()) {
      Alert.alert('Mangler oplysninger', 'Udfyld venligst både navn og tidspunkt.');
      return;
    }
    await addMedicine(newName, newTime, newDosage || null);
    setNewName('');
    setNewTime('');
    setNewDosage('');
    setModalVisible(false);
    await loadData();
  };

  const takenCount = todayLog.length;
  const totalCount = medicines.length;
  const allTaken = totalCount > 0 && takenCount >= totalCount;

  return (
    <ScreenWrapper title="Medicin">
      {/* Daglig statusoversigt */}
      <View style={[styles.statusCard, allTaken && styles.statusCardDone]}>
        <Ionicons
          name={allTaken ? 'checkmark-done-circle' : 'medkit'}
          size={40}
          color={allTaken ? colors.primary : colors.secondary}
        />
        <View style={styles.statusTextContainer}>
          <Text style={[typography.h3, styles.statusTitle]}>
            {allTaken ? 'Alle taget i dag!' : 'Dagens medicin'}
          </Text>
          <Text style={[typography.body, styles.statusSubtitle]}>
            {takenCount} af {totalCount} registreret
          </Text>
        </View>
      </View>

      {/* Medicinkort */}
      {medicines.map((med) => {
        const status = getMedicineStatus(med, todayLog);
        return (
          <MedicineCard
            key={med.id}
            name={med.name}
            time={med.time}
            dosage={med.dosage}
            status={status}
            onTake={() => handleTake(med.id)}
            onUndo={() => handleUndo(med.id)}
            onLongPress={() => handleDelete(med)}
          />
        );
      })}

      {/* Tilføj medicin */}
      <View style={styles.addSection}>
        <BigButton
          title="Tilføj medicin"
          icon="add-circle-outline"
          variant="secondary"
          onPress={() => setModalVisible(true)}
        />
      </View>

      <Text style={[typography.caption, styles.hint]}>
        Hold inde på et kort for at fjerne medicin.
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
            <Text style={typography.h2}>Tilføj ny medicin</Text>

            <Text style={[typography.body, styles.label]}>Navn *</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="F.eks. Hjertemedicin"
              placeholderTextColor={colors.textSecondary}
              accessibilityLabel="Medicinnavn"
            />

            <Text style={[typography.body, styles.label]}>Tidspunkt *</Text>
            <TextInput
              style={styles.input}
              value={newTime}
              onChangeText={setNewTime}
              placeholder="F.eks. 08:00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numbers-and-punctuation"
              accessibilityLabel="Tidspunkt"
            />

            <Text style={[typography.body, styles.label]}>Dosering (valgfrit)</Text>
            <TextInput
              style={styles.input}
              value={newDosage}
              onChangeText={setNewDosage}
              placeholder="F.eks. 1 tablet"
              placeholderTextColor={colors.textSecondary}
              accessibilityLabel="Dosering"
            />

            <View style={styles.modalButtons}>
              <BigButton
                title="Annullér"
                variant="secondary"
                onPress={() => {
                  setNewName('');
                  setNewTime('');
                  setNewDosage('');
                  setModalVisible(false);
                }}
                style={styles.modalButton}
              />
              <BigButton
                title="Tilføj"
                onPress={handleAdd}
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
  // Statusoversigt
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderLeftWidth: 5,
    borderLeftColor: colors.secondary,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statusCardDone: {
    backgroundColor: colors.primaryLight,
    borderLeftColor: colors.primary,
  },
  statusTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  statusTitle: {
    marginBottom: spacing.xs,
  },
  statusSubtitle: {
    color: colors.textSecondary,
  },

  // Tilføj-sektion
  addSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  hint: {
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },

  // Modal
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
