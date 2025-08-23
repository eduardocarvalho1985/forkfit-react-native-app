import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import CustomSlider from '@/components/CustomSlider';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

const { width: screenWidth } = Dimensions.get('window');

interface VitalsStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function VitalsStep({ onSetLoading }: VitalsStepProps) {
  const { getStepData, updateStepData } = useOnboarding();
  const [height, setHeight] = useState(getStepData('height') || 170);
  const [weight, setWeight] = useState(getStepData('weight') || 70);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft/in'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  // Load existing data when component mounts
  useEffect(() => {
    const existingHeight = getStepData('height');
    const existingWeight = getStepData('weight');
    
    if (existingHeight) setHeight(existingHeight);
    if (existingWeight) setWeight(existingWeight);
  }, []);

  // Update vitals data in context whenever values change
  useEffect(() => {
    if (height && weight) {
      updateStepData('vitals', {
        height,
        weight
      });
      console.log('Vitals data updated in context:', { height, weight });
    }
  }, [height, weight]);

  const renderHeightSlider = () => {
    const minHeight = 140;
    const maxHeight = 200;
    
    return (
      <View style={styles.sliderContainer}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderLabel}>Altura:</Text>
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitButton, heightUnit === 'ft/in' && styles.unitButtonSelected]}
              onPress={() => setHeightUnit('ft/in')}
            >
              <Text style={[styles.unitButtonText, heightUnit === 'ft/in' && styles.unitButtonTextSelected]}>
                ft/in
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitButton, heightUnit === 'cm' && styles.unitButtonSelected]}
              onPress={() => setHeightUnit('cm')}
            >
              <Text style={[styles.unitButtonText, heightUnit === 'cm' && styles.unitButtonTextSelected]}>
                cm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.valueDisplay}>{height}{heightUnit === 'cm' ? 'cm' : 'ft'}</Text>
        
        <View style={styles.sliderWrapper}>
          <CustomSlider
            value={height}
            onValueChange={setHeight}
            minimumValue={minHeight}
            maximumValue={maxHeight}
            step={1}
            width={screenWidth - 80}
            height={40}
            thumbSize={24}
            trackHeight={6}
            showLabels={true}
          />
        </View>
      </View>
    );
  };

  const renderWeightSlider = () => {
    const minWeight = 40;
    const maxWeight = 150;
    
    return (
      <View style={styles.sliderContainer}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderLabel}>Peso:</Text>
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
        
        <Text style={styles.valueDisplay}>{weight}{weightUnit === 'kg' ? 'kg' : 'lbs'}</Text>
        
        <View style={styles.sliderWrapper}>
          <CustomSlider
            value={weight}
            onValueChange={setWeight}
            minimumValue={minWeight}
            maximumValue={maxWeight}
            step={1}
            width={screenWidth - 80}
            height={40}
            thumbSize={24}
            trackHeight={6}
            showLabels={true}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Peso e altura</Text>
        <Text style={styles.subtitle}>
          Isso nos ajuda a personalizar o seu plano de nutrição.
        </Text>

        {renderHeightSlider()}
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
  sliderWrapper: {
    width: '100%',
    alignItems: 'center',
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