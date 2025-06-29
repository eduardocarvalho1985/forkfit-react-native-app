import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, BackendUser } from '../services/api';

// Mock user interface (similar to Firebase User)
interface MockUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
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
  user: MockUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing user on app start
  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        // Check if we have a stored user (you can implement this with AsyncStorage later)
        const storedUser = null; // For now, always start with no user
        
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Error checking existing user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkExistingUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Mock sign in with email:', email);
      
      // For demo purposes, accept any email/password combination
      // In production, this would validate against Firebase
      const mockUser: MockUser = {
        uid: `mock_${Date.now()}`,
        email: email,
        displayName: email.split('@')[0],
        token: 'mock_token',
        onboardingCompleted: false,
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 65,
      };

      // Try to sync with backend
      try {
        const backendUser = await api.syncUser({
          uid: mockUser.uid,
          email: email,
          displayName: mockUser.displayName,
          photoURL: mockUser.photoURL
        });
        console.log('User synced with backend:', backendUser);
        
        // Combine mock user with backend data
        setUser({
          ...mockUser,
          ...backendUser,
        });
      } catch (backendError) {
        console.error('Failed to sync with backend:', backendError);
        // Still set the mock user even if backend fails
        setUser(mockUser);
      }

      console.log('Mock sign in successful');
    } catch (error: any) {
      console.error('Mock sign in error:', error);
      throw new Error('Failed to sign in');
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Mock sign up with email:', email);
      
      // For demo purposes, create a mock user
      const mockUser: MockUser = {
        uid: `mock_${Date.now()}`,
        email: email,
        displayName: email.split('@')[0],
        token: 'mock_token',
        onboardingCompleted: false,
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 65,
      };

      // Try to sync with backend
      try {
        const backendUser = await api.syncUser({
          uid: mockUser.uid,
          email: email,
          displayName: mockUser.displayName,
          photoURL: mockUser.photoURL
        });
        console.log('User synced with backend:', backendUser);
        
        // Combine mock user with backend data
        setUser({
          ...mockUser,
          ...backendUser,
        });
      } catch (backendError) {
        console.error('Failed to sync with backend:', backendError);
        // Still set the mock user even if backend fails
        setUser(mockUser);
      }

      console.log('Mock sign up successful');
    } catch (error: any) {
      console.error('Mock sign up error:', error);
      throw new Error('Failed to create account');
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      console.log('Mock sign out successful');
    } catch (error) {
      console.error('Mock sign out error:', error);
      throw new Error('Failed to sign out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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