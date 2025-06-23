import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { api, BackendUser } from '../services/api';

interface ExtendedUser extends User {
  token?: string;
  // Backend user data
  id?: number;
  onboardingCompleted?: boolean;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface AuthContextData {
  user: ExtendedUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          console.log('Firebase user signed in:', firebaseUser.uid);

          // Get Firebase ID token
          const token = await firebaseUser.getIdToken();
          console.log('Got Firebase token');

          // Sync with backend
          const backendUser = await api.getOrCreateUser(
            firebaseUser.uid,
            firebaseUser.email || '',
            token
          );

          console.log('Backend user synced:', backendUser);

          // Combine Firebase and backend user data
          setUser({
            ...firebaseUser,
            token, // Store token for API calls
            ...backendUser, // Backend user data
          } as ExtendedUser);

        } catch (error) {
          console.error('Failed to sync user with backend:', error);
          // Still set Firebase user even if backend fails
          try {
            const token = await firebaseUser.getIdToken();
            setUser({
              ...firebaseUser,
              token,
            } as ExtendedUser);
          } catch (tokenError) {
            console.error('Failed to get Firebase token:', tokenError);
            setUser(firebaseUser as ExtendedUser);
          }
        }
      } else {
        console.log('User signed out');
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with email:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      console.log('Firebase user signed in:', firebaseUser.uid);

      const token = await firebaseUser.getIdToken();
      console.log('Got Firebase token');

      // Sync with backend
      let backendData: BackendUser | undefined;
      try {
        backendData = await api.getOrCreateUser(firebaseUser.uid, email, token);
        console.log('User synced with backend:', backendData);
      } catch (backendError) {
        console.error('Failed to sync user with backend:', backendError);
      }

      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
        token,
        backendData,
      };

      setUser(userData);
      console.log('Sign in successful');
      return userData;
    } catch (error: any) {
      console.error('Sign in error:', error);
      let message = 'Failed to sign in';

      switch (error.code) {
        case 'auth/user-not-found':
          message = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          message = 'Please enter a valid email address';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later';
          break;
      }

      throw new Error(message);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Calling signUp function...');
      console.log('Attempting to create user with email:', email);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get Firebase token for backend API
      const token = await user.getIdToken();

      console.log('User created, now syncing with backend...');

      // Create user in backend
      try {
        const backendUser = await api.getOrCreateUser(user.uid, email, token);
        console.log('User synced with backend:', backendUser);
      } catch (backendError) {
        console.error('Failed to sync user with backend:', backendError);
        console.log('Continuing without backend sync...');
        // Continue even if backend sync fails
      }

      // Create user document in Firestore (fallback)
      try {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          createdAt: new Date().toISOString(),
        });
        console.log('Firestore document created successfully');
      } catch (firestoreError) {
        console.error('Firestore error (non-blocking):', firestoreError);
        // Continue even if Firestore fails
      }

      // Sign in after successful registration
      return await signIn(email, password);
    } catch (error: any) {
      console.error('Sign up error:', error);
      let message = 'Failed to create account';

      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'An account with this email already exists';
          break;
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters';
          break;
        case 'auth/invalid-email':
          message = 'Please enter a valid email address';
          break;
      }

      throw new Error(message);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}