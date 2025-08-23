import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

interface EventDateStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function EventDateStep({ onSetLoading }: EventDateStepProps) {
  const { updateStepData, onboardingData } = useOnboarding();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize with existing data only once
  useEffect(() => {
    if (isInitialized) return;
    
    try {
      if (onboardingData.eventDate) {
        const parsedDate = new Date(onboardingData.eventDate);
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
        }
      } else {
        // Default to 3 months from now
        const defaultDate = new Date();
        defaultDate.setMonth(defaultDate.getMonth() + 3);
        setSelectedDate(defaultDate);
      }
    } catch (error) {
      console.error('Error initializing date:', error);
      // Fallback to 3 months from now
      const fallbackDate = new Date();
      fallbackDate.setMonth(fallbackDate.getMonth() + 3);
      setSelectedDate(fallbackDate);
    } finally {
      setIsInitialized(true);
    }
  }, [onboardingData.eventDate, isInitialized]);

  // Auto-save when date changes (only after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      try {
        const dateString = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Calculate weekly pacing based on event date and weight difference
        let weeklyPacing = 0.5; // default fallback
        if (onboardingData.weight && onboardingData.targetWeight) {
          const currentWeight = onboardingData.weight;
          const targetWeight = onboardingData.targetWeight;
          const weightDiff = Math.abs(targetWeight - currentWeight);
          
          // Calculate days until event
          const today = new Date();
          const eventDate = new Date(dateString);
          const daysUntilEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
          
          if (daysUntilEvent > 0) {
            const weeksUntilEvent = Math.ceil(daysUntilEvent / 7);
            weeklyPacing = Math.max(0.25, Math.min(1.0, weightDiff / weeksUntilEvent));
          }
        }
        
        updateStepData('eventDate', { 
          eventDate: dateString,
          weeklyPacing: weeklyPacing
        });
      } catch (error) {
        console.error('Error saving date:', error);
      }
    }
  }, [selectedDate, onboardingData.weight, onboardingData.targetWeight, isInitialized]);

  const showDatePickerModal = () => {
    const options = [
      { label: '1 mês', months: 1 },
      { label: '2 meses', months: 2 },
      { label: '3 meses', months: 3 },
      { label: '6 meses', months: 6 },
      { label: '1 ano', months: 12 }
    ];

    Alert.alert(
      'Selecione o prazo',
      'Escolha quando é o seu evento:',
      options.map(option => ({
        text: option.label,
        onPress: () => {
          const newDate = new Date();
          newDate.setMonth(newDate.getMonth() + option.months);
          setSelectedDate(newDate);
        }
      }))
    );
  };

  const formatDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return 'Data inválida';
    }
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysUntilEvent = () => {
    const today = new Date();
    const timeDiff = selectedDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return isNaN(daysDiff) ? 0 : daysDiff;
  };

  // Memoize the days calculation to prevent unnecessary recalculations
  const daysUntilEvent = useMemo(() => getDaysUntilEvent(), [selectedDate]);

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Carregando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Quando é o seu evento?</Text>
        <Text style={styles.subtitle}>
          Selecione a data para podermos calcular um plano personalizado
        </Text>

        <View style={styles.dateContainer}>
          <TouchableOpacity style={styles.dateButton} onPress={showDatePickerModal}>
            <Text style={styles.dateButtonText}>{formatDate(selectedDate)}</Text>
            <Text style={styles.dateButtonSubtext}>Toque para alterar</Text>
          </TouchableOpacity>
        </View>

        {daysUntilEvent > 0 && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownTitle}>Tempo restante:</Text>
            <Text style={styles.countdownText}>
              {daysUntilEvent} {daysUntilEvent === 1 ? 'dia' : 'dias'}
            </Text>
            <Text style={styles.countdownSubtext}>
              Tempo suficiente para resultados visíveis!
            </Text>
          </View>
        )}

        {daysUntilEvent <= 0 && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownTitle}>Data no passado</Text>
            <Text style={styles.countdownText}>
              Considere escolher uma data futura
            </Text>
          </View>
        )}

        {/* Navigation is handled by the parent component's footer */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Use o botão "Continuar" na parte inferior da tela para prosseguir
          </Text>
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
    justifyContent: 'center',
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
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  dateContainer: {
    width: '100%',
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  dateButton: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    minWidth: 200,
    ...shadows.md,
  },
  dateButtonText: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  dateButtonSubtext: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  countdownTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  countdownText: {
    fontSize: typography['3xl'],
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  countdownSubtext: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sm * 1.4,
  },
  infoContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  infoText: {
    color: colors.textTertiary,
    fontSize: typography.sm,
    textAlign: 'center',
    lineHeight: typography.sm * 1.4,
  },
});
