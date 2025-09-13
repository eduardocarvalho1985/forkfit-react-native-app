import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography } from '@/theme';

interface LoadingStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function LoadingStep({ onSetLoading }: LoadingStepProps) {
  const { updateStepData, calculatePlan } = useOnboarding();

  // Auto-advance when plan calculation is complete
  useEffect(() => {
    const checkPlanAndAdvance = async () => {
      // Wait a bit for any pending data updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to calculate the plan
      const plan = calculatePlan();
      
      if (plan) {
        // Plan calculated successfully, save it to onboarding data
        console.log('🔍 LoadingStep: Plan calculated successfully, saving nutrition data...');
        console.log('✅ LoadingStep: Nutrition plan calculated:', plan);
        
        // Save the calculated nutrition plan and mark loading as complete in one call
        updateStepData('loading', {
          calories: plan.calories,
          protein: plan.protein,
          carbs: plan.carbs,
          fat: plan.fat,
          loadingCompleted: true
        });
        console.log('✅ LoadingStep: Nutrition data saved and loading marked complete');
      } else {
        // Fallback: mark loading complete after 3 seconds if plan calculation fails
        console.log('🔍 LoadingStep: Plan calculation failed, using fallback timer...');
        setTimeout(() => {
          updateStepData('loading', { loadingCompleted: true });
        }, 2000);
      }
    };

    checkPlanAndAdvance();
  }, [calculatePlan, updateStepData]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
        <Text style={styles.title}>Personalizando seu plano...</Text>
        <Text style={styles.subtitle}>
          Criando um plano único baseado nas suas informações
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
    paddingBottom: spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    marginBottom: spacing.lg,
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
  },
});
