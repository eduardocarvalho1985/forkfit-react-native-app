import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import CurvedLineChartWithGradient from '@/components/CurvedLineChartWithGradient';
import { generateWeightProjections, getGoalDescription } from '@/utils/weightProjections';
import { colors, spacing, typography } from '@/theme';

interface WeightLossInfoStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function WeightLossInfoStep({ onSetLoading }: WeightLossInfoStepProps) {
  const { updateStepData, onboardingData } = useOnboarding();
  const hasMarkedCompleted = useRef(false);

  // Mark this step as completed when component mounts (only once)
  useEffect(() => {
    if (!hasMarkedCompleted.current) {
      hasMarkedCompleted.current = true;
      updateStepData('weightLossInfo', { weightLossCurveInfo: true });
      console.log('Weight loss info step completed');
    }
  }, []);

  // Generate chart data based on user's goal
  const chartData = useMemo(() => {
    const currentWeight = onboardingData.weight || 70;
    const targetWeight = onboardingData.targetWeight || currentWeight;
    
    // Determine mode based on goal
    let mode: 'lose' | 'gain' | 'maintain' = 'maintain';
    let amountKg: number | null = null;
    
    if (targetWeight < currentWeight) {
      mode = 'lose';
      amountKg = currentWeight - targetWeight;
    } else if (targetWeight > currentWeight) {
      mode = 'gain';
      amountKg = targetWeight - currentWeight;
    }
    
    // Generate 12-week projection
    const weeks = 12;
    const projections = generateWeightProjections({
      mode,
      currentWeight,
      targetWeight,
      weeks
    });
    
    return {
      mode,
      amountKg,
      currentWeight,
      targetWeight,
      projections
    };
  }, [onboardingData.weight, onboardingData.targetWeight]);

  // Generate dynamic headline
  const headline = useMemo(() => {
    const { mode, amountKg } = chartData;
    const goalText = getGoalDescription(mode, amountKg || undefined);
    
    return (
      <Text style={styles.headline}>
        Pronto para{' '}
        <Text style={styles.emphasis}>{goalText}</Text>
        ? Comece hoje e celebre as pequenas vitórias!
      </Text>
    );
  }, [chartData]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {headline}
        
        <Text style={styles.subheadline}>
          Acompanhar a sua dieta ajuda a manter consistência e a conquistar os seus objetivos.
        </Text>

        <CurvedLineChartWithGradient
          withForkFit={chartData.projections.withForkFit}
          withoutForkFit={chartData.projections.withoutForkFit}
          currentWeight={chartData.currentWeight}
          targetWeight={chartData.targetWeight}
          mode={chartData.mode}
        />

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
    alignItems: 'center',
  },
  headline: {
    fontSize: typography['3xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: typography['3xl'] * 1.2,
  },
  emphasis: {
    color: colors.info,
    fontWeight: typography.bold,
  },
  subheadline: {
    fontSize: typography.base,
    lineHeight: typography.base * 1.5,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
});
