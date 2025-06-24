
import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBzrryqKfpqxkf5fzpj_NbdWD5QfM7Kj7g",
  authDomain: "nutrisnapapp2025.firebaseapp.com",
  projectId: "nutrisnapapp2025",
  storageBucket: "nutrisnapapp2025.firebasestorage.app",
  messagingSenderId: "740196834740",
  appId: "1:740196834740:android:d4e1f19767ca7d1306a6e1"
};

// Prevent duplicate app initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth with platform-specific persistence
let auth;
try {
  if (Platform.OS === 'web') {
    // For web, use the default auth
    auth = getAuth(app);
  } else {
    // For native platforms, use AsyncStorage persistence
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  }
} catch (error) {
  // Fallback to default auth if initialization fails
  console.log('Using fallback auth initialization');
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export default app;
