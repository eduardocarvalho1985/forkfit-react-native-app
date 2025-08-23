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
    label: 'Casamento',
    description: 'Quero estar no meu melhor para o grande dia',
    emoji: '💒'
  },
  {
    value: 'vacation',
    label: 'Férias',
    description: 'Preparando-me para uma viagem especial',
    emoji: '✈️'
  },
  {
    value: 'reunion',
    label: 'Reunião de Família',
    description: 'Encontrando familiares após muito tempo',
    emoji: '👨‍👩‍👧‍👦'
  },
  {
    value: 'beach_season',
    label: 'Temporada de Praia',
    description: 'Quero me sentir confiante na praia',
    emoji: '🏖️'
  },
  {
    value: 'none',
    label: 'Nenhum evento específico',
    description: 'Só quero melhorar minha saúde e bem-estar',
    emoji: '🌟'
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
              <Text style={styles.eventEmoji}>{option.emoji}</Text>
              <View style={styles.eventTextContainer}>
                <Text
                  style={[
                    styles.eventLabel,
                    motivatingEvent === option.value && styles.eventLabelSelected
                  ]}
                >
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.eventDescription,
                    motivatingEvent === option.value && styles.eventDescriptionSelected
                  ]}
                >
                  {option.description}
                </Text>
              </View>
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
    paddingTop: spacing.xxxl + spacing.xl + spacing.xl,
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
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 80,
    flexDirection: 'row',
    gap: spacing.lg,
    ...shadows.sm,
  },
  eventButtonSelected: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  eventEmoji: {
    fontSize: typography['2xl'],
    marginRight: spacing.sm,
  },
  eventTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  eventLabel: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  eventLabelSelected: {
    color: colors.background,
  },
  eventDescription: {
    fontSize: typography.base,
    color: colors.textSecondary,
    lineHeight: typography.base * 1.4,
  },
  eventDescriptionSelected: {
    color: colors.backgroundSecondary,
  },
  disclaimer: {
    fontSize: typography.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: typography.sm * 1.4,
    marginTop: spacing.xl,
  },
}); 
