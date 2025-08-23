import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

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
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xxxl + spacing.xl,
    paddingBottom: spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography['3xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.base * 1.5,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  pacingContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  pacingOption: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.backgroundTertiary,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  pacingOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  pacingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  pacingLabel: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  pacingLabelSelected: {
    color: colors.background,
  },
  pacingValue: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  },
  pacingValueSelected: {
    color: colors.background + 'E6', // 90% opacity
  },
  pacingDetail: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: typography.sm * 1.4,
  },
  pacingDetailSelected: {
    color: colors.background + 'CC', // 80% opacity
  },
  infoContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.backgroundTertiary,
    ...shadows.sm,
  },
  infoText: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: typography.sm * 1.4,
    fontWeight: typography.medium,
  },
  footerInfo: {
    width: '100%',
    alignItems: 'center',
  },
  footerInfoText: {
    color: colors.textTertiary,
    fontSize: typography.sm,
    textAlign: 'center',
    lineHeight: typography.sm * 1.4,
  },
});
