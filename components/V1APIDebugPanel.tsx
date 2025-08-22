import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { apiV1, V1OnboardingData } from '@/services/apiV1';

interface V1APIDebugPanelProps {
  onClose?: () => void;
}

export const V1APIDebugPanel: React.FC<V1APIDebugPanelProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string>('');
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('TestPass123!');
  const [testFirstName, setTestFirstName] = useState('João');
  const [testLastName, setTestLastName] = useState('Silva');

  const addResult = (message: string) => {
    setResults(prev => `${new Date().toLocaleTimeString()}: ${message}\n${prev}`);
  };

  const clearResults = () => {
    setResults('');
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      addResult('Testing connection to V1 API...');
      const isConnected = await apiV1.testConnection();
      if (isConnected) {
        addResult('✅ V1 API connection successful!');
      } else {
        addResult('❌ V1 API connection failed');
      }
    } catch (error: any) {
      addResult(`❌ Connection test error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testRegistration = async () => {
    setLoading(true);
    try {
      addResult('Testing user registration...');
      
      const onboardingData: V1OnboardingData = {
        goal: 'lose_weight',
        gender: 'male',
        birthDate: '1990-01-01',
        age: 33,
        height: 175,
        weight: 80.5,
        targetWeight: 70.0,
        activityLevel: 'moderate',
        emotionalGoal: 'Feel confident in my clothes',
        motivatingEvent: 'wedding',
        isEventDriven: true,
        eventDate: '2024-06-15',
        weeklyPacing: 0.5,
        notificationsEnabled: true
      };

      const response = await apiV1.register(
        testEmail,
        testPassword,
        testFirstName,
        testLastName,
        onboardingData
      );

      if (response.success) {
        addResult('✅ Registration successful!');
        addResult(`User ID: ${response.data.user.id}`);
        addResult(`Profile ID: ${response.data.profile.id}`);
        addResult(`BMR: ${response.data.profile.bmr} calories`);
        addResult(`TDEE: ${response.data.profile.tdee} calories`);
        addResult(`Daily Calories: ${response.data.profile.dailyCalories}`);
        addResult(`Protein: ${response.data.profile.dailyProtein}g`);
        addResult(`Carbs: ${response.data.profile.dailyCarbs}g`);
        addResult(`Fat: ${response.data.profile.dailyFat}g`);
        addResult(`Access Token: ${response.data.tokens.accessToken.substring(0, 20)}...`);
        addResult(`Refresh Token: ${response.data.tokens.refreshToken.substring(0, 20)}...`);
      } else {
        addResult('❌ Registration failed');
      }
    } catch (error: any) {
      addResult(`❌ Registration error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      addResult('Testing user login...');
      
      const response = await apiV1.login(testEmail, testPassword);

      if (response.success) {
        addResult('✅ Login successful!');
        addResult(`User: ${response.data.user.firstName} ${response.data.user.lastName}`);
        addResult(`Profile Complete: ${response.data.profile.profileComplete}`);
        addResult(`Current Weight: ${response.data.profile.weight}kg`);
        addResult(`Target Weight: ${response.data.profile.targetWeight}kg`);
        addResult(`Weekly Pacing: ${response.data.profile.weeklyPacing}kg/week`);
      } else {
        addResult('❌ Login failed');
      }
    } catch (error: any) {
      addResult(`❌ Login error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetProfile = async () => {
    setLoading(true);
    try {
      addResult('Testing get user profile...');
      
      const response = await apiV1.getUserProfile();

      if (response.success) {
        addResult('✅ Get profile successful!');
        addResult(`Goal: ${response.data.goal}`);
        addResult(`Gender: ${response.data.gender}`);
        addResult(`Age: ${response.data.age}`);
        addResult(`Height: ${response.data.height}cm`);
        addResult(`Weight: ${response.data.weight}kg`);
        addResult(`Target Weight: ${response.data.targetWeight}kg`);
        addResult(`Activity Level: ${response.data.activityLevel}`);
        addResult(`Emotional Goal: ${response.data.emotionalGoal || 'Not set'}`);
        addResult(`Motivating Event: ${response.data.motivatingEvent || 'None'}`);
        addResult(`Event Date: ${response.data.eventDate || 'Not set'}`);
        addResult(`Weekly Pacing: ${response.data.weeklyPacing}kg/week`);
        addResult(`BMR: ${response.data.bmr} calories`);
        addResult(`TDEE: ${response.data.tdee} calories`);
        addResult(`Daily Calories: ${response.data.dailyCalories}`);
        addResult(`Daily Protein: ${response.data.dailyProtein}g`);
        addResult(`Daily Carbs: ${response.data.dailyCarbs}g`);
        addResult(`Daily Fat: ${response.data.dailyFat}g`);
        addResult(`Onboarding Completed: ${response.data.onboardingCompleted}`);
      } else {
        addResult('❌ Get profile failed');
      }
    } catch (error: any) {
      addResult(`❌ Get profile error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testFitnessCalculation = async () => {
    setLoading(true);
    try {
      addResult('Testing fitness calculation...');
      
      const response = await apiV1.calculateFitnessMetrics(
        'male',
        33,
        175,
        80.5,
        'moderate',
        'lose_weight'
      );

      if (response.success) {
        addResult('✅ Fitness calculation successful!');
        addResult(`BMR: ${response.data.bmr} calories`);
        addResult(`TDEE: ${response.data.tdee} calories`);
        addResult(`Daily Calories: ${response.data.dailyCalories}`);
        addResult(`Daily Protein: ${response.data.dailyProtein}g`);
        addResult(`Daily Carbs: ${response.data.dailyCarbs}g`);
        addResult(`Daily Fat: ${response.data.dailyFat}g`);
        addResult(`Method: ${response.data.calculations.method}`);
        addResult(`Activity Multiplier: ${response.data.calculations.activityMultiplier}`);
        addResult(`Calorie Deficit: ${response.data.calculations.calorieDeficit}`);
        addResult(`Protein Ratio: ${response.data.calculations.proteinRatio}`);
        addResult(`Fat Ratio: ${response.data.calculations.fatRatio}`);
        addResult(`Carbs Ratio: ${response.data.calculations.carbsRatio}`);
      } else {
        addResult('❌ Fitness calculation failed');
      }
    } catch (error: any) {
      addResult(`❌ Fitness calculation error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    setLoading(true);
    try {
      addResult('Testing logout...');
      
      const response = await apiV1.logout();

      if (response.success) {
        addResult('✅ Logout successful!');
        addResult(`Message: ${response.message}`);
      } else {
        addResult('❌ Logout failed');
      }
    } catch (error: any) {
      addResult(`❌ Logout error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkTokenStatus = () => {
    const status = apiV1.getTokenStatus();
    addResult(`Token Status:`);
    addResult(`Access Token: ${status.hasAccessToken ? '✅ Present' : '❌ Missing'}`);
    addResult(`Refresh Token: ${status.hasRefreshToken ? '✅ Present' : '❌ Missing'}`);
  };

  const testOnboardingStep = async () => {
    setLoading(true);
    try {
      addResult('Testing onboarding step save...');
      
      const response = await apiV1.saveOnboardingStep(
        'target_weight',
        { targetWeight: 70.0 },
        5
      );

      if (response.success) {
        addResult('✅ Onboarding step save successful!');
        addResult(`Step ID: ${response.data.stepId}`);
        addResult(`Step: ${response.data.step}`);
        addResult(`Next Step: ${response.data.nextStep}`);
        addResult(`Message: ${response.message}`);
      } else {
        addResult('❌ Onboarding step save failed');
      }
    } catch (error: any) {
      addResult(`❌ Onboarding step save error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testOnboardingProgress = async () => {
    setLoading(true);
    try {
      addResult('Testing onboarding progress...');
      
      const response = await apiV1.getOnboardingProgress();

      if (response.success) {
        addResult('✅ Get onboarding progress successful!');
        addResult(`Current Step: ${response.data.currentStep}`);
        addResult(`Completed Steps: ${response.data.completedSteps.join(', ')}`);
        addResult(`Total Steps: ${response.data.totalSteps}`);
        addResult(`Progress: ${response.data.progressPercentage}%`);
        addResult(`Estimated Time: ${response.data.estimatedTimeRemaining}`);
        addResult(`Last Activity: ${response.data.lastActivity}`);
      } else {
        addResult('❌ Get onboarding progress failed');
      }
    } catch (error: any) {
      addResult(`❌ Get onboarding progress error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>V1 API Debug Panel</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Test Data Inputs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Data</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={testEmail}
            onChangeText={setTestEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={testPassword}
            onChangeText={setTestPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={testFirstName}
            onChangeText={setTestFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={testLastName}
            onChangeText={setTestLastName}
          />
        </View>

        {/* Connection Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection Tests</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={testConnection}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Test Connection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.button}
            onPress={checkTokenStatus}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Check Token Status</Text>
          </TouchableOpacity>
        </View>

        {/* Authentication Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authentication Tests</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={testRegistration}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Test Registration</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.button}
            onPress={testLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Test Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.button}
            onPress={testLogout}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Test Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Tests</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={testGetProfile}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Get User Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Fitness Engine Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitness Engine Tests</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={testFitnessCalculation}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Test Fitness Calculation</Text>
          </TouchableOpacity>
        </View>

        {/* Onboarding Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Onboarding Tests</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={testOnboardingStep}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Save Onboarding Step</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.button}
            onPress={testOnboardingProgress}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Get Onboarding Progress</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        <View style={styles.section}>
          <View style={styles.resultsHeader}>
            <Text style={styles.sectionTitle}>Test Results</Text>
            <TouchableOpacity onPress={clearResults} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
          
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingText}>Testing...</Text>
            </View>
          )}
          
          <ScrollView style={styles.resultsContainer}>
            <Text style={styles.resultsText}>{results || 'No test results yet. Run a test to see results here.'}</Text>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    padding: 6,
    borderRadius: 4,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
  },
  resultsContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    padding: 12,
    maxHeight: 200,
  },
  resultsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    lineHeight: 18,
  },
});
