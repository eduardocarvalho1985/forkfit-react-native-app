// File: components/TestModal.tsx (Version 4: The Final Test with DropDownPicker)

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker'; // <-- IMPORT THE SUSPECT

interface TestModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TestModal: React.FC<TestModalProps> = ({ visible, onClose }) => {
  console.log('=== TestModal with DropDownPicker is rendering ===');
  console.log('Visible:', visible);
  console.log('Component version: DropDownPicker version');
  
  try {
    const [text, setText] = useState('');

    // State required for the DropDownPicker
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([
      { label: 'Apple', value: 'apple' },
      { label: 'Banana', value: 'banana' }
    ]);

    console.log('TestModal state initialized successfully');

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.title}>Does DropDownPicker Work?</Text>

            {/* We are adding the DropDownPicker here */}
            <DropDownPicker
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              placeholder="Choose a fruit"
              style={styles.dropdown}
              containerStyle={{ width: '100%', marginBottom: 20 }}
              zIndex={3000} // Higher zIndex for modal context
              zIndexInverse={1000} // Inverse zIndex for proper stacking
            />

            <TextInput
              style={styles.input}
              placeholder="Type here..."
              value={text}
              onChangeText={setText}
            />
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Close Me</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  } catch (error) {
    console.error('TestModal error:', error);
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.title}>Error in TestModal</Text>
            <Text style={{ color: 'red', marginBottom: 20 }}>{String(error)}</Text>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Close Me</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
};

// --- Styles (with a new dropdown style) ---
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: 'white', borderRadius: 10, padding: 30, alignItems: 'center', width: '80%' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    width: '100%',
    marginBottom: 20,
  },
  dropdown: {
    borderColor: 'gray',
    borderWidth: 1,
  },
  button: { backgroundColor: '#FF725E', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: 'bold' },
});