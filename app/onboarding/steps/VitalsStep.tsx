import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { parseWeight } from '../../../utils/weightUtils';

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
  onNext: () => void;
}

export default function VitalsStep({ onNext }: VitalsStepProps) {
  const { getStepData, updateStepData } = useOnboarding();
  const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(getStepData('gender') || null);
  const [birthDate, setBirthDate] = useState(getStepData('birthDate') || '');
  const [height, setHeight] = useState(getStepData('height')?.toString() || '');
  const [weight, setWeight] = useState(getStepData('weight')?.toString() || '');
  const [loading, setLoading] = useState(false);

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

  const validateBirthDate = (date: string): boolean => {
    const selectedDate = new Date(date);
    const today = new Date();
    const minDate = new Date('1900-01-01');
    
    return selectedDate >= minDate && selectedDate <= today;
  };

  const handleNext = async () => {
    // Validation
    if (!gender) {
      Alert.alert('Erro', 'Por favor, selecione seu gênero.');
      return;
    }

    if (!birthDate) {
      Alert.alert('Erro', 'Por favor, insira sua data de nascimento.');
      return;
    }

    if (!validateBirthDate(birthDate)) {
      Alert.alert('Erro', 'Por favor, insira uma data de nascimento válida.');
      return;
    }

    const heightNumber = parseInt(height);
    if (!height.trim() || isNaN(heightNumber) || heightNumber < 100 || heightNumber > 250) {
      Alert.alert('Erro', 'Por favor, insira uma altura válida entre 100 e 250 cm.');
      return;
    }

    const weightNumber = parseWeight(weight);
    if (!weight.trim() || isNaN(weightNumber) || weightNumber < 30 || weightNumber > 300) {
      Alert.alert('Erro', 'Por favor, insira um peso válido entre 30 e 300 kg.');
      return;
    }

    setLoading(true);
    try {
      // Update context with all vitals data
      updateStepData('vitals', { 
        gender, 
        birthDate, 
        height: heightNumber, 
        weight: weightNumber 
      });
      console.log('Vitals step completed, moving to next step');
      
      // Call the onNext callback to move to next step
      onNext();
    } catch (error) {
      console.error('Error in vitals step:', error);
      Alert.alert('Erro', 'Não foi possível salvar suas informações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
          <TextInput
            style={styles.input}
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
            maxLength={10}
          />
          <Text style={styles.hint}>Formato: AAAA-MM-DD (ex: 1990-05-15)</Text>
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

        <TouchableOpacity
          style={[styles.button, (!gender || !birthDate || !height.trim() || !weight.trim() || loading) && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!gender || !birthDate || !height.trim() || !weight.trim() || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Salvando...' : 'Continuar'}
          </Text>
        </TouchableOpacity>

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
    paddingBottom: 40,
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
  button: {
    backgroundColor: CORAL,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  note: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 