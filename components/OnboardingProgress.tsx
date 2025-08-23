import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  showPercentage?: boolean;
}

export default function OnboardingProgress({ 
  currentStep, 
  totalSteps, 
  showPercentage = true
}: OnboardingProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progress}%` }
              ]} 
            />
          </View>
          {showPercentage && (
            <Text style={styles.percentageText}>
              {Math.round(progress)}%
            </Text>
          )}
        </View>
      </View>
      <Text style={styles.stepText}>
        Passo {currentStep} de {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundSecondary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: 3,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  percentageText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.primary,
    minWidth: 35,
  },
  stepText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
}); 