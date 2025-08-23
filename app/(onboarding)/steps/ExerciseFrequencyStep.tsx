import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

const EXERCISE_OPTIONS = [
  { 
    label: 'Sedentário', 
    value: 'sedentary' as const,
    description: 'Pouco ou nenhum exercício'
  },
  { 
    label: 'Levemente ativo', 
    value: 'light' as const,
    description: 'Exercício leve 1-3 dias/semana'
  },
  { 
    label: 'Moderadamente ativo', 
    value: 'moderate' as const,
    description: 'Exercício moderado 3-5 dias/semana'
  },
  { 
    label: 'Muito ativo', 
    value: 'very_active' as const,
    description: 'Exercício intenso 6-7 dias/semana'
  },
];

interface ExerciseFrequencyStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function ExerciseFrequencyStep({ onSetLoading }: ExerciseFrequencyStepProps) {
  const { getStepData, updateStepData } = useOnboarding();
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'very_active' | null>(getStepData('activityLevel') || null);

  // Load existing data when component mounts
  useEffect(() => {
    const existingActivityLevel = getStepData('activityLevel');
    if (existingActivityLevel) {
      setActivityLevel(existingActivityLevel);
    }
  }, []);

  // Update activity level in context whenever it changes
  useEffect(() => {
    if (activityLevel) {
      updateStepData('exerciseFrequency', { activityLevel });
      console.log('Activity level updated in context:', activityLevel);
    }
  }, [activityLevel]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Quantas vezes por semana você se exercita?</Text>
        <Text style={styles.subtitle}>
          Isso nos ajuda a calcular suas necessidades calóricas diárias.
        </Text>

        <View style={styles.exerciseContainer}>
          {EXERCISE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.exerciseButton,
                activityLevel === option.value && styles.exerciseButtonSelected
              ]}
              onPress={() => setActivityLevel(option.value)}
            >
              <Text
                style={[
                  styles.exerciseLabel,
                  activityLevel === option.value && styles.exerciseLabelSelected
                ]}
              >
                {option.label}
              </Text>
              <Text
                style={[
                  styles.exerciseDescription,
                  activityLevel === option.value && styles.exerciseDescriptionSelected
                ]}
              >
                {option.description}
              </Text>
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
    paddingTop: spacing.xxl,
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
  exerciseContainer: {
    width: '100%',
    marginBottom: spacing.xxl,
  },
  exerciseButton: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    ...shadows.sm,
  },
  exerciseButtonSelected: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  exerciseLabel: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  exerciseLabelSelected: {
    color: colors.textInverse,
  },
  exerciseDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sm * 1.4,
  },
  exerciseDescriptionSelected: {
    color: colors.textInverse + 'CC', // 80% opacity
  },
  disclaimer: {
    fontSize: typography.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: typography.sm * 1.4,
    position: 'absolute',
    bottom: spacing.xxl,
  },
});
