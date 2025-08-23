import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
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
    const step = 1;
    
    const handleHeightChange = (value: number) => {
      setHeight(value);
    };

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
        
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            {Array.from({ length: Math.floor((maxHeight - minHeight) / step) + 1 }, (_, i) => {
              const value = minHeight + (i * step);
              const isMajorTick = value % 10 === 0;
              const isCurrentValue = value === height;
              
              return (
                <View key={value} style={styles.tickContainer}>
                  <View style={[
                    styles.tick,
                    isMajorTick && styles.majorTick,
                    isCurrentValue && styles.currentTick
                  ]} />
                  {isMajorTick && (
                    <Text style={styles.tickLabel}>{value}</Text>
                  )}
                  {isCurrentValue && (
                    <View style={styles.currentValueMarker}>
                      <View style={styles.markerTriangle} />
                      <View style={styles.markerLine} />
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
      </View>
    );
  };

  const renderWeightSlider = () => {
    const minWeight = 40;
    const maxWeight = 150;
    const step = 1;
    
    const handleWeightChange = (value: number) => {
      setWeight(value);
    };

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
        
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            {Array.from({ length: Math.floor((maxWeight - minWeight) / step) + 1 }, (_, i) => {
              const value = minWeight + (i * step);
              const isMajorTick = value % 10 === 0;
              const isCurrentValue = value === weight;
              
              return (
                <View key={value} style={styles.tickContainer}>
                  <View style={[
                    styles.tick,
                    isMajorTick && styles.majorTick,
                    isCurrentValue && styles.currentTick
                  ]} />
                  {isMajorTick && (
                    <Text style={styles.tickLabel}>{value}</Text>
                  )}
                  {isCurrentValue && (
                    <View style={styles.currentValueMarker}>
                      <View style={styles.markerTriangle} />
                      <View style={styles.markerLine} />
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
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  sliderContainer: {
    width: '100%',
    height: 80,
    position: 'relative',
    marginBottom: spacing.md,
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
  currentTick: {
    backgroundColor: colors.primary,
  },
  tickLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  currentValueMarker: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  markerTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.textPrimary,
  },
  markerLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.textPrimary,
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
  disclaimer: {
    fontSize: typography.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: typography.sm * 1.4,
    position: 'absolute',
    bottom: spacing.xxl,
  },
}); 