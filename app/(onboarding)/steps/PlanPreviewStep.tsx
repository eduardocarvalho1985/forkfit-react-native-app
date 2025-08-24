import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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

  const getActivityReadable = () => {
    switch (onboardingData.activityLevel) {
      case 'sedentary': return 'Sedentário';
      case 'light': return 'Leve';
      case 'moderate': return 'Moderado';
      case 'very_active': return 'Muito ativo';
      default: return 'Moderado';
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
            Seu Plano Personalizado está pronto
          </Text>
          <Text style={styles.headerSubtitle}>
            Baseado no seu objetivo de {getGoalLabel().toLowerCase()}
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Seu objetivo</Text>
              <Text style={styles.summaryValue}>{getGoalLabel()}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Peso-alvo</Text>
              <Text style={styles.summaryValue}>{onboardingData.targetWeight} kg</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Calorias diárias</Text>
              <Text style={styles.summaryValue}>{plan.calories} kcal</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Nível de exercício</Text>
              <Text style={styles.summaryValue}>{getActivityReadable()}</Text>
            </View>
          </View>
        </View>

        {/* Daily Recommendation Section */}
        <View style={styles.dailyRecommendation}>
          <Text style={styles.dailyTitle}>Recomendação diária</Text>
          <Text style={styles.editableNote}>
            Você pode ajustar isso a qualquer momento
          </Text>
          
          <View style={styles.macroCards}>
            <View style={styles.macroCard}>
              <Text style={styles.macroIcon}>🔥</Text>
              <Text style={styles.macroValue}>{plan.calories}</Text>
              <Text style={styles.macroUnit}>Calorias</Text>
            </View>
            <View style={styles.macroCard}>
              <Text style={styles.macroIcon}>🍗</Text>
              <Text style={styles.macroValue}>{plan.protein}</Text>
              <Text style={styles.macroUnit}>g</Text>
              <Text style={styles.macroLabel}>Proteína</Text>
            </View>
            <View style={styles.macroCard}>
              <Text style={styles.macroIcon}>🍞</Text>
              <Text style={styles.macroValue}>{plan.carbs}</Text>
              <Text style={styles.macroUnit}>g</Text>
              <Text style={styles.macroLabel}>Carboidratos</Text>
            </View>
            <View style={styles.macroCard}>
              <Text style={styles.macroIcon}>🥜</Text>
              <Text style={styles.macroValue}>{plan.fat}</Text>
              <Text style={styles.macroUnit}>g</Text>
              <Text style={styles.macroLabel}>Gorduras</Text>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Gerar meu plano</Text>
          </TouchableOpacity>
        </View>

        {/* Learn More Section */}
        <View style={styles.learnMore}>
          <Text style={styles.learnMoreTitle}>Como calculamos</Text>
          <View style={styles.learnMoreLinks}>
            <Text style={styles.learnMoreLink}>BMR (Taxa Metabólica Basal)</Text>
            <Text style={styles.learnMoreLink}>TDEE (Gasto diário total)</Text>
            <Text style={styles.learnMoreLink}>Déficit/Superávit calórico</Text>
            <Text style={styles.learnMoreLink}>Distribuição de macros</Text>
          </View>
        </View>

        {/* Disclaimers */}
        <View style={styles.disclaimers}>
          <Text style={styles.disclaimerText}>
            Recomendações destinadas a adultos (18+). Procure orientação médica para condições específicas.
          </Text>
          <Text style={styles.disclaimerText}>
            Mantemos suas calorias dentro de limites seguros (≥80% do BMR e ≤15% acima do TDEE).
          </Text>
          <Text style={styles.disclaimerText}>
            Os valores são estimativas — ajuste conforme saciedade, energia e progresso.
          </Text>
        </View>
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
    marginBottom: spacing.xxl,
  },
  headerTitle: {
    fontSize: typography['3xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.base * 1.5,
  },
  summaryContainer: {
    marginBottom: spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flex: 1,
    marginHorizontal: spacing.xs,
    ...shadows.md,
  },
  summaryLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  dailyRecommendation: {
    marginBottom: spacing.xl,
  },
  dailyTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  editableNote: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  macroCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  macroCard: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.sm,
    width: '48%', // Two columns
    ...shadows.md,
  },
  macroIcon: {
    fontSize: typography['2xl'],
    marginBottom: spacing.xs,
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
  },
  macroLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  ctaContainer: {
    marginBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  learnMore: {
    marginBottom: spacing.xl,
  },
  learnMoreTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  learnMoreLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  learnMoreLink: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  disclaimers: {
    marginTop: spacing.lg,
  },
  disclaimerText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sm * 1.4,
    marginBottom: spacing.xs,
  },
}); 