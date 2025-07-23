import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';
import { getAuth } from '@react-native-firebase/auth';
import { useOnboarding } from '../OnboardingContext';
import { parseWeight } from '../../../utils/weightUtils';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const BORDER = '#FFA28F';
const TEXT = '#1F2937';

interface WeightStepProps {
  onComplete: () => void;
}

export default function WeightStep({ onComplete }: WeightStepProps) {
  const { user, syncUser } = useAuth();
  const { getStepData, updateStepData, getCurrentStepData, clearOnboardingData } = useOnboarding();
  const [weight, setWeight] = useState(getStepData('weight')?.toString() || '');
  const [loading, setLoading] = useState(false);

  // Load existing data when component mounts
  useEffect(() => {
    const existingWeight = getStepData('weight');
    if (existingWeight) {
      setWeight(existingWeight.toString());
    }
  }, []);

  const handleComplete = async () => {
    if (!user) {
      Alert.alert('Erro', 'Usuário não encontrado. Tente fazer login novamente.');
      return;
    }

    const weightNumber = parseWeight(weight);
    
    if (!weight.trim()) {
      Alert.alert('Erro', 'Por favor, insira seu peso para continuar.');
      return;
    }

    if (isNaN(weightNumber) || weightNumber < 30 || weightNumber > 300) {
      Alert.alert('Erro', 'Por favor, insira um peso válido entre 30 e 300 kg.');
      return;
    }

    setLoading(true);
    try {
      // Update context with weight data
      updateStepData('weight', { weight: weightNumber });
      
      // Get all onboarding data from context
      const completeOnboardingData = getCurrentStepData();
      console.log('Complete onboarding data to save:', completeOnboardingData);

      // Get authentication token
      const token = await getAuth().currentUser?.getIdToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // SINGLE API CALL with ALL onboarding data
      const userProfileData = {
        ...completeOnboardingData,
        onboardingCompleted: true
      };
      
      console.log('Saving complete user profile:', userProfileData);
      console.log('User UID:', user.uid);
      
      await api.updateUserProfile(user.uid, userProfileData, token);
      console.log('User profile updated successfully with all onboarding data');

      // Sync updated user data to AuthContext
      await syncUser();
      console.log('User data synced after onboarding completion');

      // Clear onboarding context data
      clearOnboardingData();
      
      // Call the onComplete callback to finish onboarding
      onComplete();
      
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      
      // More specific error messages
      if (error.message.includes('JSON Parse error')) {
        Alert.alert('Erro de Servidor', 'O servidor está retornando dados inválidos. Tente novamente em alguns instantes.');
      } else if (error.message.includes('timeout')) {
        Alert.alert('Erro de Conexão', 'A conexão com o servidor demorou muito. Verifique sua internet e tente novamente.');
      } else {
        Alert.alert('Erro', 'Não foi possível completar o onboarding. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Qual é o seu peso atual?</Text>
        <Text style={styles.subtitle}>
          Seu peso nos ajuda a calcular seu IMC e necessidades calóricas.
        </Text>

        <View style={styles.formSection}>
          <Text style={styles.label}>Peso (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="Ex: 70.5"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            autoFocus
            maxLength={5}
          />
          <Text style={styles.hint}>Digite seu peso em quilogramas</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, (!weight.trim() || loading) && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={!weight.trim() || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Salvando...' : 'Completar Onboarding'}
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