import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
} from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

/* ---------- ALWAYS register auth before getAuth() ---------- */
let auth;
try {
  // Try to initialize auth with AsyncStorage persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  console.log('Firebase Auth initialized with AsyncStorage persistence');
} catch (err) {
  // If initializeAuth fails (hot-reload), use getAuth
  if (err.code === 'auth/already-initialized') {
    auth = getAuth(app);
    console.log('Auth already initialized, using getAuth');
  } else {
    // For other errors, fallback to getAuth without persistence
    console.warn('Failed to initialize auth with AsyncStorage, falling back to getAuth:', err.message);
    auth = getAuth(app);
  }
}

export { app, auth };
