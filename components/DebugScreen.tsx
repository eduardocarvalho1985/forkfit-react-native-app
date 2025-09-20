import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Constants from 'expo-constants';
import { getAuth } from '@react-native-firebase/auth';
import jwt_decode from 'jwt-decode';
import { useAuth } from '@/contexts/AuthContext';

interface DebugInfo {
  apiUrl: string | undefined;
  buildProfile: string | undefined;
  firebaseUser: any;
  tokenInfo: any;
  apiConnectivity: {
    status: string;
    response: string;
    error?: string;
  } | null;
  manualSyncTest: {
    status: string;
    response: string;
    error?: string;
  } | null;
}

export default function DebugScreen() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    apiUrl: undefined,
    buildProfile: undefined,
    firebaseUser: null,
    tokenInfo: null,
    apiConnectivity: null,
    manualSyncTest: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialDebugInfo();
  }, []);

  const loadInitialDebugInfo = () => {
    const firebaseUser = getAuth().currentUser;
    
    setDebugInfo(prev => ({
      ...prev,
      apiUrl: Constants.expoConfig?.extra?.API_URL,
      buildProfile: Constants.expoConfig?.extra?.BUILD_PROFILE || process.env.EAS_BUILD_PROFILE,
      firebaseUser: firebaseUser ? {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        emailVerified: firebaseUser.emailVerified,
      } : null,
    }));

    console.log('🌐 Current API URL from Constants:', Constants.expoConfig?.extra?.API_URL);
    console.log('🔧 Build Profile from Constants:', Constants.expoConfig?.extra?.BUILD_PROFILE);
    console.log('🔧 Build Profile from env:', process.env.EAS_BUILD_PROFILE);
    console.log('📱 All expo config extra:', Constants.expoConfig?.extra);
  };

  const testAPIConnectivity = async () => {
    setLoading(true);
    try {
      console.log('🏥 Testing API connectivity...');
      const apiUrl = Constants.expoConfig?.extra?.API_URL || 'https://api.forkfit.app/api';
      console.log('🔍 Raw API URL from Constants:', apiUrl);
      console.log('🔍 All Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
      
      // Ensure API URL has proper format
      let baseUrl = apiUrl;
      if (!baseUrl.startsWith('http')) {
        baseUrl = `https://${baseUrl}`;
      }
      if (!baseUrl.includes('/api')) {
        baseUrl = `${baseUrl}/api`;
      }
      
      // For health check, we need the base URL + /health
      const healthUrl = `${baseUrl.replace('/api', '')}/health`;
      
      console.log('🏥 Health check URL:', healthUrl);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      console.log('🏥 API Health Check Status:', response.status);
      const text = await response.text();
      console.log('🏥 API Health Check Response:', text);
      
      setDebugInfo(prev => ({
        ...prev,
        apiConnectivity: {
          status: `${response.status} ${response.statusText}`,
          response: text,
        }
      }));
      
    } catch (error: any) {
      console.error('❌ API Health Check Failed:', error);
      setDebugInfo(prev => ({
        ...prev,
        apiConnectivity: {
          status: 'ERROR',
          response: '',
          error: error.message,
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const debugToken = async () => {
    const firebaseUser = getAuth().currentUser;
    if (!firebaseUser) {
      Alert.alert('Error', 'No Firebase user found');
      return;
    }

    try {
      const token = await firebaseUser.getIdToken(false);
      console.log('🔍 Token Debug Info:');
      console.log('  - Length:', token?.length);
      console.log('  - First 50 chars:', token?.substring(0, 50));
      
      // Decode token to check claims
      try {
        const decoded = jwt_decode(token) as any;
        console.log('🔍 Token Claims:');
        console.log('  - aud (audience):', decoded.aud);
        console.log('  - iss (issuer):', decoded.iss);
        console.log('  - exp (expires):', new Date(decoded.exp * 1000));
        
        setDebugInfo(prev => ({
          ...prev,
          tokenInfo: {
            length: token?.length,
            preview: token?.substring(0, 50),
            audience: decoded.aud,
            issuer: decoded.iss,
            expires: new Date(decoded.exp * 1000).toISOString(),
            isExpired: decoded.exp * 1000 < Date.now(),
          }
        }));
        
      } catch (e) {
        console.error('❌ Token decode failed:', e);
        setDebugInfo(prev => ({
          ...prev,
          tokenInfo: {
            error: 'Failed to decode token',
            length: token?.length,
            preview: token?.substring(0, 50),
          }
        }));
      }
    } catch (error: any) {
      console.error('❌ Token generation failed:', error);
      Alert.alert('Token Error', error.message);
    }
  };

  const debugAPICall = async () => {
    setLoading(true);
    const firebaseUser = getAuth().currentUser;
    if (!firebaseUser) {
      Alert.alert('Error', 'No Firebase user found');
      setLoading(false);
      return;
    }
    
    try {
      const token = await firebaseUser.getIdToken();
      let apiUrl = Constants.expoConfig?.extra?.API_URL || 'https://api.forkfit.app/api';
      
      // Ensure API URL has proper format
      if (!apiUrl.startsWith('http')) {
        apiUrl = `https://${apiUrl}`;
      }
      if (!apiUrl.includes('/api')) {
        apiUrl = `${apiUrl}/api`;
      }
      
      console.log('🧪 Testing API call manually:');
      console.log('  - URL:', `${apiUrl}/users/sync`);
      console.log('  - Token exists:', !!token);
      
      const requestBody = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.email?.split('@')[0] || 'User',
        displayName: firebaseUser.email?.split('@')[0] || 'User',
        photoURL: firebaseUser.photoURL
      };
      
      console.log('📤 Request body:', requestBody);
      
      const response = await fetch(`${apiUrl}/users/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📡 Manual API Response Status:', response.status);
      console.log('📡 Manual API Response Headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('📡 Manual API Response Body:', responseText);
      
      setDebugInfo(prev => ({
        ...prev,
        manualSyncTest: {
          status: `${response.status} ${response.statusText}`,
          response: responseText,
        }
      }));
      
    } catch (error: any) {
      console.error('❌ Manual API call failed:', error);
      setDebugInfo(prev => ({
        ...prev,
        manualSyncTest: {
          status: 'ERROR',
          response: '',
          error: error.message,
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    // For debugging purposes, just log to console
    console.log('📋 Debug info copied to console:', text);
    Alert.alert('Copied', 'Debug info logged to console');
  };

  const formatDebugInfo = () => {
    return JSON.stringify(debugInfo, null, 2);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 Backend Sync Debug</Text>
      
      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Build Configuration</Text>
        <Text style={styles.infoText}>API URL: {debugInfo.apiUrl || 'Not set'}</Text>
        <Text style={styles.infoText}>Build Profile: {debugInfo.buildProfile || 'Not set'}</Text>
        <Text style={styles.infoText}>App User: {user ? `${user.email} (${user.uid?.substring(0, 8)}...)` : 'None'}</Text>
      </View>

      {/* Firebase User */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Firebase User</Text>
        {debugInfo.firebaseUser ? (
          <>
            <Text style={styles.infoText}>UID: {debugInfo.firebaseUser.uid?.substring(0, 20)}...</Text>
            <Text style={styles.infoText}>Email: {debugInfo.firebaseUser.email}</Text>
            <Text style={styles.infoText}>Verified: {debugInfo.firebaseUser.emailVerified ? 'Yes' : 'No'}</Text>
          </>
        ) : (
          <Text style={styles.infoText}>No Firebase user</Text>
        )}
      </View>

      {/* Token Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔑 Token Information</Text>
        {debugInfo.tokenInfo ? (
          <>
            <Text style={styles.infoText}>Length: {debugInfo.tokenInfo.length}</Text>
            <Text style={styles.infoText}>Preview: {debugInfo.tokenInfo.preview}...</Text>
            {debugInfo.tokenInfo.audience && (
              <>
                <Text style={styles.infoText}>Audience: {debugInfo.tokenInfo.audience}</Text>
                <Text style={styles.infoText}>Issuer: {debugInfo.tokenInfo.issuer}</Text>
                <Text style={styles.infoText}>Expires: {debugInfo.tokenInfo.expires}</Text>
                <Text style={[styles.infoText, debugInfo.tokenInfo.isExpired && styles.errorText]}>
                  Status: {debugInfo.tokenInfo.isExpired ? 'EXPIRED' : 'Valid'}
                </Text>
              </>
            )}
            {debugInfo.tokenInfo.error && (
              <Text style={styles.errorText}>Error: {debugInfo.tokenInfo.error}</Text>
            )}
          </>
        ) : (
          <Text style={styles.infoText}>No token info - tap "Debug Token" to load</Text>
        )}
        <TouchableOpacity style={styles.button} onPress={debugToken}>
          <Text style={styles.buttonText}>Debug Token</Text>
        </TouchableOpacity>
      </View>

      {/* API Connectivity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌐 API Connectivity</Text>
        {debugInfo.apiConnectivity ? (
          <>
            <Text style={styles.infoText}>Status: {debugInfo.apiConnectivity.status}</Text>
            <Text style={styles.infoText}>Response: {debugInfo.apiConnectivity.response}</Text>
            {debugInfo.apiConnectivity.error && (
              <Text style={styles.errorText}>Error: {debugInfo.apiConnectivity.error}</Text>
            )}
          </>
        ) : (
          <Text style={styles.infoText}>No connectivity test - tap "Test API" to check</Text>
        )}
        <TouchableOpacity style={styles.button} onPress={testAPIConnectivity} disabled={loading}>
          <Text style={styles.buttonText}>Test API Connectivity</Text>
        </TouchableOpacity>
      </View>

      {/* Manual Sync Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 Manual Sync Test</Text>
        {debugInfo.manualSyncTest ? (
          <>
            <Text style={styles.infoText}>Status: {debugInfo.manualSyncTest.status}</Text>
            <Text style={styles.infoText}>Response: {debugInfo.manualSyncTest.response}</Text>
            {debugInfo.manualSyncTest.error && (
              <Text style={styles.errorText}>Error: {debugInfo.manualSyncTest.error}</Text>
            )}
          </>
        ) : (
          <Text style={styles.infoText}>No manual sync test - tap "Test Sync" to run</Text>
        )}
        <TouchableOpacity style={styles.button} onPress={debugAPICall} disabled={loading}>
          <Text style={styles.buttonText}>Test Manual Sync</Text>
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.button} onPress={() => copyToClipboard(formatDebugInfo())}>
          <Text style={styles.buttonText}>Copy All Debug Info</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={loadInitialDebugInfo}>
          <Text style={styles.buttonText}>Refresh Info</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF725E" />
          <Text style={styles.loadingText}>Testing...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
    fontFamily: 'monospace',
  },
  errorText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#ff0000',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#FF725E',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
