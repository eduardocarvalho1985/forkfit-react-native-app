
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.displayName || 'Usuário'}!</Text>
            <Text style={styles.subtitle}>Como estão seus objetivos hoje?</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Daily Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Resumo do Dia</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>1,847</Text>
              <Text style={styles.summaryLabel}>Calorias</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>89g</Text>
              <Text style={styles.summaryLabel}>Proteína</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>203g</Text>
              <Text style={styles.summaryLabel}>Carboidratos</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>67g</Text>
              <Text style={styles.summaryLabel}>Gordura</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="camera-outline" size={32} color="#FF6B6B" />
              <Text style={styles.actionText}>Escanear Alimento</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="add-circle-outline" size={32} color="#4ECDC4" />
              <Text style={styles.actionText}>Adicionar Refeição</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="water-outline" size={32} color="#45B7D1" />
              <Text style={styles.actionText}>Registrar Água</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="fitness-outline" size={32} color="#96CEB4" />
              <Text style={styles.actionText}>Log de Exercício</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Meals Today */}
        <View style={styles.mealsContainer}>
          <Text style={styles.sectionTitle}>Refeições de Hoje</Text>
          <View style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealTime}>Café da Manhã</Text>
              <Text style={styles.mealCalories}>420 cal</Text>
            </View>
            <Text style={styles.mealItems}>Aveia com banana, leite desnatado</Text>
          </View>
          
          <View style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealTime}>Almoço</Text>
              <Text style={styles.mealCalories}>650 cal</Text>
            </View>
            <Text style={styles.mealItems}>Arroz integral, feijão, frango grelhado, salada</Text>
          </View>

          <TouchableOpacity style={styles.addMealButton}>
            <Ionicons name="add" size={20} color="#FF6B6B" />
            <Text style={styles.addMealText}>Adicionar Refeição</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  notificationButton: {
    padding: 8,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  mealsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  mealCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  mealCalories: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  mealItems: {
    fontSize: 14,
    color: '#666',
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderStyle: 'dashed',
  },
  addMealText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 8,
  },
});
