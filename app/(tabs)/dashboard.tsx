import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const testAPI = async () => {
    try {
      // Test different endpoints to find what's available
      const BASE_URL = 'https://nutrisnapapp2025.replit.app';

      // First, test if the backend is responding at all
      let response = await fetch(`${BASE_URL}/`);
      console.log('Root endpoint status:', response.status);

      if (response.ok) {
        const rootData = await response.text();
        console.log('Root response:', rootData.substring(0, 200));
      }

      // Test if /api exists
      response = await fetch(`${BASE_URL}/api`);
      console.log('API endpoint status:', response.status);

      if (response.ok) {
        const apiData = await response.text();
        console.log('API response:', apiData.substring(0, 200));
      }

      // Try alternative endpoint paths
      const testPaths = [
        '/api/categories',
        '/categories', 
        '/food-categories',
        '/api/food/categories',
        '/api/foods/categories'
      ];

      for (const path of testPaths) {
        try {
          response = await fetch(`${BASE_URL}${path}`);
          console.log(`Testing ${path}: ${response.status}`);

          if (response.ok) {
            const data = await response.json();
            Alert.alert('Success!', `Found endpoint: ${path}\nResponse: ${JSON.stringify(data).substring(0, 100)}...`);
            console.log(`Success at ${path}:`, data);
            return;
          }
        } catch (err) {
          console.log(`Error testing ${path}:`, err.message);
        }
      }

      Alert.alert('Backend Found', 'Backend is running but food database endpoints not found. Check backend implementation.');

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