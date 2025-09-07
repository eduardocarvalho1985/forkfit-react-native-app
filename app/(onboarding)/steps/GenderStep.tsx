import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

const GENDER_OPTIONS = [
  { 
    label: 'Masculino', 
    value: 'male' as const,
  },
  { 
    label: 'Feminino', 
    value: 'female' as const,
  },
  { 
    label: 'Outro', 
    value: 'other' as const,
  },
];

interface GenderStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function GenderStep({ onSetLoading }: GenderStepProps) {
  const { getStepData, updateStepData } = useOnboarding();
  const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(getStepData('gender') || null);

  // Load existing data when component mounts
  useEffect(() => {
    const existingGender = getStepData('gender');
    if (existingGender) {
      setGender(existingGender);
    }
  }, []);

  // Update gender in context whenever it changes
  useEffect(() => {
    if (gender) {
      updateStepData('gender', { gender });
      console.log('Gender updated in context:', gender);
    }
  }, [gender]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Qual é o seu gênero?</Text>
        <Text style={styles.subtitle}>
          Isso nos ajuda a calcular suas necessidades nutricionais com precisão.
        </Text>

        <View style={styles.genderContainer}>
          {GENDER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.genderButton,
                gender === option.value && styles.genderButtonSelected
              ]}
              onPress={() => setGender(option.value)}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  gender === option.value && styles.genderButtonTextSelected
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
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
  genderContainer: {
    width: '100%',
    marginBottom: spacing.xxl,
  },
  genderButton: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    ...shadows.sm,
  },
  genderButtonSelected: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  genderButtonText: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  genderButtonTextSelected: {
    color: colors.textInverse,
  },
}); 