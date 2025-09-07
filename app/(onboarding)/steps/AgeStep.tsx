import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

interface AgeStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function AgeStep({ onSetLoading }: AgeStepProps) {
  const { getStepData, updateStepData } = useOnboarding();
  const [selectedAge, setSelectedAge] = useState(getStepData('age') || 35);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load existing data when component mounts
  useEffect(() => {
    const existingAge = getStepData('age');
    if (existingAge) {
      setSelectedAge(existingAge);
    }
  }, []);

  // Update age in context whenever it changes
  useEffect(() => {
    if (selectedAge) {
      updateStepData('age', { age: selectedAge });
      console.log('Age updated in context:', selectedAge);
    }
  }, [selectedAge]);

  const generateAges = () => {
    return Array.from({ length: 84 }, (_, i) => 16 + i); // 16 to 99
  };

  const AgeItem = ({ age, isSelected, onPress }: { age: number; isSelected: boolean; onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.ageItem, isSelected && styles.ageItemSelected]}
      onPress={onPress}
    >
      <Text style={[styles.ageItemText, isSelected && styles.ageItemTextSelected]}>
        {age} anos
      </Text>
    </TouchableOpacity>
  );

  const handleAgeSelect = (age: number) => {
    setSelectedAge(age);
    setIsExpanded(false); // Close the slider after selection
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Qual é a sua idade?</Text>
        <Text style={styles.subtitle}>
          Isso nos ajuda a calcular suas necessidades calóricas com precisão.
        </Text>

        <View style={styles.ageSelectorContainer}>
          <Text style={styles.selectorLabel}>Sua idade:</Text>
          
          {/* Single Age Display */}
          <TouchableOpacity 
            style={styles.singleAgeDisplay}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={styles.singleAgeText}>{selectedAge} anos</Text>
            <Text style={styles.tapToChangeText}>Toque para alterar</Text>
          </TouchableOpacity>

          {/* Expandable Age Slider */}
          {isExpanded && (
            <View style={styles.ageSelector}>
              <ScrollView 
                style={styles.ageScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.ageScrollContent}
              >
                {generateAges().map((age) => (
                  <AgeItem
                    key={age}
                    age={age}
                    isSelected={selectedAge === age}
                    onPress={() => handleAgeSelect(age)}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
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
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  ageSelectorContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  selectorLabel: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  singleAgeDisplay: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    minWidth: 150,
    ...shadows.sm,
  },
  singleAgeText: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  tapToChangeText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  ageSelector: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    maxHeight: 300,
    minWidth: 120,
    marginTop: spacing.md,
    ...shadows.sm,
  },
  ageScroll: {
    maxHeight: 280,
  },
  ageScrollContent: {
    alignItems: 'center',
  },
  ageItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginVertical: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  ageItemSelected: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  ageItemText: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  },
  ageItemTextSelected: {
    color: colors.background,
    fontWeight: typography.semibold,
  },
}); 