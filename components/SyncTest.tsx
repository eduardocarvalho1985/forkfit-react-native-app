
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

export function SyncTest() {
  const { user } = useAuth();

  const testConnection = async () => {
    try {
      console.log('Testing backend connection...');
      const categories = await api.getFoodCategories();
      console.log('Connection successful! Categories:', categories);
      Alert.alert('Success', `Backend connected!\nFound ${categories.length} food categories`);
    } catch (error: any) {
      console.error('Connection failed:', error);
      Alert.alert('Connection Error', `Backend connection failed: ${error.message}`);
    }
  };

  const testSync = async () => {
    if (!user) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    try {
      console.log('Testing sync for user:', user.uid);
      
      const result = await api.syncUser({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName,
        photoURL: user.photoURL
      });
      
      console.log('Sync successful:', result);
      Alert.alert('Success', `User synchronized successfully!\nBackend ID: ${result.id}`);
    } catch (error: any) {
      console.error('Sync failed:', error);
      Alert.alert('Error', `Sync failed: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Sync Test</Text>
      <Text style={styles.subtitle}>
        Current user: {user?.email || 'Not logged in'}
      </Text>
      <TouchableOpacity style={styles.button} onPress={testConnection}>
        <Text style={styles.buttonText}>Test Backend Connection</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={testSync}>
        <Text style={styles.buttonText}>Test User Sync</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#FF725E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
