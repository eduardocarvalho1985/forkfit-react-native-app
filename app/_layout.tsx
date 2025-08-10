// File: app/_layout.tsx

import React from 'react';
import { Stack, router } from 'expo-router';
import { View, ActivityIndicator, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ProgressProvider } from '../contexts/ProgressContext';
import { ErrorBoundary } from '../components/ErrorBoundary';

function RootLayoutContent() {
  // Temporarily disabled to isolate runtime error
  // const { user, loading } = useAuth();

  // Simplified version for debugging
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#FF725E" />
    </View>
  );

  // Original logic commented out
  /*
  React.useEffect(() => {
    try {
      console.log('RootLayout: useEffect triggered, loading:', loading, 'user:', user ? user.uid : 'null');
      if (loading) {
        console.log('RootLayout: Still loading, waiting...');
        return;
      }

      if (!user) {
        console.log('RootLayout: No user found, redirecting to login.');
        router.replace('/auth/login');
      } else {
        // Check if user has completed onboarding
        if (!user.onboardingCompleted) {
          console.log('RootLayout: User found but onboarding not completed, redirecting to onboarding.');
          router.replace('/onboarding');
        } else {
          console.log('RootLayout: User found and onboarding completed, redirecting to dashboard. User data:', {
            uid: user.uid,
            email: user.email,
            onboardingCompleted: user.onboardingCompleted,
            calories: user.calories,
            protein: user.protein,
            carbs: user.carbs,
            fat: user.fat
          });
          router.replace('/(tabs)/dashboard');
        }
      }
    } catch (error) {
      console.error('RootLayout: Error in navigation logic:', error);
      // Fallback to login if there's an error
      router.replace('/auth/login');
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
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
  */
}

export default function RootLayout() {
  React.useEffect(() => {
    // Ignore specific warnings that might cause issues
    LogBox.ignoreLogs([
      'Warning: Failed prop type',
      'Warning: AsyncStorage has been extracted',
      'Warning: ViewPropTypes will be removed',
    ]);
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Temporarily disabled to isolate runtime error */}
        {/* <BottomSheetModalProvider> */}
          {/* Temporarily disabled to isolate runtime error */}
          {/* <AuthProvider> */}
            {/* Temporarily disabled to isolate runtime error */}
            {/* <ProgressProvider> */}
              <RootLayoutContent />
            {/* </ProgressProvider> */}
          {/* </AuthProvider> */}
        {/* </BottomSheetModalProvider> */}
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}