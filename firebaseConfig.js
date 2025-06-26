import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: `${Constants.expoConfig?.extra?.firebaseProjectId}.firebaseapp.com`,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: `${Constants.expoConfig?.extra?.firebaseProjectId}.appspot.com`,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
};

const app = initializeApp(firebaseConfig);

/* ---------- ALWAYS register auth before getAuth() ---------- */
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (err: any) {
  // initializeAuth throws if it was already called (hot-reload) ► fall back gracefully
  auth = getAuth(app);
  console.log('Auth already initialized, using getAuth');
}

export { app, auth };
