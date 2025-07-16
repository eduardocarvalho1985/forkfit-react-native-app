// File: app/_layout.tsx

import React from 'react';
import { Stack, router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

function RootLayoutContent() {
  const { user, loading } = useAuth();

  React.useEffect(() => {
    console.log('RootLayout: useEffect triggered, loading:', loading, 'user:', user ? user.uid : 'null');
    if (loading) {
      console.log('RootLayout: Still loading, waiting...');
      return;
    }

    if (!user) {
      console.log('RootLayout: No user found, redirecting to login.');
      router.replace('/auth/login');
    } else {
      console.log('RootLayout: User found, redirecting to dashboard. User data:', {
        uid: user.uid,
        email: user.email,
        calories: user.calories,
        protein: user.protein,
        carbs: user.carbs,
        fat: user.fat
      });
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