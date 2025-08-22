import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useOnboarding } from '../OnboardingContext';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const TEXT = '#1F2937';

interface TargetWeightStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function TargetWeightStep({ onSetLoading }: TargetWeightStepProps) {
  const { updateStepData, onboardingData } = useOnboarding();
  const [targetWeight, setTargetWeight] = useState('');

  // Initialize with current weight if available
  useEffect(() => {
    if (onboardingData.weight) {
      setTargetWeight(onboardingData.weight.toString());
    }
  }, [onboardingData.weight]);

  // Auto-save when targetWeight changes
  useEffect(() => {
    if (targetWeight) {
      handleContinue();
    }
  }, [targetWeight]);

  const handleContinue = () => {
    if (!targetWeight.trim()) {
      return; // Don't save empty data
    }

    const weight = parseFloat(targetWeight);
    if (isNaN(weight) || weight <= 0) {
      return; // Don't save invalid data
    }

    // Validate that target weight is reasonable compared to current weight
    if (onboardingData.weight) {
      const currentWeight = onboardingData.weight;
      const weightDiff = Math.abs(weight - currentWeight);
      const maxReasonableDiff = currentWeight * 0.5; // 50% of current weight

      if (weightDiff > maxReasonableDiff) {
        return; // Don't save unreasonable data
      }
    }

    // Update onboarding data
    updateStepData('targetWeight', { targetWeight: weight });
  };

  const handleSkip = () => {
    // Skip this step - the parent component will handle navigation
    // when the user clicks the "Continuar" button in the footer
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Qual é o seu peso alvo?</Text>
        <Text style={styles.subtitle}>
          Defina um objetivo realista para sua jornada de transformação
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ex: 70"
            value={targetWeight}
            onChangeText={setTargetWeight}
            keyboardType="numeric"
            autoFocus
          />
          <Text style={styles.unit}>kg</Text>
        </View>

        {onboardingData.weight && (
          <View style={styles.weightInfo}>
            <Text style={styles.weightInfoText}>
              Peso atual: <Text style={styles.weightValue}>{onboardingData.weight} kg</Text>
            </Text>
            {targetWeight && !isNaN(parseFloat(targetWeight)) && (
              <Text style={styles.weightInfoText}>
                Diferença: <Text style={styles.weightValue}>
                  {Math.abs(parseFloat(targetWeight) - onboardingData.weight)} kg
                </Text>
              </Text>
            )}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  input: {
    width: 120,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: CORAL,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: TEXT,
  },
  unit: {
    fontSize: 18,
    color: '#64748b',
    marginLeft: 12,
    fontWeight: '600',
  },
  weightInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  weightInfoText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  weightValue: {
    color: CORAL,
    fontWeight: 'bold',
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
