
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { api } from '../services/api';

export function APITest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string>('');

  const testConnection = async () => {
    setTesting(true);
    setResult('Testing connection...');
    
    try {
      console.log('Starting API test...');
      const categories = await api.testConnection();
      
      const resultText = `✅ Success! Found ${categories.length} food categories:\n${categories.slice(0, 3).join(', ')}...`;
      setResult(resultText);
      console.log('API test successful:', categories);
      
      Alert.alert('Success!', `Connected to backend! Found ${categories.length} Brazilian food categories.`);
      
    } catch (error: any) {
      const errorText = `❌ Connection failed: ${error.message}`;
      setResult(errorText);
      console.error('API test failed:', error);
      
      Alert.alert('Connection Failed', `Could not connect to backend: ${error.message}`);
    }
    
    setTesting(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, testing && styles.buttonDisabled]} 
        onPress={testConnection}
        disabled={testing}
      >
        <Text style={styles.buttonText}>
          {testing ? 'Testing API...' : 'Test Backend Connection'}
        </Text>
      </TouchableOpacity>
      
      {result ? (
        <View style={styles.resultContainer}>
          <Text style={styles.result}>{result}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FF725E',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    minWidth: 200,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: '#FFF8F6',
    padding: 15,
    borderRadius: 8,
    maxWidth: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#FF725E',
  },
  result: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: '#1F2937',
  },
});
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
