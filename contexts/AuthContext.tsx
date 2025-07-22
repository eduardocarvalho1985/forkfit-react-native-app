import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import auth, {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithCredential,
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { AppleAuthProvider, GoogleAuthProvider } from '@react-native-firebase/auth';
import { api, BackendUser } from '../services/api';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '740196834740-29etdgq3tcedr9drn10iaf3qb98pkogd.apps.googleusercontent.com' // Make sure to use your actual web client ID
});

// Enhanced user interface combining Firebase user with backend data
interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  // Backend user data
  id?: number;
  name?: string;
  onboardingCompleted?: boolean;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  targetWeight?: number;
  activityLevel?: string;
  goal?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  createdAt?: Date;
}

interface AuthContextData {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  syncUser: () => Promise<void>;
  updateUserState: (updates: Partial<AppUser>) => void; // Temporary workaround for backend issues
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
    console.log('AuthContext: Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(
      getAuth(),
      async (firebaseUser) => {
        console.log('AuthContext: Auth state changed, firebaseUser:', firebaseUser ? firebaseUser.uid : 'null');
        if (firebaseUser) {
          try {
            console.log('AuthContext: Refreshing token...');
            // Refresh the user's token to check if they are still valid
            await firebaseUser.getIdToken(true);
            console.log('AuthContext: Token refreshed successfully');

            // Sync with backend and combine data
            await syncUserWithBackend(firebaseUser);
          } catch (error) {
            console.error('AuthContext: Error refreshing token or syncing user:', error);
            // If there's an error getting the token, the user is likely disabled/deleted
            console.log('AuthContext: User is disabled or deleted, signing out...');
            await firebaseSignOut(getAuth());
            setUser(null);
          }
        } else {
          console.log('AuthContext: No firebase user, setting user to null');
          setUser(null);
        }
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []); // Remove loading dependency to prevent listener recreation

  const syncUserWithBackend = async (firebaseUser: FirebaseAuthTypes.User) => {
    try {
      console.log('Syncing user with backend:', firebaseUser.uid);
      const backendUser = await api.syncUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || undefined,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      });
      console.log('User synced with backend:', backendUser);

      // Combine Firebase user with backend data
      const combinedUser: AppUser = {
        ...backendUser,
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      };

      console.log('Combined user data:', combinedUser);
      console.log('Name field from backend:', backendUser.name);
      console.log('Name field in combined user:', combinedUser.name);
      setUser(combinedUser);
    } catch (backendError) {
      console.error('Failed to sync with backend:', backendError);
      // Still set the Firebase user even if backend fails
      const basicUser: AppUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        name: firebaseUser.displayName || undefined,
        onboardingCompleted: false,
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 65,
      };
      console.log('Using basic user data:', basicUser);
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
      console.error('Email sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Signing up with email:', email);
      const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
      console.log('Email sign up successful:', userCredential.user.uid);
      // User will be set through onAuthStateChanged listener
    } catch (error: any) {
      console.error('Email sign up error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google Sign-In process...');

      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('Google Play Services are available.');

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

      // User will be set through onAuthStateChanged listener
    } catch (error: any) {
      console.error('Error during Google Sign-In:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  };

  const signInWithApple = async () => {
    try {
      console.log('Starting Apple Sign-In process...');

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

      // Create a Firebase credential from the response
      const { identityToken, nonce } = appleAuthRequestResponse;
      const appleCredential = AppleAuthProvider.credential(identityToken, nonce);

      console.log('Apple Credential created');

      // Sign the user in with the credential
      const userCredential = await signInWithCredential(getAuth(), appleCredential);
      console.log('User signed in with Apple:', userCredential.user.uid);

      // User will be set through onAuthStateChanged listener
    } catch (error: any) {
      console.error('Error during Apple Sign-In:', error);
      throw new Error(error.message || 'Failed to sign in with Apple');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(getAuth());
      // Also sign out from Google if they were signed in with Google
      try {
        await GoogleSignin.signOut();
      } catch (googleError) {
        console.log('Google sign out not needed or failed:', googleError);
      }
      setUser(null);
      console.log('Sign out successful');
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
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
      syncUser,
      updateUserState
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