import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOnboarding } from '../OnboardingContext';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const TEXT = '#1F2937';

interface MotivationStepProps {
  onSetLoading: (loading: boolean) => void;
}

const MOTIVATING_EVENTS = [
  { id: 'wedding', label: 'Casamento', description: 'Quero estar no meu melhor para o grande dia' },
  { id: 'vacation', label: 'Férias', description: 'Preparando-me para uma viagem especial' },
  { id: 'reunion', label: 'Reunião de Família', description: 'Encontrando familiares após muito tempo' },
  { id: 'beach_season', label: 'Temporada de Praia', description: 'Quero me sentir confiante na praia' },
  { id: 'none', label: 'Nenhum evento especial', description: 'Só quero melhorar minha saúde e bem-estar' }
];

export default function MotivationStep({ onSetLoading }: MotivationStepProps) {
  const { updateStepData, onboardingData } = useOnboarding();
  const [selectedEvent, setSelectedEvent] = useState<string>('');

  // Initialize with existing data
  useEffect(() => {
    if (onboardingData.motivatingEvent) {
      setSelectedEvent(onboardingData.motivatingEvent);
    }
  }, [onboardingData.motivatingEvent]);

  // Auto-save when selection changes
  useEffect(() => {
    if (selectedEvent) {
      updateStepData('motivation', { 
        motivatingEvent: selectedEvent,
        isEventDriven: selectedEvent !== 'none'
      });
    }
  }, [selectedEvent]);

  const handleEventSelect = (eventId: string) => {
    setSelectedEvent(eventId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Você tem algum evento especial em mente?</Text>
        <Text style={styles.subtitle}>
          Isso nos ajudará a personalizar sua jornada e definir prazos realistas
        </Text>
        
        <View style={styles.eventsContainer}>
          {MOTIVATING_EVENTS.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={[
                styles.eventButton,
                selectedEvent === event.id && styles.eventButtonSelected
              ]}
              onPress={() => handleEventSelect(event.id)}
            >
              <Text style={[
                styles.eventTitle,
                selectedEvent === event.id && styles.eventTitleSelected
              ]}>
                {event.label}
              </Text>
              <Text style={[
                styles.eventDescription,
                selectedEvent === event.id && styles.eventDescriptionSelected
              ]}>
                {event.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
  eventsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 30,
  },
  eventButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  eventButtonSelected: {
    borderColor: CORAL,
    backgroundColor: CORAL,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 8,
    textAlign: 'center',
  },
  eventTitleSelected: {
    color: '#fff',
  },
  eventDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  eventDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
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
