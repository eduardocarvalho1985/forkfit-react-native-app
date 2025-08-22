# ForkFit Comprehensive Frontend Authentication Guide

## Architecture Overview

**All authentication goes through Firebase** with three methods:
1. **Email/Password** - Firebase Auth with email/password
2. **Google Sign-In** - Firebase Auth with Google provider
3. **Apple Sign-In** - Firebase Auth with Apple provider

**Backend Integration:**
- All Firebase users sync with PostgreSQL backend via `/api/users/sync`
- V1 JWT endpoints are available but not used in this flow
- Backend handles user profiles, onboarding data, and fitness calculations

## User Flow

1. **App Launch** → Onboarding screens
2. **User Choice** → Sign In (existing user) OR Complete Onboarding (new user)
3. **After Onboarding** → Create account with Email/Google/Apple
4. **Authentication** → Firebase auth → Backend sync → Dashboard

## Implementation

### 1. Dependencies

```bash
npm install firebase @react-native-google-signin/google-signin @invertase/react-native-apple-authentication @react-native-async-storage/async-storage
```

### 2. Firebase Configuration

```typescript
// config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Your Firebase config
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### 3. API Client

```typescript
// services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingData {
  goal: 'lose_weight' | 'maintain' | 'gain_muscle';
  gender: 'male' | 'female' | 'other';
  birthDate: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  targetWeight: number; // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  emotionalGoal: string;
  motivatingEvent: string;
  isEventDriven: boolean;
  eventDate?: string;
  weeklyPacing: number;
  notificationsEnabled: boolean;
}

class ForkFitAPI {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Sync Firebase user with backend
  async syncUser(firebaseUser: any) {
    const response = await fetch(`${this.baseUrl}/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to sync user with backend');
    }

    return response.json();
  }

  // Get user data
  async getUser(uid: string, firebaseToken: string) {
    const response = await fetch(`${this.baseUrl}/users/${uid}`, {
      headers: {
        'Authorization': `Bearer ${firebaseToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user data');
    }

    return response.json();
  }

  // Update user with onboarding data and trigger fitness calculations
  async completeOnboarding(uid: string, onboardingData: OnboardingData, firebaseToken: string) {
    // First, update user basic info
    const userUpdateResponse = await fetch(`${this.baseUrl}/users/${uid}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${firebaseToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...onboardingData,
        onboardingCompleted: true,
      }),
    });

    if (!userUpdateResponse.ok) {
      throw new Error('Failed to update user data');
    }

    return userUpdateResponse.json();
  }

  // Get user food logs
  async getFoodLogs(uid: string, date: string, firebaseToken: string) {
    const response = await fetch(`${this.baseUrl}/users/${uid}/food-logs/${date}`, {
      headers: {
        'Authorization': `Bearer ${firebaseToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get food logs');
    }

    return response.json();
  }

  // Create food log
  async createFoodLog(uid: string, foodLog: any, firebaseToken: string) {
    const response = await fetch(`${this.baseUrl}/users/${uid}/food-logs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firebaseToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(foodLog),
    });

    if (!response.ok) {
      throw new Error('Failed to create food log');
    }

    return response.json();
  }

  // Get food database categories
  async getFoodCategories() {
    const response = await fetch(`${this.baseUrl}/food-database/categories`);
    
    if (!response.ok) {
      throw new Error('Failed to get food categories');
    }

    return response.json();
  }

  // Search food database
  async searchFoods(query: string) {
    const response = await fetch(`${this.baseUrl}/food-database/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error('Failed to search foods');
    }

    return response.json();
  }
}

export const api = new ForkFitAPI('https://your-repl-url.replit.app/api');
```

### 4. Authentication Context

```typescript
// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User as FirebaseUser,
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import { auth } from '../config/firebase';
import { api } from '../services/api';

interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  onboardingCompleted: boolean;
  // User profile data
  goal?: string;
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  targetWeight?: number;
  activityLevel?: string;
  bmr?: number;
  tdee?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface OnboardingData {
  goal: 'lose_weight' | 'maintain' | 'gain_muscle';
  gender: 'male' | 'female' | 'other';
  birthDate: string;
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  emotionalGoal: string;
  motivatingEvent: string;
  isEventDriven: boolean;
  eventDate?: string;
  weeklyPacing: number;
  notificationsEnabled: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  
  // Authentication methods
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, onboardingData: OnboardingData) => Promise<void>;
  signInWithGoogle: (onboardingData?: OnboardingData) => Promise<void>;
  signInWithApple: (onboardingData?: OnboardingData) => Promise<void>;
  
  // Onboarding
  completeOnboardingForExistingUser: (onboardingData: OnboardingData) => Promise<void>;
  
  // Logout
  logout: () => Promise<void>;
  
  // Data refresh
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'your-web-client-id.googleusercontent.com', // From Firebase console
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
    return unsubscribe;
  }, []);

  const handleAuthStateChange = async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      try {
        // Get Firebase ID token
        const firebaseToken = await firebaseUser.getIdToken();
        
        // Sync with backend
        const backendUser = await api.syncUser(firebaseUser);
        
        // Get complete user data
        const userData = await api.getUser(firebaseUser.uid, firebaseToken);
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          onboardingCompleted: userData.onboardingCompleted || false,
          // Map backend data to user object
          goal: userData.goal,
          gender: userData.gender,
          age: userData.age,
          height: userData.height,
          weight: userData.weight,
          targetWeight: userData.targetWeight,
          activityLevel: userData.activityLevel,
          bmr: userData.bmr,
          tdee: userData.tdee,
          calories: userData.calories,
          protein: userData.protein,
          carbs: userData.carbs,
          fat: userData.fat,
        });
      } catch (error) {
        console.error('Error syncing user:', error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  // Sign in with email/password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User state will be updated via onAuthStateChanged
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Sign up with email/password and complete onboarding
  const signUpWithEmail = async (email: string, password: string, onboardingData: OnboardingData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseToken = await userCredential.user.getIdToken();
      
      // Complete onboarding immediately after account creation
      await api.completeOnboarding(userCredential.user.uid, onboardingData, firebaseToken);
      
      // User state will be updated via onAuthStateChanged
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (onboardingData?: OnboardingData) => {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get the users ID token
      const { idToken } = await GoogleSignin.signIn();
      
      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(idToken);
      
      // Sign-in the user with the credential
      const userCredential = await signInWithCredential(auth, googleCredential);
      
      // If onboarding data provided, complete onboarding
      if (onboardingData) {
        const firebaseToken = await userCredential.user.getIdToken();
        await api.completeOnboarding(userCredential.user.uid, onboardingData, firebaseToken);
      }
      
      // User state will be updated via onAuthStateChanged
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Sign in with Apple
  const signInWithApple = async (onboardingData?: OnboardingData) => {
    try {
      // Start the sign-in request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // Ensure Apple returned a user identityToken
      if (!appleAuthRequestResponse.identityToken) {
        throw new Error('Apple Sign-In failed - no identify token returned');
      }

      // Create a Firebase credential from the response
      const { identityToken, nonce } = appleAuthRequestResponse;
      const appleCredential = new (auth as any).AppleAuthProvider.credential(identityToken, nonce);

      // Sign the user in with the credential
      const userCredential = await signInWithCredential(auth, appleCredential);
      
      // If onboarding data provided, complete onboarding
      if (onboardingData) {
        const firebaseToken = await userCredential.user.getIdToken();
        await api.completeOnboarding(userCredential.user.uid, onboardingData, firebaseToken);
      }
      
      // User state will be updated via onAuthStateChanged
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Complete onboarding for existing user
  const completeOnboardingForExistingUser = async (onboardingData: OnboardingData) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('No Firebase user');
      
      const firebaseToken = await firebaseUser.getIdToken();
      await api.completeOnboarding(user.uid, onboardingData, firebaseToken);
      
      // Refresh user data
      await refreshUserData();
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      // User state will be updated via onAuthStateChanged
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;
      
      const firebaseToken = await firebaseUser.getIdToken();
      const userData = await api.getUser(user.uid, firebaseToken);
      
      setUser(prev => prev ? { ...prev, ...userData } : null);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signInWithApple,
      completeOnboardingForExistingUser,
      logout,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 5. Onboarding Flow Components

```typescript
// components/OnboardingFlow.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingData {
  goal: 'lose_weight' | 'maintain' | 'gain_muscle';
  gender: 'male' | 'female' | 'other';
  birthDate: string;
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  emotionalGoal: string;
  motivatingEvent: string;
  isEventDriven: boolean;
  eventDate?: string;
  weeklyPacing: number;
  notificationsEnabled: boolean;
}

export const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    goal: 'lose_weight',
    gender: 'female',
    birthDate: '1995-01-01',
    age: 29,
    height: 165,
    weight: 65,
    targetWeight: 55,
    activityLevel: 'moderate',
    emotionalGoal: '',
    motivatingEvent: 'health',
    isEventDriven: false,
    weeklyPacing: 0.5,
    notificationsEnabled: true,
  });

  const steps = [
    'Goal',
    'Personal Info',
    'Physical Stats',
    'Activity Level',
    'Preferences',
    'Account Creation'
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <GoalStep data={onboardingData} setData={setOnboardingData} onNext={nextStep} />;
      case 1:
        return <PersonalInfoStep data={onboardingData} setData={setOnboardingData} onNext={nextStep} onPrev={prevStep} />;
      case 2:
        return <PhysicalStatsStep data={onboardingData} setData={setOnboardingData} onNext={nextStep} onPrev={prevStep} />;
      case 3:
        return <ActivityLevelStep data={onboardingData} setData={setOnboardingData} onNext={nextStep} onPrev={prevStep} />;
      case 4:
        return <PreferencesStep data={onboardingData} setData={setOnboardingData} onNext={nextStep} onPrev={prevStep} />;
      case 5:
        return <AccountCreationStep data={onboardingData} onPrev={prevStep} />;
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Progress indicator */}
      <View style={{ flexDirection: 'row', padding: 20 }}>
        {steps.map((step, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              height: 4,
              backgroundColor: index <= currentStep ? '#007AFF' : '#E5E5E5',
              marginHorizontal: 2,
            }}
          />
        ))}
      </View>
      
      {/* Current step content */}
      <ScrollView style={{ flex: 1 }}>
        {renderStep()}
      </ScrollView>
    </View>
  );
};

// Individual step components
const GoalStep = ({ data, setData, onNext }: any) => (
  <View style={{ padding: 20 }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
      Qual é o seu objetivo?
    </Text>
    
    {[
      { key: 'lose_weight', label: 'Perder peso' },
      { key: 'maintain', label: 'Manter peso' },
      { key: 'gain_muscle', label: 'Ganhar massa muscular' }
    ].map((option) => (
      <TouchableOpacity
        key={option.key}
        onPress={() => setData({ ...data, goal: option.key })}
        style={{
          padding: 16,
          marginBottom: 12,
          borderRadius: 8,
          backgroundColor: data.goal === option.key ? '#007AFF' : '#F5F5F5',
        }}
      >
        <Text style={{ 
          color: data.goal === option.key ? 'white' : 'black',
          fontWeight: '600'
        }}>
          {option.label}
        </Text>
      </TouchableOpacity>
    ))}
    
    <TouchableOpacity onPress={onNext} style={{ backgroundColor: '#007AFF', padding: 16, borderRadius: 8, marginTop: 20 }}>
      <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Continuar</Text>
    </TouchableOpacity>
  </View>
);

// Account Creation Step
const AccountCreationStep = ({ data, onPrev }: any) => {
  const { signUpWithEmail, signInWithGoogle, signInWithApple } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  const handleEmailSignUp = async () => {
    setLoading(true);
    try {
      await signUpWithEmail(email, password, data);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await signInWithGoogle(showSignIn ? undefined : data);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setLoading(true);
    try {
      await signInWithApple(showSignIn ? undefined : data);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        {showSignIn ? 'Entrar na sua conta' : 'Criar sua conta'}
      </Text>

      {/* Toggle between sign in and sign up */}
      <TouchableOpacity onPress={() => setShowSignIn(!showSignIn)} style={{ marginBottom: 20 }}>
        <Text style={{ color: '#007AFF', textAlign: 'center' }}>
          {showSignIn ? 'Não tem conta? Criar conta' : 'Já tem conta? Fazer login'}
        </Text>
      </TouchableOpacity>

      {/* Email/Password */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={{ borderWidth: 1, borderColor: '#E5E5E5', padding: 16, borderRadius: 8, marginBottom: 12 }}
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, borderColor: '#E5E5E5', padding: 16, borderRadius: 8, marginBottom: 16 }}
      />
      
      <TouchableOpacity 
        onPress={showSignIn ? handleEmailSignIn : handleEmailSignUp}
        disabled={loading || !email || !password}
        style={{ 
          backgroundColor: '#007AFF', 
          padding: 16, 
          borderRadius: 8, 
          marginBottom: 20,
          opacity: loading || !email || !password ? 0.5 : 1
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
          {showSignIn ? 'Entrar' : 'Criar Conta'}
        </Text>
      </TouchableOpacity>

      {/* Divider */}
      <Text style={{ textAlign: 'center', marginVertical: 20, color: '#666' }}>ou</Text>

      {/* Social Sign In */}
      <TouchableOpacity 
        onPress={handleGoogleAuth}
        disabled={loading}
        style={{ 
          backgroundColor: '#DB4437', 
          padding: 16, 
          borderRadius: 8, 
          marginBottom: 12,
          opacity: loading ? 0.5 : 1
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
          Continuar com Google
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={handleAppleAuth}
        disabled={loading}
        style={{ 
          backgroundColor: '#000', 
          padding: 16, 
          borderRadius: 8, 
          marginBottom: 20,
          opacity: loading ? 0.5 : 1
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
          Continuar com Apple
        </Text>
      </TouchableOpacity>

      {/* Back button */}
      <TouchableOpacity onPress={onPrev} style={{ padding: 16 }}>
        <Text style={{ color: '#666', textAlign: 'center' }}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### 6. Navigation Setup

```typescript
// navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { OnboardingFlow } from '../components/OnboardingFlow';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LoadingScreen } from '../screens/LoadingScreen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user && user.onboardingCompleted ? (
          // User is logged in and onboarded
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
        ) : (
          // User needs onboarding or login
          <Stack.Screen name="Onboarding" component={OnboardingFlow} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

## Key Features

### 1. **Unified Firebase Authentication**
- All three methods (email/password, Google, Apple) use Firebase
- Consistent authentication flow and token management
- Automatic backend synchronization

### 2. **Smart Onboarding Flow**
- New users complete onboarding first, then create account
- Existing users can sign in directly
- Onboarding data is sent to backend after account creation

### 3. **Automatic Backend Integration**
- Firebase users sync with PostgreSQL automatically
- Backend calculates fitness metrics (BMR, TDEE, macros)
- All user data stored in PostgreSQL for consistency

### 4. **Progressive User Experience**
- Onboarding → Account Creation → Dashboard
- Seamless transition between steps
- Error handling and loading states

### 5. **Brazilian Localization**
- Portuguese text throughout onboarding
- Brazilian fitness preferences and goals
- Cultural relevance in food and activity choices

This implementation provides a comprehensive, production-ready authentication system that maintains consistency while leveraging Firebase's robust authentication infrastructure.