
import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? 'Set' : 'Missing',
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId ? 'Set' : 'Missing'
});

const app = initializeApp(firebaseConfig);

// Initialize Auth based on platform
let auth;
try {
  if (Platform.OS === 'web') {
    // For web platform, use regular getAuth
    auth = getAuth(app);
    console.log('Firebase Auth initialized for web platform');
  } else {
    // For React Native platforms, try to use AsyncStorage if available
    try {
      const { getReactNativePersistence } = require('firebase/auth/react-native');
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
      console.log('Firebase Auth initialized with AsyncStorage persistence');
    } catch (error) {
      // Fallback to regular getAuth if React Native persistence fails
      auth = getAuth(app);
      console.log('Firebase Auth initialized with fallback getAuth');
    }
  }
} catch (err) {
  // Final fallback
  console.error('Failed to initialize Firebase Auth:', err);
  auth = getAuth(app);
  console.log('Firebase Auth initialized with final fallback');
}

export { app, auth };
