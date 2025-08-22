import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useOnboarding } from '../OnboardingContext';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const TEXT = '#1F2937';

interface EventDateStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function EventDateStep({ onSetLoading }: EventDateStepProps) {
  const { updateStepData, onboardingData } = useOnboarding();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // Initialize with existing data
  useEffect(() => {
    try {
      if (onboardingData.eventDate) {
        const parsedDate = new Date(onboardingData.eventDate);
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
        } else {
          throw new Error('Invalid date from onboarding data');
        }
      } else {
        // Default to 3 months from now
        const defaultDate = new Date();
        defaultDate.setMonth(defaultDate.getMonth() + 3);
        if (!isNaN(defaultDate.getTime())) {
          setSelectedDate(defaultDate);
        }
      }
    } catch (error) {
      console.error('Error initializing date:', error);
      // Fallback to 3 months from now
      const fallbackDate = new Date();
      fallbackDate.setMonth(fallbackDate.getMonth() + 3);
      setSelectedDate(fallbackDate);
    }
  }, [onboardingData.eventDate]);

  // Auto-save when date changes
  useEffect(() => {
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
          weeklyPacing: weeklyPacing // Auto-calculate pacing for event-driven goals
        });
      } catch (error) {
        console.error('Error saving date:', error);
      }
    }
  }, [selectedDate, onboardingData.weight, onboardingData.targetWeight]);

  const showDatePickerModal = () => {
    // Simple date selection using Alert
    const today = new Date();
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
          try {
            const newDate = new Date();
            newDate.setMonth(newDate.getMonth() + option.months);
            if (!isNaN(newDate.getTime())) {
              setSelectedDate(newDate);
            }
          } catch (error) {
            console.error('Error setting date:', error);
          }
        }
      }))
    );
  };

  const formatDate = (date: Date) => {
    try {
      if (!date || isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Data inválida';
    }
  };

  const getDaysUntilEvent = () => {
    try {
      const today = new Date();
      const timeDiff = selectedDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return isNaN(daysDiff) ? 0 : daysDiff;
    } catch (error) {
      console.error('Error calculating days until event:', error);
      return 0;
    }
  };

  // Memoize the days calculation to prevent unnecessary recalculations
  const daysUntilEvent = useMemo(() => getDaysUntilEvent(), [selectedDate]);

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
    backgroundColor: OFF_WHITE,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  dateContainer: {
    width: '100%',
    marginBottom: 40,
    alignItems: 'center',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: CORAL,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    minWidth: 200,
  },
  dateButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CORAL,
    marginBottom: 8,
  },
  dateButtonSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  countdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 8,
  },
  countdownText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: CORAL,
    marginBottom: 8,
  },
  countdownSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },

  infoContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  infoText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
