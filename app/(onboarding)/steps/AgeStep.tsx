import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';
import DatePicker from '@/components/DatePicker';

interface AgeStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function AgeStep({ onSetLoading }: AgeStepProps) {
  const { getStepData, updateStepData } = useOnboarding();
  const [birthDate, setBirthDate] = useState(getStepData('birthDate') || '');

  // Load existing data when component mounts
  useEffect(() => {
    const existingBirthDate = getStepData('birthDate');
    if (existingBirthDate) {
      setBirthDate(existingBirthDate);
    }
  }, []);

  // Update birth date in context whenever it changes
  useEffect(() => {
    if (birthDate) {
      // Calculate age from birth date
      const today = new Date();
      const [year, month, day] = birthDate.split('-').map(Number);
      if (year && month && day) {
        const birth = new Date(year, month - 1, day);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        
        updateStepData('age', { birthDate, age });
        console.log('Age updated in context:', { birthDate, age });
      }
    }
  }, [birthDate]);

  const validateBirthDate = (date: string): boolean => {
    const selectedDate = new Date(date);
    const today = new Date();
    const minDate = new Date('1900-01-01');
    return selectedDate >= minDate && selectedDate <= today;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Qual é a sua idade?</Text>
        <Text style={styles.subtitle}>
          Isso nos ajuda a calcular suas necessidades calóricas com precisão.
        </Text>

        <View style={styles.datePickerContainer}>
          <Text style={styles.dateLabel}>Data de Nascimento:</Text>
          <DatePicker
            value={birthDate}
            onChange={setBirthDate}
            placeholder="Selecione sua data de nascimento"
            validateDate={validateBirthDate}
          />
          {birthDate && (
            <Text style={styles.ageDisplay}>
              Idade: {(() => {
                const today = new Date();
                const [year, month, day] = birthDate.split('-').map(Number);
                if (year && month && day) {
                  const birth = new Date(year, month - 1, day);
                  let age = today.getFullYear() - birth.getFullYear();
                  const monthDiff = today.getMonth() - birth.getMonth();
                  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                    age--;
                  }
                  return `${age} anos`;
                }
                return '';
              })()}
            </Text>
          )}
        </View>

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
  datePickerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  dateLabel: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  ageDisplay: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    textAlign: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.lg,
    alignSelf: 'center',
    minWidth: 250,
    borderWidth: 0,
  },
  disclaimer: {
    fontSize: typography.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: typography.sm * 1.4,
    marginTop: spacing.xl,
  },
}); 