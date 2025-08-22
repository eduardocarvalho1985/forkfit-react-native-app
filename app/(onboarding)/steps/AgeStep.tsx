import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useOnboarding } from '../OnboardingContext';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const BORDER = '#FFA28F';
const TEXT = '#1F2937';

interface AgeStepProps {
  onNext: () => void;
}

export default function AgeStep({ onNext }: AgeStepProps) {
  const { getStepData, updateStepData } = useOnboarding();
  const [age, setAge] = useState(getStepData('age')?.toString() || '');
  const [loading, setLoading] = useState(false);

  // Load existing data when component mounts
  useEffect(() => {
    const existingAge = getStepData('age');
    if (existingAge) {
      setAge(existingAge.toString());
    }
  }, []);

  const handleNext = async () => {
    const ageNumber = parseInt(age);
    
    if (!age.trim()) {
      Alert.alert('Erro', 'Por favor, insira sua idade para continuar.');
      return;
    }

    if (isNaN(ageNumber) || ageNumber < 13 || ageNumber > 120) {
      Alert.alert('Erro', 'Por favor, insira uma idade válida entre 13 e 120 anos.');
      return;
    }

    setLoading(true);
    try {
      // Update context with age data
      updateStepData('age', { age: ageNumber });
      console.log('Age step completed, moving to next step');
      
      // Call the onNext callback to move to next step
      onNext();
    } catch (error) {
      console.error('Error in age step:', error);
      Alert.alert('Erro', 'Não foi possível salvar a idade. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Qual é a sua idade?</Text>
        <Text style={styles.subtitle}>
          Sua idade nos ajuda a calcular suas necessidades calóricas diárias.
        </Text>

        <View style={styles.formSection}>
          <Text style={styles.label}>Idade</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="Digite sua idade"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            autoFocus
            maxLength={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, (!age.trim() || loading) && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!age.trim() || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Salvando...' : 'Continuar'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Você poderá alterar essas informações no seu perfil a qualquer momento.
        </Text>
      </View>
    </View>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 8,
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