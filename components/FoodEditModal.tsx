// FILE: components/FoodEditModal.tsx (The Final "No ScrollView" Test)

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown'; // Using the library we know works in isolation

const CORAL = '#FF725E';
const BORDER = '#FFA28F';

export interface FoodEditModalProps {
  visible: boolean;
  onClose: () => void;
  mealOptions: { value: string; label: string }[];
}

export const FoodEditModal: React.FC<FoodEditModalProps> = ({
  visible,
  onClose,
  mealOptions,
}) => {
  console.log("No ScrollView Modal is rendering. Visible:", visible);
  const [meal, setMeal] = useState(null);

  // If the component isn't visible, don't render anything.
  // This can sometimes help prevent render conflicts.
  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* The ScrollView is GONE. The content is now directly in the modal card. */}
        <View style={styles.modalCard}> 
          <View style={styles.headerRow}>
            <Text style={styles.title}>No ScrollView Test</Text>
          </View>

          <Text style={styles.label}>Does this work without ScrollView?</Text>
          <Dropdown
            style={styles.dropdown}
            data={mealOptions}
            labelField="label"
            valueField="value"
            placeholder="Select a meal"
            value={meal}
            onChange={item => { setMeal(item.value); }}
          />

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Close Me</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: 'white', borderRadius: 18, padding: 20, width: '92%' },
  headerRow: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  dropdown: { height: 50, borderColor: BORDER, borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 8 },
  button: { marginTop: 30, backgroundColor: CORAL, padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});