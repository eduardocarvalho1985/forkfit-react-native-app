import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const testAPI = async () => {
    try {
      const API_URL = 'https://forkfit.app/api';

      console.log('Testing connection to:', API_URL);

      const response = await fetch(`${API_URL}/food-database/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const categories = await response.json();

      Alert.alert(
        'Success!', 
        `Connected to ForkFit backend!\n\nFound ${categories.length} Brazilian food categories:\n\n${categories.slice(0, 3).join('\n')}`
      );

      console.log('All categories:', categories);

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
          <Text style={styles.buttonText}>Test Food Database API</Text>
        </TouchableOpacity>

        <View style={styles.info}>
          <Text style={styles.infoText}>
            Backend: forkfit.app
          </Text>
          <Text style={styles.infoText}>
            Expected: 13 Brazilian food categories
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
    marginBottom: 15,
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
    marginTop: 20,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
});