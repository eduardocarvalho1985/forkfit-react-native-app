import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const testAPI = async () => {
    try {
      Alert.alert('Testing...', 'Checking backend connection and CORS settings');
      
      // Test 1: Check if backend is running at all
      console.log('🔍 Testing backend availability...');
      
      // Test different possible URLs and methods
      const backendTests = [
        {
          name: 'Backend Root',
          url: 'https://nutrisnapapp2025.replit.app/',
          method: 'GET'
        },
        {
          name: 'Backend API',
          url: 'https://nutrisnapapp2025.replit.app/api',
          method: 'GET'
        },
        {
          name: 'Health Check',
          url: 'https://nutrisnapapp2025.replit.app/health',
          method: 'GET'
        },
        {
          name: 'Status Check',
          url: 'https://nutrisnapapp2025.replit.app/status',
          method: 'GET'
        }
      ];

      let anySuccess = false;
      let results = [];

      for (const test of backendTests) {
        try {
          console.log(`Testing ${test.name}: ${test.url}`);
          
          const response = await fetch(test.url, {
            method: test.method,
            headers: {
              'Content-Type': 'application/json',
            },
            // Add timeout
            signal: AbortSignal.timeout(5000)
          });
          
          const status = response.status;
          console.log(`${test.name} status: ${status}`);
          
          if (status >= 200 && status < 300) {
            anySuccess = true;
            try {
              const data = await response.text();
              results.push(`✅ ${test.name}: ${status} - ${data.substring(0, 50)}...`);
            } catch {
              results.push(`✅ ${test.name}: ${status} - Response OK`);
            }
          } else if (status === 404) {
            results.push(`⚠️ ${test.name}: 404 - Endpoint not found`);
          } else {
            results.push(`❌ ${test.name}: ${status} - Error`);
          }
          
        } catch (error) {
          const errorMsg = error.message || 'Unknown error';
          console.log(`${test.name} failed:`, errorMsg);
          
          if (errorMsg.includes('CORS')) {
            results.push(`🚫 ${test.name}: CORS blocked`);
          } else if (errorMsg.includes('timeout')) {
            results.push(`⏰ ${test.name}: Timeout`);
          } else {
            results.push(`❌ ${test.name}: ${errorMsg}`);
          }
        }
      }

      // Show results
      const resultText = results.join('\n');
      console.log('Test Results:', resultText);
      
      if (anySuccess) {
        Alert.alert('Backend Status', `Some endpoints working:\n\n${resultText}`);
      } else {
        Alert.alert('Backend Issues', `Backend connection problems:\n\n${resultText}\n\nPossible solutions:\n- Check if backend is running\n- Verify CORS settings\n- Confirm URL is correct`);
      }

    } catch (error) {
      console.error('Test failed:', error);
      Alert.alert('Test Failed', `Unexpected error: ${error.message}`);
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