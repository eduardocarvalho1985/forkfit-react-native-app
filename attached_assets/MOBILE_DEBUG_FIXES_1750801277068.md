# Quick Fix Summary for iOS Build Issues

## Immediate Actions Required

### 1. Install Dependencies
```bash
npx expo install @react-native-async-storage/async-storage
```

### 2. Fix Firebase Auth (Critical)
Replace your Firebase initialization with:
```typescript
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
```

### 3. Add Missing Route Exports
Each route file needs:
```typescript
export default function ComponentName() {
  return <View><Text>Screen Content</Text></View>;
}
```

### 4. Environment Variables
Set in `.env`:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id  
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. Clean Build
```bash
npx expo start --clear
```

These fixes will resolve the "Component auth has not been registered" errors and missing export warnings. The complete guide is in `iOS_BUILD_TROUBLESHOOTING_GUIDE.md`.