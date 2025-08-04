import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const BORDER = '#FFA28F';
const TEXT = '#1F2937';

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
      <Text style={styles.stepText}>
        Passo {currentStep} de {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: OFF_WHITE,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: BORDER,
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: CORAL,
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: CORAL,
    minWidth: 35,
  },
  stepText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
}); 