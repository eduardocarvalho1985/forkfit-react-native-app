import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import GoalProgressionChart from '@/components/GoalProgressionChart';
import { generateGoalProgressionData } from '@/utils/goalProgressionData';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

interface LossPlanInfoStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function LossPlanInfoStep({ onSetLoading }: LossPlanInfoStepProps) {
  const { updateStepData, onboardingData } = useOnboarding();
  const hasMarkedCompleted = useRef(false);

  // Mark this step as completed when component mounts (only once)
  useEffect(() => {
    if (!hasMarkedCompleted.current) {
      hasMarkedCompleted.current = true;
      updateStepData('lossPlanInfo', { lossPlanInfo: true });
      console.log('Loss plan info step completed');
    }
  }, []);

  // Determine goal type and generate chart data
  const chartData = useMemo(() => {
    const goal = onboardingData.goal || 'maintain';
    let goalType: 'lose' | 'gain' | 'maintain' = 'maintain';
    
    if (goal === 'lose_weight') {
      goalType = 'lose';
    } else if (goal === 'gain_muscle') {
      goalType = 'gain';
    } else {
      goalType = 'maintain';
    }
    
    const progressionData = generateGoalProgressionData({ goalType });
    
    return {
      goalType,
      progressionData
    };
  }, [onboardingData.goal]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Headline */}
        <Text style={styles.headline}>
          Você tem grande potencial para bater sua meta!
        </Text>
        
        {/* Subheadline */}
        <Text style={styles.subheadline}>
          Com base em nossos dados históricos, a mudança de peso costuma ser mais lenta nos primeiros dias, mas após 7 dias você ganha tração e alcança sua meta mais rápido.
        </Text>

        {/* Goal Progress Card */}
        <View style={styles.goalProgressCard}>
          <Text style={styles.cardTitle}>
            Evolução da sua Meta
          </Text>
          
          <GoalProgressionChart
            data={chartData.progressionData}
            goalType={chartData.goalType}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
  },
  headline: {
    fontSize: typography.display,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing[6],
    marginBottom: spacing.md,
  },
  subheadline: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.base * 1.5,
    marginTop: spacing[3],
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  goalProgressCard: {
    backgroundColor: colors.bg.raised,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    marginTop: spacing[6],
    marginHorizontal: spacing[4],
    ...shadows.md,
  },
  cardTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
});
