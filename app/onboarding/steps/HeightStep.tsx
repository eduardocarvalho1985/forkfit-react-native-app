import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useOnboarding } from '../OnboardingContext';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const BORDER = '#FFA28F';
const TEXT = '#1F2937';

interface HeightStepProps {
  onNext: () => void;
}

export default function HeightStep({ onNext }: HeightStepProps) {
  const { getStepData, updateStepData } = useOnboarding();
  const [height, setHeight] = useState(getStepData('height')?.toString() || '');
  const [loading, setLoading] = useState(false);

  // Load existing data when component mounts
  useEffect(() => {
    const existingHeight = getStepData('height');
    if (existingHeight) {
      setHeight(existingHeight.toString());
    }
  }, []);

  const handleNext = async () => {
    const heightNumber = parseInt(height);
    
    if (!height.trim()) {
      Alert.alert('Erro', 'Por favor, insira sua altura para continuar.');
      return;
    }

    if (isNaN(heightNumber) || heightNumber < 100 || heightNumber > 250) {
      Alert.alert('Erro', 'Por favor, insira uma altura válida entre 100 e 250 cm.');
      return;
    }

    setLoading(true);
    try {
      // Update context with height data
      updateStepData('height', { height: heightNumber });
      console.log('Height step completed, moving to next step');
      
      // Call the onNext callback to move to next step
      onNext();
    } catch (error) {
      console.error('Error in height step:', error);
      Alert.alert('Erro', 'Não foi possível salvar a altura. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Qual é a sua altura?</Text>
        <Text style={styles.subtitle}>
          Sua altura é essencial para calcular seu IMC e necessidades nutricionais.
        </Text>

        <View style={styles.formSection}>
          <Text style={styles.label}>Altura (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="Ex: 175"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            autoFocus
            maxLength={3}
          />
          <Text style={styles.hint}>Digite sua altura em centímetros</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, (!height.trim() || loading) && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!height.trim() || loading}
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