import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AddMealModal from '@/components/AddMealModal';
import { APITest } from '../../components/APITest';

export default function DashboardScreen() {
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');

  const handleAddMeal = (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setSelectedMeal(mealType);
    setShowAddMealModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>ForkFit</Text>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Date Navigation */}
        <View style={styles.dateContainer}>
          <TouchableOpacity>
            <Ionicons name="chevron-back" size={24} color="#666" />
          </TouchableOpacity>
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>Hoje</Text>
            <Text style={styles.dateValue}>23 jun</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Daily Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Resumo Diário</Text>

          <View style={styles.caloriesContainer}>
            <View style={styles.caloriesCircle}>
              <Ionicons name="flame" size={24} color="#FF6B6B" />
              <Text style={styles.caloriesNumber}>0</Text>
            </View>
            <Text style={styles.caloriesTotal}>/ 1673 kcal</Text>
          </View>

          <Text style={styles.remainingCalories}>Restante: 1673 kcal</Text>

          {/* Macros */}
          <View style={styles.macrosContainer}>
            <View style={[styles.macroCard, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="water" size={20} color="#2196F3" />
              <Text style={styles.macroLabel}>PROTEÍNA</Text>
              <Text style={styles.macroValue}>0g</Text>
              <Text style={styles.macroTarget}>de 142g</Text>
            </View>

            <View style={[styles.macroCard, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="nutrition" size={20} color="#FF9800" />
              <Text style={styles.macroLabel}>CARBS</Text>
              <Text style={styles.macroValue}>0g</Text>
              <Text style={styles.macroTarget}>de 225g</Text>
            </View>

            <View style={[styles.macroCard, { backgroundColor: '#FCE4EC' }]}>
              <Ionicons name="leaf" size={20} color="#E91E63" />
              <Text style={styles.macroLabel}>GORDURA</Text>
              <Text style={styles.macroValue}>0g</Text>
              <Text style={styles.macroTarget}>de 48g</Text>
            </View>
          </View>
        </View>

        {/* Meals */}
        <View style={styles.mealsContainer}>
          <Text style={styles.mealsTitle}>Refeições de Hoje</Text>

          {/* Breakfast */}
          <View style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealName}>Café da Manhã</Text>
              <Text style={styles.mealCalories}>0 kcal</Text>
            </View>
            <Text style={styles.noMealText}>Nenhum alimento registrado</Text>
            <TouchableOpacity
              style={styles.addMealButton}
              onPress={() => handleAddMeal('breakfast')}
            >
              <Ionicons name="add" size={16} color="#666" />
              <Text style={styles.addMealText}>Adicionar alimento</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.aiAnalysisButton}>
              <Ionicons name="sparkles" size={16} color="#FFF" />
              <Text style={styles.aiAnalysisText}>Análise por IA</Text>
            </TouchableOpacity>
          </View>

          {/* Lunch */}
          <View style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealName}>Lanche da Manhã</Text>
              <Text style={styles.mealCalories}>0 kcal</Text>
            </View>
            <Text style={styles.noMealText}>Nenhum alimento registrado</Text>
            <TouchableOpacity
              style={styles.addMealButton}
              onPress={() => handleAddMeal('lunch')}
            >
              <Ionicons name="add" size={16} color="#666" />
              <Text style={styles.addMealText}>Adicionar alimento</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.aiAnalysisButton}>
              <Ionicons name="sparkles" size={16} color="#FFF" />
              <Text style={styles.aiAnalysisText}>Análise por IA</Text>
            </TouchableOpacity>
          </View>

          {/* Dinner */}
          <View style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealName}>Almoço</Text>
              <Text style={styles.mealCalories}>0 kcal</Text>
            </View>
            <Text style={styles.noMealText}>Nenhum alimento registrado</Text>
            <TouchableOpacity
              style={styles.addMealButton}
              onPress={() => handleAddMeal('dinner')}
            >
              <Ionicons name="add" size={16} color="#666" />
              <Text style={styles.addMealText}>Adicionar alimento</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.aiAnalysisButton}>
              <Ionicons name="sparkles" size={16} color="#FFF" />
              <Text style={styles.aiAnalysisText}>Análise por IA</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.addButton}>
          <Text style={styles.addButtonText}>Adicionar alimento</Text>
        </View>

        {/* API Test Section */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Backend Connection Test</Text>
          <APITest />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  appName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
  },
  dateInfo: {
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dateValue: {
    fontSize: 14,
    color: '#666',
  },
  summaryContainer: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  caloriesContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  caloriesCircle: {
    alignItems: 'center',
    marginBottom: 8,
  },
  caloriesNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  caloriesTotal: {
    fontSize: 16,
    color: '#666',
  },
  remainingCalories: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  macroCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  macroTarget: {
    fontSize: 10,
    color: '#666',
  },
  mealsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  mealsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  mealCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  mealCalories: {
    fontSize: 14,
    color: '#666',
  },
  noMealText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginVertical: 12,
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  addMealText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  aiAnalysisButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAnalysisText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  addButtonText: {
    color: '#FF725E',
    fontSize: 16,
    fontWeight: '600',
  },
  testSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#FFF8F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFA28F',
  },
});