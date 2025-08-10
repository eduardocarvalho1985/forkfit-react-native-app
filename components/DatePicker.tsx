import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const BORDER = '#FFA28F';
const TEXT = '#1F2937';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

export default function DatePicker({ value, onChange, placeholder = "Selecione a data" }: DatePickerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedYear, setSelectedYear] = useState(2000);

  // Parse current value on mount
  useEffect(() => {
    if (value) {
      // Parse YYYY-MM-DD format directly to avoid timezone issues
      const [year, month, day] = value.split('-').map(Number);
      if (year && month && day) {
        setSelectedDay(day);
        setSelectedMonth(month - 1); // Month is 0-indexed in state
        setSelectedYear(year);
      }
    }
  }, [value]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const generateYears = () => {
    return Array.from({ length: 125 }, (_, i) => 2025 - i);
  };

  const handleConfirm = () => {
    // Create date in local timezone to avoid timezone issues
    const formattedDate = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;
    onChange(formattedDate);
    setIsVisible(false);
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  const formatDisplayValue = () => {
    if (!value) return placeholder;
    
    // Parse YYYY-MM-DD format directly to avoid timezone issues
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return placeholder;
    
    return `${day.toString().padStart(2, '0')} ${MONTHS[month - 1]} ${year}`;
  };

  const PickerItem = ({ value, isSelected, onPress }: { value: string | number; isSelected: boolean; onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
      onPress={onPress}
    >
      <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected]}>
        {value}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setIsVisible(true)}
      >
        <Text style={[styles.inputText, !value && styles.placeholderText]}>
          {formatDisplayValue()}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Data</Text>
            </View>

            <View style={styles.pickerContainer}>
              {/* Day Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Dia</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {generateDays().map((day) => (
                    <PickerItem
                      key={day}
                      value={day}
                      isSelected={selectedDay === day}
                      onPress={() => setSelectedDay(day)}
                    />
                  ))}
                </ScrollView>
              </View>

              {/* Month Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Mês</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {MONTHS.map((month, index) => (
                    <PickerItem
                      key={month}
                      value={month}
                      isSelected={selectedMonth === index}
                      onPress={() => setSelectedMonth(index)}
                    />
                  ))}
                </ScrollView>
              </View>

              {/* Year Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Ano</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {generateYears().map((year) => (
                    <PickerItem
                      key={year}
                      value={year}
                      isSelected={selectedYear === year}
                      onPress={() => setSelectedYear(year)}
                    />
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
  },
  inputText: {
    fontSize: 16,
    color: TEXT,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: OFF_WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT,
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 10,
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
    minWidth: 80,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: CORAL,
  },
  pickerItemText: {
    fontSize: 16,
    color: TEXT,
  },
  pickerItemTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    marginRight: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: CORAL,
    paddingVertical: 16,
    marginLeft: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
}); 