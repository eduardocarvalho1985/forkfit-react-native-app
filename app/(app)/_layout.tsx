import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { updateNotificationPreferences } from '../../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PostHogProvider } from 'posthog-react-native';

export default function AppLayout() {
  useEffect(() => {
    const scheduleNotificationsAfterOnboarding = async () => {
      try {
        // Check if user has notification preferences from onboarding
        const notificationPreferences = await AsyncStorage.getItem('forkfit_notification_preferences');
        
        if (notificationPreferences) {
          const prefs = JSON.parse(notificationPreferences);
          
          // Only schedule if user enabled notifications during onboarding
          if (prefs.dailyReminders || prefs.weeklyReports) {
            console.log('🎯 Scheduling notifications after onboarding completion');
            await updateNotificationPreferences(prefs.dailyReminders, prefs.weeklyReports);
            
            // Clear the temporary preferences since we've now scheduled notifications
            await AsyncStorage.removeItem('forkfit_notification_preferences');
            console.log('✅ Notifications scheduled and preferences cleared');
          }
        }
      } catch (error) {
        console.error('❌ Error scheduling notifications after onboarding:', error);
        // Don't fail the app if notification scheduling fails
      }
    };

    // Run once when the main app loads (after onboarding completion)
    scheduleNotificationsAfterOnboarding();
  }, []);

  return (
    <PostHogProvider
      apiKey="phc_5VbjDClsDzHHEsEVuWENmvP6T9oUfh1giAy2pm48mbq"
      options={{
        host: 'https://us.i.posthog.com', 
        enableSessionReplay: true,
      }}
      autocapture
    >
      <Stack>
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false,
            href: null // Disable this route to prevent conflicts
          }}
        />
      </Stack>
    </PostHogProvider>
  );
}