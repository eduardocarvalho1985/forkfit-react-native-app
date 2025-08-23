import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

const EVENT_OPTIONS = [
  { 
    label: 'Casamento', 
    value: 'wedding' as const,
    emoji: '💒'
  },
  { 
    label: 'Férias', 
    value: 'vacation' as const,
    emoji: '🏖️'
  },
  { 
    label: 'Reunião', 
    value: 'reunion' as const,
    emoji: '👥'
  },
  { 
    label: 'Temporada de Praia', 
    value: 'beach_season' as const,
    emoji: '🏊‍♀️'
  },
  { 
    label: 'Nenhum evento específico', 
    value: 'none' as const,
    emoji: '🎯'
  },
];

interface EventChoiceStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function EventChoiceStep({ onSetLoading }: EventChoiceStepProps) {
  const { getStepData, updateStepData } = useOnboarding();
  const [motivatingEvent, setMotivatingEvent] = useState<'wedding' | 'vacation' | 'reunion' | 'beach_season' | 'none' | null>(getStepData('motivatingEvent') || null);

  // Load existing data when component mounts
  useEffect(() => {
    const existingEvent = getStepData('motivatingEvent');
    if (existingEvent) {
      setMotivatingEvent(existingEvent);
    }
  }, []);

  // Update event choice in context whenever it changes
  useEffect(() => {
    if (motivatingEvent) {
      const isEventDriven = motivatingEvent !== 'none';
      updateStepData('motivatingEvent', { 
        motivatingEvent, 
        isEventDriven 
      });
      console.log('Event choice updated in context:', { motivatingEvent, isEventDriven });
    }
  }, [motivatingEvent]);

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
              onPress={() => setMotivatingEvent(option.value)}
            >
              <Text style={styles.eventEmoji}>{option.emoji}</Text>
              <Text
                style={[
                  styles.eventLabel,
                  motivatingEvent === option.value && styles.eventLabelSelected
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
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
    paddingTop: spacing.xxxl + spacing.xl + spacing.md,
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
    minHeight: 70,
    flexDirection: 'row',
    gap: spacing.md,
    ...shadows.sm,
  },
  eventButtonSelected: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  eventEmoji: {
    fontSize: typography.xl,
  },
  eventLabel: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    flex: 1,
  },
  eventLabelSelected: {
    color: colors.textInverse,
  },
  disclaimer: {
    fontSize: typography.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: typography.sm * 1.4,
    marginTop: spacing.xl,
  },
});
