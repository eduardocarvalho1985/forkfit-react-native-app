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
    if (loading) {
      console.log('RootLayout: Still loading, waiting...');
      return;
    }

    const inAppGroup = segments[0] === '(app)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inAuthGroup = segments[0] === '(auth)';

    console.log('RootLayout: Navigation check', {
      loading,
      user: user ? user.uid : 'null',
      segments: segments,
      inAppGroup,
      inOnboardingGroup,
      inAuthGroup,
      currentPath: segments.join('/')
    });

    // Handle initial route and redirects
    if (user) {
      // User is authenticated
      if (!inAppGroup) {
        console.log('RootLayout: User authenticated, redirecting to main app');
        router.replace('/(app)/(tabs)/dashboard');
      }
    } else {
      // User is not authenticated
      // Allow access to auth screens and onboarding
      if (!inOnboardingGroup && !inAuthGroup && !inAppGroup) {
        console.log('RootLayout: User not authenticated, redirecting to onboarding');
        router.replace('/(onboarding)');
      }
    }
  }, [user, loading, segments]);

  // Remove the aggressive setTimeout redirect that was causing issues
  // React.useEffect(() => {
  //   if (!loading && !user) {
  //     console.log('RootLayout: User not authenticated, ensuring redirect to onboarding');
  //     // Force redirect to onboarding if not already there
  //     setTimeout(() => {
  //       if (!segments || segments[0] !== '(onboarding)') {
  //         console.log('RootLayout: Forcing redirect to onboarding');
  //         router.replace('/(onboarding)');
  //       }
  //     }, 100);
  //   }
  // }, [loading, user, segments]);

  // Handle user sign out - redirect to onboarding
  React.useEffect(() => {
    if (!loading && !user && segments[0] === '(app)') {
      console.log('RootLayout: User signed out, redirecting to onboarding');
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