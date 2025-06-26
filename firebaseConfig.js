// firebaseConfig.js  (or .ts)

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey:           Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain:       `${Constants.expoConfig?.extra?.firebaseProjectId}.firebaseapp.com`,
  projectId:        Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket:    `${Constants.expoConfig?.extra?.firebaseProjectId}.appspot.com`,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseSenderId,
  appId:            Constants.expoConfig?.extra?.firebaseAppId,
};

const app = initializeApp(firebaseConfig);

// --- 🔑 initialize auth for React-Native BEFORE getAuth() ---
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (e) {
  // if auth was already initialised (hot reload) fallback gracefully
  auth = getAuth(app);
}

export { app, auth };
