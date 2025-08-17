// File: app/_layout.tsx

import React from 'react';
import { Stack, router } from 'expo-router';
import { View, ActivityIndicator, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as Notifications from 'expo-notifications';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ProgressProvider } from '../contexts/ProgressContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://84012556813f5be6d6393a34a9d1fe78@o4509826818048000.ingest.us.sentry.io/4509859054616576',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

function RootLayoutContent() {
  const { user, loading } = useAuth();

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

  // Handle notification responses for navigation
  React.useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { screen } = response.notification.request.content.data;
      
      if (screen && user?.onboardingCompleted) {
        console.log('Notification tapped, navigating to:', screen);
        
        switch (screen) {
          case 'dashboard':
            router.push('/(tabs)/dashboard');
            break;
          case 'progress':
            router.push('/(tabs)/progress');
            break;
          default:
            router.push('/(tabs)/dashboard');
        }
      }
    });

    // Handle notifications received while app is in foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification.request.content.title);
    });

    return () => {
      subscription.remove();
      foregroundSubscription.remove();
    };
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF725E" />
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
}

export default Sentry.wrap(function RootLayout() {
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
        <BottomSheetModalProvider>
          <AuthProvider>
            <ProgressProvider>
              <RootLayoutContent />
            </ProgressProvider>
          </AuthProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
});