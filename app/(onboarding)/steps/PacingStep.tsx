import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOnboarding } from '../OnboardingContext';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const TEXT = '#1F2937';

interface PacingStepProps {
  onSetLoading: (loading: boolean) => void;
}

const PACING_OPTIONS = [
  { value: 0.25, label: 'Muito Lento', description: '0.25 kg/semana', detail: 'Mudanças graduais e sustentáveis' },
  { value: 0.5, label: 'Lento', description: '0.5 kg/semana', detail: 'Pace recomendado para a maioria' },
  { value: 0.75, label: 'Moderado', description: '0.75 kg/semana', detail: 'Resultados visíveis mais rapidamente' },
  { value: 1.0, label: 'Rápido', description: '1.0 kg/semana', detail: 'Máximo recomendado para segurança' }
];

export default function PacingStep({ onSetLoading }: PacingStepProps) {
  const { updateStepData, onboardingData } = useOnboarding();
  const [selectedPacing, setSelectedPacing] = useState<number>(0.5);

  // Initialize with existing data
  useEffect(() => {
    if (onboardingData.weeklyPacing) {
      setSelectedPacing(onboardingData.weeklyPacing);
    }
  }, [onboardingData.weeklyPacing]);

  // Auto-save when pacing changes
  useEffect(() => {
    if (selectedPacing) {
      updateStepData('pacing', { weeklyPacing: selectedPacing });
    }
  }, [selectedPacing]);

  const handlePacingSelect = (pacing: number) => {
    setSelectedPacing(pacing);
  };

  const getPacingDescription = () => {
    const option = PACING_OPTIONS.find(opt => opt.value === selectedPacing);
    if (!option) return '';

    if (onboardingData.targetWeight && onboardingData.weight) {
      const currentWeight = onboardingData.weight;
      const targetWeight = onboardingData.targetWeight;
      const weightDiff = Math.abs(targetWeight - currentWeight);
      const weeksToGoal = Math.ceil(weightDiff / option.value);
      
      return `Com este pace, você atingirá seu objetivo em aproximadamente ${weeksToGoal} semanas.`;
    }
    
    return option.detail;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Qual é o seu ritmo preferido?</Text>
        <Text style={styles.subtitle}>
          Escolha a velocidade com que deseja atingir seus objetivos
        </Text>

        <View style={styles.pacingContainer}>
          {PACING_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.pacingOption,
                selectedPacing === option.value && styles.pacingOptionSelected
              ]}
              onPress={() => handlePacingSelect(option.value)}
            >
              <View style={styles.pacingHeader}>
                <Text style={[
                  styles.pacingLabel,
                  selectedPacing === option.value && styles.pacingLabelSelected
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.pacingValue,
                  selectedPacing === option.value && styles.pacingValueSelected
                ]}>
                  {option.description}
                </Text>
              </View>
              <Text style={[
                styles.pacingDetail,
                selectedPacing === option.value && styles.pacingDetailSelected
              ]}>
                {option.detail}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedPacing && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              {getPacingDescription()}
            </Text>
          </View>
        )}

        {/* Navigation is handled by the parent component's footer */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerInfoText}>
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
  pacingContainer: {
    width: '100%',
    marginBottom: 30,
  },
  pacingOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    padding: 20,
    marginBottom: 16,
  },
  pacingOptionSelected: {
    borderColor: CORAL,
    backgroundColor: CORAL,
  },
  pacingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pacingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
  },
  pacingLabelSelected: {
    color: '#fff',
  },
  pacingValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  pacingValueSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  pacingDetail: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  pacingDetailSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoText: {
    fontSize: 14,
    color: TEXT,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  footerInfo: {
    width: '100%',
    alignItems: 'center',
  },
  footerInfoText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
