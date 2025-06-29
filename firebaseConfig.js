// File: firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration using actual values from google-services.json and GoogleService-Info.plist
const firebaseConfig = {
  apiKey: "AIzaSyBnv_E4Sji7CallZFR9z8gH7CKA5tMwwWE", // From GoogleService-Info.plist
  authDomain: "nutrisnapapp2025.firebaseapp.com",
  projectId: "nutrisnapapp2025",
  storageBucket: "nutrisnapapp2025.firebasestorage.app",
  messagingSenderId: "740196834740",
  appId: "1:740196834740:ios:1806bcea749a5c5006a6e1", // From GoogleService-Info.plist
};

// Lazy initialization variables
let app = null;
let auth = null;
let isInitializing = false;

// Lazy initialization function
const initializeFirebase = () => {
  if (app && auth) {
    return { app, auth };
  }

  if (isInitializing) {
    console.log('Firebase is already initializing...');
    return { app: null, auth: null };
  }

  try {
    isInitializing = true;
    console.log('Initializing Firebase...');
    
    // Initialize Firebase app
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
    
    // Use getAuth() only - this should work without registration issues
    auth = getAuth(app);
    console.log('Firebase Auth initialized successfully with getAuth()');

    isInitializing = false;
    return { app, auth };
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    isInitializing = false;
    app = null;
    auth = null;
    return { app: null, auth: null };
  }
};

// Export the initialization function and current instances
export { initializeFirebase };

// Export current instances (will be null until initialized)
export { app, auth };