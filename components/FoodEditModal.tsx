import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';

const UNIT_OPTIONS = [
  { value: 'g', label: 'gramas (g)' },
  { value: 'ml', label: 'mililitros (ml)' },
  { value: 'unidade', label: 'unidade' },
  { value: 'porcao', label: 'porção' },
  { value: 'colher_cha', label: 'colher de chá' },
  { value: 'colher_sopa', label: 'colher de sopa' },
  { value: 'xicara', label: 'xícara' },
];

const CORAL = '#FF725E';
const OFF_WHITE = '#FFF8F6';
const BORDER = '#FFA28F';
const TEXT = '#1F2937';

export interface FoodEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (food: any) => void;
  onDelete?: () => void;
  initialData?: any; // If present, edit mode; else, add mode
  mealOptions: { value: string; label: string }[];
}

export const FoodEditModal: React.FC<FoodEditModalProps> = ({
  visible,
  onClose,
  onSave,
  onDelete,
  initialData,
  mealOptions,
}) => {
  const isEdit = !!initialData;
  const [meal, setMeal] = useState(initialData?.mealType || '');
  const [unit, setUnit] = useState(initialData?.unit || 'g');
  const [openMeal, setOpenMeal] = useState(false);
  const [openUnit, setOpenUnit] = useState(false);
  const [mealItems, setMealItems] = useState(mealOptions.map(opt => ({ label: opt.label, value: opt.value })));
  const [unitItems, setUnitItems] = useState(UNIT_OPTIONS.map(opt => ({ label: opt.label, value: opt.value })));
  const [name, setName] = useState(initialData?.name || '');
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || '100');
  const [calories, setCalories] = useState(initialData?.calories?.toString() || '');
  const [protein, setProtein] = useState(initialData?.protein?.toString() || '');
  const [carbs, setCarbs] = useState(initialData?.carbs?.toString() || '');
  const [fat, setFat] = useState(initialData?.fat?.toString() || '');
  const [saveForFuture, setSaveForFuture] = useState(false);
  const [baseMacros, setBaseMacros] = useState(
    initialData && initialData.baseMacros
      ? initialData.baseMacros
      : null
  );

  // If baseMacros are present, auto-calculate macros when quantity changes
  useEffect(() => {
    if (baseMacros) {
      const q = parseFloat(quantity);
      if (!isNaN(q) && q > 0) {
        const multiplier = q / 100;
        setCalories((baseMacros.calories * multiplier).toFixed(0));
        setProtein((baseMacros.protein * multiplier).toFixed(1));
        setCarbs((baseMacros.carbs * multiplier).toFixed(1));
        setFat((baseMacros.fat * multiplier).toFixed(1));
      }
    }
  }, [quantity, baseMacros]);

  // If editing, update fields when initialData changes
  useEffect(() => {
    if (initialData) {
      setMeal(initialData.mealType || '');
      setName(initialData.name || '');
      setQuantity(initialData.quantity?.toString() || '100');
      setUnit(initialData.unit || 'g');
      setCalories(initialData.calories?.toString() || '');
      setProtein(initialData.protein?.toString() || '');
      setCarbs(initialData.carbs?.toString() || '');
      setFat(initialData.fat?.toString() || '');
      setBaseMacros(initialData.baseMacros || null);
    }
  }, [initialData]);

  const handleSave = () => {
    onSave({
      mealType: meal,
      name,
      quantity: parseFloat(quantity),
      unit,
      calories: parseFloat(calories),
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fat: parseFloat(fat),
      baseMacros: baseMacros || (baseMacros === null && quantity === '100' ? {
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
      } : undefined),
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Adicionar Alimento</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <FontAwesome6 name="xmark" size={22} color={CORAL} />
              </TouchableOpacity>
            </View>
            {/* Meal Dropdown */}
            <Text style={styles.label}>Refeição</Text>
            <DropDownPicker
              open={openMeal}
              value={meal}
              items={mealItems}
              setOpen={setOpenMeal}
              setValue={setMeal}
              setItems={setMealItems}
              placeholder="Selecione a refeição"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.dropdownPlaceholder}
              listItemLabelStyle={styles.dropdownText}
              zIndex={2000}
              zIndexInverse={1000}
            />
            {/* Food Name */}
            <Text style={styles.label}>Nome do Alimento</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Ex: Arroz Integral"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#A0AEC0"
              />
            </View>
            {/* Quantity & Unit Dropdown */}
            <View style={styles.inputRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Quantidade</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="100"
                  placeholderTextColor="#A0AEC0"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Unidade</Text>
                <DropDownPicker
                  open={openUnit}
                  value={unit}
                  items={unitItems}
                  setOpen={setOpenUnit}
                  setValue={setUnit}
                  setItems={setUnitItems}
                  placeholder="Selecione a unidade"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  textStyle={styles.dropdownText}
                  placeholderStyle={styles.dropdownPlaceholder}
                  listItemLabelStyle={styles.dropdownText}
                  zIndex={1000}
                  zIndexInverse={2000}
                />
              </View>
            </View>
            {/* Calories */}
            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Calorias (kcal)</Text>
                <TextInput
                  style={styles.input}
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#A0AEC0"
                />
              </View>
            </View>
            {/* Macros */}
            <View style={styles.inputRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Proteína (g)</Text>
                <TextInput
                  style={styles.input}
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#A0AEC0"
                />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Carboidratos (g)</Text>
                <TextInput
                  style={styles.input}
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#A0AEC0"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Gordura (g)</Text>
                <TextInput
                  style={styles.input}
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#A0AEC0"
                />
              </View>
            </View>
            {/* Save for future */}
            <View style={styles.saveRow}>
              <TouchableOpacity onPress={() => setSaveForFuture(v => !v)} style={styles.checkbox}>
                {saveForFuture && <FontAwesome6 name="check" size={14} color={CORAL} />}
              </TouchableOpacity>
              <Text style={styles.saveText}>Salvar este alimento para uso futuro</Text>
            </View>
            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              {isEdit && (
                <TouchableOpacity style={styles.trashButton} onPress={onDelete}>
                  <FontAwesome6 name="trash" size={18} color={CORAL} />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={handleSave}>
                <Text style={styles.addButtonText}>{isEdit ? 'Salvar' : 'Adicionar'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: OFF_WHITE,
    borderRadius: 18,
    padding: 20,
    width: '92%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT,
  },
  label: {
    fontSize: 14,
    color: TEXT,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 12,
  },
  inputWrapper: {
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
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
    flex: 1,
    marginBottom: 0,
    height: 44,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: BORDER,
    borderRadius: 10,
    minHeight: 44,
    height: 44,
    marginBottom: 0,
    paddingHorizontal: 8,
    zIndex: 1000,
  },
  dropdownContainer: {
    borderColor: BORDER,
    borderRadius: 10,
    zIndex: 1000,
  },
  dropdownText: {
    color: TEXT,
    fontSize: 15,
  },
  dropdownPlaceholder: {
    color: '#A0AEC0',
    fontSize: 15,
  },
  chip: {},
  chipSelected: {},
  chipText: {},
  chipTextSelected: {},
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: CORAL,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  saveText: {
    color: TEXT,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 18,
  },
  trashButton: {
    marginRight: 12,
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
    marginRight: 10,
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
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
}); 