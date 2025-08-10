import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useOnboarding } from '../OnboardingContext';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const BORDER = '#FFA28F';
const TEXT = '#1F2937';

const GENDER_OPTIONS: Array<{ label: string; value: 'male' | 'female' | 'other' }> = [
  { label: 'Masculino', value: 'male' },
  { label: 'Feminino', value: 'female' },
  { label: 'Outro', value: 'other' },
];

interface GenderStepProps {
  onNext: () => void;
}

export default function GenderStep({ onNext }: GenderStepProps) {
  const { getStepData, updateStepData } = useOnboarding();
  const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(getStepData('gender') || null);
  const [loading, setLoading] = useState(false);

  // Load existing data when component mounts
  useEffect(() => {
    const existingGender = getStepData('gender');
    if (existingGender) {
      setGender(existingGender);
    }
  }, []);

  const handleNext = async () => {
    if (!gender) {
      Alert.alert('Erro', 'Por favor, selecione seu gênero para continuar.');
      return;
    }

    setLoading(true);
    try {
      // Update context with gender data
      updateStepData('gender', { gender });
      console.log('Gender step completed, moving to next step');
      
      // Call the onNext callback to move to next step
      onNext();
    } catch (error) {
      console.error('Error in gender step:', error);
      Alert.alert('Erro', 'Não foi possível salvar o gênero. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Escolha seu gênero</Text>
        <Text style={styles.subtitle}>
          Isso será usado para calibrar seu plano personalizado.
        </Text>

        <View style={styles.formSection}>
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

        <TouchableOpacity
          style={[styles.button, (!gender || loading) && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!gender || loading}
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
  genderButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: CORAL,
    borderColor: CORAL,
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
  },
  genderButtonTextSelected: {
    color: '#fff',
  },
}); 