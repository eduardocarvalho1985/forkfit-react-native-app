import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';

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

// Initialize Auth without AsyncStorage for now to avoid React Native errors
let auth;
try {
  auth = getAuth(app);
  console.log('Firebase Auth initialized with getAuth');
} catch (err) {
  console.error('Failed to initialize Firebase Auth:', err);
}

export { app, auth };