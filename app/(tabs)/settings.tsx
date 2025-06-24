import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Configurações</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F6',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  userEmail: {
    fontSize: 16,
    color: '#1F2937',
  },
  signOutButton: {
    backgroundColor: '#FF725E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  },
  signOutText: {
    color: '#FFF8F6',
    fontSize: 16,
    fontWeight: '600',
  },
});