import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

const GOAL_OPTIONS = [
  { 
    label: 'Perder peso', 
    value: 'lose_weight' as const,
  },
  { 
    label: 'Manter peso', 
    value: 'maintain' as const,
  },
  { 
    label: 'Ganhar peso', 
    value: 'gain_muscle' as const,
  },
];

interface GoalStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function GoalStep({ onSetLoading }: GoalStepProps) {
  const { getStepData, updateStepData } = useOnboarding();
  const [goal, setGoal] = useState<'lose_weight' | 'maintain' | 'gain_muscle' | null>(getStepData('goal') || null);

  // Load existing data when component mounts
  useEffect(() => {
    const existingGoal = getStepData('goal');
    if (existingGoal) {
      setGoal(existingGoal);
    }
  }, []);

  // Update the goal in context whenever it changes
  useEffect(() => {
    if (goal) {
      updateStepData('goal', { goal });
      console.log('Goal updated in context:', goal);
      console.log('Goal step should now be valid');
    }
  }, [goal]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Qual é o seu objetivo?</Text>
        <Text style={styles.subtitle}>
          Isso nos ajuda a gerar um plano para sua ingestão de calorias.
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
              <Text
                style={[
                  styles.goalLabel,
                  goal === option.value && styles.goalLabelSelected
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
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
  goalsContainer: {
    width: '100%',
    marginBottom: spacing.xxl,
  },
  goalButton: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    ...shadows.sm,
  },
  goalButtonSelected: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  goalLabel: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  goalLabelSelected: {
    color: colors.textInverse,
  },
}); 