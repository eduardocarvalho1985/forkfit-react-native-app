import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth, {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithCredential,
  sendPasswordResetEmail,
  AppleAuthProvider,
  GoogleAuthProvider
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { api, BackendUser } from '../services/api';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';
import { appleAuth } from '../services/appleAuth';
import jwt_decode from 'jwt-decode';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '740196834740-29etdgq3tcedr9drn10iaf3qb98pkogd.apps.googleusercontent.com' // Make sure to use your actual web client ID
});

// Enhanced user interface combining Firebase user with backend data
interface AppUser {
  uid: string;
  email?: string | null;
  displayName: string | null;
  photoURL: string | null;
  // Backend user data
  id?: number;
  name?: string;
  onboardingCompleted?: boolean;
  age?: number;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  targetWeight?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'very_active';
  goal?: 'lose_weight' | 'maintain' | 'gain_muscle';
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notificationsEnabled?: boolean;
  createdAt?: Date;
}

export interface AuthContextData {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, onboardingData?: any) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  syncUser: () => Promise<void>;
  updateUserState: (updates: Partial<AppUser>) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Firebase auth state listener
  useEffect(() => {
    console.log('🔥 AuthContext: Setting up auth state listener');
    console.log('🔧 Auth object:', getAuth());
    console.log('📊 Initial loading state:', loading);
    console.log('👤 Initial user state:', user);
    
    const unsubscribe = onAuthStateChanged(
      getAuth(),
      async (firebaseUser) => {
        try {
          console.log('🔥 AUTH STATE CHANGED:', firebaseUser?.uid || 'NO USER');
          
          if (firebaseUser) {
            // STEP 1: CHECK - Verify token availability
            console.log('🔍 STEP 1: CHECKING token availability...');
            let token: string | null = null;
            
            try {
              token = await firebaseUser.getIdToken(false); // Try to get existing token first
              console.log('✅ CHECK: Token already available, length:', token?.length || 0);
            } catch (tokenError) {
              console.log('⚠️ CHECK: No existing token available, will refresh');
              token = null;
            }
            
            // STEP 2: WAIT - If no token, wait for refresh
            if (!token) {
              console.log('⏳ STEP 2: WAITING for token refresh...');
              try {
                console.log('🔄 Refreshing token...');
                token = await firebaseUser.getIdToken(true); // Force refresh
                console.log('✅ WAIT: Token refresh completed, length:', token?.length || 0);
              } catch (refreshError) {
                console.error('❌ WAIT: Token refresh failed:', refreshError);
                throw refreshError;
              }
            } else {
              console.log('✅ STEP 2: WAIT skipped - token already available');
            }
            
            // STEP 3: THEN - Now start backend sync with guaranteed token
            console.log('🚀 STEP 3: THEN - Starting backend sync with valid token...');
            console.log('🔑 Token status: Available (length:', token?.length || 0, ')');
            console.log('📞 CALLING syncUserWithBackend...');
            
            await syncUserWithBackend(firebaseUser);
            console.log('✅ syncUserWithBackend COMPLETED');
          } else {
            console.log('👤 No firebase user, setting user to null');
            setUser(null);
          }
        } catch (error) {
          console.error('💥 Unexpected error in auth state listener:', error);
          // If there's an error getting the token, the user is likely disabled/deleted
          console.log('🚫 User is disabled or deleted, signing out...');
          try {
            await firebaseSignOut(getAuth());
          } catch (signOutError) {
            console.error('AuthContext: Error during sign out:', signOutError);
          }
          setUser(null);
        } finally {
          console.log('🏁 Setting loading to false');
          setLoading(false);
        }
      }
    );

    return unsubscribe;
  }, []); // Remove loading dependency to prevent listener recreation

  const syncUserWithBackend = async (firebaseUser: FirebaseAuthTypes.User) => {
    try {
      console.log('🚀 Starting backend sync for:', firebaseUser.uid);
      
      // Verify we have a valid token before proceeding
      console.log('🔑 Verifying token before backend sync...');
      const token = await firebaseUser.getIdToken(false);
      console.log('✅ Token verification successful, length:', token?.length || 0);
      console.log('🔒 Backend sync proceeding with valid token');
      
      // Check if we have pending onboarding data for this new user
      console.log('📦 Checking AsyncStorage for onboarding data...');
      const storedOnboardingData = await AsyncStorage.getItem('onboardingData');
      console.log('📦 Stored onboarding data exists:', !!storedOnboardingData);
      
      // If we have onboarding data, use the sequential approach
      if (storedOnboardingData) {
        console.log('📝 Using sequential approach with onboarding data from AsyncStorage');
        const onboardingData = JSON.parse(storedOnboardingData);
        console.log('📊 Onboarding data available:', Object.keys(onboardingData));
        
        // Step 1: Sync basic user with backend
        console.log('📝 Step 1: Syncing basic user...');
        const backendUser = await api.syncUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.email?.split('@')[0] || 'User',
          displayName: firebaseUser.email?.split('@')[0] || 'User',
          photoURL: firebaseUser.photoURL
        });
        console.log('✅ Step 1 complete:', backendUser);
        
        // Step 2: Update user with onboarding data
        console.log('📝 Step 2: Adding onboarding data...');
        const updatedUser = await api.updateUserProfile(firebaseUser.uid, {
          ...onboardingData,
          onboardingCompleted: true
        }, await firebaseUser.getIdToken());
        console.log('✅ Step 2 complete:', updatedUser);
        
        // Create a complete user object
        const completeUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || undefined,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          name: firebaseUser.email?.split('@')[0] || 'User',
          onboardingCompleted: true,
          // Add other profile data from onboarding
          age: onboardingData.age,
          gender: onboardingData.gender,
          height: onboardingData.height,
          weight: onboardingData.weight,
          targetWeight: onboardingData.targetWeight,
          goal: onboardingData.goal,
          activityLevel: onboardingData.activityLevel,
          calories: 0, // Will be calculated later
          protein: 0,
          carbs: 0,
          fat: 0,
        };
        
        console.log('👤 Setting complete user:', completeUser);
        setUser(completeUser);
        
        // Clear the stored onboarding data since we've used it
        console.log('🧹 Clearing onboarding data from AsyncStorage');
        await AsyncStorage.removeItem('onboardingData');
        console.log('✅ Onboarding data cleared from AsyncStorage');
        
        return;
      }
      
      // For existing users without onboarding data, try to get their profile
      console.log('📋 No onboarding data found in AsyncStorage, checking if user exists in backend');
      
      try {
        // Try to get existing user profile
        console.log('🔍 Fetching existing user profile...');
        const existingUser = await api.getUserProfile(firebaseUser.uid, await firebaseUser.getIdToken());
        console.log('✅ Existing user found:', existingUser);
        
        // Combine Firebase user with backend data
        const combinedUser: AppUser = {
          ...existingUser,
          uid: firebaseUser.uid,
          email: firebaseUser.email || undefined,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          activityLevel: existingUser.activityLevel as 'sedentary' | 'light' | 'moderate' | 'very_active' | undefined,
          goal: existingUser.goal as 'lose_weight' | 'maintain' | 'gain_muscle' | undefined,
        };

        console.log('🔗 Combined user data:', combinedUser);
        setUser(combinedUser);
        
        // If user is not onboarded, redirect to onboarding
        if (!combinedUser.onboardingCompleted) {
          console.log('⚠️ User not onboarded, redirecting to onboarding');
          // The root layout will handle this redirect
        }
        
      } catch (profileError) {
        console.log('📝 User profile not found, creating basic user object');
        // Create basic user object for users without backend profile
        const basicUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || undefined,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          name: firebaseUser.displayName || undefined,
          onboardingCompleted: false,
          calories: 2000,
          protein: 150,
          carbs: 250,
          fat: 65,
        };
        console.log('👤 Using basic user data:', basicUser);
        setUser(basicUser);
      }
      
    } catch (backendError) {
      console.error('💥 Backend sync failed:', backendError);
      // Still set the Firebase user even if backend fails
      const basicUser: AppUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || undefined,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        name: firebaseUser.displayName || undefined,
        onboardingCompleted: false,
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 65,
      };
      console.log('👤 Using basic user data due to backend error:', basicUser);
      setUser(basicUser);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in with email:', email);
      const userCredential = await signInWithEmailAndPassword(getAuth(), email, password);
      console.log('Email sign in successful:', userCredential.user.uid);
      // User will be set through onAuthStateChanged listener
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  const signUp = async (email: string, password: string, onboardingData?: any) => {
    try {
      console.log('📝 Signing up with email:', email);
      console.log('📦 Onboarding data provided:', onboardingData ? 'Yes' : 'No');
      
      // Store onboarding data for later use in syncUserWithBackend
      if (onboardingData) {
        console.log('💾 Storing onboarding data for new user:', onboardingData);
        console.log('📊 Onboarding data keys:', Object.keys(onboardingData));
        await AsyncStorage.setItem('onboardingData', JSON.stringify(onboardingData));
        console.log('✅ Onboarding data stored in AsyncStorage');
      } else {
        console.log('⚠️ No onboarding data provided for new user');
      }
      
      console.log('🔥 Creating Firebase user...');
      const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
      console.log('✅ Email sign up successful:', userCredential.user.uid);
      console.log('📋 User will be set through onAuthStateChanged listener');
      
    } catch (error: any) {
      console.error('❌ Email sign up error:', error);
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google Sign-In process...');

      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('Google Play Services are available.');
      try {
        await GoogleSignin.signOut();
      } catch (error) { }
      // Get the user's ID token
      const signInResult = await GoogleSignin.signIn();
      console.log('Google Sign-In result:', signInResult);

      let idToken = signInResult.data?.idToken;
      if (!idToken) {
        console.error('No ID token found during Google Sign-In');
        throw new Error('No ID token found');
      }

      console.log('ID Token retrieved');

      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(idToken);
      console.log('Google Credential created');

      // Sign-in the user with the credential
      const userCredential = await signInWithCredential(getAuth(), googleCredential);
      console.log('User signed in with Google:', userCredential.user.uid);

      // Store onboarding data if available (for new users)
      // Note: We'll need to get this from the registration context
      // For now, the user will be handled through onAuthStateChanged

      // User will be set through onAuthStateChanged listener
    } catch (error: any) {
      console.error('Error during Google Sign-In:', error);
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  const signInWithApple = async () => {
    try {
      // Check if Apple authentication is available (iOS only)
      if (Platform.OS !== 'ios' || !appleAuth) {
        throw new Error('Apple Sign-In is only available on iOS devices');
      }

      // Start the sign-in request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      console.log('Apple Auth Request Response received');

      // Ensure Apple returned a user identityToken
      if (!appleAuthRequestResponse.identityToken) {
        console.error('Apple Sign-In failed - no identity token returned');
        throw new Error('Apple Sign-In failed - no identity token returned');
      }

      let res: any;
      if (appleAuthRequestResponse.email == null || appleAuthRequestResponse.email === undefined) {
        res = jwt_decode(appleAuthRequestResponse.identityToken)
      } else {
        res = appleAuthRequestResponse
      }

      const signInMethods = await auth().fetchSignInMethodsForEmail(res?.email);

      // Create a Firebase credential from the response
      const { identityToken, nonce } = appleAuthRequestResponse;
      const appleCredential = AppleAuthProvider.credential(identityToken, nonce);

      console.log('Apple Credential created');
      if (signInMethods.includes('password')) {
        // Email already registered; ask the user to link the accounts
        Alert.alert("Apple Sign-In", "You have an existing account with the same email. Use Email and password option to Login in your account!")
      } else {
        const userCredential = await auth().signInWithCredential(appleCredential);
        console.log('User signed in with Apple:', userCredential.user.uid);
      }

    } catch (error: any) {
      console.error('Error during Apple Sign-In:', error);
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthContext: Starting sign out process');
      
      // Check if there's a current Firebase user
      const currentUser = getAuth().currentUser;
      if (currentUser) {
        console.log('AuthContext: Signing out Firebase user:', currentUser.uid);
        await firebaseSignOut(getAuth());
        console.log('AuthContext: Firebase sign out successful');
      } else {
        console.log('AuthContext: No current Firebase user to sign out');
      }
      
      // Always try to sign out from Google Sign-In
      try {
        await GoogleSignin.signOut();
        console.log('AuthContext: Google Sign-In sign out successful');
      } catch (googleError) {
        console.log('AuthContext: Google Sign-In sign out error (non-critical):', googleError);
      }
      
      // Clear local user state
      setUser(null);
      console.log('AuthContext: Local user state cleared');
      
    } catch (error: any) {
      console.error('AuthContext: Error during sign out:', error);
      // Even if there's an error, clear the local state
      setUser(null);
      throw new Error('Failed to sign out');
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      console.log('AuthContext: Starting password reset process...');
      console.log('AuthContext: Email:', email);
      console.log('AuthContext: Firebase Auth instance:', getAuth());

      // Check if Firebase is properly initialized
      const currentUser = getAuth().currentUser;
      console.log('AuthContext: Current user:', currentUser ? currentUser.uid : 'null');

      console.log('AuthContext: Sending password reset email to:', email);
      await sendPasswordResetEmail(getAuth(), email);
      console.log('AuthContext: Password reset email sent successfully');
    } catch (error: any) {
      console.error('AuthContext: Password reset error:', error);
      console.error('AuthContext: Error code:', error.code);
      console.error('AuthContext: Error message:', error.message);
      console.error('AuthContext: Full error object:', JSON.stringify(error, null, 2));
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  const syncUser = async () => {
    const firebaseUser = getAuth().currentUser;
    if (firebaseUser) {
      console.log('AuthContext: Manual sync triggered for user:', firebaseUser.uid);
      await syncUserWithBackend(firebaseUser);
      console.log('AuthContext: Manual sync completed');
    } else {
      console.log('AuthContext: Manual sync failed - no Firebase user');
    }
  };

  // Temporary workaround function for backend issues
  const updateUserState = (updates: Partial<AppUser>) => {
    if (user) {
      console.log('AuthContext: Updating user state with:', updates);
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      signInWithApple,
      forgotPassword,
      syncUser,
      updateUserState,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}