import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { api } from '../services/api';

export const APITest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testConnection = async () => {
    setIsLoading(true);
    setResult('');

    try {
      console.log('Testing backend connection...');
      const categories = await api.getFoodCategories();

      const successMessage = `✅ Success! Found ${categories.length} food categories:\n${categories.slice(0, 3).join(', ')}...`;
      setResult(successMessage);
      console.log('API connected successfully:', categories);

      Alert.alert('Connection Success!', successMessage);
    } catch (error) {
      const errorMessage = `❌ Failed: ${error}`;
      setResult(errorMessage);
      console.error('API connection failed:', error);

      Alert.alert('Connection Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={testConnection}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test Backend Connection'}
        </Text>
      </TouchableOpacity>

      {result ? (
        <Text style={styles.result}>{result}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FF725E',
    padding: 15,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  result: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    fontSize: 12,
    textAlign: 'center',
  },
});