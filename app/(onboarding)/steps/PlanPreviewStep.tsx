import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

interface PlanStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function PlanStep({ onSetLoading }: PlanStepProps) {
  const { calculatePlan, updateStepData } = useOnboarding();
  const [plan, setPlan] = useState<{ calories: number; protein: number; carbs: number; fat: number } | null>(null);

  // Calculate plan when component mounts
  useEffect(() => {
    const calculatedPlan = calculatePlan();
    if (calculatedPlan) {
      setPlan(calculatedPlan);
      // Save the calculated plan to context
      updateStepData('plan', calculatedPlan);
    }
  }, []);



  if (!plan) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Calculando seu plano...</Text>
          <Text style={styles.subtitle}>
            Estamos criando seu plano personalizado.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.celebrationContainer}>
          <Text style={styles.celebrationIcon}>🎉</Text>
          <Text style={styles.title}>Your Personalized Plan Preview</Text>
          <Text style={styles.subtitle}>
            The &quot;Aha!&quot; moment. Display the final plan.
          </Text>
        </View>

        <View style={styles.planContainer}>
          <View style={styles.caloriesCard}>
            <Text style={styles.caloriesLabel}>Meta Diária de Calorias</Text>
            <Text style={styles.caloriesValue}>{plan.calories}</Text>
            <Text style={styles.caloriesUnit}>calorias</Text>
          </View>

          <View style={styles.macrosContainer}>
            <Text style={styles.macrosTitle}>Distribuição de Macronutrientes</Text>
            
            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Proteína</Text>
                <Text style={styles.macroValue}>{plan.protein}g</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Carboidratos</Text>
                <Text style={styles.macroValue}>{plan.carbs}g</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Gorduras</Text>
                <Text style={styles.macroValue}>{plan.fat}g</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Este é o seu ponto de partida. Você pode ajustar suas metas a qualquer momento nos Ajustes.
          </Text>
        </View>

        <Text style={styles.note}>
          Seu plano será salvo automaticamente e estará disponível no dashboard.
        </Text>
      </View>
    </ScrollView>
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
    paddingBottom: spacing.footerBottom,
  },
  celebrationContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  celebrationIcon: {
    fontSize: typography['5xl'],
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography['3xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.base * 1.5,
  },
  planContainer: {
    marginBottom: spacing.xl,
  },
  caloriesCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.primary,
  },
  caloriesLabel: {
    fontSize: typography.base,
    color: colors.textInverse,
    fontWeight: typography.semibold,
    marginBottom: spacing.sm,
  },
  caloriesValue: {
    fontSize: typography['5xl'],
    fontWeight: typography.bold,
    color: colors.textInverse,
    marginBottom: spacing.xs,
  },
  caloriesUnit: {
    fontSize: typography.base,
    color: colors.textInverse,
    opacity: 0.9,
  },
  macrosContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    ...shadows.md,
  },
  macrosTitle: {
    fontSize: typography.lg,
    color: colors.textPrimary,
    fontWeight: typography.semibold,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  macroValue: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  infoContainer: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sm * 1.4,
  },
  note: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sm * 1.4,
  },
}); 