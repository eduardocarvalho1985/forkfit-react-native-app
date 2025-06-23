
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
          const token = await firebaseUser.getIdToken().catch(() => undefined);
          setUser({
            ...firebaseUser,
            token,
          } as ExtendedUser);
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
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful');
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Attempting to create user with email:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User created successfully:', user.uid);
      
      // Create user document in Firestore
      console.log('Creating user document in Firestore...');
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: serverTimestamp(),
      });
      console.log('User document created successfully');
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
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
