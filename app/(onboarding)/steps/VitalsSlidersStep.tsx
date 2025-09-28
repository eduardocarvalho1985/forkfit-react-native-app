import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import RulerSlider from '@/components/RulerSlider';
import UnitToggle from '@/components/UnitToggle';
import { useOnboarding } from '../OnboardingContext';
import { cmToFeetIn, kgToLbs } from '@/utils/units';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

const { width: screenWidth } = Dimensions.get('window');

interface VitalsStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function VitalsStep({ onSetLoading }: VitalsStepProps) {
  const { getStepData, updateStepData } = useOnboarding();
  const [heightCm, setHeightCm] = useState(getStepData('height') || 170); // Default to 170cm
  const [weightKg, setWeightKg] = useState(getStepData('weight') || 60); // Default to 60kg
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  // Load existing data when component mounts
  useEffect(() => {
    const existingHeight = getStepData('height');
    const existingWeight = getStepData('weight');
    
    if (existingHeight) setHeightCm(existingHeight);
    if (existingWeight) setWeightKg(existingWeight);
    
    // Load unit system preference if available
    const unitPrefs = getStepData('prefs')?.unitSystem;
    if (unitPrefs) {
      setUnitSystem(unitPrefs);
    }
  }, []); // Empty dependency array - only run once on mount

  // Update vitals data in context whenever values change
  useEffect(() => {
    if (heightCm && weightKg) {
      updateStepData('vitals', {
        height: heightCm,
        weight: weightKg
      });
    }
  }, [heightCm, weightKg]); // Remove updateStepData from dependencies

  const handleUnitSystemChange = useCallback((selectedOption: string) => {
    // Map the selected option to the unit system
    const system = (selectedOption === 'cm' || selectedOption === 'kg') ? 'metric' : 'imperial';
    
    // Prevent unnecessary state updates if clicking the same system
    if (system === unitSystem) {
      return;
    }
    
    setUnitSystem(system);
    
    // Save unit system preference
    const currentPrefs = getStepData('prefs') || {};
    updateStepData('prefs', {
      ...currentPrefs,
      unitSystem: system
    });
  }, [unitSystem, getStepData, updateStepData]);

  const formatHeightLabel = useCallback((value: number) => {
    if (unitSystem === 'metric') {
      return `${value.toFixed(0)} cm`;
    } else {
      return cmToFeetIn(value);
    }
  }, [unitSystem]);

  const formatWeightLabel = useCallback((value: number) => {
    if (unitSystem === 'metric') {
      return `${value.toFixed(1)} kg`;
    } else {
      return `${kgToLbs(value)} lbs`;
    }
  }, [unitSystem]);

  const renderHeightSlider = useMemo(() => {
    return (
      <View style={styles.sliderContainer}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderLabel}>Altura:</Text>
          <UnitToggle
            options={['cm', 'ft/in']}
            value={unitSystem === 'metric' ? 'cm' : 'ft/in'}
            onChange={handleUnitSystemChange}
            label="Unidade"
          />
        </View>
        
        <RulerSlider
          min={140}
          max={200}
          step={1}
          value={heightCm}
          onChange={setHeightCm}
          majorEvery={10}
          labelEvery={10}
          tickWidth={12}
          formatCenterLabel={formatHeightLabel}
          unit={unitSystem === 'metric' ? 'cm' : ''}
        />
      </View>
    );
  }, [heightCm, unitSystem, handleUnitSystemChange, formatHeightLabel]);

  const renderWeightSlider = useMemo(() => {
    return (
      <View style={styles.sliderContainer}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderLabel}>Peso:</Text>
          <UnitToggle
            options={['kg', 'lbs']}
            value={unitSystem === 'metric' ? 'kg' : 'lbs'}
            onChange={handleUnitSystemChange}
            label="Unidade"
          />
        </View>
        
        <RulerSlider
          min={40}
          max={150}
          step={0.5}
          value={weightKg}
          onChange={setWeightKg}
          majorEvery={5}
          labelEvery={5}
          tickWidth={12}
          formatCenterLabel={formatWeightLabel}
          unit={unitSystem === 'metric' ? 'kg' : ''}
        />
      </View>
    );
  }, [weightKg, unitSystem, handleUnitSystemChange, formatWeightLabel]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Peso e altura</Text>
        <Text style={styles.subtitle}>
          Isso nos ajuda a personalizar o seu plano de nutrição.
        </Text>

        {renderHeightSlider}
        {renderWeightSlider}

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
    paddingTop: spacing.xxxl + spacing.xl,
    paddingBottom: spacing.xxl,
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
  sliderWrapper: {
    width: '100%',
    alignItems: 'center',
  },
}); 