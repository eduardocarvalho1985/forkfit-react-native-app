# iOS Build Troubleshooting Guide - ForkFit Mobile App

## Current Issues Identified

### 1. Firebase Auth Configuration Error
**Error:** `Component auth has not been registered yet, js engine: hermes`
**Cause:** Firebase Auth not properly initialized for React Native environment

### 2. Missing AsyncStorage Warning
**Warning:** Auth state will default to memory persistence and will not persist between sessions
**Cause:** Missing React Native AsyncStorage dependency

### 3. Missing Default Exports
**Warning:** Routes missing required default export
**Cause:** React components not properly exported in route files

## Technical Solutions

### Step 1: Install Required Dependencies
```bash
# Install AsyncStorage for Firebase Auth persistence
npx expo install @react-native-async-storage/async-storage

# Install Firebase dependencies if missing
npx expo install firebase
```

### Step 2: Fix Firebase Auth Configuration
Create/update your Firebase configuration file:

```typescript
// firebase.config.ts
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export default app;
```

### Step 3: Fix Route Component Exports
Each route file must export a React component as default:

```typescript
// app/(tabs)/dashboard.tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function Dashboard() {
  return (
    <View>
      <Text>Dashboard Screen</Text>
    </View>
  );
}

// app/(tabs)/profile.tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function Profile() {
  return (
    <View>
      <Text>Profile Screen</Text>
    </View>
  );
}

// app/(tabs)/settings.tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function Settings() {
  return (
    <View>
      <Text>Settings Screen</Text>
    </View>
  );
}

// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
    </Stack>
  );
}

// app/auth/login.tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function Login() {
  return (
    <View>
      <Text>Login Screen</Text>
    </View>
  );
}

// app/auth/register.tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function Register() {
  return (
    <View>
      <Text>Register Screen</Text>
    </View>
  );
}

// app/index.tsx
import React from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to dashboard or auth based on user state
  return <Redirect href="/(tabs)/dashboard" />;
}
```

### Step 4: Environment Variables Setup
Create/update `.env` file with proper Firebase credentials:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

### Step 5: Update app.json Configuration
Ensure proper Expo configuration:

```json
{
  "expo": {
    "name": "ForkFit",
    "slug": "forkfit",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.forkfit.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.forkfit.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router"
    ],
    "scheme": "forkfit"
  }
}
```

## Build and Test Process

### 1. Clean and Rebuild
```bash
# Clear Expo cache
npx expo start --clear

# Or for development build
npx expo run:ios --clear
```

### 2. Test Authentication Flow
```typescript
// Test Firebase Auth in your app
import { auth } from './firebase.config';
import { onAuthStateChanged } from 'firebase/auth';

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('User signed in:', user.uid);
    } else {
      console.log('User signed out');
    }
  });

  return unsubscribe;
}, []);
```

## Common Debugging Steps

1. **Check Expo CLI Version:** `npx expo --version`
2. **Verify Dependencies:** `npx expo doctor`
3. **Clear Metro Cache:** `npx expo start --clear`
4. **Check iOS Simulator:** Ensure you're using a compatible iOS version
5. **Verify Firebase Config:** Test Firebase connection separately

## Expected Results After Fixes

- Firebase Auth initializes properly with AsyncStorage persistence
- All route components load without missing export warnings
- iOS build completes successfully
- App launches and navigates between screens
- Authentication state persists between app sessions

This should resolve all the identified iOS build issues and get your mobile app running properly on iOS devices and simulators.