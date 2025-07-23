import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, WeightEntry, CalorieData, ProgressSummary } from '../services/api';
import { useAuth } from './AuthContext';
import auth, { getAuth } from '@react-native-firebase/auth';

interface ProgressContextType {
  // State
  weightHistory: WeightEntry[];
  calorieProgress: CalorieData[];
  progressSummary: ProgressSummary | null;
  dayStreak: number;
  weeklyStreakData: boolean[]; // Last 7 days of food logging
  loading: {
    weight: boolean;
    calories: boolean;
    summary: boolean;
  };
  error: {
    weight: string | null;
    calories: string | null;
    summary: string | null;
  };

  // Actions
  refreshWeightHistory: () => Promise<void>;
  addWeightEntry: (weight: number, date: string) => Promise<void>;
  deleteWeightEntry: (weightId: string) => Promise<void>;
  refreshCalorieProgress: (period: string, startDate: string, endDate: string) => Promise<void>;
  refreshProgressSummary: (period: string, startDate: string, endDate: string) => Promise<void>;
  refreshDayStreak: () => Promise<void>;
  clearErrors: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const { user, updateUserState, syncUser } = useAuth();
  
  // State
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [calorieProgress, setCalorieProgress] = useState<CalorieData[]>([]);
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);
  const [dayStreak, setDayStreak] = useState<number>(0);
  const [weeklyStreakData, setWeeklyStreakData] = useState<boolean[]>(Array(7).fill(false));
  
  const [loading, setLoading] = useState({
    weight: false,
    calories: false,
    summary: false,
  });
  
  const [error, setError] = useState({
    weight: null as string | null,
    calories: null as string | null,
    summary: null as string | null,
  });

  // Weight History Management
  const refreshWeightHistory = async () => {
    if (!user?.uid) return;
    
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) return;
    
    setLoading(prev => ({ ...prev, weight: true }));
    setError(prev => ({ ...prev, weight: null }));
    
    try {
      const data = await api.getWeightHistory(user.uid, token);
      setWeightHistory(data);
    } catch (err: any) {
      setError(prev => ({ ...prev, weight: err.message }));
      console.error('Failed to fetch weight history:', err);
    } finally {
      setLoading(prev => ({ ...prev, weight: false }));
    }
  };

  const addWeightEntry = async (weight: number, date: string) => {
    if (!user?.uid) return;
    
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) return;
    
    setLoading(prev => ({ ...prev, weight: true }));
    setError(prev => ({ ...prev, weight: null }));
    
    try {
      console.log('ProgressContext: Adding weight entry:', { weight, date, uid: user.uid });
      
      // Add weight entry to weight logs
      await api.addWeightEntry(user.uid, weight, date, token);
      console.log('ProgressContext: Weight entry added to logs successfully');
      
      // Update user profile with new weight in backend
      await api.updateUserProfile(user.uid, { weight }, token);
      console.log('ProgressContext: User profile updated with new weight successfully');
      
      // Update local user state
      updateUserState({ weight });
      console.log('ProgressContext: Local user state updated');
      
      // Sync user data to ensure AuthContext has latest data
      await syncUser();
      console.log('ProgressContext: User data synced successfully');
      
      // Refresh the weight history
      await refreshWeightHistory();
      console.log('ProgressContext: Weight history refreshed');
    } catch (err: any) {
      setError(prev => ({ ...prev, weight: err.message }));
      console.error('Failed to add weight entry:', err);
      throw err; // Re-throw to handle in component
    } finally {
      setLoading(prev => ({ ...prev, weight: false }));
    }
  };

  const deleteWeightEntry = async (weightId: string) => {
    if (!user?.uid) return;
    
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) return;
    
    setLoading(prev => ({ ...prev, weight: true }));
    setError(prev => ({ ...prev, weight: null }));
    
    try {
      await api.deleteWeightEntry(user.uid, weightId, token);
      await refreshWeightHistory(); // Refresh the list
    } catch (err: any) {
      setError(prev => ({ ...prev, weight: err.message }));
      console.error('Failed to delete weight entry:', err);
      throw err; // Re-throw to handle in component
    } finally {
      setLoading(prev => ({ ...prev, weight: false }));
    }
  };

  // Calorie Progress Management
  const refreshCalorieProgress = async (period: string, startDate: string, endDate: string) => {
    if (!user?.uid) return;
    
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) return;
    
    setLoading(prev => ({ ...prev, calories: true }));
    setError(prev => ({ ...prev, calories: null }));
    
    try {
      const data = await api.getCalorieProgress(user.uid, period, startDate, endDate, token);
      setCalorieProgress(data);
    } catch (err: any) {
      setError(prev => ({ ...prev, calories: err.message }));
      console.error('Failed to fetch calorie progress:', err);
    } finally {
      setLoading(prev => ({ ...prev, calories: false }));
    }
  };

  // Progress Summary Management
  const refreshProgressSummary = async (period: string, startDate: string, endDate: string) => {
    if (!user?.uid) return;
    
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) return;
    
    setLoading(prev => ({ ...prev, summary: true }));
    setError(prev => ({ ...prev, summary: null }));
    
    try {
      const data = await api.getProgressSummary(user.uid, period, startDate, endDate, token);
      setProgressSummary(data);
    } catch (err: any) {
      setError(prev => ({ ...prev, summary: err.message }));
      console.error('Failed to fetch progress summary:', err);
    } finally {
      setLoading(prev => ({ ...prev, summary: false }));
    }
  };

  const refreshDayStreak = async () => {
    if (!user?.uid) return;
    
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) return;
    
    try {
      // Get streak data from progress summary
      if (progressSummary) {
        setDayStreak(progressSummary.dayStreak || 0);
        setWeeklyStreakData(progressSummary.weeklyStreakData || Array(7).fill(false));
      }
    } catch (err: any) {
      console.error('Failed to get day streak:', err);
    }
  };

  const clearErrors = () => {
    setError({
      weight: null,
      calories: null,
      summary: null,
    });
  };

  // Initial data load when user is available
  useEffect(() => {
    if (user?.uid) {
      refreshWeightHistory();
    }
  }, [user?.uid]);

  // Refresh streak when progress summary changes
  useEffect(() => {
    if (progressSummary) {
      refreshDayStreak();
    }
  }, [progressSummary]);

  const value: ProgressContextType = {
    weightHistory,
    calorieProgress,
    progressSummary,
    dayStreak,
    weeklyStreakData,
    loading,
    error,
    refreshWeightHistory,
    addWeightEntry,
    deleteWeightEntry,
    refreshCalorieProgress,
    refreshProgressSummary,
    refreshDayStreak,
    clearErrors,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}; 