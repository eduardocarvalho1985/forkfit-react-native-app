import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { parseWeight } from '../../../utils/weightUtils';
import DatePicker from '../../../components/DatePicker';

// Helper function to calculate age from birth date
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  
  // Parse YYYY-MM-DD format directly to avoid timezone issues
  const [year, month, day] = birthDate.split('-').map(Number);
  if (!year || !month || !day) return 0;
  
  const birth = new Date(year, month - 1, day); // month is 0-indexed
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const BORDER = '#FFA28F';
const TEXT = '#1F2937';

const GENDER_OPTIONS = [
  { label: 'Masculino', value: 'male' as const },
  { label: 'Feminino', value: 'female' as const },
  { label: 'Outro', value: 'other' as const },
];

interface VitalsStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function VitalsStep({ onSetLoading }: VitalsStepProps) {
  const { getStepData, updateStepData } = useOnboarding();
  const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(getStepData('gender') || null);
  const [birthDate, setBirthDate] = useState(getStepData('birthDate') || '');
  const [height, setHeight] = useState(getStepData('height')?.toString() || '');
  const [weight, setWeight] = useState(getStepData('weight')?.toString() || '');

  // Load existing data when component mounts
  useEffect(() => {
    const existingGender = getStepData('gender');
    const existingBirthDate = getStepData('birthDate');
    const existingHeight = getStepData('height');
    const existingWeight = getStepData('weight');
    
    if (existingGender) setGender(existingGender);
    if (existingBirthDate) setBirthDate(existingBirthDate);
    if (existingHeight) setHeight(existingHeight.toString());
    if (existingWeight) setWeight(existingWeight.toString());
  }, []);

  // Update age when birth date changes
  useEffect(() => {
    if (birthDate) {
      const calculatedAge = calculateAge(birthDate);
      console.log('Age updated for birth date:', birthDate, '=', calculatedAge);
      // Update age in context immediately when birth date changes
      updateStepData('age', { age: calculatedAge });
    }
  }, [birthDate]);

  const validateBirthDate = (date: string): boolean => {
    const selectedDate = new Date(date);
    const today = new Date();
    const minDate = new Date('1900-01-01');
    
    return selectedDate >= minDate && selectedDate <= today;
  };

  // Update vitals data in context whenever any field changes and is valid
  useEffect(() => {
    if (gender && birthDate && height && weight) {
      const heightNumber = parseInt(height);
      const weightNumber = parseWeight(weight);
      
      // Only update if all validations pass
      if (validateBirthDate(birthDate) && 
          !isNaN(heightNumber) && heightNumber >= 100 && heightNumber <= 250 &&
          !isNaN(weightNumber) && weightNumber >= 30 && weightNumber <= 300) {
        
        const calculatedAge = calculateAge(birthDate);
        updateStepData('vitals', { 
          gender, 
          birthDate, 
          age: calculatedAge,
          height: heightNumber, 
          weight: weightNumber 
        });
        console.log('Vitals data updated in context');
      }
    }
  }, [gender, birthDate, height, weight]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Sobre você</Text>
        <Text style={styles.subtitle}>
          Para calcular suas necessidades calóricas, precisamos de algumas informações.
        </Text>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Gênero</Text>
          <View style={styles.genderContainer}>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.genderButton,
                  gender === option.value && styles.genderButtonSelected
                ]}
                onPress={() => setGender(option.value)}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === option.value && styles.genderButtonTextSelected
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Data de Nascimento</Text>
          <DatePicker
            value={birthDate}
            onChange={setBirthDate}
            placeholder="Selecione sua data de nascimento"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Altura (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="Ex: 175"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.hint}>Digite sua altura em centímetros</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Peso Atual (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="Ex: 70.5"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            maxLength={5}
          />
          <Text style={styles.hint}>Digite seu peso em quilogramas</Text>
        </View>

        <Text style={styles.note}>
          Você poderá alterar essas informações no seu perfil a qualquer momento.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OFF_WHITE,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 120, // Extra padding for fixed footer
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  formSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 12,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: CORAL,
    borderColor: CORAL,
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT,
  },
  genderButtonTextSelected: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: TEXT,
  },
  hint: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    fontStyle: 'italic',
  },

  note: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 