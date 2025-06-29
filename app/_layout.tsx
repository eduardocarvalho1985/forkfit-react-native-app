// File: app/_layout.tsx

import React from 'react';
import { Stack, router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

function RootLayoutContent() {
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (loading) return;

    if (!user) {
      console.log('No user found, redirecting to login.');
      router.replace('/auth/login');
    } else {
      console.log('User found, redirecting to dashboard.');
      router.replace('/(tabs)/dashboard');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}