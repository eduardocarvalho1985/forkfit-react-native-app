import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useOnboarding } from '../OnboardingContext';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const BORDER = '#FFA28F';
const TEXT = '#1F2937';

const ACTIVITY_OPTIONS = [
  { 
    label: 'Sedentário', 
    value: 'sedentary' as const,
    description: 'Trabalho de escritório, pouco exercício',
    icon: '🪑'
  },
  { 
    label: 'Pouco Ativo', 
    value: 'light' as const,
    description: 'Exercício leve 1-3 dias/semana',
    icon: '🚶'
  },
  { 
    label: 'Ativo', 
    value: 'moderate' as const,
    description: 'Exercício moderado 3-5 dias/semana',
    icon: '🏃'
  },
  { 
    label: 'Muito Ativo', 
    value: 'very_active' as const,
    description: 'Exercício intenso 6-7 dias/semana',
    icon: '💪'
  },
];

interface ActivityStepProps {
  onNext: () => void;
}

export default function ActivityStep({ onNext }: ActivityStepProps) {
  const { getStepData, updateStepData } = useOnboarding();
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'very_active' | null>(getStepData('activityLevel') || null);
  const [loading, setLoading] = useState(false);

  // Load existing data when component mounts
  useEffect(() => {
    const existingActivity = getStepData('activityLevel');
    if (existingActivity) {
      setActivityLevel(existingActivity);
    }
  }, []);

  const handleNext = async () => {
    if (!activityLevel) {
      Alert.alert('Erro', 'Por favor, selecione seu nível de atividade para continuar.');
      return;
    }

    setLoading(true);
    try {
      // Update context with activity data
      updateStepData('activity', { activityLevel });
      console.log('Activity step completed, moving to next step');
      
      // Call the onNext callback to move to next step
      onNext();
    } catch (error) {
      console.error('Error in activity step:', error);
      Alert.alert('Erro', 'Não foi possível salvar seu nível de atividade. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Qual o seu nível de atividade?</Text>
        <Text style={styles.subtitle}>
          Isso nos ajuda a calcular suas necessidades calóricas diárias.
        </Text>

        <View style={styles.activitiesContainer}>
          {ACTIVITY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.activityButton,
                activityLevel === option.value && styles.activityButtonSelected
              ]}
              onPress={() => setActivityLevel(option.value)}
            >
              <Text style={styles.activityIcon}>{option.icon}</Text>
              <Text
                style={[
                  styles.activityLabel,
                  activityLevel === option.value && styles.activityLabelSelected
                ]}
              >
                {option.label}
              </Text>
              <Text
                style={[
                  styles.activityDescription,
                  activityLevel === option.value && styles.activityDescriptionSelected
                ]}
              >
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, (!activityLevel || loading) && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!activityLevel || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Salvando...' : 'Continuar'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Você poderá alterar essas informações no seu perfil a qualquer momento.
        </Text>
      </View>
    </ScrollView>
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
    paddingBottom: 40,
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
  },
  activitiesContainer: {
    marginBottom: 32,
  },
  activityButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: BORDER,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityButtonSelected: {
    backgroundColor: CORAL,
    borderColor: CORAL,
    shadowColor: CORAL,
    shadowOpacity: 0.3,
  },
  activityIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  activityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT,
    marginBottom: 4,
  },
  activityLabelSelected: {
    color: '#fff',
  },
  activityDescription: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  activityDescriptionSelected: {
    color: '#fff',
    opacity: 0.9,
  },
  button: {
    backgroundColor: CORAL,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  note: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 