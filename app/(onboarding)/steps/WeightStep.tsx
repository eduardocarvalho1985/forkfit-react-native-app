import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';
import { getAuth } from '@react-native-firebase/auth';
import { useOnboarding } from '../OnboardingContext';
import RulerSlider from '../../../components/RulerSlider';
import UnitToggle from '../../../components/UnitToggle';
import { kgToLbs } from '../../../utils/units';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const TEXT = '#1F2937';

interface WeightStepProps {
  onComplete: () => void;
}

export default function WeightStep({ onComplete }: WeightStepProps) {
  const { user, syncUser } = useAuth();
  const { getStepData, updateStepData, getCurrentStepData, clearOnboardingData } = useOnboarding();
  const [weightKg, setWeightKg] = useState(70); // Default to 70kg
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [loading, setLoading] = useState(false);

  // Load existing data when component mounts
  useEffect(() => {
    const existingWeight = getStepData('weight');
    if (existingWeight) {
      setWeightKg(existingWeight);
    }
    
    // Load unit preference if available
    const unitPref = getStepData('prefs')?.units?.weight;
    if (unitPref) {
      setUnit(unitPref);
    }
  }, []);

  const handleWeightChange = (value: number) => {
    setWeightKg(value);
  };

  const handleUnitChange = (newUnit: string) => {
    setUnit(newUnit as 'kg' | 'lbs');
    // Save unit preference
    const currentPrefs = getStepData('prefs') || {};
    updateStepData('prefs', {
      ...currentPrefs,
      units: { ...currentPrefs.units, weight: newUnit }
    });
  };

  const formatCenterLabel = (value: number) => {
    if (unit === 'kg') {
      return `${value.toFixed(1)} kg`;
    } else {
      return `${kgToLbs(value)} lbs`;
    }
  };

  const handleComplete = async () => {
    if (!user) {
      Alert.alert('Erro', 'Usuário não encontrado. Tente fazer login novamente.');
      return;
    }

    if (weightKg < 40 || weightKg > 150) {
      Alert.alert('Erro', 'Por favor, selecione um peso válido entre 40 e 150 kg.');
      return;
    }

    setLoading(true);
    try {
      // Update context with weight data
      updateStepData('weight', { weight: weightKg });
      
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

  const isValidWeight = weightKg >= 40 && weightKg <= 150;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Qual é o seu peso atual?</Text>
        <Text style={styles.subtitle}>
          Seu peso nos ajuda a calcular seu IMC e necessidades calóricas.
        </Text>

        <View style={styles.formSection}>
          <Text style={styles.label}>Unidade</Text>
          <UnitToggle
            options={['kg', 'lbs']}
            value={unit}
            onChange={handleUnitChange}
          />
          
          <Text style={styles.label}>Peso</Text>
          <RulerSlider
            min={40}
            max={150}
            step={0.5}
            value={weightKg}
            onChange={handleWeightChange}
            majorEvery={5}
            labelEvery={5}
            tickWidth={12}
            formatCenterLabel={formatCenterLabel}
            unit="kg"
          />
          <Text style={styles.hint}>
            Deslize para selecionar seu peso
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, (!isValidWeight || loading) && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={!isValidWeight || loading}
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
    marginTop: 16,
  },
  hint: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
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