// File: app/_layout.tsx

import React from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as Notifications from 'expo-notifications';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { OnboardingProvider } from './(onboarding)/OnboardingContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://84012556813f5be6d6393a34a9d1fe78@o4509826818048000.ingest.us.sentry.io/4509859054616576',
  sendDefaultPii: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
});

function RootLayoutContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  React.useEffect(() => {
    if (loading) return; // Wait until we know if the user is logged in or not

    const inAppGroup = segments[0] === '(app)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inAuthGroup = segments[0] === '(auth)';

    console.log('RootLayout: Navigation check', {
      loading,
      user: user ? user.uid : 'null',
      segments: segments,
      inAppGroup,
      inOnboardingGroup,
      inAuthGroup
    });

    if (user && !inAppGroup) {
      // User is authenticated, but not in the main app stack.
      // Redirect them to the main app dashboard.
      console.log('RootLayout: User authenticated, redirecting to main app');
      router.replace('/(app)/(tabs)/dashboard');
    } else if (!user && !inOnboardingGroup && !inAuthGroup) {
      // User is not authenticated and not in onboarding or auth.
      // Send them to the start of the onboarding flow.
      console.log('RootLayout: User not authenticated, redirecting to onboarding');
      router.replace('/(onboarding)');
    }
  }, [user, loading, segments]);

  // Handle notification responses for navigation
  React.useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { screen } = response.notification.request.content.data;
      
      if (screen && user?.onboardingCompleted) {
        console.log('Notification tapped, navigating to:', screen);
        
        switch (screen) {
          case 'dashboard':
            router.push('/(app)/(tabs)/dashboard');
            break;
          case 'progress':
            router.push('/(app)/(tabs)/progress');
            break;
          default:
            router.push('/(app)/(tabs)/dashboard');
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

  return <Slot />; // This renders the currently active route group
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
              <OnboardingProvider>
                <RootLayoutContent />
              </OnboardingProvider>
            </ProgressProvider>
          </AuthProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
});