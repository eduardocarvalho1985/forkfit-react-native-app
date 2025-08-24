import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

interface PlanStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function PlanStep({ onSetLoading }: PlanStepProps) {
  const { calculatePlan, updateStepData, onboardingData } = useOnboarding();
  const [plan, setPlan] = useState<{ calories: number; protein: number; carbs: number; fat: number } | null>(null);

  // Calculate plan when component mounts
  useEffect(() => {
    const calculatedPlan = calculatePlan();
    
    if (calculatedPlan) {
      setPlan(calculatedPlan);
    } else {
      // If plan is not available, try to calculate it again after a short delay
      const timer = setTimeout(() => {
        const retryPlan = calculatePlan();
        if (retryPlan) {
          setPlan(retryPlan);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [calculatePlan]);

  // Helper functions for display
  const getGoalLabel = () => {
    switch (onboardingData.goal) {
      case 'lose_weight': return 'Perder peso';
      case 'gain_muscle': return 'Ganhar massa';
      case 'maintain': return 'Manter';
      default: return 'Alcançar objetivo';
    }
  };

  const getWeeksToGoal = () => {
    if (!onboardingData.weight || !onboardingData.targetWeight || !onboardingData.weeklyPacing) {
      return 'algumas semanas';
    }
    
    const weightDiff = Math.abs(onboardingData.weight - onboardingData.targetWeight);
    const weeks = Math.ceil(weightDiff / Math.abs(onboardingData.weeklyPacing));
    
    if (weeks <= 1) return '1 semana';
    if (weeks > 99) return '99+ semanas';
    return `${weeks} semanas`;
  };

  const getExerciseFrequency = () => {
    switch (onboardingData.activityLevel) {
      case 'sedentary': return '0-1 vez por semana';
      case 'light': return '1-3 vezes por semana';
      case 'moderate': return '3-5 vezes por semana';
      case 'very_active': return '6-7 vezes por semana';
      default: return '3-5 vezes por semana';
    }
  };

  if (!plan) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Calculando seu plano...</Text>
          <Text style={styles.subtitle}>
            Estamos criando seu plano personalizado baseado nas suas informações.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            O seu plano personalizado está pronto! 🎉
          </Text>
          <Text style={styles.headerSubtitle}>
            O ForkFit acredita que você consegue atingir os seus objetivos em {getWeeksToGoal()}
          </Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Objetivo</Text>
              <Text style={styles.summaryValue}>{getGoalLabel()}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Peso alvo</Text>
              <Text style={styles.summaryValue}>{onboardingData.targetWeight} kg</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total calorias</Text>
              <Text style={styles.summaryValue}>{plan.calories} kcal</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Exercício</Text>
              <Text style={styles.summaryValue}>{getExerciseFrequency()}</Text>
            </View>
          </View>
        </View>

        {/* Macro Card */}
        <View style={styles.macroCard}>
          {/* Calories on top */}
          <View style={styles.caloriesSection}>
            <View style={styles.caloriesIconContainer}>
              <FontAwesome6 name="fire-flame-curved" size={32} color={colors.primary} />
            </View>
            <Text style={styles.caloriesValue}>{plan.calories}</Text>
            <Text style={styles.caloriesUnit}>kcal</Text>
            <Text style={styles.caloriesLabel}>Calorias</Text>
          </View>
          
          {/* Macros below */}
          <View style={styles.macrosRow}>
            <View style={styles.macroItem}>
              <View style={styles.macroIconContainer}>
                <FontAwesome6 name="drumstick-bite" size={24} color={colors.info} />
              </View>
              <Text style={styles.macroValue}>{plan.protein}</Text>
              <Text style={styles.macroUnit}>g</Text>
              <Text style={styles.macroLabel}>Proteína</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={styles.macroIconContainer}>
                <FontAwesome6 name="wheat-awn" size={24} color={colors.warning} />
              </View>
              <Text style={styles.macroValue}>{plan.carbs}</Text>
              <Text style={styles.macroUnit}>g</Text>
              <Text style={styles.macroLabel}>Carboidratos</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={styles.macroIconContainer}>
                <FontAwesome6 name="bottle-droplet" size={24} color={colors.error} />
              </View>
              <Text style={styles.macroValue}>{plan.fat}</Text>
              <Text style={styles.macroUnit}>g</Text>
              <Text style={styles.macroLabel}>Gorduras</Text>
            </View>
          </View>
        </View>

        {/* Divider Line */}
        <View style={styles.divider} />

        {/* Info Links */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Como calculamos</Text>
          <View style={styles.infoLinks}>
            <Text style={styles.infoLinkText}>Taxa Metabólica Basal (BMR)</Text>
            <Text style={styles.infoLinkText}>Gasto diário total (TDEE)</Text>
            <Text style={styles.infoLinkText}>Déficit/Superávit calórico</Text>
            <Text style={styles.infoLinkText}>Distribuição de macros</Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerSection}>
          <Text style={styles.disclaimerTitle}>Informações importantes</Text>
          <Text style={styles.disclaimerText}>
            Recomendações para maiores de 18 anos.
          </Text>
          <Text style={styles.disclaimerText}>
            Os valores são estimativas — ajuste conforme energia e progresso.
          </Text>
        </View>

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Começar meu plano</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Plain white background
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding, // Use theme spacing instead of hardcoded 20px
    paddingTop: spacing.xxl,
    paddingBottom: spacing.footerBottom,
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.lg, // Add some top padding for better spacing
  },
  headerTitle: {
    fontSize: typography['3xl'], // Same size as other steps
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md, // Use theme spacing
  },
  headerSubtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.base * 1.5,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF', // White background
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    minHeight: 100,
    justifyContent: 'center',
    ...shadows.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs, // Smaller gap for 4 items
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: spacing.xs, // Add some padding for better spacing
  },
  summaryLabel: {
    fontSize: typography.xs, // Smaller text for 4 items
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: typography.sm, // Smaller text for 4 items
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  macroCard: {
    backgroundColor: '#FFFFFF', // White background
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  macroValue: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  macroUnit: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  macroLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  infoTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  infoLinks: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  infoLinkText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  disclaimerSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  disclaimerTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  disclaimerText: {
    fontSize: 12, // As per spec
    color: colors.textSecondary, // Use theme color instead of hardcoded
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
  ctaSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: colors.primary, // Use theme color instead of hardcoded
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    minHeight: 48,
    minWidth: 200, // Ensure button has good width
    ...shadows.md,
  },
  ctaButtonText: {
    color: colors.textInverse, // Use theme color instead of hardcoded
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  caloriesSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm, // Add some padding for better spacing
  },
  caloriesValue: {
    fontSize: typography['3xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  caloriesUnit: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  caloriesLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  caloriesIconContainer: {
    marginBottom: spacing.xs,
  },
  macroIconContainer: {
    marginBottom: spacing.xs,
  },
}); 