import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

interface MotivationStepProps {
  onSetLoading: (loading: boolean) => void;
}

const MOTIVATION_OPTIONS = [
  {
    value: 'saude',
    label: 'Saúde',
    description: 'Alimentar melhor meu corpo e mente',
    emoji: '💚'
  },
  {
    value: 'energia',
    label: 'Energia',
    description: 'Aumentar minha vitalidade e felicidade',
    emoji: '⚡'
  },
  {
    value: 'disciplina',
    label: 'Disciplina',
    description: 'Melhorar minha disciplina e seguir um plano',
    emoji: '🎯'
  },
  {
    value: 'geral',
    label: 'Geral',
    description: 'Me sentir melhor e mais confiante',
    emoji: '🌟'
  }
];

export default function MotivationStep({ onSetLoading }: MotivationStepProps) {
  const { getStepData, updateStepData } = useOnboarding();
  const [selectedMotivation, setSelectedMotivation] = useState<string>('');

  // Load existing data when component mounts
  useEffect(() => {
    const existingData = getStepData('motivation');
    if (existingData?.motivation) {
      setSelectedMotivation(existingData.motivation);
    }
  }, []);

  // Update motivation in context whenever it changes
  useEffect(() => {
    if (selectedMotivation) {
      updateStepData('motivation', { motivation: selectedMotivation });
      console.log('Motivation updated in context:', selectedMotivation);
    }
  }, [selectedMotivation]);

  const handleMotivationSelect = (motivation: string) => {
    setSelectedMotivation(motivation);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Qual o seu principal objetivo?</Text>
        <Text style={styles.subtitle}>
          Escolha o que mais te motiva a começar essa jornada
        </Text>

        <View style={styles.motivationContainer}>
          {MOTIVATION_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.motivationButton,
                selectedMotivation === option.value && styles.motivationButtonSelected
              ]}
              onPress={() => handleMotivationSelect(option.value)}
            >
              <Text style={styles.motivationEmoji}>{option.emoji}</Text>
              <View style={styles.motivationTextContainer}>
                <Text
                  style={[
                    styles.motivationLabel,
                    selectedMotivation === option.value && styles.motivationLabelSelected
                  ]}
                >
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.motivationDescription,
                    selectedMotivation === option.value && styles.motivationDescriptionSelected
                  ]}
                >
                  {option.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          * Suas informações serão excluídas após gerar o plano.
        </Text>
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
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  motivationContainer: {
    width: '100%',
    marginBottom: spacing.xxl,
  },
  motivationButton: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 80,
    flexDirection: 'row',
    gap: spacing.lg,
    ...shadows.sm,
  },
  motivationButtonSelected: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  motivationEmoji: {
    fontSize: typography['2xl'],
    marginRight: spacing.sm,
  },
  motivationTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  motivationLabel: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  motivationLabelSelected: {
    color: colors.background,
  },
  motivationDescription: {
    fontSize: typography.base,
    color: colors.textSecondary,
    lineHeight: typography.base * 1.4,
  },
  motivationDescriptionSelected: {
    color: colors.backgroundSecondary,
  },
  disclaimer: {
    fontSize: typography.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: typography.sm * 1.4,
    marginTop: spacing.xl,
  },
});
