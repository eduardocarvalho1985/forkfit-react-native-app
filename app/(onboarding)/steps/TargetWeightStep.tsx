import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RulerSlider from '@/components/RulerSlider';
import UnitToggle from '@/components/UnitToggle';
import { useOnboarding } from '../OnboardingContext';
import { kgToLbs } from '@/utils/units';
import { colors, spacing, typography } from '@/theme';

interface TargetWeightStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function TargetWeightStep({ onSetLoading }: TargetWeightStepProps) {
  const { updateStepData, onboardingData, getStepData } = useOnboarding();
  const [targetWeightKg, setTargetWeightKg] = useState(onboardingData.targetWeight || onboardingData.weight || 70);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  // Initialize with current weight if available (only once on mount)
  useEffect(() => {
    // Only set target weight if it hasn't been set yet
    if (!onboardingData.targetWeight && onboardingData.weight) {
      setTargetWeightKg(onboardingData.weight);
    }
    
    // Load unit preference if available
    const unitPref = getStepData('prefs')?.units?.weight;
    if (unitPref === 'kg' || unitPref === 'lbs') {
      setWeightUnit(unitPref);
    }
  }, []); // Empty dependency array - only run once on mount

  // Update target weight in context whenever it changes
  useEffect(() => {
    // Always save target weight to context, even if it's the same as current weight
    // This allows users to continue with maintaining the same weight
    if (targetWeightKg) {
      updateStepData('targetWeight', { targetWeight: targetWeightKg });
      console.log('🔍 TargetWeightStep: Updated target weight to:', targetWeightKg, 'kg');
    }
  }, [targetWeightKg]); // Removed onboardingData.weight dependency to always save

  const handleWeightUnitChange = useCallback((newUnit: string) => {
    const unit = newUnit as 'kg' | 'lbs';
    console.log('🔍 TargetWeightStep: Changing unit from', weightUnit, 'to', unit);
    setWeightUnit(unit);
    
    // Save unit preference
    const currentPrefs = getStepData('prefs') || {};
    updateStepData('prefs', {
      ...currentPrefs,
      units: { ...(currentPrefs.units || {}), weight: unit }
    });
  }, [getStepData, weightUnit]); // Added weightUnit to dependencies

  const formatWeightLabel = useCallback((value: number) => {
    if (weightUnit === 'kg') {
      return `${value.toFixed(1)} kg`;
    } else {
      return `${kgToLbs(value).toFixed(1)} lbs`;
    }
  }, [weightUnit]);

  const renderWeightSlider = useMemo(() => {
    const currentWeight = onboardingData.weight || 70;
    // Remove weight restrictions - allow any reasonable range for all goals
    const minWeight = 40; // Absolute minimum
    const maxWeight = 200; // Absolute maximum
    
    // Convert current weight to display unit for info section
    const displayCurrentWeight = weightUnit === 'kg' ? currentWeight : kgToLbs(currentWeight);
    const displayTargetWeight = weightUnit === 'kg' ? targetWeightKg : kgToLbs(targetWeightKg);
    const displayDifference = Math.abs(displayTargetWeight - displayCurrentWeight);
    const displayUnit = weightUnit === 'kg' ? 'kg' : 'lbs';
    
    return (
      <View style={styles.sliderContainer}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderLabel}>Peso Alvo:</Text>
          <UnitToggle
            options={['kg', 'lbs']}
            value={weightUnit}
            onChange={handleWeightUnitChange}
            label="Unidade"
          />
        </View>
        
        <RulerSlider
          min={minWeight}
          max={maxWeight}
          step={0.5}
          value={targetWeightKg}
          onChange={setTargetWeightKg}
          majorEvery={5}
          labelEvery={5}
          tickWidth={12}
          formatCenterLabel={formatWeightLabel}
          unit={weightUnit === 'kg' ? 'kg' : ''}
        />
        
        <View style={styles.weightInfo}>
          <Text style={styles.weightInfoText}>
            Peso atual: <Text style={styles.currentWeightValue}>{displayCurrentWeight.toFixed(1)}{displayUnit}</Text>
          </Text>
          <Text style={styles.weightInfoText}>
            Diferença: <Text style={styles.differenceValue}>
              {displayDifference.toFixed(1)}{displayUnit}
            </Text>
          </Text>
        </View>
      </View>
    );
  }, [targetWeightKg, weightUnit, onboardingData.weight, handleWeightUnitChange, formatWeightLabel]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Qual é o seu peso alvo?</Text>
        <Text style={styles.subtitle}>
          Defina um objetivo realista para sua jornada de transformação
        </Text>

        {renderWeightSlider}

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
