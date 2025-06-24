
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SyncTest } from '@/components/SyncTest';

export default function DashboardScreen() {
  const [currentDate] = useState(new Date());
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  const MacroCard = ({ 
    icon, 
    label, 
    value, 
    unit, 
    target, 
    color 
  }: {
    icon: string;
    label: string;
    value: string;
    unit: string;
    target: string;
    color: string;
  }) => (
    <View style={[styles.macroCard, { backgroundColor: color }]}>
      <View style={styles.macroIcon}>
        <Ionicons name={icon as any} size={16} color="#666" />
      </View>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{value}</Text>
      <Text style={styles.macroTarget}>de {target}</Text>
    </View>
  );

  const MealSection = ({ 
    title, 
    calories 
  }: { 
    title: string; 
    calories: string 
  }) => (
    <View style={styles.mealSection}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealTitle}>{title}</Text>
        <Text style={styles.mealCalories}>{calories}</Text>
      </View>
      <Text style={styles.noFood}>Nenhum alimento registrado</Text>
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={16} color="#666" />
        <Text style={styles.addButtonText}>Adicionar alimento</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.aiAnalysisButton}>
        <Ionicons name="camera" size={16} color="#FFF8F6" />
        <Text style={styles.aiAnalysisText}>Análise por IA</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>ForkFit</Text>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#FFF8F6" />
          </TouchableOpacity>
        </View>

        {/* Date Navigation */}
        <View style={styles.dateNavigation}>
          <TouchableOpacity>
            <Ionicons name="chevron-back" size={20} color="#666" />
          </TouchableOpacity>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Hoje</Text>
            <Text style={styles.dateValue}>{formatDate(currentDate)}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Daily Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Resumo Diário</Text>
          
          <View style={styles.calorieCircle}>
            <Ionicons name="flame-outline" size={24} color="#FF725E" />
            <Text style={styles.calorieCount}>0</Text>
            <Text style={styles.calorieTarget}>/ 1673 kcal</Text>
          </View>
          
          <Text style={styles.remaining}>Restante: 1673 kcal</Text>

          {/* Macro Cards */}
          <View style={styles.macroContainer}>
            <MacroCard
              icon="water"
              label="PROTEÍNA"
              value="0g"
              unit="g"
              target="142g"
              color="#E3F2FD"
            />
            <MacroCard
              icon="nutrition"
              label="CARBS"
              value="0g"
              unit="g"
              target="225g"
              color="#FFF8E1"
            />
            <MacroCard
              icon="water-outline"
              label="GORDURA"
              value="0g"
              unit="g"
              target="48g"
              color="#FCE4EC"
            />
          </View>
        </View>

        {/* Sync Test Component (for development) */}
        <SyncTest />

        {/* Meals */}
        <MealSection title="Café da Manhã" calories="0 kcal" />
        <MealSection title="Lanche da Manhã" calories="0 kcal" />
        <MealSection title="Almoço" calories="0 kcal" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF725E',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF8F6',
  },
  dateNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF8F6',
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 12,
    color: '#666',
  },
  summarySection: {
    backgroundColor: '#FFF8F6',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  calorieCircle: {
    alignItems: 'center',
    marginBottom: 10,
  },
  calorieCount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 5,
  },
  calorieTarget: {
    fontSize: 14,
    color: '#666',
  },
  remaining: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  macroCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  macroIcon: {
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  macroTarget: {
    fontSize: 10,
    color: '#666',
  },
  mealSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  mealCalories: {
    fontSize: 14,
    color: '#666',
  },
  noFood: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  aiAnalysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF725E',
    paddingVertical: 12,
    borderRadius: 8,
  },
  aiAnalysisText: {
    fontSize: 14,
    color: '#FFF8F6',
    fontWeight: '600',
    marginLeft: 6,
  },
});
