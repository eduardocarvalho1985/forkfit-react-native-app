import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

interface TargetWeightStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function TargetWeightStep({ onSetLoading }: TargetWeightStepProps) {
  const { updateStepData, onboardingData } = useOnboarding();
  const [targetWeight, setTargetWeight] = useState(onboardingData.targetWeight || onboardingData.weight || 70);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  // Initialize with current weight if available
  useEffect(() => {
    if (onboardingData.weight) {
      setTargetWeight(onboardingData.weight);
    }
  }, [onboardingData.weight]);

  // Update target weight in context whenever it changes
  useEffect(() => {
    if (targetWeight && onboardingData.weight) {
      updateStepData('targetWeight', { targetWeight });
      console.log('Target weight updated in context:', targetWeight);
    }
  }, [targetWeight]);

  const renderWeightSlider = () => {
    const currentWeight = onboardingData.weight || 70;
    const minWeight = Math.max(40, currentWeight * 0.6); // 60% of current weight
    const maxWeight = Math.min(150, currentWeight * 1.4); // 140% of current weight
    const step = 1;
    
    const handleWeightChange = (value: number) => {
      setTargetWeight(value);
    };

    return (
      <View style={styles.sliderContainer}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderLabel}>Peso Alvo:</Text>
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitButton, weightUnit === 'lbs' && styles.unitButtonSelected]}
              onPress={() => setWeightUnit('lbs')}
            >
              <Text style={[styles.unitButtonText, weightUnit === 'lbs' && styles.unitButtonTextSelected]}>
                lbs
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitButton, weightUnit === 'kg' && styles.unitButtonSelected]}
              onPress={() => setWeightUnit('kg')}
            >
              <Text style={[styles.unitButtonText, weightUnit === 'kg' && styles.unitButtonTextSelected]}>
                kg
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.valueDisplay}>{targetWeight}{weightUnit === 'kg' ? 'kg' : 'lbs'}</Text>
        
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            {Array.from({ length: Math.floor((maxWeight - minWeight) / step) + 1 }, (_, i) => {
              const value = minWeight + (i * step);
              const isMajorTick = value % 10 === 0;
              const isCurrentValue = value === targetWeight;
              const isCurrentWeight = value === currentWeight;
              
              return (
                <View key={value} style={styles.tickContainer}>
                  <View style={[
                    styles.tick,
                    isMajorTick && styles.majorTick,
                    isCurrentWeight && styles.currentWeightTick,
                    isCurrentValue && styles.targetWeightTick
                  ]} />
                  {isMajorTick && (
                    <Text style={styles.tickLabel}>{value}</Text>
                  )}
                  {isCurrentWeight && (
                    <View style={styles.currentWeightMarker}>
                      <Text style={styles.currentWeightLabel}>Atual</Text>
                      <View style={styles.currentWeightLine} />
                    </View>
                  )}
                  {isCurrentValue && (
                    <View style={styles.targetWeightMarker}>
                      <View style={styles.targetWeightTriangle} />
                      <View style={styles.targetWeightLine} />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
          
          <View style={styles.sliderHandle}>
            <View style={styles.handleCircle} />
          </View>
        </View>
        
        <View style={styles.weightInfo}>
          <Text style={styles.weightInfoText}>
            Peso atual: <Text style={styles.currentWeightValue}>{currentWeight}kg</Text>
          </Text>
          <Text style={styles.weightInfoText}>
            Diferença: <Text style={styles.differenceValue}>
              {Math.abs(targetWeight - currentWeight)}kg
            </Text>
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Qual é o seu peso alvo?</Text>
        <Text style={styles.subtitle}>
          Defina um objetivo realista para sua jornada de transformação
        </Text>

        {renderWeightSlider()}

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
  sliderContainer: {
    width: '100%',
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
  },
  sliderLabel: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.sm,
    padding: 2,
  },
  unitButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  unitButtonSelected: {
    backgroundColor: colors.textPrimary,
  },
  unitButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  },
  unitButtonTextSelected: {
    color: colors.textInverse,
  },
  valueDisplay: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  sliderTrack: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    position: 'relative',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
  },
  tickContainer: {
    alignItems: 'center',
    position: 'relative',
    flex: 1,
  },
  tick: {
    width: 1,
    height: 8,
    backgroundColor: colors.border,
  },
  majorTick: {
    height: 16,
    backgroundColor: colors.textSecondary,
  },
  currentWeightTick: {
    backgroundColor: colors.textSecondary,
  },
  targetWeightTick: {
    backgroundColor: colors.primary,
  },
  tickLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  currentWeightMarker: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  currentWeightLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  currentWeightLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.textSecondary,
  },
  targetWeightMarker: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  targetWeightTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.primary,
  },
  targetWeightLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.primary,
    marginTop: -1,
  },
  sliderHandle: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: [{ translateX: -15 }],
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.background,
    ...shadows.md,
  },
  weightInfo: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  weightInfoText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  currentWeightValue: {
    color: colors.textSecondary,
    fontWeight: typography.bold,
  },
  differenceValue: {
    color: colors.primary,
    fontWeight: typography.bold,
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
