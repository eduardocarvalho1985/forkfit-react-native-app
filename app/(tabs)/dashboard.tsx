import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function Dashboard() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ForkFit Dashboard</Text>
        <Text style={styles.subtitle}>Acompanhe sua nutrição</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progresso Diário</Text>
        <View style={styles.progressContainer}>
          <Text>Calorias: 0 / 2000</Text>
          <Text>Proteína: 0g / 150g</Text>
          <Text>Carboidratos: 0g / 250g</Text>
          <Text>Gordura: 0g / 65g</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Refeições de Hoje</Text>
        <View style={styles.mealContainer}>
          <Text>Café da Manhã</Text>
          <Text>Almoço</Text>
          <Text>Lanche</Text>
          <Text>Jantar</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  progressContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
  mealContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
});