import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useOnboarding } from '../OnboardingContext';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const TEXT = '#1F2937';

interface EmotionalGoalStepProps {
  onSetLoading: (loading: boolean) => void;
}

const EMOTIONAL_GOALS = [
  'Sentir-me mais confiante',
  'Ter mais energia no dia a dia',
  'Melhorar minha saúde geral',
  'Ser um exemplo para minha família',
  'Atingir meu potencial máximo',
  'Viver mais tempo e com qualidade',
  'Outro'
];

export default function EmotionalGoalStep({ onSetLoading }: EmotionalGoalStepProps) {
  const { updateStepData, onboardingData } = useOnboarding();
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [customGoal, setCustomGoal] = useState<string>('');

  // Initialize with existing data
  useEffect(() => {
    if (onboardingData.emotionalGoal) {
      if (EMOTIONAL_GOALS.includes(onboardingData.emotionalGoal)) {
        setSelectedGoal(onboardingData.emotionalGoal);
      } else {
        setSelectedGoal('Outro');
        setCustomGoal(onboardingData.emotionalGoal);
      }
    }
  }, [onboardingData.emotionalGoal]);

  // Auto-save when selection changes
  useEffect(() => {
    if (selectedGoal && selectedGoal !== 'Outro') {
      updateStepData('emotionalGoal', { emotionalGoal: selectedGoal });
    } else if (selectedGoal === 'Outro' && customGoal.trim()) {
      updateStepData('emotionalGoal', { emotionalGoal: customGoal.trim() });
    }
  }, [selectedGoal, customGoal]);

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal);
    if (goal !== 'Outro') {
      setCustomGoal('');
    }
  };

  const handleCustomGoalChange = (text: string) => {
    setCustomGoal(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Qual é o seu objetivo emocional?</Text>
        <Text style={styles.subtitle}>
          Conecte-se com suas motivações mais profundas para esta jornada
        </Text>

        <View style={styles.goalsContainer}>
          {EMOTIONAL_GOALS.map((goal) => (
            <TouchableOpacity
              key={goal}
              style={[
                styles.goalOption,
                selectedGoal === goal && styles.goalOptionSelected
              ]}
              onPress={() => handleGoalSelect(goal)}
            >
              <Text style={[
                styles.goalText,
                selectedGoal === goal && styles.goalTextSelected
              ]}>
                {goal}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedGoal === 'Outro' && (
          <View style={styles.customGoalContainer}>
            <Text style={styles.customGoalLabel}>Descreva seu objetivo:</Text>
            <TextInput
              style={styles.customGoalInput}
              placeholder="Ex: Quero me sentir mais forte e capaz"
              value={customGoal}
              onChangeText={handleCustomGoalChange}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Navigation is handled by the parent component's footer */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Use o botão "Continuar" na parte inferior da tela para prosseguir
          </Text>
        </View>
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
    paddingBottom: 120,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 20,
  },
  goalsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  goalOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  goalOptionSelected: {
    borderColor: CORAL,
    backgroundColor: CORAL,
  },
  goalText: {
    fontSize: 16,
    color: TEXT,
    fontWeight: '500',
    textAlign: 'center',
  },
  goalTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  customGoalContainer: {
    width: '100%',
    marginBottom: 30,
  },
  customGoalLabel: {
    fontSize: 16,
    color: TEXT,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  customGoalInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    padding: 16,
    fontSize: 16,
    color: TEXT,
    minHeight: 80,
  },
  infoContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  infoText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
