import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

interface EventChoiceStepProps {
  onSetLoading: (loading: boolean) => void;
}

const EVENT_OPTIONS = [
  {
    value: 'wedding',
    label: 'Casamento'
  },
  {
    value: 'vacation',
    label: 'Férias'
  },
  {
    value: 'reunion',
    label: 'Reunião de Família'
  },
  {
    value: 'beach_season',
    label: 'Temporada de Praia'
  },
  {
    value: 'none',
    label: 'Nenhum evento específico'
  }
];

export default function EventChoiceStep({ onSetLoading }: EventChoiceStepProps) {
  const { getStepData, updateStepData } = useOnboarding();
  const [motivatingEvent, setMotivatingEvent] = useState<string>('');

  // Load existing data when component mounts
  useEffect(() => {
    const existingData = getStepData('eventChoice');
    if (existingData?.motivatingEvent) {
      setMotivatingEvent(existingData.motivatingEvent);
    }
  }, []);

  // Update event choice in context whenever it changes
  useEffect(() => {
    if (motivatingEvent) {
      const isEventDriven = motivatingEvent !== 'none';
      updateStepData('eventChoice', { 
        motivatingEvent, 
        isEventDriven 
      });
      console.log('Event choice updated in context:', { motivatingEvent, isEventDriven });
    }
  }, [motivatingEvent]);

  const handleEventSelect = (eventValue: string) => {
    setMotivatingEvent(eventValue);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Há algum evento específico?</Text>
        <Text style={styles.subtitle}>
          Isso nos ajuda a criar um plano com prazo definido para maximizar seus resultados.
        </Text>

        <View style={styles.eventContainer}>
          {EVENT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.eventButton,
                motivatingEvent === option.value && styles.eventButtonSelected
              ]}
              onPress={() => handleEventSelect(option.value)}
            >
              <Text
                style={[
                  styles.eventButtonText,
                  motivatingEvent === option.value && styles.eventButtonTextSelected
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
    paddingTop: spacing.xxxl + spacing.xl + spacing.xl + spacing.lg,
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
  eventContainer: {
    width: '100%',
    marginBottom: spacing.xxl,
  },
  eventButton: {
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
  eventButtonSelected: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  eventButtonText: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  eventButtonTextSelected: {
    color: colors.textInverse,
  },
}); 
