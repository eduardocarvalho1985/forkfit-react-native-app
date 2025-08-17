// FILE: components/FoodBottomSheet.tsx (Complete Food Entry & Edit)

import React, { forwardRef, useMemo, useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Dropdown } from 'react-native-element-dropdown';
import { FontAwesome6 } from '@expo/vector-icons';
import { formatNumber } from '../utils/formatters';

// Define your constants
const CORAL = '#FF725E';
const OFF_WHITE = '#FFF8F6';
const BORDER = '#e2e8f0';
const TEXT = '#1e293b';

// Unit options
const UNIT_OPTIONS = [
  { label: 'gramas (g)', value: 'g' },
  { label: 'mililitros (ml)', value: 'ml' },
  { label: 'unidade (un)', value: 'un' },
];

export interface FoodBottomSheetProps {
  onSave: (food: any) => void;
  onDelete?: () => void;
  initialData?: any;
  mealOptions: { value: string; label: string }[];
  loading: boolean;
}

// We use forwardRef so the parent screen can control this component
export const FoodBottomSheet = forwardRef<BottomSheetModal, FoodBottomSheetProps>(
  ({ onSave, onDelete, initialData, mealOptions, loading }, ref) => {

    // The heights the sheet can snap to
    const snapPoints = useMemo(() => ['90%'], []);

    // State for all form fields
    const [meal, setMeal] = useState('');
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('100');
    const [unit, setUnit] = useState('g');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');
    const [saveFood, setSaveFood] = useState(false);

    // State for validation and auto-recalculation
    const [originalMacros, setOriginalMacros] = useState({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      quantity: 100
    });
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const isEdit = !!initialData?.id;

    // Validation function
    const validateForm = () => {
      const errors: string[] = [];

      if (!name.trim()) {
        errors.push('Nome do alimento é obrigatório');
      }

      if (!meal) {
        errors.push('Selecione uma refeição');
      }

      const quantityNum = parseFloat(quantity);
      if (isNaN(quantityNum) || quantityNum <= 0) {
        errors.push('Quantidade deve ser um número maior que zero');
      }

      const caloriesNum = parseFloat(calories);
      if (isNaN(caloriesNum) || caloriesNum < 0) {
        errors.push('Calorias devem ser um número válido');
      }

      const proteinNum = parseFloat(protein);
      if (isNaN(proteinNum) || proteinNum < 0) {
        errors.push('Proteína deve ser um número válido');
      }

      const carbsNum = parseFloat(carbs);
      if (isNaN(carbsNum) || carbsNum < 0) {
        errors.push('Carboidratos devem ser um número válido');
      }

      const fatNum = parseFloat(fat);
      if (isNaN(fatNum) || fatNum < 0) {
        errors.push('Gordura deve ser um número válido');
      }

      setValidationErrors(errors);
      return errors.length === 0;
    };

    // Auto-recalculate macros based on quantity change
    const recalculateMacros = (newQuantity: string) => {
      const newQuantityNum = parseFloat(newQuantity);
      if (isNaN(newQuantityNum) || newQuantityNum <= 0) return;

      const multiplier = newQuantityNum / originalMacros.quantity;

      setCalories(formatNumber(originalMacros.calories * multiplier, 0));
      setProtein(formatNumber(originalMacros.protein * multiplier, 1));
      setCarbs(formatNumber(originalMacros.carbs * multiplier, 1));
      setFat(formatNumber(originalMacros.fat * multiplier, 1));
    };

    // Handle quantity change with auto-recalculation
    const handleQuantityChange = (newQuantity: string) => {
      setQuantity(newQuantity);

      // Auto-recalculate if we have original macros (either edit mode or database food)
      if (originalMacros.quantity > 0 && originalMacros.calories > 0) {
        recalculateMacros(newQuantity);
      }

      // Clear validation errors when user starts typing
      if (validationErrors.some(err => err.includes('Quantidade'))) {
        setValidationErrors(prev => prev.filter(err => !err.includes('Quantidade')));
      }
    };

    // The reset effect works perfectly here
    useEffect(() => {
      console.log("FoodBottomSheet received new data. Resetting state.");
      if (initialData) {
        const initialCalories = initialData.calories || 0;
        const initialProtein = initialData.protein || 0;
        const initialCarbs = initialData.carbs || 0;
        const initialFat = initialData.fat || 0;
        const initialQuantity = initialData.quantity || 100;

        setMeal(initialData.mealType || mealOptions[0]?.value || '');
        setName(initialData.name || '');
        setQuantity(initialQuantity.toString());
        setUnit(initialData.unit || 'g');
        setCalories(formatNumber(initialCalories, 0));
        setProtein(formatNumber(initialProtein, 1));
        setCarbs(formatNumber(initialCarbs, 1));
        setFat(formatNumber(initialFat, 1));
        setSaveFood(false); // Reset save food option for edit mode

        // Store original macros for auto-recalculation
        setOriginalMacros({
          calories: initialCalories,
          protein: initialProtein,
          carbs: initialCarbs,
          fat: initialFat,
          quantity: initialQuantity
        });
      } else {
        setMeal(mealOptions[0]?.value || '');
        setName('');
        setQuantity('100');
        setUnit('g');
        setCalories('');
        setProtein('');
        setCarbs('');
        setFat('');
        setSaveFood(false);

        // Reset original macros
        setOriginalMacros({
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          quantity: 100
        });
      }

      // Clear validation errors when data changes
      setValidationErrors([]);
    }, [initialData, mealOptions]);

    const handleClose = () => {
      // A way to programmatically close the sheet if needed
      // @ts-ignore
      ref.current?.dismiss();
    }

    const handleSave = () => {
      if (!validateForm()) {
        Alert.alert(
          'Erro de Validação',
          validationErrors.join('\n'),
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('Saving food data from bottom sheet...');
      onSave({
        mealType: meal,
        name: name.trim(),
        quantity: parseFloat(quantity),
        unit,
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        saveFood, // Include the save food preference
      });
    }

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        handleIndicatorStyle={{ backgroundColor: '#e2e8f0' }}
        backgroundStyle={{ backgroundColor: OFF_WHITE }}
      >
        <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>
              {isEdit ? 'Editar Alimento' : 'Adicionar Alimento'}
            </Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <FontAwesome6 name="xmark" size={22} color={CORAL} />
            </TouchableOpacity>
          </View>

          {/* Meal Dropdown */}
          <Text style={styles.label}>Refeição</Text>
          <Dropdown
            style={styles.dropdown}
            data={mealOptions}
            labelField="label"
            valueField="value"
            placeholder="Selecione a refeição"
            value={meal}
            onChange={item => setMeal(item.value)}
          />

          {/* Food Name */}
          <Text style={styles.label}>Nome do Alimento</Text>
          <TextInput
            style={[
              styles.input,
              validationErrors.some(err => err.includes('Nome')) && styles.inputError
            ]}
            value={name}
            onChangeText={(text) => {
              setName(text);
              // Clear validation errors when user starts typing
              if (validationErrors.some(err => err.includes('Nome'))) {
                setValidationErrors(prev => prev.filter(err => !err.includes('Nome')));
              }
            }}
            placeholder="Ex: Arroz Integral"
            placeholderTextColor="#A0AEC0"
          />

          {/* Quantity & Unit */}
          <View style={styles.inputRow}>
            <View style={styles.inputColumn}>
              <Text style={styles.label}>Quantidade</Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.some(err => err.includes('Quantidade')) && styles.inputError
                ]}
                value={quantity}
                onChangeText={handleQuantityChange}
                keyboardType="numeric"
                placeholder="100"
                placeholderTextColor="#A0AEC0"
              />
            </View>
            <View style={styles.inputColumn}>
              <Text style={styles.label}>Unidade</Text>
              <Dropdown
                style={styles.dropdown}
                data={UNIT_OPTIONS}
                labelField="label"
                valueField="value"
                placeholder="Selecione a unidade"
                value={unit}
                onChange={item => setUnit(item.value)}
              />
            </View>
          </View>

          {/* Auto-recalculation notice (edit mode or database food) */}
          {originalMacros.quantity > 0 && originalMacros.calories > 0 && (
            <Text style={styles.infoText}>
              💡 As calorias e macros serão recalculadas automaticamente quando você alterar a quantidade
            </Text>
          )}

          {/* Calories */}
          <Text style={styles.label}>Calorias (kcal)</Text>
          <TextInput
            style={[
              styles.input,
              validationErrors.some(err => err.includes('Calorias')) && styles.inputError
            ]}
            value={calories}
            onChangeText={(text) => {
              setCalories(text);
              // Clear validation errors when user starts typing
              if (validationErrors.some(err => err.includes('Calorias'))) {
                setValidationErrors(prev => prev.filter(err => !err.includes('Calorias')));
              }
            }}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#A0AEC0"
          />

          {/* Macros */}
          <View style={styles.inputRow}>
            <View style={styles.inputColumn}>
              <Text style={styles.label}>Proteína (g)</Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.some(err => err.includes('Proteína')) && styles.inputError
                ]}
                value={protein}
                onChangeText={(text) => {
                  setProtein(text);
                  // Clear validation errors when user starts typing
                  if (validationErrors.some(err => err.includes('Proteína'))) {
                    setValidationErrors(prev => prev.filter(err => !err.includes('Proteína')));
                  }
                }}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#A0AEC0"
              />
            </View>
            <View style={styles.inputColumn}>
              <Text style={styles.label}>Carboidratos (g)</Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.some(err => err.includes('Carboidratos')) && styles.inputError
                ]}
                value={carbs}
                onChangeText={(text) => {
                  setCarbs(text);
                  // Clear validation errors when user starts typing
                  if (validationErrors.some(err => err.includes('Carboidratos'))) {
                    setValidationErrors(prev => prev.filter(err => !err.includes('Carboidratos')));
                  }
                }}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#A0AEC0"
              />
            </View>
            <View style={styles.inputColumn}>
              <Text style={styles.label}>Gordura (g)</Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.some(err => err.includes('Gordura')) && styles.inputError
                ]}
                value={fat}
                onChangeText={(text) => {
                  setFat(text);
                  // Clear validation errors when user starts typing
                  if (validationErrors.some(err => err.includes('Gordura'))) {
                    setValidationErrors(prev => prev.filter(err => !err.includes('Gordura')));
                  }
                }}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#A0AEC0"
              />
            </View>
          </View>

          {/* Save Food Checkbox */}
          {!isEdit && (
            <TouchableOpacity
              style={styles.saveFoodRow}
              onPress={() => setSaveFood(!saveFood)}
              activeOpacity={0.7}
            >
              <View style={styles.checkboxContainer}>
                <View style={[
                  styles.checkbox,
                  saveFood && styles.checkboxChecked
                ]}>
                  {saveFood && (
                    <FontAwesome6 name="check" size={12} color="#fff" />
                  )}
                </View>
                <Text style={styles.saveFoodText}>
                  Salvar alimento para uso futuro
                </Text>
              </View>
              <Text style={styles.saveFoodInfo}>
                Este alimento aparecerá em "Alimentos Salvos" para adição rápida
              </Text>
            </TouchableOpacity>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            {isEdit && onDelete && (
              <TouchableOpacity style={styles.trashButton} onPress={onDelete}>
                <FontAwesome6 name="trash" size={18} color={CORAL} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.addButton,
                validationErrors.length > 0 && styles.addButtonDisabled
              ]}
              onPress={handleSave}
              disabled={validationErrors.length > 0}
            >
              {
                loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[
                    styles.addButtonText,
                    validationErrors.length > 0 && styles.addButtonTextDisabled
                  ]}>
                    {isEdit ? 'Salvar' : 'Adicionar'}
                  </Text>
                )
              }
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 20,
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
  label: {
    fontSize: 12,
    color: TEXT,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputColumn: {
    flex: 1,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: TEXT,
    height: 44,
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  dropdown: {
    height: 44,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 12,
  },
  saveFoodRow: {
    marginTop: 20,
    paddingVertical: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: CORAL,
    backgroundColor: '#fff',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: CORAL,
  },
  saveFoodText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    flex: 1,
  },
  saveFoodInfo: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 32,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 12,
  },
  trashButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1.5,
    borderColor: CORAL,
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
  addButton: {
    backgroundColor: CORAL,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  addButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  addButtonTextDisabled: {
    color: '#94a3b8',
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 4,
  },
});