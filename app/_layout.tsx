// File: app/_layout.tsx

import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator, LogBox, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as Notifications from 'expo-notifications';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import Constants from 'expo-constants';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
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

  // ✅ RevenueCat initialization following best practices
  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
        // Set log level first
        Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

        // Get API key from config
        const apiKey = Constants.expoConfig?.extra?.revenueCatIosApiKey;
        
        if (!apiKey) {
          console.log('⚠️ RevenueCat iOS API key not found - skipping initialization');
          console.log('📝 RevenueCat features will be disabled. To test subscriptions, use: eas build --profile development');
          return;
        }

        // Platform-specific initialization (iOS only for now)
        if (Platform.OS === 'ios') {
          Purchases.configure({
            apiKey: apiKey,
            appUserID: user?.uid, // Optional: identify user if available
          });
          
          console.log('✅ RevenueCat initialized successfully for iOS');
          console.log(`🔑 RevenueCat API Key: Present`);
          console.log(`🏗️ RevenueCat Environment: ${Constants.expoConfig?.extra?.BUILD_PROFILE === 'production' ? 'PRODUCTION' : 'SANDBOX'}`);
          
          // ✅ Get customer info immediately after initialization to verify it's working
          try {
            const customerInfo = await Purchases.getCustomerInfo();
            console.log('📊 Customer Info (immediate check):', {
              originalAppUserId: customerInfo.originalAppUserId,
              activeSubscriptions: customerInfo.activeSubscriptions,
              allPurchasedProductIdentifiers: customerInfo.allPurchasedProductIdentifiers,
              entitlementsActive: Object.keys(customerInfo.entitlements.active),
              entitlementsAll: Object.keys(customerInfo.entitlements.all),
              latestExpirationDate: customerInfo.latestExpirationDate,
              firstSeen: customerInfo.firstSeen
            });
          } catch (infoError) {
            console.log('ℹ️ Could not fetch customer info immediately after initialization:', infoError);
          }

          // ✅ Get offerings immediately after initialization to verify products are available
          try {
            const offerings = await Purchases.getOfferings();
            if (
              offerings.current !== null &&
              offerings.current.availablePackages.length !== 0
            ) {
              console.log("📢 offerings", JSON.stringify(offerings, null, 2));
            } else {
              console.log('⚠️ No current offerings or packages available');
              console.log('📋 Available offerings:', Object.keys(offerings.all));
            }
          } catch (offeringsError) {
            console.log('ℹ️ Could not fetch offerings immediately after initialization:', offeringsError);
          }
        }
      } catch (error) {
        console.error('❌ RevenueCat initialization failed:', error);
      }
    };

    // Initialize RevenueCat when component mounts
    initializeRevenueCat();
  }, []); // Empty dependency array - initialize once

  // ✅ ADD: Global RevenueCat error handler
  React.useEffect(() => {
    const handleRevenueCatError = (error: any) => {
      const errorMessage = error?.message || error?.toString() || 'Unknown RevenueCat error';
      
      // Handle specific RevenueCat errors gracefully
      if (errorMessage.includes('flushing data') || errorMessage.includes('timeout')) {
        console.log('🔄 Global RevenueCat flushing/timeout error - handled gracefully');
        return; // Don't show this error to users
      }
      
      if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        console.log('🌐 Global RevenueCat network error - handled gracefully');
        return; // Don't show this error to users
      }
      
      // For other RevenueCat errors, log them but don't show to users
      console.log('⚠️ Global RevenueCat error handled gracefully:', errorMessage);
    };

    // Set up global error handler for RevenueCat
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('[RevenueCat]')) {
        handleRevenueCatError({ message });
      } else {
        originalConsoleError.apply(console, args);
      }
    };

    // Cleanup
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

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
        router.replace('/(app)');
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
            router.push('/(app)');
            break;
          case 'progress':
            router.push('/(app)');
            break;
          default:
            router.push('/(app)');
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
            <SubscriptionProvider>
              <ProgressProvider>
                <OnboardingProvider>
                  <RootLayoutContent />
                </OnboardingProvider>
              </ProgressProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
});