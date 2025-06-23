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