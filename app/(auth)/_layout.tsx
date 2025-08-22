
import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="login" 
        options={{
          title: 'Sign In',
          headerStyle: { backgroundColor: '#FF725E' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold', color: '#FFFFFF' }
        }}
      />
      <Stack.Screen 
        name="register" 
        options={{
          title: 'Create Account',
          headerStyle: { backgroundColor: '#FF725E' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold', color: '#FFFFFF' }
        }}
      />
      <Stack.Screen 
        name="forgot-password" 
        options={{
          title: 'Reset Password',
          headerStyle: { backgroundColor: '#FF725E' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold', color: '#FFFFFF' }
        }}
      />
    </Stack>
  );
}
