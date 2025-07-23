import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useOnboarding } from '../OnboardingContext';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const BORDER = '#FFA28F';
const TEXT = '#1F2937';

const GOAL_OPTIONS = [
  { 
    label: 'Perder Peso', 
    value: 'lose_weight' as const,
    description: 'Reduzir peso de forma saudável',
    icon: '⚖️'
  },
  { 
    label: 'Manter o Peso', 
    value: 'maintain' as const,
    description: 'Manter peso atual e saúde',
    icon: '🎯'
  },
  { 
    label: 'Ganhar Músculo', 
    value: 'gain_muscle' as const,
    description: 'Aumentar massa muscular',
    icon: '💪'
  },
];

interface GoalStepProps {
  onNext: () => void;
}

export default function GoalStep({ onNext }: GoalStepProps) {
  const { getStepData, updateStepData } = useOnboarding();
  const [goal, setGoal] = useState<'lose_weight' | 'maintain' | 'gain_muscle' | null>(getStepData('goal') || null);
  const [loading, setLoading] = useState(false);

  // Load existing data when component mounts
  useEffect(() => {
    const existingGoal = getStepData('goal');
    if (existingGoal) {
      setGoal(existingGoal);
    }
  }, []);

  const handleNext = async () => {
    if (!goal) {
      Alert.alert('Erro', 'Por favor, selecione seu objetivo para continuar.');
      return;
    }

    setLoading(true);
    try {
      // Update context with goal data
      updateStepData('goal', { goal });
      console.log('Goal step completed, moving to next step');
      
      // Call the onNext callback to move to next step
      onNext();
    } catch (error) {
      console.error('Error in goal step:', error);
      Alert.alert('Erro', 'Não foi possível salvar seu objetivo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Qual é o seu objetivo principal?</Text>
        <Text style={styles.subtitle}>
          Escolha o que mais importa para você agora.
        </Text>

        <View style={styles.goalsContainer}>
          {GOAL_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.goalButton,
                goal === option.value && styles.goalButtonSelected
              ]}
              onPress={() => setGoal(option.value)}
            >
              <Text style={styles.goalIcon}>{option.icon}</Text>
              <Text
                style={[
                  styles.goalLabel,
                  goal === option.value && styles.goalLabelSelected
                ]}
              >
                {option.label}
              </Text>
              <Text
                style={[
                  styles.goalDescription,
                  goal === option.value && styles.goalDescriptionSelected
                ]}
              >
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, (!goal || loading) && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!goal || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Salvando...' : 'Continuar'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Você poderá alterar seu objetivo a qualquer momento nos Ajustes.
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
  goalsContainer: {
    marginBottom: 32,
  },
  goalButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: BORDER,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalButtonSelected: {
    backgroundColor: CORAL,
    borderColor: CORAL,
    shadowColor: CORAL,
    shadowOpacity: 0.3,
  },
  goalIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  goalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT,
    marginBottom: 4,
  },
  goalLabelSelected: {
    color: '#fff',
  },
  goalDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  goalDescriptionSelected: {
    color: '#fff',
    opacity: 0.9,
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