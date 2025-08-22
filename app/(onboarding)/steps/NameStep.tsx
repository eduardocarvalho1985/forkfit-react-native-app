import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useOnboarding } from '../OnboardingContext';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const BORDER = '#FFA28F';
const TEXT = '#1F2937';

interface NameStepProps {
  onNext: () => void;
}

export default function NameStep({ onNext }: NameStepProps) {
  const { getStepData, updateStepData } = useOnboarding();
  const [name, setName] = useState(getStepData('name') || '');
  const [loading, setLoading] = useState(false);

  // Load existing data when component mounts
  useEffect(() => {
    const existingName = getStepData('name');
    if (existingName) {
      setName(existingName);
    }
  }, []);

  const handleNext = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, insira seu nome para continuar.');
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert('Erro', 'O nome deve ter pelo menos 2 caracteres.');
      return;
    }

    setLoading(true);
    try {
      // Update context with name data
      updateStepData('name', { name: name.trim() });
      console.log('Name step completed, moving to gender step');
      
      // Call the onNext callback to move to next step
      onNext();
    } catch (error) {
      console.error('Error in name step:', error);
      Alert.alert('Erro', 'Não foi possível salvar o nome. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Qual é o seu nome?</Text>
        <Text style={styles.subtitle}>
          Vamos personalizar sua experiência com base no seu nome.
        </Text>

        <View style={styles.formSection}>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Digite seu nome completo"
            placeholderTextColor="#9CA3AF"
            autoFocus
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={50}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, (!name.trim() || loading) && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!name.trim() || loading}
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