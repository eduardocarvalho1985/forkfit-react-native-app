import React, { forwardRef, useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Keyboard, KeyboardEvent } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FontAwesome6 } from '@expo/vector-icons';
import { parseWeight, formatWeightWithUnit, validateWeight } from '../utils/weightUtils';

// Define your constants
const CORAL = '#FF725E';
const OFF_WHITE = '#FFF8F6';
const BORDER = '#e2e8f0';
const TEXT = '#1e293b';

export interface WeightInputModalProps {
  onSave: (weight: number) => void;
  currentWeight?: number;
}

export const WeightInputModal = forwardRef<BottomSheetModal, WeightInputModalProps>(
  ({ onSave, currentWeight }, ref) => {
    
    // The heights the sheet can snap to - make it taller to account for keyboard
    const snapPoints = useMemo(() => ['70%'], []);

    // State for weight input
    const [weight, setWeight] = useState('');
    const [validationError, setValidationError] = useState('');
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const inputRef = useRef<TextInput>(null);

    // Handle keyboard events
    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        (e: KeyboardEvent) => {
          setKeyboardHeight(e.endCoordinates.height);
        }
      );
      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          setKeyboardHeight(0);
        }
      );

      return () => {
        keyboardDidShowListener?.remove();
        keyboardDidHideListener?.remove();
      };
    }, []);

    // Validation function
    const validateWeightInput = () => {
      const validation = validateWeight(weight);
      
      if (!validation.isValid) {
        setValidationError(validation.error || 'Erro de validação');
        return false;
      }
      
      setValidationError('');
      return true;
    };

    const handleClose = () => {
      // Reset state
      setWeight('');
      setValidationError('');
      // Close the modal
      // @ts-ignore
      ref.current?.dismiss();
    };

    // Focus input after modal is presented
    useEffect(() => {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
      return () => clearTimeout(timer);
    }, []);

    const handleSave = () => {
      if (!validateWeightInput()) {
        return;
      }
      
      const weightValue = parseWeight(weight);
      onSave(weightValue);
      handleClose();
    };

    const handleWeightChange = (text: string) => {
      setWeight(text);
      // Clear validation error when user starts typing
      if (validationError) {
        setValidationError('');
      }
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        handleIndicatorStyle={{ backgroundColor: '#e2e8f0' }}
        backgroundStyle={{ backgroundColor: OFF_WHITE }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"

      >
        <View style={[styles.contentContainer, { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 20 : 40 }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>Registrar Peso</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <FontAwesome6 name="xmark" size={22} color={CORAL} />
            </TouchableOpacity>
          </View>

          {/* Current Weight Display */}
          {currentWeight && (
            <View style={styles.currentWeightContainer}>
              <Text style={styles.currentWeightLabel}>Peso Atual:</Text>
              <Text style={styles.currentWeightValue}>{formatWeightWithUnit(currentWeight)}</Text>
            </View>
          )}

          {/* Weight Input */}
          <Text style={styles.label}>Novo Peso (kg)</Text>
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              validationError && styles.inputError
            ]}
            value={weight}
            onChangeText={handleWeightChange}
            keyboardType="numeric"
            placeholder="Ex: 70.5"
            placeholderTextColor="#A0AEC0"
            autoFocus={false}
          />

          {/* Validation Error */}
          {validationError && (
            <Text style={styles.errorText}>{validationError}</Text>
          )}

          {/* Info Text */}
          <Text style={styles.infoText}>
            💡 Registre seu peso regularmente para acompanhar seu progresso
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.saveButton,
                !weight.trim() && styles.saveButtonDisabled
              ]} 
              onPress={handleSave}
              disabled={!weight.trim()}
            >
              <Text style={[
                styles.saveButtonText,
                !weight.trim() && styles.saveButtonTextDisabled
              ]}>
                Salvar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT,
  },
  currentWeightContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  currentWeightLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  currentWeightValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CORAL,
  },
  label: {
    fontSize: 14,
    color: TEXT,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 18,
    color: TEXT,
    height: 50,
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: CORAL,
  },
  cancelButtonText: {
    color: CORAL,
    fontWeight: 'bold',
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: CORAL,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  saveButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  saveButtonTextDisabled: {
    color: '#94a3b8',
  },
}); 