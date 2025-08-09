import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useOnboarding } from '../OnboardingContext';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const BORDER = '#FFA28F';
const TEXT = '#1F2937';

interface PlanStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function PlanStep({ onSetLoading }: PlanStepProps) {
  const { calculatePlan, updateStepData } = useOnboarding();
  const [plan, setPlan] = useState<{ calories: number; protein: number; carbs: number; fat: number } | null>(null);

  // Calculate plan when component mounts
  useEffect(() => {
    const calculatedPlan = calculatePlan();
    if (calculatedPlan) {
      setPlan(calculatedPlan);
      // Save the calculated plan to context
      updateStepData('plan', calculatedPlan);
    }
  }, []);



  if (!plan) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Calculando seu plano...</Text>
          <Text style={styles.subtitle}>
            Estamos criando seu plano personalizado.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.celebrationContainer}>
          <Text style={styles.celebrationIcon}>🎉</Text>
          <Text style={styles.title}>Seu plano personalizado está pronto!</Text>
          <Text style={styles.subtitle}>
            Baseado nas suas informações, criamos um plano perfeito para você.
          </Text>
        </View>

        <View style={styles.planContainer}>
          <View style={styles.caloriesCard}>
            <Text style={styles.caloriesLabel}>Meta Diária de Calorias</Text>
            <Text style={styles.caloriesValue}>{plan.calories}</Text>
            <Text style={styles.caloriesUnit}>calorias</Text>
          </View>

          <View style={styles.macrosContainer}>
            <Text style={styles.macrosTitle}>Distribuição de Macronutrientes</Text>
            
            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Proteína</Text>
                <Text style={styles.macroValue}>{plan.protein}g</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Carboidratos</Text>
                <Text style={styles.macroValue}>{plan.carbs}g</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Gorduras</Text>
                <Text style={styles.macroValue}>{plan.fat}g</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Este é o seu ponto de partida. Você pode ajustar suas metas a qualquer momento nos Ajustes.
          </Text>
        </View>

        <Text style={styles.note}>
          Seu plano será salvo automaticamente e estará disponível no dashboard.
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
    paddingBottom: 120, // Extra padding for fixed footer
  },
  celebrationContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  celebrationIcon: {
    fontSize: 48,
    marginBottom: 16,
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
  },
  planContainer: {
    marginBottom: 32,
  },
  caloriesCard: {
    backgroundColor: CORAL,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: CORAL,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  caloriesLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
  },
  caloriesValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  caloriesUnit: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  macrosContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  macrosTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 20,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  macroValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT,
  },
  infoContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },

  note: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 