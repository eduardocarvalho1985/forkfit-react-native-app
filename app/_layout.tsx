// File: app/_layout.tsx

import React, { useState, useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Import your configured auth
import { View, ActivityIndicator } from 'react-native';

// Custom hook to manage auth state
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed. User:', currentUser ? currentUser.uid : null);
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, isLoading };
}

// This MUST be the default export
export default function RootLayout() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      console.log('No user found, redirecting to login.');
      router.replace('/auth/login');
    } else {
      console.log('User found, redirecting to dashboard.');
      router.replace('/(tabs)/dashboard');
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // The router will not render anything until the redirection logic is complete
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}