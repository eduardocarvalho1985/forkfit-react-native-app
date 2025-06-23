
// app/(tabs)/dashboard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const testAPI = async () => {
    try {
      // Your web app URL (replace with actual repl name)
      const API_URL = 'https://nutrisnapapp2025.replit.app/api';
      const response = await fetch(`${API_URL}/food-database/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const categories = await response.json();
      Alert.alert('Success!', `Connected! Found ${categories.length} Brazilian food categories`);
      console.log('Categories:', categories);
      
    } catch (error) {
      Alert.alert('Connection Failed', `Error: ${error.message}`);
      console.error('API test failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>ForkFit Mobile</Text>
        <Text style={styles.subtitle}>Brazilian Nutrition Tracking</Text>
        
        <TouchableOpacity style={styles.button} onPress={testAPI}>
          <Text style={styles.buttonText}>Test Backend Connection</Text>
        </TouchableOpacity>
        
        <View style={styles.info}>
          <Text style={styles.infoText}>
            This will test connection to your web app's API and verify access to the Brazilian food database.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    minWidth: 200,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  info: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    maxWidth: 300,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

/* 
FULL VERSION - COMMENTED OUT FOR FUTURE USE

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import APITest from '@/components/APITest';

export default function DashboardScreen() {
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const { user } = useAuth();

  const handleAddMeal = (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setSelectedMeal(mealType);
    setShowAddMealModal(true);
  };

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.email?.split('@')[0] || 'Usuário'}!</Text>
            <Text style={styles.date}>{currentDate}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Daily Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo do Dia</Text>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Calorias</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0g</Text>
              <Text style={styles.statLabel}>Proteína</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0g</Text>
              <Text style={styles.statLabel}>Carboidratos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0g</Text>
              <Text style={styles.statLabel}>Gordura</Text>
            </View>
          </View>
        </View>

        {/* Meals Section */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Refeições</Text>

          {/* Breakfast */}
          <TouchableOpacity 
            style={styles.mealCard}
            onPress={() => handleAddMeal('breakfast')}
          >
            <View style={styles.mealHeader}>
              <View style={styles.mealTitleContainer}>
                <Ionicons name="sunny-outline" size={20} color="#FF9500" />
                <Text style={styles.mealTitle}>Café da Manhã</Text>
              </View>
              <Ionicons name="add-circle-outline" size={24} color="#FF725E" />
            </View>
            <Text style={styles.mealSubtitle}>Adicionar alimentos</Text>
          </TouchableOpacity>

          {/* Lunch */}
          <TouchableOpacity 
            style={styles.mealCard}
            onPress={() => handleAddMeal('lunch')}
          >
            <View style={styles.mealHeader}>
              <View style={styles.mealTitleContainer}>
                <Ionicons name="partly-sunny-outline" size={20} color="#34C759" />
                <Text style={styles.mealTitle}>Almoço</Text>
              </View>
              <Ionicons name="add-circle-outline" size={24} color="#FF725E" />
            </View>
            <Text style={styles.mealSubtitle}>Adicionar alimentos</Text>
          </TouchableOpacity>

          {/* Dinner */}
          <TouchableOpacity 
            style={styles.mealCard}
            onPress={() => handleAddMeal('dinner')}
          >
            <View style={styles.mealHeader}>
              <View style={styles.mealTitleContainer}>
                <Ionicons name="moon-outline" size={20} color="#5856D6" />
                <Text style={styles.mealTitle}>Jantar</Text>
              </View>
              <Ionicons name="add-circle-outline" size={24} color="#FF725E" />
            </View>
            <Text style={styles.mealSubtitle}>Adicionar alimentos</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="camera-outline" size={24} color="#FF725E" />
              <Text style={styles.actionText}>Escanear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="search-outline" size={24} color="#FF725E" />
              <Text style={styles.actionText}>Buscar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="bookmark-outline" size={24} color="#FF725E" />
              <Text style={styles.actionText}>Favoritos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* API Test Section */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Teste de Conexão</Text>
          <APITest />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

FULL VERSION STYLES:
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#666',
  },
  notificationButton: {
    padding: 8,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF725E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  mealsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  mealCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  mealSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  quickActions: {
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    color: '#FF725E',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  testSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});
*/
