import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Storage keys
const STORAGE_KEYS = {
  PUSH_TOKEN: 'forkfit_push_token',
  NOTIFICATION_PERMISSION: 'forkfit_notification_permission',
  LAST_TOKEN_UPDATE: 'forkfit_last_token_update',
};

// Token refresh interval (7 days)
const TOKEN_REFRESH_INTERVAL = 7 * 24 * 60 * 60 * 1000;

export interface NotificationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined' | 'blocked';
}

export interface PushTokenData {
  token: string;
  timestamp: number;
  platform: 'ios' | 'android';
}

/**
 * Get the current notification permission status
 */
export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  try {
    console.log('getNotificationPermissionStatus called - checking real permissions');
    
    // Check if we have stored permission status
    const storedStatus = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PERMISSION);
    if (storedStatus) {
      const parsed = JSON.parse(storedStatus);
      console.log('Using stored permission status:', parsed);
      return parsed;
    }
    
    // Get current permission status from Expo Notifications
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    
    const result = {
      granted: status === 'granted',
      canAskAgain,
      status,
    };
    
    console.log('Current permission status from Expo:', result);
    
    // Store the status for future use
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_PERMISSION, JSON.stringify(result));
    
    return result;
  } catch (error) {
    console.error('Error getting notification permission status:', error);
    // Return a safe default
    return {
      granted: false,
      canAskAgain: false,
      status: 'undetermined',
    };
  }
}

/**
 * Request notification permissions with user education
 */
export async function requestNotificationPermissions(): Promise<NotificationPermissionStatus> {
  try {
    // Check if we can ask for permissions
    const currentStatus = await getNotificationPermissionStatus();
    
    if (currentStatus.status === 'granted') {
      console.log('Notification permissions already granted');
      return currentStatus;
    }
    
    if (currentStatus.status === 'blocked') {
      console.log('Notification permissions are blocked');
      // Show alert to guide user to settings
      Alert.alert(
        'Permissões de Notificação Bloqueadas',
        'Para receber lembretes importantes, você precisa ativar as notificações nas configurações do seu dispositivo.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ir para Configurações', onPress: () => openAppSettings() }
        ]
      );
      return currentStatus;
    }

    console.log('Requesting notification permissions...');
    const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
    
    const result = {
      granted: status === 'granted',
      canAskAgain,
      status,
    };

    // Store permission status
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_PERMISSION, JSON.stringify(result));
    
    if (status === 'granted') {
      console.log('Notification permissions granted successfully');
    } else {
      console.log('Notification permissions denied');
    }
    
    return result;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: 'undetermined',
    };
  }
}

/**
 * Configure Android notification channel (does nothing on iOS)
 */
async function configureAndroidChannel() {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notificações Gerais',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF725E',
        sound: 'default',
        enableVibrate: true,
        showBadge: false,
      });

      // Create a specific channel for meal reminders
      await Notifications.setNotificationChannelAsync('meal-reminders', {
        name: 'Lembretes de Refeições',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF725E',
        sound: 'default',
        enableVibrate: true,
        showBadge: false,
      });
    } catch (error) {
      console.error('Error configuring Android notification channels:', error);
    }
  }
}

/**
 * Get the Expo Push Token for the device
 */
async function getExpoPushToken(): Promise<string | null> {
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      throw new Error('Could not find Expo Project ID in app.config.js');
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log('Expo Push Token retrieved successfully');
    return tokenData.data;
  } catch (error) {
    console.error('Error getting Expo Push Token:', error);
    return null;
  }
}

/**
 * Check if token needs refresh based on timestamp
 */
async function shouldRefreshToken(): Promise<boolean> {
  try {
    const lastUpdate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_TOKEN_UPDATE);
    if (!lastUpdate) return true;
    
    const lastUpdateTime = parseInt(lastUpdate);
    const now = Date.now();
    
    return (now - lastUpdateTime) > TOKEN_REFRESH_INTERVAL;
  } catch (error) {
    console.error('Error checking token refresh status:', error);
    return true;
  }
}

/**
 * Store push token locally
 */
async function storePushTokenLocally(tokenData: PushTokenData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, JSON.stringify(tokenData));
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_TOKEN_UPDATE, Date.now().toString());
    console.log('Push token stored locally');
  } catch (error) {
    console.error('Error storing push token locally:', error);
  }
}

/**
 * Get stored push token from local storage
 */
export async function getStoredPushToken(): Promise<PushTokenData | null> {
  try {
    const tokenData = await AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN);
    if (tokenData) {
      return JSON.parse(tokenData);
    }
    return null;
  } catch (error) {
    console.error('Error getting stored push token:', error);
    return null;
  }
}

/**
 * Register the device for push notifications and return the Expo Push Token
 * This is the main function that should be called to set up notifications
 */
export async function registerForPushNotificationsAsync(): Promise<{
  token: string | null;
  permissionStatus: NotificationPermissionStatus;
}> {
  try {
    // Check if running on a physical device
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return {
        token: null,
        permissionStatus: {
          granted: false,
          canAskAgain: false,
          status: 'undetermined',
        },
      };
    }

    // Request permissions first
    const permissionStatus = await requestNotificationPermissions();
    
    if (!permissionStatus.granted) {
      console.log('Notification permission not granted, cannot get push token');
      return { token: null, permissionStatus };
    }

    // Configure Android channels
    await configureAndroidChannel();

    // Check if we need to refresh the token
    const shouldRefresh = await shouldRefreshToken();
    const storedToken = await getStoredPushToken();
    
    if (!shouldRefresh && storedToken) {
      console.log('Using stored push token (not expired)');
      return { token: storedToken.token, permissionStatus };
    }

    // Get new token
    console.log('Getting new push token...');
    const token = await getExpoPushToken();
    
    if (token) {
      const tokenData: PushTokenData = {
        token,
        timestamp: Date.now(),
        platform: Platform.OS as 'ios' | 'android',
      };
      
      // Store token locally
      await storePushTokenLocally(tokenData);
      
      console.log('Push token registration successful');
      return { token, permissionStatus };
    } else {
      console.log('Failed to get push token');
      return { token: null, permissionStatus };
    }
  } catch (error) {
    console.error('Error in registerForPushNotificationsAsync:', error);
    return {
      token: null,
      permissionStatus: {
        granted: false,
        canAskAgain: false,
        status: 'undetermined',
      },
    };
  }
}

/**
 * Open app settings (useful when permissions are blocked)
 */
export async function openAppSettings(): Promise<void> {
  try {
    // Use React Native Linking to open app settings
    const { Linking } = require('react-native');
    await Linking.openSettings();
  } catch (error) {
    console.error('Error opening app settings:', error);
  }
}

/**
 * Clear stored notification data (useful for logout)
 */
export async function clearNotificationData(): Promise<void> {
  try {
    // Don't clear permission status - keep it for when user wants to re-enable
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PUSH_TOKEN,
      STORAGE_KEYS.LAST_TOKEN_UPDATE,
    ]);
    console.log('Notification data cleared (permissions preserved)');
  } catch (error) {
    console.error('Error clearing notification data:', error);
  }
}

/**
 * Cancel all meal reminder notifications
 */
export async function cancelMealReminders(): Promise<void> {
  try {
    // Cancel all scheduled notifications (this will include meal reminders)
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Meal reminders cancelled');
  } catch (error) {
    console.error('Error cancelling meal reminders:', error);
  }
}

/**
 * Cancel weekly report notifications
 */
export async function cancelWeeklyReports(): Promise<void> {
  try {
    // Cancel all scheduled notifications (this will include weekly reports)
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Weekly reports cancelled');
  } catch (error) {
    console.error('Error cancelling weekly reports:', error);
  }
}

/**
 * Schedule daily meal reminders
 */
export async function scheduleDailyReminders(): Promise<void> {
  try {
    // Cancel existing reminders first
    await cancelMealReminders();
    
    // Schedule breakfast reminder at 9:00 AM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🍳 Hora do Café da Manhã!',
        body: 'Não esqueça de registrar sua primeira refeição do dia',
        data: { type: 'meal_reminder', meal: 'breakfast', screen: 'dashboard' },
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });

    // Schedule lunch reminder at 1:00 PM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🍽️ Hora do Almoço!',
        body: 'Registre sua refeição principal do dia',
        data: { type: 'meal_reminder', meal: 'lunch', screen: 'dashboard' },
      },
      trigger: {
        hour: 13,
        minute: 0,
        repeats: true,
      },
    });

    // Schedule dinner reminder at 7:00 PM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌙 Hora do Jantar!',
        body: 'Registre sua última refeição do dia',
        data: { type: 'meal_reminder', meal: 'dinner', screen: 'dashboard' },
      },
      trigger: {
        hour: 19,
        minute: 0,
        repeats: true,
      },
    });

    console.log('Daily meal reminders scheduled');
  } catch (error) {
    console.error('Error scheduling daily reminders:', error);
  }
}

/**
 * Schedule weekly progress report notifications
 */
export async function scheduleWeeklyReports(enabled: boolean): Promise<void> {
  try {
    if (!enabled) {
      // Cancel existing weekly reports
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const weeklyReports = scheduledNotifications.filter(
        notification => notification.content.data?.type === 'weekly_report'
      );
      
      for (const notification of weeklyReports) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
      console.log('Weekly reports cancelled');
      return;
    }

    // Schedule weekly progress report on Sundays at 6:00 PM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Seu Resumo Semanal',
        body: 'Veja como foi sua semana de progresso no ForkFit',
        data: { type: 'weekly_report', screen: 'progress' },
      },
      trigger: {
        hour: 18,
        minute: 0,
        weekday: 1, // Sunday (1 = Sunday, 2 = Monday, etc.)
        repeats: true,
      },
    });

    console.log('Weekly progress reports scheduled successfully');
  } catch (error) {
    console.error('Error scheduling weekly reports:', error);
  }
}

/**
 * Update notification preferences and schedule accordingly
 */
export async function updateNotificationPreferences(
  dailyReminders: boolean,
  weeklyReports: boolean
): Promise<void> {
  try {
    // Clear any existing notifications first to prevent duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🧹 Cleared existing notifications before scheduling new ones');
    
    // Schedule meal reminders only if enabled
    if (dailyReminders) {
      await scheduleDailyReminders();
      console.log('📅 Daily reminders scheduled');
    }
    
    // Schedule weekly reports only if enabled
    if (weeklyReports) {
      await scheduleWeeklyReports(true);
      console.log('📊 Weekly reports scheduled');
    }
    
    // Store preferences locally for settings page
    await AsyncStorage.setItem('forkfit_notification_preferences', JSON.stringify({
      dailyReminders,
      weeklyReports,
      updatedAt: Date.now(),
    }));
    
    console.log('✅ Notification preferences updated successfully');
  } catch (error) {
    console.error('❌ Error updating notification preferences:', error);
  }
}

/**
 * Get stored notification preferences
 */
export async function getNotificationPreferences(): Promise<{
  dailyReminders: boolean;
  weeklyReports: boolean;
}> {
  try {
    const preferences = await AsyncStorage.getItem('forkfit_notification_preferences');
    if (preferences) {
      const parsed = JSON.parse(preferences);
      return {
        dailyReminders: parsed.dailyReminders ?? false,
        weeklyReports: parsed.weeklyReports ?? false,
      };
    }
    return {
      dailyReminders: false,
      weeklyReports: false,
    };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return {
      dailyReminders: false,
      weeklyReports: false,
    };
  }
} 

/**
 * Temporarily pause notifications for a specified duration
 */
export async function pauseNotificationsTemporarily(hours: number = 1): Promise<void> {
  try {
    // Cancel all scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Schedule a notification to resume after the pause period
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'ForkFit - Notificações Retomadas',
        body: 'Suas notificações foram reativadas automaticamente.',
        data: { type: 'resume_notifications' },
      },
      trigger: { 
        seconds: hours * 60 * 60 // Convert hours to seconds
      },
    });
    
    // Store pause information
    await AsyncStorage.setItem('forkfit_notifications_paused', JSON.stringify({
      pausedAt: Date.now(),
      resumeAt: Date.now() + (hours * 60 * 60 * 1000),
      hours,
    }));
    
    console.log(`Notifications paused for ${hours} hour(s)`);
  } catch (error) {
    console.error('Error pausing notifications:', error);
  }
}

/**
 * Resume notifications and reschedule them
 */
export async function resumeNotifications(): Promise<void> {
  try {
    // Clear pause information
    await AsyncStorage.removeItem('forkfit_notifications_paused');
    
    // Get current preferences and reschedule
    const preferences = await getNotificationPreferences();
    await updateNotificationPreferences(preferences.dailyReminders, preferences.weeklyReports);
    
    console.log('Notifications resumed successfully');
  } catch (error) {
    console.error('Error resuming notifications:', error);
  }
}

/**
 * Check if notifications are currently paused
 */
export async function areNotificationsPaused(): Promise<boolean> {
  try {
    const pauseInfo = await AsyncStorage.getItem('forkfit_notifications_paused');
    if (!pauseInfo) return false;
    
    const { resumeAt } = JSON.parse(pauseInfo);
    const now = Date.now();
    
    if (now >= resumeAt) {
      // Pause period has ended, resume notifications
      await resumeNotifications();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking notification pause status:', error);
    return false;
  }
} 